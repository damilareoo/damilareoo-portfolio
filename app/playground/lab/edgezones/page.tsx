"use client";

import { useEffect, useRef, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 61 — edge zones.
 * Park the cursor at the screen's edge and the rail drives itself;
 * drift to the middle and it coasts to a stop. No dragging, no wheel.
 */
export default function EdgezonesPage() {
  const [at, setAt] = useState<number | null>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let v = 0;
    let mx = 0;
    const move = (e: PointerEvent) => {
      mx = e.clientX;
    };
    const tick = () => {
      const w = window.innerWidth;
      const edge = 140;
      if (mx < edge) v = -((edge - mx) / edge) * 14;
      else if (mx > w - edge) v = ((mx - (w - edge)) / edge) * 14;
      else v *= 0.92;
      rail.scrollLeft += v;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <main className="flex h-dvh flex-col justify-center overflow-hidden bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <p className="px-5 pb-4 font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 61 — edge zones</p>
      <div ref={railRef} className="flex w-full snap-x items-center gap-4 overflow-x-auto px-[10vw] py-4">
        {shots.map((s, i) => (
          <button
            key={s.src}
            type="button"
            onClick={() => setAt(i)}
            aria-label={`Open frame ${pad(i)}: ${s.alt}`}
            className="w-[70vw] max-w-[640px] flex-none cursor-pointer snap-center overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] sm:w-[40vw] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt="" aria-hidden loading={i < 3 ? undefined : "lazy"} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
          </button>
        ))}
      </div>
      <p className="pt-4 text-center font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">{shots.length} frames</p>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
