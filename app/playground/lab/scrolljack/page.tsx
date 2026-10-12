"use client";

import { useEffect, useRef, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 46 — scrolljack horizontal.
 * Vertical scroll drives a horizontal band: the wheel goes down, the
 * work goes sideways. One gesture, an unfamiliar axis.
 */
export default function ScrolljackPage() {
  const [at, setAt] = useState<number | null>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const band = bandRef.current;
    if (!outer || !band) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const r = outer.getBoundingClientRect();
      const total = outer.offsetHeight - window.innerHeight;
      const t = Math.min(Math.max(-r.top / total, 0), 1);
      band.scrollLeft = t * (band.scrollWidth - band.clientWidth);
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
    <main ref={outerRef} className="bg-black text-white" style={{ height: `${100 + shots.length * 22}vh` }}>
      <div className="sticky top-0 flex h-dvh flex-col justify-center overflow-hidden">
        <p className="px-5 pb-4 font-mono text-xs text-white/50">lab 46 — scrolljack horizontal</p>
        <div ref={bandRef} className="flex w-full items-center gap-4 overflow-hidden px-[10vw]">
          {shots.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setAt(i)}
              aria-label={`Open frame ${pad(i)}: ${s.alt}`}
              className="h-[62dvh] w-[min(74vw,980px)] flex-none cursor-pointer overflow-hidden rounded-xl ring-1 ring-white/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt="" aria-hidden loading={i < 3 ? undefined : "lazy"} draggable={false} className="pointer-events-none block h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} dark={true} />}
    </main>
  );
}
