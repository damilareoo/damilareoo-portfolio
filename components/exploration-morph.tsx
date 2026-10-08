"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/motion";
import type { LabShots } from "./lab-set";

const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Exploration: index ⇄ grid morph (Codrops menu-to-grid).
 * One toggle glides everything between rows and tiles. Concepts
 * don't open — the morph is the whole interaction.
 */
export function ExplorationMorph({ shots }: { shots: LabShots[] }) {
  const [view, setView] = useState<"index" | "grid">("grid");
  const [at, setAt] = useState(0);
  const reduced = useReducedMotion();

  return (
    <div className="flex h-80 flex-col">
      <div className="flex justify-center pb-2">
        <div className="flex items-center gap-1 rounded-full bg-white/85 p-1 ring-1 ring-[#e5e5e5] dark:bg-[#1e1e1e]/85 dark:ring-white/10">
          {(["index", "grid"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={`cursor-pointer rounded-full px-3 py-1 font-mono text-[11px] transition-colors ${
                view === v ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717]" : "text-[#767676] hover:text-[#171717] dark:text-[#8a8a8a] dark:hover:text-white"
              }`}
            >
              {v === "index" ? "01–08" : "▦"}
            </button>
          ))}
        </div>
      </div>
      <motion.div
        layout={!reduced}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className={view === "index" ? "mx-auto w-full max-w-[260px] flex-1 overflow-y-auto" : "grid flex-1 grid-cols-4 content-start gap-2 overflow-y-auto"}
      >
        {shots.map((s, i) => (
          <motion.button
            key={s.src}
            type="button"
            layout={!reduced}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            onClick={() => setAt(i)}
            aria-label={`Preview frame ${pad(i)}`}
            aria-current={i === at}
            className={
              view === "index"
                ? "flex w-full cursor-pointer items-center gap-3 border-b border-[#e5e5e5] py-1.5 text-left dark:border-white/10"
                : "block w-full cursor-pointer overflow-hidden rounded-lg bg-white text-left ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
            }
          >
            {view === "index" ? (
              <>
                <span className="font-mono text-[11px] text-[#767676] dark:text-[#8a8a8a]">{pad(i)}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt="" aria-hidden loading="lazy" draggable={false} className="h-8 w-12 rounded object-cover" />
              </>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={s.src} alt="" aria-hidden loading="lazy" draggable={false} className="block aspect-square w-full object-cover" />
            )}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
