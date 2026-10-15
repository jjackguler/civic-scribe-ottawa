# The Brief release path

## Implemented

The GitHub branch contains a responsive, installable PWA. The new edition has story rings, vertical short video, horizontal context/source cards, device-local likes and topic following, saved summaries, native sharing, WhatsApp and X share composers, optional muted auto-play and 1/1.5/2x playback. There is no public social graph, public like count or comment service. X sharing opens a composer and never proves that a post was sent.

## Preview deployment

The manual `Deploy Brief preview to Cloudflare` workflow builds and tests the selected revision, then deploys the generated `.output/server/wrangler.json` with its static assets to a dedicated `aibroadsheet-brief-preview` Worker. The workflow must first exist on the default branch before GitHub enables manual dispatch; then select the reviewed branch. It does not change the production hostname, email or DNS. Do not deploy the raw TypeScript server without the generated assets configuration.

Owner setup still required: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in GitHub Actions secrets (prefer the `brief-preview` environment). Use a token scoped to the intended Cloudflare account with Workers Scripts Edit and the read permissions requested by Cloudflare's Workers deployment template. Never paste the token into chat or commit it. Local Wrangler OAuth was authorized on 15 October 2026. GitHub Actions deployment secrets are still not configured; do not copy a personal OAuth refresh token into Actions.

The output preparation script sets noindex HTTP headers for SSR and assets, and disallows crawlers in robots.txt. After the workflow succeeds, capture the actual workers.dev URL and verify `/app`, `/fr/app`, a real news item, a real original video, install/offline recovery, and the existing newspaper. Local CI is not proof of a live deployment. Bind no production domain until parity has been checked.

## Production and stores

The standalone app release address is `https://app.aibroadsheet.com/app`. `node scripts/prepare-brief-host.mjs` prepares a dedicated Worker and this custom domain from a fresh build. Root URLs redirect to the app; app-host responses are noindex to avoid indexing a duplicate newspaper. The original `https://aibroadsheet.com/app` still requires the existing production host to adopt this code. Domain registration alone does not configure hosting. A migration must preserve email DNS, analytics, editorial secrets, redirects and the existing newspaper. Do not claim GitHub automatically updates production.

On HTTPS, Safari and Chrome can install the PWA from the home-screen install flow. Physical iPhone/Android checks remain outstanding. Native Android AAB and iOS IPA signing, developer-account enrollment, privacy declarations, store screenshots and submission are not complete. There are no store releases yet. The owner selected PWA plus Android preparation on 15 October 2026. See `docs/android-release.md` for the generated TWA project, test-artifact workflow and signing/Play gates. iOS is not in the current store scope.

## Style and next features

Forest charcoal, warm paper, restrained vermilion; original editorial imagery and a small aperture mark. Short headlines should make a specific promise fulfilled by the context card, with sources and uncertainty one swipe away. Rings represent available stories, never fabricated live events. Seen rings reflect this browsing session only.

Next useful additions after release: a daily three-story edition, human-recorded audio with captions, editorial topic collections, and anonymous aggregate completion/source-open measurements. Public comments and repost feeds require identity, moderation and abuse controls; do not ship decorative counters that imply those services exist.

References: https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/ and https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/
