"use client";

import { useEffect, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";
import { useReducedMotion } from "@/lib/motion";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 74 — deal-in.
 * The wall deals itself on arrival: frames land one by one down the
 * grid with a soft snap. After the deal it sits still.
 */
export default function DealinPage() {
  const reduced = useReducedMotion();
  const [dealt, setDealt] = useState(0);
  const [at, setAt] = useState<number | null>(null);

  useEffect(() => {
    if (reduced) {
      setDealt(shots.length);
      return;
    }
    const t = setInterval(() => {
      setDealt((d) => {
        if (d >= shots.length) {
          clearInterval(t);
          return d;
        }
        return d + 1;
      });
    }, 45);
    return () => clearInterval(t);
  }, [reduced]);

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <div className="flex items-baseline justify-between">
          <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 74 — deal-in</p>
          <p aria-hidden className="font-mono text-xs tabular-nums text-[#767676] dark:text-[#8a8a8a]">
            {pad(Math.min(dealt, shots.length) - 1)} / {shots.length}
          </p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {shots.slice(0, dealt).map((s) => {
            const i = shots.indexOf(s);
            return (
              <button
                key={s.src}
                type="button"
                onClick={() => setAt(i)}
                aria-label={`Open frame ${pad(i)}: ${s.alt}`}
                className="block w-full cursor-zoom-in overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] motion-safe:animate-[deal_0.4s_ease] motion-reduce:animate-none dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt="" aria-hidden loading="lazy" draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
              </button>
            );
          })}
        </div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
      <style>{`@keyframes deal { from { opacity: 0; transform: translateY(26px) rotate(1.5deg); } to { opacity: 1; transform: none; } }`}</style>
    </main>
  );
}
