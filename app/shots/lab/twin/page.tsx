"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

const TOP = shots.filter((_, i) => i % 2 === 0);
const BOTTOM = shots.filter((_, i) => i % 2 === 1);

/**
 * Lab 23 — twin rails.
 * Two snap rails running in opposite directions: evens drift right,
 * odds drift left. One page, two currents.
 */
export default function TwinPage() {
  const [at, setAt] = useState<number | null>(null);

  const rail = (items: typeof shots, flip: boolean) => (
    <div className={`flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 ${flip ? "flex-row-reverse" : ""}`}>
      {items.map((s) => {
        const i = shots.indexOf(s);
        return (
          <button
            key={s.src}
            type="button"
            onClick={() => setAt(i)}
            aria-label={`Open frame ${pad(i)}: ${s.alt}`}
            className="w-[70vw] max-w-[480px] flex-none cursor-zoom-in snap-center overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] sm:w-[36vw] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt="" aria-hidden loading="lazy" draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
          </button>
        );
      })}
    </div>
  );

  return (
    <main className="flex h-dvh flex-col justify-center gap-8 overflow-hidden bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <p className="px-5 font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 23 — twin rails</p>
      {rail(TOP, false)}
      {rail(BOTTOM, true)}
      <p className="text-center font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">{shots.length} frames</p>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
