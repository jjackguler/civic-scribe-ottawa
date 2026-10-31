import { useId, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight, Check, Mail } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { consentText, senderLine, unsubscribeText, validEmail } from "@/lib/forms";
import { stripFr } from "@/lib/seo";

type Variant = "band" | "card" | "inline" | "page";
type Status = "idle" | "sending" | "done" | "closed" | "error" | "rate";

/**
 * The Canadian AI Brief sign-up (weekly, EN/FR).
 *
 * - Explicit consent: an unticked checkbox with the exact consent wording (CASL),
 *   the sender's identity and the unsubscribe promise, all visible before sending.
 * - First party: POST /api/subscribe forwards the record to the owner's webhook.
 *   Nothing is kept in the browser. If a provider URL is set in site.ts, the reader
 *   is sent to the provider's own page instead (the original path).
 * - While sign-ups are closed (no webhook yet) it says so and offers an email
 *   that carries the same consent wording.
 */
export function NewsletterBox({ variant = "band" }: { variant?: Variant }) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const id = useId();
  const page = useRouterState({ select: s => stripFr(s.location.pathname) });
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [problem, setProblem] = useState<"" | "email" | "consent">("");
  const dark = variant === "band" || variant === "card";
  const name = SITE.newsletter.name[locale];
  const provider = SITE.newsletter.url;

  const mailto = `mailto:${SITE.email.general}?subject=${encodeURIComponent(fr ? `Abonnement : ${name}` : `Subscribe: ${name}`)}&body=${encodeURIComponent(`${consentText(locale)}\n\n${fr ? "Adresse" : "Address"}: ${email}`)}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validEmail(email)) { setProblem("email"); return; }
    if (!consent) { setProblem("consent"); return; }
    setProblem("");
    if (provider) {
      const url = new URL("/subscribe", provider);
      url.searchParams.set("email", email.trim());
      window.open(url.toString(), "_blank", "noopener");
      setStatus("done");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), consent: true, locale, page, website }),
      });
      if (res.ok) { setStatus("done"); setEmail(""); setConsent(false); return; }
      setStatus(res.status === 503 ? "closed" : res.status === 429 ? "rate" : "error");
    } catch {
      setStatus("error");
    }
  };

  const tone = dark
    ? { kicker: "text-brass", body: "text-white/80", small: "text-white/70", input: "bg-white text-ink placeholder:text-muted-ink border-white", box: "border-white/25", link: "text-white underline hover:text-brass", btn: "bg-brass text-night hover:bg-white" }
    : { kicker: "text-lake", body: "text-ink/85", small: "text-muted-ink", input: "bg-surface text-ink placeholder:text-muted-ink border-ink/40", box: "border-line", link: "text-lake underline hover:text-ink", btn: "bg-ink text-white hover:bg-lake" };

  const intro = (
    <div>
      <p className={`kicker ${dark ? "text-brass" : ""}`}>{fr ? "Infolettre hebdomadaire · gratuite" : "Weekly newsletter · free"}</p>
      <h2 className={`hl mt-1.5 ${variant === "band" || variant === "page" ? "text-[1.9rem] sm:text-[2.3rem]" : "text-[1.45rem]"}`}>{name}</h2>
      <p className={`font-serif leading-relaxed mt-2 max-w-[54ch] ${tone.body} ${variant === "card" ? "text-[0.98rem]" : "text-[1.08rem]"}`}>
        {fr
          ? "Une fois par semaine : ce qui a changé en IA, ce que cela signifie pour le Canada, et d'où viennent les faits. Sources nommées, travail assisté par l'IA signalé."
          : "Once a week: what changed in AI, what it means for Canada, and where each fact comes from. Sources named, AI-assisted work labelled."}
      </p>
    </div>
  );

  if (status === "done") {
    return (
      <div className={variant === "band" ? "grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center" : ""}>
        {intro}
        <p role="status" className={`mt-4 flex items-start gap-3 font-semibold ${dark ? "text-white" : "text-ink"}`}>
          <Check className="h-5 w-5 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{provider
            ? (fr ? "Terminez votre inscription dans l'onglet du fournisseur qui vient de s'ouvrir." : "Finish signing up in the provider's tab that just opened.")
            : (fr ? "C'est noté. Surveillez votre boîte : le premier numéro vous dira comment confirmer ou vous désabonner." : "You're on the list. Watch your inbox: the first issue explains how to confirm or unsubscribe.")}</span>
        </p>
      </div>
    );
  }

  return (
    <div className={variant === "band" ? "grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-start" : ""}>
      {intro}
      <form onSubmit={submit} noValidate className={variant === "band" ? "" : "mt-5"} aria-describedby={`${id}-sender`}>
        <label htmlFor={`${id}-email`} className={`block text-[0.9rem] font-semibold ${dark ? "text-white" : "text-ink"}`}>{fr ? "Votre adresse courriel" : "Your email address"}</label>
        <div className={`mt-1.5 flex flex-col gap-2 ${variant === "card" ? "" : "sm:flex-row"}`}>
          <input
            id={`${id}-email`}
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={e => { setEmail(e.target.value); if (problem === "email") setProblem(""); }}
            aria-invalid={problem === "email" || undefined}
            aria-describedby={problem === "email" ? `${id}-err` : undefined}
            placeholder={fr ? "vous@exemple.ca" : "you@example.ca"}
            className={`flex-1 min-w-0 h-12 px-4 rounded-[4px] border ${tone.input}`}
          />
          <button type="submit" disabled={status === "sending"} className={`h-12 px-5 rounded-[4px] font-bold inline-flex items-center justify-center gap-2 disabled:opacity-70 ${tone.btn}`}>
            {status === "sending" ? (fr ? "Envoi…" : "Sending…") : (fr ? "M'abonner" : "Subscribe")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>Website <input tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} name="website" /></label>
        </div>
        <div className={`mt-3 flex items-start gap-3 rounded-[4px] border p-3 ${tone.box} ${problem === "consent" ? (dark ? "border-brass!" : "border-live!") : ""}`}>
          <input
            id={`${id}-consent`}
            type="checkbox"
            checked={consent}
            onChange={e => { setConsent(e.target.checked); if (problem === "consent") setProblem(""); }}
            aria-invalid={problem === "consent" || undefined}
            aria-describedby={problem === "consent" ? `${id}-err` : undefined}
            className="mt-1 h-5 w-5 shrink-0 accent-[var(--lake)]"
          />
          <label htmlFor={`${id}-consent`} className={`text-[0.86rem] leading-snug ${tone.body}`}>{consentText(locale)}</label>
        </div>
        <p id={`${id}-err`} role="alert" className={`text-[0.88rem] font-semibold mt-2 ${dark ? "text-brass" : "text-live"} ${problem ? "" : "sr-only"}`}>
          {problem === "email" ? (fr ? "Entrez une adresse courriel valide." : "Enter a valid email address.") : problem === "consent" ? (fr ? "Cochez la case pour confirmer votre consentement." : "Tick the box to confirm your consent.") : ""}
        </p>
        <div role="status" aria-live="polite">
          {status === "closed" && (
            <p className={`mt-3 text-[0.92rem] ${dark ? "text-white" : "text-ink"}`}>
              {fr ? "Les inscriptions ouvrent avec le numéro 1. D'ici là, " : "Sign-ups open with issue #1. Until then, "}
              <a href={mailto} className={`font-semibold inline-flex items-center gap-1 ${tone.link}`}><Mail className="h-4 w-4" aria-hidden="true" />{fr ? "écrivez-nous pour être sur la liste" : "email us to be on the list"}</a>.
            </p>
          )}
          {(status === "error" || status === "rate") && (
            <p className={`mt-3 text-[0.92rem] ${dark ? "text-white" : "text-ink"}`}>
              {status === "rate" ? (fr ? "Trop d'essais. Réessayez dans quelques minutes, ou " : "Too many tries. Try again in a few minutes, or ") : (fr ? "L'envoi n'a pas fonctionné. Réessayez, ou " : "That didn't go through. Try again, or ")}
              <a href={mailto} className={`font-semibold ${tone.link}`}>{fr ? "écrivez-nous" : "email us"}</a>.
            </p>
          )}
        </div>
        <p id={`${id}-sender`} className={`text-[0.8rem] mt-3 leading-snug ${tone.small}`}>
          {fr ? "Expéditeur : " : "Sent by: "}{senderLine(locale)}. {unsubscribeText(locale)}{" "}
          <Link to="/privacy" hash="newsletter" className={tone.link}>{fr ? "Confidentialité" : "Privacy"}</Link>
        </p>
      </form>
    </div>
  );
}

/** Compact promo that links to /newsletter (for tight spots where a full form would crowd the page). */
export function NewsletterPromo({ className = "" }: { className?: string }) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  return (
    <Link to="/newsletter" className={`group block border border-ink/80 bg-surface p-4 hover:bg-paper ${className}`}>
      <p className="kicker">{fr ? "Infolettre hebdomadaire" : "Weekly newsletter"}</p>
      <p className="hl text-[1.2rem] mt-1 group-hover:underline">{SITE.newsletter.name[locale]}</p>
      <p className="text-[0.9rem] text-muted-ink mt-1">{fr ? "Ce qui a changé en IA cette semaine, pour le Canada." : "What changed in AI this week, for Canada."}</p>
    </Link>
  );
}
