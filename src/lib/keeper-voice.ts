/**
 * Browser-side speech for the Keeper and for "Read this page to me".
 * Premium voice: our /api/keeper-tts route (ElevenLabs) for the Keeper's own
 * signed lines. Otherwise, or if that fails, the browser's speechSynthesis.
 * One voice at a time: starting a new line stops the previous one.
 */
import type { Locale } from "./i18n";
import { langTag, sentenceChunks } from "./keeper";

export type SpeakOptions = {
  locale: Locale;
  rate: number;
  /** Signature from askKeeper; with `premium`, lets the server voice read this line. */
  sig?: string;
  premium?: boolean;
  /** The sentence being spoken now, for captions. */
  onCaption?: (text: string) => void;
  /** 0..1 mouth/glow level, called every animation frame while speaking. */
  onLevel?: (level: number) => void;
  onState?: (speaking: boolean) => void;
};

export type SpeechHandle = { stop: () => void; done: Promise<void> };

let current: SpeechHandle | null = null;

export function browserSpeechAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}

export function stopSpeaking() {
  current?.stop();
  current = null;
}

function pickVoice(locale: Locale): SpeechSynthesisVoice | null {
  try {
    const voices = window.speechSynthesis.getVoices();
    const want = langTag(locale).toLowerCase();
    const base = locale;
    return voices.find(v => v.lang.toLowerCase() === want)
      ?? voices.find(v => v.lang.toLowerCase().startsWith(base) && /natural|neural|premium|enhanced/i.test(v.name))
      ?? voices.find(v => v.lang.toLowerCase().startsWith(base))
      ?? null;
  } catch {
    return null;
  }
}

