import { ArrowUpRight } from "lucide-react";
import { useLocale } from "@/lib/locale-context";

/** Section heading used across the playable Labs pages: a night rule with a short signal tab. */
export function SectionHead({ id, title, kicker }: { id: string; title: string; kicker?: string }) {
  return (
    <div className="relative pt-3 border-t-[3px] border-night">
      <span className="absolute left-0 -top-[3px] h-[3px] w-14 bg-signal" aria-hidden="true" />
      {kicker && <p className="kicker mt-1">{kicker}</p>}
      <h2 id={id} className="masthead-serif text-[1.75rem] sm:text-[2.05rem] mt-1">{title}</h2>
    </div>
  );
}

/** A plain list of outside sources, each opening in a new tab. */
export function SourceList({ items }: { items: { title: string; url: string; note?: string }[] }) {
  const { locale } = useLocale();
  return (
    <ul className="mt-3 grid gap-2">
      {items.map(s => (
        <li key={s.url} className="text-[0.95rem]">
          <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-lake hover:underline">
            {s.title}<ArrowUpRight className="inline h-3.5 w-3.5 ml-0.5 -mt-0.5" aria-hidden="true" />
            <span className="sr-only">{locale === "fr" ? " (nouvel onglet)" : " (opens in a new tab)"}</span>
          </a>
          {s.note && <span className="text-muted-ink"> · {s.note}</span>}
        </li>
      ))}
    </ul>
  );
}
