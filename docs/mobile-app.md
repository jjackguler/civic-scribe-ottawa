# Mobile app on the production domain

The website and installable PWA share https://aibroadsheet.com. Install guidance is at `/more`; the private reading list is at `/saved`. Both utility pages are noindex. There is no second newsroom process or hosting subscription.

Readers can install through Safari's Add to Home Screen or Chrome's install menu. The app includes a mobile bottom navigation, English/French reading, native sharing with a clipboard fallback, text size controls and up to 100 locally stored story summaries. Browser storage removal clears these preferences and summaries.

The service worker caches a static offline page and permitted public static assets. It never caches SSR page HTML, API responses, authentication requests, private routes or full publisher articles. On a failed document request it displays the offline reading list. Live reporting and full articles still require connectivity. Updates wait for the reader's choice before reloading.

The previous mobile prototype was ported selectively; current hero, performance, editorial trust, budget, music rights and canonical-domain fixes remain in place. The shared newspaper-and-spark mark replaces the AB initials in the website and mobile icon assets.

Validation: `npm run build`, `npx tsc --noEmit`, and `npx tsx ../mobile-test.ts` from `scripts/newsroom`. The latter tests reading-list input bounds and service-worker cache exclusions. Browser verification covers saving a real headline, retaining its summary, and reloading successfully into the offline page with the local server stopped.

This is an installable web app, not a signed APK/AAB/IPA or a store listing. Native store packaging, developer-account enrollment, signing and physical-device store checks remain separate work.
