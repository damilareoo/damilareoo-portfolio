"use client";

import { useCallback, useState } from "react";
import type { LabShots } from "./lab-set";

const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Exploration: crate dig.
 * Eleven sleeves in the owner's order; picking one lifts it while its
 * disc — the cover clipped round with a spindle hole, about-page grammar —
 * slides out and spins on the platter. The turntable is the whole
 * interaction: nothing opens, no white box, reduced motion parks the disc.
 */
export function ExplorationCrate({ shots }: { shots: LabShots[] }) {
  const [at, setAt] = useState(0);
  const active = shots[at];

  const step = useCallback(
    (dir: 1 | -1) => setAt((a) => (a + dir + shots.length) % shots.length),
    [shots.length],
  );

  return (
    <div
      className="flex h-80 flex-col"
      role="group"
      aria-label="Crate dig — pick a sleeve to play it"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); step(1); }
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); step(-1); }
        else if (e.key === "Home") { e.preventDefault(); setAt(0); }
        else if (e.key === "End") { e.preventDefault(); setAt(shots.length - 1); }
      }}
    >
      <div className="flex min-h-0 flex-1 items-center gap-4">
        <div className="w-[42%] flex-none">
          <div className="overflow-hidden rounded-md ring-1 ring-black/15 dark:ring-white/15">
            {active && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={active.src} src={active.src} alt="" aria-hidden draggable={false} className="block aspect-square w-full object-cover" />
            )}
          </div>
          <p className="mt-2 truncate text-center font-mono text-[11px] text-[#55534f]">
            {active?.alt.replace(" — cover", "") ?? ""}
          </p>
          <p aria-hidden className="text-center font-mono text-[11px] tabular-nums text-[#767676] dark:text-[#8a8a8a]">
            {pad(at)} / {String(shots.length).padStart(2, "0")}
          </p>
        </div>
        <div className="relative mx-auto aspect-square h-full max-h-[220px]">
          <span aria-hidden className="absolute inset-0 rounded-full bg-[#171717] ring-1 ring-black/20 dark:bg-[#1e1e1e] dark:ring-white/10" />
          {active && (
            <span
              key={active.src}
              aria-hidden
              className="absolute inset-5 motion-safe:animate-[vinyl-spin_6s_linear_infinite] motion-reduce:animate-none"
            >
              <span
                className="block h-full w-full rounded-full bg-cover bg-center ring-1 ring-black/30"
                style={{ backgroundImage: `url(${active.src})` }}
              />
              <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fafafa] ring-1 ring-black/20" />
            </span>
          )}
        </div>
      </div>
      <div className="flex snap-x gap-2 overflow-x-auto pt-3" role="listbox" aria-label="Sleeves in the crate">
        {shots.map((s, i) => (
          <button
            key={s.src}
            type="button"
            role="option"
            aria-selected={i === at}
            onClick={() => setAt(i)}
            aria-label={`Play ${s.alt.replace(" — cover", "")}`}
            className={`h-14 w-14 flex-none cursor-pointer snap-start overflow-hidden rounded ring-1 transition-all motion-reduce:transition-none ${
              i === at ? "ring-2 ring-[#171717] dark:ring-white" : "opacity-60 ring-black/15 hover:opacity-100 dark:ring-white/15"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt="" aria-hidden loading="lazy" draggable={false} className="pointer-events-none block h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
