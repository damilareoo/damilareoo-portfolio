"use client";

import { useState } from "react";
import { LabSetProvider, useLabShots } from "@/components/lab-set";
import { LabViewer } from "@/components/lab-viewer";

const pad = (i: number) => String(i + 1).padStart(2, "0");

/** Three vertical falls, alternating directions and speeds. */
const SPECS = [0, 1, 2].map((c) => ({
  c,
  mod: c,
  reverse: c % 2 === 1,
  dur: [75, 100, 86][c],
}));

/**
 * Lab 19 — waterfall.
 * Three vertical falls drifting against each other. Hover stills a
 * column; anything opens fullscreen. The wall that never sits still.
 */
function WaterfallPageInner() {
  const { shots, ratio } = useLabShots();
  const [at, setAt] = useState<number | null>(null);
  const [paused, setPaused] = useState<number | null>(null);

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <p className="px-5 pt-6 font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 19 — waterfall</p>
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-4 overflow-hidden px-5 py-4">
        {SPECS.map((col) => {
          const items = shots.filter((_, i) => i % 3 === col.mod);
          return (
          <div
            key={col.c}
            className="relative overflow-hidden"
            onMouseEnter={() => setPaused(col.c)}
            onMouseLeave={() => setPaused(null)}
          >
            <div
              className="flex w-full flex-col motion-safe:animate-[fall_var(--dur)_linear_infinite] motion-reduce:animate-none"
              style={
                {
                  "--dur": `${col.dur}s`,
                  animationDirection: col.reverse ? "reverse" : "normal",
                  animationPlayState: paused === col.c ? "paused" : "running",
                } as React.CSSProperties
              }
            >
              {[...items, ...items].map((s, k) => {
                const i = shots.indexOf(s);
                return (
                  <button
                    key={`${s.src}-${k}`}
                    type="button"
                    onClick={() => setAt(i)}
                    aria-label={`Open frame ${pad(i)}: ${s.alt}`}
                    className="w-full flex-none cursor-pointer overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
                    style={{ marginBottom: 16 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.src} alt="" aria-hidden loading="lazy" draggable={false} className="pointer-events-none block w-full object-cover" style={{ aspectRatio: ratio }} />
                  </button>
                );
              })}
            </div>
          </div>
          );
        })}
      </div>
      <p className="pb-6 text-center font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">{shots.length} frames</p>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
      <style>{`@keyframes fall { from { transform: translateY(0); } to { transform: translateY(-50%); } }`}</style>
    </main>
  );
}

export default function WaterfallPage() {
  return (
    <LabSetProvider>
      <WaterfallPageInner />
    </LabSetProvider>
  );
}
