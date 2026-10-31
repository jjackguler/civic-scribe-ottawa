import { createFileRoute, Link } from "@tanstack/react-router";
import { useId, useState } from "react";
import { Mail } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Breadcrumbs, PublishedBy } from "@/components/Trust";
import { useLocale } from "@/lib/locale-context";
import type { Bi } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";

/**
 * Founding sponsors of The Canadian AI Brief. Only what exists: the weekly
 * newsletter launching with issue #1. No audience numbers until there are real
 * ones, and no packages that don't exist (display ads are off; see ads.ts).
 */
export const Route = createFileRoute("/advertise")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `Founding sponsors: The Canadian AI Brief — ${SITE.name}`, fr: `Commanditaires fondateurs : Le Brief canadien de l'IA — ${SITE.name}` },
      description: {
        en: "Sponsor The Canadian AI Brief from issue #1: one clearly labelled sponsor per weekly issue, in English and French, under published rules that keep our journalism independent.",
        fr: "Commanditez Le Brief canadien de l'IA dès le numéro 1 : un seul commanditaire identifié par numéro hebdomadaire, en anglais et en français, selon des règles publiées.",
      },
      breadcrumbs: [{ name: { en: "Founding sponsors", fr: "Commanditaires fondateurs" }, path: "/advertise" }],
    }),
  component: Advertise,
});

const GETS: { h: Bi; p: Bi }[] = [
  { h: { en: "One sponsor per issue", fr: "Un seul commanditaire par numéro" }, p: { en: "Your issue has no other sponsor. Your message appears once, set apart from the journalism and labelled “Founding sponsor”.", fr: "Votre numéro n'a aucun autre commanditaire. Votre message paraît une fois, séparé du contenu journalistique et identifié « Commanditaire fondateur »." } },
  { h: { en: "English and French", fr: "En anglais et en français" }, p: { en: "The message runs in both language editions. Send both versions, or we translate yours and you approve the result before it runs.", fr: "Le message paraît dans les deux éditions. Fournissez les deux versions, ou nous traduisons la vôtre et vous approuvez le résultat avant la diffusion." } },
  { h: { en: "A short, plain message", fr: "Un message court et clair" }, p: { en: "Your name or logo, a few sentences in your own words and one link. No tracking pixels: readers who click go straight to your page.", fr: "Votre nom ou logo, quelques phrases dans vos mots et un lien. Aucun pixel de suivi : les lecteurs qui cliquent arrivent directement sur votre page." } },
  { h: { en: "Named as a founding sponsor", fr: "Mention comme commanditaire fondateur" }, p: { en: "Founding sponsors are listed by name on the newsletter page, as supporters of the brief from its first issues.", fr: "Les commanditaires fondateurs sont nommés sur la page de l'infolettre, comme soutiens du brief dès ses premiers numéros." } },
  { h: { en: "Real numbers only", fr: "Des chiffres réels seulement" }, p: { en: "No issue has gone out yet, so we publish no audience figures. When you book, we tell you the real subscriber count that day; we never estimate.", fr: "Aucun numéro n'est encore parti; nous ne publions donc aucun chiffre d'audience. À la réservation, nous vous donnons le nombre réel d'abonnés ce jour-là; nous n'estimons jamais." } },
];

const RULES: Bi[] = [
  { en: "Sponsors never choose, change, review or preview our coverage, including coverage of the sponsor or its competitors.", fr: "Les commanditaires ne choisissent, ne modifient, ne révisent ni ne voient jamais notre couverture à l'avance, y compris sur eux-mêmes ou leurs concurrents." },
  { en: "If we report on a sponsor, the story says so.", fr: "Si nous traitons d'un commanditaire, l'article le mentionne." },
  { en: "Sponsor messages are labelled, look different from our journalism and never imitate a news item.", fr: "Les messages commandités sont identifiés, se distinguent de notre contenu journalistique et n'imitent jamais une nouvelle." },
  { en: "We never share subscribers' addresses or any reader data with sponsors.", fr: "Nous ne communiquons jamais les adresses des abonnés ni aucune donnée de lecteur aux commanditaires." },
  { en: "We decline political parties, candidates and campaigns, anything aimed at children, claims we can't check, and anything against our values.", fr: "Nous refusons les partis politiques, candidats et campagnes, tout ce qui vise les enfants, les affirmations invérifiables et tout ce qui va à l'encontre de nos valeurs." },
  { en: "The editor has the final word on whether a sponsor message runs.", fr: "Le responsable éditorial a le dernier mot sur la diffusion d'un message commandité." },
];

