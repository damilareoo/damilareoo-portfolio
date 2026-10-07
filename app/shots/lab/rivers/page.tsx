"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/** Three infinite drifts, alternating directions and speeds. */
const ROWS = [0, 1, 2].map((r) => ({
  r,
  items: shots.filter((_, i) => i % 3 === r),
  reverse: r % 2 === 1,
  dur: [68, 92, 80][r],
}));

/**
 * Lab 17 — rivers.
 * Three drifts running against each other at different speeds. Hover
 * stills a river; anything opens fullscreen. Alive on arrival.
 */
export default function RiversPage() {
  const [at, setAt] = useState<number | null>(null);
  const [paused, setPaused] = useState<number | null>(null);

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <p className="px-5 pt-6 font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 17 — rivers</p>
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-4 py-4">
        {ROWS.map((row) => (
          <div
            key={row.r}
            className="group relative overflow-hidden"
            onMouseEnter={() => setPaused(row.r)}
            onMouseLeave={() => setPaused(null)}
          >
            <div
              className="flex w-max motion-safe:animate-[river_var(--dur)_linear_infinite] motion-reduce:animate-none"
              style={
                {
                  "--dur": `${row.dur}s`,
                  animationDirection: row.reverse ? "reverse" : "normal",
                  animationPlayState: paused === row.r ? "paused" : "running",
                } as React.CSSProperties
              }
            >
              {[...row.items, ...row.items].map((s, k) => {
                const i = shots.indexOf(s);
                return (
                  <button
                    key={`${s.src}-${k}`}
                    type="button"
                    onClick={() => setAt(i)}
                    aria-label={`Open frame ${pad(i)}: ${s.alt}`}
                    className="w-[68vw] max-w-[520px] flex-none cursor-pointer overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] sm:w-[38vw] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
                    style={{ marginRight: 16 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.src} alt="" aria-hidden loading="lazy" draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="pb-6 text-center font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">{shots.length} frames</p>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
      <style>{`@keyframes river { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </main>
  );
}
