"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/motion";
import type { LabShots } from "./lab-set";

const pad = (i: number) => String(i + 1).padStart(2, "0");
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const DWELL = 2800;

/**
 * Exploration: coverflow.
 * The eleven covers in the owner's ranked order, center focus big,
 * neighbors tilted away in perspective. Tap a side cover, swipe, or
 * use the arrows — one step at a time, always. Concepts don't open.
 */
export function ExplorationCoverflow({ shots }: { shots: LabShots[] }) {
  const [at, setAt] = useState(0);
  const [held, setHeld] = useState(false);
  const reduced = useReducedMotion();
  const dragX = useRef<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const lastRef = useRef(0);
  const touchRef = useRef(0);
  const heldRef = useRef(false);
  const seenRef = useRef(true);

  /** A genuine interaction: restarts the dwell clock and the resume clock. */
  const touch = useCallback(() => {
    const now = Date.now();
    lastRef.current = now;
    touchRef.current = now;
  }, []);

  const step = useCallback(
    (d: 1 | -1) => {
      touch();
      setAt((a) => (a + d + shots.length) % shots.length);
    },
    [shots.length, touch],
  );

  const focusIdx = useCallback(
    (i: number) => {
      touch();
      setAt(i);
    },
    [touch],
  );

  /* Autoplay: drifts through the chart alone, yields the moment you're
     near — hover, focus, touch, hidden tab, offscreen, reduced motion.
     A merely resting cursor only holds it for a few seconds; genuine
     idleness resumes the drift. */
  useEffect(() => {
    if (reduced) return;
    const stage = stageRef.current;
    if (!stage) return;
    touch();
    const io = new IntersectionObserver(([e]) => (seenRef.current = e.isIntersecting), { threshold: 0.2 });
    io.observe(stage);
    const onVis = () => touch();
    document.addEventListener("visibilitychange", onVis);
    const id = window.setInterval(() => {
      if (document.hidden || !seenRef.current) return;
      if (heldRef.current && Date.now() - touchRef.current < 6000) return;
      if (Date.now() - lastRef.current < DWELL) return;
      lastRef.current = Date.now();
      setAt((a) => (a + 1) % shots.length);
    }, 250);
    return () => {
      window.clearInterval(id);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reduced, shots.length, touch]);

  /* Hover/focus pauses the drift but never resets its clock — only
     genuine interaction does that. */
  const hold = (v: boolean) => {
    heldRef.current = v;
    setHeld(v);
  };

  const label = shots[at]?.alt.replace(" — cover", "") ?? "";

  return (
    <div className="flex h-80 flex-col">
      <div
        ref={stageRef}
        role="group"
        aria-label={`Album coverflow — ${shots.length} covers. Currently ${label}.`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); step(1); }
          else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); step(-1); }
          else if (e.key === "Home") { e.preventDefault(); touch(); setAt(0); }
          else if (e.key === "End") { e.preventDefault(); touch(); setAt(shots.length - 1); }
        }}
        onPointerEnter={() => hold(true)}
        onPointerLeave={() => hold(false)}
        onFocus={() => hold(true)}
        onBlur={() => hold(false)}
        onPointerDown={(e) => {
          dragX.current = e.clientX;
          touch();
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        }}
        onPointerUp={(e) => {
          if (dragX.current === null) return;
          const dx = e.clientX - dragX.current;
          dragX.current = null;
          if (dx <= -40 || dx >= 40) step(dx <= -40 ? 1 : -1);
          else touch();
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
              onClick={() => focusIdx(i)}
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
              {i === at && !reduced && (
                <span
                  aria-hidden
                  className="flow-sheen pointer-events-none absolute inset-0 rounded-md"
                />
              )}
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
        {!reduced && (
          <span aria-hidden className="mx-3 h-px flex-1 overflow-hidden rounded bg-[#e0e0e0] dark:bg-white/10">
            <span key={at + String(held)} className={`block h-full w-full bg-[#767676]/70 dark:bg-white/40 ${held ? "" : "flow-dwell"}`} style={held ? undefined : { animationDuration: `${DWELL}ms` }} />
          </span>
        )}
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
