"use client";

import { useEffect, useState } from "react";
import { LabSetProvider, useLabShots } from "@/components/lab-set";
import { LabViewer } from "@/components/lab-viewer";

const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 48 — progress rail.
 * A hairline spine down the left; the wall scrolls beside it while a
 * thumb marks your depth. Tap the spine to jump anywhere.
 */
function ProgressrailPageInner() {
  const { shots, ratio } = useLabShots();
  const [at, setAt] = useState<number | null>(null);
  const [depth, setDepth] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        setDepth(total > 0 ? window.scrollY / total : 0);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const dive = (clientY: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const t = Math.min(Math.max((clientY - r.top) / r.height, 0), 1);
    window.scrollTo({ top: t * (document.documentElement.scrollHeight - window.innerHeight), behavior: "smooth" });
  };

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto flex w-full max-w-[1120px] gap-6 px-5 pb-24 pt-8">
        <div
          role="slider"
          tabIndex={0}
          aria-label="Scroll depth"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(depth * 100)}
          onPointerDown={(e) => dive(e.clientY, e.currentTarget)}
          onKeyDown={(e) => {
            const total = document.documentElement.scrollHeight - window.innerHeight;
            if (e.key === "ArrowDown") window.scrollTo({ top: window.scrollY + 400, behavior: "smooth" });
            else if (e.key === "ArrowUp") window.scrollTo({ top: window.scrollY - 400, behavior: "smooth" });
            else if (e.key === "Home") window.scrollTo({ top: 0, behavior: "smooth" });
            else if (e.key === "End") window.scrollTo({ top: total, behavior: "smooth" });
          }}
          className="sticky top-8 hidden h-[70vh] w-8 cursor-pointer touch-none self-start sm:block"
        >
          <span aria-hidden className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#e5e5e5] dark:bg-white/10" />
          <span
            aria-hidden
            className="absolute left-1/2 h-8 w-8 -translate-x-1/2 rounded-full bg-[#171717] font-mono text-[9px] tabular-nums text-white dark:bg-white dark:text-[#171717]"
            style={{ top: `calc(${depth * 100}% - 16px)` }}
          />
          <span aria-hidden className="absolute -bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] tabular-nums text-[#767676] dark:text-[#8a8a8a]">
            {pad(Math.min(Math.floor(depth * shots.length), shots.length - 1))}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 48 — progress rail</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
            {shots.map((s, i) => (
              <button
                key={s.src}
                type="button"
                onClick={() => setAt(i)}
                aria-label={`Open frame ${pad(i)}: ${s.alt}`}
                className="block w-full cursor-zoom-in overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt="" aria-hidden loading={i < 6 ? undefined : "lazy"} draggable={false} className="pointer-events-none block w-full object-cover" style={{ aspectRatio: ratio }} />
              </button>
            ))}
          </div>
        </div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}

export default function ProgressrailPage() {
  return (
    <LabSetProvider>
      <ProgressrailPageInner />
    </LabSetProvider>
  );
}
