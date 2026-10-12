"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 64 — diagonal stack.
 * Each row slides further right, a staircase of frames descending
 * the page. Order reads downhill; the eye never gets lost.
 */
export default function DiagonalPage() {
  const [at, setAt] = useState<number | null>(null);

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 64 — diagonal stack</p>
        <div className="mt-6 space-y-3">
          {shots.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setAt(i)}
              aria-label={`Open frame ${pad(i)}: ${s.alt}`}
              className="block cursor-zoom-in overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
              style={{ width: "min(72%, 720px)", marginLeft: `${(i % 8) * 3.5}%` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt="" aria-hidden loading={i < 4 ? undefined : "lazy"} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
