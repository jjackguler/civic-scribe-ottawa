import { Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { EditorialSubnav } from "@/components/editorial/EditorialPrimitives";
import { NewsImage } from "@/components/NewsImage";
import { useLocale } from "@/lib/locale-context";
import { getAuthor } from "@/lib/editorial-data";
import type { AnyEditorial, EditorialType } from "@/types/editorial";

const ROUTE_FOR: Record<EditorialType, string> = {
  news: "/article",
  interview: "/interviews",
  opinion: "/opinion",
  column: "/columns",
  analysis: "/analysis",
  essay: "/essays",
  cartoon: "/cartoons",
  satire: "/satire",
  "photo-essay": "/photo-essays",
  investigation: "/investigations",
  explainer: "/explainers",
  solution: "/solutions",
  "op-doc": "/op-docs",
  "community-voice": "/community-voices",
  letter: "/letters",
};

export function articleHref(a: AnyEditorial): string {
  if (a.type === "column") return `/columns/${(a as any).column_slug}/${a.slug}`;
  return `${ROUTE_FOR[a.type]}/${a.slug}`;
}

export function EditorialCard({ a, size = "md" }: { a: AnyEditorial; size?: "sm" | "md" | "lg" }) {
  const { locale } = useLocale();
  const authors = a.byline_author_ids.map(getAuthor).filter(Boolean);
  const sizes = {
    sm: "text-base", md: "text-2xl", lg: "text-3xl md:text-4xl",
  } as const;
  return (
    <Link to={articleHref(a) as any} className="group block">
      {a.hero && (
        <div className="mb-3 overflow-hidden">
          <NewsImage src={a.hero.src} headline={a.title.en} alt="" className="w-full aspect-[16/10] object-cover group-hover:scale-[1.02] transition-transform" />
        </div>
      )}
      <div className="kicker text-civic-red">{a.label}{a.neighborhood ? ` · ${a.neighborhood}` : ""}</div>
      <h3 className={`font-display ${sizes[size]} leading-tight mt-1 group-hover:text-civic-red`}>{a.title[locale]}</h3>
      <p className="font-serif text-base text-muted-foreground mt-2 line-clamp-3">{a.dek[locale]}</p>
      {authors.length > 0 && <div className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">By {authors.map(au => au!.name).join(", ")}</div>}
    </Link>
  );
}

export function SectionIndexPage({
  kicker, title, dek, items,
}: { kicker: string; title: string; dek: string; items: AnyEditorial[] }) {
  return (
    <PageShell>
      <EditorialSubnav />
      <PageHero kicker={kicker} title={title} dek={dek} />
      {items.length === 0 ? (
        <p className="font-serif text-muted-foreground">Nothing published yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {items.map(a => <EditorialCard key={a.slug} a={a} />)}
        </div>
      )}
    </PageShell>
  );
}
