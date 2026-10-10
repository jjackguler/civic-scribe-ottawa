/**
 * Builds the collage kit the renderer reads (COLLAGE_ASSETS) from a checkout of
 * the `assets` branch, with FFmpeg only (no Python needed in CI):
 *
 *   figs/<name>.png         scissor-cut figures (built by prepare_figures.py; see figures.json)
 *   newsprint/page-a|b.jpg  two public-domain newspaper pages
 *   sfx/<cue>-<k>.wav       CC0 recordings trimmed per sound cue + sfx-map.json (as prepare_sfx.py)
 *   kit.json                what is in the kit and where every file came from (for the credits)
 *
 * Music: the owner's own tracks first (music/owner/*.mp3 in the assets branch, or
 * collage/music/owner/*.mp3), else one CC0 bed, rotated per run.
 *
 *   npx tsx collage/kit.ts <assets branch root> <kit dir> [--figs DIR] [--github-env FILE]
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { copyFile, mkdir, readFile, readdir, writeFile, appendFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const run = promisify(execFile);
const HERE = import.meta.dirname;

export type Credit = { file: string; title?: string; source?: string; author?: string; license?: string; date?: string; credit?: string; label?: string };
export type KitFigure = { name: string; about: string; credit?: Credit };
export type Kit = {
  dir: string;
  sfxMap: string | null;
  music: string | null;
  musicCredit: { text: string; credit?: Credit } | null;
  figures: KitFigure[];
  newsprint: Credit[];
  /** Prepared sound file (absolute path) → the recording it was cut from. */
  sfxSources: Record<string, Credit>;
  backgrounds: string[];
};

/** Same cue plan as prepare_sfx.py: cue → (file patterns, max seconds, skip into file, takes). */
const PLAN: Record<string, [string[], number, number, number]> = {
  snip: [["fs-scissors-cutting-paper--", "fs-scissors-snip--"], 0.32, 0, 6],
  slap: [["fs-paper-slide--", "fs-paper-slide-table--", "fs-paper-rustle--", "kenney-rpg-audio--cloth"], 0.42, 0, 6],
  slide: [["fs-paper-slide-table--", "fs-paper-slide--"], 0.6, 0, 4],
  thump: [["kenney-impact-sounds--impactplank-medium", "kenney-impact-sounds--impactsoft-heavy", "kenney-impact-sounds--impactwood-heavy", "fs-rubber-stamp--"], 0.5, 0, 5],
  stamp: [["fs-rubber-stamp--"], 0.55, 0, 4],
  pencil: [["fs-pencil-scribble--", "fs-marker-pen-writing--"], 0.9, 0.05, 5],
  scribble: [["fs-pencil-scribble--"], 0.8, 0.05, 4],
  marker: [["fs-marker-pen-writing--"], 0.6, 0.05, 4],
  paper: [["fs-paper-crumple--", "fs-page-turn--", "fs-newspaper--", "fs-paper-rustle--"], 0.75, 0, 8],
  tear: [["fs-paper-tear--", "fs-tape-rip--", "fs-tape--"], 0.8, 0, 4],
  type: [["fs-typewriter-key--", "fs-typewriter--"], 0.14, 0, 6],
  click: [["kenney-interface-sounds--click", "kenney-ui-audio--click", "fs-typewriter-key--"], 0.12, 0, 5],
  shutter: [["fs-camera-shutter--"], 0.45, 0, 4],
  whoosh: [["fs-whoosh-paper--", "fs-whoosh--"], 0.75, 0, 5],
  sweep: [["fs-whoosh-paper--", "fs-whoosh--"], 0.9, 0, 3],
  tick: [["kenney-interface-sounds--tick"], 0.12, 0, 3],
};

/**
 * CC0 beds (Freesound ids) checked by ear for a calm explainer: the lofi loop and the
 * cinematic underscore used by the hand-made explainers, plus three quiet loops. The
 * fetch queries also returned drones, horror and sound effects, so this is an allow-list.
 * Override with COLLAGE_MUSIC_IDS="id,id".
 */
