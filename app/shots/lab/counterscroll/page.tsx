"use client";

import { useEffect, useRef, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 94 — counter-scroll.
 * Two columns locked together, running opposite directions off one
 * scroll position. Down the page, up the page, simultaneously.
 */
export default function CounterscrollPage() {
  const [at, setAt] = useState<number | null>(null);

  const left = shots.filter((_, i) => i % 2 === 0);
  const right = [...shots.filter((_, i) => i % 2 === 1)].reverse();

  const rightView = useRef<HTMLDivElement>(null);
  const rightInner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const view = rightView.current;
      const inner = rightInner.current;
      if (!view || !inner) return;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const t = total > 0 ? window.scrollY / total : 0;
      const range = inner.offsetHeight - view.offsetHeight;
      inner.style.transform = `translateY(${(-t * range).toFixed(1)}px)`;
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

  const tile = (s: (typeof shots)[number]) => {
    const i = shots.indexOf(s);
    return (
      <button
        key={s.src}
        type="button"
        onClick={() => setAt(i)}
        aria-label={`Open frame ${pad(i)}: ${s.alt}`}
        className="block w-full cursor-zoom-in overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={s.src} alt="" aria-hidden loading="lazy" draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
      </button>
    );
  };

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 94 — counter-scroll</p>
        <div className="mt-6 flex items-start gap-3 sm:gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-4">{left.map(tile)}</div>
          <div ref={rightView} className="h-[78vh] min-w-0 flex-1 self-start overflow-hidden sm:sticky sm:top-8">
            <div ref={rightInner} className="flex flex-col gap-3 will-change-transform sm:gap-4">
              {right.map(tile)}
            </div>
          </div>
        </div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
