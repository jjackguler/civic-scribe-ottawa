import { Link } from "@tanstack/react-router";
import type { Author, EditorialLabel, AnyEditorial } from "@/types/editorial";
import { useLocale } from "@/lib/locale-context";
import { NewsImage } from "@/components/NewsImage";
import { getAuthor } from "@/lib/editorial-data";
import { Clock, MapPin, Share2, AlertCircle, BookOpen, Mic } from "lucide-react";
import { lettersCTAAllowed } from "@/lib/editorial-guards";

const LABEL_STYLE: Record<EditorialLabel, string> = {
  NEWS: "bg-ink text-paper",
  INTERVIEW: "bg-river text-paper",
  OPINION: "bg-civic-red text-paper",
  ANALYSIS: "bg-[color:var(--ink)] text-paper",
  CARTOON: "bg-[#3a2a4a] text-paper",
  SATIRE: "bg-[#b48a00] text-ink",
  LETTER: "bg-secondary text-ink border border-ink",
  INVESTIGATION: "bg-civic-red text-paper",
  EXPLAINER: "bg-river text-paper",
  SOLUTIONS: "bg-solution text-paper",
  "OP-DOC": "bg-ink text-paper",
  ESSAY: "bg-secondary text-ink border border-ink",
  "PHOTO ESSAY": "bg-ink text-paper",
  COLUMN: "bg-secondary text-ink border border-ink",
  "COMMUNITY VOICE": "bg-secondary text-ink border border-ink",
};

