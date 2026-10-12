"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * One piling card: sticks while the next slides over, easing down to
 * 92% and dimming slightly as it gets covered. The stack is the page.
 */
function StackCard({
  src,
  alt,
  i,
  onOpen,
}: {
  src: string;
  alt: string;
  i: number;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const dim = useTransform(scrollYProgress, [0, 1], [1, 0.55]);

  return (
    <div ref={ref} className="sticky" style={{ top: 88 + Math.min(i % 8, 5) * 10 }}>
      <motion.button
        type="button"
        onClick={onOpen}
        aria-label={`Open frame ${pad(i)}: ${alt}`}
        style={reduced ? undefined : { scale }}
        className="block w-full cursor-zoom-in overflow-hidden rounded-2xl bg-white text-left ring-1 ring-[#e0e0e0] drop-shadow-[0_24px_48px_rgba(0,0,0,0.22)] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src={src}
          alt={alt}
          loading={i < 3 ? undefined : "lazy"}
          draggable={false}
          style={reduced ? undefined : { opacity: dim }}
          className="block aspect-video w-full object-cover"
        />
      </motion.button>
    </div>
  );
}

/**
 * Lab 06 — sticky stack.
 * Sixty-four frames pile up as you scroll; each settles under the next.
 * Pure scroll, nothing to learn, nothing to read.
 */
export default function StackPage() {
  const [at, setAt] = useState<number | null>(null);

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[960px] px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 06 — sticky stack</p>
        <div className="mt-6 space-y-5">
          {shots.map((s, i) => (
            <StackCard key={s.src} src={s.src} alt={s.alt} i={i} onOpen={() => setAt(i)} />
          ))}
        </div>
        <p className="mt-10 text-center font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">{shots.length} frames</p>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
