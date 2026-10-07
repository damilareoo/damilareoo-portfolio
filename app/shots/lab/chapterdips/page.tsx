"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");
const GROUPS = [7, 9, 4, 3, 4, 3, 3, 4, 5, 1, 3, 3, 3, 3, 2, 1, 1, 5];

const chapters: number[][] = [];
{
  let i = 0;
  GROUPS.forEach((size) => {
    const idx: number[] = [];
    for (let t = 0; t < size && i < shots.length; t++, i++) idx.push(i);
    chapters.push(idx);
  });
}

/**
 * Lab 49 — chapter dips.
 * Project chapters separated by full black beats: scroll through a
 * cluster, dip to black, arrive at the next. Punctuation as rhythm.
 */
export default function ChapterdipsPage() {
  const [at, setAt] = useState<number | null>(null);

  return (
    <main className="bg-black text-white">
      <p className="px-5 pt-8 font-mono text-xs text-white/50">lab 49 — chapter dips</p>
      {chapters.map((ch, c) => (
        <div key={c}>
          <div className="mx-auto grid w-full max-w-[1120px] grid-cols-2 gap-3 px-5 py-14 sm:gap-4">
            {ch.map((i) => (
              <button
                key={shots[i].src}
                type="button"
                onClick={() => setAt(i)}
                aria-label={`Open frame ${pad(i)}: ${shots[i].alt}`}
                className="block w-full cursor-zoom-in overflow-hidden rounded-xl ring-1 ring-white/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={shots[i].src} alt="" aria-hidden loading="lazy" draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
              </button>
            ))}
          </div>
          {c < chapters.length - 1 && <div aria-hidden className="h-[26dvh] bg-black" />}
        </div>
      ))}
      <p className="pb-10 text-center font-mono text-xs text-white/50">{shots.length} frames</p>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} dark={true} />}
    </main>
  );
}
