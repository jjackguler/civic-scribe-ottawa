import assert from "node:assert/strict";
import {
  starterBriefs,
  parseBriefSaved,
  buildBriefFeed,
  originalBrief,
  briefShareUrl,
} from "../src/lib/brief-feed";
import type { Original } from "../src/lib/originals-types";
let checks = 0;
function test(name: string, fn: () => void) {
  fn();
  checks++;
  console.log("PASS " + name);
}
const sample = starterBriefs("en")[0];
test("malformed storage, protocol-relative paths and script links are rejected", () => {
  assert.deepEqual(parseBriefSaved("{oops"), []);
  for (const path of [
    "//evil.test",
    "https://evil.test",
    "/app?story=x&token=abc",
    "/article/a%2fb",
    "/app?story=%22",
  ]) {
    const items = parseBriefSaved(JSON.stringify([{ ...sample, path }]));
    assert.equal(items.length, 0, path);
  }
});
test("saved text and source links are bounded and private payloads discarded", () => {
  const [item] = parseBriefSaved(
    JSON.stringify([
      {
        ...sample,
        summary: "x".repeat(5000),
        transcript: "private full text",
        sources: [
          { name: "Bad", url: "javascript:alert(1)" },
          { name: "NIST", url: "https://nist.gov" },
        ],
      },
    ]),
  );
  assert.equal(item.summary.length, 1400);
  assert.equal(item.transcript, undefined);
  assert.equal(item.sources.length, 1);
});
test("duplicate cards collapse and at most 100 local summaries are kept", () => {
  const items = Array.from({ length: 110 }, (_, i) => ({ ...sample, id: "test-" + i }));
  assert.equal(parseBriefSaved(JSON.stringify([...items, items[0]])).length, 100);
});
test("both language editions have real sources and stable share URLs", () => {
  for (const locale of ["en", "fr"] as const)
    for (const b of starterBriefs(locale)) {
      assert.ok(b.sources.length);
      assert.ok(b.aiLabel);
      assert.ok(briefShareUrl(b).startsWith("https://aibroadsheet.com/"));
      assert.equal(parseBriefSaved(JSON.stringify([b])).length, 1);
    }
});
const video: Original = {
  id: "allowed",
  title: "Our explainer",
  summary: "A summary",
  publishedAt: "2026-10-15",
  durationSec: 30,
  sources: [],
  transcript: "Transcript",
  voice: "synthetic",
  aiImages: true,
  fileUrl: "https://example.test/video.mp4",
};
test("held music, titles and private YouTube-only assets never enter the player", () => {
  const feed = buildBriefFeed(
    [],
    [
      video,
      { ...video, id: "202610081600-what-is-ai-opening-titles" },
      { ...video, id: "intro", kind: "titles" },
      { ...video, id: "private", fileUrl: undefined, youtubeId: "123", youtubePrivacy: "private" },
    ],
    "en",
  );
  assert.ok(feed.some((s) => s.id === "video-allowed"));
  assert.ok(!feed.some((s) => /opening-titles|video-intro|video-private/.test(s.id)));
});
test("original video shares reopen their precise card rather than a missing page", () => {
  assert.equal(originalBrief(video).path, "/app?story=video-allowed");
  assert.equal(originalBrief(video, "fr").path, "/fr/app?story=video-allowed");
});
console.log(`${checks} Brief checks passed.`);
