/**
 * Small, quiet motion: elements marked data-reveal get data-reveal="in" the first time they
 * scroll into view (CSS in styles.css does the rest: stamps land, markers sweep, sections rise).
 * Also the theme toggle and a copy-to-clipboard button. All motion stops under
 * prefers-reduced-motion, and content is visible without JavaScript (the boot script adds
 * html.reveal-ready, which is what hides not-yet-revealed elements).
 */
import { useEffect, useRef, useState } from "react";
import { Check, Copy, Monitor, Moon, Sun } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { readTheme, setTheme, type ThemeChoice } from "@/lib/theme";
import { useLocale } from "@/lib/locale-context";

export function RevealObserver() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => (el.dataset.reveal = "in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.reveal = "in";
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.15 },
    );
    const scan = () =>
      document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-reveal="in"])').forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [path]);
  return null;
}

const ORDER: ThemeChoice[] = ["system", "light", "dark"];
const LABEL: Record<ThemeChoice, { en: string; fr: string }> = {
  system: { en: "System", fr: "Système" },
  light: { en: "Light", fr: "Clair" },
  dark: { en: "Dark", fr: "Sombre" },
};

/** Cycles System → Light → Dark. The icon turns as it changes. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { locale, pick } = useLocale();
  const [choice, setChoice] = useState<ThemeChoice>("system");
  const [spin, setSpin] = useState(0);
  useEffect(() => setChoice(readTheme()), []);
  const next = ORDER[(ORDER.indexOf(choice) + 1) % ORDER.length];
  const Icon = choice === "dark" ? Moon : choice === "light" ? Sun : Monitor;
  return (
    <button
      type="button"
      onClick={() => {
        setTheme(next);
        setChoice(next);
        setSpin((n) => n + 1);
      }}
      className={`inline-flex items-center gap-1.5 hover:text-ink ${className}`}
      aria-label={`${locale === "fr" ? "Thème" : "Theme"}: ${pick(LABEL[choice])}. ${locale === "fr" ? "Passer à" : "Switch to"} ${pick(LABEL[next])}`}
      title={`${locale === "fr" ? "Thème" : "Theme"}: ${pick(LABEL[choice])}`}
    >
      <Icon key={spin} className={`h-4 w-4 ${spin ? "spin-in" : ""}`} aria-hidden="true" />
      <span className="hidden sm:inline" suppressHydrationWarning>{pick(LABEL[choice])}</span>
    </button>
  );
}

/** Copies text and shows a tick for a moment. */
export function CopyButton({ text, label, done, className = "" }: { text: string; label: string; done: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const t = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(t.current), []);
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 font-semibold text-lake hover:underline ${className}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.clearTimeout(t.current);
          t.current = window.setTimeout(() => setCopied(false), 1800);
        } catch {
          /* clipboard blocked: nothing to show */
        }
      }}
    >
      {copied ? <Check key="c" className="h-4 w-4 pop-in text-spruce" aria-hidden="true" /> : <Copy key="u" className="h-4 w-4" aria-hidden="true" />}
      <span aria-live="polite">{copied ? done : label}</span>
    </button>
  );
}

/** Counts up from 0 to `to` when it scrolls into view (instantly under reduced motion). */
export function CountUp({ to, className = "" }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(to);
  useEffect(() => {
    const el = ref.current;
    if (!el || to === 0 || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    setN(0);
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / 900);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);
  return <span ref={ref} className={`tabular-nums ${className}`}>{n.toLocaleString()}</span>;
}
