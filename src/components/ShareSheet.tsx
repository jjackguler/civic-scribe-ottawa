/**
 * "Share as image": makes a story card in the browser (no server), shows it,
 * and offers the phone's share sheet with the image, a download, and the link.
 *
 *   <ShareImageButton content={dispatchCard(d, locale)} url={`/dispatch/${d.id}`} title={headline} />
 *   <ShareSheet open={open} onOpenChange={setOpen} content={…} url="/quiz" title="…" />
 *
 * The reader picks a look (collage, signal, front page) and a size (post 4:5
 * or story 9:16). Their choice is remembered in this browser only.
 */
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useMemo, useRef, useState } from "react";
import { Download, ImageIcon, Link2, Check, Share2, X } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { CARD_FORMATS, CARD_TEMPLATES, canvasToBlob, cardFileName, renderShareCard, templatesFor, type CardFormat, type CardTemplate, type ShareCardContent } from "@/lib/share-cards";
import { canShareFiles, copyText, shareUrl, withUtm } from "@/lib/share";
import { ShareBar } from "./ShareBar";

const COPY = {
  en: {
    button: "Share as image",
    title: "Share as image",
    desc: "Made on your device. Pick a look and a size, then share or save it.",
    look: "Look",
    size: "Size",
    making: "Making your card…",
    failed: "This browser couldn't make the image. You can still share the link.",
    shareImage: "Share image",
    download: "Download",
    copy: "Copy link",
    copied: "Link copied",
    saved: "Saved to your downloads",
    shared: "Shared",
    orLink: "Or share the link",
    close: "Close",
    alt: (h: string) => `Share card: ${h}`,
    note: "Cards use our own artwork and type, never someone's photo.",
  },
  fr: {
    button: "Partager en image",
    title: "Partager en image",
    desc: "Fabriquée sur votre appareil. Choisissez un style et un format, puis partagez-la ou enregistrez-la.",
    look: "Style",
    size: "Format",
    making: "Fabrication de votre carte…",
    failed: "Ce navigateur n'a pas pu créer l'image. Vous pouvez quand même partager le lien.",
    shareImage: "Partager l'image",
    download: "Télécharger",
    copy: "Copier le lien",
    copied: "Lien copié",
    saved: "Enregistrée dans vos téléchargements",
    shared: "Partagée",
    orLink: "Ou partagez le lien",
    close: "Fermer",
    alt: (h: string) => `Carte à partager : ${h}`,
    note: "Nos cartes utilisent nos propres illustrations et caractères, jamais la photo de quelqu'un.",
  },
};

const PREF = "aib-share-card-v1";
function readPref(): { template?: CardTemplate; format?: CardFormat } {
  try { return JSON.parse(localStorage.getItem(PREF) ?? "{}") ?? {}; } catch { return {}; }
}
function writePref(p: { template: CardTemplate; format: CardFormat }) {
  try { localStorage.setItem(PREF, JSON.stringify(p)); } catch { /* private mode */ }
}

