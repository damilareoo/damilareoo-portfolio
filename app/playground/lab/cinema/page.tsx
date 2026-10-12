"use client";

import { useCallback, useEffect, useState } from "react";
import { dossier } from "@/data/dossier";
import { useReducedMotion } from "@/lib/motion";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");
const DWELL = 4200;

/**
 * Lab 12 — cinema.
 * A slow Ken Burns crossfade that plays itself. Touch nothing and it
 * runs; hover holds it; arrows take over. Screensaver energy.
 */
export default function CinemaPage() {
  const reduced = useReducedMotion();
  const [at, setAt] = useState(0);
  const [held, setHeld] = useState(false);

  const step = useCallback(
    (dir: 1 | -1) => setAt((a) => (a + dir + shots.length) % shots.length),
    [],
  );

  useEffect(() => {
    if (reduced || held) return;
    const t = setInterval(() => step(1), DWELL);
    return () => clearInterval(t);
  }, [reduced, held, step, at]);

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

  const s = shots[at];

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-black text-white">
      <p className="px-5 pt-6 font-mono text-xs text-white/50">lab 12 — cinema</p>
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-5"
        onMouseEnter={() => setHeld(true)}
        onMouseLeave={() => setHeld(false)}
        onTouchStart={() => setHeld(true)}
        onTouchEnd={() => setHeld(false)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={s.src}
          src={s.src}
          alt={s.alt}
          draggable={false}
          className={`max-h-full w-auto max-w-full rounded-xl object-contain motion-safe:animate-[cinema-in_${DWELL}ms_linear] motion-reduce:animate-none`}
        />
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous frame"
          className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-white/10 p-3 backdrop-blur-md"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next frame"
          className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-white/10 p-3 backdrop-blur-md"
        >
          →
        </button>
      </div>
      <div className="px-5 pb-6">
        <div className="mx-auto flex max-w-[560px] items-center gap-4">
          <div className="h-px flex-1 bg-white/15" aria-hidden>
            <div
              key={at}
              className="h-px bg-white motion-safe:animate-[cinema-bar_linear] motion-reduce:hidden"
              style={{ width: "100%", animationDuration: `${DWELL}ms`, animationPlayState: held || reduced ? "paused" : "running" }}
            />
          </div>
          <span className="font-mono text-xs text-white/50">
            {pad(at)} / {shots.length}
          </span>
        </div>
      </div>
      <style>{`@keyframes cinema-in { from { opacity: 0.35; transform: scale(1.06); } to { opacity: 1; transform: scale(1); } }
@keyframes cinema-bar { from { width: 0; } to { width: 100%; } }`}</style>
    </main>
  );
}
