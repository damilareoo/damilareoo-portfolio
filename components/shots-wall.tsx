"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { WarpShot } from "./warp-shot";
import { useReducedMotion } from "@/lib/motion";

type Shot = { src: string; alt: string };

function shuffled(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * The wall, one view: the masonry run where shuffle is the verb — one
 * tap and every tile glides to its new home in a staggered wave.
 * No captions, no chips, no counts, no modes: a shuffle control plus
 * the title, then the work.
 */
export function ShotsWall({ shots }: { shots: Shot[] }) {
  const [order, setOrder] = useState<number[]>(() => shots.map((_, i) => i));
  const [focus, setFocus] = useState<number | null>(null);
  const reduced = useReducedMotion();

  const displayed = useMemo(() => order.map((p) => shots[p]), [shots, order]);

  const shuffle = useCallback(() => {
    setOrder(shuffled(shots.length));
  }, [shots.length]);

  const step = useCallback(
    (dir: 1 | -1) => {
      setFocus((f) =>
        f === null || displayed.length === 0
          ? f
          : (f + dir + displayed.length) % displayed.length,
      );
    },
    [displayed.length],
  );

  /* Keys: the viewer takes arrows + Esc when open. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (focus === null) return;
      if (e.key === "Escape") setFocus(null);
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); step(1); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); step(-1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus, step]);

  /* Lock the page behind the viewer. */
  useEffect(() => {
    if (focus === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = prev;
    return () => {
      document.body.style.overflow = prev;
    };
  }, [focus]);

  const current = focus !== null ? displayed[focus] : null;

  return (
    <div className="pt-8">
      <p className="text-xs tracking-wide text-[#767676] dark:text-[#8a8a8a]">Shots</p>

      <motion.div layout={!reduced} className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {order.map((shotIdx, pos) => {
          const s = shots[shotIdx];
          return (
            <motion.button
              key={s.src}
              type="button"
              layout={!reduced}
              transition={{ type: "tween", duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: reduced ? 0 : Math.min(pos * 0.01, 0.35) }}
              onClick={() => setFocus(pos)}
              aria-label={`Open ${s.alt}`}
              data-tone="tap"
              className="block w-full cursor-zoom-in overflow-hidden rounded-xl bg-white text-left ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
            >
              <span className="pointer-events-none block aspect-video w-full">
                <WarpShot src={s.src} alt={s.alt} eager={pos < 3} index={pos} />
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* one sticky pill, one icon: shuffle — pinned to the bottom */}
      <div className="sticky bottom-6 z-30 mt-8 flex justify-center">
        <div className="bg-white/85 p-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-[#e5e5e5] backdrop-blur-md rounded-full dark:bg-[#1e1e1e]/85 dark:ring-white/10">
          <button
            type="button"
            onClick={shuffle}
            aria-label="Shuffle the wall"
            data-tone="shuffle"
            className="cursor-pointer rounded-full p-2.5 text-[#767676] transition-colors hover:text-[#171717] dark:text-[#8a8a8a] dark:hover:text-white"
          >
            <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1.5 5h3l7 6h3" />
              <path d="M1.5 11h3l1.8-1.5M10.7 6.5 12.5 5h2" />
              <path d="M12.5 2.5v2.5h-2.5M12.5 13.5V11H10" />
            </svg>
          </button>
        </div>
      </div>

      {/* the viewer — captionless: blurred stage, counter, arrows, Esc */}
      {current !== null && focus !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${current.alt} — ${focus + 1} of ${displayed.length}`}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-[#fafafa]/90 backdrop-blur-md dark:bg-black/80"
            onClick={() => setFocus(null)}
          />
          <figure className="relative z-10 mx-4 flex max-h-[86vh] flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current.src}
              src={current.src}
              alt={current.alt}
              draggable={false}
              className="shot-in max-h-[74vh] w-auto max-w-[92vw] rounded-xl object-contain ring-1 ring-[#e0e0e0] drop-shadow-[0_24px_48px_rgba(0,0,0,0.24)] dark:ring-[#2b2b2b]"
            />
            <figcaption className="mt-4 flex items-center gap-3">
              <span className="flex items-center gap-1 rounded-full bg-white/85 p-1 ring-1 ring-[#e5e5e5] backdrop-blur-md dark:bg-[#1e1e1e]/85 dark:ring-white/10">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous shot"
                  data-tone="tap"
                  className="cursor-pointer rounded-full p-2 text-[#424242] transition-colors hover:text-[#171717] dark:text-[#b8b8b8] dark:hover:text-white"
                >
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 3 5 8l5 5" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next shot"
                  data-tone="tap"
                  className="cursor-pointer rounded-full p-2 text-[#424242] transition-colors hover:text-[#171717] dark:text-[#b8b8b8] dark:hover:text-white"
                >
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 3 5 5-5 5" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setFocus(null)}
                  aria-label="Close viewer"
                  data-tone="tap"
                  className="cursor-pointer rounded-full p-2 text-[#424242] transition-colors hover:text-[#171717] dark:text-[#b8b8b8] dark:hover:text-white"
                >
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M3 3l10 10M13 3 3 13" />
                  </svg>
                </button>
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}
