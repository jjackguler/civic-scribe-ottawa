/**
 * Cost-control tests: provider routing, bounded retries/model chain, output
 * budget, per-run guard, persistent attempt counting. No network, no keys.
 *   npx tsx scripts/newsroom/costs-test.ts
 */
import assert from "node:assert/strict";
import { geminiMaxOutput, liveModels, resolveConfig, RunBudget, withRetry } from "./models";
import { parseAttempts } from "./attempts";

let passed = 0; const failures: string[] = [];
async function test(name: string, fn: () => void | Promise<void>) {
  try { await fn(); passed++; console.log(`  ✓ ${name}`); } catch (e) { failures.push(name); console.log(`  ✗ ${name}\n    ${(e as Error).message}`); }
}
const both = { ANTHROPIC_API_KEY: "x", GEMINI_API_KEY: "y" };
const cfg = (e: Record<string, string>) => { const c = resolveConfig(e); if ("error" in c) throw new Error(c.error); return c; };

console.log("provider routing");
await test("auto with both keys keeps the old rule (Claude)", () => assert.equal(cfg(both).provider, "claude"));
await test("NEWSROOM_PROVIDER=gemini wins over a Claude key", () => assert.equal(cfg({ ...both, NEWSROOM_PROVIDER: "gemini" }).provider, "gemini"));
await test("explicit provider without its key is an error, not a silent switch", () => {
  const c = resolveConfig({ GEMINI_API_KEY: "y", NEWSROOM_PROVIDER: "claude" });
  assert.ok("error" in c);
});
await test("unknown provider value is rejected", () => assert.ok("error" in resolveConfig({ ...both, NEWSROOM_PROVIDER: "openai" })));
await test("no keys: liveModels returns null", () => assert.equal(liveModels({}), null));
await test("economy profile uses the cheaper model for both tiers", () => {
  const c = cfg({ GEMINI_API_KEY: "y", NEWSROOM_PROFILE: "economy" });
  assert.deepEqual(c.names, { writer: "gemini-3.1-flash-lite", checker: "gemini-3.1-flash-lite" });
});
await test("standard Gemini defaults unchanged", () => assert.equal(cfg({ GEMINI_API_KEY: "y" }).names.writer, "gemini-3.8-flash"));

console.log("model chain and retries");
await test("no automatic Pro fallback", () => {
  const c = cfg({ GEMINI_API_KEY: "y", NEWSROOM_GEMINI_FALLBACKS: "gemini-pro-latest,gemini-flash-latest" });
  assert.deepEqual(c.chain.writer, ["gemini-3.8-flash", "gemini-flash-latest"]);
});
await test("chain is at most two models", () => {
  const c = cfg({ GEMINI_API_KEY: "y", NEWSROOM_GEMINI_FALLBACKS: "a,b,c" });
  assert.equal(c.chain.checker.length, 2);
});
await test("retries capped at 2", () => assert.equal(cfg({ GEMINI_API_KEY: "y", NEWSROOM_RETRIES: "9" }).retries, 2));
await test("withRetry makes at most 1 + max calls on 429", async () => {
  let n = 0;
  const r = await withRetry(async () => { n++; return new Response(null, { status: 429 }); }, 1, async () => {});
  assert.equal(n, 2); assert.equal(r.status, 429);
});
await test("withRetry does not retry a 403", async () => {
  let n = 0;
  await withRetry(async () => { n++; return new Response(null, { status: 403 }); }, 2, async () => {});
  assert.equal(n, 1);
});
await test("Gemini output budget respects the request plus bounded headroom", () => {
  assert.equal(geminiMaxOutput(1200, {}), 2224);
  assert.equal(geminiMaxOutput(1200, { NEWSROOM_GEMINI_THINKING_HEADROOM: "99999" }), 5296);
});

