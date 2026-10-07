"use client";

import { useEffect, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 50 — sticky zoom.
 * Each frame gets its own chapter: scroll in and it swells toward
 * you, scroll on and the next takes its place. One at a time, large.
 */
export default function StickyzoomPage() {
  const [at, setAt] = useState<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const vh = window.innerHeight;
      document.querySelectorAll("[data-z]").forEach((el) => {
        const r = (el as HTMLElement).getBoundingClientRect();
        const t = 1 - Math.min(Math.abs(r.top + r.height / 2 - vh / 2) / (vh / 2), 1);
        (el as HTMLElement).style.transform = `scale(${(0.86 + t * 0.14).toFixed(4)})`;
        (el as HTMLElement).style.opacity = (0.45 + t * 0.55).toFixed(3);
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
      <div className="mx-auto w-full max-w-[1000px] space-y-[12dvh] px-5 py-16">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 50 — sticky zoom</p>
        {shots.map((s, i) => (
          <div key={s.src} data-z className="will-change-transform">
            <button
              type="button"
              onClick={() => setAt(i)}
              aria-label={`Open frame ${pad(i)}: ${s.alt}`}
              className="block w-full cursor-zoom-in overflow-hidden rounded-2xl bg-white ring-1 ring-[#e0e0e0] drop-shadow-[0_24px_48px_rgba(0,0,0,0.16)] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt="" aria-hidden loading={i < 3 ? undefined : "lazy"} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
            </button>
          </div>
        ))}
        <p className="pb-10 text-center font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">
          {pad(shots.length - 1)} / {shots.length}
        </p>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
