"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { dossier } from "@/data/dossier";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 37 — scrub bar.
 * One fullscreen frame and a single hairline: drag the line to travel
 * all 64. The bar is the whole interface.
 */
export default function ScrubbarPage() {
  const [at, setAt] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const scrub = useRef(false);

  const go = useCallback((i: number) => {
    setAt(((i % shots.length) + shots.length) % shots.length);
  }, []);

  const fromEvent = (clientX: number) => {
    const bar = barRef.current;
    if (!bar) return;
    const r = bar.getBoundingClientRect();
    const t = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
    go(Math.round(t * (shots.length - 1)));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        go(at + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        go(at - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [at, go]);

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-black text-white">
      <p className="px-5 pt-6 font-mono text-xs text-white/50">lab 37 — scrub bar</p>
      <div className="flex min-h-0 flex-1 items-center justify-center px-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={shots[at].src} src={shots[at].src} alt={shots[at].alt} draggable={false} className="max-h-full w-auto max-w-full rounded-xl object-contain ring-1 ring-white/10" />
      </div>
      <div className="px-5 pb-8">
        <div className="mx-auto max-w-[720px]">
          <div
            ref={barRef}
            role="slider"
            tabIndex={0}
            aria-label={`Frame ${pad(at)} of ${shots.length}`}
            aria-valuemin={1}
            aria-valuemax={shots.length}
            aria-valuenow={at + 1}
            onPointerDown={(e) => {
              scrub.current = true;
              (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              fromEvent(e.clientX);
            }}
            onPointerMove={(e) => scrub.current && fromEvent(e.clientX)}
            onPointerUp={() => (scrub.current = false)}
            onPointerCancel={() => (scrub.current = false)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") go(at + 1);
              else if (e.key === "ArrowLeft") go(at - 1);
            }}
            className="cursor-ew-resize py-4 touch-none"
          >
            <div className="relative h-[3px] rounded-full bg-white/15">
              <div className="absolute inset-y-0 left-0 rounded-full bg-white" style={{ width: `${((at + 1) / shots.length) * 100}%` }} />
              <div
                className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow"
                style={{ left: `${(at / (shots.length - 1)) * 100}%` }}
              />
            </div>
          </div>
          <p className="mt-1 text-center font-mono text-xs text-white/50">
            {pad(at)} / {shots.length}
          </p>
        </div>
      </div>
    </main>
  );
}
