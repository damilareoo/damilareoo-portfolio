"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 68 — triangle.
 * Rows of 1-2-3-4-5-6 widening down the page, centered like a
 * pyramid. Monumental order for 64 frames.
 */
export default function TrianglePage() {
  const [at, setAt] = useState<number | null>(null);

  const rows: number[][] = [];
  {
    let i = 0;
    let per = 1;
    while (i < shots.length) {
      const idx: number[] = [];
      for (let t = 0; t < per && i < shots.length; t++, i++) idx.push(i);
      rows.push(idx);
      per++;
    }
  }

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] space-y-3 px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 68 — triangle</p>
        {rows.map((row, r) => (
          <div key={r} className="mx-auto flex justify-center gap-3" style={{ maxWidth: `${Math.min(row.length * 220, 1120)}px` }}>
            {row.map((i) => (
              <button
                key={shots[i].src}
                type="button"
                onClick={() => setAt(i)}
                aria-label={`Open frame ${pad(i)}: ${shots[i].alt}`}
                className="min-w-0 flex-1 cursor-zoom-in overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={shots[i].src} alt="" aria-hidden loading="lazy" draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
              </button>
            ))}
          </div>
        ))}
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