function Advertise() {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  return (
    <PageShell>
      <div className="container-mw pt-6"><Breadcrumbs items={[{ label: fr ? "Commanditaires fondateurs" : "Founding sponsors" }]} /></div>
      <header className="container-mw pt-6 pb-10 rule-under grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-end">
        <div>
          <p className="kicker">{fr ? "Commandites" : "Sponsorship"}</p>
          <h1 className="hl text-[2.5rem] sm:text-[3.4rem] mt-2">{fr ? `Commanditaires fondateurs du ${SITE.newsletter.name.fr}` : `Founding sponsors of ${SITE.newsletter.name.en}`}</h1>
          <p className="font-serif text-[1.25rem] leading-relaxed text-ink/80 mt-4 max-w-[58ch]">
            {fr
              ? "Notre infolettre hebdomadaire et bilingue sur l'IA au Canada commence avec le numéro 1. Nous cherchons quelques commanditaires fondateurs qui veulent soutenir un journalisme de l'IA indépendant et clairement sourcé, dès le départ."
              : "Our weekly, bilingual newsletter about AI in Canada starts with issue #1. We're looking for a few founding sponsors who want to support independent, clearly sourced AI journalism from the start."}
          </p>
        </div>
        <div className="bg-surface border border-line p-5">
          <p className="font-bold">{fr ? "Où nous en sommes" : "Where we are today"}</p>
          <ul className="mt-2 grid gap-1.5 text-[0.95rem] text-ink/85 list-disc pl-5">
            <li>{fr ? "Le numéro 1 est en préparation; aucun numéro n'a encore été envoyé." : "Issue #1 is in preparation; no issue has been sent yet."}</li>
            <li>{fr ? "Rythme : un numéro par semaine, en anglais et en français." : "Rhythm: one issue a week, in English and French."}</li>
            <li>{fr ? "Le site n'affiche aucune publicité payante aujourd'hui." : "The website carries no paid advertising today."}</li>
          </ul>
          <p className="mt-3 text-[0.88rem] text-muted-ink"><PublishedBy /></p>
        </div>
      </header>

      <section className="container-mw mt-12" aria-labelledby="gets">
        <h2 id="gets" className="hl text-[1.9rem]">{fr ? "Ce que reçoit un commanditaire fondateur" : "What a founding sponsor gets"}</h2>
        <ol className="mt-6 grid gap-x-10 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
          {GETS.map((g, i) => (
            <li key={g.h.en} className="border-t-2 border-ink pt-3">
              <p className="hl text-[1.5rem] text-brass-ink leading-none" aria-hidden="true">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="font-bold text-[1.1rem] mt-2">{pick(g.h)}</h3>
              <p className="font-serif text-[1.05rem] leading-relaxed text-ink/80 mt-1">{pick(g.p)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-mw mt-14" aria-labelledby="rules">
        <div className="bg-night text-white p-7 md:p-10 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)]">
          <div>
            <h2 id="rules" className="hl text-[1.9rem] text-white">{fr ? "Indépendance éditoriale" : "Editorial independence"}</h2>
            <p className="mt-3 text-white/80">{fr ? "Ces règles font partie de chaque entente." : "These rules are part of every agreement."}</p>
            <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-semibold">
              <Link to="/standards" className="text-brass underline">{fr ? "Nos normes" : "Our standards"}</Link>
              <Link to="/values" className="text-brass underline">{fr ? "Nos valeurs" : "Our values"}</Link>
            </p>
          </div>
          <ul className="grid gap-3">
            {RULES.map(r => (
              <li key={r.en} className="flex gap-3 font-serif text-[1.08rem] leading-relaxed text-white/90">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" aria-hidden="true" />{pick(r)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SponsorContact />
    </PageShell>
  );
}

/** Builds a structured email to the sponsorship inbox; nothing is sent from the site. */
function SponsorContact() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const id = useId();
  const [org, setOrg] = useState("");
  const [name, setName] = useState("");
  const [when, setWhen] = useState("");
  const [what, setWhat] = useState("");
  const to = SITE.email.advertise || SITE.email.general;
  const subject = fr ? `Commandite fondatrice : ${SITE.newsletter.name.fr}` : `Founding sponsorship: ${SITE.newsletter.name.en}`;
  const body = [
    `${fr ? "Organisation" : "Organisation"}: ${org}`,
    `${fr ? "Personne-ressource" : "Contact"}: ${name}`,
    `${fr ? "Numéros souhaités" : "Preferred issue(s)"}: ${when}`,
    "",
    `${fr ? "Ce que nous aimerions présenter" : "What we'd like to feature"}:`,
    what,
  ].join("\n");
  const href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const field = "w-full rounded-[4px] border border-ink/40 bg-surface px-3.5 py-2.5 text-ink placeholder:text-muted-ink";
  return (
    <section className="container-mw mt-14" aria-labelledby={`${id}-h`}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)]">
        <div>
          <h2 id={`${id}-h`} className="hl text-[1.9rem]">{fr ? "Parlons-en" : "Let's talk"}</h2>
          <p className="font-serif text-[1.08rem] leading-relaxed text-ink/80 mt-2">{fr ? "Remplissez ces champs : nous préparons un courriel que vous envoyez depuis votre propre messagerie. Le site ne conserve rien." : "Fill in these fields and we'll prepare an email you send from your own mail app. The site keeps nothing."}</p>
          <p className="mt-4"><a href={`mailto:${to}`} className="inline-flex items-center gap-2 text-lake font-semibold underline"><Mail className="h-4 w-4" aria-hidden="true" />{to}</a></p>
        </div>
        <form className="grid gap-4" onSubmit={e => { e.preventDefault(); window.location.href = href; }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor={`${id}-org`} className="block font-semibold">{fr ? "Organisation" : "Organisation"}</label><input id={`${id}-org`} value={org} onChange={e => setOrg(e.target.value)} autoComplete="organization" className={`${field} mt-1.5 h-12`} /></div>
            <div><label htmlFor={`${id}-name`} className="block font-semibold">{fr ? "Votre nom" : "Your name"}</label><input id={`${id}-name`} value={name} onChange={e => setName(e.target.value)} autoComplete="name" className={`${field} mt-1.5 h-12`} /></div>
          </div>
          <div><label htmlFor={`${id}-when`} className="block font-semibold">{fr ? "Numéro(s) souhaité(s)" : "Preferred issue(s)"}</label><input id={`${id}-when`} value={when} onChange={e => setWhen(e.target.value)} placeholder={fr ? "ex. le numéro 1, ou janvier" : "e.g. issue #1, or January"} className={`${field} mt-1.5 h-12`} /></div>
          <div><label htmlFor={`${id}-what`} className="block font-semibold">{fr ? "Ce que vous aimeriez présenter" : "What you'd like to feature"}</label><textarea id={`${id}-what`} value={what} onChange={e => setWhat(e.target.value)} rows={4} className={`${field} mt-1.5`} /></div>
          <div><button type="submit" className="h-12 px-6 rounded-[4px] bg-ink text-white font-bold hover:bg-lake inline-flex items-center gap-2"><Mail className="h-4 w-4" aria-hidden="true" />{fr ? "Préparer le courriel" : "Prepare the email"}</button></div>
        </form>
      </div>
    </section>
  );
}