/** Drives onLevel: a decaying pulse that boundary events (or audio levels) push up. */
function levelLoop(onLevel?: (n: number) => void) {
  let level = 0, lastKick = 0, raf = 0, running = true, sample: (() => number) | null = null;
  const tick = (t: number) => {
    if (!running) return;
    if (sample) level = Math.max(level * 0.8, sample());
    else {
      // No boundary events for a while (some voices never send them): a soft synthetic cadence.
      if (t - lastKick > 380) level = Math.max(level * 0.86, 0.35 + 0.3 * Math.abs(Math.sin(t / 95)));
      else level *= 0.86;
    }
    onLevel?.(Math.min(1, level));
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return {
    kick() { level = 1; lastKick = performance.now(); },
    useSampler(fn: () => number) { sample = fn; },
    stop() { running = false; cancelAnimationFrame(raf); onLevel?.(0); },
  };
}

function speakBrowser(text: string, o: SpeakOptions): SpeechHandle {
  const synth = window.speechSynthesis;
  const chunks = sentenceChunks(text);
  const voice = pickVoice(o.locale);
  const loop = levelLoop(o.onLevel);
  let stopped = false;
  let resolve!: () => void;
  const done = new Promise<void>(r => { resolve = r; });
  const finish = () => { if (stopped) return; stopped = true; loop.stop(); o.onState?.(false); o.onCaption?.(""); resolve(); };

  synth.cancel();
  o.onState?.(true);
  let i = 0;
  const next = () => {
    if (stopped) return;
    if (i >= chunks.length) { finish(); return; }
    const u = new SpeechSynthesisUtterance(chunks[i]);
    u.lang = langTag(o.locale);
    if (voice) u.voice = voice;
    u.rate = o.rate;
    // Watchdog: some engines never fire onend (no voices installed, tab in background).
    let advanced = false;
    const advance = () => { if (advanced) return; advanced = true; clearTimeout(dog); i++; next(); };
    const dog = window.setTimeout(advance, 4000 + (chunks[i].length * 110) / o.rate);
    o.onCaption?.(chunks[i]);
    u.onstart = () => loop.kick();
    u.onboundary = () => loop.kick();
    u.onend = advance;
    // No voice available: keep the caption up for a reading-length moment, then move on.
    const began = performance.now();
    u.onerror = (e) => {
      if (e.error === "interrupted" || e.error === "canceled") { advance(); return; }
      const readMs = 1200 + (chunks[i].length * 45) / o.rate;
      window.setTimeout(advance, Math.max(0, readMs - (performance.now() - began)));
    };
    synth.speak(u);
  };
  next();
  return { stop: () => { synth.cancel(); finish(); }, done };
}

function speakPremium(text: string, o: SpeakOptions): SpeechHandle {
  let stopped = false;
  let audio: HTMLAudioElement | null = null;
  let ctx: AudioContext | null = null;
  let url: string | null = null;
  let fallback: SpeechHandle | null = null;
  const loop = levelLoop(o.onLevel);
  let resolve!: () => void;
  const done = new Promise<void>(r => { resolve = r; });
  const cleanup = () => {
    loop.stop();
    if (url) URL.revokeObjectURL(url);
    void ctx?.close().catch(() => {});
  };
  const finish = () => { if (stopped) return; stopped = true; cleanup(); o.onState?.(false); o.onCaption?.(""); resolve(); };

  o.onState?.(true);
  o.onCaption?.(text);
  (async () => {
    try {
      const res = await fetch("/api/keeper-tts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, sig: o.sig, lang: o.locale }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      if (stopped) return;
      url = URL.createObjectURL(blob);
      audio = new Audio(url);
      audio.playbackRate = o.rate;
      try {
        const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AC) {
          ctx = new AC();
          const src = ctx.createMediaElementSource(audio);
          const an = ctx.createAnalyser();
          an.fftSize = 512;
          src.connect(an);
          an.connect(ctx.destination);
          const buf = new Uint8Array(an.fftSize);
          loop.useSampler(() => {
            an.getByteTimeDomainData(buf);
            let sum = 0;
            for (let j = 0; j < buf.length; j++) { const v = (buf[j] - 128) / 128; sum += v * v; }
            return Math.min(1, Math.sqrt(sum / buf.length) * 4);
          });
          await ctx.resume().catch(() => {});
        }
      } catch { /* no analyser: the synthetic cadence drives the mouth */ }
      audio.onended = finish;
      audio.onerror = finish;
      await audio.play();
    } catch {
      if (stopped) return;
      // Premium voice unavailable: hand over to the browser voice.
      cleanup();
      fallback = speakBrowser(text, { ...o, onState: s => { if (!s) finish(); } });
    }
  })();
  return {
    stop: () => { audio?.pause(); fallback?.stop(); finish(); },
    done,
  };
}

/** Speak a line. Resolves `done` when finished or stopped. */
export function speak(text: string, o: SpeakOptions): SpeechHandle {
  stopSpeaking();
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return { stop() {}, done: Promise.resolve() };
  let h: SpeechHandle;
  if (o.premium) h = speakPremium(clean, o);
  else if (browserSpeechAvailable()) h = speakBrowser(clean, o);
  else {
    // No speech at all: still show the caption for a reading-length moment.
    o.onCaption?.(clean);
    o.onState?.(true);
    let timer = 0;
    let resolve!: () => void;
    const done = new Promise<void>(r => { resolve = r; });
    const end = () => { clearTimeout(timer); o.onState?.(false); o.onCaption?.(""); resolve(); };
    timer = window.setTimeout(end, Math.min(15000, 1500 + clean.length * 55));
    h = { stop: end, done };
  }
  current = h;
  void h.done.then(() => { if (current === h) current = null; });
  return h;
}

// ── Speech recognition (voice in) ───────────────────────────────────────────

type RecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

export function recognitionAvailable(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
}

/** Push-to-talk listener. `onText` gets the running transcript; `onEnd` the final one. */
export function listen(locale: Locale, h: { onText: (t: string) => void; onEnd: (finalText: string, error?: string) => void }) {
  const w = window as unknown as { SpeechRecognition?: new () => RecognitionLike; webkitSpeechRecognition?: new () => RecognitionLike };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) { h.onEnd("", "unsupported"); return { stop() {} }; }
  const rec = new Ctor();
  rec.lang = langTag(locale);
  rec.interimResults = true;
  rec.continuous = true;
  rec.maxAlternatives = 1;
  let text = "";
  let err: string | undefined;
  rec.onresult = (e) => {
    let s = "";
    for (let i = 0; i < e.results.length; i++) s += e.results[i][0].transcript;
    text = s.trim();
    h.onText(text);
  };
  rec.onerror = (e) => { err = e.error; };
  rec.onend = () => h.onEnd(text, err);
  try { rec.start(); } catch { h.onEnd("", "start"); }
  return { stop: () => { try { rec.stop(); } catch { /* already stopped */ } } };
}
