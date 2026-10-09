/**
 * Young Lab: shared pieces (stamps, confetti, chunky cards, the finish
 * panel, the gentle break nudge, the print portal) and the homepage band.
 *
 * Safety by construction: nothing here talks to a server. Progress is read
 * and written through young-progress.ts (localStorage, wrapped in try/catch).
 */
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import {
  AlarmClock, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Bot, BrainCircuit, Calculator, ChefHat, Clapperboard, Compass,
  Eye, GraduationCap, HandHeart, HeartHandshake, Images, Keyboard, Languages, Lightbulb, Lock, Mail, Map as MapIcon,
  MessageSquareText, Mic, Microwave, Palette, Puzzle, RotateCcw, Scale, ScanFace, SearchCheck, ShieldCheck, Sparkles,
  Stamp as StampIcon, Thermometer, TrafficCone, Users, WandSparkles, Workflow, type LucideIcon,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useLocale } from "@/lib/locale-context";
import type { Bi } from "@/lib/i18n";
import { ACTIVITIES, GROUP, activityById, type Activity, type ActivityId, type Tone } from "@/lib/young-lab";
import { breakShown, markPlaying, shouldSuggestBreak, stampCount, useYoungProgress } from "@/lib/young-progress";
import { useHydrated } from "@/lib/labs-progress";

/* ------------------------------------------------------------------ */
/* Icons and tones                                                     */
/* ------------------------------------------------------------------ */

export const ICONS: Record<string, LucideIcon> = {
  mail: Mail, calculator: Calculator, mic: Mic, thermometer: Thermometer, map: MapIcon, lightbulb: Lightbulb,
  clapperboard: Clapperboard, microwave: Microwave, keyboard: Keyboard, languages: Languages, "traffic-cone": TrafficCone,
  images: Images, puzzle: Puzzle, "scan-face": ScanFace, "book-open": BookOpen, users: Users, "brain-circuit": BrainCircuit,
  bot: Bot, scale: Scale, "hand-heart": HandHeart, "wand-sparkles": WandSparkles, "shield-check": ShieldCheck,
  "graduation-cap": GraduationCap, "heart-handshake": HeartHandshake, palette: Palette, "alarm-clock": AlarmClock,
};

export const ACTIVITY_ICON: Record<ActivityId, LucideIcon> = {
  "ai-or-not": SearchCheck, "teach-the-machine": BrainCircuit, "spot-the-fake": Eye, "prompt-kitchen": ChefHat,
  "fair-or-unfair": Scale, "next-word": MessageSquareText, "privacy-check": Lock, "chatbot-rules": Workflow, "career-paths": Compass,
};

export const toneClass = (t: Tone) => `yl-tone-${t}`;

/** Bilingual inline text helper for components. */
export function useT() {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  return { fr, locale, pick, t: (en: string, frText: string) => (fr ? frText : en) };
}

/* ------------------------------------------------------------------ */
/* Motion helpers                                                      */
/* ------------------------------------------------------------------ */

export function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const on = () => setReduce(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduce;
}

const CONFETTI_COLORS = ["var(--signal)", "var(--yl-coral)", "var(--yl-sky)", "var(--yl-mint)", "var(--yl-grape)", "var(--ink)"];
type Piece = { id: number; shape: "sq" | "dot" | "tri"; color: string; dx: number; dy: number; up: number; rot: number; delay: number; size: number };

/**
 * A short burst of small shapes when a level is finished. It plays once
 * (about 1.6 s) and removes itself; nothing at all under reduced motion.
 * Change `burst` to fire again.
 */
