"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");
const TRAIL = 5;

/**
 * Lab 60 — echo trail.
 * The last five frames you touched follow the cursor as a fading
 * comet. Your path through the set, drawn behind you.
 */
export default function EchotrailPage() {
  const [at, setAt] = useState<number | null>(null);
  const [trail, setTrail] = useState<number[]>([]);
  const [pos, setPos] = useState({ x: -500, y: -500 });

  const touch = (i: number) => setTrail((t) => [i, ...t.filter((x) => x !== i)].slice(0, TRAIL));

  return (
    <main
      className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]"
      onPointerMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
    >
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 60 — echo trail</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {shots.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onMouseEnter={() => touch(i)}
              onFocus={() => touch(i)}
              onClick={() => setAt(i)}
              aria-label={`Open frame ${pad(i)}: ${s.alt}`}
              className="block w-full cursor-zoom-in overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt="" aria-hidden loading={i < 6 ? undefined : "lazy"} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-40 hidden sm:block">
        {trail.map((i, k) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={`${i}-${k}`}
            src={shots[i].src}
            alt=""
            aria-hidden
            draggable={false}
            className="absolute w-40 rounded-lg object-cover ring-1 ring-black/20"
            style={{
              left: pos.x - k * 26 - 80,
              top: pos.y - k * 18 - 50,
              opacity: 0.85 - k * 0.16,
              zIndex: 40 - k,
              transform: `rotate(${(k - 2) * 4}deg)`,
            }}
          />
        ))}
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
