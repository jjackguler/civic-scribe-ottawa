/**
 * "From our desk": Buildgena Studio pieces (editor-approved, AI-assisted) on
 * lists and the front page. Renders nothing until a piece has been approved.
 */
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AiBadge, StampMark } from "./Trust";
import { keepNames } from "./Dispatch";
import { useLocale } from "@/lib/locale-context";
import { STUDIO, studioFor, studioDate, readingMinutes, type StudioDispatch } from "@/lib/studio";

/** Link to a piece in its own language: English at /desk/<id>, French at /fr/desk/<id>. */
export function StudioLink({
  p,
  className,
  children,
}: {
  p: StudioDispatch;
  className?: string;
  children: React.ReactNode;
}) {
  const { locale } = useLocale();
  if (p.lang === locale)
    return (
      <Link to="/desk/$id" params={{ id: p.id }} className={className}>
        {children}
      </Link>
    );
  return (
    <a
      href={p.lang === "fr" ? `/fr/desk/${p.id}` : `/desk/${p.id}`}
      hrefLang={p.lang}
      className={className}
    >
      {children}
    </a>
  );
}

export function StudioCard({
  p,
  size = "card",
}: {
  p: StudioDispatch;
  size?: "lead" | "card" | "row";
}) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const other = p.lang !== locale;
  return (
    <article className="group" lang={other ? (p.lang === "fr" ? "fr-CA" : "en-CA") : undefined}>
      <StudioLink p={p} className="block">
        {p.cover && size !== "row" && (
          <div className="aspect-[16/9] overflow-hidden bg-ice mb-3">
            <img src={p.cover} alt="" loading="lazy" decoding="async" className="img-cover" />
          </div>
        )}
        <p className="flex flex-wrap items-center gap-2">
          <span className="kicker">{fr ? "De notre pupitre" : "From our desk"}</span>
          <AiBadge />
          {other && (
            <span className="text-[0.75rem] font-semibold text-muted-ink">
              {p.lang === "fr" ? "En français" : "In English"}
            </span>
          )}
        </p>
        <h3
          className={`hl mt-2 text-ink group-hover:underline decoration-1 underline-offset-4 ${size === "lead" ? "text-[1.9rem] sm:text-[2.3rem]" : size === "row" ? "text-[1.12rem]" : "text-[1.35rem]"}`}
        >
          {keepNames(p.title)}
        </h3>
        {size !== "row" && (
          <p className="font-serif text-[1.05rem] leading-snug text-ink/80 mt-2 line-clamp-3">
            {p.dek}
          </p>
        )}
      </StudioLink>
      <p className="meta mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span>
          {fr ? "Approuvé par" : "Approved by"}{" "}
          <span className="font-semibold text-ink">{p.approvedBy}</span>
        </span>
        <span aria-hidden="true">·</span>
        <time dateTime={p.approvedAt}>{studioDate(p.approvedAt, locale)}</time>
        <span aria-hidden="true">·</span>
        <span>{readingMinutes(p.body)} min</span>
      </p>
      {size === "lead" && p.stamps.length > 0 && (
        <p className="mt-3 flex flex-wrap gap-2">
          {p.stamps.map((s) => (
            <StampMark key={s} s={s} />
          ))}
        </p>
      )}
    </article>
  );
}

/** Front-page / story-page module. `exclude` leaves out the piece being read. */
export function FromOurDesk({
  className = "",
  limit = 4,
  exclude,
}: {
  className?: string;
  limit?: number;
  exclude?: string;
}) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const items = studioFor(locale, STUDIO)
    .filter((p) => p.id !== exclude)
    .slice(0, limit);
  if (items.length === 0) return null;
  const [lead, ...rest] = items;
  return (
    <section className={className} aria-labelledby="from-our-desk">
      <div className="flex items-end justify-between gap-3 border-t-2 border-ink pt-3 mb-5">
        <div>
          <h2 id="from-our-desk" className="hl text-[1.7rem] sm:text-[2rem]">
            {fr ? "De notre pupitre" : "From our desk"}
          </h2>
          <p className="text-[0.92rem] text-muted-ink mt-1">
            {fr
              ? "Rédigés avec l'aide de l'IA, vérifiés et approuvés par un responsable éditorial, sources à l'appui."
              : "Drafted with AI assistance, checked and approved by an editor, with every source listed."}
          </p>
        </div>
        <Link
          to="/desk"
          className="shrink-0 inline-flex items-center gap-1 text-[0.9rem] font-semibold text-lake hover:underline"
        >
          {fr ? "Tout voir" : "See all"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div
        className={`grid gap-x-8 gap-y-8 ${rest.length ? "lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]" : ""}`}
      >
        <StudioCard p={lead} size="lead" />
        {rest.length > 0 && (
          <ul className="grid content-start divide-y divide-line border-y border-line">
            {rest.map((p) => (
              <li key={p.id} className="py-4">
                <StudioCard p={p} size="row" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
