import { SITE } from "./site";

/** A mailto: link to the editor, or null while no editor email is set. */
export function editorMailto(subject?: string, body?: string): string | null {
  if (!SITE.email.editor) return null;
  const q = new URLSearchParams();
  if (subject) q.set("subject", subject);
  if (body) q.set("body", body);
  const qs = q.toString().replace(/\+/g, "%20");
  return `mailto:${SITE.email.editor}${qs ? `?${qs}` : ""}`;
}
