/**
 * The newsroom store: a folder that the workflow commits to the `newsroom`
 * branch, and the site reads through raw.githubusercontent.com.
 *
 *   index.json            summaries, newest first (what lists and the homepage read)
 *   articles/<id>.json    the full article, EN + FR, sources, every desk's notes
 *   images/<id>.png       optional AI illustration (labelled on the page)
 *   killed.json           the owner's kill list: ids (or slugs) the site hides and answers 410 for
 *   log/rejected.json     events the desks turned down, and why (newest first)
 *   README.md             how to use the branch
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { killedIds, summarizeArticle, type NewsroomArticle, type NewsroomIndex } from "../../src/lib/newsroom-types";

export type Rejection = { id: string; at: string; stage: string; headline: string; reasons: string[] };

const README = `# AI Broadsheet Newsroom store

Written by \`.github/workflows/newsroom.yml\` (scripts/newsroom). The site reads this branch.

- \`index.json\` lists every article, newest first.
- \`articles/<id>.json\` is the full article, with its sources and each desk's notes.
- \`log/rejected.json\` lists events the desks turned down, and why.

## Unpublish an article

Edit \`killed.json\` here in GitHub's web editor and add the article's id (or its slug):

\`\`\`json
{ "killed": ["<id>", { "id": "<id>", "reason": "why, for the record" }] }
\`\`\`

Commit. Within about five minutes the site hides it everywhere and its page answers 410 Gone.
Remove the line to bring it back. Never delete files by hand: the workflow keeps the index in step.

## Approve a held article

Articles that touch people's reputations, health, money, elections, children or safety are not
published automatically. They wait in \`drafts/\` and are listed in \`drafts.json\` with the reasons.
Read the draft; to publish it, add its id to \`approved.json\`:

\`\`\`json
{ "approved": ["<id>"] }
\`\`\`

Commit. The next newsroom run (within 30 minutes) publishes it under your approval.
`;

async function readJson<T>(file: string, fallback: T): Promise<T> {
  if (!existsSync(file)) return fallback;
  try { return JSON.parse(await readFile(file, "utf8")) as T; } catch { return fallback; }
}

export async function openStore(dir: string) {
  await mkdir(join(dir, "articles"), { recursive: true });
  await mkdir(join(dir, "log"), { recursive: true });
  if (!existsSync(join(dir, "killed.json"))) await writeFile(join(dir, "killed.json"), JSON.stringify({ killed: [] }, null, 2) + "\n");
  if (!existsSync(join(dir, "README.md"))) await writeFile(join(dir, "README.md"), README);

  const index = await readJson<NewsroomIndex>(join(dir, "index.json"), { updatedAt: new Date(0).toISOString(), items: [] });
  const rejected = await readJson<Rejection[]>(join(dir, "log", "rejected.json"), []);
  const killed = killedIds(await readJson<unknown>(join(dir, "killed.json"), {}));
  await mkdir(join(dir, "drafts"), { recursive: true });
  if (!existsSync(join(dir, "approved.json"))) await writeFile(join(dir, "approved.json"), JSON.stringify({ approved: [] }, null, 2) + "\n");
  const drafts = await readJson<{ items: { id: string; headline: string; reasons: string[]; createdAt: string }[] }>(join(dir, "drafts.json"), { items: [] });
  const approvedIds = new Set(((await readJson<{ approved?: unknown[] }>(join(dir, "approved.json"), {})).approved ?? []).filter((x): x is string => typeof x === "string"));

  return {
    dir,
    index,
    rejected,
    killed,
    slugsTaken: () => new Set(index.items.flatMap(i => [i.slug.en, i.slug.fr])),
    has: (id: string) => index.items.some(i => i.id === id) || existsSync(join(dir, "articles", `${id}.json`)) || existsSync(join(dir, "drafts", `${id}.json`)),
    drafts,
    /** Keep an article back for a human editor: it is published only once its id is in approved.json. */
    async hold(a: NewsroomArticle, reasons: string[]) {
      await writeFile(join(dir, "drafts", `${a.id}.json`), JSON.stringify(a, null, 2) + "\n");
      drafts.items = [{ id: a.id, headline: a.en.headline, reasons, createdAt: a.createdAt }, ...drafts.items.filter(d => d.id !== a.id)].slice(0, 500);
      await writeFile(join(dir, "drafts.json"), JSON.stringify(drafts, null, 2) + "\n");
    },
    /** Publish every held article the editor has approved. Returns the ids published. */
    async releaseApproved(): Promise<string[]> {
      const out: string[] = [];
      for (const d of [...drafts.items]) {
        if (!approvedIds.has(d.id) || killed.has(d.id)) continue;
        const a = await readJson<NewsroomArticle | null>(join(dir, "drafts", `${d.id}.json`), null);
        if (!a) continue;
        await this.publish({ ...a, roles: [...a.roles, { role: "editor", note: "Approved by the editor (approved.json)." } as never] });
        drafts.items = drafts.items.filter(x => x.id !== d.id);
        out.push(d.id);
      }
      if (out.length) await writeFile(join(dir, "drafts.json"), JSON.stringify(drafts, null, 2) + "\n");
      return out;
    },
    imagePath: (id: string) => join(dir, "images", `${id}.png`),
    async ensureImages() { await mkdir(join(dir, "images"), { recursive: true }); },
    async publish(a: NewsroomArticle) {
      await writeFile(join(dir, "articles", `${a.id}.json`), JSON.stringify(a, null, 2) + "\n");
      index.items = [summarizeArticle(a), ...index.items.filter(i => i.id !== a.id)]
        .sort((x, y) => y.createdAt.localeCompare(x.createdAt))
        .slice(0, 2000);
      index.updatedAt = new Date().toISOString();
      await writeFile(join(dir, "index.json"), JSON.stringify(index, null, 2) + "\n");
    },
    async reject(r: Rejection) {
      rejected.unshift(r);
      rejected.splice(500);
      await writeFile(join(dir, "log", "rejected.json"), JSON.stringify(rejected, null, 2) + "\n");
    },
  };
}

export type Store = Awaited<ReturnType<typeof openStore>>;
