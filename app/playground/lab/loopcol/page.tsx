"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 90 — loop column.
 * One column, endless: scroll past 64 and you're back at 01 without
 * a seam. The set as a loop, not a list.
 */
export default function LoopcolPage() {
  const [at, setAt] = useState<number | null>(null);

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[720px] px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 90 — loop column</p>
        <div className="mt-6 space-y-4">
          {[...shots, ...shots.slice(0, 8)].map((s, k) => {
            const i = k % shots.length;
            return (
              <button
                key={`${s.src}-${k}`}
                type="button"
                onClick={() => setAt(i)}
                aria-label={`Open frame ${pad(i)}: ${s.alt}`}
                className="block w-full cursor-zoom-in overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt="" aria-hidden loading={k < 3 ? undefined : "lazy"} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
              </button>
            );
          })}
        </div>
        <p className="mt-8 text-center font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">↻ {shots.length}</p>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
