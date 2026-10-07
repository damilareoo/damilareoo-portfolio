"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 30 — detail flip.
 * Every tile is two-sided: the frame, and a 2× zoom of its center.
 * Tap to turn it over. The work, then the craft inside the work.
 */
export default function FlipPage() {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

  const turn = (i: number) =>
    setFlipped((f) => {
      const n = new Set(f);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 30 — detail flip</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4" style={{ perspective: 1200 }}>
          {shots.map((s, i) => {
            const back = flipped.has(i);
            return (
              <button
                key={s.src}
                type="button"
                onClick={() => turn(i)}
                aria-label={`${back ? "Show full frame" : "Show 2× detail"} ${pad(i)}: ${s.alt}`}
                aria-pressed={back}
                className="block aspect-video w-full cursor-pointer"
              >
                <span
                  className="relative block h-full w-full transition-transform duration-500 motion-reduce:transition-none"
                  style={{ transformStyle: "preserve-3d", transform: back ? "rotateY(180deg)" : "none" }}
                >
                  <span className="absolute inset-0 overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]" style={{ backfaceVisibility: "hidden" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.src} alt="" aria-hidden loading={i < 6 ? undefined : "lazy"} draggable={false} className="pointer-events-none block h-full w-full object-cover" />
                  </span>
                  <span className="absolute inset-0 overflow-hidden rounded-xl bg-white ring-2 ring-[#171717] dark:bg-[#1e1e1e] dark:ring-white" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.src} alt="" aria-hidden loading="lazy" draggable={false} className="pointer-events-none block h-full w-full object-cover" style={{ transform: "scale(2)" }} />
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
