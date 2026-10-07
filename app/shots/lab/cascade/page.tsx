"use client";

import { useCallback, useState } from "react";
import { motion } from "motion/react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";
import { useReducedMotion } from "@/lib/motion";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

function shuffled(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Lab 27 — shuffle cascade.
 * The wall, but shuffle is the whole point: one tap and every tile
 * glides to its new home in a staggered cascade. Serendipity on tap.
 */
export default function CascadePage() {
  const reduced = useReducedMotion();
  const [order, setOrder] = useState<number[]>(() => shots.map((_, i) => i));
  const [at, setAt] = useState<number | null>(null);

  const toss = useCallback(() => setOrder(shuffled(shots.length)), []);

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 27 — shuffle cascade</p>
          <button
            type="button"
            onClick={toss}
            aria-label="Shuffle the wall"
            className="cursor-pointer rounded-full p-2.5 ring-1 ring-[#e5e5e5] hover:bg-white dark:ring-white/10 dark:hover:bg-[#1e1e1e]"
          >
            <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1.5 5h3l7 6h3" />
              <path d="M1.5 11h3l1.8-1.5M10.7 6.5 12.5 5h2" />
              <path d="M12.5 2.5v2.5h-2.5M12.5 13.5V11H10" />
            </svg>
          </button>
        </div>
        <motion.div layout={!reduced} className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {order.map((i, pos) => (
            <motion.button
              key={shots[i].src}
              type="button"
              layout={!reduced}
              transition={{ type: "spring", stiffness: 210, damping: 28, delay: reduced ? 0 : Math.min(pos * 0.008, 0.4) }}
              onClick={() => setAt(i)}
              aria-label={`Open frame ${pad(i)}: ${shots[i].alt}`}
              className="block w-full cursor-zoom-in overflow-hidden rounded-xl bg-white text-left ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shots[i].src} alt="" aria-hidden loading={i < 6 ? undefined : "lazy"} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
            </motion.button>
          ))}
        </motion.div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
