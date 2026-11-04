/**
 * Trust furniture used across the paper: the AI label, breadcrumbs, the trust
 * bar under the front page, editorial stamps and the publisher line.
 */
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import type { Bi } from "@/lib/i18n";
import { STAMP_HELP, STAMP_LABEL, type Stamp } from "@/lib/studio-schema";

/**
 * The one label every AI-assisted item carries. `kind` adds what kind of help:
 * - "assisted": drafted with AI, approved by an editor (Studio, newsroom)
 * - "summary": AI-assisted summary of other outlets' reporting
 * - "headline": headline/brief written by the AI desk from publishers' text
 * - "translated": machine translation
 */
export function AiBadge({
  kind = "assisted",
  dark = false,
  className = "",
}: {
  kind?: "assisted" | "summary" | "headline" | "translated";
  dark?: boolean;
  className?: string;
}) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const text = {
    assisted: fr ? "Assisté par l'IA" : "AI-assisted",
    summary: fr ? "Résumé assisté par l'IA" : "AI-assisted summary",
    headline: fr ? "Titre du pupitre IA" : "AI desk headline",
    translated: fr ? "Traduit par l'IA" : "AI translation",
  }[kind];
  return (
    <span className={`ai-badge ${dark ? "ai-badge--dark" : ""} ${className}`}>
      <i aria-hidden="true">AI</i>
      {text}
    </span>
  );
}

export type Crumb = { label: string; to?: string; search?: Record<string, string>; hash?: string };

/** Visible breadcrumb trail (the JSON-LD twin comes from seoHead's `breadcrumbs`). */
export function Breadcrumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  const { locale } = useLocale();
  const all: Crumb[] = [{ label: locale === "fr" ? "À la une" : "Front page", to: "/" }, ...items];
  return (
    <nav
      aria-label={locale === "fr" ? "Fil d'Ariane" : "Breadcrumb"}
      className={`text-[0.82rem] text-muted-ink ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
        {all.map((c, i) => (
          <Fragment key={`${c.label}-${i}`}>
            <li className="min-w-0">
              {c.to && i < all.length - 1 ? (
                <Link
                  to={c.to as never}
                  search={c.search as never}
                  hash={c.hash}
                  className="hover:text-ink hover:underline"
                >
                  {c.label}
                </Link>
              ) : (
                <span
                  aria-current={i === all.length - 1 ? "page" : undefined}
                  className={i === all.length - 1 ? "text-ink font-semibold line-clamp-1" : ""}
                >
                  {c.label}
                </span>
              )}
            </li>
            {i < all.length - 1 && (
              <li aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
            )}
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

const TRUST: { t: Bi; to: string; hash?: string }[] = [
  {
    t: { en: "Every source named and linked", fr: "Chaque source nommée et liée" },
    to: "/standards",
  },
  {
    t: { en: "AI-assisted work is labelled", fr: "Le travail assisté par l'IA est signalé" },
    to: "/how-we-use-ai",
  },
  { t: { en: "Corrections made in public", fr: "Corrections publiques" }, to: "/corrections" },
];

/** A thin promise strip: what readers can hold us to, each linked to the policy behind it. */
export function TrustBar({ className = "" }: { className?: string }) {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  return (
    <section
      aria-label={fr ? "Nos engagements" : "Our commitments"}
      className={`border-y border-line ${className}`}
    >
      <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 py-3 text-[0.86rem]">
        {TRUST.map((x) => (
          <li key={x.to}>
            <Link
              to={x.to as never}
              hash={x.hash}
              className="inline-flex items-center gap-2 font-semibold text-ink hover:text-lake hover:underline"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-lake" aria-hidden="true" />
              {pick(x.t)}
            </Link>
          </li>
        ))}
        <li className="sm:ml-auto text-muted-ink">
          <PublishedBy />
        </li>
      </ul>
    </section>
  );
}

/** "Published by GEN:A Labs, Ottawa", linked to buildgena.ca. */
export function PublishedBy({
  className = "",
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  const { locale } = useLocale();
  const link = (
    <a
      href={SITE.publisher.url}
      rel="noopener"
      className={`font-semibold underline decoration-1 underline-offset-2 ${dark ? "text-white hover:text-brass" : "text-ink hover:text-lake"}`}
    >
      {SITE.publisher.name}
    </a>
  );
  return locale === "fr" ? (
    <span className={className}>
      Publié par {link}, {SITE.publisher.city}
    </span>
  ) : (
    <span className={className}>
      Published by {link}, {SITE.publisher.city}
    </span>
  );
}

const STAMP_TONE: Record<Stamp, string> = {
  CHECKED: "text-spruce",
  "COMPANY CLAIM": "text-live",
  "NOT YET PROVEN": "text-brass-ink",
};

export function StampMark({ s }: { s: Stamp }) {
  const { pick } = useLocale();
  return (
    <span className={`stamp ${STAMP_TONE[s]}`} title={pick(STAMP_HELP[s])}>
      {pick(STAMP_LABEL[s])}
    </span>
  );
}

/** Stamps with their meaning spelled out (the title tooltip alone is not accessible enough). */
export function StampLegend({ stamps }: { stamps: Stamp[] }) {
  const { pick } = useLocale();
  if (!stamps.length) return null;
  return (
    <ul className="grid gap-2.5">
      {stamps.map((s) => (
        <li key={s} className="flex items-start gap-3">
          <span className="shrink-0 pt-0.5">
            <StampMark s={s} />
          </span>
          <span className="text-[0.92rem] text-muted-ink leading-snug">{pick(STAMP_HELP[s])}</span>
        </li>
      ))}
    </ul>
  );
}

/** Kicker + optional label row above a headline. */
export function KickerRow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`flex flex-wrap items-center gap-x-2.5 gap-y-1.5 ${className}`}>{children}</p>
  );
}
