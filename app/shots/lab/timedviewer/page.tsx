"use client";

import { useEffect, useState } from "react";
import { dossier } from "@/data/dossier";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");
const DWELL = 5000;

/**
 * Lab 79 — timed viewer.
 * Fullscreen with a ring timer: every frame gets five seconds, the
 * ring drains, tap anywhere resets the clock. Broadcast pacing.
 */
export default function TimedviewerPage() {
  const [at, setAt] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setAt((a) => (a + 1) % shots.length), DWELL);
    return () => clearInterval(t);
  }, [at]);

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-black text-white" onClick={() => setAt((a) => (a + 1) % shots.length)}>
      <p className="px-5 pt-6 font-mono text-xs text-white/50">lab 79 — timed viewer</p>
      <div className="flex min-h-0 flex-1 cursor-pointer items-center justify-center px-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={shots[at].src} src={shots[at].src} alt={shots[at].alt} draggable={false} className="pointer-events-none max-h-full w-auto max-w-full rounded-xl object-contain ring-1 ring-white/10" />
      </div>
      <div className="flex items-center justify-center gap-4 pb-6">
        <span key={at} aria-hidden className="relative block h-8 w-8">
          <svg viewBox="0 0 32 32" className="h-full w-full -rotate-90">
            <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            <circle
              cx="16"
              cy="16"
              r="13"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeDasharray={2 * Math.PI * 13}
              className="motion-safe:animate-[ring-drain_5s_linear] motion-reduce:hidden"
            />
          </svg>
        </span>
        <span className="font-mono text-xs text-white/50">
          {pad(at)} / {shots.length}
        </span>
      </div>
      <style>{`@keyframes ring-drain { from { stroke-dashoffset: 0; } to { stroke-dashoffset: ${2 * Math.PI * 13}; } }`}</style>
    </main>
  );
}
