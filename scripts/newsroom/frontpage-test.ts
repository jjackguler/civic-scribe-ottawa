import assert from "node:assert/strict";
import { bindRequest, canKeepAlive } from "../../src/lib/shared-cache";

process.env.MAX_DAILY_CLAUDE_CALLS = "-1";
const held: Promise<unknown>[] = [];
const context = { waitUntil(p: Promise<unknown>) { held.push(p); } };
const request = new Request("https://example.test/");
Object.assign(request, { runtime: { cloudflare: { context } } });
bindRequest(request, undefined);
assert.equal(canKeepAlive(), true, "Nitro's request context must keep the refresh alive");
bindRequest(new Request("https://example.test/"), undefined);
assert.equal(canKeepAlive(), false, "never retain a previous request's context");
bindRequest(request, context);

const originalFetch = globalThis.fetch;
let release!: () => void;
const slow = new Promise<void>(r => { release = r; });
let calls = 0;
globalThis.fetch = async () => {
  calls += 1;
  if (calls > 1) { await slow; return new Response("", { status: 503 }); }
  return new Response(`<rss><channel><item><title>AI research reaches a new milestone</title><link>https://example.test/ai-research</link><pubDate>${new Date().toUTCString()}</pubDate><description>A source-backed AI research report.</description><enclosure url="https://example.test/photo.jpg" type="image/jpeg" /></item></channel></rss>`);
};

try {
  const { loadFrontPageNews, loadNews } = await import("../../src/lib/news-engine");
  const started = Date.now();
  const first = await loadFrontPageNews(50);
  assert.ok(Date.now() - started < 1000, "a hanging source must not delay the first edition");
  assert.equal(first.partial, true);
  assert.ok(first.stories.length > 0, "the first completed source is visible before all feeds finish");
  assert.ok(held.length > 0, "the rest of the desk is kept alive");
  release();
  const full = await loadNews();
  assert.ok(full.stories.length > 0);
  assert.ok(!full.partial, "the full desk replaces the partial first edition");
  const before = calls;
  assert.equal((await loadFrontPageNews()).stories.length, full.stories.length);
  assert.equal(calls, before, "warm reads never refetch feeds");
  await Promise.allSettled(held);
  console.log("Front-page checks passed: runtime context, early headlines, background completion, warm cache.");
} finally {
  release();
  globalThis.fetch = originalFetch;
}
