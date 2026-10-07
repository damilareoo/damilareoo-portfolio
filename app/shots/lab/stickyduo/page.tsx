"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 89 — sticky duo.
 * Frames travel in sticking pairs: two hold the viewport together,
 * then the next pair slides over them. Company all the way down.
 */
export default function StickyduoPage() {
  const [at, setAt] = useState<number | null>(null);

  const pairs: number[][] = [];
  for (let i = 0; i < shots.length; i += 2) pairs.push([i, i + 1].filter((x) => x < shots.length));

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1000px] px-5 pb-32 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 89 — sticky duo</p>
        <div className="mt-6 space-y-[14dvh]">
          {pairs.map((pair, p) => (
            <div key={p} className="sticky space-y-4" style={{ top: 96 }}>
              {pair.map((i) => (
                <button
                  key={shots[i].src}
                  type="button"
                  onClick={() => setAt(i)}
                  aria-label={`Open frame ${pad(i)}: ${shots[i].alt}`}
                  className="block w-full cursor-zoom-in overflow-hidden rounded-2xl bg-white ring-1 ring-[#e0e0e0] drop-shadow-[0_24px_48px_rgba(0,0,0,0.18)] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={shots[i].src} alt="" aria-hidden loading={p < 2 ? undefined : "lazy"} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
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
