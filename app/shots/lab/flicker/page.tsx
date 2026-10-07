"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { dossier } from "@/data/dossier";
import { useReducedMotion } from "@/lib/motion";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 03 — rapid flicker (Codrops rapid layers).
 * Wheel or drag pours velocity into the stack; friction settles it onto
 * a frame. Release lands. Arrows step. Reduced motion steps only.
 */
export default function FlickerPage() {
  const reduced = useReducedMotion();
  const [at, setAt] = useState(0);
  const pos = useRef(0);
  const vel = useRef(0);
  const raf = useRef(0);
  const shown = useRef(-1);

  const land = useCallback(() => {
    const i = ((Math.round(pos.current) % shots.length) + shots.length) % shots.length;
    if (i !== shown.current) {
      shown.current = i;
      setAt(i);
    }
  }, []);

  useEffect(() => {
    if (reduced) {
      pos.current = at;
      shown.current = at;
      return;
    }
    const tick = () => {
      pos.current += vel.current;
      vel.current *= 0.94;
      if (Math.abs(vel.current) < 0.02) vel.current = 0;
      land();
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [reduced, land, at]);

  const step = useCallback(
    (dir: 1 | -1) => {
      pos.current += dir;
      vel.current = 0;
      land();
    },
    [land],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        step(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  /* drag pours velocity too */
  const dragY = useRef<number | null>(null);
  const onDown = (e: React.PointerEvent) => {
    dragY.current = e.clientY;
  };
  const onMove = (e: React.PointerEvent) => {
    if (dragY.current === null || reduced) return;
    vel.current += (dragY.current - e.clientY) * 0.02;
    dragY.current = e.clientY;
  };
  const onUp = () => {
    dragY.current = null;
  };

  const current = shots[at];

  return (
    <main
      className="flex h-dvh flex-col overflow-hidden bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]"
      onWheel={reduced ? undefined : (e) => (vel.current += e.deltaY * 0.01)}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <p className="px-5 pt-6 font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 03 — rapid flicker</p>
      <div className="flex min-h-0 flex-1 items-center justify-center px-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current.src}
          src={current.src}
          alt={current.alt}
          draggable={false}
          className="max-h-full w-auto max-w-full rounded-xl object-contain ring-1 ring-[#e0e0e0] drop-shadow-[0_24px_48px_rgba(0,0,0,0.24)] dark:ring-[#2b2b2b]"
        />
      </div>
      <div className="px-5 pb-6">
        <div className="mx-auto flex max-w-[560px] items-center gap-4">
          <button type="button" onClick={() => step(-1)} aria-label="Previous frame" className="cursor-pointer rounded-full p-2 ring-1 ring-[#e5e5e5] dark:ring-white/10">←</button>
          <div className="h-px flex-1 bg-[#e5e5e5] dark:bg-white/10" aria-hidden>
            <div className="h-px bg-[#171717] transition-[width] dark:bg-white" style={{ width: `${((at + 1) / shots.length) * 100}%` }} />
          </div>
          <button type="button" onClick={() => step(1)} aria-label="Next frame" className="cursor-pointer rounded-full p-2 ring-1 ring-[#e5e5e5] dark:ring-white/10">→</button>
          <span className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">
            {pad(at)} / {shots.length}
          </span>
        </div>
      </div>
    </main>
  );
}
