"use client";

import { useEffect, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 80 — drift field.
 * Every tile floats on its own slow sine path, out of phase with its
 * neighbors. The wall never holds still, yet nothing ever leaves.
 */
export default function DriftfieldPage() {
  const [at, setAt] = useState<number | null>(null);

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 80 — drift field</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {shots.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setAt(i)}
              aria-label={`Open frame ${pad(i)}: ${s.alt}`}
              className="block w-full cursor-zoom-in overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] motion-safe:animate-[drift_11s_ease-in-out_infinite] motion-reduce:animate-none dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
              style={{ animationDelay: `${-((i * 1.7) % 9).toFixed(2)}s`, animationDuration: `${9 + (i % 5)}s` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt="" aria-hidden loading={i < 6 ? undefined : "lazy"} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
      <style>{`@keyframes drift { 0%, 100% { transform: translate(0, 0); } 33% { transform: translate(7px, -9px); } 66% { transform: translate(-6px, 7px); } }`}</style>
    </main>
  );
}
