"use client";

import { useRef, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 59 — ripple.
 * Tap anywhere and a ring rolls out from that exact point, lifting
 * each tile as it passes. The wall answers touch with physics.
 */
export default function RipplePage() {
  const [at, setAt] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const press = useRef<number | null>(null);

  const fire = (clientX: number, clientY: number, i: number) => {
    const grid = gridRef.current;
    if (grid) {
      Array.from(grid.children).forEach((kid) => {
        const r = (kid as HTMLElement).getBoundingClientRect();
        const d = Math.hypot(clientX - (r.left + r.width / 2), clientY - (r.top + r.height / 2));
        const el = kid as HTMLElement;
        el.style.animation = "none";
        void el.offsetWidth;
        el.style.animation = "";
        el.style.animationDelay = `${Math.min(d / 1400, 0.7).toFixed(3)}s`;
      });
    }
    press.current = window.setTimeout(() => setAt(i), 200);
  };

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 59 — ripple</p>
        <div ref={gridRef} className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {shots.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={(e) => fire(e.clientX, e.clientY, i)}
              aria-label={`Open frame ${pad(i)}: ${s.alt}`}
              className="block w-full cursor-pointer overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] motion-safe:animate-[lift_0.7s_ease] motion-reduce:animate-none dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt="" aria-hidden loading={i < 6 ? undefined : "lazy"} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
      <style>{`@keyframes lift { 0% { transform: scale(1); } 35% { transform: scale(1.05); } 100% { transform: scale(1); } }`}</style>
    </main>
  );
}
