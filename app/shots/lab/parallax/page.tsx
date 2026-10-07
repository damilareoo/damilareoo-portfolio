"use client";

import { useEffect, useRef, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 45 — parallax layers.
 * Locomotive dialect: three depth lanes drifting at different speeds
 * against scroll, scale answering viewport position. Depth, not decor.
 */
export default function ParallaxPage() {
  const [at, setAt] = useState<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const vh = window.innerHeight;
      document.querySelectorAll("[data-depth]").forEach((el) => {
        const r = (el as HTMLElement).getBoundingClientRect();
        const t = (r.top + r.height / 2 - vh / 2) / vh;
        const d = Number((el as HTMLElement).dataset.depth);
        (el as HTMLElement).style.transform = `translateY(${(t * d * 120).toFixed(1)}px) scale(${(1 - Math.min(Math.abs(t) * 0.06, 0.12)).toFixed(4)})`;
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] space-y-10 px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 45 — parallax layers</p>
        {shots.map((s, i) => (
          <div key={s.src} data-depth={((i % 3) - 1).toString()} className="will-change-transform">
            <button
              type="button"
              onClick={() => setAt(i)}
              aria-label={`Open frame ${pad(i)}: ${s.alt}`}
              className={`block cursor-zoom-in overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b] ${
                i % 3 === 0 ? "w-full" : i % 3 === 1 ? "ml-auto w-[86%]" : "w-[86%]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt="" aria-hidden loading={i < 4 ? undefined : "lazy"} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
            </button>
          </div>
        ))}
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
