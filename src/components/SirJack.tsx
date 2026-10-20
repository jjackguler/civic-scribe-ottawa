import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useSchedule } from "@/lib/originals";
import { caseName, caseNumber } from "@/lib/originals-types";
import { useLocale } from "@/lib/locale-context";

const pad = (n: number) => String(n).padStart(2, "0");

/** "07:12:44" until the time, then null. */
function useCountdown(iso: string | undefined) {
  const [now, setNow] = useState<number | null>(null); // null on the server: no clock in the HTML
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!iso || now == null) return { text: "--:--:--", due: false };
  const ms = Date.parse(iso) - now;
  if (ms <= 0) return { text: "00:00:00", due: true };
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const hms = `${pad(Math.floor((s % 86400) / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  return { text: d > 0 ? `${d}d ${hms}` : hms, due: false };
}

/**
 * The next Sir Jack case and a live countdown to its release. Renders nothing
 * when no case is scheduled. "strip" sits inside a band; "card" stands alone.
 */
export function NextCase({ variant = "card" }: { variant?: "card" | "strip" }) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const { data } = useSchedule();
  const next = data?.[0];
  const { text, due } = useCountdown(next?.publishedAt);
  if (!next) return null;
  const n = caseNumber(next);
  const name = caseName(next.title);
  const when = new Date(next.publishedAt).toLocaleString(fr ? "fr-CA" : "en-CA", { weekday: "long", hour: "numeric", minute: "2-digit", timeZone: "America/Toronto", timeZoneName: "short" });

  if (variant === "strip") {
    return (
      <Link to="/sir-jack" className="group flex flex-wrap items-center gap-x-4 gap-y-1 bg-night text-white px-4 py-3 mb-6 rounded-[4px]">
        <span className="text-brass font-bold text-[0.78rem] tracking-[0.18em] uppercase">{fr ? "Prochaine affaire" : "Next case"}{n ? ` · #${n}` : ""}</span>
        <span className="masthead-serif text-[1.15rem]">{name}</span>
        <span className="ml-auto font-bold tabular-nums text-brass text-[1.15rem]" aria-live="off">{due ? (fr ? "D'une minute à l'autre" : "Any minute now") : text}</span>
        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
      </Link>
    );
  }

  return (
    <div className="grid grid-cols-[96px_minmax(0,1fr)] sm:grid-cols-[120px_minmax(0,1fr)] gap-5 items-center bg-night-2 border-t-[3px] border-brass p-5">
      <div className="aspect-[9/16] bg-black overflow-hidden">
        {next.posterUrl && <img src={next.posterUrl} alt="" loading="lazy" className="img-cover blur-[2px] opacity-80" />}
      </div>
      <div className="min-w-0">
        <p className="text-brass font-bold text-[0.78rem] tracking-[0.18em] uppercase">{fr ? "Prochaine affaire" : "Next case"}{n ? ` · #${n}` : ""}</p>
        <p className="masthead-serif text-[1.6rem] sm:text-[2rem] leading-[1.05] mt-1 text-white">{name}</p>
        <p className="font-bold tabular-nums text-brass text-[2rem] sm:text-[2.6rem] leading-none mt-3" aria-live="off">{due ? (fr ? "D'une minute à l'autre" : "Any minute now") : text}</p>
        <p className="text-white/65 text-[0.88rem] mt-2">{fr ? "Sortie " : "Out "}{when}</p>
      </div>
    </div>
  );
}
