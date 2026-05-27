import { createFileRoute, Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { PageShell, PageHero } from "@/components/PageShell";
import { CANADA_GUIDE_SECTIONS, type CanadaCard, type CanadaSourceStatus } from "@/lib/guide-data";
import { useLocale } from "@/lib/locale-context";
import { ExternalLink, ShieldCheck, AlertTriangle, Users } from "lucide-react";

export const Route = createFileRoute("/guide/canada")({
  head: () => ({ meta: [
    { title: "Canada Guide — Newcomer essentials, health, taxes, housing, jobs" },
    { name: "description", content: "A practical Canada-wide guide with Ottawa-specific tips: SIN, OHIP, free tax clinics, tenant rights, $10/day childcare, school boards, free legal help." },
    { property: "og:title", content: "Canada Guide — Ottawa Civic Ledger" },
    { property: "og:description", content: "Bilingual, source-linked, last-updated newcomer and resident guides." },
  ]}),
  component: CanadaGuidePage,
});

const STATUS_STYLE: Record<CanadaSourceStatus, { en: string; fr: string; cls: string; Icon: any }> = {
  official:         { en: "Official source", fr: "Source officielle", cls: "bg-river/15 text-river border-river/30", Icon: ShieldCheck },
  verified:         { en: "Verified",        fr: "Vérifié",           cls: "bg-solution/15 text-solution border-solution/30", Icon: ShieldCheck },
  "review-pending": { en: "Review pending",  fr: "En revue",          cls: "bg-highlight/30 text-foreground border-highlight", Icon: AlertTriangle },
  community:        { en: "Community",       fr: "Communautaire",     cls: "bg-secondary text-foreground border-rule", Icon: Users },
};

function fmtDate(iso: string, locale: "en" | "fr") {
  try { return new Date(iso).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA", { month: "short", day: "numeric", year: "numeric" }); }
  catch { return iso; }
}

function CanadaGuideCard({ c }: { c: CanadaCard }) {
  const { locale } = useLocale();
  const Icon = (Icons as any)[c.icon] ?? Icons.BookOpen;
  const s = STATUS_STYLE[c.status];
  const SIcon = s.Icon;
  return (
    <article className="group bg-card border border-rule p-5 flex flex-col h-full hover:border-ink transition-colors">
      <div className="flex items-start gap-3">
        <div className="shrink-0 h-11 w-11 grid place-items-center bg-secondary group-hover:bg-civic-red group-hover:text-paper transition-colors">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg leading-tight">{c.title[locale]}</h3>
          <p className="text-sm font-serif text-muted-foreground mt-1.5 leading-snug">{c.blurb[locale]}</p>
        </div>
      </div>

      {c.ottawaTip && (
        <div className="mt-3 border-l-2 border-civic-red bg-civic-red/5 px-3 py-2">
          <div className="kicker text-civic-red text-[10px] mb-1">{locale === "fr" ? "Astuce Ottawa" : "Ottawa tip"}</div>
          <p className="text-[13px] font-serif leading-snug">{c.ottawaTip[locale]}</p>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-rule flex flex-wrap items-center gap-2 text-[11px]">
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 border ${s.cls} font-bold uppercase tracking-wider`}>
          <SIcon className="h-3 w-3" /> {s[locale]}
        </span>
        <span className="text-muted-foreground">
          {locale === "fr" ? "Maj " : "Updated "}{fmtDate(c.updated, locale)}
        </span>
        {c.source.url ? (
          <a href={c.source.url} target="_blank" rel="noopener noreferrer"
             className="ml-auto inline-flex items-center gap-1 font-semibold text-river hover:underline">
            {c.source.label} <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span className="ml-auto text-muted-foreground">{c.source.label}</span>
        )}
      </div>
    </article>
  );
}

function CanadaGuidePage() {
  const { locale } = useLocale();
  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Guide du Canada" : "Canada Guide"}
        title={locale === "fr" ? "Le Canada, expliqué simplement" : "Canada, explained plainly"}
        dek={locale === "fr"
          ? "Pour les nouveaux arrivants comme pour les résidents. Bilingue, pratique, avec sources officielles et astuces Ottawa."
          : "For newcomers and lifelong residents alike. Bilingual, practical, with official sources and Ottawa-specific tips."}
      />

      {/* Section nav */}
      <nav aria-label={locale === "fr" ? "Sections du guide" : "Guide sections"}
           className="sticky top-[110px] z-10 -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10 py-2 bg-paper/95 backdrop-blur rule-bottom mb-8">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {CANADA_GUIDE_SECTIONS.map(s => (
            <a key={s.id} href={`#${s.id}`}
               className="shrink-0 text-[11px] uppercase tracking-wider font-semibold border border-rule hover:border-ink hover:bg-ink hover:text-paper px-3 py-1.5 transition-colors">
              {s.kicker[locale]}
            </a>
          ))}
        </div>
      </nav>

      <div className="space-y-14">
        {CANADA_GUIDE_SECTIONS.map(section => (
          <section key={section.id} id={section.id} className="scroll-mt-32">
            <header className="mb-5">
              <div className="kicker text-civic-red mb-1">{section.kicker[locale]}</div>
              <h2 className="font-display text-3xl md:text-4xl leading-tight">{section.title[locale]}</h2>
              <p className="font-serif text-base text-muted-foreground mt-2 max-w-3xl">{section.dek[locale]}</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.cards.map(c => <CanadaGuideCard key={c.id} c={c} />)}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-16 bg-secondary p-6 grid md:grid-cols-2 gap-4 items-center">
        <div>
          <h3 className="font-display text-2xl">{locale === "fr" ? "Une information à corriger ou à ajouter ?" : "Something to correct or add?"}</h3>
          <p className="font-serif text-sm mt-2 text-foreground/80">
            {locale === "fr"
              ? "Notre rédaction vérifie chaque suggestion contre une source officielle avant publication."
              : "Our newsroom verifies every suggestion against an official source before publishing."}
          </p>
        </div>
        <div className="md:text-right">
          <Link to="/submit" className="inline-block border border-ink px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-ink hover:text-paper">
            {locale === "fr" ? "Soumettre une correction" : "Submit a correction"}
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
