"use client";

import { useEffect, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 84 — count-up.
 * A counter runs 01→64 and the wall scrolls itself to match, one
 * frame landing per tick. The set counts itself off.
 */
export default function CountupPage() {
  const [n, setN] = useState(0);
  const [at, setAt] = useState<number | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setN((v) => {
        const next = v >= shots.length ? 0 : v + 1;
        document.querySelector(`[data-c="${Math.min(next, shots.length - 1)}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        return next;
      });
    }, 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <div className="sticky top-0 z-10 -mx-5 flex items-baseline justify-between bg-[#fafafa]/90 px-5 py-3 backdrop-blur-md dark:bg-[#131313]/90">
          <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 84 — count-up</p>
          <p aria-hidden className="font-mono text-3xl tabular-nums">{pad(Math.min(n, shots.length - 1))}</p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {shots.map((s, i) => (
            <button
              key={s.src}
              type="button"
              data-c={i}
              onClick={() => setAt(i)}
              aria-label={`Open frame ${pad(i)}: ${s.alt}`}
              className={`block w-full scroll-mt-28 overflow-hidden rounded-xl ring-1 transition-all duration-500 motion-reduce:transition-none ${
                i === Math.min(n, shots.length - 1)
                  ? "cursor-zoom-in bg-white ring-2 ring-[#171717] dark:bg-[#1e1e1e] dark:ring-white"
                  : "bg-white opacity-70 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt="" aria-hidden loading="lazy" draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