export function Confetti({ burst }: { burst: number }) {
  const reduce = useReducedMotion();
  const [pieces, setPieces] = useState<Piece[]>([]);
  useEffect(() => {
    if (!burst || reduce || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const shapes: Piece["shape"][] = ["sq", "dot", "tri"];
    setPieces(Array.from({ length: 38 }, (_, i) => ({
      id: burst * 100 + i,
      shape: shapes[i % 3],
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      dx: Math.round((Math.random() - 0.5) * 360),
      dy: Math.round(140 + Math.random() * 200),
      up: Math.round(60 + Math.random() * 110),
      rot: Math.round((Math.random() - 0.5) * 720),
      delay: Math.round(Math.random() * 140),
      size: Math.round(7 + Math.random() * 7),
    })));
    const t = setTimeout(() => setPieces([]), 1900);
    return () => clearTimeout(t);
  }, [burst, reduce]);
  if (!pieces.length) return null;
  return (
    <span aria-hidden="true" className="yl-confetti">
      {pieces.map(p => (
        <span
          key={p.id}
          className={`yl-piece yl-piece--${p.shape}`}
          style={{ ["--dx" as string]: `${p.dx}px`, ["--dy" as string]: `${p.dy}px`, ["--up" as string]: `${p.up}px`, ["--rot" as string]: `${p.rot}deg`, animationDelay: `${p.delay}ms`, width: p.size, height: p.size, background: p.shape === "tri" ? undefined : p.color, color: p.color }}
        />
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Stamps                                                              */
/* ------------------------------------------------------------------ */

export function Stamp({ activity, earned, size = 120, thump = false, date }: { activity: Activity; earned: boolean; size?: number; thump?: boolean; date?: string }) {
  const { pick, t } = useT();
  const uid = useId().replace(/:/g, "");
  const Icon = ACTIVITY_ICON[activity.id];
  const label = pick(activity.stamp);
  return (
    <figure className={`yl-stamp ${earned ? "is-earned" : ""} ${thump ? "yl-thump" : ""}`} style={{ width: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={earned ? t(`Stamp earned: ${label}`, `Tampon obtenu : ${label}`) : t(`Stamp not yet earned: ${label}`, `Tampon pas encore obtenu : ${label}`)}>
        <defs>
          <path id={`${uid}-top`} d="M 18 60 A 42 42 0 0 1 102 60" />
          <path id={`${uid}-bot`} d="M 14 60 A 46 46 0 0 0 106 60" />
        </defs>
        <circle cx="60" cy="60" r="56" className={earned ? `yl-stamp-fill ${toneClass(activity.tone)}` : "yl-stamp-empty"} />
        <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="3.5" strokeDasharray={earned ? undefined : "6 6"} />
        <circle cx="60" cy="60" r="34" fill="none" stroke="currentColor" strokeWidth="2" opacity={earned ? 1 : 0.5} />
        {earned ? (
          <>
            <text className="yl-stamp-text"><textPath href={`#${uid}-top`} startOffset="50%" textAnchor="middle">{t("Young Lab", "Jeune Labo")}</textPath></text>
            <text className="yl-stamp-text yl-stamp-text--bot"><textPath href={`#${uid}-bot`} startOffset="50%" textAnchor="middle">{label.length > 18 ? label.slice(0, 17) + "…" : label}</textPath></text>
            <Icon x={42} y={42} width={36} height={36} strokeWidth={2.4} aria-hidden="true" />
          </>
        ) : (
          <text x="60" y="71" textAnchor="middle" className="yl-stamp-q">?</text>
        )}
      </svg>
      {date && <figcaption className="sr-only">{date}</figcaption>}
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Page shell and small pieces                                         */
/* ------------------------------------------------------------------ */

export function YoungShell({ children }: { children: ReactNode }) {
  return (
    <PageShell>
      <div className="yl yl-page">{children}</div>
    </PageShell>
  );
}

/** Breadcrumb back to the Young Lab home (and a group page, when there is one). */
export function YoungCrumbs({ group, dark = false }: { group?: "explorers" | "makers"; dark?: boolean }) {
  const { pick, t } = useT();
  return (
    <nav aria-label={t("Breadcrumb", "Fil d'Ariane")} className={`text-[0.95rem] font-bold ${dark ? "text-white/85" : "text-ink"}`}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <li><Link to="/labs" className="underline-offset-4 hover:underline">Labs</Link></li>
        <li aria-hidden="true">/</li>
        <li><Link to="/labs/young" className="underline-offset-4 hover:underline">{t("Young Lab", "Jeune Labo")}</Link></li>
        {group && (
          <>
            <li aria-hidden="true">/</li>
            <li><Link to={group === "explorers" ? "/labs/young/explorers" : "/labs/young/makers"} className="underline-offset-4 hover:underline">{pick(GROUP[group].title)}</Link></li>
          </>
        )}
      </ol>
    </nav>
  );
}

/** The safety promise, in plain words. */
export function SafetyPromise({ compact = false }: { compact?: boolean }) {
  const { t } = useT();
  const items: [LucideIcon, string, string][] = [
    [Users, t("No account, no name", "Pas de compte, pas de nom"), t("We never ask who you are.", "On ne te demande jamais qui tu es.")],
    [Lock, t("Nothing leaves your device", "Rien ne quitte ton appareil"), t("Every game runs right here in your browser.", "Chaque jeu fonctionne ici, dans ton navigateur.")],
    [Bot, t("No chatting with an AI", "Pas de clavardage avec une IA"), t("Just games you control. No robot is listening.", "Juste des jeux que tu contrôles. Aucun robot n'écoute.")],
    [StampIcon, t("Stamps stay in this browser", "Les tampons restent dans ce navigateur"), t("Clear them any time from your passport.", "Efface-les quand tu veux depuis ton passeport.")],
  ];
  return (
    <ul className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"}`} aria-label={t("Our promise to you", "Notre promesse")}>
      {items.map(([Icon, title, body]) => (
        <li key={title} className="flex gap-3 items-start rounded-[16px] bg-white border-[3px] border-ink p-4">
          <span className="grid place-items-center h-10 w-10 shrink-0 rounded-full yl-tone-mint border-[3px] border-ink"><Icon className="h-5 w-5" aria-hidden="true" /></span>
          <span>
            <span className="block font-extrabold leading-snug">{title}</span>
            <span className="block text-[0.95rem] text-muted-ink leading-snug mt-0.5">{body}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** An outside link: clearly marked, opens in a new tab, no referrer. */
export function LeavesLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  const { t } = useT();
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`yl-btn flex-wrap justify-start gap-x-2 gap-y-1 ${className}`}>
      <span className="inline-flex items-center gap-1.5">{children}<ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" /></span>
      <span className="yl-leaves">{t("leaves AI Broadsheet", "quitte AI Broadsheet")}</span>
      <span className="sr-only">{t(" (opens in a new tab)", " (nouvel onglet)")}</span>
    </a>
  );
}

/** A big chunky activity card for grids. */
export function ActivityCard({ a, headingLevel = 3 }: { a: Activity; headingLevel?: 2 | 3 }) {
  const { pick, t } = useT();
  const hydrated = useHydrated();
  const { state } = useYoungProgress();
  const earned = hydrated && !!state.stamps[a.id];
  const Icon = ACTIVITY_ICON[a.id];
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className={`yl-card yl-lift relative flex flex-col p-5 ${toneClass(a.tone)}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="grid place-items-center h-14 w-14 rounded-[16px] bg-white border-[3px] border-ink"><Icon className="h-7 w-7" aria-hidden="true" /></span>
        {earned
          ? <span className="inline-flex items-center gap-1.5 rounded-full bg-ink text-white text-[0.85rem] font-bold px-3 py-1"><StampIcon className="h-4 w-4" aria-hidden="true" />{t("Stamp earned", "Tampon obtenu")}</span>
          : <span className="text-[0.85rem] font-bold bg-white/70 rounded-full px-3 py-1 border-2 border-ink">{t(`About ${a.minutes} min`, `Env. ${a.minutes} min`)}</span>}
      </div>
      <H className="yl-title text-[1.5rem] mt-4">
        <Link to="/labs/young/$activity" params={{ activity: a.id }} className="after:absolute after:inset-0 after:content-[''] after:rounded-[20px] focus-visible:outline-none">
          {pick(a.title)}
        </Link>
      </H>
      <p className="mt-2 text-[1rem] leading-relaxed flex-1">{pick(a.tagline)}</p>
      <span className="mt-4 inline-flex items-center gap-2 font-extrabold">
        {earned ? t("Play again", "Rejouer") : t("Let's play", "On joue")} <ArrowRight className="h-5 w-5" aria-hidden="true" />
      </span>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Activity frame and finish                                           */
/* ------------------------------------------------------------------ */

/** Header band for an activity page. */
export function ActivityHeader({ a }: { a: Activity }) {
  const { pick, t } = useT();
  const Icon = ACTIVITY_ICON[a.id];
  return (
    <header className={`yl-hero-band ${toneClass(a.tone)} border-b-[3px] border-ink`}>
      <div className="container-mw pt-6 pb-8 sm:pt-8 sm:pb-10">
        <YoungCrumbs group={a.group} />
        <div className="mt-5 flex items-start gap-4">
          <span className="yl-in grid place-items-center h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-[20px] bg-white border-[3px] border-ink shadow-[4px_4px_0_var(--ink)]"><Icon className="h-8 w-8 sm:h-10 sm:w-10" aria-hidden="true" /></span>
          <div className="min-w-0">
            <p className="font-bold text-[0.95rem]">{pick(GROUP[a.group].title)} · {pick(GROUP[a.group].ages)} · {t(`about ${a.minutes} minutes`, `environ ${a.minutes} minutes`)}</p>
            <h1 className="yl-title text-[2.2rem] sm:text-[3rem] leading-[1.02] mt-1">{pick(a.title)}</h1>
            <p className="mt-2 text-[1.1rem] sm:text-[1.2rem] leading-relaxed max-w-[44rem]">{pick(a.tagline)}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

/** Rows of dots: where you are in a round. */
export function RoundDots({ total, at, results }: { total: number; at: number; results: (boolean | null)[] }) {
  const { t } = useT();
  return (
    <div className="flex items-center gap-3">
      <ol className="flex flex-wrap gap-1.5" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => {
          const r = results[i];
          return <li key={i} className={`h-3.5 w-3.5 rounded-full border-2 border-ink ${r === true ? "bg-[var(--yl-mint)]" : r === false ? "bg-[var(--yl-coral)]" : i === at ? "bg-signal" : "bg-white"}`} />;
        })}
      </ol>
      <span className="text-[0.95rem] font-bold tabular-nums">{t(`${Math.min(at + 1, total)} of ${total}`, `${Math.min(at + 1, total)} sur ${total}`)}</span>
    </div>
  );
}

/** A gentle suggestion to rest. No timer, no guilt, the stamps wait. */
export function BreakNudge() {
  const { t } = useT();
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (shouldSuggestBreak()) { setShow(true); breakShown(); }
  }, []);
  if (!show) return null;
  return (
    <div role="note" className="yl-in mt-6 rounded-[20px] border-[3px] border-ink bg-white p-5 flex flex-col sm:flex-row gap-4 sm:items-center">
      <span className="grid place-items-center h-14 w-14 shrink-0 rounded-full yl-tone-sky border-[3px] border-ink"><AlarmClock className="h-7 w-7" aria-hidden="true" /></span>
      <div className="flex-1">
        <p className="font-extrabold text-[1.15rem]">{done ? t("Great idea. See you soon!", "Bonne idée. À bientôt!") : t("You've done a lot of lab work!", "Tu as beaucoup travaillé au labo!")}</p>
        {!done && <p className="mt-1 leading-relaxed">{t("Brains learn best with breaks. Stretch, drink some water, or tell someone one thing you learned. Your stamps will wait for you.", "Le cerveau apprend mieux avec des pauses. Étire-toi, bois de l'eau ou raconte à quelqu'un une chose apprise. Tes tampons t'attendront.")}</p>}
      </div>
      {!done && (
        <div className="flex flex-wrap gap-3">
          <button type="button" className="yl-btn yl-tone-sky" onClick={() => setDone(true)}>{t("I'll take a break", "Je prends une pause")}</button>
          <button type="button" className="yl-btn" onClick={() => setShow(false)}>{t("One more", "Encore un")}</button>
        </div>
      )}
    </div>
  );
}

/** Mark the start of play once, for the gentle break timer. */
export function usePlaying() {
  useEffect(() => { markPlaying(); }, []);
}

/**
 * The end of a level: the stamp thumps down, a burst of confetti, a
 * line about what was learned, and calm next steps. The parent awards the
 * stamp; this only shows it.
 */
export function FinishPanel({ a, headline, children, onReplay, firstTime }: { a: Activity; headline: string; children?: ReactNode; onReplay: () => void; firstTime: boolean }) {
  const { pick, t } = useT();
  const ref = useRef<HTMLHeadingElement>(null);
  const [burst] = useState(() => Date.now());
  useEffect(() => { ref.current?.focus({ preventScroll: false }); }, []);
  const next = ACTIVITIES.find(x => x.group === a.group && x.n === a.n + 1) ?? ACTIVITIES.find(x => x.n === a.n + 1);
  return (
    <section className="yl-card relative overflow-visible p-5 sm:p-8 mt-2" aria-labelledby={`finish-${a.id}`}>
      <Confetti burst={burst} />
      <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="justify-self-center">
          <Stamp activity={a} earned thump size={150} />
        </div>
        <div>
          <p className="font-bold text-[0.95rem] inline-flex items-center gap-2"><Sparkles className="h-4 w-4" aria-hidden="true" />{firstTime ? t("New stamp for your passport", "Nouveau tampon pour ton passeport") : t("Stamped again", "Tamponné encore")}: {pick(a.stamp)}</p>
          <h2 id={`finish-${a.id}`} ref={ref} tabIndex={-1} className="yl-title text-[1.9rem] sm:text-[2.3rem] leading-[1.05] mt-1 outline-none">{headline}</h2>
          {children && <div className="mt-3 text-[1.08rem] leading-relaxed">{children}</div>}
          <div className="mt-5 flex flex-wrap gap-3">
            {next && (
              <Link to="/labs/young/$activity" params={{ activity: next.id }} className="yl-btn yl-btn--ink">
                {t("Next", "Suivant")}: {pick(next.title)} <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            )}
            <button type="button" className="yl-btn" onClick={onReplay}><RotateCcw className="h-5 w-5" aria-hidden="true" />{t("Play again", "Rejouer")}</button>
            <Link to="/labs/young/passport" className="yl-btn yl-tone-sun"><StampIcon className="h-5 w-5" aria-hidden="true" />{t("My passport", "Mon passeport")}</Link>
          </div>
        </div>
      </div>
      <BreakNudge />
    </section>
  );
}

/** "Back to …" link under an activity. */
export function BackToGroup({ group }: { group: "explorers" | "makers" }) {
  const { pick, t } = useT();
  return (
    <Link to={group === "explorers" ? "/labs/young/explorers" : "/labs/young/makers"} className="inline-flex items-center gap-2 min-h-[44px] font-bold underline underline-offset-4 decoration-2">
      <ArrowLeft className="h-5 w-5" aria-hidden="true" /> {t(`All ${pick(GROUP[group].title)} games`, `Tous les jeux ${pick(GROUP[group].title)}`)}
    </Link>
  );
}

/** What this activity teaches, said kindly, under the game. */
export function BigIdea({ a }: { a: Activity }) {
  const { pick, t } = useT();
  return (
    <aside className="mt-10 rounded-[20px] border-[3px] border-dashed border-ink p-5 bg-white/70">
      <p className="font-extrabold inline-flex items-center gap-2"><Lightbulb className="h-5 w-5" aria-hidden="true" />{t("The big idea", "La grande idée")}</p>
      <p className="mt-1 text-[1.08rem] leading-relaxed">{pick(a.teaches)}</p>
      <p className="mt-3 text-[0.95rem] text-muted-ink">
        {t("Grown-ups: ", "Adultes : ")}
        <Link to="/labs/young/grown-ups" hash={`sheet-${a.id}`} className="font-bold text-lake underline underline-offset-4">{t("objectives, talking points and a printable sheet", "objectifs, pistes de discussion et fiche à imprimer")}</Link>
      </p>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Printing: only the chosen sheets, in a portal outside the app       */
/* ------------------------------------------------------------------ */

export function usePrint() {
  const [printing, setPrinting] = useState<string[] | null>(null);
  useEffect(() => {
    if (!printing) return;
    const html = document.documentElement;
    html.classList.add("yl-printing");
    const off = () => { html.classList.remove("yl-printing"); setPrinting(null); window.removeEventListener("afterprint", off); };
    window.addEventListener("afterprint", off);
    const t = setTimeout(() => window.print(), 60);
    return () => { clearTimeout(t); window.removeEventListener("afterprint", off); html.classList.remove("yl-printing"); };
  }, [printing]);
  return { printing, print: (ids: string[]) => setPrinting(ids) };
}

export function PrintPortal({ children }: { children: ReactNode }) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => { setEl(document.body); }, []);
  if (!el) return null;
  return createPortal(<div id="yl-print-root" className="yl">{children}</div>, el);
}

/* ------------------------------------------------------------------ */
/* Homepage band                                                       */
/* ------------------------------------------------------------------ */

/**
 * Young Lab on the front page. Drop it in anywhere:
 *   <YoungLabBand />
 * It reads only the visitor's own stamps from this browser.
 */
export function YoungLabBand() {
  const { pick, t } = useT();
  const hydrated = useHydrated();
  const { state } = useYoungProgress();
  const n = hydrated ? stampCount(state) : 0;
  const doors: { to: "/labs/young/explorers" | "/labs/young/makers" | "/labs/young/grown-ups"; tone: Tone; title: string; sub: string; Icon: LucideIcon }[] = [
    { to: "/labs/young/explorers", tone: "sky", title: pick(GROUP.explorers.title), sub: pick(GROUP.explorers.ages), Icon: Puzzle },
    { to: "/labs/young/makers", tone: "coral", title: pick(GROUP.makers.title), sub: pick(GROUP.makers.ages), Icon: Workflow },
    { to: "/labs/young/grown-ups", tone: "mint", title: t("Parents & teachers", "Parents et enseignants"), sub: t("Objectives and printables", "Objectifs et fiches"), Icon: HeartHandshake },
  ];
  return (
    <section aria-labelledby="young-band-title" className="yl yl-band border-y-[3px] border-ink">
      <div className="container-mw py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <p className="inline-flex items-center gap-2 rounded-full bg-white border-[3px] border-ink px-3 py-1 font-extrabold text-[0.95rem]">
              <Sparkles className="h-4 w-4" aria-hidden="true" /> {t("New in Labs: Young Lab", "Nouveau dans Labs : Jeune Labo")}
            </p>
            <h2 id="young-band-title" className="yl-title text-[2.2rem] sm:text-[2.8rem] leading-[1.02] mt-4">
              {t("How does AI work? Play and find out.", "Comment marche l'IA? Joue et découvre-le.")}
            </h2>
            <p className="mt-3 text-[1.1rem] leading-relaxed max-w-[36rem]">
              {t("Nine games for ages 8 to 17: sort, teach a machine, spot fakes, build a bot. No account, and nothing typed ever leaves the device.", "Neuf jeux pour les 8 à 17 ans : trier, entraîner une machine, repérer les faux, bâtir un robot. Pas de compte, et rien de ce qu'on écrit ne quitte l'appareil.")}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link to="/labs/young" className="yl-btn yl-btn--ink">{t("Open Young Lab", "Ouvrir le Jeune Labo")} <ArrowRight className="h-5 w-5" aria-hidden="true" /></Link>
              {n > 0 && <Link to="/labs/young/passport" className="yl-btn"><StampIcon className="h-5 w-5" aria-hidden="true" />{t(`${n} of ${ACTIVITIES.length} stamps`, `${n} tampons sur ${ACTIVITIES.length}`)}</Link>}
            </div>
          </div>
          <ul className="lg:col-span-7 grid gap-4 sm:grid-cols-3">
            {doors.map(d => (
              <li key={d.to}>
                <Link to={d.to} className={`yl-card yl-lift group flex sm:flex-col gap-4 p-5 h-full ${toneClass(d.tone)}`}>
                  <span className="grid place-items-center h-14 w-14 shrink-0 rounded-[16px] bg-white border-[3px] border-ink"><d.Icon className="h-7 w-7" aria-hidden="true" /></span>
                  <span className="min-w-0">
                    <span className="block yl-title text-[1.4rem] leading-tight">{d.title}</span>
                    <span className="block font-semibold mt-1">{d.sub}</span>
                    <span className="mt-2 inline-flex items-center gap-1 font-extrabold group-hover:underline underline-offset-4">{t("Go", "Allons-y")} <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** A Young Lab link card for /labs. */
export function YoungLabCard() {
  const { t } = useT();
  return (
    <Link to="/labs/young" className="yl yl-card yl-lift yl-tone-sun group grid gap-5 p-5 sm:p-7 sm:grid-cols-[auto_1fr_auto] sm:items-center">
      <span className="grid place-items-center h-16 w-16 rounded-[18px] bg-white border-[3px] border-ink"><Sparkles className="h-8 w-8" aria-hidden="true" /></span>
      <span className="min-w-0">
        <span className="block font-bold text-[0.95rem]">{t("For ages 8 to 17, and their grown-ups", "Pour les 8 à 17 ans, et leurs adultes")}</span>
        <span className="block yl-title text-[1.8rem] sm:text-[2.1rem] leading-[1.05] mt-1">{t("Young Lab: learn AI by playing", "Jeune Labo : apprendre l'IA en jouant")}</span>
        <span className="block mt-2 text-[1.05rem] leading-relaxed">{t("Nine in-browser games, a stamp passport and printable sheets for class. No account, no data collected.", "Neuf jeux dans le navigateur, un passeport de tampons et des fiches à imprimer pour la classe. Pas de compte, aucune donnée recueillie.")}</span>
      </span>
      <span className="yl-btn yl-btn--ink justify-self-start">{t("Open Young Lab", "Ouvrir le Jeune Labo")} <ArrowRight className="h-5 w-5" aria-hidden="true" /></span>
    </Link>
  );
}

export const groupActivities = (g: "explorers" | "makers") => ACTIVITIES.filter(a => a.group === g);
export { activityById };
export type { Bi };