const MUSIC_OK = (process.env.COLLAGE_MUSIC_IDS || "629155,868507,384202,265075,489374").split(",").map(s => s.trim()).filter(Boolean);
/** Newspaper pages used as backgrounds: 1920 and 1910 front pages (public domain). */
const NEWSPRINT = (process.env.COLLAGE_NEWSPRINT || "enniscorthy-echo,record-and-chronicle-denton").split(",").map(s => s.trim()).filter(Boolean);
/** Short credit labels for the default newspaper pages (their Commons titles are very long). */
const PAGE_LABELS: Record<string, string> = {
  "enniscorthy-echo": "The Echo, Enniscorthy, 14 August 1920",
  "record-and-chronicle-denton": "Record and Chronicle, Denton, Texas, 4 August 1910",
};
export const BACKGROUNDS = ["newsprint", "split", "kraft", "cream", "slate", "yellow", "board"];

async function duration(f: string): Promise<number> {
  try {
    const { stdout } = await run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", f]);
    return Number(stdout.trim()) || 0;
  } catch { return 0; }
}

async function list(dir: string, re: RegExp): Promise<string[]> {
  return existsSync(dir) ? (await readdir(dir)).filter(f => re.test(f)).sort() : [];
}

/** Runs async jobs a few at a time. */
async function pool<T>(items: T[], n: number, fn: (x: T) => Promise<void>) {
  const q = [...items];
  await Promise.all(Array.from({ length: n }, async () => { for (let x = q.shift(); x !== undefined; x = q.shift()) await fn(x); }));
}

/** Small stable hash for rotating the music bed. */
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

