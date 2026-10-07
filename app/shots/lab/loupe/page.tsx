"use client";

import { useEffect, useRef, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 28 — loupe.
 * The whole set as a contact sheet; a magnifier lens rides the cursor
 * and reads whatever it covers at full detail. Archivist energy.
 */
export default function LoupePage() {
  const [at, setAt] = useState<number | null>(null);
  const [lens, setLens] = useState<{ x: number; y: number; i: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const grid = gridRef.current;
    if (!grid) return;
    const move = (e: PointerEvent) => {
      const r = grid.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > r.width || y > r.height) {
        setLens(null);
        return;
      }
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-i]");
      const i = el ? Number((el as HTMLElement).dataset.i) : null;
      setLens(i === null ? null : { x, y, i });
    };
    const leave = () => setLens(null);
    grid.addEventListener("pointermove", move);
    grid.addEventListener("pointerleave", leave);
    return () => {
      grid.removeEventListener("pointermove", move);
      grid.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 28 — loupe</p>
        <div ref={gridRef} className="relative mt-6">
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
            {shots.map((s, i) => (
              <button
                key={s.src}
                type="button"
                data-i={i}
                onClick={() => setAt(i)}
                aria-label={`Open frame ${pad(i)}: ${s.alt}`}
                className="block w-full cursor-zoom-in overflow-hidden rounded-md bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt="" aria-hidden loading="lazy" draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
              </button>
            ))}
          </div>
          {lens && (
            <div
              aria-hidden
              className="pointer-events-none absolute z-10 hidden w-[380px] max-w-[70vw] overflow-hidden rounded-xl bg-white ring-2 ring-[#171717] drop-shadow-[0_24px_48px_rgba(0,0,0,0.3)] sm:block dark:bg-[#1e1e1e] dark:ring-white"
              style={{ left: Math.min(lens.x + 24, (gridRef.current?.clientWidth ?? 400) - 390), top: Math.max(lens.y - 130, 0) }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shots[lens.i].src} alt="" aria-hidden draggable={false} className="block aspect-video w-full object-cover" />
              <p className="px-3 py-2 text-center font-mono text-[11px] text-[#767676] dark:text-[#8a8a8a]">
                {pad(lens.i)} / {shots.length}
              </p>
            </div>
          )}
        </div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
