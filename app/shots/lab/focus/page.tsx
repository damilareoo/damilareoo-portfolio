"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 25 — focus grid.
 * Tap a tile and it grows in place, pushing the rest aside. Tap again
 * to release, double-tap to go fullscreen. The grid breathes around
 * whatever holds your attention.
 */
export default function FocusPage() {
  const [focus, setFocus] = useState<number | null>(null);
  const [at, setAt] = useState<number | null>(null);

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 25 — focus grid</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {shots.map((s, i) => {
            const live = i === focus;
            return (
              <button
                key={s.src}
                type="button"
                onClick={() => (live ? setAt(i) : setFocus(i))}
                onMouseEnter={() => setFocus(i)}
                aria-label={live ? `Open frame ${pad(i)} fullscreen` : `Focus frame ${pad(i)}: ${s.alt}`}
                className={`block w-full cursor-pointer overflow-hidden rounded-xl bg-white text-left ring-1 transition-all duration-400 motion-reduce:transition-none dark:bg-[#1e1e1e] ${
                  live ? "col-span-2 row-span-2 ring-2 ring-[#171717] dark:ring-white" : "ring-[#e0e0e0] opacity-75 hover:opacity-100 dark:ring-[#2b2b2b]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt={live ? s.alt : ""} aria-hidden={!live} loading={i < 8 ? undefined : "lazy"} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
              </button>
            );
          })}
        </div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
