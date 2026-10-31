/**
 * Reader forms: the newsletter sign-up and the tip line. Shared by the browser
 * (what the reader sees) and the server routes (what gets forwarded), so the
 * consent wording a reader agreed to is exactly the wording recorded.
 *
 * Nothing here stores anything. /api/subscribe and /api/tip validate the input
 * and forward it as JSON to a webhook the owner controls (SUBSCRIBE_WEBHOOK_URL,
 * TIP_WEBHOOK_URL). Without the webhook the routes answer 503 and the page
 * offers an email fallback.
 */
import { SITE } from "./site";
import type { Locale } from "./i18n";

/** Bump when the consent wording changes, so each record says which text the reader saw. */
export const CONSENT_VERSION = "2026-10-31";

export const NEWSLETTER_LIST = "canadian-ai-brief";

/** Who is asking for consent, as CASL requires: name, mailing address (or city), and a contact. */
export function senderLine(locale: Locale): string {
  const p = SITE.publisher;
  const where = p.mailingAddress || `${p.city}, ${p.region}, ${p.country}`;
  return locale === "fr"
    ? `${SITE.name}, publié par ${p.name}, ${where} · ${SITE.email.general}`
    : `${SITE.name}, published by ${p.name}, ${where} · ${SITE.email.general}`;
}

/** The exact consent statement next to the (unticked) checkbox. */
export function consentText(locale: Locale): string {
  const n = SITE.newsletter.name[locale];
  const p = SITE.publisher;
  const where = p.mailingAddress || `${p.city}, ${p.region}`;
  return locale === "fr"
    ? `Oui, je veux recevoir ${n}, l'infolettre hebdomadaire gratuite d'${SITE.name}, envoyée par ${p.name} (${where}; ${SITE.email.general}). Je peux retirer mon consentement en tout temps avec le lien de désabonnement présent dans chaque envoi ou en écrivant à ${SITE.email.general}.`
    : `Yes, send me ${n}, the free weekly email newsletter from ${SITE.name}, sent by ${p.name} (${where}; ${SITE.email.general}). I can withdraw my consent at any time using the unsubscribe link in every issue or by writing to ${SITE.email.general}.`;
}

/** The unsubscribe promise shown under the form. */
export function unsubscribeText(locale: Locale): string {
  return locale === "fr"
    ? "Chaque numéro contient un lien de désabonnement en un clic. Nous n'utilisons votre adresse que pour cette infolettre et ne la vendons ni ne la partageons."
    : "Every issue has a one-click unsubscribe link. We use your address only for this newsletter and never sell or share it.";
}

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

export function validEmail(v: unknown): v is string {
  return typeof v === "string" && v.length >= 6 && v.length <= 254 && EMAIL_RE.test(v.trim());
}

export type SubscribeInput = { email: string; consent: true; locale: Locale; page: string };

/** Validate a sign-up body. Returns the clean input or the reason it was refused. */
export function parseSubscribe(body: unknown): { ok: true; value: SubscribeInput } | { ok: false; error: "email" | "consent" | "bot" | "bad" } {
  if (!body || typeof body !== "object") return { ok: false, error: "bad" };
  const b = body as Record<string, unknown>;
  // Honeypot: a field people never see. Bots fill it.
  if (typeof b.website === "string" && b.website.trim() !== "") return { ok: false, error: "bot" };
  if (!validEmail(b.email)) return { ok: false, error: "email" };
  if (b.consent !== true) return { ok: false, error: "consent" };
  const locale: Locale = b.locale === "fr" ? "fr" : "en";
  const page = typeof b.page === "string" && /^\/[\w\-/.%]*$/.test(b.page) && b.page.length <= 200 ? b.page : "/";
  return { ok: true, value: { email: (b.email as string).trim().toLowerCase(), consent: true, locale, page } };
}

/** The JSON the webhook receives: everything needed to prove consent, nothing more. */
export function subscribePayload(v: SubscribeInput, now = new Date()) {
  return {
    type: "newsletter.subscribe",
    list: NEWSLETTER_LIST,
    newsletter: SITE.newsletter.name[v.locale],
    email: v.email,
    locale: v.locale,
    consent: {
      given: true,
      method: "unticked checkbox, ticked by the subscriber",
      text: consentText(v.locale),
      version: CONSENT_VERSION,
      at: now.toISOString(),
      page: v.page,
    },
    sender: senderLine(v.locale),
    site: SITE.domain,
  };
}

export type TipInput = { message: string; name: string; contact: string; locale: Locale; page: string };

export const TIP_MAX = 5000;

export function parseTip(body: unknown): { ok: true; value: TipInput } | { ok: false; error: "message" | "contact" | "bot" | "bad" } {
  if (!body || typeof body !== "object") return { ok: false, error: "bad" };
  const b = body as Record<string, unknown>;
  if (typeof b.website === "string" && b.website.trim() !== "") return { ok: false, error: "bot" };
  const message = typeof b.message === "string" ? b.message.trim() : "";
  if (message.length < 20 || message.length > TIP_MAX) return { ok: false, error: "message" };
  const contact = typeof b.contact === "string" ? b.contact.trim() : "";
  if (contact && (contact.length > 254 || (contact.includes("@") && !validEmail(contact)))) return { ok: false, error: "contact" };
  const name = typeof b.name === "string" ? b.name.trim().slice(0, 120) : "";
  const locale: Locale = b.locale === "fr" ? "fr" : "en";
  const page = typeof b.page === "string" && /^\/[\w\-/.%]*$/.test(b.page) && b.page.length <= 200 ? b.page : "/tips";
  return { ok: true, value: { message, name, contact: contact.slice(0, 254), locale, page } };
}

export function tipPayload(v: TipInput, now = new Date()) {
  return { type: "newsroom.tip", at: now.toISOString(), locale: v.locale, page: v.page, name: v.name || null, contact: v.contact || null, message: v.message, site: SITE.domain };
}
