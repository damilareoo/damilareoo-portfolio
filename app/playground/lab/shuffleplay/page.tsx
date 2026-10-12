"use client";

import { useEffect, useState } from "react";
import { dossier } from "@/data/dossier";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 53 — shuffle play.
 * Random fullscreen every few seconds, sliding in from alternating
 * sides. The set as a station you don't control. Tap to reshuffle now.
 */
export default function ShuffleplayPage() {
  const [at, setAt] = useState(() => Math.floor(Math.random() * shots.length));
  const [side, setSide] = useState<1 | -1>(1);

  useEffect(() => {
    const t = setInterval(() => {
      setSide((s) => (s === 1 ? -1 : 1));
      setAt((a) => {
        let n = a;
        while (n === a) n = Math.floor(Math.random() * shots.length);
        return n;
      });
    }, 4000);
    return () => clearInterval(t);
  }, [at]);

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-black text-white" onClick={() => setAt(Math.floor(Math.random() * shots.length))}>
      <p className="px-5 pt-6 font-mono text-xs text-white/50">lab 53 — shuffle play</p>
      <div className="flex min-h-0 flex-1 cursor-pointer items-center justify-center overflow-hidden px-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={shots[at].src}
          src={shots[at].src}
          alt={shots[at].alt}
          draggable={false}
          className="max-h-full w-auto max-w-full rounded-xl object-contain ring-1 ring-white/10 motion-safe:animate-[slide-in_0.5s_ease] motion-reduce:animate-none"
          style={{ ["--sx" as string]: side > 0 ? "60px" : "-60px" }}
        />
      </div>
      <p className="pb-6 text-center font-mono text-xs text-white/50">
        {pad(at)} / {shots.length}
      </p>
      <style>{`@keyframes slide-in { from { opacity: 0; transform: translateX(var(--sx, 60px)); } to { opacity: 1; transform: none; } }`}</style>
    </main>
  );
}
