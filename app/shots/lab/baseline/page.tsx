"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 67 — baseline row.
 * Everything sits on one baseline like type: a single bottom-aligned
 * row, heights stepping up and down. Scroll sideways along the line.
 */
export default function BaselinePage() {
  const [at, setAt] = useState<number | null>(null);

  return (
    <main className="flex h-dvh flex-col justify-end overflow-hidden bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <p className="px-5 pb-4 font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 67 — baseline row</p>
      <div className="flex w-full items-end gap-2 overflow-x-auto px-5 pb-2">
        {shots.map((s, i) => (
          <button
            key={s.src}
            type="button"
            onClick={() => setAt(i)}
            aria-label={`Open frame ${pad(i)}: ${s.alt}`}
            className="w-[46vw] max-w-[380px] flex-none cursor-pointer overflow-hidden rounded-t-xl bg-white ring-1 ring-[#e0e0e0] sm:w-[26vw] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
            style={{ height: 200 + ((i * 67) % 5) * 56 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt="" aria-hidden loading={i < 4 ? undefined : "lazy"} draggable={false} className="pointer-events-none block h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <div aria-hidden className="h-px w-full bg-[#171717] dark:bg-white" />
      <p className="py-4 text-center font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">{shots.length} frames</p>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
