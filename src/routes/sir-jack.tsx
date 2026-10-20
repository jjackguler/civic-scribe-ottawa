import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { OriginalCard } from "@/components/Originals";
import { NextCase } from "@/components/SirJack";
import { NewsletterBox } from "@/components/NewsletterBox";
import { AdSlot } from "@/components/AdSlot";
import { getOriginalsFast, useOriginals } from "@/lib/originals";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { SIR_JACK_SEASONS, caseNumber, isSirJack, videoLd, type Original } from "@/lib/originals-types";
import { seoHead, publisherRef } from "@/lib/seo";

const cases = (items: Original[]) =>
  items.filter(isSirJack).sort((a, b) => (caseNumber(b) ?? 0) - (caseNumber(a) ?? 0) || b.publishedAt.localeCompare(a.publishedAt));

export const Route = createFileRoute("/sir-jack")({
  loader: () => getOriginalsFast(),
  head: ({ match, loaderData }) => {
    const latest = cases(loaderData?.items ?? [])[0];
    return seoHead(match, {
      title: { en: `The Sir Jack Files: film-noir AI investigations — ${SITE.name}`, fr: `Les dossiers Sir Jack : enquêtes IA façon film noir — ${SITE.name}` },
      description: {
        en: "A detective series about AI and the people it touches. Each case is built from named reporting, checked against it, and closed in about a minute.",
        fr: "Une série policière sur l'IA et les personnes qu'elle touche. Chaque affaire repose sur des reportages nommés, vérifiée, et close en une minute environ.",
      },
      image: latest?.posterUrl,
      imageWidth: latest?.posterUrl ? 1080 : undefined,
      imageHeight: latest?.posterUrl ? 1920 : undefined,
      jsonLd: (_l, url) => [{ "@context": "https://schema.org", "@type": "ItemList", name: "The Sir Jack Files", itemListElement: cases(loaderData?.items ?? []).slice(0, 30).map((o, i) => ({ "@type": "ListItem", position: i + 1, item: videoLd(o, url, publisherRef) })) }],
    });
  },
  component: SirJackPage,
});

