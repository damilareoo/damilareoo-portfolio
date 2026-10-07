"use client";

import { useCallback, useEffect, useState } from "react";
import { dossier } from "@/data/dossier";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 76 — split viewer.
 * Two frames side by side, each stepping on its own. Compare neighbors
 * or decades apart; the seam never moves, the work does.
 */
export default function SplitviewerPage() {
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(1);

  const step = useCallback(
    (which: "l" | "r", dir: 1 | -1) => {
      if (which === "l") setLeft((a) => (a + dir + shots.length) % shots.length);
      else setRight((a) => (a + dir + shots.length) % shots.length);
    },
    [],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step("r", 1);
      else if (e.key === "ArrowLeft") step("l", -1);
      else if (e.key === "ArrowUp") step("l", 1);
      else if (e.key === "ArrowDown") step("r", -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  const half = (which: "l" | "r", i: number) => (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={shots[i].src} src={shots[i].src} alt={shots[i].alt} draggable={false} className="max-h-full w-auto max-w-full rounded-xl object-contain ring-1 ring-white/10" />
      </div>
      <div className="flex items-center justify-center gap-2 pt-3">
        <button type="button" onClick={() => step(which, -1)} aria-label={`${which === "l" ? "Left" : "Right"} frame back`} className="cursor-pointer rounded-full p-2 ring-1 ring-white/15">←</button>
        <span className="font-mono text-xs text-white/50">{pad(i)}</span>
        <button type="button" onClick={() => step(which, 1)} aria-label={`${which === "l" ? "Left" : "Right"} frame forward`} className="cursor-pointer rounded-full p-2 ring-1 ring-white/15">→</button>
      </div>
    </div>
  );

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-black text-white">
      <p className="px-5 pt-6 font-mono text-xs text-white/50">lab 76 — split viewer</p>
      <div className="flex min-h-0 flex-1 gap-4 px-5 pb-6 pt-2">
        {half("l", left)}
        <span aria-hidden className="w-px self-stretch bg-white/10" />
        {half("r", right)}
      </div>
    </main>
  );
}
