/**
 * "Listen" for a Dispatch: ElevenLabs reads the dispatch aloud (a stock
 * voice, never a clone of a real person). Server only.
 *
 * - Only the text of a published dispatch can be spoken: the route takes an
 *   id, never text, so it can't be used to voice anything else.
 * - Each file is made once per language and kept in the Workers cache; the
 *   response is public with a one-year max-age so the CDN and browsers keep it.
 * - A hard daily cap on new files (ELEVENLABS_DAILY_CAP, default 40), counted
 *   in memory and in the shared cache. Over the cap, or without
 *   ELEVENLABS_API_KEY, the route answers 503 and the page uses the
 *   browser's own voice instead.
 */
import { hashKey } from "./claude.server";
import { getDispatchById } from "./dispatch.server";
import { spokenText } from "./dispatch-types";
import { keepAlive, sharedRead, sharedWrite } from "./shared-cache";

// "George", an ElevenLabs stock (premade) voice that reads English and French.
const DEFAULT_VOICE = "JBFqnCBsd6RMkjVDRZzb";
const YEAR = 31536000;

type CfCache = { match(req: string): Promise<Response | undefined>; put(req: string, res: Response): Promise<void> };
const g = globalThis as unknown as { caches?: { default?: CfCache }; __ttsDay?: { day: string; count: number } };

export const ttsAvailable = () => !!process.env["ELEVENLABS_API_KEY"];

const unavailable = (why: string) =>
  new Response(JSON.stringify({ fallback: true, why }), { status: 503, headers: { "content-type": "application/json", "cache-control": "no-store", "x-robots-tag": "noindex" } });

async function takeBudget(): Promise<boolean> {
  const cap = Number(process.env["ELEVENLABS_DAILY_CAP"]) || 40;
  const day = new Date().toISOString().slice(0, 10);
  const mem = (g.__ttsDay = g.__ttsDay?.day === day ? g.__ttsDay : { day, count: 0 });
  const shared = await sharedRead<{ count: number }>(`tts-day:${day}`, 800);
  const count = Math.max(mem.count, shared?.count ?? 0);
  if (count >= cap) return false;
  mem.count = count + 1;
  sharedWrite(`tts-day:${day}`, { count: mem.count }, 2 * 86400);
  return true;
}

function audioHeaders(extra: Record<string, string> = {}) {
  return {
    "content-type": "audio/mpeg",
    "cache-control": `public, max-age=${YEAR}, immutable`,
    "accept-ranges": "bytes",
    "x-robots-tag": "noindex",
    ...extra,
  };
}

/** Serve bytes, honouring a Range header (Safari asks for "bytes=0-1" first). */
function serveBytes(bytes: ArrayBuffer, range: string | null): Response {
  const total = bytes.byteLength;
  const m = range?.match(/^bytes=(\d*)-(\d*)$/);
  if (!m || (m[1] === "" && m[2] === "")) return new Response(bytes, { headers: audioHeaders({ "content-length": String(total) }) });
  let start = m[1] === "" ? Math.max(0, total - Number(m[2])) : Number(m[1]);
  let end = m[1] === "" || m[2] === "" ? total - 1 : Math.min(Number(m[2]), total - 1);
  if (start >= total || start > end) return new Response(null, { status: 416, headers: { "content-range": `bytes */${total}` } });
  start = Math.max(0, start); end = Math.max(start, end);
  return new Response(bytes.slice(start, end + 1), {
    status: 206,
    headers: audioHeaders({ "content-range": `bytes ${start}-${end}/${total}`, "content-length": String(end - start + 1) }),
  });
}

export async function dispatchAudio(request: Request, id: string): Promise<Response> {
  const url = new URL(request.url);
  const lang = url.searchParams.get("lang") === "fr" ? "fr" : "en";
  const key = process.env["ELEVENLABS_API_KEY"];
  if (!key) return unavailable("off");
  if (!/^[\w-]{1,80}$/.test(id)) return unavailable("id");
  const d = await getDispatchById(id);
  if (!d) return new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });

  const text = spokenText(d, lang);
  const voice = process.env["ELEVENLABS_VOICE_ID"] || DEFAULT_VOICE;
  const cacheKey = `https://${url.host}/__dispatch-audio/${encodeURIComponent(id)}-${lang}-${hashKey(voice + text)}.mp3`;
  const cache = g.caches?.default;
  const range = request.headers.get("range");

  const hit = await cache?.match(cacheKey).catch(() => undefined);
  if (hit) return serveBytes(await hit.arrayBuffer(), range);

  if (!(await takeBudget())) return unavailable("cap");
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}/stream?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": key, "content-type": "application/json", accept: "audio/mpeg" },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      language_code: lang,
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.1, use_speaker_boost: true },
    }),
    signal: AbortSignal.timeout(60_000),
  }).catch(() => null);
  if (!res?.ok || !res.body) {
    console.warn("[dispatch-audio] ElevenLabs", res?.status ?? "failed");
    return unavailable("tts");
  }

  const store = (body: BodyInit) => {
    if (cache) keepAlive(cache.put(cacheKey, new Response(body, { headers: audioHeaders() })));
  };
  // Chrome and Firefox ask for "bytes=0-" (or nothing) and accept a stream; start playing at once.
  if (!range || /^bytes=0-$/.test(range)) {
    const [toReader, toCache] = res.body.tee();
    store(toCache);
    return new Response(toReader, { headers: audioHeaders() });
  }
  // Safari wants exact byte ranges: make the whole file first.
  const bytes = await res.arrayBuffer();
  store(bytes.slice(0));
  return serveBytes(bytes, range);
}
