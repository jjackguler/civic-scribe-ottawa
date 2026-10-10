import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { requestWriter } from "./writer-api";
import { approvedOwnerMusic, isCc0, validMusicRights } from "./collage/music-rights";
import { originalPublishable, type Original } from "../../src/lib/originals-types";
import { liveModels } from "../newsroom/models";

let passed = 0;
const test = async (name: string, fn: () => unknown | Promise<unknown>) => { await fn(); console.log(`✓ ${name}`); passed++; };
const keys = { gemini: "fake-key", geminiModel: "gemini-3.8-flash", claudeModel: "test-claude" };
for (const status of [400, 401, 403, 404, 429, 503]) {
  await test(`video HTTP ${status} stops after one request, without leaking provider body`, async () => {
    let n = 0;
    const transport = (async () => { n++; return new Response("PRIVATE RESPONSE BODY", { status }); }) as typeof fetch;
    await assert.rejects(requestWriter("s", "u", keys, 6000, transport), e => e instanceof Error && !e.message.includes("PRIVATE RESPONSE BODY"));
    assert.equal(n, 1);
  });
}
await test("a Claude billing failure never switches provider", async () => {
  let n = 0;
  await assert.rejects(requestWriter("s", "u", { ...keys, anthropic: "fake-key" }, 6000, (async url => {
    n++; assert.match(String(url), /api.anthropic.com/); return new Response("quota", { status: 429 });
  }) as typeof fetch));
  assert.equal(n, 1);
});
await test("network timeout does not start another video request", async () => {
  let n = 0;
  await assert.rejects(requestWriter("s", "u", keys, 6000, (async () => { n++; throw new Error("private url"); }) as typeof fetch), /No automatic model switch/);
  assert.equal(n, 1);
});
await test("video token budget and thought filtering", async () => {
  const r = await requestWriter("s", "u", keys, 6000, (async (_url, init) => {
    assert.equal(JSON.parse(init!.body as string).generationConfig.maxOutputTokens, 7024);
    return Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [{ thought: true, text: "private thought" }, { text: '{"skip":true}' }] } }] });
  }) as typeof fetch);
  assert.equal(r.text, '{"skip":true}');
});
await test("truncated video JSON is not retried as a content revision", async () => {
  await assert.rejects(requestWriter("s", "u", keys, 6000, (async () => Response.json({ candidates: [{ finishReason: "MAX_TOKENS" }] })) as typeof fetch), /complete answer/);
});
for (const status of [401, 429, 503]) {
  await test(`newsroom HTTP ${status} is a persistent infrastructure failure`, async () => {
    let n = 0;
    const m = liveModels({ GEMINI_API_KEY: "fake", NEWSROOM_RETRIES: "0" }, (async () => { n++; return new Response(null, { status }); }) as typeof fetch)!;
    await m.json("reporter", "writer", "s", "u", { id: "fixture", attempt: 0 });
    await m.json("reporter", "writer", "s", "u", { id: "fixture", attempt: 1 });
    assert.equal(n, 1); assert.match(m.failure!, new RegExp(`HTTP ${status}`));
  });
}
const root = await mkdtemp(join(tmpdir(), "aibroadsheet-check-"));
try {
  const file = join(root, "new-song.mp3");
  await writeFile(file, "test audio bytes");
  const digest = createHash("sha256").update("test audio bytes").digest("hex");
  const rights = { commercialUse: true, provider: "suno", planAtCreation: "pro", createdAt: "2026-01-01T00:00:00Z", reviewedAt: "2026-01-02T00:00:00Z", reviewedBy: "test owner", sourceUrl: "https://suno.com/song/test-id", sha256: digest, credit: "Test music credit" };
  await test("owner folder alone grants no music permission", async () => assert.equal(await approvedOwnerMusic(file), null));
  await test("free-plan, missing attestation and changed audio are rejected", () => {
    assert.equal(validMusicRights({ ...rights, planAtCreation: "free" }, digest), false);
    assert.equal(validMusicRights({ ...rights, reviewedBy: "" }, digest), false);
    assert.equal(validMusicRights(rights, "0".repeat(64)), false);
  });
  await test("matching reviewed paid-plan track is accepted", async () => {
    await writeFile(join(root, "rights.json"), JSON.stringify({ "new-song.mp3": rights }));
    assert.equal((await approvedOwnerMusic(file))?.credit, rights.credit);
  });
  await test("fallback music requires explicit CC0 credit", () => {
    assert.equal(isCc0("CC0"), true); assert.equal(isCc0("https://creativecommons.org/publicdomain/zero/1.0/"), true);
    assert.equal(isCc0("CC BY-NC"), false); assert.equal(isCc0(), false);
  });
  await test("free-plan opening video is held; existing explainers remain playable", () => {
    assert.equal(originalPublishable({ id: "202610081600-what-is-ai-opening-titles", fileUrl: "test.mp4" } as Original), false);
    assert.equal(originalPublishable({ id: "existing-cc0-explainer", fileUrl: "test.mp4" } as Original), true);
  });
  process.env.ORIGINALS_NEWSROOM_RAW = join(root, "newsroom");
  const { chooseStory } = await import("./pick");
  const mediaDir = join(root, "media"); await mkdir(mediaDir);
  const queue = join(mediaDir, "queue.json");
  const opts = { mediaDir, manifest: { updatedAt: "", items: [] }, write: true };
  await test("missing queued source is preserved, not consumed", async () => {
    const contents = '[{"articleId":"temporarily-unavailable"}]'; await writeFile(queue, contents);
    await assert.rejects(chooseStory(opts), /kept in queue.json/);
    assert.equal(await readFile(queue, "utf8"), contents);
  });
  await test("corrupt queue fails closed before fallback story selection", async () => {
    await writeFile(queue, "{broken");
    await assert.rejects(chooseStory(opts), /invalid or unreadable/);
    assert.equal(await readFile(queue, "utf8"), "{broken");
  });
  await test("invalid queue shape fails closed", async () => {
    await writeFile(queue, '{"items":{}}'); await assert.rejects(chooseStory(opts), /must contain items/);
  });
} finally { await rm(root, { recursive: true, force: true }); }
console.log(`\n${passed} production-readiness checks passed (no paid API calls).`);
