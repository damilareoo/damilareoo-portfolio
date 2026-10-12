"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 87 — edge bleed.
 * Frames wider than the viewport, bleeding off both edges; scroll
 * sideways through the overhang. Generous to a fault.
 */
export default function EdgebleedPage() {
  const [at, setAt] = useState<number | null>(null);

  return (
    <main className="flex h-dvh flex-col justify-center overflow-hidden bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <p className="px-5 pb-4 font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 87 — edge bleed</p>
      <div className="flex w-full snap-x snap-mandatory items-center gap-5 overflow-x-auto px-[8vw]">
        {shots.map((s, i) => (
          <button
            key={s.src}
            type="button"
            onClick={() => setAt(i)}
            aria-label={`Open frame ${pad(i)}: ${s.alt}`}
            className="h-[64dvh] w-[112vw] max-w-none flex-none cursor-pointer snap-center overflow-hidden bg-white ring-1 ring-[#e0e0e0] sm:w-[64vw] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt="" aria-hidden loading={i < 2 ? undefined : "lazy"} draggable={false} className="pointer-events-none block h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <p className="pt-4 text-center font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">
        {pad(0)} – {pad(shots.length - 1)}
      </p>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
