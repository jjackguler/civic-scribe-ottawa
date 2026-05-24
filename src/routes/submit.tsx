import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { useLocale } from "@/lib/locale-context";
import { NEIGHBORHOODS } from "@/lib/data";
import { useState } from "react";
import { Upload, Shield, CheckCircle2, ArrowRight } from "lucide-react";
import { t } from "@/lib/i18n";
import type { ReactNode } from "react";

export const Route = createFileRoute("/submit")({
  head: () => ({ meta: [
    { title: "Submit a Story — Ottawa Civic Ledger" },
    { name: "description", content: "Submit a citizen story, tip, or document. Anonymity available." },
    { property: "og:title", content: "Submit a Story — Ottawa Civic Ledger" },
    { property: "og:description", content: "Citizen reports. Editors verify. Anonymity available." },
  ] }),
  component: SubmitPage,
});

function SubmitPage() {
  const { locale } = useLocale();
  const [ok, setOk] = useState(false);
  const [anonymous, setAnonymous] = useState(false);

  const steps = [
    { n: 1, label: locale === "fr" ? "Décrivez" : "Describe" },
    { n: 2, label: locale === "fr" ? "Documentez" : "Document" },
    { n: 3, label: locale === "fr" ? "Confirmez" : "Confirm" },
  ];

  return (
    <PageShell narrow>
      <PageHero
        kicker={locale === "fr" ? "Soumettre" : "Submit"}
        title={locale === "fr" ? "Racontez ce que vous voyez. Avec dignité, contexte et soin." : "Tell us what you see — with dignity, context, and care."}
        dek={locale === "fr" ? "Notre équipe lit chaque soumission. Vous pouvez rester anonyme." : "Our team reads every submission. You can stay anonymous."}
      />

      {ok ? (
        <div className="bg-solution/10 border-l-4 border-solution p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 text-solution shrink-0 mt-0.5" />
            <div>
              <h2 className="font-display text-3xl">{locale === "fr" ? "Reçu. Merci." : "Received. Thank you."}</h2>
              <p className="mt-2 font-serif text-foreground/85">
                {locale === "fr" ? "Statut : reçu. Référence : OCL-" : "Status: received. Reference: OCL-"}
                {Math.random().toString(36).slice(2, 8).toUpperCase()}
              </p>
              <p className="mt-2 font-serif text-sm text-muted-foreground">
                {locale === "fr" ? "Nos éditeurs reviendront vers vous sous 48 h si vous avez fourni un contact." : "Our editors will follow up within 48 hours if you provided contact information."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <ol className="flex items-center gap-2 mb-8 text-[11px] uppercase tracking-wider font-semibold flex-wrap">
            {steps.map((s, i) => (
              <li key={s.n} className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full border border-ink inline-flex items-center justify-center text-[11px]">{s.n}</span>
                <span className="text-foreground/80">{s.label}</span>
                {i < steps.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground mx-1" />}
              </li>
            ))}
          </ol>

          <form onSubmit={(e) => { e.preventDefault(); setOk(true); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="space-y-7">
            <Section kicker="1" title={locale === "fr" ? "Décrivez l'histoire" : "Describe the story"}>
              <Field label={t("submitTitle", locale)}>
                <input required maxLength={150} className="input" placeholder={locale === "fr" ? "Une phrase claire" : "One clear sentence"} />
              </Field>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label={t("submitNeighborhood", locale)}>
                  <select required className="input" defaultValue="">
                    <option value="" disabled>{locale === "fr" ? "Choisir…" : "Choose…"}</option>
                    {NEIGHBORHOODS.map(n => <option key={n}>{n}</option>)}
                  </select>
                </Field>
                <Field label={t("submitCategory", locale)}>
                  <select required className="input" defaultValue="">
                    <option value="" disabled>{locale === "fr" ? "Choisir…" : "Choose…"}</option>
                    {["Traffic","Politics","Education","Arts","Sports","Solutions","Good news","Investigation","Other"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <Field label={t("submitDescription", locale)}>
                <textarea required maxLength={2000} rows={6} className="input font-serif" placeholder={locale === "fr" ? "Décrivez ce que vous avez vu. Soyez précis et factuel." : "Describe what you saw. Be specific and factual."} />
              </Field>
            </Section>

            <Section kicker="2" title={locale === "fr" ? "Documentez (facultatif)" : "Document (optional)"}>
              <Field label={t("attachments", locale)}>
                <label className="flex items-center gap-3 border border-dashed border-rule p-5 cursor-pointer hover:bg-secondary text-sm transition-colors">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="font-serif">{locale === "fr" ? "Glisser ou cliquer pour téléverser" : "Drag or click to upload"}</span>
                  <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:inline">PDF · JPG · MP4 · ≤ 25 MB</span>
                  <input type="file" multiple className="hidden" />
                </label>
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Check label={locale === "fr" ? "Témoignage direct" : "This is firsthand"} />
                <Check label={locale === "fr" ? "J'ai des preuves" : "I have evidence"} />
              </div>
            </Section>

            <Section kicker="3" title={locale === "fr" ? "Vous & sécurité" : "You & safety"}>
              <Check label={locale === "fr" ? "Soumission anonyme — ne demandez aucun contact" : "Submit anonymously — don't request my contact"} onToggle={setAnonymous} />
              {!anonymous && (
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label={t("email", locale)}>
                    <input type="email" className="input" placeholder="you@example.com" />
                  </Field>
                  <Field label={t("phone", locale)}>
                    <input type="tel" className="input" placeholder="(613) 555-0142" />
                  </Field>
                </div>
              )}

              <div className="bg-secondary p-5 flex gap-3 items-start">
                <Shield className="h-5 w-5 text-civic-red shrink-0 mt-0.5" />
                <div className="text-sm font-serif">
                  <strong className="font-sans uppercase text-xs tracking-wider">{locale === "fr" ? "Rappel sécurité et droit" : "Safety and legal reminder"}</strong>
                  <p className="mt-1 text-foreground/85">{locale === "fr"
                    ? "Ne vous mettez pas en danger. Ne nommez pas de mineurs ni de victimes sans consentement. Évitez les accusations non fondées."
                    : "Do not put yourself at risk. Do not name minors or victims without consent. Avoid unsupported accusations."}</p>
                </div>
              </div>

              <Check required label={locale === "fr" ? "Je consens à la publication selon les standards éditoriaux." : "I consent to publication under the editorial standards."} />
            </Section>

            <button type="submit" className="w-full bg-civic-red text-white py-4 text-sm uppercase tracking-wider font-semibold hover:bg-ink transition-colors">
              {t("submitStory", locale)}
            </button>
          </form>
        </>
      )}

      <style>{`.input { width: 100%; background: var(--paper); border: 1px solid var(--rule); padding: 0.75rem 1rem; font-family: var(--font-sans); font-size: 0.95rem; transition: border-color 0.15s; }
        .input:focus { outline: none; border-color: var(--civic-red); box-shadow: 0 0 0 3px color-mix(in oklab, var(--civic-red) 15%, transparent); }`}</style>
    </PageShell>
  );
}

function Section({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
  return (
    <section className="border-l-2 border-rule pl-5 space-y-5">
      <header>
        <span className="kicker text-civic-red">— {kicker} —</span>
        <h2 className="font-display text-2xl mt-1">{title}</h2>
      </header>
      {children}
    </section>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="kicker text-muted-foreground block mb-2">{label}</span>
      {children}
    </label>
  );
}
function Check({ label, required, onToggle }: { label: string; required?: boolean; onToggle?: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-2 text-sm font-serif cursor-pointer">
      <input type="checkbox" required={required} onChange={e => onToggle?.(e.target.checked)} className="mt-1 accent-[var(--civic-red)]" />
      <span>{label}{required && " *"}</span>
    </label>
  );
}
