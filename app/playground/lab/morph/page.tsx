"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";
import { useReducedMotion } from "@/lib/motion";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 02 — index ⇄ grid morph (Codrops menu-to-grid).
 * One set of elements, one toggle; motion layout springs glide each
 * tile between row and tile. The transition is the interaction.
 */
export default function MorphPage() {
  const [view, setView] = useState<"index" | "grid">("grid");
  const [at, setAt] = useState<number | null>(null);
  const reduced = useReducedMotion();

  return (
    <main className="mx-auto w-full max-w-[1120px] px-5 py-8">
      <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 02 — index ⇄ grid morph</p>

      <div className="mt-6 flex justify-center">
        <div className="flex items-center gap-1 rounded-full bg-white/85 p-1 ring-1 ring-[#e5e5e5] backdrop-blur-md dark:bg-[#1e1e1e]/85 dark:ring-white/10">
          {(["index", "grid"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={`cursor-pointer rounded-full px-4 py-2 font-mono text-xs transition-colors ${
                view === v ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717]" : "text-[#767676] hover:text-[#171717] dark:text-[#8a8a8a] dark:hover:text-white"
              }`}
            >
              {v === "index" ? "01–64" : "▦"}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        className={view === "index" ? "mx-auto mt-8 flex max-w-[420px] flex-col" : "mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4"}
        layout={!reduced}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
      >
        {shots.map((s, i) => (
          <motion.button
            key={s.src}
            type="button"
            layout={!reduced}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            onClick={() => setAt(i)}
            aria-label={`Open frame ${pad(i)}: ${s.alt}`}
            className={
              view === "index"
                ? "flex cursor-pointer items-center gap-4 border-b border-[#e5e5e5] py-2 text-left dark:border-white/10"
                : "block w-full cursor-zoom-in overflow-hidden rounded-xl bg-white text-left ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
            }
          >
            {view === "index" ? (
              <>
                <span className="font-mono text-sm text-[#767676] dark:text-[#8a8a8a]">{pad(i)}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt="" aria-hidden loading="lazy" draggable={false} className="h-10 w-16 rounded object-cover" />
              </>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={s.src} alt={s.alt} loading={i < 6 ? undefined : "lazy"} draggable={false} className="block aspect-video w-full object-cover" />
            )}
          </motion.button>
        ))}
      </motion.div>

      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
