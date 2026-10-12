"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 86 — fullbleed pairs.
 * Two stacked fullbleeds per screen, snap scrolling. Twice the
 * sequence, half the travel. Compare as you go.
 */
export default function PairsPage() {
  const [at, setAt] = useState<number | null>(null);

  const rows: number[][] = [];
  for (let i = 0; i < shots.length; i += 2) rows.push([i, i + 1].filter((x) => x < shots.length));

  return (
    <main className="h-[100dvh] snap-y snap-mandatory overflow-y-auto bg-black text-white">
      <p className="fixed left-5 top-6 z-10 font-mono text-xs text-white/50">lab 86 — fullbleed pairs</p>
      {rows.map((row, r) => (
        <section key={r} className="flex h-[100dvh] snap-start snap-always flex-col items-center justify-center gap-4 px-4">
          {row.map((i) => (
            <button
              key={shots[i].src}
              type="button"
              onClick={() => setAt(i)}
              aria-label={`Open frame ${pad(i)} fullscreen: ${shots[i].alt}`}
              className="block w-full max-w-[1000px] cursor-zoom-in overflow-hidden rounded-xl ring-1 ring-white/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shots[i].src} alt="" aria-hidden loading={r < 2 ? undefined : "lazy"} draggable={false} className="block max-h-[42dvh] w-full object-cover" />
            </button>
          ))}
        </section>
      ))}
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} dark={true} />}
    </main>
  );
}
