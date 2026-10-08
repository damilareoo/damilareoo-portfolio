"use client";

import { useCallback, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/motion";
import type { LabShots } from "./lab-set";

const pad = (i: number) => String(i + 1).padStart(2, "0");
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * Exploration: coverflow.
 * The eleven covers in the owner's ranked order, center focus big,
 * neighbors tilted away in perspective. Tap a side cover, swipe, or
 * use the arrows — one step at a time, always. Concepts don't open.
 */
export function ExplorationCoverflow({ shots }: { shots: LabShots[] }) {
  const [at, setAt] = useState(0);
  const reduced = useReducedMotion();
  const dragX = useRef<number | null>(null);

  const step = useCallback(
    (d: 1 | -1) => setAt((a) => (a + d + shots.length) % shots.length),
    [shots.length],
  );

  const label = shots[at]?.alt.replace(" — cover", "") ?? "";

  return (
    <div className="flex h-80 flex-col">
      <div
        role="group"
        aria-label={`Album coverflow — ${shots.length} covers. Currently ${label}.`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); step(1); }
          else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); step(-1); }
          else if (e.key === "Home") { e.preventDefault(); setAt(0); }
          else if (e.key === "End") { e.preventDefault(); setAt(shots.length - 1); }
        }}
        onPointerDown={(e) => {
          dragX.current = e.clientX;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        }}
        onPointerUp={(e) => {
          if (dragX.current === null) return;
          const dx = e.clientX - dragX.current;
          dragX.current = null;
          if (dx <= -40) step(1);
          else if (dx >= 40) step(-1);
        }}
        onPointerCancel={() => (dragX.current = null)}
        className="relative min-h-0 flex-1 cursor-grab touch-pan-y overflow-hidden rounded-xl bg-[#0d0d0d] select-none active:cursor-grabbing"
        style={{ perspective: "900px" }}
      >
        {shots.map((s, i) => {
          const off = i - at;
          const near = Math.abs(off) <= 3;
          const x = clamp(off, -3, 3) * 34;
          const tilt = reduced ? 0 : clamp(off, -1, 1) * -52;
          return (
            <button
              key={s.src}
              type="button"
              tabIndex={-1}
              onClick={() => setAt(i)}
              aria-label={i === at ? `${s.alt.replace(" — cover", "")} — current` : `Focus ${s.alt.replace(" — cover", "")}`}
              aria-current={i === at}
              className="absolute left-1/2 top-[6%] w-[42%]"
              style={{
                transform: `translateX(-50%) translateX(${x}%) rotateY(${tilt}deg) scale(${1 - Math.min(Math.abs(off), 3) * 0.13})`,
                zIndex: 100 - Math.abs(off),
                opacity: near ? 1 - Math.min(Math.abs(off), 3) * 0.28 : 0,
                pointerEvents: near ? "auto" : "none",
                transition: reduced ? "none" : "transform 480ms cubic-bezier(0.16,1,0.3,1), opacity 480ms ease",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.src}
                alt=""
                aria-hidden
                loading={Math.abs(off) > 2 ? "lazy" : undefined}
                draggable={false}
                className="pointer-events-none block aspect-square w-full rounded-md object-cover ring-1 ring-white/20"
              />
              {i === at && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={s.src}
                  alt=""
                  aria-hidden
                  draggable={false}
                  className="pointer-events-none block aspect-square w-full scale-y-[-1] rounded-md object-cover opacity-25 [mask-image:linear-gradient(to_top,black,transparent_75%)]"
                />
              )}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between pt-2">
        <p aria-live="polite" className="truncate font-mono text-[11px] text-[#55534f]">
          <span className="tabular-nums text-[#767676] dark:text-[#8a8a8a]">{pad(at)}</span>
          {" — "}
          {label}
        </p>
        <div className="flex flex-none gap-2 pl-2">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous cover"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full ring-1 ring-[#e0e0e0] transition-colors hover:text-[#171717] dark:ring-[#2e2e2e] dark:hover:text-white"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next cover"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full ring-1 ring-[#e0e0e0] transition-colors hover:text-[#171717] dark:ring-[#2e2e2e] dark:hover:text-white"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
