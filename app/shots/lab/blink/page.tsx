"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 96 — blink cascade.
 * On load the wall blinks awake in diagonal sequence, tile by tile,
 * then holds perfectly still. One hello, then silence.
 */
export default function BlinkPage() {
  const [at, setAt] = useState<number | null>(null);
  const COLS = 3;

  return (
    <main className="bg-[#0d0d0d] text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#8a8a8a]">lab 96 — blink cascade</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {shots.map((s, i) => {
            const row = Math.floor(i / COLS);
            const col = i % COLS;
            return (
              <button
                key={s.src}
                type="button"
                onClick={() => setAt(i)}
                aria-label={`Open frame ${pad(i)}: ${s.alt}`}
                className="block w-full cursor-zoom-in overflow-hidden rounded-xl ring-1 ring-white/10 motion-safe:animate-[blink_0.5s_ease_both] motion-reduce:animate-none"
                style={{ animationDelay: `${((row + col) * 0.09).toFixed(2)}s` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt="" aria-hidden loading={i < 6 ? undefined : "lazy"} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
              </button>
            );
          })}
        </div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} dark={true} />}
      <style>{`@keyframes blink { 0% { opacity: 0; } 40% { opacity: 1; } 60% { opacity: 0.25; } 100% { opacity: 1; } }`}</style>
    </main>
  );
}