function SirJackPage() {
  const initial = Route.useLoaderData();
  const { data } = useOriginals(initial);
  const { locale } = useLocale();
  const fr = locale === "fr";
  const all = cases(data?.items ?? []);
  const specials = all.filter(o => o.aspect === "16:9");
  const latest = all.filter(o => o.aspect !== "16:9")[0];

  return (
    <PageShell>
      <section className="bg-night text-white">
        <div className="container-mw py-12 sm:py-16 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] items-center">
          <div>
            <p className="text-brass font-bold text-[0.8rem] tracking-[0.22em] uppercase">{fr ? "Une série originale d'AI Broadsheet" : "An AI Broadsheet original series"}</p>
            <h1 className="masthead-serif text-[2.8rem] sm:text-[4.2rem] leading-[0.98] mt-3">{fr ? "Les dossiers Sir Jack" : "The Sir Jack Files"}</h1>
            <div className="h-[3px] w-24 bg-[#D9412B] mt-5" aria-hidden="true" />
            <p className="font-serif text-[1.2rem] sm:text-[1.35rem] leading-relaxed text-white/85 mt-5 max-w-[46ch]">
              {fr
                ? "La pluie sur la ville, et une question sur toutes les lèvres. Sir Jack rouvre les affaires de l'IA : qui l'a fait, à qui, et ce que vous pouvez faire ce soir. Chaque affaire repose sur des reportages nommés et se referme en une minute."
                : "Rain on the city, and a question on everybody's lips. Sir Jack opens the AI cases: who did it, to whom, and what you can do tonight. Every case is built from named reporting and closed in about a minute."}
            </p>
            <p className="text-white/60 text-[0.9rem] mt-4">
              {fr ? `${all.length} affaires classées · nouvelle affaire chaque jour où l'actualité l'exige` : `${all.length} cases closed · a new case whenever the news calls for one`}
            </p>
          </div>
          <div className="grid gap-5">
            <NextCase variant="card" />
            {latest && (
              <div className="grid grid-cols-[minmax(0,220px)_minmax(0,1fr)] gap-5 items-start">
                <OriginalCard o={latest} />
                <div className="pt-2">
                  <p className="text-brass font-bold text-[0.78rem] tracking-[0.18em] uppercase">{fr ? "Dernière affaire" : "Latest case"}</p>
                  <p className="masthead-serif text-[1.5rem] leading-tight mt-1">{latest.title.replace(/^the sir jack files[^:]*:\s*/i, "")}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {specials.length > 0 && (
        <section className="container-mw mt-10">
          <h2 className="masthead-serif text-[1.9rem]">{fr ? "Éditions spéciales" : "Special editions"}</h2>
          <p className="font-serif text-[1.05rem] text-muted-foreground mb-5 max-w-3xl">{fr ? "Des enquêtes de quatre minutes en bande dessinée animée, tirées des dossiers judiciaires." : "Four-minute motion-comic investigations, built from court records."}</p>
          <div className="grid gap-x-6 gap-y-10 grid-cols-2 lg:grid-cols-4">
            {specials.map(o => <OriginalCard key={o.id} o={o} />)}
          </div>
        </section>
      )}

      <AdSlot size="leaderboard" placement="section" className="container-mw mt-8" />

      <section className="container-mw mt-10">
        {SIR_JACK_SEASONS.map(season => {
          const shelf = all.filter(o => { const n = caseNumber(o) ?? 0; return o.aspect !== "16:9" && n >= season.from && n <= season.to; });
          if (!shelf.length) return null;
          return (
            <div key={season.n} id={`season-${season.n}`} className="mb-14 scroll-mt-24">
              <h2 className="masthead-serif text-[1.9rem]">{fr ? season.fr : season.en}</h2>
              <p className="font-serif text-[1.05rem] text-muted-foreground mb-5 max-w-3xl">{fr ? season.dekFr : season.dekEn}</p>
              <div className="grid gap-x-6 gap-y-10 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {shelf.map(o => <OriginalCard key={o.id} o={o} />)}
              </div>
            </div>
          );
        })}
      </section>

      <section className="bg-night text-white mt-6">
        <div className="container-mw py-12">
          <NewsletterBox variant="band" />
        </div>
      </section>

      <section className="container-mw mt-12 grid gap-10 md:grid-cols-2 max-w-6xl">
        <div>
          <h2 className="masthead-serif text-[1.6rem] mb-2">{fr ? "Le code de Sir Jack" : "Sir Jack's code"}</h2>
          <ul className="font-serif text-[1.08rem] leading-relaxed list-disc pl-5 space-y-1.5">
            <li>{fr ? "Chaque nom, chiffre et citation vient d'une source nommée, listée à la fin de la vidéo." : "Every name, number and quote comes from a named source, listed at the end of the video."}</li>
            <li>{fr ? "Les estimations sont dites « environ » ; les contestations sont attribuées." : "Estimates are said as estimates; disputes are attributed."}</li>
            <li>{fr ? "Voix synthétique d'un catalogue (jamais une voix clonée), illustrations dessinées en code : les silhouettes ne représentent pas les personnes de l'affaire." : "A stock synthetic voice (never a clone) and illustrations drawn in code: silhouettes never depict the people in the case."}</li>
            <li>{fr ? "Une erreur? Elle est corrigée en public." : "A mistake? It's corrected in public."} <Link to="/corrections" className="text-lake font-semibold hover:underline">{fr ? "Corrections" : "Corrections"}</Link></li>
          </ul>
        </div>
        <div className="border-t-[3px] border-brass bg-surface p-6">
          <p className="text-[0.8rem] font-bold tracking-[0.18em] uppercase text-muted-foreground">{fr ? "Partenariat" : "Partnership"}</p>
          <h2 className="masthead-serif text-[1.6rem] mt-1">{fr ? "Présentez la prochaine saison" : "Present the next season"}</h2>
          <p className="font-serif text-[1.05rem] leading-relaxed mt-2">
            {fr
              ? "Un seul partenaire par saison, nommé au générique de chaque affaire et sur cette page. Le partenaire ne choisit ni les affaires ni les conclusions."
              : "One partner per season, named in the opening of every case and on this page. Partners never choose the cases or the conclusions."}
          </p>
          <Link to="/advertise" className="inline-flex mt-4 h-11 items-center px-5 rounded-[4px] bg-night text-white font-bold hover:bg-ink">{fr ? "Demander le dossier média" : "Get the media kit"}</Link>
        </div>
      </section>
    </PageShell>
  );
}
