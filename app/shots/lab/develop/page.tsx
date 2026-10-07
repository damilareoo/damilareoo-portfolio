"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 14 — develop-in.
 * Every frame arrives as a coarse block field and resolves into full
 * image as it scrolls into view. Same family as the steps tile.
 */
export default function DevelopPage() {
  const reduced = useReducedMotion();
  const [at, setAt] = useState<number | null>(null);

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 14 — develop-in</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {shots.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setAt(i)}
              aria-label={`Open frame ${pad(i)}: ${s.alt}`}
              className="block w-full cursor-zoom-in overflow-hidden rounded-xl bg-white text-left ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <motion.img
                src={s.src}
                alt=""
                aria-hidden
                loading={i < 6 ? undefined : "lazy"}
                draggable={false}
                initial={reduced ? false : { scale: 0.12, filter: "blur(6px)" }}
                whileInView={reduced ? undefined : { scale: 1, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                style={{ imageRendering: "pixelated" }}
                className="block aspect-video w-full overflow-hidden object-cover"
              />
            </button>
          ))}
        </div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
