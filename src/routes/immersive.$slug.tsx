import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Compass, Monitor, Play } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { PanoViewer } from "@/components/PanoViewer";
import { ShareBar } from "@/components/ShareBar";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { seoHead, publisherRef } from "@/lib/seo";
import { caseBySlug, type Film, type ImmersiveCase, type Still } from "@/lib/immersive";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/immersive/$slug")({
  loader: ({ params }) => {
    if (!caseBySlug(params.slug)) throw notFound();
    return { slug: params.slug };
  },
  head: ({ match, params }) => {
    const c = caseBySlug(params.slug);
    if (!c)
      return seoHead(match, { title: SITE.name, description: SITE.description, noindex: true });
    return seoHead(match, {
      title: `${c.title}: an immersive case file — ${SITE.name}`,
      description: c.dek,
      image: c.og,
      imageWidth: 1200,
      imageHeight: 630,
      imageAlt: c.heroAlt,
      type: "article",
      jsonLd: (_l, url) => [
        {
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: c.title,
          headline: c.title,
          description: c.dek,
          url,
          image: c.og,
          inLanguage: "en",
          dateModified: c.updated,
          publisher: publisherRef,
          about: c.question,
          isAccessibleForFree: true,
          video: [c.walkthrough, c.launch, c.teaser].map((f) => ({
            "@type": "VideoObject",
            name: f.title,
            description: f.body,
            thumbnailUrl: f.poster,
            contentUrl: f.src,
            uploadDate: c.updated,
          })),
        },
      ],
    });
  },
  component: CasePage,
});

