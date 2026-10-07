"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 62 — flick toss.
 * Grab the fullscreen frame and throw it: release velocity decides
 * how many frames fly past. Touch-native physics for all 64.
 */
export default function FlicktossPage() {
  const [at, setAt] = useState(0);
  const vel = useRef(0);
  const acc = useRef(0);

  const go = useCallback((i: number) => {
    setAt(((i % shots.length) + shots.length) % shots.length);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const tick = () => {
      if (Math.abs(vel.current) > 0.4) {
        acc.current += vel.current * 0.02;
        vel.current *= 0.955;
        if (Math.abs(acc.current) >= 1) {
          const step = Math.trunc(acc.current);
          acc.current -= step;
          go(at + step);
        }
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
        vel.current = 0;
        acc.current = 0;
      }
    };
    const kick = () => {
      if (Math.abs(vel.current) > 0.4 && !raf) raf = requestAnimationFrame(tick);
    };
    const id = setInterval(kick, 50);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [at, go]);

  const drag = useRef<{ x: number; t: number; vx: number } | null>(null);

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-black text-white">
      <p className="px-5 pt-6 font-mono text-xs text-white/50">lab 62 — flick toss</p>
      <div
        className="flex min-h-0 flex-1 cursor-grab touch-none items-center justify-center px-5 active:cursor-grabbing"
        onPointerDown={(e) => {
          vel.current = 0;
          drag.current = { x: e.clientX, t: performance.now(), vx: 0 };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const now = performance.now();
          const dt = Math.max(now - d.t, 8);
          d.vx = ((d.x - e.clientX) / dt) * 16;
          d.x = e.clientX;
          d.t = now;
        }}
        onPointerUp={() => {
          if (drag.current) vel.current = Math.max(-60, Math.min(60, -drag.current.vx * 2));
          drag.current = null;
        }}
        onPointerCancel={() => (drag.current = null)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={shots[at].src} src={shots[at].src} alt={shots[at].alt} draggable={false} className="pointer-events-none max-h-full w-auto max-w-full rounded-xl object-contain ring-1 ring-white/10" />
      </div>
      <div className="mx-auto flex w-full max-w-[560px] items-center gap-4 px-5 pb-6">
        <button type="button" onClick={() => go(at - 1)} aria-label="Previous frame" className="cursor-pointer rounded-full p-2 ring-1 ring-white/15">←</button>
        <div className="h-px flex-1 bg-white/15" aria-hidden>
          <div className="h-px bg-white" style={{ width: `${((at + 1) / shots.length) * 100}%` }} />
        </div>
        <button type="button" onClick={() => go(at + 1)} aria-label="Next frame" className="cursor-pointer rounded-full p-2 ring-1 ring-white/15">→</button>
        <span className="font-mono text-xs text-white/50">
          {pad(at)} / {shots.length}
        </span>
      </div>
    </main>
  );
}
