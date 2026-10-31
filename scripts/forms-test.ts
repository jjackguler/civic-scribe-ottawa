/**
 * Reader forms (newsletter sign-up, tip line): validation and the consent record.
 *   npx tsx scripts/forms-test.ts   (no network, no credentials)
 */
import assert from "node:assert/strict";
import { consentText, parseSubscribe, parseTip, subscribePayload, CONSENT_VERSION, senderLine } from "../src/lib/forms";
import { forward } from "../src/lib/forms.server";

const ok = parseSubscribe({ email: " Reader@Example.CA ", consent: true, locale: "fr", page: "/story/abc" });
assert.ok(ok.ok);
if (ok.ok) {
  assert.equal(ok.value.email, "reader@example.ca");
  const p = subscribePayload(ok.value, new Date("2026-10-31T12:00:00Z"));
  assert.equal(p.consent.text, consentText("fr"), "the record carries the exact French wording");
  assert.equal(p.consent.version, CONSENT_VERSION);
  assert.equal(p.consent.at, "2026-10-31T12:00:00.000Z");
  assert.equal(p.locale, "fr");
  assert.ok(!("ip" in p), "no IP address is forwarded");
}
assert.deepEqual(parseSubscribe({ email: "x@y.ca", consent: "true" }), { ok: false, error: "consent" }, "consent must be literally true");
assert.deepEqual(parseSubscribe({ email: "x@y.ca" }), { ok: false, error: "consent" }, "no pre-ticked default");
assert.deepEqual(parseSubscribe({ email: "not-an-email", consent: true }), { ok: false, error: "email" });
assert.deepEqual(parseSubscribe({ email: "x@y.ca", consent: true, website: "spam.example" }), { ok: false, error: "bot" });
assert.equal((parseSubscribe({ email: "x@y.ca", consent: true, page: "javascript:alert(1)" }) as { value: { page: string } }).value.page, "/");

for (const l of ["en", "fr"] as const) {
  const c = consentText(l);
  assert.match(c, /GEN:A Labs/, "consent names the sender");
  assert.match(c, /hello@aibroadsheet\.com/, "consent gives a contact");
  assert.match(c, l === "fr" ? /retirer mon consentement/ : /withdraw my consent/, "consent says it can be withdrawn");
  assert.match(senderLine(l), /Ottawa/);
}

assert.deepEqual(parseTip({ message: "short" }), { ok: false, error: "message" });
assert.ok(parseTip({ message: "A city service started using an AI chatbot last week.", contact: "" }).ok);
assert.deepEqual(parseTip({ message: "A city service started using an AI chatbot last week.", contact: "bad@" }), { ok: false, error: "contact" });

// Without the webhook secret the route must report "unconfigured" (→ 503), never pretend success.
delete process.env.SUBSCRIBE_WEBHOOK_URL;
assert.equal(await forward("SUBSCRIBE_WEBHOOK_URL", {}), "unconfigured");
process.env.SUBSCRIBE_WEBHOOK_URL = "http://insecure.example.com/hook";
assert.equal(await forward("SUBSCRIBE_WEBHOOK_URL", {}), "unconfigured", "only https webhooks are used");
delete process.env.SUBSCRIBE_WEBHOOK_URL;

console.log("forms-test: ok");
