"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 98 — focus pull.
 * One frame sharp, the rest sunk in blur; sharpness follows the
 * cursor like a lens racking focus. Tap the sharp one to open it.
 */
export default function FocuspullPage() {
  const [sharp, setSharp] = useState<number | null>(null);
  const [at, setAt] = useState<number | null>(null);

  return (
    <main
      className="bg-[#0d0d0d] text-[#f2f2f2]"
      onPointerLeave={() => setSharp(null)}
    >
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#8a8a8a]">lab 98 — focus pull</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {shots.map((s, i) => {
            const on = sharp === i;
            return (
              <button
                key={s.src}
                type="button"
                onMouseEnter={() => setSharp(i)}
                onFocus={() => setSharp(i)}
                onClick={() => setAt(i)}
                aria-label={`Open frame ${pad(i)}: ${s.alt}`}
                className="block w-full cursor-zoom-in overflow-hidden rounded-xl ring-1 transition-all duration-400 motion-reduce:transition-none"
                style={{
                  filter: on ? "blur(0px) brightness(1)" : "blur(3px) brightness(0.6)",
                  transform: on ? "scale(1.02)" : "scale(1)",
                  ["--tw-ring-color" as string]: on ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.08)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt={on ? s.alt : ""} aria-hidden={!on} loading={i < 6 ? undefined : "lazy"} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
              </button>
            );
          })}
        </div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} dark={true} />}
    </main>
  );
}
