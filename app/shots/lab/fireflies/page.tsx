"use client";

import { useEffect, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 83 — fireflies.
 * Random tiles glow and fade in no pattern, a few at a time. The
 * wall winks at you while you decide where to look.
 */
export default function FirefliesPage() {
  const [at, setAt] = useState<number | null>(null);
  const [lit, setLit] = useState<number[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      setLit(() => {
        const n = new Set<number>();
        while (n.size < 4) n.add(Math.floor(Math.random() * shots.length));
        return [...n];
      });
    }, 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="bg-[#0d0d0d] text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#8a8a8a]">lab 83 — fireflies</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {shots.map((s, i) => {
            const on = lit.includes(i);
            return (
              <button
                key={s.src}
                type="button"
                onClick={() => setAt(i)}
                aria-label={`Open frame ${pad(i)}: ${s.alt}`}
                className={`block w-full cursor-zoom-in overflow-hidden rounded-xl ring-1 transition-all duration-1000 motion-reduce:transition-none ${
                  on ? "brightness-110 ring-white/40" : "brightness-[0.6] ring-white/10"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt="" aria-hidden loading={i < 8 ? undefined : "lazy"} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
              </button>
            );
          })}
        </div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} dark={true} />}
    </main>
  );
}
