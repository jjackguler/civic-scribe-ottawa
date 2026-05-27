import type { AnyEditorial, MediaAsset } from "@/types/editorial";

export function isSensitiveTopic(a: AnyEditorial): boolean {
  if (a.sensitive_topic) return true;
  const tags = (a.topic_tags || []).map(t => t.toLowerCase());
  return tags.some(t => /(crime|minor|victim|homicide|assault|safety|abuse)/.test(t));
}

export function commentsAllowed(a: AnyEditorial): boolean {
  if (a.type === "satire" || a.type === "cartoon") return false;
  if (isSensitiveTopic(a)) return false;
  return a.comments_enabled !== false ? a.comments_enabled === true : false;
}

export function lettersCTAAllowed(a: AnyEditorial): boolean {
  if (a.type === "letter") return false;
  if (isSensitiveTopic(a)) return false;
  if (a.type === "satire") return false;
  return true;
}

export function mediaConsentOK(asset: MediaAsset | undefined): boolean {
  if (!asset) return true;
  if (!asset.rights_status) return false;
  return true;
}
