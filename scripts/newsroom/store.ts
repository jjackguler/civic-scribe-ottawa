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

  return {
    dir,
    index,
    rejected,
    killed,
    slugsTaken: () => new Set(index.items.flatMap(i => [i.slug.en, i.slug.fr])),
    has: (id: string) => index.items.some(i => i.id === id) || existsSync(join(dir, "articles", `${id}.json`)),
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
