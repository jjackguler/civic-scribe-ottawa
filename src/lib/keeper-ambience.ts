/**
 * Optional ambient sound for the Keeper's room, made on the fly with Web Audio
 * (no audio files). Off by default; never plays in "Calm & clear".
 */
import type { AtmosId } from "./keeper";

function noiseBuffer(ctx: AudioContext, kind: "brown" | "pink") {
  const len = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0, b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (kind === "brown") { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    else { b0 = 0.997 * b0 + w * 0.029; b1 = 0.985 * b1 + w * 0.032; b2 = 0.95 * b2 + w * 0.048; d[i] = (b0 + b1 + b2 + w * 0.02) * 0.6; }
  }
  return buf;
}

/** Starts the room tone for an atmosphere. Returns a stop function. */
export function startAmbience(atmos: AtmosId, volume = 0.5): () => void {
  if (atmos === "calm" || typeof window === "undefined") return () => {};
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return () => {};
  const ctx = new AC();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.gain.linearRampToValueAtTime(0.18 * volume, ctx.currentTime + 1.5);
  master.connect(ctx.destination);
  const timers: number[] = [];

  const bed = ctx.createBufferSource();
  bed.buffer = noiseBuffer(ctx, atmos === "reading" ? "pink" : "brown");
  bed.loop = true;
  const f = ctx.createBiquadFilter();
  if (atmos === "night") { f.type = "lowpass"; f.frequency.value = 420; }
  else if (atmos === "reading") { f.type = "bandpass"; f.frequency.value = 1800; f.Q.value = 0.4; }
  else { f.type = "lowpass"; f.frequency.value = 260; }
  const bedGain = ctx.createGain();
  bedGain.gain.value = atmos === "reading" ? 0.35 : 0.6;
  bed.connect(f).connect(bedGain).connect(master);
  bed.start();

  if (atmos === "studio") {
    // A faint room hum under the lights.
    const hum = ctx.createOscillator();
    hum.type = "sine";
    hum.frequency.value = 110;
    const hg = ctx.createGain();
    hg.gain.value = 0.05;
    hum.connect(hg).connect(master);
    hum.start();
  }

  if (atmos === "night") {
    // Distant keys: short filtered clicks at uneven intervals.
    const click = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.02), ctx.sampleRate);
    const cd = click.getChannelData(0);
    for (let i = 0; i < cd.length; i++) cd[i] = (Math.random() * 2 - 1) * Math.exp(-i / (cd.length / 6));
    const tap = () => {
      const s = ctx.createBufferSource();
      s.buffer = click;
      const hp = ctx.createBiquadFilter();
      hp.type = "bandpass";
      hp.frequency.value = 2200 + Math.random() * 1200;
      const g = ctx.createGain();
      g.gain.value = 0.12 + Math.random() * 0.1;
      s.connect(hp).connect(g).connect(master);
      s.start();
      const burst = Math.random() < 0.15;
      timers.push(window.setTimeout(tap, burst ? 1400 + Math.random() * 2600 : 90 + Math.random() * 160));
    };
    timers.push(window.setTimeout(tap, 1200));
  }

  void ctx.resume().catch(() => {});
  return () => {
    timers.forEach(t => clearTimeout(t));
    try {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    } catch { /* closing anyway */ }
    window.setTimeout(() => void ctx.close().catch(() => {}), 400);
  };
}
