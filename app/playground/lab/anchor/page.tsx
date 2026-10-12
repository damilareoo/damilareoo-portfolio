"use client";

import { useEffect, useRef, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 41 — anchor rail.
 * A numbered spine: tap a number to jump the wall to that frame,
 * scroll-spy lights where you are. Photographer pattern (rousteau-222).
 */
export default function AnchorPage() {
  const [at, setAt] = useState<number | null>(null);

  const jump = (i: number) => {
    document.querySelector(`[data-f="${i}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 41 — anchor rail</p>
        <div className="sticky top-0 z-10 -mx-5 overflow-x-auto bg-[#fafafa]/90 px-5 py-3 backdrop-blur-md dark:bg-[#131313]/90">
          <div className="flex gap-1">
            {shots.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => jump(i)}
                aria-label={`Jump to frame ${pad(i)}`}
                className="cursor-pointer px-1.5 py-1 font-mono text-[11px] text-[#767676] hover:text-[#171717] dark:text-[#8a8a8a] dark:hover:text-white"
              >
                {pad(i)}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {shots.map((s, i) => (
            <button
              key={s.src}
              type="button"
              data-f={i}
              onClick={() => setAt(i)}
              aria-label={`Open frame ${pad(i)}: ${s.alt}`}
              className="block w-full scroll-mt-24 cursor-zoom-in overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt="" aria-hidden loading={i < 6 ? undefined : "lazy"} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
