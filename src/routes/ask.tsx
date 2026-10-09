import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Mic, MicOff, Phone, PhoneOff, Send, X } from "lucide-react";
import type { ChatMessage, ConvaiClient as ConvaiClientT, AudioRenderer as AudioRendererT } from "@convai/web-sdk/vanilla";
import { PageShell } from "@/components/PageShell";
import { AmbientLayer, KeeperFigure } from "@/components/Keeper";
import { ReadAloudButton } from "@/components/ReadAloud";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { localePath, seoHead } from "@/lib/seo";
import { useAiNews, byLocale, display } from "@/lib/news";
import type { Locale } from "@/lib/i18n";
import {
  ATMOSPHERES, GREETING, MAX_HISTORY, MAX_MESSAGE, RATE_MAX, RATE_MIN, STORE, SUGGESTIONS, TOUR,
  isAtmos, readRate, readStore, storyPath, writeStore,
  type AtmosId, type KeeperCitation, type KeeperGuideRef,
} from "@/lib/keeper";
import { askKeeper, keeperConfig, keeperConvaiSession } from "@/lib/keeper.functions";
import { listen, recognitionAvailable, speak, stopSpeaking } from "@/lib/keeper-voice";
import { startAmbience } from "@/lib/keeper-ambience";

type Search = { q?: string; tour?: number };

export const Route = createFileRoute("/ask")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" && s.q.trim() ? s.q.trim().slice(0, MAX_MESSAGE) : undefined,
    tour: s.tour === 1 || s.tour === "1" ? 1 : undefined,
  }),
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `Ask the Keeper, our AI archivist — ${SITE.name}`, fr: `Demandez au Gardien, notre archiviste IA — ${SITE.name}` },
      description: {
        en: "Ask the Keeper, AI Broadsheet's AI archivist, about today's AI news and AI basics. Plain answers, with links to the stories it used. Voice, captions and a guided tour of the site.",
        fr: "Posez vos questions au Gardien, l'archiviste IA d'AI Broadsheet, sur l'actualité et les bases de l'IA. Des réponses simples, avec les liens des nouvelles consultées. Voix, sous-titres et visite guidée du site.",
      },
    }),
  component: AskPage,
});

type Turn = {
  id: string;
  role: "reader" | "keeper";
  text: string;
  citations?: KeeperCitation[];
  guides?: KeeperGuideRef[];
  sig?: string;
  engine?: "own" | "convai";
  streaming?: boolean;
};

let turnSeq = 0;
const tid = () => `t${Date.now().toString(36)}${(turnSeq++).toString(36)}`;

// ── Page ────────────────────────────────────────────────────────────────────

