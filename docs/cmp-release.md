# CMP review mode — 15 October 2026

AdSense review is requested, not approved. `ADSENSE_SERVING_ENABLED` stays false,
slots remain empty, and GoogleConsent sets `pauseAdRequests=1` before loading
the AdSense tag. No code resumes it. Consent does not activate advertising.

Google dashboard message: AI Broadsheet — European privacy choices, published
in English and French. Consent / refuse / manage options; optimization off.
Custom partner list: Google only. Legitimate-interest toggles default off;
RTB consent check and DSA transparency enabled. No special-feature-2 opt-in.

The tag is production-host-only (aibroadsheet.com), excluded from the separate
PWA and initial loads of ad-free pages. The legacy preference banner is no
longer mounted. Google's CONSENT_API_READY callback enables a revocation button.
The privacy policy describes CMP connections while advertising remains paused.

Before any future ad activation:
- Confirm Google site approval and ads.txt crawler status.
- Verify actual EU/UK/Swiss consent, refusal, manage-options, reload and revocation
  in English/French. Preview query: `?fc=alwaysshow&fctype=gdpr` (Google docs).
- Verify cookies/network before choice and after refusal; no ad serving during review.
- Implement consent-aware slot loading in place of the legacy local preference
  dependency. Do not simply flip the serving flag or unpause this review loader.
- Review Canada/US privacy requirements and ad-category controls separately.
- Keep PWA/native ads disabled; native would require its own UMP integration.

References:
- https://support.google.com/adsense/answer/10960768?hl=en
- https://support.google.com/adsense/answer/9042142?hl=en
- https://developers.google.com/funding-choices/fc-api-docs

Dashboard publication alone is not proof that the on-site CMP has been tested.
