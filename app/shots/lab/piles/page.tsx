"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");
const GROUPS = [7, 9, 4, 3, 4, 3, 3, 4, 5, 1, 3, 3, 3, 3, 2, 1, 1, 5];

const piles: number[][] = [];
{
  let i = 0;
  GROUPS.forEach((size) => {
    const idx: number[] = [];
    for (let t = 0; t < size && i < shots.length; t++, i++) idx.push(i);
    piles.push(idx);
  });
}

/**
 * Lab 71 — project piles.
 * Eighteen fanned piles, one per project: tap a pile to spread its
 * frames, tap one to go fullscreen. Sorting by hand, digitally.
 */
export default function PilesPage() {
  const [spread, setSpread] = useState<number | null>(null);
  const [at, setAt] = useState<number | null>(null);

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] space-y-8 px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 71 — project piles</p>
        {piles.map((pile, p) => {
          const open = spread === p;
          return (
            <div key={p}>
              <button
                type="button"
                onClick={() => setSpread(open ? null : p)}
                aria-expanded={open}
                aria-label={`Pile ${pad(p)}: ${pile.length} frames`}
                className="relative block h-28 w-44 cursor-pointer"
              >
                {pile.slice(0, 4).map((i, k) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={shots[i].src}
                    src={shots[i].src}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    draggable={false}
                    className="absolute inset-0 h-full w-full rounded-lg bg-white object-cover ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
                    style={{ transform: `rotate(${(k - 1.5) * 7}deg) translateX(${(k - 1.5) * 8}px)`, zIndex: k }}
                  />
                ))}
                <span aria-hidden className="absolute -bottom-5 left-0 font-mono text-[11px] tabular-nums text-[#767676] dark:text-[#8a8a8a]">
                  {pad(p)} — {pile.length}
                </span>
              </button>
              {open && (
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {pile.map((i) => (
                    <button
                      key={shots[i].src}
                      type="button"
                      onClick={() => setAt(i)}
                      aria-label={`Open frame ${pad(i)}: ${shots[i].alt}`}
                      className="block w-full cursor-zoom-in overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] motion-safe:animate-[pile-in_0.35s_ease] motion-reduce:animate-none dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={shots[i].src} alt="" aria-hidden loading="lazy" draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
      <style>{`@keyframes pile-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }`}</style>
    </main>
  );
}
