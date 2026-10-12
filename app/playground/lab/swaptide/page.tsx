"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";
import { useReducedMotion } from "@/lib/motion";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 82 — swap tide.
 * Every so often two random tiles trade places with a slow glide.
 * The wall is never quite the wall you left.
 */
export default function SwaptidePage() {
  const reduced = useReducedMotion();
  const [order, setOrder] = useState<number[]>(() => shots.map((_, i) => i));
  const [at, setAt] = useState<number | null>(null);

  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => {
      setOrder((o) => {
        const a = Math.floor(Math.random() * o.length);
        let b = Math.floor(Math.random() * o.length);
        while (b === a) b = Math.floor(Math.random() * o.length);
        const n = [...o];
        [n[a], n[b]] = [n[b], n[a]];
        return n;
      });
    }, 6000);
    return () => clearInterval(t);
  }, [reduced]);

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 82 — swap tide</p>
        <motion.div layout={!reduced} className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {order.map((i) => (
            <motion.button
              key={shots[i].src}
              type="button"
              layout={!reduced}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              onClick={() => setAt(i)}
              aria-label={`Open frame ${pad(i)}: ${shots[i].alt}`}
              className="block w-full cursor-zoom-in overflow-hidden rounded-xl bg-white text-left ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shots[i].src} alt="" aria-hidden loading="lazy" draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
            </motion.button>
          ))}
        </motion.div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
