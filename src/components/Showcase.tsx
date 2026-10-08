import { useState, type ReactNode } from "react";
import { ArrowUpRight, GitFork, MessageSquare, Play, Star, TrendingUp } from "lucide-react";
import type { PulsePayload, Trend } from "@/lib/pulse";
import { techTrends } from "@/lib/pulse";
import { useLocale } from "@/lib/locale-context";

const n = (x: number) => (x >= 1000 ? `${(x / 1000).toFixed(x >= 10000 ? 0 : 1)}k` : String(x));

/**
 * Made with AI: what people shipped this week. Three live sources, each item
 * credited to its maker and linked to where it was made.
 */
type Item = { key: string; href: string; title: string; desc?: string; meta: ReactNode; image?: string | null };

export function Showcase({ pulse, limit = 5 }: { pulse: PulsePayload; limit?: number }) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const cols: { id: string; title: string; sub: string; items: Item[] }[] = [
    {
      id: "built",
      title: fr ? "Construit avec l'IA" : "Built with AI",
      sub: fr ? "Les projets présentés sur Hacker News (Show HN), classés par votes." : "Projects their makers showed on Hacker News (Show HN), ranked by votes.",
      items: pulse.built.slice(0, limit).map(b => ({
        key: b.id, href: b.url, title: b.title, image: b.image,
        meta: (
          <>
            <span className="inline-flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />{b.points}</span>
            <a href={b.discussUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline"><MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />{b.comments}</a>
            {b.openSource && <span className="text-spruce font-semibold">{fr ? "Code source ouvert" : "Open source"}</span>}
          </>
        ),
      })),
    },
    {
      id: "repos",
      title: fr ? "Code ouvert en vogue" : "Open source rising",
      sub: fr ? "Nouveaux dépôts GitHub d'IA (2 dernières semaines), par étoiles." : "New AI repositories on GitHub (last two weeks), by stars.",
      items: pulse.repos.slice(0, limit).map(r => ({
        key: r.id, href: r.url, title: `${r.owner}/${r.name}`, desc: r.description, image: r.image,
        meta: (
          <>
            <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5" aria-hidden="true" />{n(r.stars)}</span>
            {r.language && <span>{r.language}</span>}
            {r.license && <span className="inline-flex items-center gap-1"><GitFork className="h-3.5 w-3.5" aria-hidden="true" />{r.license}</span>}
          </>
        ),
      })),
    },
    {
      id: "tools",
      title: fr ? "Claude Code et MCP" : "Claude Code & MCP",
      sub: fr ? "Nouveaux skills, serveurs MCP et outils d'agents sur GitHub (30 jours), par étoiles." : "New skills, MCP servers and agent tools on GitHub (last 30 days), by stars.",
      items: (pulse.tools ?? []).slice(0, limit).map(r => ({
        key: r.id, href: r.url, title: `${r.owner}/${r.name}`, desc: r.description, image: r.image,
        meta: (
          <>
            <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5" aria-hidden="true" />{n(r.stars)}</span>
            {r.language && <span>{r.language}</span>}
            {r.license && <span className="inline-flex items-center gap-1"><GitFork className="h-3.5 w-3.5" aria-hidden="true" />{r.license}</span>}
          </>
        ),
      })),
    },
  ];
  const shown = cols.filter(c => c.items.length > 0);

  if (shown.length === 0) return null;
  return (
    <div className="grid gap-x-8 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
      {shown.map(c => (
        <div key={c.id} className="min-w-0">
          <h3 className="font-bold text-[1.1rem] pb-1 border-b-2 border-night">{c.title}</h3>
          <p className="meta mt-1.5 mb-1">{c.sub}</p>
          <ol>
            {c.items.map((it, k) => (
              <li key={it.key} className="flex gap-3 py-3 border-b border-line last:border-0">
                <span className="masthead-serif text-[1.5rem] text-brass-ink w-6 shrink-0 leading-none mt-0.5" aria-hidden="true">{k + 1}</span>
                <Thumb src={it.image} label={it.title} />
                <div className="min-w-0 flex-1">
                  <a href={it.href} target="_blank" rel="noopener noreferrer" className="group font-semibold leading-snug hover:underline break-words">
                    {it.title}<ArrowUpRight className="inline h-3.5 w-3.5 ml-0.5 text-muted-ink group-hover:text-ink" aria-hidden="true" />
                  </a>
                  {it.desc && <p className="text-[0.92rem] text-muted-ink leading-snug mt-0.5 line-clamp-2">{it.desc}</p>}
                  <p className="meta mt-1 flex flex-wrap gap-x-3 gap-y-1 items-center">{it.meta}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

/** What Canada and the U.S. are searching, technology terms only (Google Trends). */
export function TrendsPanel({ pulse }: { pulse: PulsePayload }) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const regions: { id: "ca" | "us" | "world"; label: string; list: Trend[] }[] = [
    { id: "ca", label: "Canada", list: techTrends(pulse.trends.ca) },
    { id: "us", label: fr ? "États-Unis" : "United States", list: techTrends(pulse.trends.us) },
    { id: "world", label: fr ? "Les deux" : "Both", list: dedupe([...techTrends(pulse.trends.ca), ...techTrends(pulse.trends.us)]) },
  ];
  const first = regions.find(r => r.list.length > 0)?.id ?? null;
  const [tab, setTab] = useState<"ca" | "us" | "world" | null>(first);
  if (!first) return null;
  const active = regions.find(r => r.id === tab) ?? regions[0];

  return (
    <div className="border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-bold text-[1.1rem] flex items-center gap-2"><TrendingUp className="h-5 w-5 text-brass-ink" aria-hidden="true" />{fr ? "Ce que l'on cherche en techno" : "What people are searching in tech"}</h3>
        <div role="tablist" className="flex gap-1">
          {regions.map(r => (
            <button key={r.id} role="tab" aria-selected={r.id === active.id} disabled={r.list.length === 0} onClick={() => setTab(r.id)}
              className={`px-3 py-1 rounded-full text-sm font-semibold border ${r.id === active.id ? "bg-night text-white border-night" : "border-line hover:border-night disabled:opacity-40 disabled:hover:border-line"}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>
      {active.list.length === 0 ? (
        <p className="meta mt-3">{fr ? "Aucune recherche techno parmi les tendances pour le moment." : "No tech searches among the trends right now."}</p>
      ) : (
        <ul className="mt-3 grid gap-x-6 sm:grid-cols-2">
          {active.list.slice(0, 8).map(t => (
            <li key={t.term} className="py-2 border-b border-line">
              <p className="font-semibold capitalize">{t.term} <span className="meta font-normal normal-case">{t.traffic} {fr ? "recherches" : "searches"}</span></p>
              {t.newsTitle && t.newsUrl && (
                <a href={t.newsUrl} target="_blank" rel="noopener noreferrer" className="text-[0.9rem] text-muted-ink hover:underline line-clamp-1">
                  {t.newsTitle}{t.newsSource ? ` — ${t.newsSource}` : ""}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="meta mt-3">{fr ? "Source : Google Trends, recherches en hausse aujourd'hui." : "Source: Google Trends, searches rising today."}</p>
    </div>
  );
}

function dedupe(list: Trend[]) {
  const seen = new Set<string>();
  return list.filter(t => { const k = t.term.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
}

/** Small project image (GitHub card or the project's own share image); a yellow tile when there is none. */
export function Thumb({ src, label }: { src?: string | null; label: string }) {
  const [ok, setOk] = useState(true);
  return (
    <span className="w-[88px] self-start shrink-0 aspect-[16/10] overflow-hidden bg-signal text-signal-ink grid place-items-center" aria-hidden="true">
      {src && ok ? (
        <img src={src} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" className="img-cover" onError={() => setOk(false)} />
      ) : (
        <span className="masthead-serif text-[1.6rem] leading-none">{label.replace(/^[^A-Za-z0-9]+/, "").charAt(0).toUpperCase()}</span>
      )}
    </span>
  );
}