export async function buildKit(assetsRoot: string, kitDir: string, opts: { figsDir?: string; seed?: string } = {}): Promise<Kit> {
  const root = resolve(assetsRoot);
  const col = existsSync(join(root, "collage")) ? join(root, "collage") : root;
  const dir = resolve(kitDir);
  for (const d of ["figs", "newsprint", "sfx"]) await mkdir(join(dir, d), { recursive: true });

  // Every credits*.json in the branch, by file path (relative to collage/).
  const credits = new Map<string, Credit>();
  const wild: Credit[] = [];
  for (const f of await list(col, /^credits.*\.json$/)) {
    try {
      for (const c of JSON.parse(await readFile(join(col, f), "utf8")) as Credit[]) (c.file?.endsWith("*") ? wild.push(c) : credits.set(c.file, c));
    } catch { /* a broken credits file only costs us its credits */ }
  }
  const creditOf = (rel: string): Credit | undefined => credits.get(rel) ?? wild.find(w => rel.startsWith(w.file.slice(0, -1)));

  // Newsprint pages.
  const pages = await list(join(col, "newsprint"), /\.(jpe?g|png)$/i);
  const chosen = [...NEWSPRINT.map(k => pages.find(p => p.includes(k))).filter((x): x is string => !!x), ...pages].filter((x, i, a) => a.indexOf(x) === i).slice(0, 2);
  const newsprint: Credit[] = [];
  for (const [k, f] of chosen.entries()) {
    await run("ffmpeg", ["-y", "-loglevel", "error", "-i", join(col, "newsprint", f), "-vf", "scale='min(1400,iw)':-2", "-q:v", "3", join(dir, "newsprint", `page-${"ab"[k]}.jpg`)]);
    const label = Object.entries(PAGE_LABELS).find(([k]) => f.includes(k))?.[1];
    newsprint.push({ ...(creditOf(`newsprint/${f}`) ?? { file: `newsprint/${f}` }), ...(label ? { label } : {}) });
  }
  if (chosen.length === 1) await copyFile(join(dir, "newsprint", "page-a.jpg"), join(dir, "newsprint", "page-b.jpg"));

  // Sound cues.
  const sfxFiles = await list(join(col, "sfx"), /\.(mp3|ogg|wav)$/i);
  const sfxMap: Record<string, string[]> = {};
  const sfxSources: Record<string, Credit> = {};
  const jobs: { cue: string; k: number; src: string; max: number; skip: number }[] = [];
  for (const [cue, [pats, max, skip, takes]] of Object.entries(PLAN)) {
    const files = pats.flatMap(p => sfxFiles.filter(f => f.startsWith(p))).filter((x, i, a) => a.indexOf(x) === i).slice(0, takes);
    files.forEach((src, k) => jobs.push({ cue, k, src, max, skip }));
  }
  await pool(jobs, 4, async ({ cue, k, src, max, skip }) => {
    const out = join(dir, "sfx", `${cue}-${k}.wav`);
    const fade = Math.min(0.12, max * 0.4);
    const af = `atrim=start=${skip},silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.01,atrim=0:${max},afade=t=out:st=${Math.max(0, max - fade).toFixed(3)}:d=${fade.toFixed(3)},highpass=f=60,dynaudnorm=f=150:g=5:p=0.9,alimiter=limit=0.89`;
    try {
      await run("ffmpeg", ["-y", "-loglevel", "error", "-i", join(col, "sfx", src), "-af", af, "-ar", "48000", "-ac", "2", out]);
      if ((await duration(out)) > 0.03) {
        (sfxMap[cue] ??= []).push(out);
        sfxSources[out] = creditOf(`sfx/${src}`) ?? { file: `sfx/${src}` };
      }
    } catch { /* skip a recording FFmpeg can't read */ }
  });
  for (const c of Object.keys(sfxMap)) sfxMap[c].sort();
  const sfxMapPath = Object.keys(sfxMap).length ? join(dir, "sfx-map.json") : null;
  if (sfxMapPath) await writeFile(sfxMapPath, JSON.stringify(sfxMap, null, 1));

  // Figures: prepared cut-outs (prepare_figures.py output, cached in CI), described by figures.json.
  const spec: Record<string, { file?: string; about?: string; label?: string }> = JSON.parse(await readFile(join(HERE, "figures.json"), "utf8"));
  const figSrc = [opts.figsDir, join(col, "figs")].find(d => d && existsSync(d));
  const figures: KitFigure[] = [];
  if (figSrc) {
    for (const f of await list(figSrc, /\.png$/i)) {
      const name = f.slice(0, -4);
      if (!/^[a-z0-9-]+$/.test(name)) continue;
      await copyFile(join(figSrc, f), join(dir, "figs", f));
      const s = spec[name];
      const c = s?.file ? creditOf(s.file) : undefined;
      const credit = c || s?.label ? { ...(c ?? { file: s?.file ?? name }), ...(s?.label ? { label: s.label } : {}) } : undefined;
      figures.push({ name, about: s?.about ?? name, credit });
    }
  }

  // Music: the owner's own tracks first, then a CC0 bed; rotate per run so videos don't all sound the same.
  const seed = opts.seed ?? new Date().toISOString().slice(0, 13);
  let music: string | null = null;
  let musicCredit: Kit["musicCredit"] = null;
  const ownerDirs = [join(root, "music", "owner"), join(col, "music", "owner")].filter(d => existsSync(d));
  const owner = (await Promise.all(ownerDirs.map(async d => (await list(d, /\.(mp3|m4a|wav)$/i)).map(f => join(d, f))))).flat();
  if (owner.length) {
    music = owner[hash(seed) % owner.length];
    let text = `Music: “${basename(music).replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").trim()}”, made by AI Broadsheet with Suno`;
    for (const d of ownerDirs) {
      const f = join(d, "credits.json");
      if (!existsSync(f)) continue;
      try { const c = JSON.parse(await readFile(f, "utf8")) as Record<string, string>; if (c[basename(music)]) text = c[basename(music)]; } catch { /* keep the default credit */ }
    }
    musicCredit = { text };
  } else {
    const beds = (await list(join(col, "music"), /\.mp3$/i)).filter(f => MUSIC_OK.some(id => f.endsWith(`--${id}.mp3`)));
    const long: string[] = [];
    for (const f of beds) if ((await duration(join(col, "music", f))) >= 20) long.push(f);
    if (long.length) {
      const f = long[hash(seed) % long.length];
      music = join(col, "music", f);
      const c = creditOf(`music/${f}`);
      const title = (c?.title || f).replace(/\.(wav|mp3|aiff?|flac)$/i, "").slice(0, 70);
      musicCredit = { text: `Music: “${title}”${c?.author ? ` by ${c.author}` : ""} (CC0, Freesound)`, credit: c };
    }
  }

  const kit: Kit = { dir, sfxMap: sfxMapPath, music, musicCredit, figures, newsprint, sfxSources, backgrounds: BACKGROUNDS };
  await writeFile(join(dir, "kit.json"), JSON.stringify(kit, null, 1));
  return kit;
}