function AskPage() {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/ask" });
  const ids = useId();

  // Settings, restored per viewer after hydration.
  const [atmos, setAtmos] = useState<AtmosId>("night");
  const [voiceOn, setVoiceOn] = useState(false);
  const [rate, setRate] = useState(1);
  const [soundOn, setSoundOn] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const saved = readStore(STORE.atmos);
    if (isAtmos(saved)) setAtmos(saved);
    else if (window.matchMedia("(prefers-contrast: more)").matches || window.matchMedia("(forced-colors: active)").matches) setAtmos("calm");
    setVoiceOn(readStore(STORE.voice) === "1");
    setRate(readRate());
    setHydrated(true);
  }, []);
  const chooseAtmos = (a: AtmosId) => { setAtmos(a); writeStore(STORE.atmos, a); if (a === "calm") setSoundOn(false); };
  const chooseVoice = (on: boolean) => { setVoiceOn(on); writeStore(STORE.voice, on ? "1" : "0"); if (!on) stopSpeaking(); };
  const chooseRate = (r: number) => { setRate(r); writeStore(STORE.rate, String(r)); };

  // Calm & clear enlarges type across the page and stills every animation.
  useEffect(() => {
    const el = document.documentElement;
    el.classList.toggle("keeper-calm", atmos === "calm");
    return () => el.classList.remove("keeper-calm");
  }, [atmos]);

  // Ambient sound: only after the reader turns it on.
  useEffect(() => {
    if (!soundOn || atmos === "calm") return;
    return startAmbience(atmos);
  }, [soundOn, atmos]);

  const { data: config } = useQuery({ queryKey: ["keeper-config"], queryFn: () => keeperConfig(), staleTime: 10 * 60_000, retry: false });

  // The figure's voice level is written straight to the SVG.
  const figRef = useRef<SVGSVGElement>(null);
  const setLevel = useCallback((n: number) => { figRef.current?.style.setProperty("--k-level", n.toFixed(3)); }, []);
  const [speaking, setSpeaking] = useState(false);
  const [caption, setCaption] = useState("");
  const [announce, setAnnounce] = useState("");

  const say = useCallback((text: string, sig?: string) => {
    if (!voiceOn) return;
    speak(text, {
      locale, rate, sig,
      premium: !!config?.premiumVoice,
      onCaption: setCaption, onLevel: setLevel, onState: setSpeaking,
    });
  }, [voiceOn, locale, rate, config?.premiumVoice, setLevel]);
  useEffect(() => () => stopSpeaking(), []);

  // ── Conversation (our own engine) ──
  const [turns, setTurns] = useState<Turn[]>([{ id: "hello", role: "keeper", text: "" }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const convai = useConvai(locale, {
    onKeeperFinal: (text) => setAnnounce(`${fr ? "Le Gardien dit :" : "The Keeper says:"} ${text}`),
    onCaption: setCaption,
  });

  const send = useCallback(async (raw: string) => {
    const message = raw.trim().slice(0, MAX_MESSAGE);
    if (!message || busy) return;
    setInput("");
    if (convai.status === "live") { convai.send(message); return; }
    const history = turns
      .filter(t => t.id !== "hello" && t.engine !== "convai")
      .slice(-MAX_HISTORY)
      .map(t => ({ role: t.role, text: t.text }));
    setTurns(ts => [...ts, { id: tid(), role: "reader", text: message }]);
    setBusy(true);
    setAnnounce(fr ? "Le Gardien cherche dans les archives…" : "The Keeper is checking the record…");
    try {
      const r = await askKeeper({ data: { message, history, locale } });
      setTurns(ts => [...ts, { id: tid(), role: "keeper", text: r.reply, citations: r.citations, guides: r.guides, sig: r.sig, engine: "own" }]);
      const cites = r.citations.length ? (fr ? ` ${r.citations.length} source(s) en lien.` : ` ${r.citations.length} linked source${r.citations.length > 1 ? "s" : ""}.`) : "";
      setAnnounce(`${fr ? "Le Gardien dit :" : "The Keeper says:"} ${r.reply}${cites}`);
      say(r.reply, r.sig);
    } catch {
      const msg = fr ? "Je n'ai pas pu joindre les archives. Vérifiez votre connexion et réessayez." : "I couldn't reach the archive. Check your connection and try again.";
      setTurns(ts => [...ts, { id: tid(), role: "keeper", text: msg, engine: "own" }]);
      setAnnounce(msg);
    } finally {
      setBusy(false);
    }
  }, [busy, convai, turns, locale, fr, say]);

  // Keep the newest message in view (inside the log only).
  const allTurns: Turn[] = [...turns, ...convai.turns];
  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [allTurns.length, busy]);

  // Arriving from the homepage band: ask their question, or start the tour.
  const [tourStep, setTourStep] = useState<number | null>(null);
  const tourBtnRef = useRef<HTMLButtonElement>(null);
  const arrived = useRef(false);
  useEffect(() => {
    if (!hydrated || arrived.current) return;
    arrived.current = true;
    if (search.tour) setTourStep(0);
    else if (search.q) void send(search.q);
    if (search.q || search.tour) void navigate({ search: {}, replace: true });
  }, [hydrated, search.q, search.tour, send, navigate]);

  // ── Tour ──
  const goStep = (i: number | null) => {
    stopSpeaking();
    if (i == null) { setTourStep(null); setCaption(""); requestAnimationFrame(() => tourBtnRef.current?.focus()); return; }
    setTourStep(Math.max(0, Math.min(TOUR.length - 1, i)));
  };
  useEffect(() => {
    if (tourStep == null) return;
    const line = pick(TOUR[tourStep].line);
    setAnnounce("");
    if (voiceOn) say(line);
  }, [tourStep, voiceOn]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Voice in: push to talk ──
  const sttSupported = hydrated && recognitionAvailable();
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const listener = useRef<{ stop: () => void } | null>(null);
  const viaPointer = useRef(false);
  const [consent, setConsent] = useState<null | "browser" | "convai-mic" | "convai-start">(null);

  const startListening = () => {
    if (listening) return;
    if (readStore(STORE.micConsent) !== "1") { setConsent("browser"); return; }
    stopSpeaking();
    setHeard("");
    setListening(true);
    setAnnounce(fr ? "J'écoute. Relâchez ou appuyez de nouveau pour envoyer." : "Listening. Release, or press again, to send.");
    listener.current = listen(locale, {
      onText: setHeard,
      onEnd: (text, err) => {
        setListening(false);
        listener.current = null;
        setHeard("");
        if (text) void send(text);
        else setAnnounce(err === "not-allowed"
          ? (fr ? "Le micro est bloqué. Autorisez-le dans les réglages du navigateur, ou tapez votre question." : "The microphone is blocked. Allow it in your browser settings, or type your question.")
          : (fr ? "Je n'ai rien entendu. Réessayez, ou tapez votre question." : "I didn't catch that. Try again, or type your question."));
      },
    });
  };
  const stopListening = () => listener.current?.stop();

  const acceptConsent = async () => {
    const kind = consent;
    setConsent(null);
    if (kind === "browser") { writeStore(STORE.micConsent, "1"); setAnnounce(fr ? "Merci. Appuyez sur Parler pour commencer." : "Thanks. Press Talk to start."); }
    if (kind === "convai-start") await convai.start(true);
    if (kind === "convai-mic") await convai.setMic(true);
  };

  // Convai sessions start from a button; the SDK loads only then.
  const convaiReady = !!config?.convaiCharacterId;
  const talking: boolean | "loop" = convai.status === "live" && convai.agent === "speaking" ? "loop" : speaking;

  const statusText =
    convai.status === "connecting" ? (fr ? "Connexion à la session vocale…" : "Connecting the voice session…")
      : listening ? (fr ? "J'écoute…" : "Listening…")
      : busy || (convai.status === "live" && convai.agent === "thinking") ? (fr ? "Je consulte les archives…" : "Checking the record…")
      : talking ? (fr ? "Je parle" : "Speaking")
      : convai.status === "live" && convai.agent === "listening" ? (fr ? "Je vous écoute" : "Listening to you")
      : (fr ? "Prêt" : "Ready");

  const engineNote = convai.status === "live"
    ? (fr ? "Session vocale par Convai" : "Voice session by Convai")
    : config?.model === "claude" ? (fr ? "Réponses par Claude, un modèle d'IA d'Anthropic" : "Answers by Claude, an AI model made by Anthropic")
    : config?.model === "gemini" ? (fr ? "Réponses par Gemini, un modèle d'IA de Google" : "Answers by Gemini, an AI model made by Google")
    : config ? (fr ? "Le modèle d'IA est éteint : le Gardien cherche dans les archives à la place" : "The AI model is off right now, so the Keeper searches the record instead") : "";

  const remaining = MAX_MESSAGE - input.length;

  return (
    <PageShell>
      <section className="keeper-room" data-atmos={atmos} aria-labelledby={`${ids}-title`}>
        <AmbientLayer atmos={atmos} />
        <div className="container-mw relative z-[1] pt-8 pb-10 sm:pt-10 sm:pb-14">
          {/* Title */}
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div className="max-w-3xl">
              <h1 id={`${ids}-title`} className="masthead-serif text-[2.4em] sm:text-[3.2em] leading-[1.04]">
                {fr ? "Demandez au Gardien" : "Ask the Keeper"}
              </h1>
              <p className="k-dek mt-2 text-[1.12em] leading-relaxed">
                <span className="k-ai-badge">{fr ? "IA" : "AI"}</span>{" "}
                {fr
                  ? "Le Gardien est un personnage d'IA, pas une personne. Il explique l'actualité de l'IA et ses bases en mots simples, et montre les nouvelles qu'il a consultées. Il peut se tromper : vérifiez ses sources."
                  : "The Keeper is an AI character, not a person. It explains AI news and AI basics in plain words, and shows the stories it used. It can be wrong, so check its sources."}
              </p>
            </div>
            <button
              ref={tourBtnRef}
              type="button"
              onClick={() => goStep(tourStep == null ? 0 : null)}
              className="k-btn k-btn--primary"
              aria-pressed={tourStep != null}
            >
              {tourStep == null ? (fr ? "Visite guidée du site" : "Guided tour of the site") : (fr ? "Arrêter la visite" : "Stop the tour")}
            </button>
          </div>

          {/* Settings */}
          <div className="k-settings mt-6">
            <fieldset className="k-atmos">
              <legend className="k-label">{fr ? "Ambiance" : "Atmosphere"}</legend>
              <div className="flex flex-wrap gap-2">
                {ATMOSPHERES.map(a => (
                  <label key={a.id} className="k-chip" title={pick(a.hint)}>
                    <input type="radio" name={`${ids}-atmos`} value={a.id} checked={atmos === a.id} onChange={() => chooseAtmos(a.id)} className="sr-only" />
                    <span>{pick(a.label)}</span>
                  </label>
                ))}
              </div>
              <p className="k-hint mt-1.5">{pick(ATMOSPHERES.find(a => a.id === atmos)!.hint)}</p>
            </fieldset>
            <div className="k-controls">
              <label className="k-toggle">
                <input type="checkbox" checked={voiceOn} onChange={e => chooseVoice(e.target.checked)} />
                <span>{fr ? "Lire les réponses à voix haute" : "Speak replies aloud"}</span>
              </label>
              <label className="k-rate">
                <span>{fr ? "Vitesse de la voix" : "Speech speed"}</span>
                <input type="range" min={RATE_MIN} max={RATE_MAX} step={0.1} value={rate} onChange={e => chooseRate(Number(e.target.value))} aria-valuetext={`${rate.toFixed(1)}×`} />
                <output aria-hidden="true">{rate.toFixed(1)}×</output>
              </label>
              <label className={`k-toggle ${atmos === "calm" ? "is-disabled" : ""}`}>
                <input type="checkbox" checked={soundOn} disabled={atmos === "calm"} onChange={e => setSoundOn(e.target.checked)} aria-describedby={atmos === "calm" ? `${ids}-nosound` : undefined} />
                <span>{fr ? "Son d'ambiance" : "Ambient sound"}</span>
              </label>
              {atmos === "calm" && <span id={`${ids}-nosound`} className="k-hint">{fr ? "Pas de son en mode Calme et clair." : "No sound in Calm & clear."}</span>}
            </div>
          </div>

          {/* Stage */}
          <div className="mt-6 grid gap-6 lg:gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-start">
            <div className="k-stage">
              <div className="k-figure-wrap">
                <KeeperFigure svgRef={figRef} talking={talking} className="k-figure" />
              </div>
              <div className="k-stage-text">
                <p className="k-status" aria-hidden="true">
                  <span className={`k-dot ${talking || listening ? "is-on" : ""}`} />
                  {statusText}
                </p>
                <p className="k-engine">{engineNote}</p>
                {/* Captions: every spoken line, large. Screen readers get the reply from the live region instead. */}
                <div className={`k-caption ${caption ? "has-text" : ""}`} aria-hidden="true">
                  {caption || (voiceOn ? (fr ? "Les sous-titres de ce que dit le Gardien s'affichent ici." : "Captions of what the Keeper says appear here.") : (fr ? "Voix coupée. Activez « Lire les réponses à voix haute » pour l'entendre." : "Voice is off. Turn on \"Speak replies aloud\" to hear it."))}
                </div>
              </div>
            </div>

            <div className="min-w-0">
              {tourStep != null ? (
                <TourPanel step={tourStep} locale={locale} onGo={goStep} />
              ) : (
                <>
                  {convaiReady && (
                    <ConvaiCard
                      fr={fr}
                      status={convai.status}
                      mic={convai.mic}
                      onStart={() => setConsent("convai-start")}
                      onStartText={() => void convai.start(false)}
                      onStop={() => void convai.stop()}
                      onMic={() => (convai.mic ? void convai.setMic(false) : setConsent("convai-mic"))}
                    />
                  )}
                  <div
                    ref={logRef}
                    className="k-log"
                    tabIndex={0}
                    role="region"
                    aria-label={fr ? "Conversation avec le Gardien" : "Conversation with the Keeper"}
                    aria-busy={busy}
                  >
                    <ol className="flex flex-col gap-4">
                      {allTurns.map(t => (
                        <TurnView key={t.id} t={t} locale={locale} text={t.id === "hello" ? pick(GREETING) : t.text} onReplay={voiceOn ? () => say(t.id === "hello" ? pick(GREETING) : t.text, t.sig) : undefined} />
                      ))}
                      {busy && (
                        <li className="k-turn k-turn--keeper" aria-hidden="true">
                          <span className="k-who">{fr ? "Le Gardien" : "The Keeper"}</span>
                          <p className="k-thinking">{fr ? "Je consulte les archives" : "Checking the record"}<span>.</span><span>.</span><span>.</span></p>
                        </li>
                      )}
                    </ol>
                  </div>

                  <form className="k-composer" onSubmit={e => { e.preventDefault(); void send(input); }}>
                    <label htmlFor={`${ids}-q`} className="k-label">{fr ? "Votre question" : "Your question"}</label>
                    <textarea
                      id={`${ids}-q`}
                      ref={inputRef}
                      rows={2}
                      value={listening ? heard : input}
                      readOnly={listening}
                      maxLength={MAX_MESSAGE}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(input); } }}
                      aria-describedby={`${ids}-qhint`}
                      placeholder={fr ? "Posez une question sur l'IA…" : "Ask a question about AI…"}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                      <p id={`${ids}-qhint`} className="k-hint">
                        {fr ? "Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne." : "Enter to send, Shift+Enter for a new line."}{" "}
                        <span className={remaining < 50 ? "font-semibold" : ""}>{fr ? `${remaining} caractères restants.` : `${remaining} characters left.`}</span>
                      </p>
                      <div className="flex gap-2">
                        {sttSupported && convai.status !== "live" && (
                          <button
                            type="button"
                            className={`k-btn ${listening ? "k-btn--live" : ""}`}
                            aria-pressed={listening}
                            aria-label={listening ? (fr ? "Arrêter d'écouter et envoyer" : "Stop listening and send") : (fr ? "Parler : maintenez pour parler, ou appuyez pour commencer puis de nouveau pour envoyer" : "Talk: hold to speak, or press to start and press again to send")}
                            onPointerDown={e => { if (e.button !== 0) return; viaPointer.current = true; startListening(); }}
                            onPointerUp={() => { if (viaPointer.current) stopListening(); viaPointer.current = false; }}
                            onPointerLeave={() => { if (viaPointer.current && listening) stopListening(); viaPointer.current = false; }}
                            onClick={e => { if (e.detail === 0) (listening ? stopListening() : startListening()); }}
                          >
                            {listening ? <MicOff className="w-5 h-5" aria-hidden="true" /> : <Mic className="w-5 h-5" aria-hidden="true" />}
                            <span>{listening ? (fr ? "Envoyer" : "Send") : (fr ? "Parler" : "Talk")}</span>
                          </button>
                        )}
                        <button type="submit" className="k-btn k-btn--primary" disabled={busy || !input.trim()}>
                          <Send className="w-5 h-5" aria-hidden="true" />
                          <span>{fr ? "Envoyer" : "Send"}</span>
                        </button>
                      </div>
                    </div>
                  </form>

                  <div className="mt-4">
                    <p className="k-label">{fr ? "Essayez" : "Try asking"}</p>
                    <ul className="flex flex-wrap gap-2 mt-2">
                      {SUGGESTIONS.map(s => (
                        <li key={s.en}>
                          <button type="button" className="k-suggest" disabled={busy} onClick={() => void send(pick(s))}>{pick(s)}</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="sr-only" aria-live="polite" aria-atomic="true">{announce}</div>
      </section>

      <AboutKeeper fr={fr} />

      <ConsentDialog
        kind={consent}
        fr={fr}
        onAccept={() => void acceptConsent()}
        onCancel={() => setConsent(null)}
      />
    </PageShell>
  );
}

// ── Pieces ──────────────────────────────────────────────────────────────────

function TurnView({ t, text, locale, onReplay }: { t: Turn; text: string; locale: Locale; onReplay?: () => void }) {
  const fr = locale === "fr";
  if (t.role === "reader") {
    return (
      <li className="k-turn k-turn--reader">
        <span className="k-who">{fr ? "Vous" : "You"}</span>
        <p>{text}</p>
      </li>
    );
  }
  return (
    <li className="k-turn k-turn--keeper">
      <span className="k-who">
        {fr ? "Le Gardien" : "The Keeper"} <span className="k-ai-badge k-ai-badge--sm">{fr ? "IA" : "AI"}</span>
        {t.engine === "convai" && <span className="k-hint"> · Convai</span>}
      </span>
      <p className="k-reply">{text}{t.streaming ? " …" : ""}</p>
      {!!t.citations?.length && (
        <div className="k-sources">
          <p className="k-label">{fr ? "Nouvelles consultées" : "Stories I used"}</p>
          <ul>
            {t.citations.map(c => (
              <li key={c.id}>
                <a href={localePath(storyPath(c.id), locale)} className="k-link">{c.title}</a>
                <span className="k-hint"> {fr ? "par" : "from"} </span>
                <a href={c.link} target="_blank" rel="noopener noreferrer" className="k-link k-link--quiet">
                  {c.source}<ExternalLink className="inline w-3.5 h-3.5 ml-1 -mt-0.5" aria-hidden="true" />
                  <span className="sr-only">{fr ? " (ouvre un nouvel onglet)" : " (opens in a new tab)"}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!!t.guides?.length && (
        <div className="k-sources">
          <p className="k-label">{fr ? "Pour aller plus loin" : "To learn more"}</p>
          <ul>
            {t.guides.map(g => (
              <li key={g.slug}><Link to="/learn/$slug" params={{ slug: g.slug }} className="k-link">{g.title}</Link></li>
            ))}
          </ul>
        </div>
      )}
      {onReplay && !t.streaming && text && (
        <button type="button" className="k-replay" onClick={onReplay}>{fr ? "Réécouter" : "Play again"}</button>
      )}
    </li>
  );
}

function TourPanel({ step, locale, onGo }: { step: number; locale: Locale; onGo: (i: number | null) => void }) {
  const fr = locale === "fr";
  const s = TOUR[step];
  const head = useRef<HTMLHeadingElement>(null);
  const { data } = useAiNews(null);
  const latest = s.id === "latest" ? byLocale(data?.stories ?? [], locale).filter(x => x.kind === "news").slice(0, 3) : [];
  useEffect(() => { head.current?.focus(); }, [step]);
  const onKey = (e: ReactKeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.key === "ArrowRight" && step < TOUR.length - 1) { e.preventDefault(); onGo(step + 1); }
    else if (e.key === "ArrowLeft" && step > 0) { e.preventDefault(); onGo(step - 1); }
    else if (e.key === "Escape") { e.preventDefault(); onGo(null); }
  };
  const last = step === TOUR.length - 1;
  return (
    <section className="k-tour" onKeyDown={onKey} aria-label={fr ? "Visite guidée" : "Guided tour"}>
      <p className="k-label">{fr ? `Étape ${step + 1} sur ${TOUR.length}` : `Step ${step + 1} of ${TOUR.length}`}</p>
      <div className="k-tour-progress" aria-hidden="true">
        {TOUR.map((t, i) => <span key={t.id} className={i <= step ? "is-done" : ""} />)}
      </div>
      <h2 ref={head} tabIndex={-1} className="masthead-serif text-[2em] sm:text-[2.4em] leading-tight mt-3 outline-none">{s.title[locale]}</h2>
      <p className="k-tour-line" aria-live="polite">{s.line[locale]}</p>
      {latest.length > 0 && (
        <ul className="k-sources mt-4">
          {latest.map(x => <li key={x.id}><a className="k-link" href={localePath(storyPath(x.id), locale)}>{display(x, locale).title}</a> <span className="k-hint">{x.source}</span></li>)}
        </ul>
      )}
      {s.href && s.cta && (
        <p className="mt-5">
          <a href={localePath(s.href, locale)} className="k-btn">{s.cta[locale]}</a>
        </p>
      )}
      <div className="flex flex-wrap gap-2 mt-6">
        <button type="button" className="k-btn" onClick={() => onGo(step - 1)} disabled={step === 0}>
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />{fr ? "Retour" : "Back"}
        </button>
        {last ? (
          <button type="button" className="k-btn k-btn--primary" onClick={() => onGo(null)}>{fr ? "Terminer la visite" : "Finish the tour"}</button>
        ) : (
          <button type="button" className="k-btn k-btn--primary" onClick={() => onGo(step + 1)}>
            {fr ? "Suivant" : "Next"}<ArrowRight className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
        {!last && <button type="button" className="k-btn k-btn--quiet" onClick={() => onGo(null)}>{fr ? "Arrêter" : "Stop"}</button>}
      </div>
      <p className="k-hint mt-4">{fr ? "Flèches gauche et droite pour naviguer, Échap pour arrêter." : "Left and right arrow keys move between steps. Escape stops the tour."}</p>
    </section>
  );
}

function ConvaiCard({ fr, status, mic, onStart, onStartText, onStop, onMic }: {
  fr: boolean; status: ConvaiStatus; mic: boolean;
  onStart: () => void; onStartText: () => void; onStop: () => void; onMic: () => void;
}) {
  return (
    <div className="k-convai">
      {status === "live" ? (
        <>
          <p><strong>{fr ? "Session vocale en cours." : "Voice session on."}</strong> {fr ? "Parlez ou tapez. Le Gardien répond à voix haute." : "Talk or type. The Keeper answers aloud."}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <button type="button" className={`k-btn ${mic ? "k-btn--live" : ""}`} aria-pressed={mic} onClick={onMic}>
              {mic ? <Mic className="w-5 h-5" aria-hidden="true" /> : <MicOff className="w-5 h-5" aria-hidden="true" />}
              {mic ? (fr ? "Micro ouvert" : "Microphone on") : (fr ? "Ouvrir le micro" : "Turn on microphone")}
            </button>
            <button type="button" className="k-btn" onClick={onStop}><PhoneOff className="w-5 h-5" aria-hidden="true" />{fr ? "Terminer la session" : "End the session"}</button>
          </div>
        </>
      ) : (
        <>
          <p>{fr ? "Préférez parler? Lancez une session vocale en direct avec le Gardien." : "Rather talk? Start a live voice session with the Keeper."}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <button type="button" className="k-btn k-btn--primary" onClick={onStart} disabled={status === "connecting"}>
              <Phone className="w-5 h-5" aria-hidden="true" />{status === "connecting" ? (fr ? "Connexion…" : "Connecting…") : (fr ? "Parler avec le Gardien" : "Talk with the Keeper")}
            </button>
            <button type="button" className="k-btn k-btn--quiet" onClick={onStartText} disabled={status === "connecting"}>{fr ? "Session sans micro" : "Session without microphone"}</button>
          </div>
          {status === "error" && <p className="k-hint mt-2" role="alert">{fr ? "La session vocale n'a pas démarré. Vous pouvez toujours écrire ci-dessous." : "The voice session didn't start. You can still type below."}</p>}
        </>
      )}
    </div>
  );
}

function ConsentDialog({ kind, fr, onAccept, onCancel }: { kind: null | "browser" | "convai-mic" | "convai-start"; fr: boolean; onAccept: () => void; onCancel: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (kind && !d.open) d.showModal();
    if (!kind && d.open) d.close();
  }, [kind]);
  const convai = kind === "convai-mic" || kind === "convai-start";
  return (
    <dialog ref={ref} className="k-dialog" aria-labelledby={titleId} onCancel={e => { e.preventDefault(); onCancel(); }}>
      <h2 id={titleId} className="masthead-serif text-[1.6em] leading-tight">{fr ? "Utiliser votre micro?" : "Use your microphone?"}</h2>
      <div className="mt-3 space-y-2 text-[1.02em] leading-relaxed">
        {convai ? (
          <p>{fr
            ? "Pendant la session vocale, votre voix est envoyée à Convai, le service qui fait parler le Gardien, pour être transcrite et recevoir une réponse. AI Broadsheet n'enregistre pas votre voix."
            : "During the voice session, your voice is sent to Convai, the service that gives the Keeper its voice, to be transcribed and answered. AI Broadsheet doesn't record your voice."}</p>
        ) : (
          <p>{fr
            ? "Votre navigateur transforme votre voix en texte. Selon le navigateur, l'audio peut être envoyé à son fabricant (par exemple Google pour Chrome). AI Broadsheet ne reçoit que le texte et n'enregistre pas votre voix."
            : "Your browser turns your voice into text. Depending on the browser, the audio may be sent to its maker (for example, Google for Chrome). AI Broadsheet only receives the text and doesn't record your voice."}</p>
        )}
        <p>{fr ? "Ne dites rien de personnel. Vous pouvez toujours taper à la place." : "Don't say anything personal. You can always type instead."}</p>
      </div>
      <div className="flex flex-wrap gap-2 mt-5">
        <button type="button" className="k-btn k-btn--primary" onClick={onAccept}>{fr ? "Oui, utiliser le micro" : "Yes, use the microphone"}</button>
        <button type="button" className="k-btn" onClick={onCancel}><X className="w-5 h-5" aria-hidden="true" />{fr ? "Non merci" : "No thanks"}</button>
      </div>
    </dialog>
  );
}

function AboutKeeper({ fr }: { fr: boolean }) {
  return (
    <section className="container-mw py-12 grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]" aria-labelledby="about-keeper">
      <div className="prose-mw">
        <h2 id="about-keeper" className="!mt-0">{fr ? "Qui est le Gardien?" : "Who is the Keeper?"}</h2>
        <p>{fr
          ? "Le Gardien est un personnage créé par notre rédaction. Son nom vient de nos génériques : « Quelqu'un garde la trace de tout. » C'est un programme d'IA : il n'a ni corps, ni opinions personnelles, et il ne se souvient pas de vous après votre visite."
          : "The Keeper is a character our newsroom made. The name comes from our opening titles: \"Someone keeps the record whole.\" It's an AI program: it has no body and no personal opinions, and it doesn't remember you after your visit."}</p>
        <p>{fr
          ? "Pour l'actualité, il ne s'appuie que sur les nouvelles de notre fil, et il montre lesquelles. Il ne donne pas de conseils personnels en finances, en droit ou en santé. Vos questions sont envoyées à un modèle d'IA pour obtenir une réponse; n'y mettez pas de renseignements personnels."
          : "For news, it uses only the stories on our wire, and it shows you which ones. It doesn't give personal financial, legal or medical advice. Your questions are sent to an AI model to get an answer, so leave out personal details."}</p>
        <p>
          <a className="text-lake font-semibold underline underline-offset-4" href={localePath("/standards", fr ? "fr" : "en")}>{fr ? "Comment nous utilisons l'IA" : "How we use AI"}</a>
          {" · "}
          <a className="text-lake font-semibold underline underline-offset-4" href={localePath("/privacy", fr ? "fr" : "en")}>{fr ? "Confidentialité" : "Privacy"}</a>
        </p>
      </div>
      <div>
        <h2 className="hl text-[1.35em]">{fr ? "Écouter n'importe quelle page" : "Listen to any page"}</h2>
        <p className="dek mt-2">{fr ? "Ce bouton lit le texte de la page à voix haute et surligne le passage lu. Il suit la vitesse choisie plus haut." : "This button reads the page's text aloud and outlines the passage being read. It follows the speed you set above."}</p>
        <ReadAloudButton className="mt-4" />
      </div>
    </section>
  );
}

// ── Convai (voice engine) ───────────────────────────────────────────────────

type ConvaiStatus = "off" | "connecting" | "live" | "error";

/**
 * Live voice sessions through Convai. The SDK is loaded only when the reader
 * starts a session; the browser receives a one-hour auth token from our
 * server, never our Convai API key. The microphone stays off unless the
 * reader agreed to it.
 */
function useConvai(locale: Locale, h: { onKeeperFinal: (text: string) => void; onCaption: (t: string) => void }) {
  const [status, setStatus] = useState<ConvaiStatus>("off");
  const [agent, setAgent] = useState<string>("disconnected");
  const [mic, setMicState] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const client = useRef<ConvaiClientT | null>(null);
  const renderer = useRef<AudioRendererT | null>(null);
  const unsubs = useRef<(() => void)[]>([]);
  const announced = useRef(new Set<string>());
  const hRef = useRef(h);
  hRef.current = h;

  const stop = useCallback(async () => {
    unsubs.current.forEach(u => u());
    unsubs.current = [];
    try { renderer.current?.destroy(); } catch { /* gone */ }
    renderer.current = null;
    const c = client.current;
    client.current = null;
    setStatus("off"); setAgent("disconnected"); setMicState(false);
    hRef.current.onCaption("");
    if (c) await c.disconnect().catch(() => {});
  }, []);

  const start = useCallback(async (withMic: boolean) => {
    if (client.current) return;
    setStatus("connecting");
    try {
      const sess = await keeperConvaiSession({ data: { locale } });
      if (!sess) throw new Error("no session");
      // Browser only: keeps the SDK (and LiveKit) out of the server bundle.
      const sdk = import.meta.env.SSR ? null : await import("@convai/web-sdk/vanilla");
      if (!sdk) throw new Error("browser only");
      const c = new sdk.ConvaiClient();
      client.current = c;
      unsubs.current.push(
        c.on("stateChange", (s: { agentState: string }) => {
          setAgent(s.agentState);
          if (s.agentState !== "speaking") hRef.current.onCaption("");
        }),
        c.on("messagesChange", (list: ChatMessage[]) => {
          const shown = list.filter(m => (m.type === "user-transcription" || m.type === "user-llm-text" || m.type === "bot-llm-text" || m.type === "bot-output") && m.content?.trim());
          setTurns(shown.map(m => ({ id: `cv-${m.id}`, role: m.type.startsWith("user") ? "reader" : "keeper", text: m.content.trim(), engine: "convai", streaming: !!m.isStreaming })));
          const lastBot = [...shown].reverse().find(m => !m.type.startsWith("user"));
          if (lastBot) {
            if (c.state.isSpeaking) hRef.current.onCaption(lastBot.content.trim());
            if (!lastBot.isStreaming && !announced.current.has(lastBot.id)) {
              announced.current.add(lastBot.id);
              hRef.current.onKeeperFinal(lastBot.content.trim());
            }
          }
        }),
      );
      await c.connect({
        authToken: sess.authToken,
        characterId: sess.characterId,
        startWithAudioOn: withMic,
        ttsEnabled: true,
        ...(sess.context ? { dynamicInfo: sess.context } : {}),
      });
      renderer.current = new sdk.AudioRenderer(c.room);
      setMicState(withMic);
      setStatus("live");
    } catch (e) {
      console.warn("[keeper] convai", (e as Error).message);
      await stop();
      setStatus("error");
    }
  }, [locale, stop]);

  const setMic = useCallback(async (on: boolean) => {
    const c = client.current;
    if (!c) return;
    try {
      if (on) await c.audioControls.enableAudio(); else await c.audioControls.disableAudio();
      setMicState(on);
    } catch { setMicState(false); }
  }, []);

  const send = useCallback((text: string) => { client.current?.sendUserTextMessage(text); }, []);

  useEffect(() => () => { void stop(); }, [stop]);

  return { status, agent, mic, turns, start, stop, setMic, send };
}
