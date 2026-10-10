/**
 * Share a page: the phone's own share sheet first (where there is one), then
 * WhatsApp, X, LinkedIn, Facebook, Reddit and copy link.
 *
 *   <ShareBar url="/dispatch/abc" title={headline} />
 *   <ShareBar url="/quiz" title="The Broadsheet 5" campaign="quiz" tone="dark" />
 *
 * Plain links with utm_source=share&utm_medium=<network>. No network scripts,
 * no counters, no tracking pixels: nothing loads from a social network until
 * the reader taps. Every target is at least 44×44 px.
 */
import { useEffect, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { canNativeShare, copyText, shareTargets, shareUrl, withUtm } from "@/lib/share";

const COPY = {
  en: { label: "Share", share: "Share…", copy: "Copy link", copied: "Link copied", newTab: "opens in a new tab", on: "Share on" },
  fr: { label: "Partager", share: "Partager…", copy: "Copier le lien", copied: "Lien copié", newTab: "nouvel onglet", on: "Partager sur" },
};

export function ShareBar({ url, title, text, campaign, tone = "light", heading = true, className = "" }: {
  /** A site path ("/dispatch/abc") or an absolute URL. */
  url: string;
  title: string;
  /** Extra text for the native sheet (defaults to the title). */
  text?: string;
  /** utm_campaign, e.g. "dispatch", "quiz", "today". */
  campaign?: string;
  /** "dark" on night backgrounds. */
  tone?: "light" | "dark";
  /** Show the small "Share" label before the buttons. */
  heading?: boolean;
  className?: string;
}) {
  const { locale } = useLocale();
  const T = COPY[locale];
  const abs = shareUrl(url, locale);
  const [native, setNative] = useState(false);
  const [status, setStatus] = useState("");
  useEffect(() => setNative(canNativeShare()), []);
  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(""), 2600);
    return () => clearTimeout(t);
  }, [status]);

  const dark = tone === "dark";
  const btn = `press inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border-2 px-3.5 text-[0.9rem] font-bold leading-none ${
    dark ? "border-white/35 text-white hover:border-signal hover:bg-signal hover:text-signal-ink" : "border-night/80 bg-surface text-ink hover:bg-night hover:text-white"
  }`;

  const nativeShare = async () => {
    try {
      await navigator.share({ title, text: text ?? title, url: withUtm(abs, "native", campaign) });
    } catch { /* closed or blocked: nothing to do */ }
  };
  const copy = async () => {
    const ok = await copyText(withUtm(abs, "copy", campaign));
    setStatus(ok ? T.copied : "");
  };

  return (
    <div className={className}>
      <div role="group" aria-label={T.label} className="flex flex-wrap items-center gap-2">
        {heading && <span className={`mr-1 text-[0.82rem] font-bold ${dark ? "text-white/75" : "text-muted-ink"}`} aria-hidden="true">{T.label}</span>}
        {native && (
          <button type="button" onClick={nativeShare} className={`${btn} ${dark ? "border-signal bg-signal text-signal-ink" : "border-night bg-night text-white hover:bg-lake"}`}>
            <Share2 className="h-4 w-4" aria-hidden="true" />{T.share}
          </button>
        )}
        {shareTargets(abs, title, campaign).map(t => (
          <a key={t.network} href={t.href} target="_blank" rel="noopener noreferrer" className={btn} aria-label={`${T.on} ${t.label} (${T.newTab})`}>
            {t.label}
          </a>
        ))}
        <button type="button" onClick={copy} className={btn}>
          {status ? <Check className="h-4 w-4" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
          {status ? T.copied : T.copy}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">{status}</p>
    </div>
  );
}
