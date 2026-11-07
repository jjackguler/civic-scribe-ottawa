/**
 * The Open Desk explainer (3 min 30 s, English narration), served from /public/open-desk.
 * A chapter list under the player jumps to each part and follows playback.
 */
import { useRef, useState } from "react";
import { useLocale } from "@/lib/locale-context";
import type { Bi } from "@/lib/i18n";

export const EXPLAINER = {
  src: "/open-desk/open-desk-explainer-en.mp4",
  poster: "/open-desk/explainer-poster.jpg",
  chapters: "/open-desk/explainer-chapters.vtt",
  duration: "PT3M30S",
  uploadDate: "2026-11-06",
};

const CHAPTERS: { t: number; label: Bi }[] = [
  { t: 0, label: { en: "A promise, then a cut", fr: "Une promesse, puis des suppressions" } },
  { t: 25.2, label: { en: "The number nobody checks", fr: "Le chiffre que personne ne vérifie" } },
  { t: 46.6, label: { en: "What Open Desk is", fr: "Ce qu'est Open Desk" } },
  { t: 58.9, label: { en: "Capture and break down", fr: "Capter et découper" } },
  { t: 85.6, label: { en: "Match", fr: "Rapprocher" } },
  { t: 110.3, label: { en: "Test, and the rule", fr: "Vérifier, et la règle" } },
  { t: 136.4, label: { en: "Witnesses", fr: "Témoins" } },
  { t: 153.3, label: { en: "Publish", fr: "Publier" } },
  { t: 177, label: { en: "Reopen", fr: "Rouvrir" } },
  { t: 195.5, label: { en: "The receipts", fr: "Les preuves" } },
];

const mmss = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

export function ExplainerVideo({ compact = false }: { compact?: boolean }) {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const ref = useRef<HTMLVideoElement>(null);
  const [now, setNow] = useState(0);
  const current = CHAPTERS.reduce((acc, c, n) => (now >= c.t ? n : acc), 0);
  return (
    <figure>
      <div className="relative aspect-video bg-ink overflow-hidden">
        <video
          ref={ref}
          controls
          playsInline
          preload="metadata"
          poster={EXPLAINER.poster}
          className="absolute inset-0 h-full w-full"
          onTimeUpdate={(e) => setNow(e.currentTarget.currentTime)}
          aria-label={fr ? "Vidéo explicative Open Desk, en anglais" : "Open Desk explainer video"}
        >
          <source src={EXPLAINER.src} type="video/mp4" />
          <track kind="chapters" src={EXPLAINER.chapters} srcLang="en" label="Chapters" default />
        </video>
      </div>
      {!compact && (
        <ol className="mt-3 flex flex-wrap gap-1.5" aria-label={fr ? "Chapitres" : "Chapters"}>
          {CHAPTERS.map((c, n) => (
            <li key={c.t}>
              <button
                type="button"
                onClick={() => {
                  const v = ref.current;
                  if (!v) return;
                  v.currentTime = c.t;
                  void v.play().catch(() => {});
                }}
                aria-current={n === current && now > 0 ? "true" : undefined}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.8rem] font-semibold transition-colors ${n === current && now > 0 ? "border-ink bg-ink text-white" : "border-line hover:border-ink"}`}
              >
                <span className="tabular-nums opacity-70">{mmss(c.t)}</span> {pick(c.label)}
              </button>
            </li>
          ))}
        </ol>
      )}
      <figcaption className="mt-3 text-[0.85rem] text-muted-ink leading-relaxed">
        {fr
          ? "Narration en anglais (voix de synthèse libre, Kokoro). Halvorsen Freight, son PDG, les anciens employés et les chiffres de l'indice sont fictifs, inventés pour montrer la méthode. Le chiffre de 87 714 est réel : Challenger, Gray & Christmas, annonces de suppressions d'emplois attribuées à l'IA aux États-Unis, janvier à mai 2026."
          : "Narrated in English with a synthetic open-source voice (Kokoro). Halvorsen Freight, its CEO, the former employees and the index numbers are fictional, made up to show the method. The 87,714 figure is real: Challenger, Gray & Christmas, AI-attributed U.S. job cut announcements, January–May 2026."}
      </figcaption>
    </figure>
  );
}
