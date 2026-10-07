"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 81 — pulse diagonal.
 * A brightness pulse sweeps corner to corner on loop: each tile's
 * delay is its diagonal distance. Light walks the wall.
 */
export default function PulsediagPage() {
  const [at, setAt] = useState<number | null>(null);
  const COLS = 4;

  return (
    <main className="bg-[#0d0d0d] text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#8a8a8a]">lab 81 — pulse diagonal</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {shots.map((s, i) => {
            const row = Math.floor(i / COLS);
            const col = i % COLS;
            return (
              <button
                key={s.src}
                type="button"
                onClick={() => setAt(i)}
                aria-label={`Open frame ${pad(i)}: ${s.alt}`}
                className="block w-full cursor-zoom-in overflow-hidden rounded-xl ring-1 ring-white/10 motion-safe:animate-[pulse-b_3.2s_ease-in-out_infinite] motion-reduce:animate-none"
                style={{ animationDelay: `${((row + col) * 0.22).toFixed(2)}s` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt="" aria-hidden loading={i < 8 ? undefined : "lazy"} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
              </button>
            );
          })}
        </div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} dark={true} />}
      <style>{`@keyframes pulse-b { 0%, 100% { filter: brightness(0.55); } 50% { filter: brightness(1.15); } }`}</style>
    </main>
  );
}
