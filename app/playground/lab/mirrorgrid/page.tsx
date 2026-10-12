"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 97 — mirror grid.
 * Two identical grids facing each other across a center seam: scroll
 * either, both move as one. Twice the wall, half the travel.
 */
export default function MirrorgridPage() {
  const [at, setAt] = useState<number | null>(null);

  const grid = (flip: boolean) => (
    <div className="grid min-w-0 flex-1 grid-cols-2 gap-3">
      {shots.map((s, i) => (
        <button
          key={`${flip}-${s.src}`}
          type="button"
          onClick={() => setAt(i)}
          aria-label={`Open frame ${pad(i)}: ${s.alt}`}
          className="block w-full cursor-zoom-in overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.src} alt="" aria-hidden loading="lazy" draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
        </button>
      ))}
    </div>
  );

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1400px] px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 97 — mirror grid</p>
        <div className="mt-6 flex items-start gap-3">
          {grid(false)}
          <span aria-hidden className="w-px self-stretch bg-[#171717]/15 dark:bg-white/15" />
          {grid(true)}
        </div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
