"use client";

import { useEffect, useState } from "react";
import { dossier } from "@/data/dossier";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");
const BEAT = 2600;

/**
 * Lab 51 — metronome.
 * Fullscreen on a steady beat, a pulse ring marking time. Predictable
 * as a clock, impossible to scroll past. Tap to hold the beat.
 */
export default function MetronomePage() {
  const [at, setAt] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (held) return;
    const t = setInterval(() => setAt((a) => (a + 1) % shots.length), BEAT);
    return () => clearInterval(t);
  }, [held, at]);

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-black text-white" onClick={() => setHeld((h) => !h)}>
      <p className="px-5 pt-6 font-mono text-xs text-white/50">lab 51 — metronome</p>
      <div className="relative flex min-h-0 flex-1 cursor-pointer items-center justify-center px-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={shots[at].src} src={shots[at].src} alt={shots[at].alt} draggable={false} className="max-h-full w-auto max-w-full rounded-xl object-contain ring-1 ring-white/10" />
        {!held && (
          <span
            key={at}
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 motion-safe:animate-[pulse-ring_2.6s_ease-out] motion-reduce:hidden"
          />
        )}
      </div>
      <p className="pb-6 text-center font-mono text-xs text-white/50">
        {pad(at)} / {shots.length}
      </p>
      <style>{`@keyframes pulse-ring { from { transform: translate(-50%, -50%) scale(0.55); opacity: 0.8; } to { transform: translate(-50%, -50%) scale(1); opacity: 0; } }`}</style>
    </main>
  );
}
