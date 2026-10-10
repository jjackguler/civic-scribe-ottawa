/**
 * Unit tests for the newsroom's mechanical desks: the fact guard, the
 * wording-overlap check, the slugger, the kill list and "confirmed" counting.
 *
 *   npx tsx scripts/newsroom/test.ts
 */
import assert from "node:assert/strict";
import { killedIds, slugify, uniqueSlug, isKilled } from "../../src/lib/newsroom-types";
import { factGuard, overlapProblems } from "./guard";
import { shapeDraft, type Draft } from "./shape";
import { clip } from "./roles";
import type { DispatchSource } from "../../src/lib/dispatch-types";

let passed = 0;
const failures: string[] = [];
function test(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ✓ ${name}`); } catch (e) { failures.push(name); console.log(`  ✗ ${name}\n    ${(e as Error).message.split("\n").join("\n    ")}`); }
}

const SRC = [
  "Northwind Labs: Northwind Labs introduces Aurora-2, an open-weight model for English and French. The model has 7 billion parameters and runs on a single laptop GPU with 16 GB of memory; companies with more than 50 employees need a commercial licence.",
  "Maple Tech Review: In our tests, Aurora-2 scored 71 percent on a French reading-comprehension benchmark.",
  "Coastline Daily: KestrelStudy helps Grade 9 to 12 students with math. The app costs $8 a month.",
  // our own background passage
  "Most assistants have a setting to stop your chats being used for training. Look under Settings → Data controls or Privacy.",
].join("\n");

console.log("fact guard");
test("names and numbers from the sources pass", () => {
  assert.deepEqual(factGuard(["Northwind Labs released Aurora-2, a model with 7 billion parameters [s1]."], SRC), []);
});
test("an invented number is caught", () => {
  assert.deepEqual(factGuard(["Aurora-2 has 8 billion parameters [s1]."], SRC), ["8 billion"]);
});
test("a number with the wrong scale is caught (7 million ≠ 7 billion)", () => {
  assert.deepEqual(factGuard(["Aurora-2 has 7 million parameters."], SRC), ["7 million"]);
});
test("percent matches across languages (71 percent = 71 %)", () => {
  assert.deepEqual(factGuard(["Aurora-2 a obtenu 71 % au test."], SRC), []);
});
test("an invented name is caught", () => {
  assert.deepEqual(factGuard(["Northwind Labs, based in Ottawa, released Aurora-2."], SRC), ["Ottawa"]);
});
test("plain sentence starters pass; invented authorities do not", () => {
  assert.deepEqual(factGuard(["However, the model is open. Whether it is free is unclear."], SRC), []);
  assert.deepEqual(factGuard(["Experts say Aurora-2 is open."], SRC), ["Experts"]);
});
test("a French elision does not hide a name (l'Ontario)", () => {
  assert.deepEqual(factGuard(["Le modèle vient de l'Ontario."], SRC), ["Ontario"]);
});
test("French ordinals are checked as numbers (9e passes, 10e does not)", () => {
  assert.deepEqual(factGuard(["Pour les élèves de la 9e à la 12e année."], SRC), []);
  assert.deepEqual(factGuard(["Pour les élèves de 10e année."], SRC), ["10"]);
});
test("our own background text counts as a source", () => {
  assert.deepEqual(factGuard(["Look under Settings, then Privacy [b1]."], SRC), []);
});
test("source markers are not words", () => {
  assert.deepEqual(factGuard(["The app costs $8 a month [s3,s1]."], SRC), []);
});
test("money keeps its number ($14 is not $8)", () => {
  assert.deepEqual(factGuard(["The app costs $14 a month."], SRC), ["14"]);
});

console.log("wording overlap");
const draft = (text: string): Draft => ({
  headline: "h", dek: "", news: "", thirty: [], confirmed: [], claimed: [], unknown: [], matters: "",
  sections: [{ kind: "news", paras: [text] }], body: { plain: [], expert: [] }, timeline: [],
});
test("nine words copied from an outlet are flagged", () => {
  const p = overlapProblems(draft("Northwind says the model runs on a single laptop GPU with 16 GB of memory [s1]."), [{ outlet: "Northwind Labs", text: SRC.split("\n")[0] }]);
  assert.equal(p.length, 1);
  assert.match(p[0], /Northwind Labs/);
});
test("our own wording passes", () => {
  assert.deepEqual(overlapProblems(draft("Northwind says one laptop GPU is enough to run it [s1]."), [{ outlet: "Northwind Labs", text: SRC.split("\n")[0] }]), []);
});
test("a quotation in quotation marks is not counted as copying", () => {
  const out = overlapProblems(draft("Roy said the goal is a model “that runs on a single laptop GPU with 16 GB of memory” [s1]."), [{ outlet: "Northwind Labs", text: SRC.split("\n")[0] }]);
  assert.deepEqual(out, []);
});

console.log("slugs");
test("headline to slug", () => {
  assert.equal(slugify("Northwind Labs releases Aurora-2, a bilingual AI model"), "northwind-labs-releases-aurora-2-a-bilingual-ai-model");
});
test("French accents, elisions and '&' (et)", () => {
  assert.equal(slugify("L'IA à l'école : Québec & Montréal", { lang: "fr" }), "l-ia-a-l-ecole-quebec-et-montreal");
  assert.equal(slugify("Jobs & AI"), "jobs-and-ai");
});
test("decimals, money and possessives", () => {
  assert.equal(slugify("OpenAI's GPT-4.5 costs $1.2 billion"), "openais-gpt-4-5-costs-1-2-billion");
});
test("long slugs drop small words, cut at a word, never end on a hyphen", () => {
  const s = slugify("The Office of the Digital Commissioner opens a twelve-week public consultation on the use of AI tools in hiring across the country");
  assert.ok(s.length <= 72, s);
  assert.ok(!s.endsWith("-") && !s.includes("--"), s);
  assert.ok(s.startsWith("the-office-digital-commissioner"), s);
});
test("nothing to slug gives an empty string; uniqueSlug never collides", () => {
  assert.equal(slugify("!!! — ???"), "");
  const taken = new Set(["aurora-2", "aurora-2-2"]);
  assert.equal(uniqueSlug("aurora-2", taken), "aurora-2-3");
  assert.equal(uniqueSlug("", new Set()), "article");
});
test("clip never leaves a dangling small word", () => {
  assert.equal(clip("Kestrel launches KestrelStudy, a homework chatbot for high school students", 60), "Kestrel launches KestrelStudy");
  assert.equal(clip("Northwind Labs releases a bilingual model that runs on a laptop today", 60), "Northwind Labs releases a bilingual model that runs");
});

console.log("kill list");
test("ids, slugs and objects", () => {
  const k = killedIds({ killed: ["abc", { id: "def", reason: "wrong" }, { slug: "some-slug" }, 4, null] });
  assert.deepEqual([...k], ["abc", "def", "some-slug"]);
  assert.ok(isKilled(k, { id: "zzz", slug: { en: "some-slug", fr: "x" } }));
  assert.deepEqual([...killedIds(["a"])], ["a"]);
  assert.deepEqual([...killedIds("nonsense")], []);
});

console.log("confirmed is counted, not chosen");
test("one non-official outlet's 'confirmed' point becomes a claim in its name", () => {
  const sources: DispatchSource[] = [
    { key: "s1", outlet: "A", title: "", url: "", publishedAt: "", storyId: "1", official: false, lang: "en" },
    { key: "s2", outlet: "B", title: "", url: "", publishedAt: "", storyId: "2", official: false, lang: "en" },
  ];
  const d = shapeDraft({
    headline: "A headline that is long enough to pass", news: "News.", thirty: ["a", "b", "c"], matters: "m",
    confirmed: [{ text: "Both say it.", src: ["s1", "s2"] }, { text: "Only A says it.", src: ["s1"] }, { text: "Bad key.", src: ["s9"] }],
    article: { news: ["Para [s1] with a fake marker [s7] and a background marker [b1]."] }, plain: ["p"],
  }, sources, []);
  assert.ok(typeof d !== "string", String(d));
  if (typeof d === "string") return;
  assert.deepEqual(d.confirmed.map(c => c.text), ["Both say it."]);
  assert.deepEqual(d.claimed.map(c => [c.text, c.by]), [["Only A says it.", "A"]]);
  assert.equal(d.sections[0].paras[0], "Para [s1] with a fake marker and a background marker.");
});

console.log("meaning check");
test("a flipped verb ('did not release') is caught", () => {
  const bad = factGuard(["Northwind Labs did not release Aurora-2."], "Northwind Labs released Aurora-2, an open-weight model, on Tuesday.");
  assert.ok(bad.some(x => x.startsWith("denial not in the sources")));
});
test("a denial the source itself makes passes", () => {
  assert.deepEqual(factGuard(["Northwind Labs said it did not train Aurora-2 on user data."], "Northwind Labs said it did not train Aurora-2 on user data."), []);
});
test("what the reporting leaves open is not a denial", () => {
  assert.deepEqual(factGuard(["Neither report says how many people will use it."], SRC), []);
});

console.log(`\n${passed} passed, ${failures.length} failed`);
process.exit(failures.length ? 1 : 0);

