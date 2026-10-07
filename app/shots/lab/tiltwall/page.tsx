"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 58 — tilt wall.
 * The whole wall is a plane that banks toward the pointer; tiles at
 * different depths shift apart. One surface, real dimension.
 */
export default function TiltwallPage() {
  const [at, setAt] = useState<number | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  return (
    <main
      className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        setTilt({ x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 });
      }}
    >
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8" style={{ perspective: 1600 }}>
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 58 — tilt wall</p>
        <div
          className="mt-6 grid grid-cols-2 gap-3 transition-transform duration-200 ease-out motion-reduce:transition-none sm:grid-cols-3 sm:gap-4"
          style={{ transform: `rotateX(${(-tilt.y * 7).toFixed(2)}deg) rotateY(${(tilt.x * 9).toFixed(2)}deg)`, transformStyle: "preserve-3d" }}
        >
          {shots.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setAt(i)}
              aria-label={`Open frame ${pad(i)}: ${s.alt}`}
              className="block w-full cursor-zoom-in overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
              style={{ transform: `translateZ(${((i % 5) * 22).toFixed(0)}px)` }}
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
