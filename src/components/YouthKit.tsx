/**
 * Small pieces other pages can use.
 *
 *   <ExplainLike12 storyIds={[story.id]} />            a switch that shows our dispatch's Plain version
 *   <ExplainLike12 dispatchId={d.id}>{summary}</ExplainLike12>   swaps `summary` for the Plain version
 *   <YourTake dispatchId={d.id} headline={c.headline} />          three honest reactions, kept on this device
 *
 * ExplainLike12 renders only its children (or nothing) when no dispatch covers
 * the story: we never write a "simple version" we can't source.
 */
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useId, useState, type ReactNode } from "react";
import { ArrowRight, HeartHandshake, Lightbulb, MessageCircleQuestion } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { fixtureRequested, getDispatch, stripMarkers, useDispatches, type Dispatch } from "@/lib/dispatch";
import { useTakes, type Take } from "@/lib/youth";

const ELI_KEY = "aib-eli12";

function useEliPref(): [boolean, (v: boolean) => void] {
  const [on, setOn] = useState(false);
  useEffect(() => { try { setOn(window.localStorage.getItem(ELI_KEY) === "1"); } catch { /* blocked */ } }, []);
  const set = (v: boolean) => { setOn(v); try { window.localStorage.setItem(ELI_KEY, v ? "1" : "0"); } catch { /* blocked */ } };
  return [on, set];
}

function useFullDispatch(id: string | null, enabled: boolean) {
  const fixture = fixtureRequested();
  return useQuery({
    queryKey: ["dispatch-full", id, fixture],
    enabled: !!id && enabled,
    staleTime: 30 * 60_000,
    queryFn: async (): Promise<Dispatch | null> => {
      if (import.meta.env.DEV && fixture) {
        const { FIXTURES } = await import("@/lib/dispatch-fixture");
        return FIXTURES.find(d => d.id === id) ?? null;
      }
      return (await getDispatch({ data: { id: id! } })).dispatch;
    },
  });
}

/**
 * "Explain it like I'm 12": switches a summary to the Plain depth of our
 * dispatch on the same event. Hidden when there is no dispatch.
 */
