"use client";

import { useEffect, useRef, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");
const RADIUS = 260;

/**
 * Lab 16 — gravity field.
 * Frames lean toward the cursor: near ones lift and brighten, far ones
 * settle. Nothing to click, nothing to read — the page breathes.
 */
export default function GravityPage() {
  const [at, setAt] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cells = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let mx = -9999;
    let my = -9999;
    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const apply = () => {
      raf = 0;
      cells.current.forEach((el) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const d = Math.hypot(mx - cx, my - cy);
        const t = Math.max(0, 1 - d / RADIUS);
        const eased = t * t;
        el.style.transform = `scale(${(1 + eased * 0.09).toFixed(3)}) translate(${(((mx - cx) / RADIUS) * 14 * eased).toFixed(1)}px, ${(((my - cy) / RADIUS) * 14 * eased).toFixed(1)}px)`;
        el.style.filter = `brightness(${(0.72 + eased * 0.28).toFixed(3)})`;
        el.style.zIndex = eased > 0.02 ? "2" : "0";
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 16 — gravity field</p>
        <div ref={gridRef} className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {shots.map((s, i) => (
            <div
              key={s.src}
              ref={(el) => {
                cells.current[i] = el;
              }}
              className="relative rounded-xl brightness-[0.72] transition-transform duration-150 ease-out will-change-transform"
            >
              <button
                type="button"
                onClick={() => setAt(i)}
                aria-label={`Open frame ${pad(i)}: ${s.alt}`}
                className="block w-full cursor-zoom-in overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt="" aria-hidden loading={i < 6 ? undefined : "lazy"} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
              </button>
            </div>
          ))}
        </div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
