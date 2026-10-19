# Ink & Gold: app identity sync

The approved artwork is the live newspaper's uploaded gold lowercase b with a red news dot, not the earlier folded-page b. The existing CDN pointers in `src/assets` remain the source of truth. No artwork was redrawn.

`scripts/render-brand.mjs` derives the installed-app, touch, favicon, Android and iOS source images from that upload. When the CDN rejects command-line requests, export the original from the live site in a browser and run:

```sh
node scripts/render-brand.mjs /absolute/path/to/ai-broadsheet-avatar.png
```

The public brand font mirrors the exact uploaded WOFF so the separately hosted app does not depend on a Lovable-only asset route. The original font pointer is retained as a fallback. Shared logos resolve the newspaper's CDN origin explicitly so they also load on the app hostname.

Brand changes in `brief.css` are scoped to the app identity and navigation. Article type, story layouts, reporting and player controls are preserved. The app uses the site's current tagline; the offline asset cache version advances so existing readers can receive the new icons after accepting an update. Manifest identity/start URL and established public asset URLs remain stable.

The iOS workflow generates its ignored `icon.png` from `public/brief/icon-512.png`; the generator also prepares a local 1024px native icon. This does not sign or submit an App Store build. Android's existing launcher references point at the updated PWA images; no Play release is implied.

Verification: TypeScript, production build, 7 Brief checks and 15 mobile checks; browser check at 390×844 confirmed a loaded 256px mark, Ink header, Bodoni brand face and no horizontal page overflow. Physical phone installation and store signing remain separate work.

Deploy the separately hosted PWA from the production build with `node scripts/prepare-brief-host.mjs`, then Wrangler using `.output/server/wrangler.json`. This targets `aibroadsheet-brief` / `app.aibroadsheet.com`; the newspaper's DNS, email and ad-serving controls are not changed.