export function ExplainLike12({ storyId, storyIds, dispatchId, children, className = "" }: {
  storyId?: string;
  /** Any of these stories (e.g. a story and its full coverage). */
  storyIds?: string[];
  dispatchId?: string;
  /** The summary to show while the switch is off. */
  children?: ReactNode;
  className?: string;
}) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const { data } = useDispatches();
  const ids = new Set([...(storyIds ?? []), ...(storyId ? [storyId] : [])]);
  const match = (data?.items ?? []).find(d => d.id === dispatchId || (d.storyIds ?? []).some(x => ids.has(x)));
  const [on, setOn] = useEliPref();
  const full = useFullDispatch(match?.id ?? null, on);
  const panelId = useId();
  if (!match) return <>{children}</>;
  const plain = full.data?.[locale]?.body.plain ?? [];
  const label = fr ? "Explique-moi comme si j'avais 12 ans" : "Explain it like I'm 12";

  return (
    <div className={className}>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-controls={panelId}
        onClick={() => setOn(!on)}
        className="eli-switch press inline-flex min-h-11 items-center gap-3 font-semibold"
      >
        <span className={`relative inline-block h-7 w-12 shrink-0 rounded-full border-2 border-night transition-colors ${on ? "bg-signal" : "bg-surface"}`} aria-hidden="true">
          <span className={`eli-knob absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-night ${on ? "left-[22px]" : "left-[2px]"}`} />
        </span>
        {label}
      </button>
      <div id={panelId} aria-live="polite">
        {on ? (
          <div className="eli-in mt-3 border-l-[4px] border-signal bg-surface p-4 sm:p-5">
            <p className="text-[0.8rem] font-bold text-muted-ink">{fr ? "Version simple, tirée de notre dépêche" : "Plain version, from our dispatch"}</p>
            {plain.length > 0
              ? plain.map((p, i) => <p key={i} className="mt-2 font-serif text-[1.15rem] leading-relaxed">{stripMarkers(p)}</p>)
              : <p className="mt-2 font-serif text-[1.1rem] text-muted-ink">{full.isError || full.data === null ? (fr ? "La version simple n'est pas disponible pour le moment." : "The plain version isn't available right now.") : "…"}</p>}
            <Link to="/dispatch/$id" params={{ id: match.id }} className="mt-2 inline-flex min-h-11 items-center gap-1 font-semibold text-lake hover:underline">
              {fr ? "Lire la dépêche, avec chaque source" : "Read the dispatch, with every source"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : children}
      </div>
    </div>
  );
}

const TAKES: { id: Take; icon: typeof Lightbulb; en: string; fr: string }[] = [
  { id: "learned", icon: Lightbulb, en: "I learned something", fr: "J'ai appris quelque chose" },
  { id: "question", icon: MessageCircleQuestion, en: "I have a question", fr: "J'ai une question" },
  { id: "worried", icon: HeartHandshake, en: "This worries me", fr: "Ça m'inquiète" },
];

/**
 * "Your take": three honest reactions to a dispatch. Only the reader sees
 * them: they stay in this browser, with no public counters and no comments.
 * "I have a question" takes the reader to the Keeper with the headline.
 */
export function YourTake({ dispatchId, headline, className = "" }: { dispatchId: string; headline: string; className?: string }) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const navigate = useNavigate();
  const { takes, toggle, tally, ready } = useTakes();
  const mine = ready ? takes[dispatchId]?.r ?? [] : [];
  const [last, setLast] = useState<Take | null>(null);
  const q = fr ? `J'ai une question sur cette nouvelle : « ${headline} »` : `I have a question about this story: "${headline}"`;

  const press = (t: Take) => {
    const on = !mine.includes(t);
    toggle(dispatchId, t);
    setLast(on ? t : null);
    if (t === "question" && on) {
      // Let the press register, then go and ask.
      setTimeout(() => { void navigate({ to: "/ask", search: { q } }); }, 180);
    }
  };

  const total = tally.learned + tally.question + tally.worried;
  return (
    <section aria-labelledby={`take-${dispatchId}`} className={`border-t-[3px] border-night pt-4 ${className}`}>
      <h2 id={`take-${dispatchId}`} className="hl text-[1.3rem]">{fr ? "Votre avis" : "Your take"}</h2>
      <p className="meta mt-1">{fr ? "Vous seul le voyez. Il reste sur cet appareil : pas de compteurs publics, pas de commentaires." : "Only you see it. It stays on this device: no public counts, no comments."}</p>
      <ul className="mt-3 flex flex-wrap gap-2.5">
        {TAKES.map(t => {
          const on = mine.includes(t.id);
          const Icon = t.icon;
          return (
            <li key={t.id}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => press(t.id)}
                className={`take-btn press inline-flex min-h-12 items-center gap-2 rounded-full border-2 px-4 font-semibold ${on ? "border-night bg-night text-white" : "border-line bg-surface text-ink hover:border-night"}`}
              >
                <Icon className={`h-5 w-5 ${on ? "take-on text-signal" : "text-lake"}`} aria-hidden="true" />
                {fr ? t.fr : t.en}
              </button>
            </li>
          );
        })}
      </ul>
      <div aria-live="polite">
        {last === "learned" && (
          <p className="eli-in mt-3 font-serif text-[1.05rem]">{fr ? "Bien. Faites-le circuler : dites à quelqu'un une chose que vous avez apprise aujourd'hui." : "Nice. Pass it on: tell someone one thing you learned today."}</p>
        )}
        {last === "question" && (
          <p className="eli-in mt-3 font-serif text-[1.05rem]">{fr ? "On vous emmène poser la question au Gardien…" : "Taking your question to the Keeper…"}</p>
        )}
        {last === "worried" && (
          <div className="eli-in mt-3 border-l-[4px] border-brass bg-surface p-4">
            <p className="font-serif text-[1.05rem] leading-relaxed">
              {fr
                ? "C'est une réaction légitime. Regardez ce qui est confirmé et ce qui reste inconnu, et parlez-en avec quelqu'un de confiance. Les gens ont leur mot à dire sur l'IA."
                : "That's a fair feeling. Look at what's confirmed and what's still unknown, and talk it over with someone you trust. People have a say in how AI is used."}
            </p>
            <Link to="/ask" search={{ q }} className="mt-2 inline-flex min-h-11 items-center gap-1 font-semibold text-lake hover:underline">
              {fr ? "En parler avec le Gardien" : "Talk it through with the Keeper"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
      {ready && total > 0 && (
        <p className="meta mt-3">
          {fr
            ? `Vos 30 derniers jours : ${tally.learned} appris · ${tally.question} questions · ${tally.worried} inquiétudes`
            : `Your last 30 days: ${tally.learned} learned · ${tally.question} ${tally.question === 1 ? "question" : "questions"} · ${tally.worried} ${tally.worried === 1 ? "worry" : "worries"}`}
        </p>
      )}
    </section>
  );
}
