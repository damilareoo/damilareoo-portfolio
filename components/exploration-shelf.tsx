"use client";

import { useCallback, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/motion";
import type { LabShots } from "./lab-set";

const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Exploration: record shelf.
 * The eleven covers in the owner's ranked order, full-bleed and
 * swipeable — flip through like a shelf, nothing hidden behind a
 * selection. Snap centers each sleeve; chevrons and arrows move one
 * record at a time. Concepts don't open. Are.na refs: stampstack's
 * draggable coverflow, dankuntz's vertical coverflow, the
 * sleeves-discs-vinyls-tapes channel.
 */
export function ExplorationShelf({ shots }: { shots: LabShots[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const reduced = useReducedMotion();

  const go = useCallback(
    (dir: 1 | -1) => {
      const track = trackRef.current;
      if (!track) return;
      const slide = track.querySelector<HTMLElement>("[data-slide]");
      const w = slide ? slide.getBoundingClientRect().width + 12 : track.clientWidth * 0.8;
      track.scrollBy({ left: dir * w, behavior: reduced ? "auto" : "smooth" });
    },
    [reduced],
  );

  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.querySelector<HTMLElement>("[data-slide]");
    const w = slide ? slide.getBoundingClientRect().width + 12 : track.clientWidth;
    setAt(Math.min(shots.length - 1, Math.max(0, Math.round(track.scrollLeft / w))));
  }, [shots.length]);

  return (
    <div className="flex h-80 flex-col">
      <div
        ref={trackRef}
        onScroll={sync}
        tabIndex={0}
        role="group"
        aria-label={`Record shelf — ${shots.length} covers in ranked order`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); go(1); }
          else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); go(-1); }
          else if (e.key === "Home") { e.preventDefault(); trackRef.current?.scrollTo({ left: 0 }); }
          else if (e.key === "End") { e.preventDefault(); trackRef.current?.scrollTo({ left: trackRef.current.scrollWidth }); }
        }}
        className="flex min-h-0 flex-1 snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {shots.map((s, i) => (
          <figure key={s.src} data-slide className="w-[52%] flex-none snap-center">
            <div className="overflow-hidden rounded-lg ring-1 ring-black/15 dark:ring-white/15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.src}
                alt=""
                aria-hidden
                loading={i < 2 ? undefined : "lazy"}
                draggable={false}
                className="pointer-events-none block aspect-square w-full object-cover"
              />
            </div>
            <figcaption className="mt-2 truncate font-mono text-[11px] text-[#55534f]">
              <span className="tabular-nums text-[#767676] dark:text-[#8a8a8a]">{pad(i)}</span>
              {" — "}
              {s.alt.replace(" — cover", "")}
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="flex items-center justify-between pt-2">
        <p aria-hidden className="font-mono text-[11px] tabular-nums text-[#767676] dark:text-[#8a8a8a]">
          {pad(at)} / {String(shots.length).padStart(2, "0")}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous record"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full ring-1 ring-[#e0e0e0] transition-colors hover:text-[#171717] dark:ring-[#2e2e2e] dark:hover:text-white"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next record"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full ring-1 ring-[#e0e0e0] transition-colors hover:text-[#171717] dark:ring-[#2e2e2e] dark:hover:text-white"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
