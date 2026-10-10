# Newsroom costs and production limits

The existing scheduled newsroom stays in place. Missing keys, unknown model prices and infrastructure failures fail visibly; successful work and the daily attempt counter are saved even when the writer step fails.

## What one article costs in calls

Each event goes through six staged desks, all kept:

| Desk | Tier | Requested output (tokens) |
| --- | --- | --- |
| reporter | writer | 6000 |
| copy editor | writer | 6000 |
| standards | checker | 1200 |
| translator (EN→FR, may retry once) | writer | 7000 |
| SEO | checker | 2500 |
| page designer | checker | (see roles.ts) |

So at least 6 model calls per published article, more when the translator retries or HTTP 429/5xx retries happen. Cover images are a separate, paid, opt-in call (only when `GEMINI_IMAGE_MODEL` is set).

## Controls added

- `NEWSROOM_PROVIDER=auto|gemini|claude`. `auto` (default) keeps the old rule: Claude when `ANTHROPIC_API_KEY` is set. An explicit provider without its key stops the run instead of switching.
- `NEWSROOM_PROFILE=economy`: writer and checker both use `NEWSROOM_ECONOMY_MODEL` (default `gemini-3.1-flash-lite`; Claude: Haiku writer). All six desks, standards and editor review stay on.
- No automatic Pro fallback. The old chain (`… → gemini-pro-latest`) is gone. Extra models only via `NEWSROOM_GEMINI_FALLBACKS` (max 2 models in the chain; names containing "pro" are dropped unless `NEWSROOM_ALLOW_PRO=1`). Only a 404 (model not found) moves to the next model; quota (429) and key errors (401/403) stop the call, because another model does not fix a quota.
- Retries: `NEWSROOM_RETRIES` (default 1, max 2), only on 429/5xx. Previously 2 retries per model × up to 4 models.
- Output budget: Gemini now gets the requested `maxTokens` plus `NEWSROOM_GEMINI_THINKING_HEADROOM` (default 1024, max 4096) instead of a forced minimum of 16384.
- Per-run guard (`NEWSROOM_RUN_MAX_CALLS` 60, `NEWSROOM_RUN_MAX_TOKENS` 600000, `NEWSROOM_RUN_MAX_USD` 1). Counts every HTTP attempt including retries; tokens include thinking. USD is an estimate at the rates below. **This is per run and in memory only — not a global or monthly dollar cap.** Refused calls are logged.
- Daily cap (`NEWSROOM_DAILY_CAP`, default 40) used to count only outcomes on record (published + rejected), so model/infra failures were not counted. The run now writes `attempts.json` in the newsroom store before each event and uses whichever count is higher. It relies on the workflow's concurrency group; it is not safe for parallel runs.
- The run summary logs effective provider, models, calls, tokens and estimated spend. Error logs keep only the HTTP status , never keys or full provider bodies.

## Illustrative monthly estimate

Source: <https://ai.google.dev/gemini-api/docs/pricing> (check before relying on it). As given for this estimate: Gemini 3.1 Flash-Lite $0.25 in / $1.50 out per 1M tokens; Gemini 3.8 Flash $0.75 / $3.75 until 2026-12-31.

Assumptions: 40 articles/day × 30 = 1200 articles; 18000 input + 6000 output tokens per article in total across all desks.

- 3.1 Flash-Lite: 1200 × (18000 × 0.25 + 6000 × 1.50) / 1e6 = **$16.20/month**
- 3.8 Flash: 1200 × (18000 × 0.75 + 6000 × 3.75) / 1e6 = **$43.20/month**

Excluded: images, hosting, search grounding, retries, thinking tokens beyond the assumption, Claude. Free tiers are not promised. Measure real usage from the run summary before deciding.

## Tests

`cd scripts/newsroom && npx tsx test.ts && npx tsx costs-test.ts` — no keys, no network. The workflow runs both before writing.

## Exact limits and safe rollout

The original repository remains the single producer. Mobile previews must not run a second copy of these schedules. This patch does not enable billing or change the configured writing model. The economy profile below is available after quality review.

Call count is a hard per-process HTTP attempt limit. Token and USD thresholds are checked before the NEXT request using reported consumption: one request can overshoot. They do not cap the account bill or other scripts. Missing usage/network errors stop later calls and report UNKNOWN, not zero. Unknown models (including Claude) require explicit per-million input/output prices. For a mixed-model chain, configure conservative rates covering the most expensive model, or use a single model. Check model availability and prices before enabling.

The daily UTC event counter is written atomically before a model call; corrupt data and future dates stop generation. It includes failures and held drafts from this version. It cannot reconstruct unrecorded historical failures/drafts. It depends on serialized runs and successful persistence of the newsroom branch. A runner killed before its commit/push may lose that run's local counter; use a transactional shared datastore for an account-wide hard daily limit. Approved drafts do not require re-generation.

Suggested trial variables (10–20 articles under editor review first):

```
NEWSROOM_PROVIDER=gemini
NEWSROOM_PROFILE=economy
NEWSROOM_ECONOMY_MODEL=gemini-3.1-flash-lite
NEWSROOM_DAILY_CAP=40
NEWSROOM_MAX_PER_RUN=4
NEWSROOM_RUN_MAX_CALLS=36
NEWSROOM_RUN_MAX_TOKENS=160000
NEWSROOM_RUN_MAX_USD=0.25
NEWSROOM_RETRIES=1
NEWSROOM_REVIEW=risky
```

Keep `GEMINI_IMAGE_MODEL` unset for the first text-only trial. No real paid model requests were made in automated validation. The existing six editorial desks and approval logic remain active.
