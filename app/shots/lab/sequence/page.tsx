"use client";

import { useCallback, useEffect, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 18 — fullbleed sequence.
 * One frame per viewport, snap scrolling, a hairline for progress.
 * A film, not a page.
 */
export default function SequencePage() {
  const [at, setAt] = useState(0);
  const [open, setOpen] = useState(false);

  const go = useCallback((i: number) => {
    setAt(((i % shots.length) + shots.length) % shots.length);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        go(at + 1);
        document.querySelector(`[data-s="${(at + 1) % shots.length}"]`)?.scrollIntoView();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        go((at - 1 + shots.length) % shots.length);
        document.querySelector(`[data-s="${(at - 1 + shots.length) % shots.length}"]`)?.scrollIntoView();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [at, go, open]);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const mid = window.innerHeight / 2;
        const els = Array.from(document.querySelectorAll("[data-s]")) as HTMLElement[];
        let best = 0;
        let bestD = Infinity;
        els.forEach((el, i) => {
          const r = el.getBoundingClientRect();
          const d = Math.abs(r.top + r.height / 2 - mid);
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        });
        setAt(best);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <main className="h-[100dvh] snap-y snap-mandatory overflow-y-auto bg-black text-white">
      <p className="fixed left-5 top-6 z-10 font-mono text-xs text-white/50">lab 18 — fullbleed sequence</p>
      <p className="fixed bottom-6 left-1/2 z-10 -translate-x-1/2 font-mono text-xs text-white/50">
        {pad(at)} / {shots.length}
      </p>
      <div className="h-[8px]" />
      {shots.map((s, i) => (
        <section key={s.src} data-s={i} className="flex h-[100dvh] snap-start snap-always items-center justify-center px-4">
          <button
            type="button"
            onClick={() => {
              go(i);
              setOpen(true);
            }}
            aria-label={`Open frame ${pad(i)} fullscreen: ${s.alt}`}
            className="block w-full max-w-[1200px] cursor-zoom-in overflow-hidden rounded-xl ring-1 ring-white/10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt={s.alt} loading={i < 2 ? undefined : "lazy"} draggable={false} className="block max-h-[86dvh] w-full object-contain" />
          </button>
        </section>
      ))}
      <div className="fixed bottom-0 left-0 h-[2px] w-full bg-white/10" aria-hidden>
        <div className="h-full bg-white" style={{ width: `${((at + 1) / shots.length) * 100}%` }} />
      </div>
      {open && <LabViewer shots={shots} at={at} onAt={go} onClose={() => setOpen(false)} dark={true} />}
    </main>
  );
}
