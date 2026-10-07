"use client";

import { useEffect, useRef, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";
import { useReducedMotion } from "@/lib/motion";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

const COLS = 3;
const per = Math.ceil(shots.length / COLS);
const columns: number[][] = Array.from({ length: COLS }, (_, c) =>
  shots.map((_, i) => i).filter((i) => Math.floor(i / per) === c),
);

/**
 * Lab 29 — slots.
 * Three columns spin like reels and settle on a staggered cascade.
 * Tap a column to stop it early; tap the trio to spin again.
 */
export default function SlotsPage() {
  const reduced = useReducedMotion();
  const [at, setAt] = useState<number | null>(null);
  const [offsets, setOffsets] = useState<number[]>([0, 0, 0]);
  const [spinning, setSpinning] = useState<boolean[]>([false, false, false]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const spin = (cols?: number[]) => {
    if (reduced) return;
    const targets = cols ?? [0, 1, 2];
    targets.forEach((c, k) => {
      setSpinning((s) => s.map((v, i) => (i === c ? true : v)));
      const timer = setTimeout(
        () => {
          setOffsets((o) => o.map((v, i) => (i === c ? Math.floor(Math.random() * columns[c].length) : v)));
          setSpinning((s) => s.map((v, i) => (i === c ? false : v)));
        },
        900 + k * 600 + Math.random() * 500,
      );
      timers.current.push(timer);
    });
  };

  useEffect(() => {
    spin();
    return () => timers.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shown = (c: number) => columns[c][offsets[c] % columns[c].length];

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <p className="px-5 pt-6 font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 29 — slots</p>
      <div className="mx-auto grid w-full max-w-[1120px] flex-1 grid-cols-3 content-center gap-3 px-5">
        {[0, 1, 2].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => (spinning[c] ? undefined : setAt(shown(c)))}
            onDoubleClick={() => spin([c])}
            aria-label={spinning[c] ? `Reel ${c + 1} spinning` : `Open frame ${pad(shown(c))}: ${shots[shown(c)].alt}`}
            className="block w-full cursor-pointer overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
          >
            <div className="overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={`${c}-${offsets[c]}`}
                src={shots[shown(c)].src}
                alt=""
                aria-hidden
                draggable={false}
                className={`block aspect-video w-full object-cover ${spinning[c] ? "motion-safe:animate-[reel_0.18s_linear_infinite] motion-reduce:animate-none" : ""}`}
              />
            </div>
          </button>
        ))}
      </div>
      <div className="mx-auto flex w-full max-w-[560px] items-center justify-center gap-4 px-5 pb-6">
        <button
          type="button"
          onClick={() => spin()}
          aria-label="Spin the reels"
          className="cursor-pointer rounded-full bg-[#171717] px-6 py-2.5 font-mono text-xs text-white dark:bg-white dark:text-[#171717]"
        >
          {[pad(shown(0)), pad(shown(1)), pad(shown(2))].join(" · ")}
        </button>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
      <style>{`@keyframes reel { 0% { transform: translateY(-12%); filter: blur(2px); } 50% { transform: translateY(12%); filter: blur(2px); } 100% { transform: translateY(-12%); filter: blur(2px); } }`}</style>
    </main>
  );
}
