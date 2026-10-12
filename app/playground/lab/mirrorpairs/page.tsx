"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 69 — mirror pairs.
 * Frames march in twos, odd rows running right-to-left like
 * boustrophedon script. The eye snakes down 64 without a break.
 */
export default function MirrorpairsPage() {
  const [at, setAt] = useState<number | null>(null);

  const pairs: number[][] = [];
  for (let i = 0; i < shots.length; i += 2) {
    pairs.push([i, i + 1].filter((x) => x < shots.length));
  }

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] space-y-4 px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 69 — mirror pairs</p>
        {pairs.map((pair, p) => (
          <div key={p} className={`grid grid-cols-2 gap-3 sm:gap-4 ${p % 2 === 1 ? "direction-rtl" : ""}`} style={p % 2 === 1 ? { direction: "rtl" } : undefined}>
            {pair.map((i) => (
              <button
                key={shots[i].src}
                type="button"
                onClick={() => setAt(i)}
                aria-label={`Open frame ${pad(i)}: ${shots[i].alt}`}
                className="block w-full cursor-zoom-in overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
                style={{ direction: "ltr" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shots[i].src}
                  alt=""
                  aria-hidden
                  loading={i < 4 ? undefined : "lazy"}
                  draggable={false}
                  className="pointer-events-none block aspect-video w-full object-cover"
                />
              </button>
            ))}
          </div>
        ))}
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
