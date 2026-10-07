"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 15 — wipe-to-clear.
 * Every frame starts under frost; the first pass of the cursor wipes
 * it clear for good. Cleared tiles stay clear, with a re-frost reset —
 * the harbour dialect, tiled.
 */
export default function WipePage() {
  const [cleared, setCleared] = useState<Set<number>>(new Set());
  const [at, setAt] = useState<number | null>(null);

  const wipe = (i: number) =>
    setCleared((c) => (c.has(i) ? c : new Set(c).add(i)));

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 15 — wipe-to-clear</p>
          <button
            type="button"
            onClick={() => setCleared(new Set())}
            aria-label="Re-frost all frames"
            className="cursor-pointer rounded-full p-2 font-mono text-xs text-[#767676] ring-1 ring-[#e5e5e5] hover:text-[#171717] dark:text-[#8a8a8a] dark:ring-white/10 dark:hover:text-white"
          >
            ❄ {cleared.size}/{shots.length}
          </button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {shots.map((s, i) => {
            const clear = cleared.has(i);
            return (
              <div key={s.src} className="relative overflow-hidden rounded-xl">
                <button
                  type="button"
                  onClick={() => setAt(i)}
                  aria-label={`Open frame ${pad(i)}: ${s.alt}`}
                  className="block w-full cursor-zoom-in bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.src} alt="" aria-hidden loading={i < 6 ? undefined : "lazy"} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
                </button>
                <div
                  aria-hidden
                  onPointerEnter={() => wipe(i)}
                  className={`pointer-events-auto absolute inset-0 bg-[#fafafa]/85 backdrop-blur-xl transition-opacity duration-700 motion-reduce:transition-none dark:bg-[#131313]/85 ${
                    clear ? "pointer-events-none opacity-0" : "opacity-100"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
