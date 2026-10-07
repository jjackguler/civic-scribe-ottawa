import type { ReactNode } from "react";
import { useLocale } from "@/lib/locale-context";
import type { Bi } from "@/lib/i18n";

export type ProseSection = { id?: string; h: Bi; p: (Bi | ReactNode)[] };

const isBi = (x: unknown): x is Bi => !!x && typeof x === "object" && "en" in (x as object) && "fr" in (x as object);

/** Headed sections of plain prose, for legal and policy pages. */
export function ProseSections({ items }: { items: ProseSection[] }) {
  const { pick } = useLocale();
  return (
    <div className="container-mw mt-10 max-w-3xl">
      {items.map(i => (
        <section key={i.h.en} id={i.id} className="mb-9 scroll-mt-24">
          <h2 className="masthead-serif text-[1.5rem] leading-tight mb-2">{pick(i.h)}</h2>
          {i.p.map((x, k) => (
            <p key={k} className="font-serif text-[1.12rem] leading-relaxed mt-2 first:mt-0">{isBi(x) ? pick(x) : x}</p>
          ))}
        </section>
      ))}
    </div>
  );
}
