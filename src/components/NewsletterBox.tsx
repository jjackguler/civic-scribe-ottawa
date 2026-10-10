import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";

/**
 * "The Morning Broadsheet" sign-up. Sends the reader to the newsletter
 * provider's own subscribe page with the address filled in, so we never
 * store emails ourselves.
 */
export function NewsletterBox({ variant = "band" }: { variant?: "band" | "card" }) {
  const { locale } = useLocale();
  const [email, setEmail] = useState("");
  const ready = !!SITE.newsletter.url;
  const provider = SITE.newsletter.provider;
  const fr = locale === "fr";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    const url = new URL("/subscribe", SITE.newsletter.url);
    url.searchParams.set("email", email);
    window.open(url.toString(), "_blank", "noopener");
  };

  return (
    <div className={variant === "band" ? "grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center" : ""}>
      <div>
        <p className="text-brass font-bold text-sm">{fr ? "Infolettre quotidienne" : "Daily newsletter"}</p>
        <h2 className={`masthead-serif leading-[1.08] mt-1 ${variant === "band" ? "text-[2rem] sm:text-[2.4rem]" : "text-[1.6rem]"}`}>The Morning Broadsheet</h2>
        <p className={`font-serif text-white/75 leading-relaxed mt-2 max-w-[52ch] ${variant === "band" ? "text-[1.08rem]" : "text-[0.98rem]"}`}>
          {fr
            ? "Les nouvelles en IA qui comptent, dans votre boîte chaque matin. Sources nommées, liens vers les originaux, erreurs corrigées publiquement."
            : "The AI stories that matter, in your inbox each morning. Named sources, links to the originals, mistakes corrected in public."}
        </p>
      </div>
      <form onSubmit={submit} className={variant === "band" ? "" : "mt-5"}>
        <label htmlFor={`nl-${variant}`} className="sr-only">{fr ? "Adresse courriel" : "Email address"}</label>
        <div className={`flex flex-col gap-2 ${variant === "band" ? "sm:flex-row" : ""}`}>
          <input
            id={`nl-${variant}`}
            type="email"
            required
            disabled={!ready}
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={fr ? "vous@exemple.com" : "you@example.com"}
            className="flex-1 min-w-0 h-12 px-4 rounded-[4px] bg-white text-ink placeholder:text-muted-ink disabled:opacity-60"
          />
          <button type="submit" disabled={!ready} className="h-12 px-5 rounded-[4px] bg-brass text-night font-bold hover:bg-white disabled:hover:bg-brass disabled:opacity-70">
            {ready ? (fr ? "M'abonner" : "Subscribe") : (fr ? "Bientôt" : "Opening soon")}
          </button>
        </div>
        <p className="text-white/55 text-[0.82rem] mt-2 max-w-[52ch]">
          {ready
            ? (fr
                ? `Gratuit. Vous confirmez votre abonnement sur la page ${provider ? `de ${provider}` : "de notre fournisseur"}; nous ne conservons jamais votre courriel. Désabonnement en un clic.`
                : `Free. You confirm your subscription on ${provider ? `${provider}'s` : "our provider's"} page; we never store your email. Unsubscribe in one click.`)
            : (fr ? "Les inscriptions ouvrent avec le premier numéro." : "Sign-ups open with the first issue.")}
        </p>
      </form>
    </div>
  );
}
