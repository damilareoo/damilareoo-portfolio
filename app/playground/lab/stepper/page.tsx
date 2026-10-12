"use client";

import { useCallback, useEffect, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 44 — stepper.
 * Fullscreen, advanced in tens: −10 and +10 leap across the set,
 * singles refine. Built for covering 64 fast without scrolling.
 */
export default function StepperPage() {
  const [at, setAt] = useState(0);
  const go = useCallback((d: number) => setAt((a) => (a + d + shots.length) % shots.length), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(e.shiftKey ? 10 : 1);
      else if (e.key === "ArrowLeft") go(e.shiftKey ? -10 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-black text-white">
      <p className="px-5 pt-6 font-mono text-xs text-white/50">lab 44 — stepper</p>
      <div className="flex min-h-0 flex-1 items-center justify-center px-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={shots[at].src} src={shots[at].src} alt={shots[at].alt} draggable={false} className="max-h-full w-auto max-w-full rounded-xl object-contain ring-1 ring-white/10" />
      </div>
      <div className="mx-auto flex w-full max-w-[560px] items-center justify-center gap-3 px-5 pb-8">
        {[-10, -1, 1, 10].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => go(d)}
            aria-label={`Move ${d > 0 ? "+" : ""}${d} frames`}
            className="cursor-pointer rounded-full px-5 py-2.5 font-mono text-xs ring-1 ring-white/15 hover:bg-white/10"
          >
            {d > 0 ? `+${d}` : d}
          </button>
        ))}
        <span className="ml-2 font-mono text-xs text-white/50">
          {pad(at)} / {shots.length}
        </span>
      </div>
    </main>
  );
}
