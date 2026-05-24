import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { useLocale } from "@/lib/locale-context";
import { NEIGHBORHOODS } from "@/lib/data";
import { useState } from "react";
import { Upload, Shield } from "lucide-react";

export const Route = createFileRoute("/submit")({
  head: () => ({ meta: [{ title: "Submit a Story — Ottawa Civic Ledger" }, { name: "description", content: "Submit a citizen story, tip, or document. Anonymity available." }] }),
  component: SubmitPage,
});

function SubmitPage() {
  const { locale } = useLocale();
  const [ok, setOk] = useState(false);

  return (
    <PageShell narrow>
      <PageHero
        kicker={locale === "fr" ? "Soumettre" : "Submit"}
        title={locale === "fr" ? "Racontez ce que vous voyez. Avec dignité, contexte et soin." : "Tell us what you see — with dignity, context, and care."}
        dek={locale === "fr" ? "Notre équipe lit chaque soumission. Vous pouvez rester anonyme." : "Our team reads every submission. You can stay anonymous."}
      />

      {ok ? (
        <div className="bg-solution/10 border-l-4 border-solution p-6">
          <h2 className="font-display text-2xl">{locale === "fr" ? "Reçu. Merci." : "Received. Thank you."}</h2>
          <p className="mt-2 font-serif">{locale === "fr" ? "Statut : reçu. Nos éditeurs reviendront vers vous si vous avez fourni un contact." : "Status: received. Our editors will follow up if you provided contact information."}</p>
        </div>
      ) : (
      <form onSubmit={(e) => { e.preventDefault(); setOk(true); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="space-y-6">
        <Field label={locale === "fr" ? "Titre" : "Title"}>
          <input required maxLength={150} className="input" />
        </Field>
        <div className="grid sm:grid-cols-2 gap-6">
          <Field label={locale === "fr" ? "Quartier" : "Neighborhood"}>
            <select className="input" defaultValue="">
              <option value="" disabled>{locale === "fr" ? "Choisir…" : "Choose…"}</option>
              {NEIGHBORHOODS.map(n => <option key={n}>{n}</option>)}
            </select>
          </Field>
          <Field label={locale === "fr" ? "Catégorie" : "Category"}>
            <select className="input" defaultValue="">
              <option value="" disabled>{locale === "fr" ? "Choisir…" : "Choose…"}</option>
              {["Traffic","Politics","Education","Arts","Sports","Solutions","Good news","Investigation","Other"].map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <Field label={locale === "fr" ? "Description" : "Description"}>
          <textarea required maxLength={2000} rows={6} className="input font-serif" placeholder={locale === "fr" ? "Décrivez ce que vous avez vu. Soyez précis et factuel." : "Describe what you saw. Be specific and factual."} />
        </Field>
        <Field label={locale === "fr" ? "Pièces jointes (photo, vidéo, document)" : "Attachments (photo, video, document)"}>
          <label className="flex items-center gap-2 border border-dashed border-rule p-4 cursor-pointer hover:bg-secondary text-sm">
            <Upload className="h-4 w-4" /> {locale === "fr" ? "Glisser ou cliquer pour téléverser" : "Drag or click to upload"}
            <input type="file" multiple className="hidden" />
          </label>
        </Field>

        <div className="grid sm:grid-cols-2 gap-6">
          <Check label={locale === "fr" ? "Témoignage direct" : "This is firsthand"} />
          <Check label={locale === "fr" ? "J'ai des preuves" : "I have evidence"} />
          <Check label={locale === "fr" ? "Les éditeurs peuvent me contacter" : "Editors may contact me"} />
          <Check label={locale === "fr" ? "Soumission anonyme" : "Submit anonymously"} />
        </div>

        <div className="bg-secondary p-5 flex gap-3 items-start">
          <Shield className="h-5 w-5 text-civic-red shrink-0 mt-0.5" />
          <div className="text-sm font-serif">
            <strong className="font-sans uppercase text-xs tracking-wider">{locale === "fr" ? "Rappel sécurité et droit" : "Safety and legal reminder"}</strong>
            <p className="mt-1">{locale === "fr"
              ? "Ne vous mettez pas en danger. Ne nommez pas de mineurs ni de victimes sans consentement. Évitez les accusations non fondées."
              : "Do not put yourself at risk. Do not name minors or victims without consent. Avoid unsupported accusations."}</p>
          </div>
        </div>

        <Check required label={locale === "fr" ? "Je consens à la publication selon les standards éditoriaux." : "I consent to publication under the editorial standards."} />

        <button type="submit" className="w-full bg-civic-red text-white py-3 text-sm uppercase tracking-wider font-semibold hover:bg-ink transition-colors">
          {locale === "fr" ? "Envoyer la soumission" : "Submit story"}
        </button>
      </form>
      )}

      <style>{`.input { width: 100%; background: var(--paper); border: 1px solid var(--rule); padding: 0.75rem 1rem; font-family: var(--font-sans); font-size: 0.95rem; }
        .input:focus { outline: 2px solid var(--ring); outline-offset: 1px; }`}</style>
    </PageShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="kicker text-muted-foreground block mb-2">{label}</span>
      {children}
    </label>
  );
}
function Check({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="flex items-start gap-2 text-sm font-serif">
      <input type="checkbox" required={required} className="mt-1 accent-[var(--civic-red)]" /> <span>{label}{required && " *"}</span>
    </label>
  );
}
