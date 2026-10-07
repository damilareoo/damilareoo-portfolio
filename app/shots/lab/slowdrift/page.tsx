"use client";

import { useEffect, useState } from "react";
import { dossier } from "@/data/dossier";
import { useReducedMotion } from "@/lib/motion";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");
const DWELL = 8000;

/**
 * Lab 52 — slow drift.
 * Contemplative autoplay: each frame pans almost imperceptibly for
 * eight seconds, then yields. For looking, not browsing.
 */
export default function SlowdriftPage() {
  const reduced = useReducedMotion();
  const [at, setAt] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setAt((a) => (a + 1) % shots.length), DWELL);
    return () => clearInterval(t);
  }, [reduced, at]);

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[#0d0d0d] text-[#f2f2f2]">
      <p className="px-5 pt-6 font-mono text-xs text-[#8a8a8a]">lab 52 — slow drift</p>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={shots[at].src}
          src={shots[at].src}
          alt={shots[at].alt}
          draggable={false}
          className="max-h-full w-auto max-w-none rounded-xl object-contain ring-1 ring-white/10 motion-safe:animate-[drift_8s_linear] motion-reduce:animate-none"
        />
      </div>
      <div className="mx-auto flex w-full max-w-[560px] items-center gap-4 px-5 pb-6">
        <button type="button" onClick={() => setAt((a) => (a - 1 + shots.length) % shots.length)} aria-label="Previous frame" className="cursor-pointer rounded-full p-2 ring-1 ring-white/15">←</button>
        <div className="h-px flex-1 bg-white/15" aria-hidden>
          <div className="h-px bg-white" style={{ width: `${((at + 1) / shots.length) * 100}%` }} />
        </div>
        <button type="button" onClick={() => setAt((a) => (a + 1) % shots.length)} aria-label="Next frame" className="cursor-pointer rounded-full p-2 ring-1 ring-white/15">→</button>
        <span className="font-mono text-xs text-[#8a8a8a]">
          {pad(at)} / {shots.length}
        </span>
      </div>
      <style>{`@keyframes drift { from { transform: scale(1.12) translateX(-1.5%); } to { transform: scale(1.12) translateX(1.5%); } }`}</style>
    </main>
  );
}
