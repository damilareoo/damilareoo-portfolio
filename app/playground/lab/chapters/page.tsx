"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
/** Project group sizes in wall order: vienna, sylvan, chessever, hitman's,
 *  remi, mederva, glint, intempus, sequence, zlink, pintours, inunity,
 *  textedly, seal12, smallgpt, strix, axion, singles. */
const GROUPS = [7, 9, 4, 3, 4, 3, 3, 4, 5, 1, 3, 3, 3, 3, 2, 1, 1, 5];
const pad = (i: number) => String(i + 1).padStart(2, "0");

const chapters: { n: number; idx: number[] }[] = [];
{
  let i = 0;
  GROUPS.forEach((size, g) => {
    const idx: number[] = [];
    for (let t = 0; t < size && i < shots.length; t++, i++) idx.push(i);
    chapters.push({ n: g + 1, idx });
  });
}

/**
 * Lab 10 — chapter rails.
 * The set's project grouping, surfaced: one snap rail per chapter,
 * headed by a ghost number. No words anywhere.
 */
export default function ChaptersPage() {
  const [at, setAt] = useState<number | null>(null);

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] space-y-12 px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 10 — chapter rails</p>
        {chapters.map((c) => (
          <section key={c.n} aria-label={`Chapter ${pad(c.n - 1)}`}>
            <p aria-hidden className="select-none font-mono text-5xl font-bold leading-none text-[#171717]/10 dark:text-white/10">
              {pad(c.n - 1)}
            </p>
            <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
              {c.idx.map((i) => (
                <button
                  key={shots[i].src}
                  type="button"
                  onClick={() => setAt(i)}
                  aria-label={`Open frame ${pad(i)}: ${shots[i].alt}`}
                  className="w-[78vw] max-w-[560px] flex-none cursor-zoom-in snap-start overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] sm:w-[46vw] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={shots[i].src} alt="" aria-hidden loading="lazy" draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
