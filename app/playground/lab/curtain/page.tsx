"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 95 — curtain reveal.
 * Each frame drops in behind parting blinds as it scrolls into view:
 * five slats scale away in sequence. Theatre curtains, per tile.
 */
export default function CurtainPage() {
  const reduced = useReducedMotion();
  const [at, setAt] = useState<number | null>(null);

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] space-y-8 px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 95 — curtain reveal</p>
        {shots.map((s, i) => (
          <motion.button
            key={s.src}
            type="button"
            onClick={() => setAt(i)}
            aria-label={`Open frame ${pad(i)}: ${s.alt}`}
            initial={false}
            whileInView="open"
            viewport={{ once: true, margin: "-12% 0px" }}
            className="relative block w-full cursor-zoom-in overflow-hidden rounded-xl bg-white text-left ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt="" aria-hidden loading={i < 2 ? undefined : "lazy"} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
            {!reduced && (
              <span aria-hidden className="pointer-events-none absolute inset-0 flex">
                {[0, 1, 2, 3, 4].map((k) => (
                  <motion.span
                    key={k}
                    variants={{ open: { scaleY: 0 } }}
                    transition={{ duration: 0.55, delay: k * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full flex-1 origin-top bg-[#fafafa] dark:bg-[#131313]"
                  />
                ))}
              </span>
            )}
          </motion.button>
        ))}
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
