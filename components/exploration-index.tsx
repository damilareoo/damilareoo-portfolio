"use client";

import { useState } from "react";
import { LabViewer } from "./lab-viewer";
import type { LabShots } from "./lab-set";

const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Exploration: numeric index + preview (TWOMUCH, de-labeled).
 * Rows are pure numbers; the frame follows. Tap for fullscreen.
 */
export function ExplorationIndex({ shots }: { shots: LabShots[] }) {
  const [at, setAt] = useState(0);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-80 gap-3">
      <ol className="w-16 flex-none overflow-y-auto">
        {shots.map((_, i) => (
          <li key={i}>
            <button
              type="button"
              onMouseEnter={() => setAt(i)}
              onFocus={() => setAt(i)}
              onClick={() => {
                setAt(i);
                setOpen(true);
              }}
              aria-label={`Open frame ${pad(i)}`}
              className={`block w-full cursor-pointer px-2 py-1 text-left font-mono text-xs transition-colors ${
                i === at ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717]" : "text-[#767676] hover:text-[#171717] dark:text-[#8a8a8a] dark:hover:text-white"
              }`}
            >
              {pad(i)}
            </button>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open current frame fullscreen"
        className="block min-w-0 flex-1 cursor-zoom-in overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
      >
        {shots[at] && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img key={shots[at].src} src={shots[at].src} alt="" aria-hidden draggable={false} className="block h-full w-full object-contain" />
        )}
      </button>
      {open && shots[at] && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setOpen(false)} />}
    </div>
  );
}
