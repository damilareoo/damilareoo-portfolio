"use client";

import { useCallback, useEffect, useState } from "react";
import { dossier } from "@/data/dossier";
import { useReducedMotion } from "@/lib/motion";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");
const DWELL = 3600;

/**
 * Lab 39 — dip slideshow.
 * Fullscreen frames dissolving through black: fade out, black beat,
 * fade in. Deliberate where flicker is frantic and cinema drifts.
 */
export default function DipPage() {
  const reduced = useReducedMotion();
  const [at, setAt] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");

  const step = useCallback(
    (dir: 1 | -1) => {
      if (reduced) {
        setAt((a) => (a + dir + shots.length) % shots.length);
        return;
      }
      setPhase("out");
      setTimeout(() => {
        setAt((a) => (a + dir + shots.length) % shots.length);
        setPhase("in");
      }, 380);
    },
    [reduced],
  );

  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => step(1), DWELL);
    return () => clearInterval(t);
  }, [reduced, step, at]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        step(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-black text-white">
      <p className="px-5 pt-6 font-mono text-xs text-white/50">lab 39 — dip slideshow</p>
      <div className="flex min-h-0 flex-1 items-center justify-center px-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={shots[at].src}
          src={shots[at].src}
          alt={shots[at].alt}
          draggable={false}
          className="max-h-full w-auto max-w-full rounded-xl object-contain ring-1 ring-white/10 transition-opacity duration-300 motion-reduce:transition-none"
          style={{ opacity: phase === "in" ? 1 : 0 }}
        />
      </div>
      <div className="mx-auto flex w-full max-w-[560px] items-center gap-4 px-5 pb-6">
        <button type="button" onClick={() => step(-1)} aria-label="Previous frame" className="cursor-pointer rounded-full p-2 ring-1 ring-white/15">←</button>
        <div className="h-px flex-1 bg-white/15" aria-hidden>
          <div className="h-px bg-white" style={{ width: `${((at + 1) / shots.length) * 100}%` }} />
        </div>
        <button type="button" onClick={() => step(1)} aria-label="Next frame" className="cursor-pointer rounded-full p-2 ring-1 ring-white/15">→</button>
        <span className="font-mono text-xs text-white/50">
          {pad(at)} / {shots.length}
        </span>
      </div>
    </main>
  );
}
