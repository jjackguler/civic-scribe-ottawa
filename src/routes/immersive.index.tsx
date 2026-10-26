import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Box, Clock, FileSearch, Footprints } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";
import { CASES } from "@/lib/immersive";

export const Route = createFileRoute("/immersive/")({
  head: ({ match }) =>
    seoHead(match, {
      title: {
        en: `Immersive Journalism: walk into the record — ${SITE.name}`,
        fr: `Journalisme immersif : entrer dans le dossier — ${SITE.name}`,
      },
      description: {
        en: "Historic cases you can walk through: reconstructed places, explained mechanisms and the records behind every claim. First case: Challenger, 1986.",
        fr: "Des affaires historiques à parcourir : lieux reconstitués, mécanismes expliqués et les documents derrière chaque affirmation. Premier dossier : Challenger, 1986.",
      },
      image: CASES[0]?.og,
      imageWidth: 1200,
      imageHeight: 630,
    }),
  component: ImmersiveHub,
});

const PILLARS = [
  {
    icon: Footprints,
    title: "Walk the place",
    body: "Reconstructed sites you can move through, with every size marked as sourced or estimated.",
  },
  {
    icon: Box,
    title: "Take the mechanism apart",
    body: "Explanatory models that show how something worked, labelled as models, not footage.",
  },
  {
    icon: FileSearch,
    title: "Check the record",
    body: "Each claim links to the document behind it, with who could see it and when.",
  },
  {
    icon: Clock,
    title: "Turn the clock",
    body: "Switch between what was public that day, what was known inside, and what came out later.",
  },
];

function ImmersiveHub() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const lead = CASES[0];

  return (
    <PageShell>
      <section className="bg-night text-white">
        <div className="container-mw pt-12 pb-14 sm:pt-16 sm:pb-20">
          <p className="text-brass font-bold text-[0.8rem] tracking-[0.22em] uppercase">
            {fr ? "Journalisme immersif · AI Broadsheet" : "AI Broadsheet · Immersive Journalism"}
          </p>
          <h1 className="masthead-serif text-[2.8rem] sm:text-[4.4rem] leading-[0.98] mt-3 max-w-4xl">
            Step inside the record.
          </h1>
          <div className="h-[3px] w-24 bg-[#D9412B] mt-5" aria-hidden="true" />
          <p className="font-serif text-[1.2rem] sm:text-[1.35rem] leading-relaxed text-white/85 mt-5 max-w-[52ch]">
            Explore the scene. Examine the evidence. Our immersive cases rebuild a place and a
            moment in 3D, then hand you the documents, so you can see what was known, by whom, and
            when.
          </p>
          {fr && <p className="text-white/60 text-[0.9rem] mt-3">Contenu en anglais.</p>}
          <p className="text-white/55 text-[0.9rem] mt-5 italic">A new face of journalism.</p>
        </div>
      </section>

      {lead && (
        <section className="container-mw -mt-8 sm:-mt-10 relative">
          <Link
            to="/immersive/$slug"
            params={{ slug: lead.slug }}
            className="group grid lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] bg-surface border border-line shadow-[0_18px_50px_-24px_rgba(0,0,0,0.45)] overflow-hidden"
          >
            <div className="relative aspect-[16/9] lg:aspect-auto lg:min-h-[420px] bg-black overflow-hidden">
              <img
                src={lead.hero}
                alt={lead.heroAlt}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <span className="absolute left-4 top-4 bg-[#D9412B] text-white text-[0.72rem] font-bold tracking-[0.16em] uppercase px-2.5 py-1">
                Case 01 · Now open
              </span>
            </div>
            <div className="p-6 sm:p-8 flex flex-col">
              <p className="text-brass-ink font-bold text-[0.78rem] tracking-[0.18em] uppercase">
                {lead.kicker}
              </p>
              <h2 className="masthead-serif text-[2rem] sm:text-[2.4rem] leading-[1.02] mt-2 text-ink">
                {lead.title}
              </h2>
              <p className="dek text-[1.08rem] mt-3">{lead.dek}</p>
              <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-[0.86rem]">
                {lead.facts.slice(0, 4).map((f) => (
                  <div key={f.k}>
                    <dt className="text-muted-ink font-semibold uppercase tracking-[0.08em] text-[0.7rem]">
                      {f.k}
                    </dt>
                    <dd className="text-ink mt-0.5">{f.v}</dd>
                  </div>
                ))}
              </dl>
              <span className="mt-auto pt-6 inline-flex items-center gap-2 font-bold text-lake group-hover:underline">
                Open the case file <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
          </Link>
        </section>
      )}

      <section className="container-mw mt-16">
        <h2 className="masthead-serif text-[1.9rem] text-ink">How a case works</h2>
        <p className="dek mt-1 max-w-3xl">
          Every case is built the same way, so you always know what you are looking at.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <div key={p.title} className="border-t-[3px] border-brass pt-4">
              <p.icon className="h-6 w-6 text-lake" aria-hidden="true" />
              <h3 className="font-bold text-[1.1rem] mt-3 text-ink">{p.title}</h3>
              <p className="font-serif text-[1.02rem] leading-relaxed text-muted-ink mt-1.5">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-mw mt-16 mb-16 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <h2 className="masthead-serif text-[1.6rem] text-ink">Our rules for reconstruction</h2>
          <ul className="font-serif text-[1.06rem] leading-relaxed list-disc pl-5 space-y-1.5 mt-3 text-ink">
            <li>Reconstructions are labelled as reconstructions, never presented as footage.</li>
            <li>Every claim cites a named record; estimates are said to be estimates.</li>
            <li>
              People appear only as authors or subjects of records. We do not guess at motives or
              assign blame.
            </li>
            <li>Loss of life is stated plainly. Final moments are never shown or recreated.</li>
            <li>
              AI use is disclosed in each case, with what it did and what people still need to
              check.
            </li>
          </ul>
        </div>
        <div className="bg-night text-white p-6 sm:p-8 self-start">
          <p className="text-brass font-bold text-[0.78rem] tracking-[0.18em] uppercase">
            More cases
          </p>
          <p className="masthead-serif text-[1.5rem] leading-tight mt-2">
            The next case file is in production.
          </p>
          <p className="text-white/75 mt-2 text-[0.98rem]">
            Spotted an error in a case?{" "}
            <Link to="/corrections" className="text-brass font-semibold hover:underline">
              Tell us
            </Link>
            , and we correct it in public.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