console.log("per-run guard");
await test("stops after the call limit", () => {
  const b = new RunBudget({ calls: 2, tokens: 1e9, usd: 100 });
  b.record("gemini-3.8-flash", 10, 10); b.record("gemini-3.8-flash", 10, 10);
  assert.equal(b.allow(), false); assert.equal(b.capped, 1);
});
await test("USD estimate counts thinking as output: 1M in + 1M out on 3.1 Flash-Lite = $1.75", () => {
  const b = new RunBudget({ calls: 99, tokens: 1e9, usd: 100 });
  b.record("gemini-3.1-flash-lite", 1_000_000, 1_000_000);
  assert.ok(Math.abs(b.usd - 1.75) < 1e-9);
});
await test("stops at the USD limit", () => {
  const b = new RunBudget({ calls: 99, tokens: 1e9, usd: 1 });
  b.record("gemini-3.8-flash", 0, 300_000); // $1.125
  assert.equal(b.allow(), false);
});
await test("illustrative month: 1200 articles × (18k in + 6k out) = $16.20 Flash-Lite / $43.20 3.8 Flash", () => {
  const month = (m: string) => { const b = new RunBudget({ calls: 1e9, tokens: 1e12, usd: 1e9 }); b.record(m, 1200 * 18000, 1200 * 6000); return Math.round(b.usd * 100) / 100; };
  assert.equal(month("gemini-3.1-flash-lite"), 16.2); assert.equal(month("gemini-3.8-flash"), 43.2);
});

console.log("attempt counting");
await test("today's count is kept", () => assert.equal(parseAttempts('{"date":"2026-10-10","count":7,"ids":[]}', "2026-10-10").count, 7));
await test("yesterday's count resets", () => assert.equal(parseAttempts('{"date":"2026-10-09","count":40}', "2026-10-10").count, 0));
await test("a broken file stops paid generation", () => assert.throws(() => parseAttempts("{oops", "2026-10-10")));
await test("a missing file starts a new counter", () => assert.equal(parseAttempts(null, "2026-10-10").count, 0));
await test("a future counter stops clock rollback bypass", () => assert.throws(() => parseAttempts('{"date":"2026-10-11","count":40}', "2026-10-10")));

console.log("real request adapter, with a fake transport");
const env = { GEMINI_API_KEY: "test-key-never-sent", NEWSROOM_PROFILE: "economy", NEWSROOM_RUN_MAX_CALLS: "1" };
const call = (m: NonNullable<ReturnType<typeof liveModels>>) => m.json("reporter", "writer", "system", "user", { id: "fixture", attempt: 0 }, 1200);
await test("429 retries obey the hard call cap", async () => {
  let n = 0;
  const m = liveModels(env, (async () => { n++; return new Response(null, {status: 429}); }) as typeof fetch, async () => {})!;
  assert.equal(await call(m), null); assert.equal(n, 1); assert.equal(m.usage.calls, 1);
});
await test("network failure is counted and blocks more paid calls", async () => {
  let n = 0;
  const m = liveModels({...env, NEWSROOM_RUN_MAX_CALLS:"10"}, (async () => { n++; throw new Error("network"); }) as typeof fetch, async () => {})!;
  await call(m); await call(m); assert.equal(n, 1); assert.equal(m.usage.calls, 1); assert.equal(m.usage.usd, null);
});
await test("output limit is respected and thought tokens are billed", async () => {
  const m = liveModels(env, (async (_url, init) => {
    assert.equal(JSON.parse(init!.body as string).generationConfig.maxOutputTokens, 2224);
    return Response.json({ usageMetadata:{promptTokenCount:1000,candidatesTokenCount:100,thoughtsTokenCount:200}, candidates:[{finishReason:"STOP",content:{parts:[{text:'{"ok":true}'}]}}] });
  }) as typeof fetch, async () => {})!;
  assert.deepEqual(await call(m), {ok:true}); assert.equal(m.usage.outTokens, 300); assert.ok(Math.abs(m.usage.usd! - 0.0007)<1e-10);
});
await test("unknown prices disable paid requests", () => assert.equal(liveModels({...env,NEWSROOM_ECONOMY_MODEL:"unknown-model"}), null));
await test("missing usage fails closed", async () => {
  const m = liveModels(env, (async () => Response.json({candidates:[]})) as typeof fetch)!;
  assert.equal(await call(m),null); assert.equal(m.usage.usd,null);
});

console.log(`\n${passed} passed, ${failures.length} failed`);
process.exit(failures.length ? 1 : 0);
