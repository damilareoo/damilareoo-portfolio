"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/** Row heights cycle — the set is all 16:9, so rhythm comes from height. */
const HEIGHTS = [148, 196, 164, 220];

/**
 * Lab 21 — justified bands.
 * Full-bleed rows running edge to edge, heights cycling in a fixed
 * rhythm. Nothing cropped, nothing gapped, all 64 in view.
 */
export default function JustifiedPage() {
  const [at, setAt] = useState<number | null>(null);

  const rows: number[][] = [];
  {
    let i = 0;
    let r = 0;
    while (i < shots.length) {
      const per = 3 + (r % 3);
      const idx: number[] = [];
      for (let t = 0; t < per && i < shots.length; t++, i++) idx.push(i);
      rows.push(idx);
      r++;
    }
  }

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1280px] px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 21 — justified bands</p>
        <div className="mt-6 space-y-1">
          {rows.map((row, r) => (
            <div key={r} className="flex gap-1">
              {row.map((i) => (
                <button
                  key={shots[i].src}
                  type="button"
                  onClick={() => setAt(i)}
                  aria-label={`Open frame ${pad(i)}: ${shots[i].alt}`}
                  className="min-w-0 flex-1 cursor-zoom-in overflow-hidden bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
                  style={{ height: HEIGHTS[r % HEIGHTS.length] }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={shots[i].src} alt="" aria-hidden loading={i < 8 ? undefined : "lazy"} draggable={false} className="pointer-events-none block h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