export function EditorialLabelChip({ label, className = "" }: { label: EditorialLabel; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${LABEL_STYLE[label]} ${className}`}>
      {label}
    </span>
  );
}

export function EditorialSubnav() {
  const items = [
    { to: "/editorial", label: "Editorial" },
    { to: "/interviews", label: "Interviews" },
    { to: "/opinion", label: "Opinion" },
    { to: "/columns", label: "Columns" },
    { to: "/analysis", label: "Analysis" },
    { to: "/essays", label: "Essays" },
    { to: "/investigations", label: "Long Reads" },
    { to: "/explainers", label: "Explainers" },
    { to: "/photo-essays", label: "Photo Essays" },
    { to: "/cartoons", label: "Cartoons" },
    { to: "/satire", label: "Satire" },
    { to: "/op-docs", label: "Op-Docs" },
    { to: "/community-voices", label: "Community" },
    { to: "/letters", label: "Letters" },
  ] as const;
  return (
    <nav className="border-y border-rule mb-8 overflow-x-auto">
      <ul className="flex items-center gap-1 py-2 text-[11px] uppercase tracking-[0.14em] min-w-max">
        {items.map(i => (
          <li key={i.to}>
            <Link
              to={i.to as any}
              className="px-3 py-1.5 font-semibold hover:text-civic-red whitespace-nowrap"
              activeProps={{ className: "text-civic-red underline underline-offset-4" }}
            >{i.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function AuthorChip({ author }: { author: Author }) {
  return (
    <Link to="/authors/$slug" params={{ slug: author.slug }} className="inline-flex items-center gap-2 group">
      <span className="block w-7 h-7 overflow-hidden rounded-full border border-rule">
        <NewsImage src={author.portrait_src || "newsprint:#2a2a2a"} headline={author.name} alt="" className="w-full h-full object-cover" />
      </span>
      <span className="text-sm font-semibold group-hover:text-civic-red">{author.name}</span>
    </Link>
  );
}

export function AuthorCard({ author, showDisclosure = true }: { author: Author; showDisclosure?: boolean }) {
  const { locale } = useLocale();
  return (
    <aside className="flex gap-4 p-5 bg-secondary border-l-4 border-ink">
      <div className="w-16 h-16 shrink-0 overflow-hidden rounded-full border border-rule">
        <NewsImage src={author.portrait_src || "newsprint:#2a2a2a"} headline={author.name} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1">
        <div className="kicker text-civic-red">{author.role.replace("-", " ")}</div>
        <Link to="/authors/$slug" params={{ slug: author.slug }} className="font-display text-xl hover:text-civic-red">
          {author.name}
        </Link>
        <p className="text-sm font-serif text-muted-foreground mt-1">{locale === "fr" ? author.bio_fr : author.bio_en}</p>
        {showDisclosure && author.disclosure && (
          <p className="text-xs italic mt-2 text-muted-foreground"><strong className="not-italic uppercase tracking-wider text-[10px]">Disclosure:</strong> {author.disclosure}</p>
        )}
      </div>
    </aside>
  );
}

export function ArticleHeader({ article }: { article: AnyEditorial }) {
  const { locale } = useLocale();
  const authors = article.byline_author_ids.map(getAuthor).filter(Boolean) as Author[];
  const published = new Date(article.publishedAt);
  const updated = article.updatedAt ? new Date(article.updatedAt) : null;
  const fmt = (d: Date) => d.toLocaleString(locale === "fr" ? "fr-CA" : "en-CA", { dateStyle: "long" });
  return (
    <header>
      <div className="flex items-center gap-3 mb-4">
        <EditorialLabelChip label={article.label} />
        {article.neighborhood && <span className="text-xs uppercase tracking-wider text-muted-foreground">{article.neighborhood}</span>}
      </div>
      <h1 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight">{article.title[locale]}</h1>
      <p className="font-serif text-xl md:text-2xl text-muted-foreground mt-4 leading-snug">{article.dek[locale]}</p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 rule-bottom rule-top py-3 text-sm">
        <div className="flex items-center gap-3 flex-wrap">
          {authors.map(a => <AuthorChip key={a.id} author={a} />)}
        </div>
        {article.read_minutes && (
          <span className="text-muted-foreground inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{article.read_minutes} min</span>
        )}
        {article.neighborhood && <span className="text-muted-foreground inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{article.neighborhood}</span>}
        <span className="text-muted-foreground">{fmt(published)}</span>
        {updated && <span className="text-civic-red">Updated {fmt(updated)}</span>}
        <button className="ml-auto inline-flex items-center gap-1 text-xs uppercase tracking-wider font-semibold hover:text-civic-red"><Share2 className="h-3.5 w-3.5" />Share</button>
      </div>
    </header>
  );
}

export function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="border-l-4 border-civic-red pl-6 py-2 my-10 font-display text-2xl md:text-3xl leading-snug italic">
      "{children}"
    </blockquote>
  );
}

export function SectionDivider({ label }: { label?: string }) {
  return (
    <div className="my-10 flex items-center gap-4">
      <div className="h-px bg-rule flex-1" />
      {label && <span className="kicker text-muted-foreground">{label}</span>}
      <div className="h-px bg-rule flex-1" />
    </div>
  );
}

export function EditorNote({ children }: { children: React.ReactNode }) {
  return (
    <section className="mt-8 p-5 border border-rule flex items-start gap-3 bg-paper">
      <AlertCircle className="h-5 w-5 text-civic-red shrink-0 mt-0.5" />
      <div className="text-sm font-serif">
        <strong className="font-sans uppercase text-xs tracking-wider">Editor's note</strong>
        <div className="mt-1">{children}</div>
      </div>
    </section>
  );
}

export function SourcesList({ sources }: { sources?: { label: string; url?: string }[] }) {
  if (!sources?.length) return null;
  return (
    <section className="mt-10 p-5 bg-secondary">
      <h3 className="kicker text-civic-red mb-3">Sources</h3>
      <ul className="space-y-1 text-sm font-serif">
        {sources.map((s, i) => <li key={i}>· {s.url ? <a href={s.url} className="underline">{s.label}</a> : s.label}</li>)}
      </ul>
    </section>
  );
}

export function MethodologyBox({ children }: { children: React.ReactNode }) {
  return (
    <aside className="mt-10 p-6 border-2 border-ink bg-paper">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="h-4 w-4" />
        <h3 className="kicker">Methodology</h3>
      </div>
      <div className="text-sm font-serif leading-relaxed">{children}</div>
    </aside>
  );
}

export function CorrectionsBox({ corrections }: { corrections?: { at: string; note: { en: string; fr: string } }[] }) {
  const { locale } = useLocale();
  if (!corrections?.length) return null;
  return (
    <section className="mt-8 p-5 border border-civic-red">
      <h3 className="kicker text-civic-red mb-2">Corrections</h3>
      <ul className="space-y-1 text-sm font-serif">
        {corrections.map((c, i) => <li key={i}><strong>{new Date(c.at).toLocaleDateString()}:</strong> {c.note[locale]}</li>)}
      </ul>
    </section>
  );
}

export function LettersCTA({ article }: { article: AnyEditorial }) {
  if (!lettersCTAAllowed(article)) return null;
  return (
    <section className="mt-8 p-5 bg-secondary flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex-1">
        <div className="kicker text-civic-red">Letters to the Editor</div>
        <p className="text-sm font-serif mt-1">Have a response? We publish moderated letters from readers.</p>
      </div>
      <Link to="/letters" className="bg-ink text-paper px-4 py-2 text-xs uppercase tracking-wider font-semibold whitespace-nowrap">Write a letter</Link>
    </section>
  );
}

export function DonationInlineCTA() {
  return (
    <section className="mt-8 p-6 border-2 border-civic-red text-center">
      <div className="kicker text-civic-red">Support this work</div>
      <h3 className="font-display text-2xl mt-2">Independent civic journalism, paid for by readers.</h3>
      <Link to="/donate" className="inline-flex mt-4 bg-civic-red text-white px-6 py-2.5 text-xs uppercase tracking-wider font-semibold">Donate</Link>
    </section>
  );
}

export function RelatedRail({ slugs }: { slugs?: string[] }) {
  // Simplified: just renders nothing if none; placeholder for cross-link rail.
  if (!slugs?.length) return null;
  return (
    <section className="mt-10">
      <h3 className="kicker mb-3">Related</h3>
      <ul className="text-sm font-serif list-disc pl-5 space-y-1">
        {slugs.map(s => <li key={s}>{s}</li>)}
      </ul>
    </section>
  );
}

export function MediaPlaceholder({ kind, label }: { kind: "audio" | "video"; label: string }) {
  const Icon = kind === "audio" ? Mic : Mic;
  return (
    <div className="mt-6 p-5 bg-secondary border border-rule flex items-center gap-3">
      <Icon className="h-5 w-5 text-civic-red" />
      <div className="text-sm font-serif">
        <strong className="uppercase tracking-wider text-xs">{kind === "audio" ? "Audio" : "Video"} — coming soon</strong>
        <div className="text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
