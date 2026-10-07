"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 34 — density slider.
 * Apple-photos continuum: one thumb slides the wall from a single
 * column to six. The grid is a zoom level, not a layout.
 */
export default function DensityPage() {
  const [cols, setCols] = useState(3);
  const [at, setAt] = useState<number | null>(null);

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1280px] px-5 pb-24 pt-8">
        <div className="flex items-center justify-between gap-6">
          <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 34 — density slider</p>
          <input
            type="range"
            min={1}
            max={6}
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
            aria-label="Grid density in columns"
            className="w-40 cursor-pointer accent-[#171717] dark:accent-white"
          />
        </div>
        <div className="mt-6 grid gap-2 sm:gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {shots.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setAt(i)}
              aria-label={`Open frame ${pad(i)}: ${s.alt}`}
              className="block w-full cursor-zoom-in overflow-hidden rounded-lg bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt="" aria-hidden loading={i < 8 ? undefined : "lazy"} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
