/**
 * Advertising set-up. Three layers, filled in order for every slot:
 *
 * 1. DIRECT — campaigns you sell yourself (best margins). Add the
 *    advertiser's image, link and the placements it should run in.
 * 2. Google AdSense — programmatic fill. Once your AdSense account is
 *    approved, set ADSENSE_CLIENT ("ca-pub-…") and one ad-unit ID per size,
 *    then add public/ads.txt with the line Google gives you.
 * 3. House ads — our own promotions, so a slot is never an empty box.
 *
 * Every ad is labelled "Advertisement" and kept visually apart from news.
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

export const ADSENSE_CLIENT = ""; // e.g. "ca-pub-1234567890123456"
export const ADSENSE_SLOTS: Partial<Record<AdSize, string>> = {
  // billboard: "1234567890",
};

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
