import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AD_DIMENSIONS, AD_LABEL_H, ADSENSE_CLIENT, ADSENSE_SLOTS, adsAllowed, directFor, loadAdsense, pushAd, type AdSize, type Placement } from "@/lib/ads";
import { personalisedAllowed, useConsent } from "@/lib/consent";
import { useLocale } from "@/lib/locale-context";

/**
 * A reserved ad position. Fills with a direct campaign, then Google AdSense,
 * then one of our own house promotions.
 *
 * - The full height (label + creative) is reserved in the server HTML, so the
 *   page never jumps when an ad loads (no layout shift).
 * - AdSense code loads only when the slot is about to scroll into view.
 * - Renders nothing on ad-free pages (children's pages, the Keeper, /values…).
 * - Always labelled "Advertisement" / "Publicité" and kept apart from the journalism.
 */
export function AdSlot({ size, placement, className = "" }: { size: AdSize; placement: Placement; className?: string }) {
  const path = useRouterState({ select: s => s.location.pathname });
  if (!adsAllowed(path)) return null;
  const wide = size === "billboard" || size === "leaderboard";
  return (
    <aside aria-label="Advertisement" data-ad-placement={placement} className={`flex flex-col items-center ${className}`}>
      {wide ? (
        <>
          <div className="hidden md:block w-full"><Fill size={size} placement={placement} /></div>
          <div className="md:hidden w-full"><Fill size="mobile" placement={placement} /></div>
        </>
      ) : (
        <Fill size={size} placement={placement} />
      )}
    </aside>
  );
}

function Fill({ size, placement }: { size: AdSize; placement: Placement }) {
  const { locale } = useLocale();
  const d = AD_DIMENSIONS[size];
  const direct = directFor(size, placement);
  const label = (
    <p className="ad-label text-center uppercase" style={{ height: AD_LABEL_H, lineHeight: `${AD_LABEL_H}px`, margin: 0 }}>
      {locale === "fr" ? "Publicité" : "Advertisement"}
    </p>
  );
  // Reserve label + creative height up front.
  const frame = { maxWidth: d.w, minHeight: d.h + AD_LABEL_H } as const;
  const box = { maxWidth: d.w, height: d.h } as const;

  if (direct) {
    return (
      <div className="mx-auto w-full" style={frame}>
        {label}
        <a href={direct.href} target="_blank" rel="sponsored noopener" className="block overflow-hidden bg-ice" style={box}>
          <img src={direct.image} alt={direct.alt} width={d.w} height={d.h} className="img-cover" loading="lazy" decoding="async" />
        </a>
      </div>
    );
  }
  if (ADSENSE_CLIENT && ADSENSE_SLOTS[size]) {
    return (
      <div className="mx-auto w-full" style={frame}>
        {label}
        <AdSense slot={ADSENSE_SLOTS[size]!} w={d.w} h={d.h} />
      </div>
    );
  }
  return (
    <div className="mx-auto w-full" style={frame}>
      {label}
      <HouseAd size={size} placement={placement} />
    </div>
  );
}

/** An AdSense unit that loads the script and requests an ad only when it nears the viewport. */
function AdSense({ slot, w, h }: { slot: string; w: number; h: number }) {
  const ref = useRef<HTMLModElement>(null);
  const consent = useConsent();
  const [visible, setVisible] = useState(false);
  const pushed = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) { setVisible(true); return; }
    const io = new IntersectionObserver(entries => {
      // The copy for the other breakpoint is display:none: it has no width and never counts.
      if (entries.some(e => e.isIntersecting && e.boundingClientRect.width > 0)) { setVisible(true); io.disconnect(); }
    }, { rootMargin: "400px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !consent.ready || pushed.current) return;
    pushed.current = true;
    loadAdsense(personalisedAllowed(consent)).then(pushAd).catch(() => {});
  }, [visible, consent]);

  return (
    <ins
      ref={ref}
      className="adsbygoogle block mx-auto bg-ice"
      style={{ display: "block", width: "100%", maxWidth: w, height: h }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
    />
  );
}

const HOUSE = {
  advertise: {
    head: { en: "Put your brand in front of the people building AI.", fr: "Présentez votre marque à ceux qui bâtissent l'IA." },
    cta: { en: "See the media kit", fr: "Voir la trousse média" },
    to: "/advertise",
  },
  newsletter: {
    head: { en: "The Morning Broadsheet: the AI news that matters, before your first coffee.", fr: "Le Broadsheet du matin : l'essentiel de l'IA avant votre premier café." },
    cta: { en: "Get the briefing", fr: "Recevoir l'infolettre" },
    to: "/newsletter",
  },
  watch: {
    head: { en: "Watch the day in AI — newsroom video, lab demos and interviews.", fr: "Regardez la journée de l'IA — reportages, démos et entrevues." },
    cta: { en: "Open the Watch desk", fr: "Ouvrir la section Vidéos" },
    to: "/watch",
  },
  glossary: {
    head: { en: "Lost in AI jargon? 80+ terms explained in plain language.", fr: "Perdu dans le jargon de l'IA? Plus de 80 termes expliqués simplement." },
    cta: { en: "Open the glossary", fr: "Ouvrir le glossaire" },
    to: "/glossary",
  },
} as const;

const ROTATION: Record<Placement, keyof typeof HOUSE> = {
  "home-top": "advertise",
  "home-mid": "glossary",
  "home-right": "newsletter",
  "home-interviews": "advertise",
  story: "newsletter",
  section: "glossary",
  watch: "newsletter",
};

function HouseAd({ size, placement }: { size: AdSize; placement: Placement }) {
  const { pick } = useLocale();
  const h = HOUSE[ROTATION[placement]];
  const d = AD_DIMENSIONS[size];
  const tall = size === "mpu" || size === "halfpage";
  return (
    <Link
      to={h.to}
      className={`group relative flex overflow-hidden bg-night text-white border-t-[3px] border-brass ${tall ? "flex-col justify-between p-6" : "items-center justify-between gap-6 px-6 md:px-10"}`}
      style={{ height: d.h }}
    >
      <span className={`masthead-serif ${tall ? (size === "halfpage" ? "text-[2rem] leading-[1.1]" : "text-[1.45rem] leading-[1.15]") : size === "mobile" ? "text-[1.02rem] leading-snug" : "text-[1.35rem] md:text-[1.9rem] leading-[1.15] max-w-[32ch]"}`}>
        {pick(h.head)}
      </span>
      <span className={`shrink-0 inline-flex items-center rounded-[4px] bg-brass text-night font-bold group-hover:bg-white ${size === "mobile" ? "text-[0.8rem] px-2.5 py-1.5" : "text-[0.95rem] px-4 py-2.5"} ${tall ? "self-start" : ""}`}>
        {pick(h.cta)}
      </span>
    </Link>
  );
}
