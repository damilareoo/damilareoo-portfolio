"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const PER = 8;
const PAGES = Math.ceil(shots.length / PER);
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 22 — paged book.
 * Eight frames to a page, arrows and swipe turn it. Finite, calm,
 * always clear how much is left. A book, not a feed.
 */
export default function PagesPage() {
  const [page, setPage] = useState(0);
  const [at, setAt] = useState<number | null>(null);

  const turn = useCallback((dir: 1 | -1) => {
    setPage((p) => (p + dir + PAGES) % PAGES);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (at !== null) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        turn(1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        turn(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [at, turn]);

  /* swipe turns */
  const x = useRef<number | null>(null);

  const items = shots.slice(page * PER, page * PER + PER);

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <p className="px-5 pt-6 font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 22 — paged book</p>
      <div
        className="mx-auto grid w-full max-w-[1120px] flex-1 grid-cols-2 content-center gap-3 px-5 py-4"
        onTouchStart={(e) => (x.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (x.current === null) return;
          const dx = e.changedTouches[0].clientX - x.current;
          if (dx < -60) turn(1);
          else if (dx > 60) turn(-1);
          x.current = null;
        }}
      >
        {items.map((s) => {
          const i = shots.indexOf(s);
          return (
            <button
              key={`${page}-${s.src}`}
              type="button"
              onClick={() => setAt(i)}
              aria-label={`Open frame ${pad(i)}: ${s.alt}`}
              className="block w-full cursor-zoom-in overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] motion-safe:animate-[page-in_0.4s_ease] motion-reduce:animate-none dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt="" aria-hidden draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
            </button>
          );
        })}
      </div>
      <div className="mx-auto flex w-full max-w-[560px] items-center gap-4 px-5 pb-6">
        <button type="button" onClick={() => turn(-1)} aria-label="Previous page" className="cursor-pointer rounded-full p-2 ring-1 ring-[#e5e5e5] dark:ring-white/10">←</button>
        <div className="flex flex-1 justify-center gap-1.5" aria-hidden>
          {Array.from({ length: PAGES }).map((_, p) => (
            <span key={p} className={`h-1 w-6 rounded-full ${p === page ? "bg-[#171717] dark:bg-white" : "bg-[#e5e5e5] dark:bg-white/15"}`} />
          ))}
        </div>
        <button type="button" onClick={() => turn(1)} aria-label="Next page" className="cursor-pointer rounded-full p-2 ring-1 ring-[#e5e5e5] dark:ring-white/10">→</button>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
      <style>{`@keyframes page-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }`}</style>
    </main>
  );
}
