import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { JOBS } from "@/lib/data";
import { JobCard } from "@/components/JobCard";
import { useLocale } from "@/lib/locale-context";
import { useMemo, useState } from "react";
import { t } from "@/lib/i18n";

const LANGS = ["all", "EN", "FR", "EN/FR"] as const;
const TYPES = ["all", "Full-time", "Part-time", "Contract"] as const;

export const Route = createFileRoute("/jobs")({
  head: () => ({ meta: [
    { title: "Jobs in Ottawa — Ottawa Civic Ledger" },
    { name: "description", content: "Local job board for Ottawa: bilingual, salary-disclosed, transparently labeled." },
    { property: "og:title", content: "Jobs in Ottawa" },
    { property: "og:description", content: "Work in Ottawa — clear, bilingual, transparent." },
  ] }),
  component: JobsPage,
});

function JobsPage() {
  const { locale } = useLocale();
  const [lang, setLang] = useState<(typeof LANGS)[number]>("all");
  const [type, setType] = useState<(typeof TYPES)[number]>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => JOBS.filter(j => {
    if (lang !== "all" && j.language !== lang) return false;
    if (type !== "all" && j.type !== type) return false;
    if (query && !`${j.title} ${j.company}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  }), [lang, type, query]);

  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Emplois" : "Jobs"}
        title={locale === "fr" ? "Du travail à Ottawa — clair, bilingue, transparent." : "Work in Ottawa — clear, bilingual, transparent."}
        dek={locale === "fr" ? "Salaires affichés, exigences linguistiques, et commandites clairement identifiées." : "Salaries shown, language requirements listed, and sponsored posts clearly labeled."}
      />

      <div className="rule-bottom rule-top py-4 mb-6 flex flex-wrap items-center gap-3">
        <FilterGroup label={locale === "fr" ? "Langue" : "Language"} options={[...LANGS]} value={lang} onChange={v => setLang(v as typeof lang)} />
        <FilterGroup label={locale === "fr" ? "Type" : "Type"} options={[...TYPES]} value={type} onChange={v => setType(v as typeof type)} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder", locale)}
          className="md:ml-auto bg-paper border border-rule px-3 py-2 text-sm font-serif focus:outline-none focus:border-civic-red flex-1 min-w-[200px] md:max-w-xs"
        />
      </div>

      <p className="kicker text-muted-foreground mb-4">{filtered.length} {t("resultsCount", locale)}</p>

      {filtered.length === 0 ? (
        <p className="font-serif italic text-muted-foreground py-10 text-center">{t("noResults", locale)}</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(j => <JobCard key={j.id} job={j} />)}
        </div>
      )}

      <section className="mt-12 p-6 bg-secondary max-w-3xl border-l-4 border-civic-red">
        <h3 className="font-display text-2xl">{locale === "fr" ? "Publier un poste" : "Post a role"}</h3>
        <p className="font-serif text-sm mt-2 text-foreground/80">{locale === "fr" ? "Les revenus du babillard financent le journalisme local." : "Job board revenue funds local reporting."}</p>
      </section>
    </PageShell>
  );
}

function FilterGroup({ label, options, value, onChange }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="kicker text-muted-foreground hidden sm:inline">{label}</span>
      <div className="inline-flex border border-rule">
        {options.map(o => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-semibold transition-colors ${value === o ? "bg-ink text-paper" : "hover:bg-secondary"}`}
          >
            {o === "all" ? "All" : o}
          </button>
        ))}
      </div>
    </div>
  );
}