export function ShareSheet({ open, onOpenChange, content, url, title, campaign }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: ShareCardContent;
  /** Site path or absolute URL of the page the card is about. */
  url: string;
  title: string;
  campaign?: string;
}) {
  const { locale } = useLocale();
  const T = COPY[locale];
  const allowed = templatesFor(content);
  const [template, setTemplate] = useState<CardTemplate>(allowed[0]);
  const [format, setFormat] = useState<CardFormat>("portrait");
  const [img, setImg] = useState<{ src: string; blob: Blob } | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [status, setStatus] = useState("");
  const [fileShare, setFileShare] = useState(false);
  const abs = shareUrl(url, locale);
  const key = useMemo(() => JSON.stringify(content), [content]);
  const lastSrc = useRef<string | null>(null);

  // The reader's last look and size.
  useEffect(() => {
    if (!open) return;
    const p = readPref();
    if (p.template && allowed.includes(p.template)) setTemplate(p.template);
    else setTemplate(allowed[0]);
    if (p.format === "portrait" || p.format === "story") setFormat(p.format);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setBusy(true);
    setFailed(false);
    renderShareCard(content, template, format)
      .then(canvasToBlob)
      .then(blob => {
        if (cancelled) return;
        const src = URL.createObjectURL(blob);
        if (lastSrc.current) URL.revokeObjectURL(lastSrc.current);
        lastSrc.current = src;
        setImg({ src, blob });
        setFileShare(canShareFiles(new File([blob], "card.png", { type: "image/png" })));
      })
      .catch(() => { if (!cancelled) setFailed(true); })
      .finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, [open, key, template, format]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { if (lastSrc.current) URL.revokeObjectURL(lastSrc.current); }, []);
  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(""), 2800);
    return () => clearTimeout(t);
  }, [status]);

  const choose = (t: CardTemplate, f: CardFormat) => { setTemplate(t); setFormat(f); writePref({ template: t, format: f }); };
  const name = cardFileName(content, template, format);

  const shareImage = async () => {
    if (!img) return;
    const file = new File([img.blob], name, { type: "image/png" });
    try {
      // The link goes in the text: some apps drop `url` when a file is attached.
      await navigator.share({ files: [file], title, text: `${title}\n${withUtm(abs, "image", campaign)}` });
      setStatus(T.shared);
    } catch { /* closed by the reader */ }
  };
  const download = () => {
    if (!img) return;
    const a = document.createElement("a");
    a.href = img.src;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setStatus(T.saved);
  };
  const copy = async () => { if (await copyText(withUtm(abs, "copy", campaign))) setStatus(T.copied); };

  const [W, H] = format === "story" ? [9, 16] : [4, 5];
  const chip = (on: boolean) =>
    `press flex min-h-11 flex-col items-start justify-center rounded-[6px] border-2 px-3 py-1.5 text-left leading-tight ${on ? "border-night bg-night text-white" : "border-line bg-surface text-ink hover:border-night"}`;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="social-overlay fixed inset-0 z-[80] bg-night/70 backdrop-blur-[2px]" />
        <Dialog.Content
          className="social-sheet fixed inset-x-0 bottom-0 z-[81] max-h-[94svh] overflow-y-auto rounded-t-[16px] bg-paper text-ink shadow-[0_-12px_40px_rgba(0,0,0,0.35)] outline-none md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[92svh] md:w-[min(1080px,94vw)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[14px]"
          onKeyDown={e => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 flex items-center border-b border-line bg-paper/95 px-4 py-2 backdrop-blur md:hidden">
            <span className="mx-auto mt-1 block h-1.5 w-12 rounded-full bg-line" aria-hidden="true" />
          </div>
          <div className="grid gap-5 px-4 pb-6 pt-3 md:grid-cols-[minmax(0,1fr)_380px] md:gap-8 md:px-6 md:pb-7 md:pt-6">
            {/* Preview */}
            <div className="order-2 md:order-1">
              <div className="grid place-items-center rounded-[10px] bg-night p-3 sm:p-5" style={{ minHeight: 240 }}>
                <div className="relative w-full" style={{ maxWidth: format === "story" ? "min(300px, 100%)" : "min(420px, 100%)", aspectRatio: `${W} / ${H}` }}>
                  {img && !failed && (
                    <img
                      src={img.src}
                      alt={T.alt(content.headline)}
                      className={`absolute inset-0 h-full w-full rounded-[6px] object-contain shadow-[0_14px_40px_rgba(0,0,0,0.45)] ${busy ? "opacity-60" : "social-card-in"}`}
                    />
                  )}
                  {(busy || !img) && !failed && (
                    <div className="absolute inset-0 grid place-items-center">
                      <p className="flex items-center gap-2 rounded-full bg-night/80 px-3 py-1.5 text-[0.85rem] font-semibold text-white" role="status">
                        <span className="live-dot" aria-hidden="true" />{T.making}
                      </p>
                    </div>
                  )}
                  {failed && <p className="absolute inset-0 grid place-items-center p-4 text-center font-semibold text-white" role="alert">{T.failed}</p>}
                </div>
              </div>
              <p className="meta mt-2">{T.note}</p>
            </div>

            {/* Controls */}
            <div className="order-1 min-w-0 md:order-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Dialog.Title className="hl text-[1.5rem]">{T.title}</Dialog.Title>
                  <Dialog.Description className="mt-1 text-[0.95rem] leading-snug text-muted-ink">{T.desc}</Dialog.Description>
                </div>
                <Dialog.Close className="press -mr-2 -mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full hover:bg-ice" aria-label={T.close}>
                  <X className="h-6 w-6" aria-hidden="true" />
                </Dialog.Close>
              </div>

              {allowed.length > 1 && (
                <fieldset className="mt-4">
                  <legend className="text-[0.82rem] font-bold text-muted-ink">{T.look}</legend>
                  <div className="mt-1.5 grid grid-cols-3 gap-2">
                    {CARD_TEMPLATES.filter(t => allowed.includes(t.id)).map(t => (
                      <button key={t.id} type="button" aria-pressed={template === t.id} onClick={() => choose(t.id, format)} className={chip(template === t.id)}>
                        <span className="text-[0.95rem] font-bold">{t.label[locale]}</span>
                        <span className={`text-[0.72rem] ${template === t.id ? "text-white/75" : "text-muted-ink"}`}>{t.hint[locale]}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              <fieldset className="mt-4">
                <legend className="text-[0.82rem] font-bold text-muted-ink">{T.size}</legend>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {CARD_FORMATS.map(fm => (
                    <button key={fm.id} type="button" aria-pressed={format === fm.id} onClick={() => choose(template, fm.id)} className={chip(format === fm.id)}>
                      <span className="text-[0.95rem] font-bold">{fm.label[locale]}</span>
                      <span className={`text-[0.72rem] ${format === fm.id ? "text-white/75" : "text-muted-ink"}`}>{fm.hint[locale]} · {fm.id === "story" ? "1080×1920" : "1080×1350"}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="mt-5 grid gap-2">
                {fileShare && (
                  <button type="button" onClick={shareImage} disabled={!img || busy} className="press inline-flex min-h-12 items-center justify-center gap-2 bg-signal px-5 font-bold text-signal-ink hover:brightness-95 disabled:opacity-60">
                    <Share2 className="h-5 w-5" aria-hidden="true" />{T.shareImage}
                  </button>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={download} disabled={!img || busy} className={`press inline-flex min-h-12 items-center justify-center gap-2 px-4 font-bold disabled:opacity-60 ${fileShare ? "border-2 border-night bg-surface text-ink hover:bg-ice" : "bg-signal text-signal-ink hover:brightness-95"}`}>
                    <Download className="h-5 w-5" aria-hidden="true" />{T.download}
                  </button>
                  <button type="button" onClick={copy} className="press inline-flex min-h-12 items-center justify-center gap-2 border-2 border-night bg-surface px-4 font-bold text-ink hover:bg-ice">
                    {status === T.copied ? <Check className="h-5 w-5" aria-hidden="true" /> : <Link2 className="h-5 w-5" aria-hidden="true" />}{T.copy}
                  </button>
                </div>
                <p className="min-h-[1.4em] text-[0.9rem] font-semibold text-spruce" aria-live="polite">{status}</p>
              </div>

              <div className="mt-1 border-t border-line pt-4">
                <p className="text-[0.82rem] font-bold text-muted-ink">{T.orLink}</p>
                <ShareBar url={abs} title={title} campaign={campaign} heading={false} className="mt-2" />
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** The "Share as image" button and its sheet. */
export function ShareImageButton({ content, url, title, campaign, tone = "light", compact = false, className = "", onOpenChange }: {
  content: ShareCardContent;
  url: string;
  title: string;
  campaign?: string;
  /** "signal" on night backgrounds, "light" on paper, "outline-dark" for a quiet button on night. */
  tone?: "light" | "signal" | "outline-dark";
  /** Icon only (with an accessible name). */
  compact?: boolean;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}) {
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const set = (o: boolean) => { setOpen(o); onOpenChange?.(o); };
  const cls = tone === "signal"
    ? "bg-signal text-signal-ink hover:bg-white"
    : tone === "outline-dark"
      ? "border-2 border-white/40 text-white hover:border-signal hover:bg-signal hover:text-signal-ink"
      : "border-2 border-night bg-surface text-ink hover:bg-night hover:text-white";
  return (
    <>
      <button
        type="button"
        onClick={() => set(true)}
        aria-haspopup="dialog"
        aria-label={compact ? COPY[locale].button : undefined}
        className={`press inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-full font-bold ${compact ? "px-0" : "px-4"} ${cls} ${className}`}
      >
        <ImageIcon className="h-5 w-5" aria-hidden="true" />
        {!compact && COPY[locale].button}
      </button>
      {open && <ShareSheet open={open} onOpenChange={set} content={content} url={url} title={title} campaign={campaign} />}
    </>
  );
}
