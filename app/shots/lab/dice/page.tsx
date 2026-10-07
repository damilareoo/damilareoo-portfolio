"use client";

import { useCallback, useEffect, useState } from "react";
import { dossier } from "@/data/dossier";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 11 — dice.
 * One full-bleed frame, nothing else. Tap for another; the randomness
 * is the interaction. Arrows retrace your steps.
 */
export default function DicePage() {
  const [at, setAt] = useState(() => Math.floor(Math.random() * shots.length));
  const [hist, setHist] = useState<number[]>([at]);
  const [pos, setPos] = useState(0);
  const [kick, setKick] = useState(0);

  const roll = useCallback(() => {
    setAt((a) => {
      let n = a;
      while (n === a) n = Math.floor(Math.random() * shots.length);
      setHist((h) => [...h.slice(-31), n]);
      setPos((p) => Math.min(p + 1, 31));
      return n;
    });
    setKick((k) => k + 1);
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      const p = Math.min(Math.max(pos + dir, 0), hist.length - 1);
      setPos(p);
      setAt(hist[p]);
    },
    [hist, pos],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        if (e.key === " ") roll();
        else step(1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        step(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [roll, step]);

  const s = shots[at];

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[#0d0d0d] text-[#f2f2f2]" onClick={roll}>
      <p className="px-5 pt-6 font-mono text-xs text-[#8a8a8a]">lab 11 — dice</p>
      <div className="flex min-h-0 flex-1 cursor-pointer items-center justify-center px-5" role="button" aria-label={`Another frame (now showing: ${s.alt})`} tabIndex={0}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={`${s.src}-${kick}`}
          src={s.src}
          alt={s.alt}
          draggable={false}
          className="max-h-full w-auto max-w-full rounded-xl object-contain ring-1 ring-white/10 drop-shadow-[0_24px_48px_rgba(0,0,0,0.5)] motion-safe:animate-[dice-in_0.35s_ease] motion-reduce:animate-none"
        />
      </div>
      <p className="pb-6 text-center font-mono text-xs text-[#8a8a8a]">
        {pad(at)} / {shots.length}
      </p>
      <style>{`@keyframes dice-in { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }`}</style>
    </main>
  );
}
