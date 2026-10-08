"use client";

import { useState } from "react";
import type { LabShots } from "./lab-set";

const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Exploration: numeric index + preview (TWOMUCH, de-labeled).
 * Rows are pure numbers; the frame follows. Concepts don't open —
 * hover and tap only move the preview.
 */
export function ExplorationIndex({ shots }: { shots: LabShots[] }) {
  const [at, setAt] = useState(0);

  return (
    <div className="flex h-80 gap-3">
      <ol className="w-16 flex-none overflow-y-auto">
        {shots.map((_, i) => (
          <li key={i}>
            <button
              type="button"
              onMouseEnter={() => setAt(i)}
              onFocus={() => setAt(i)}
              onClick={() => setAt(i)}
              aria-label={`Preview frame ${pad(i)}`}
              aria-current={i === at}
              className={`block w-full cursor-pointer px-2 py-1 text-left font-mono text-xs transition-colors ${
                i === at ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717]" : "text-[#767676] hover:text-[#171717] dark:text-[#8a8a8a] dark:hover:text-white"
              }`}
            >
              {pad(i)}
            </button>
          </li>
        ))}
      </ol>
      <div
        aria-live="polite"
        aria-label={`Previewing frame ${pad(at)}`}
        className="block min-w-0 flex-1 overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
      >
        {shots[at] && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img key={shots[at].src} src={shots[at].src} alt="" aria-hidden draggable={false} className="block h-full w-full object-contain" />
        )}
      </div>
    </div>
  );
}
