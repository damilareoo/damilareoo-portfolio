"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 66 — overlap collage.
 * Deliberate overlaps at mixed sizes: heroes, halves, quarters —
 * tap anything and it rises to the top. A pinned moodboard wall.
 */
export default function CollagePage() {
  const [at, setAt] = useState<number | null>(null);
  const [top, setTop] = useState<number | null>(null);

  const size = (i: number) => (i % 7 === 0 ? "col-span-2 row-span-2" : i % 5 === 0 ? "col-span-2" : "");

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 66 — overlap collage</p>
        <div className="mt-6 grid grid-cols-3 gap-0 sm:grid-cols-4">
          {shots.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => {
                setTop(i);
                setAt(i);
              }}
              onMouseEnter={() => setTop(i)}
              aria-label={`Open frame ${pad(i)}: ${s.alt}`}
              className={`relative block w-full cursor-zoom-in overflow-hidden bg-white ring-1 ring-[#e0e0e0] transition-transform duration-300 motion-reduce:transition-none dark:bg-[#1e1e1e] dark:ring-[#2b2b2b] ${size(i)} ${
                top === i ? "z-10 scale-[1.04] shadow-2xl" : "hover:z-10 hover:scale-[1.02]"
              } -ml-px -mt-px`}
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