function CasePage() {
  const { slug } = Route.useLoaderData();
  const c = caseBySlug(slug)!;
  const { locale } = useLocale();

  return (
    <PageShell>
      <Hero c={c} fr={locale === "fr"} />

      <section className="container-mw mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div>
          <p className="text-brass-ink font-bold text-[0.78rem] tracking-[0.18em] uppercase">
            The question
          </p>
          <p className="masthead-serif text-[1.7rem] sm:text-[2.1rem] leading-[1.15] text-ink mt-2">
            {c.question}
          </p>
          <div className="mt-6 border-l-[3px] border-[#D9412B] pl-4">
            <p className="font-bold text-[0.8rem] tracking-[0.12em] uppercase text-ink">
              Before you begin
            </p>
            <p className="font-serif text-[1.05rem] leading-relaxed text-muted-ink mt-1">
              {c.contentNote}
            </p>
          </div>
        </div>
        <aside className="bg-surface border border-line p-5 sm:p-6 self-start">
          <dl className="grid gap-3 text-[0.92rem]">
            {c.facts.map((f) => (
              <div key={f.k} className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3">
                <dt className="text-muted-ink font-semibold">{f.k}</dt>
                <dd className="text-ink">{f.v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 pt-4 border-t border-line text-[0.85rem] text-muted-ink">
            <span className="inline-block bg-signal text-signal-ink font-bold text-[0.68rem] tracking-[0.12em] uppercase px-1.5 py-0.5 mr-1.5 align-[1px]">
              Prototype
            </span>
            {c.status.replace(/^Prototype\.\s*/, "")}
          </p>
        </aside>
      </section>

      <section id="walk" className="container-mw mt-16 scroll-mt-24">
        <FilmBlock f={c.walkthrough} eyebrow="Walkthrough" />
      </section>

      <Stops c={c} />

      <section className="bg-night text-white mt-16">
        <div className="container-mw py-12 sm:py-16">
          <FilmBlock f={c.launch} eyebrow="The launch film" dark />
          <StillGrid items={c.launchStills} dark />
        </div>
      </section>

      <section className="container-mw mt-16">
        <SectionTitle
          eyebrow="Real ground"
          title="Built on survey data and NASA's own models"
          dek="The ground comes from US Geological Survey lidar: the pad, flame trench, crawlerway, canals and shoreline are where they really are. The service towers come from NASA's Shuttle-era model."
        />
        <StillGrid items={c.terrain} />
      </section>

      <section className="container-mw mt-16">
        <FilmBlock f={c.teaser} eyebrow="Teaser" />
      </section>

      <section className="container-mw mt-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-start bg-surface border border-line p-6 sm:p-8">
          <div>
            <Monitor className="h-7 w-7 text-lake" aria-hidden="true" />
            <h2 className="masthead-serif text-[1.8rem] text-ink mt-3">The desktop edition</h2>
            <p className="font-serif text-[1.08rem] leading-relaxed text-muted-ink mt-2">
              {c.windows.body}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <KeyList title="Walk" items={c.windows.walk} />
            <KeyList title="Launch and time" items={c.windows.time} />
          </div>
        </div>
      </section>

      <section className="container-mw mt-16 mb-6 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="masthead-serif text-[1.6rem] text-ink">How this was made</h2>
          <ul className="font-serif text-[1.04rem] leading-relaxed list-disc pl-5 space-y-1.5 mt-3 text-ink">
            {c.howMade.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="masthead-serif text-[1.6rem] text-ink">Limits</h2>
          <ul className="font-serif text-[1.04rem] leading-relaxed list-disc pl-5 space-y-1.5 mt-3 text-ink">
            {c.limits.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2 border-t border-line pt-6">
          <h2 className="font-bold text-[0.8rem] tracking-[0.14em] uppercase text-muted-ink">
            Main sources
          </h2>
          <ul className="mt-2 grid gap-1 text-[0.95rem] text-ink sm:grid-cols-2">
            {c.sources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="mt-4 text-[0.9rem] text-muted-ink">
            Found an error?{" "}
            <Link to="/corrections" className="text-lake font-semibold hover:underline">
              Corrections
            </Link>{" "}
            ·{" "}
            <Link to="/standards" className="text-lake font-semibold hover:underline">
              Our standards
            </Link>
          </p>
        </div>
      </section>

      <section className="container-mw mb-16">
        <ShareBar url={`/immersive/${c.slug}`} title={c.title} campaign="immersive" />
      </section>
    </PageShell>
  );
}

function Hero({ c, fr }: { c: ImmersiveCase; fr: boolean }) {
  return (
    <section className="relative bg-black text-white overflow-hidden">
      <img
        src={c.hero}
        alt={c.heroAlt}
        className="absolute inset-0 h-full w-full object-cover opacity-80"
        fetchPriority="high"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,16,18,0.94)_0%,rgba(6,16,18,0.78)_38%,rgba(6,16,18,0.15)_75%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[rgba(6,16,18,0.9)] to-transparent"
        aria-hidden="true"
      />
      <div className="relative container-mw pt-8 pb-14 sm:pt-10 sm:pb-20 min-h-[560px] sm:min-h-[640px] flex flex-col">
        <Link
          to="/immersive"
          className="inline-flex items-center gap-1.5 text-white/75 hover:text-white text-[0.9rem] font-semibold self-start"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Immersive Journalism
        </Link>
        <div className="mt-auto max-w-[44rem]">
          <p className="text-brass font-bold text-[0.8rem] tracking-[0.22em] uppercase">
            {c.kicker}
          </p>
          <h1 className="masthead-serif text-[2.6rem] sm:text-[4.2rem] leading-[0.98] mt-3">
            {c.title}
          </h1>
          <div className="h-[3px] w-24 bg-[#D9412B] mt-5" aria-hidden="true" />
          <p className="font-serif text-[1.18rem] sm:text-[1.32rem] leading-relaxed text-white/90 mt-5">
            {c.dek}
          </p>
          <p className="text-white/60 text-[0.9rem] mt-3">
            {c.dateline}
            {fr ? " · Contenu en anglais" : ""}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#walk"
              className="inline-flex items-center gap-2 bg-signal text-signal-ink font-bold px-5 py-3 hover:brightness-95"
            >
              <Play className="h-4 w-4" aria-hidden="true" /> Watch the walkthrough
            </a>
            <a
              href="#stops"
              className="inline-flex items-center gap-2 border border-white/40 text-white font-bold px-5 py-3 hover:bg-white/10"
            >
              <Compass className="h-4 w-4" aria-hidden="true" /> Look around in 360°
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionTitle({
  eyebrow,
  title,
  dek,
  dark,
}: {
  eyebrow: string;
  title: string;
  dek?: string;
  dark?: boolean;
}) {
  return (
    <div className="mb-6 max-w-3xl">
      <p
        className={`${dark ? "text-brass" : "text-brass-ink"} font-bold text-[0.78rem] tracking-[0.18em] uppercase`}
      >
        {eyebrow}
      </p>
      <h2
        className={`masthead-serif text-[1.9rem] sm:text-[2.3rem] leading-[1.05] mt-1.5 ${dark ? "text-white" : "text-ink"}`}
      >
        {title}
      </h2>
      {dek && (
        <p
          className={`font-serif text-[1.08rem] leading-relaxed mt-2 ${dark ? "text-white/75" : "text-muted-ink"}`}
        >
          {dek}
        </p>
      )}
    </div>
  );
}

function FilmBlock({ f, eyebrow, dark }: { f: Film; eyebrow: string; dark?: boolean }) {
  return (
    <div id={dark ? "film" : undefined} className="scroll-mt-24">
      <SectionTitle eyebrow={eyebrow} title={f.title} dark={dark} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] items-start">
        <video
          controls
          playsInline
          preload="metadata"
          poster={f.poster}
          className="w-full aspect-video bg-black rounded-sm"
        >
          <source src={f.src} type="video/mp4" />
        </video>
        <div>
          <p
            className={`font-serif text-[1.04rem] leading-relaxed ${dark ? "text-white/80" : "text-muted-ink"}`}
          >
            {f.body}
          </p>
          <ul
            className={`mt-4 flex flex-wrap gap-2 text-[0.8rem] ${dark ? "text-white/70" : "text-muted-ink"}`}
          >
            {f.specs.map((s) => (
              <li
                key={s}
                className={`border px-2 py-0.5 ${dark ? "border-white/25" : "border-line"}`}
              >
                {s}
              </li>
            ))}
          </ul>
          <p className={`mt-4 text-[0.82rem] ${dark ? "text-white/55" : "text-muted-ink"}`}>
            Reconstruction rendered in Unreal Engine 5. Not archival footage. No sound.
          </p>
        </div>
      </div>
    </div>
  );
}

function StillGrid({ items, dark }: { items: Still[]; dark?: boolean }) {
  return (
    <div className="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((s) => (
        <figure key={s.src} className="min-w-0">
          <div className="aspect-[16/10] overflow-hidden bg-black">
            <img src={s.src} alt={s.alt} loading="lazy" className="h-full w-full object-cover" />
          </div>
          <figcaption
            className={`mt-2 text-[0.88rem] leading-snug ${dark ? "text-white/70" : "text-muted-ink"}`}
          >
            <strong className={dark ? "text-white font-semibold" : "text-ink font-semibold"}>
              {s.title}.
            </strong>{" "}
            {s.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function Stops({ c }: { c: ImmersiveCase }) {
  const [i, setI] = useState(0);
  const [mode, setMode] = useState<"360" | "film">("360");
  const st = c.stops[i];
  return (
    <section id="stops" className="bg-night text-white mt-16 scroll-mt-24">
      <div className="container-mw py-12 sm:py-16">
        <SectionTitle
          eyebrow={`${c.stops.length} stops · 360° and film`}
          title="Stand where people stood"
          dek="Pick a stop, then drag the view to look around or switch to its short film. The sun is where it was at 11:38 that morning. Nothing here shows the launch."
          dark
        />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] items-start">
          <div className="min-w-0">
            <div role="group" aria-label="View" className="inline-flex mb-3 border border-white/25">
              {(["360", "film"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={mode === m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "px-4 py-1.5 text-[0.88rem] font-bold",
                    mode === m ? "bg-signal text-signal-ink" : "text-white/80 hover:text-white",
                  )}
                >
                  {m === "360" ? "360° view" : "Film"}
                </button>
              ))}
            </div>
            {mode === "360" ? (
              <PanoViewer src={st.pano} label={st.name} />
            ) : (
              <video
                key={st.clip}
                controls
                autoPlay
                muted
                playsInline
                loop
                poster={st.poster}
                className="w-full aspect-[4/3] sm:aspect-video bg-black rounded-sm object-cover"
              >
                <source src={st.clip} type="video/mp4" />
              </video>
            )}
            <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <div>
                <p className="text-brass font-bold text-[0.78rem] tracking-[0.16em] uppercase">
                  Stop {i + 1} · {st.where}
                </p>
                <h3 className="masthead-serif text-[1.6rem] leading-tight mt-1">{st.name}</h3>
                <p className="font-serif text-[1.04rem] leading-relaxed text-white/80 mt-1.5">
                  {st.caption}
                </p>
              </div>
              <div className="text-[0.88rem] text-white/70">
                <p className="font-bold text-[0.72rem] tracking-[0.14em] uppercase text-white/55">
                  Estimated
                </p>
                <ul className="mt-1.5 grid gap-1.5">
                  {[
                    ...st.estimated,
                    "Structure positions and sizes proportioned from NASA photographs",
                  ].map((x) => (
                    <li key={x} className="border-l-2 border-white/25 pl-2.5">
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <ol
            aria-label="Stops"
            className="order-first lg:order-none flex lg:grid gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 lg:max-h-[640px] lg:overflow-y-auto"
          >
            {c.stops.map((x, j) => (
              <li key={x.id} className="shrink-0 w-[11rem] lg:w-auto">
                <button
                  type="button"
                  aria-current={i === j ? "true" : undefined}
                  onClick={() => setI(j)}
                  className={cn(
                    "w-full text-left grid lg:grid-cols-[96px_minmax(0,1fr)] gap-2 lg:gap-3 p-1.5 border transition-colors",
                    i === j ? "border-signal bg-white/10" : "border-white/10 hover:border-white/35",
                  )}
                >
                  <img
                    src={x.poster}
                    alt=""
                    loading="lazy"
                    className="w-full aspect-video object-cover bg-black"
                  />
                  <span className="min-w-0 self-center">
                    <span className="block text-[0.7rem] font-bold tracking-[0.12em] uppercase text-white/55">
                      {j + 1} · {x.where}
                    </span>
                    <span className="block text-[0.92rem] font-semibold leading-snug">
                      {x.name}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function KeyList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-bold text-[0.8rem] tracking-[0.14em] uppercase text-muted-ink">
        {title}
      </h3>
      <ul className="mt-2 grid gap-2 text-[0.95rem] text-ink">
        {items.map((x) => (
          <li key={x} className="border-l-2 border-brass pl-3">
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}
