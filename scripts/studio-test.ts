/**
 * Buildgena Studio import checks (no network, no credentials).
 *   npx tsx scripts/studio-test.ts
 * 1. The schema accepts the example fixture and rejects broken variants.
 * 2. Every real file in src/content/studio/*.json is valid (CI fails on a bad file).
 * 3. The example fixture is never shipped as a real story.
 * 4. The Markdown renderer never emits raw HTML from a file.
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadStudioFiles, parseStudioFile, readingMinutes } from "../src/lib/studio-schema";
import { Markdown } from "../src/components/Markdown";
import { parseBlocks } from "../src/lib/markdown";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = join(root, "scripts/fixtures/studio/example-northwind-aurora-2.json");
const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));

// 1. Schema
const ok = parseStudioFile("example-northwind-aurora-2.json", fixture);
assert.ok(ok.ok, `fixture should be valid: ${!ok.ok ? ok.errors.join("; ") : ""}`);
const bad = (patch: Record<string, unknown>, why: string) => {
  const r = parseStudioFile("example-northwind-aurora-2.json", { ...fixture, ...patch });
  assert.equal(r.ok, false, `should reject: ${why}`);
};
bad({ version: 2 }, "unknown version");
bad({ id: "Not A Slug" }, "non-kebab id");
bad({ lang: "de" }, "unsupported language");
bad({ sources: [] }, "no sources");
bad(
  { sources: [{ title: "x title", url: "http://insecure.example.com", publisher: "X pub" }] },
  "http source",
);
bad({ stamps: ["VERIFIED"] }, "unknown stamp");
bad({ approvedAt: "yesterday" }, "non-ISO date");
bad({ producedWith: "Some other tool" }, "not produced with Studio");
bad({ aiDisclosure: "" }, "missing AI disclosure");
bad({ cover: "javascript:alert(1)" }, "unsafe cover URL");
assert.equal(parseStudioFile("other-name.json", fixture).ok, false, "file name must match id");

const dup = loadStudioFiles({
  "a/example-northwind-aurora-2.json": fixture,
  "b/example-northwind-aurora-2.json": fixture,
});
assert.equal(dup.pieces.length, 1);
assert.equal(dup.rejected.length, 1, "duplicate ids are rejected");
assert.ok(readingMinutes(fixture.body) >= 1);

// 2. Real files
const dir = join(root, "src/content/studio");
const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".json")) : [];
const real = loadStudioFiles(
  Object.fromEntries(files.map((f) => [f, JSON.parse(readFileSync(join(dir, f), "utf8"))])),
);
for (const r of real.rejected) console.error(`✗ ${r.file}: ${r.errors.join("; ")}`);
assert.equal(real.rejected.length, 0, "every file in src/content/studio must be valid");

// 3. The example must stay a fixture
assert.ok(
  !files.includes("example-northwind-aurora-2.json"),
  "the example fixture must not be copied into src/content/studio",
);
assert.ok(
  real.pieces.every((p) => p.approvedBy !== "Example Editor" && !p.id.startsWith("example-")),
  "example pieces must not ship",
);

// 4. Markdown safety and structure
const html = renderToStaticMarkup(
  createElement(Markdown, {
    source:
      "## Head\n\n<script>alert(1)</script> and <b>x</b>\n\n- one\n- two\n\n[bad](javascript:alert(1)) [good](https://example.com) [site](/standards)\n\n> quote",
  }),
);
assert.ok(!html.includes("<script>"), "raw HTML is escaped");
assert.ok(html.includes("&lt;script&gt;"), "raw HTML shows as text");
assert.ok(!html.includes("javascript:"), "unsafe links are dropped");
assert.ok(html.includes('href="https://example.com"') && html.includes('href="/standards"'));
assert.deepEqual(
  parseBlocks("# A\n\ntext\n\n1. x\n2. y").map((b) => b.k),
  ["h2", "p", "ol"],
);

console.log(
  `studio-test: ok (${real.pieces.length} published piece${real.pieces.length === 1 ? "" : "s"})`,
);
