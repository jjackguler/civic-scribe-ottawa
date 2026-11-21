import { useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/site";

/**
 * beehiiv's own embedded sign-up form (email + optional school name), only on
 * /newsletter. The reader came to sign up, so the form loads with the page.
 * beehiiv's attribution script passes the page's utm_* tags on, so a teacher
 * coming from a Young Lab game is still credited to that game.
 * Until beehiiv's script loads (or if it is blocked), `fallback` (a plain link to beehiiv) shows.
 */
export function BeehiivForm({
  fallback,
  note,
}: {
  fallback: React.ReactNode;
  note: React.ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const id = SITE.newsletter.embedFormId;
  useEffect(() => {
    const el = box.current;
    if (!el || !id) return;
    const form = document.createElement("script");
    form.async = true;
    form.src = "https://subscribe-forms.beehiiv.com/v3/loader.js";
    form.setAttribute("data-beehiiv-form", id);
    form.onload = () => setLoaded(true);
    el.appendChild(form);
    if (!document.getElementById("beehiiv-attribution")) {
      const attr = document.createElement("script");
      attr.id = "beehiiv-attribution";
      attr.async = true;
      attr.src = "https://subscribe-forms.beehiiv.com/attribution.js";
      document.body.appendChild(attr);
    }
    return () => {
      el.replaceChildren();
    };
  }, [id]);
  return (
    <div>
      <div ref={box} className="min-h-[1px]" />
      {!loaded && fallback}
      {note}
    </div>
  );
}
