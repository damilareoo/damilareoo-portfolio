"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 08 — scrub rail.
 * A timeline: drag to scrub all 64 like footage, momentum keeps it
 * rolling, snap settles on a frame. Hairline progress, no words.
 */
export default function ScrubPage() {
  const [at, setAt] = useState(0);
  const [open, setOpen] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; sl: number } | null>(null);

  const go = useCallback((i: number) => {
    setAt(((i % shots.length) + shots.length) % shots.length);
  }, []);

  /* active frame follows scroll position */
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = rail.scrollWidth - rail.clientWidth;
        const t = max > 0 ? rail.scrollLeft / max : 0;
        go(Math.round(t * (shots.length - 1)));
      });
    };
    rail.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      rail.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [go]);

  /* drag-to-scrub */
  const down = (e: React.PointerEvent) => {
    const rail = railRef.current;
    if (!rail) return;
    drag.current = { x: e.clientX, sl: rail.scrollLeft };
  };
  const move = (e: React.PointerEvent) => {
    const rail = railRef.current;
    if (!rail || !drag.current) return;
    rail.scrollLeft = drag.current.sl - (e.clientX - drag.current.x) * 1.5;
  };
  const up = () => {
    drag.current = null;
  };

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <p className="px-5 pt-6 font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 08 — scrub rail</p>
      <div className="flex min-h-0 flex-1 items-center">
        <div
          ref={railRef}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          className="flex w-full cursor-ew-resize snap-x snap-mandatory items-center gap-4 overflow-x-auto px-[12vw] py-4"
        >
          {shots.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => {
                go(i);
                setOpen(true);
              }}
              aria-label={`Open frame ${pad(i)}: ${s.alt}`}
              className={`w-[72vw] max-w-[880px] flex-none snap-center overflow-hidden rounded-xl bg-white ring-1 transition-all duration-300 dark:bg-[#1e1e1e] ${
                i === at ? "ring-2 ring-[#171717] dark:ring-white" : "ring-[#e0e0e0] opacity-60 dark:ring-[#2b2b2b]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt={i === at ? s.alt : ""} aria-hidden={i !== at} loading={i < 3 ? undefined : "lazy"} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 pb-6">
        <div className="mx-auto flex max-w-[560px] items-center gap-4">
          <div className="h-px flex-1 bg-[#e5e5e5] dark:bg-white/10" aria-hidden>
            <div className="h-px bg-[#171717] dark:bg-white" style={{ width: `${((at + 1) / shots.length) * 100}%` }} />
          </div>
          <span className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">
            {pad(at)} / {shots.length}
          </span>
        </div>
      </div>
      {open && <LabViewer shots={shots} at={at} onAt={go} onClose={() => setOpen(false)} />}
    </main>
  );
}
