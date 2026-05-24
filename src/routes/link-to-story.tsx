import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { EDITORIAL_DRAFTS, SUBMITTED_LINKS, NEIGHBORHOODS, type Platform } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import { useState } from "react";
import { Link2, ShieldCheck, Check, X, Loader2, Users, HelpCircle, FileText } from "lucide-react";

export const Route = createFileRoute("/link-to-story")({
  head: () => ({ meta: [
    { title: "Link → Story — From a public link to a verified draft" },
    { name: "description", content: "Paste a public link from X, Instagram, TikTok, Facebook, Reddit, YouTube or a local blog. The Ledger turns it into a structured editorial draft with a verification checklist." },
    { property: "og:title", content: "Link → Story — Ottawa Civic Ledger" },
    { property: "og:description", content: "Citizen journalism workflow with editorial verification." },
  ] }),
  component: LinkToStoryPage,
});

const detectPlatform = (url: string): Platform => {
  const u = url.toLowerCase();
  if (u.includes("x.com") || u.includes("twitter.com")) return "x";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("facebook.com")) return "facebook";
  if (u.includes("reddit.com")) return "reddit";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  return "blog";
};

function LinkToStoryPage() {
  const { locale } = useLocale();
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [hood, setHood] = useState("");
  const [draft, setDraft] = useState<null | { url: string; platform: Platform; hood: string; note: string }>(null);

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setDraft({ url: url.trim(), platform: detectPlatform(url), hood, note });
  };

  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Lien → Article" : "Link → Story"}
        title={locale === "fr" ? "D'un lien public à un article vérifié." : "From a public link to a verified story."}
        dek={locale === "fr"
          ? "Collez un lien X, Instagram, TikTok, Facebook, Reddit, YouTube, ou d'un blogue local. Nous générons un brouillon structuré avec liste de vérification."
          : "Paste a public link from X, Instagram, TikTok, Facebook, Reddit, YouTube, or a local blog. We generate a structured draft with a verification checklist."}
      />

      <form onSubmit={handle} className="bg-card border border-rule p-6 mb-10">
        <label className="kicker text-civic-red flex items-center gap-2"><Link2 className="h-4 w-4" />{locale === "fr" ? "Collez un lien public" : "Paste a public link"}</label>
        <div className="grid sm:grid-cols-[1fr_220px] gap-3 mt-3">
          <input
            value={url} onChange={e => setUrl(e.target.value)}
            placeholder="https://x.com/... or https://reddit.com/r/ottawa/..."
            className="bg-paper border border-rule px-4 py-3 font-mono text-sm focus:outline-none focus:border-civic-red"
          />
          <select value={hood} onChange={e => setHood(e.target.value)} className="bg-paper border border-rule px-3 py-3 text-sm focus:outline-none focus:border-civic-red">
            <option value="">{locale === "fr" ? "Quartier (facultatif)" : "Neighborhood (optional)"}</option>
            {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <textarea
          value={note} onChange={e => setNote(e.target.value)} maxLength={500}
          placeholder={locale === "fr" ? "Pourquoi est-ce d'intérêt public ?" : "Why is this in the public interest?"}
          className="mt-3 w-full bg-paper border border-rule px-4 py-3 font-serif text-sm focus:outline-none focus:border-civic-red min-h-[80px]"
        />
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
          <p className="text-[11px] text-muted-foreground italic">
            {locale === "fr" ? "Aucun contenu privé. Les liens publics seulement." : "Public links only. No private content."}
          </p>
          <button className="bg-civic-red text-white px-5 py-2.5 text-xs uppercase tracking-wider font-semibold hover:bg-ink transition-colors">
            {locale === "fr" ? "Générer le brouillon" : "Generate draft"}
          </button>
        </div>
      </form>

      {draft && <GeneratedDraft draft={draft} />}

      <section className="mb-12">
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="kicker text-civic-red">{locale === "fr" ? "Liens soumis" : "Submitted links"}</span>
            <h2 className="font-display text-2xl mt-1">{locale === "fr" ? "File éditoriale" : "Editorial queue"}</h2>
          </div>
        </div>
        <div className="bg-card border border-rule divide-y divide-rule">
          {SUBMITTED_LINKS.map(s => (
            <div key={s.id} className="p-4 grid sm:grid-cols-[1fr_auto] gap-3 items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="uppercase tracking-wider font-bold text-civic-red">{s.platform}</span>
                  <span>{s.neighborhood}</span>
                  <span>· {s.category}</span>
                  <span>· {new Date(s.submittedAt).toLocaleString(locale === "fr" ? "fr-CA" : "en-CA")}</span>
                </div>
                <a href={s.url} target="_blank" rel="noreferrer noopener" className="block truncate font-mono text-sm text-river hover:text-civic-red">
                  {s.url}
                </a>
                {s.note && <p className="font-serif text-sm mt-1 text-foreground/80">{s.note}</p>}
                <p className="text-[11px] text-muted-foreground mt-1">— {s.submittedBy}</p>
              </div>
              <span className={`shrink-0 text-[11px] uppercase tracking-wider px-2 py-1 font-bold ${
                s.status === "published" ? "bg-solution text-white" :
                s.status === "rejected" ? "bg-civic-red text-white" :
                s.status === "drafted" ? "bg-river text-white" :
                s.status === "in-review" ? "bg-highlight text-ink" :
                "bg-secondary text-foreground"
              }`}>{s.status}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="kicker text-civic-red">{locale === "fr" ? "Brouillons éditoriaux" : "Editorial drafts"}</span>
            <h2 className="font-display text-2xl mt-1">{locale === "fr" ? "En cours de vérification" : "In verification"}</h2>
          </div>
        </div>
        <div className="space-y-6">
          {EDITORIAL_DRAFTS.map(d => (
            <article key={d.id} className="bg-card border border-rule p-6">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="kicker text-civic-red">{d.category} · {d.neighborhood}</span>
                <span className={`text-[11px] uppercase tracking-wider px-2 py-1 font-bold ${
                  d.state === "ready" ? "bg-solution text-white" :
                  d.state === "needs-evidence" ? "bg-highlight text-ink" :
                  d.state === "published" ? "bg-ink text-paper" :
                  d.state === "rejected" ? "bg-civic-red text-white" :
                  "bg-secondary"
                }`}>{d.state}</span>
              </div>
              <h3 className="font-display text-2xl leading-snug">{d.headline[locale]}</h3>
              <p className="font-serif text-base mt-2 text-foreground/80">{d.summary[locale]}</p>

              <div className="grid md:grid-cols-2 gap-6 mt-5">
                <div>
                  <h4 className="kicker mb-2 flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-solution" />{locale === "fr" ? "Vérification" : "Verification"}</h4>
                  <ul className="space-y-1.5 font-serif text-sm">
                    {d.verificationChecklist.map((c, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className={`mt-0.5 w-4 h-4 inline-flex items-center justify-center border ${c.done ? "bg-solution border-solution text-white" : "border-rule"}`}>
                          {c.done && <Check className="h-3 w-3" />}
                        </span>
                        <span className={c.done ? "line-through text-muted-foreground" : ""}>{c.item[locale]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="kicker mb-2 flex items-center gap-1"><Users className="h-3 w-3 text-river" />{locale === "fr" ? "Qui contacter" : "Who to contact"}</h4>
                  <ul className="font-serif text-sm space-y-1">{d.whoToContact.map(c => <li key={c}>• {c}</li>)}</ul>

                  <h4 className="kicker mt-4 mb-2 flex items-center gap-1"><HelpCircle className="h-3 w-3 text-civic-red" />{locale === "fr" ? "Questions" : "Questions"}</h4>
                  <ol className="font-serif text-sm list-decimal pl-5 space-y-1">
                    {d.suggestedQuestions.map((q, i) => <li key={i}>{q[locale]}</li>)}
                  </ol>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 mt-5 text-sm">
                <div className="bg-secondary p-3">
                  <span className="kicker">{locale === "fr" ? "Intérêt public" : "Public interest"}</span>
                  <p className="font-serif mt-1">{d.publicInterest[locale]}</p>
                </div>
                <div className="bg-secondary p-3">
                  <span className="kicker">{locale === "fr" ? "Personnes touchées" : "Who is affected"}</span>
                  <p className="font-serif mt-1">{d.whoAffected[locale]}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-5 rule-top pt-4">
                <button className="inline-flex items-center gap-1.5 bg-solution text-white px-3 py-1.5 text-xs uppercase tracking-wider font-semibold hover:bg-ink"><Check className="h-3.5 w-3.5" />{locale === "fr" ? "Publier" : "Publish"}</button>
                <button className="inline-flex items-center gap-1.5 bg-highlight text-ink px-3 py-1.5 text-xs uppercase tracking-wider font-semibold"><Loader2 className="h-3.5 w-3.5" />{locale === "fr" ? "Plus de preuves" : "Needs more evidence"}</button>
                <button className="inline-flex items-center gap-1.5 border border-civic-red text-civic-red px-3 py-1.5 text-xs uppercase tracking-wider font-semibold hover:bg-civic-red hover:text-white"><X className="h-3.5 w-3.5" />{locale === "fr" ? "Rejeter" : "Reject"}</button>
                <span className="ml-auto text-[11px] text-muted-foreground italic">{locale === "fr" ? "Assigné à" : "Assigned to"} {d.assignedTo}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

function GeneratedDraft({ draft }: { draft: { url: string; platform: Platform; hood: string; note: string } }) {
  const { locale } = useLocale();
  return (
    <section className="bg-secondary border-l-4 border-solution p-6 mb-12">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="h-4 w-4 text-solution" />
        <span className="kicker text-solution">{locale === "fr" ? "Brouillon généré" : "Draft generated"}</span>
      </div>
      <h3 className="font-display text-2xl">
        {locale === "fr" ? "Brouillon : " : "Draft: "}<span className="italic text-muted-foreground">"{draft.note || (locale === "fr" ? "Titre suggéré à confirmer" : "Suggested headline to confirm")}"</span>
      </h3>
      <dl className="grid sm:grid-cols-2 gap-4 mt-4 text-sm font-serif">
        <div><dt className="kicker">{locale === "fr" ? "Source" : "Source"}</dt><dd className="font-mono break-all text-river">{draft.url}</dd></div>
        <div><dt className="kicker">Platform</dt><dd className="uppercase">{draft.platform}</dd></div>
        <div><dt className="kicker">{locale === "fr" ? "Quartier" : "Neighborhood"}</dt><dd>{draft.hood || "—"}</dd></div>
        <div><dt className="kicker">{locale === "fr" ? "Statut" : "Status"}</dt><dd className="text-civic-red font-semibold">{locale === "fr" ? "Signal non vérifié — file de l'éditeur" : "Unverified signal — editor queue"}</dd></div>
      </dl>
      <div className="rule-top mt-5 pt-4">
        <span className="kicker">{locale === "fr" ? "Liste de vérification automatique" : "Automatic verification checklist"}</span>
        <ul className="font-serif text-sm space-y-1 mt-2">
          {[
            { en: "Original link archived (Wayback / internal capture)", fr: "Lien original archivé (Wayback / capture interne)" },
            { en: "Identify a second independent source", fr: "Trouver une seconde source indépendante" },
            { en: "Contact people or institutions named in the post", fr: "Contacter les personnes ou institutions nommées" },
            { en: "Check for misinformation patterns in related accounts", fr: "Vérifier les schémas de désinformation dans les comptes liés" },
            { en: "Public-interest review by section editor", fr: "Examen d'intérêt public par l'éditeur de section" },
          ].map((c, i) => (
            <li key={i} className="flex gap-2 items-start"><span className="w-4 h-4 border border-rule mt-0.5" />{c[locale]}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
