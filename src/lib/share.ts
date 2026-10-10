/**
 * Share links, with UTM tags so we can count shares by network in our own
 * (cookieless) analytics. Plain links only: no network scripts, no pixels,
 * nothing loads from a social network until the reader taps.
 */
import { absUrl } from "./seo";
import type { Locale } from "./i18n";

export type ShareNetwork = "native" | "whatsapp" | "x" | "linkedin" | "facebook" | "reddit" | "copy" | "image";

/** Adds utm_source=share&utm_medium=<network> (and a campaign, when given) to an absolute URL. */
export function withUtm(url: string, medium: ShareNetwork, campaign?: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", "share");
    u.searchParams.set("utm_medium", medium);
    if (campaign) u.searchParams.set("utm_campaign", campaign);
    return u.toString();
  } catch {
    return url;
  }
}

/** The public address of a page: "/dispatch/x" → "https://aibroadsheet.com/fr/dispatch/x" for French. */
export function shareUrl(pathOrUrl: string, locale: Locale): string {
  return /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : absUrl(pathOrUrl, locale);
}

/** "aibroadsheet.com/dispatch/x": the address as printed on a card. */
export function displayUrl(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname === "/" ? "" : u.pathname.replace(/\/$/, "");
    return `${u.host.replace(/^www\./, "")}${path}`;
  } catch {
    return url;
  }
}

export type ShareTarget = { network: Exclude<ShareNetwork, "native" | "copy" | "image">; label: string; href: string };

/** Web share intents, in the order young readers use them. */
export function shareTargets(url: string, title: string, campaign?: string): ShareTarget[] {
  const u = (n: ShareNetwork) => encodeURIComponent(withUtm(url, n, campaign));
  const t = encodeURIComponent(title);
  return [
    { network: "whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${t}%20${u("whatsapp")}` },
    { network: "x", label: "X", href: `https://x.com/intent/post?text=${t}&url=${u("x")}` },
    { network: "linkedin", label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u("linkedin")}` },
    { network: "facebook", label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u("facebook")}` },
    { network: "reddit", label: "Reddit", href: `https://www.reddit.com/submit?url=${u("reddit")}&title=${t}` },
  ];
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers and some in-app webviews: a hidden textarea and execCommand.
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export const canNativeShare = () => typeof navigator !== "undefined" && typeof navigator.share === "function";

/** True when this browser can share an image file through the system sheet (most phones). */
export function canShareFiles(file: File): boolean {
  try {
    return canNativeShare() && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}
