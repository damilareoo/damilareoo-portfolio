"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 09 — snap carousel.
 * Center stage, neighbors peeking. Scroll, swipe, or arrows; the middle
 * frame is always the one. Tap it for fullscreen.
 */
export default function CarouselPage() {
  const [at, setAt] = useState(0);
  const [open, setOpen] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);

  const go = useCallback((i: number) => {
    setAt(((i % shots.length) + shots.length) % shots.length);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const kids = Array.from(rail.children) as HTMLElement[];
        const mid = rail.scrollLeft + rail.clientWidth / 2;
        let best = 0;
        let bestD = Infinity;
        kids.forEach((k, i) => {
          const c = k.offsetLeft + k.offsetWidth / 2;
          const d = Math.abs(c - mid);
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        });
        go(best);
      });
    };
    rail.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      rail.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [go]);

  const jump = (i: number) => {
    const rail = railRef.current;
    const kid = rail?.children[i] as HTMLElement | undefined;
    kid?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    go(i);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        jump((at + 1) % shots.length);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        jump((at - 1 + shots.length) % shots.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [at, open]);

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <p className="px-5 pt-6 font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 09 — snap carousel</p>
      <div className="flex min-h-0 flex-1 items-center">
        <div ref={railRef} className="flex w-full snap-x snap-mandatory items-center gap-4 overflow-x-auto px-[8vw] py-4">
          {shots.map((s, i) => {
            const live = i === at;
            return (
              <button
                key={s.src}
                type="button"
                onClick={() => (live ? setOpen(true) : jump(i))}
                aria-label={live ? `Open frame ${pad(i)} fullscreen` : `Focus frame ${pad(i)}: ${s.alt}`}
                className={`flex-none snap-center overflow-hidden rounded-xl bg-white ring-1 transition-all duration-300 motion-reduce:transition-none dark:bg-[#1e1e1e] ${
                  live ? "w-[76vw] max-w-[920px] cursor-zoom-in ring-2 ring-[#171717] dark:ring-white" : "w-[52vw] max-w-[560px] cursor-pointer opacity-50 ring-[#e0e0e0] dark:ring-[#2b2b2b]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt={live ? s.alt : ""} aria-hidden={!live} loading={i < 3 ? undefined : "lazy"} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
              </button>
            );
          })}
        </div>
      </div>
      <p className="pb-6 text-center font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">
        {pad(at)} / {shots.length}
      </p>
      {open && <LabViewer shots={shots} at={at} onAt={go} onClose={() => setOpen(false)} />}
    </main>
  );
}
