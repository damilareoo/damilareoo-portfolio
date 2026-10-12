"use client";

import { useEffect, useState } from "react";
import { dossier } from "@/data/dossier";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 100 — the moment.
 * One frame fills the viewport: the set's deterministic pick for this
 * hour, reseeded every sixty minutes. Arrows wander; time decides.
 */
function pickHour(): number {
  const d = new Date();
  const seed = d.getFullYear() * 1000000 + (d.getMonth() + 1) * 10000 + d.getDate() * 100 + d.getHours();
  return seed % shots.length;
}

export default function MomentPage() {
  const [at, setAt] = useState(pickHour);

  useEffect(() => {
    const t = setInterval(() => setAt(pickHour()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") setAt((a) => (a + 1) % shots.length);
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") setAt((a) => (a - 1 + shots.length) % shots.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const hour = new Date().getHours();

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-black text-white">
      <p className="absolute left-5 top-6 z-10 font-mono text-xs text-white/50">lab 100 — the moment</p>
      <p aria-hidden className="absolute right-5 top-6 z-10 font-mono text-xs tabular-nums text-white/50">
        {String(hour).padStart(2, "0")}:00
      </p>
      <div className="flex min-h-0 flex-1 items-center justify-center px-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={shots[at].src}
          src={shots[at].src}
          alt={shots[at].alt}
          draggable={false}
          className="max-h-full w-auto max-w-full rounded-xl object-contain ring-1 ring-white/10 motion-safe:animate-[moment-in_0.8s_ease] motion-reduce:animate-none"
        />
      </div>
      <div className="mx-auto flex w-full max-w-[560px] items-center gap-4 px-5 pb-6">
        <button type="button" onClick={() => setAt((a) => (a - 1 + shots.length) % shots.length)} aria-label="Previous frame" className="cursor-pointer rounded-full p-2 ring-1 ring-white/15">←</button>
        <div className="h-px flex-1 bg-white/15" aria-hidden>
          <div className="h-px bg-white" style={{ width: `${((at + 1) / shots.length) * 100}%` }} />
        </div>
        <button type="button" onClick={() => setAt((a) => (a + 1) % shots.length)} aria-label="Next frame" className="cursor-pointer rounded-full p-2 ring-1 ring-white/15">→</button>
        <span className="font-mono text-xs text-white/50">
          {pad(at)} / {shots.length}
        </span>
      </div>
      <style>{`@keyframes moment-in { from { opacity: 0; transform: scale(1.02); } to { opacity: 1; transform: scale(1); } }`}</style>
    </main>
  );
}
