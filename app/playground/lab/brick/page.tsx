"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 63 — brick weave.
 * Courses offset like brickwork: odd rows indent half a tile, heights
 * alternate low and high. Masonry's orderly cousin.
 */
export default function BrickPage() {
  const [at, setAt] = useState<number | null>(null);

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 63 — brick weave</p>
        <div className="mt-6 space-y-3">
          {(() => {
            const rows: { per: number; idx: number[] }[] = [];
            let i = 0;
            let r = 0;
            while (i < shots.length) {
              const per = r % 2 === 0 ? 4 : 3;
              const idx: number[] = [];
              for (let t = 0; t < per && i < shots.length; t++, i++) idx.push(i);
              rows.push({ per, idx });
              r++;
            }
            return rows.map((row, r) => (
              <div key={r} className={`grid gap-3 ${row.per === 4 ? "grid-cols-4" : "grid-cols-3 px-[6%]"}`}>
                {row.idx.map((i) => (
                  <button
                    key={`${r}-${shots[i].src}`}
                    type="button"
                    onClick={() => setAt(i)}
                    aria-label={`Open frame ${pad(i)}: ${shots[i].alt}`}
                    className="block w-full cursor-zoom-in overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={shots[i].src} alt="" aria-hidden loading="lazy" draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
                  </button>
                ))}
              </div>
            ));
          })()}
        </div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
