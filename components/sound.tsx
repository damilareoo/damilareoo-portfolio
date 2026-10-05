"use client";

import { useEffect } from "react";

const KEY = "damilareoo-sound";

/**
 * The site's own voice — four cues synthesized live with Web Audio,
 * one per toy, nothing generic. No files, no dependency.
 *
 * - coin: a metallic clink. Two detuned high oscillators under a
 *   noise click, gone in a third of a second — the whip sets the
 *   brightness, so a hard spin rings brighter (see Coin).
 * - shuffle: a paper swish. Bandpassed noise falling as the pile
 *   re-deals, for both photo piles.
 * - cap: a glassy tick. One short sine and its harmonic, for the
 *   stray cap's dash.
 * - tap: a soft wooden tok for the floor switches.
 *
 * The context is created on the first gesture, so nothing can
 * sound before the visitor acts. Respects the footer mute,
 * persisted across visits.
 */

let ctx: AudioContext | null = null;
let enabled = true;
let volume = 0.35;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function env(g: GainNode, t: number, peak: number, decay: number) {
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
}

function noiseBuffer(c: AudioContext, seconds: number): AudioBuffer {
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * seconds), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

/** Brightness 0..1 — the coin's whip speed plays it. */
export function coinSound(brightness = 0.5) {
  const c = ac();
  if (!c || !enabled) return;
  const t = c.currentTime;
  const b = Math.min(1, Math.max(0, brightness));
  // the clink: two detuned metallic partials
  [4180 + b * 900, 5630 + b * 1100].forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = i === 0 ? "triangle" : "sine";
    o.frequency.value = f * (1 + (Math.random() - 0.5) * 0.01);
    env(g, t, volume * (i === 0 ? 0.5 : 0.3), 0.32);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.4);
  });
  // the strike: a click of noise
  const n = c.createBufferSource();
  n.buffer = noiseBuffer(c, 0.05);
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 6000;
  const g = c.createGain();
  env(g, t, volume * 0.35, 0.05);
  n.connect(hp).connect(g).connect(c.destination);
  n.start(t);
}

export function shuffleSound() {
  const c = ac();
  if (!c || !enabled) return;
  const t = c.currentTime;
  const n = c.createBufferSource();
  n.buffer = noiseBuffer(c, 0.25);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 1.2;
  bp.frequency.setValueAtTime(3200, t);
  bp.frequency.exponentialRampToValueAtTime(900, t + 0.2);
  const g = c.createGain();
  env(g, t, volume * 0.5, 0.22);
  n.connect(bp).connect(g).connect(c.destination);
  n.start(t);
}

export function capSound() {
  const c = ac();
  if (!c || !enabled) return;
  const t = c.currentTime;
  [2760, 4140].forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.value = f;
    env(g, t, volume * (i === 0 ? 0.4 : 0.18), 0.12);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.15);
  });
}

export function tapSound() {
  const c = ac();
  if (!c || !enabled) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(820, t);
  o.frequency.exponentialRampToValueAtTime(540, t + 0.07);
  env(g, t, volume * 0.5, 0.09);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + 0.1);
}

type Tone = "coin" | "shuffle" | "cap" | "tap";

/**
 * One delegated listener: any tap inside [data-tone] plays its cue.
 * The coin passes its own brightness separately (see Coin).
 */
export function SoundBind() {
  useEffect(() => {
    const onTap = (e: Event) => {
      const el = (e.target as HTMLElement).closest?.("[data-tone]");
      if (!el || el.getAttribute("data-tone") === "coin") return;
      const tone = el.getAttribute("data-tone") as Tone;
      if (tone === "shuffle") shuffleSound();
      else if (tone === "cap") capSound();
      else tapSound();
    };
    document.addEventListener("click", onTap, { passive: true });
    return () => document.removeEventListener("click", onTap);
  }, []);
  return null;
}

/** Reads the saved sound preference (on unless explicitly muted). */
export function soundOn(): boolean {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

/** Persists the footer speaker toggle. */
export function setSoundOn(on: boolean) {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* private mode — the session default stands */
  }
}
