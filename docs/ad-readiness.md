# AdSense launch readiness

Updated 15 October 2026. Owner chose AdSense monetization, not paid Google Ads. Target site: https://aibroadsheet.com. The app hostname remains separate.

## Verification and serving are separate

`ADSENSE_CLIENT` in `src/lib/ads.ts` supplies the ownership meta tag and generated `/ads.txt`. Use only the real publisher ID from the selected owner's AdSense account. Do not add a second static ads.txt file.

`ADSENSE_SERVING_ENABLED` remains false. Adding the publisher ID or ad-unit IDs alone cannot mount an AdSense unit, inject its script or enqueue requests. House promotions and direct campaigns continue. This is a launch gate, not a certified CMP implementation.

## Required before serving

1. Complete account enrollment and Google's site review. The owner supplies accurate account/payment information and handles identity verification. Never create a duplicate publisher account if the owner already has one.
2. Verify the exact publisher ID and ownership using the method shown in the account, preferably the existing meta tag or generated ads.txt without an advertising script.
3. Configure and publish a Google-certified CMP in AdSense Privacy & messaging, or another verified certified CMP. Replace the legacy local preference bar and connect actual consent decisions. Merely setting a publisher ID or a Consent Mode flag does not do this.
4. Verify consent choice, rejection, withdrawal, GPC behaviour, regional configuration and absence of unintended requests in a real browser. Non-personalised ads can still use cookies; never treat rejection as automatic permission to load them. Do not let old localStorage preferences override CMP decisions.
5. Review rights for every commercially displayed feed/image and keep original reporting and explicit editorial attribution. No fixed article count or traffic threshold guarantees approval.
6. Add real ad-unit IDs only after the account permits serving; explicitly enable the serving flag only with documented approval and consent verification. Check mobile layout and reserved ad space. Children's pages, the Keeper and other excluded routes remain ad-free.

## Existing foundation

Labelled reserved placements, house ads, `/advertise`, trust pages, canonical URLs, sitemap/RSS, server-rendered ownership meta tag and generated `/ads.txt` already exist. Privacy copy now acknowledges local storage and offline caching. Their presence does not mean Google has approved the site.

## Official references checked 15 October 2026

- https://support.google.com/adsense/answer/9724?hl=en — eligibility
- https://support.google.com/adsense/answer/13554020?hl=en — certified CMP requirements
- https://support.google.com/adsense/answer/7670013?hl=en — CMP setup
- https://support.google.com/adsense/answer/7670312?hl=en — non-personalised ads and cookies

Account enrollment, publisher ID, site review, certified CMP and ad units remain pending. No Google advertising requests or spending have been enabled.
