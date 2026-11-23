import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { BOOKS } from "@/lib/books";

/**
 * "From the editor's shelf": The New Cave, shown in Labs at the owner's request (23 Nov 2026).
 * Same rules as /books: says plainly that the editor wrote it, facts from the listing only,
 * no ratings, reviews or superlatives, and no commission.
 */
export function BookShelf() {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const b = BOOKS[0];
  return (
    <div className="mt-6 grid gap-6 rounded-[10px] bg-night text-white p-5 sm:p-8 sm:grid-cols-[180px_1fr] items-start">
      <Link to="/books/$slug" params={{ slug: b.slug }} className="block">
        <img src={b.cover.src} alt={fr ? `Couverture de ${b.title}, de ${b.author}` : `Cover of ${b.title} by ${b.author}`} width={b.cover.width} height={b.cover.height} loading="lazy" className="w-[140px] sm:w-full h-auto rounded-[4px] shadow-xl" />
      </Link>
      <div>
        <p className="text-[0.85rem] font-semibold text-brass">{fr ? "Un livre de l'éditeur d'AI Broadsheet" : "A book by AI Broadsheet's editor"}</p>
        <h3 className="masthead-serif text-[2rem] leading-tight mt-1">{b.title}</h3>
        <p className="font-serif text-[1.15rem] text-white/80">{b.subtitle}</p>
        <p className="mt-4 text-[1.02rem] leading-relaxed text-white/85 max-w-[44rem]">{pick(b.description)}</p>
        <p className="mt-4 text-[1rem] leading-relaxed text-white/85 max-w-[44rem]">
          <strong className="text-white">{fr ? "Pourquoi ici : " : "Why it's here: "}</strong>
          {fr
            ? "Ce labo montre ce que l'IA peut faire pour apprendre. Le livre pose la question inverse : qu'arrive-t-il à une personne quand la réponse arrive toujours en premier? Une bonne lecture pour les enseignants, les parents et les élèves plus âgés qui utilisent ces outils."
            : "This lab shows what AI can do for learning. The book asks the opposite question: what happens to a person when the answer always arrives first? Worth reading for teachers, parents and older students who use these tools."}
        </p>
        <p className="meta !text-white/60 mt-3">{b.author} · {pick(b.format)} · {b.pages} {fr ? "pages" : "pages"} · {pick(b.aiNote)}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/books/$slug" params={{ slug: b.slug }} className="inline-flex items-center gap-2 rounded-[5px] bg-signal text-signal-ink font-bold px-4 py-2.5">{fr ? "À propos du livre" : "About the book"}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          {b.buy.map(x => (
            <a key={x.url} href={x.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-[5px] border border-white/40 px-4 py-2.5 font-semibold hover:border-white">
              {pick(x.label)}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /><span className="sr-only">{fr ? " (nouvel onglet)" : " (opens in a new tab)"}</span>
            </a>
          ))}
        </div>
        <p className="meta !text-white/50 mt-3">{fr ? "Divulgation : l'auteur est l'éditeur d'AI Broadsheet. Nous ne touchons aucune commission sur les ventes." : "Disclosure: the author is AI Broadsheet's editor. We earn no commission on sales."}</p>
      </div>
    </div>
  );
}