export async function loadKit(dir: string): Promise<Kit | null> {
  const f = join(resolve(dir), "kit.json");
  return existsSync(f) ? JSON.parse(await readFile(f, "utf8")) as Kit : null;
}

/** Credits line for the manifest: the archive photos, pages, music and sounds this video used. */
export function creditsLine(kit: Kit, used: { figures: string[]; newsprint: boolean; sfxFiles: string[] }, voice: string): string {
  const parts: string[] = [];
  const photo = (c?: Credit) => {
    if (!c) return "";
    if (c.label) return c.label;
    let t = (c.title || c.file).replace(/^File:/, "").replace(/\.(jpe?g|png|tiff?)$/i, "").trim();
    if (t === t.toUpperCase()) t = t.charAt(0) + t.slice(1).toLowerCase();
    if (t.length > 70) t = t.slice(0, 70).replace(/\s+\S*$/, "") + "…";
    const by = (c.author || "").replace(/Unknown author/gi, "").trim().slice(0, 60);
    return by ? `${t} (${by})` : t;
  };
  const figs = used.figures.map(n => kit.figures.find(f => f.name === n)).filter(Boolean).map(f => photo(f!.credit) || f!.name);
  if (figs.length) parts.push(`Archive photos (public domain, via Wikimedia Commons): ${[...new Set(figs)].join("; ")}`);
  if (used.newsprint && kit.newsprint.length) parts.push(`Newspaper pages (public domain, via Wikimedia Commons): ${kit.newsprint.map(c => photo(c)).join("; ")}`);
  if (kit.musicCredit) parts.push(kit.musicCredit.text);
  const authors = [...new Set(used.sfxFiles.map(f => kit.sfxSources[f]?.author).filter((a): a is string => !!a))];
  if (used.sfxFiles.length) parts.push(`Sound effects (CC0, Freesound${authors.some(a => /kenney/i.test(a)) ? " and Kenney" : ""})${authors.length ? `: ${authors.slice(0, 12).join(", ")}` : ""}`);
  parts.push(`Narration: ${voice}`);
  return parts.join(". ") + ".";
}

// CLI: build the kit and (in Actions) export COLLAGE_ASSETS / COLLAGE_SFX_MAP / COLLAGE_MUSIC.
if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const [src, out] = process.argv.slice(2);
  const flag = (n: string) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
  if (!src || !out) { console.error("usage: kit.ts <assets root> <kit dir> [--figs DIR] [--github-env FILE]"); process.exit(2); }
  buildKit(src, out, { figsDir: flag("--figs") || process.env.COLLAGE_FIGS_DIR || undefined }).then(async kit => {
    console.log(`kit: ${kit.figures.length} figures (${kit.figures.map(f => f.name).join(", ") || "none"}), ${kit.newsprint.length} newspaper pages, ${Object.keys(kit.sfxSources).length} sound takes, music ${kit.music ? basename(kit.music) : "none"}`);
    const envFile = flag("--github-env");
    if (envFile) await appendFile(envFile, `COLLAGE_ASSETS=${kit.dir}\n${kit.sfxMap ? `COLLAGE_SFX_MAP=${kit.sfxMap}\n` : ""}${kit.music ? `COLLAGE_MUSIC=${kit.music}\n` : ""}`);
  }).catch(e => { console.error(e); process.exit(1); });
}
