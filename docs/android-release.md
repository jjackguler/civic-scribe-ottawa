# The Brief Android preparation

The owner selected PWA plus Android preparation. Android uses Google's Trusted Web Activity (TWA): the same app UI and content run on the verified HTTPS origin. Package ID: `com.aibroadsheet.brief`. Intended origin: `https://app.aibroadsheet.com`, launch path `/app?source=android`. The main newspaper remains at `https://aibroadsheet.com`.

## Reproducible test artifacts

Run `npm ci --prefix tools/android`, then `node tools/android/generate.mjs`. The generator uses pinned Bubblewrap Core 1.27.0 and repo-owned manifest/icons, and refuses to overwrite an existing generated project. It writes `android/generated/` (ignored) and the reviewable `android/twa-manifest.json`. No upload key or store credentials are generated. Java 17 and Android SDK platform 36 are needed for building.

In `android/generated`, run `./gradlew assembleDebug bundleRelease` (Windows: `gradlew.bat`). The manual **Build Brief Android test artifacts** workflow does the same on GitHub. Its debug APK is only for testing; its unsigned AAB cannot be submitted to Play. It does not upload to any store. It fails if SDK 36 is absent instead of accepting SDK terms automatically.

The generated wrapper uses Custom Tabs fallback, disables notification delegation and adds no camera, contacts, microphone, location, billing or advertising SDK feature. Website/browser data processing still applies; this is not a claim of zero collection.

## Before a store release

1. Verify `/app`, `/fr/app`, manifest, service worker, icon URLs, real videos, sharing, navigation and saved-summary recovery over HTTPS. Test on a physical Android device. Saved summaries do not imply offline video playback.
2. Owner completes Google Play developer enrollment and identity/terms steps. Confirm the package name before the first upload, since it becomes permanent in Play.
3. Create and back up the private upload key outside Git; choose Play App Signing. Keep passwords and service-account files out of chat and repository. There is no release key yet.
4. Obtain the public SHA-256 **app-signing** certificate fingerprint from Play (it may differ from the upload key). Run `node tools/android/assetlinks.mjs AA:BB:...` with the real full fingerprint, deploy the resulting `public/.well-known/assetlinks.json`, and verify it on the app origin. There is deliberately no placeholder assetlinks file. Unverified builds show browser UI rather than claiming trusted fullscreen.
5. Complete privacy/Data safety, news-app and content-rating declarations using an actual collection audit; include hosting logs, analytics, external video requests, optional speech and share destinations. Do not tick “no data collected” based solely on the wrapper. Current policy page: `https://aibroadsheet.com/privacy` (verify the final route before submission).
6. Upload a signed release AAB to internal testing first. Complete the account-specific testing and production-access requirements shown in Play Console. No review/approval date is promised.

## Store copy draft

Name: **AI Broadsheet: The Brief**

Short description: **AI news, short videos and clear context—with sources one swipe away.**

Description: Follow the AI stories that matter to everyday life. Explore story circles, short videos and visual explainers; swipe for context and source links. Save summaries on your device, follow topics and share stories. Optional read-aloud uses a synthetic voice. AI-assisted reporting and media are labelled. Independent perspective, open sources and human stakes. Published by AI Broadsheet; editor Jack Guler; contact hello@aibroadsheet.com. Likes and saved items are private to this device; they are not public social-network counters.

Prepared screenshots: `public/brief/preview-story.webp` and `preview-shorts.webp`; export final PNG/JPEG store screenshots from the actual Android build after device QA. No fabricated ratings, downloads or awards.

References checked 15 October 2026: https://developer.android.com/develop/ui/views/layout/webapps/guide-trusted-web-activities-version2 and https://github.com/GoogleChromeLabs/bubblewrap .
