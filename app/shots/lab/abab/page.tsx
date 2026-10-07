"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 70 — ABAB rhythm.
 * A strict alternating meter: full-bleed statement, compact pair,
 * statement, pair. The regularity is the design.
 */
export default function AbabPage() {
  const [at, setAt] = useState<number | null>(null);

  const rows: { big?: number; pair?: [number, number] }[] = [];
  {
    let i = 0;
    let big = true;
    while (i < shots.length) {
      if (big || i + 1 >= shots.length) {
        rows.push({ big: i });
        i++;
      } else {
        rows.push({ pair: [i, i + 1] });
        i += 2;
      }
      big = !big;
    }
  }

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] space-y-4 px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 70 — ABAB rhythm</p>
        {rows.map((row, r) =>
          row.big !== undefined ? (
            <button
              key={r}
              type="button"
              onClick={() => setAt(row.big!)}
              aria-label={`Open frame ${pad(row.big)}: ${shots[row.big].alt}`}
              className="block w-full cursor-zoom-in overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shots[row.big].src} alt="" aria-hidden loading={row.big < 4 ? undefined : "lazy"} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
            </button>
          ) : (
            <div key={r} className="mx-auto grid w-[86%] grid-cols-2 gap-3 sm:gap-4">
              {row.pair!.map((i) => (
                <button
                  key={shots[i].src}
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
          ),
        )}
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
