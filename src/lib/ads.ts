/**
 * Advertising set-up. Three layers, filled in order for every slot:
 *
 * 1. DIRECT — campaigns you sell yourself (best margins). Add the
 *    advertiser's image, link and the placements it should run in.
 * 2. Google AdSense — programmatic fill. Once your AdSense account is
 *    approved, set ADSENSE_CLIENT ("ca-pub-…") and one ad-unit ID per size.
 *    /ads.txt is generated from ADSENSE_CLIENT (src/routes/ads[.]txt.ts), so
 *    there is no file to copy; add other sellers to ADS_TXT_EXTRA.
 * 3. House ads — our own promotions, so a slot is never an empty box.
 *
 * Rules (see /standards and /advertise):
 * - Every ad is labelled "Advertisement" / "Publicité" and boxed apart from
 *   the news; space is reserved so nothing jumps when it loads.
 * - No ads, and no ad script, on children's pages (Young Lab), the Keeper
 *   (/ask), /values, internal tools, and error pages (AD_FREE below).
 * - Ads are non-personalised until the reader agrees (src/lib/consent.ts),
 *   and a Global Privacy Control signal always means non-personalised.
 * - The AdSense script loads only when a slot is about to scroll into view,
 *   never in <head>, so it costs nothing on pages without ads.
 */

export type AdSize = "billboard" | "leaderboard" | "mpu" | "halfpage" | "mobile";
export type Placement = "home-top" | "home-mid" | "home-right" | "home-interviews" | "story" | "section" | "watch";

export const AD_DIMENSIONS: Record<AdSize, { w: number; h: number; label: string }> = {
  billboard: { w: 970, h: 250, label: "Billboard 970 × 250" },
  leaderboard: { w: 728, h: 90, label: "Leaderboard 728 × 90" },
  mpu: { w: 300, h: 250, label: "Medium rectangle 300 × 250" },
  halfpage: { w: 300, h: 600, label: "Half page 300 × 600" },
  mobile: { w: 320, h: 100, label: "Mobile banner 320 × 100" },
};

/** Height of the "Advertisement" label row above every slot (px). Part of the reserved space. */
export const AD_LABEL_H = 20;

/** TODO [ADSENSE_CLIENT] — e.g. "ca-pub-1234567890123456". Empty = AdSense off (house ads and direct campaigns only). */
export const ADSENSE_CLIENT: string = "";
export const ADSENSE_SLOTS: Partial<Record<AdSize, string>> = {
  // billboard: "1234567890",
};
/** Extra ads.txt lines for other authorised sellers (e.g. a direct-sold network). One line per seller. */
export const ADS_TXT_EXTRA: string[] = [];

/** Google's certification authority ID for AdSense in ads.txt. */
const GOOGLE_TAG_ID = "f08c47fec0942fa0";

/** The /ads.txt body. "pub-…" is the publisher ID without the "ca-" prefix. */
export function adsTxt(): string {
  const lines = ["# ads.txt for AI Broadsheet — authorised digital sellers (IAB Tech Lab).", "# Generated from ADSENSE_CLIENT in src/lib/ads.ts."];
  if (ADSENSE_CLIENT) lines.push(`google.com, ${ADSENSE_CLIENT.replace(/^ca-/, "")}, DIRECT, ${GOOGLE_TAG_ID}`);
  else lines.push("# No programmatic sellers are authorised yet. Set ADSENSE_CLIENT once AdSense approves the site.");
  lines.push(...ADS_TXT_EXTRA);
  return `${lines.join("\n")}\n`;
}

/**
 * Pages that never show ads or load ad code. Matched against the path
 * without the /fr prefix.
 */
export const AD_FREE: RegExp[] = [
  /^\/labs\/young(\/|$)/, // children's pages
  /^\/ask(\/|$)/, // the Keeper
  /^\/values(\/|$)/,
  /^\/editor\/tools(\/|$)/,
  /^\/privacy(\/|$)/,
];

/** False on ad-free pages. `path` may be a public path (with /fr) or an internal one. */
export function adsAllowed(path: string): boolean {
  const p = path.replace(/^\/fr(?=\/|$)/, "") || "/";
  return !AD_FREE.some(re => re.test(p));
}

export type DirectCampaign = {
  advertiser: string;
  href: string;
  /** Image sized for the slot (supplied by the advertiser). */
  image: string;
  alt: string;
  sizes: AdSize[];
  placements?: Placement[];
  /** ISO dates; the campaign runs only between them. */
  start: string;
  end: string;
};

export const DIRECT_CAMPAIGNS: DirectCampaign[] = [];

export function directFor(size: AdSize, placement: Placement, now = Date.now()) {
  return DIRECT_CAMPAIGNS.find(c =>
    c.sizes.includes(size) &&
    (!c.placements || c.placements.includes(placement)) &&
    now >= Date.parse(c.start) && now <= Date.parse(c.end));
}

// ── AdSense loader (client only) ────────────────────────────────────────────

type AdsWindow = Window & { adsbygoogle?: unknown[] & { requestNonPersonalizedAds?: number; pauseAdRequests?: number } };
let adsenseLoading: Promise<void> | null = null;

/**
 * Load adsbygoogle.js once, on demand. Before it loads we set the ad request
 * mode from the reader's consent: non-personalised unless they agreed.
 */
export function loadAdsense(personalised: boolean): Promise<void> {
  if (typeof window === "undefined" || !ADSENSE_CLIENT) return Promise.resolve();
  const w = window as AdsWindow;
  w.adsbygoogle = w.adsbygoogle || ([] as unknown as NonNullable<AdsWindow["adsbygoogle"]>);
  w.adsbygoogle.requestNonPersonalizedAds = personalised ? 0 : 1;
  if (adsenseLoading) return adsenseLoading;
  adsenseLoading = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    s.async = true;
    s.crossOrigin = "anonymous";
    s.onload = () => resolve();
    s.onerror = () => { adsenseLoading = null; reject(new Error("adsense blocked")); };
    document.head.appendChild(s);
  });
  return adsenseLoading;
}

/** Ask AdSense to fill one <ins class="adsbygoogle"> that is now on screen. */
export function pushAd() {
  try { const w = window as AdsWindow; (w.adsbygoogle = w.adsbygoogle || ([] as unknown as NonNullable<AdsWindow["adsbygoogle"]>)).push({}); } catch { /* ad blockers */ }
}
