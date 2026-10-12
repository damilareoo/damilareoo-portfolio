"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;

/** Editorial rhythm, cycling: hero — duo — trio — offset. */
const PATTERN = ["hero", "duo", "trio", "offset"] as const;

function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 36, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Frame({
  src,
  alt,
  onOpen,
}: {
  src: string;
  alt: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open frame: ${alt}`}
      className="block w-full cursor-zoom-in overflow-hidden rounded-xl bg-white text-left ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" draggable={false} className="block aspect-video w-full object-cover" />
    </button>
  );
}

/**
 * Lab 07 — editorial rhythm.
 * A lookbook cadence: full-bleed hero, uneven duo, trio, indented
 * offset, repeat. Scroll is the only interaction; space does the rest.
 */
export default function EditorialPage() {
  const [at, setAt] = useState<number | null>(null);

  const rows: { kind: (typeof PATTERN)[number]; idx: number[] }[] = [];
  {
    let i = 0;
    let k = 0;
    while (i < shots.length) {
      const kind = PATTERN[k % PATTERN.length];
      const take = kind === "hero" || kind === "offset" ? 1 : kind === "duo" ? 2 : 3;
      const idx: number[] = [];
      for (let t = 0; t < take && i < shots.length; t++, i++) idx.push(i);
      if (idx.length) rows.push({ kind, idx });
      k++;
    }
  }

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] space-y-16 px-5 pb-24 pt-8 sm:space-y-24">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 07 — editorial rhythm</p>
        {rows.map((row, r) => (
          <Reveal key={r}>
            {row.kind === "hero" && <Frame src={shots[row.idx[0]].src} alt={shots[row.idx[0]].alt} onOpen={() => setAt(row.idx[0])} />}
            {row.kind === "duo" && (
              <div className="grid grid-cols-12 items-end gap-3 sm:gap-4">
                <div className="col-span-7">
                  <Frame src={shots[row.idx[0]].src} alt={shots[row.idx[0]].alt} onOpen={() => setAt(row.idx[0])} />
                </div>
                {row.idx[1] !== undefined && (
                  <div className="col-span-5">
                    <Frame src={shots[row.idx[1]].src} alt={shots[row.idx[1]].alt} onOpen={() => setAt(row.idx[1])} />
                  </div>
                )}
              </div>
            )}
            {row.kind === "trio" && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {row.idx.map((i) => (
                  <Frame key={shots[i].src} src={shots[i].src} alt={shots[i].alt} onOpen={() => setAt(i)} />
                ))}
              </div>
            )}
            {row.kind === "offset" && (
              <div className="sm:ml-[16%]">
                <Frame src={shots[row.idx[0]].src} alt={shots[row.idx[0]].alt} onOpen={() => setAt(row.idx[0])} />
              </div>
            )}
          </Reveal>
        ))}
        <p className="text-center font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">{shots.length} frames</p>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
