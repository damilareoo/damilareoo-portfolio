"use client";

import { useEffect, useState } from "react";
import { dossier } from "@/data/dossier";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 54 — ping-pong.
 * The set bounces end to end and back, forever: 01→64→01. No wrap
 * cut, the direction reverses at the edges like a screensaver.
 */
export default function PingpongPage() {
  const [at, setAt] = useState(0);

  useEffect(() => {
    let dir: 1 | -1 = 1;
    const t = setInterval(() => {
      setAt((a) => {
        if (a === shots.length - 1) dir = -1;
        else if (a === 0) dir = 1;
        return a + dir;
      });
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[#0d0d0d] text-[#f2f2f2]">
      <p className="px-5 pt-6 font-mono text-xs text-[#8a8a8a]">lab 54 — ping-pong</p>
      <div className="flex min-h-0 flex-1 items-center justify-center px-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={shots[at].src} src={shots[at].src} alt={shots[at].alt} draggable={false} className="max-h-full w-auto max-w-full rounded-xl object-contain ring-1 ring-white/10 motion-safe:animate-[dip-in_0.5s_ease] motion-reduce:animate-none" />
      </div>
      <div className="mx-auto flex w-full max-w-[560px] items-center gap-4 px-5 pb-6">
        <button type="button" onClick={() => setAt((a) => Math.max(0, a - 1))} aria-label="Previous frame" className="cursor-pointer rounded-full p-2 ring-1 ring-white/15">←</button>
        <div className="h-px flex-1 bg-white/15" aria-hidden>
          <div className="h-px bg-white" style={{ width: `${((at + 1) / shots.length) * 100}%` }} />
        </div>
        <button type="button" onClick={() => setAt((a) => Math.min(shots.length - 1, a + 1))} aria-label="Next frame" className="cursor-pointer rounded-full p-2 ring-1 ring-white/15">→</button>
        <span className="font-mono text-xs text-[#8a8a8a]">
          {pad(at)} / {shots.length}
        </span>
      </div>
      <style>{`@keyframes dip-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </main>
  );
}
