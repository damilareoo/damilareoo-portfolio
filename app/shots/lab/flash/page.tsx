"use client";

import { useEffect, useState } from "react";
import { dossier } from "@/data/dossier";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 92 — flash.
 * The wall is black. Every tap detonates one random frame fullscreen
 * for a heartbeat, then darkness again. Scarcity makes each one land.
 */
export default function FlashPage() {
  const [at, setAt] = useState<number | null>(null);

  useEffect(() => {
    if (at === null) return;
    const t = setTimeout(() => setAt(null), 1400);
    return () => clearTimeout(t);
  }, [at]);

  const fire = () => {
    setAt((a) => {
      let n = Math.floor(Math.random() * shots.length);
      while (n === a) n = Math.floor(Math.random() * shots.length);
      return n;
    });
  };

  return (
    <main className="flex h-dvh cursor-pointer flex-col overflow-hidden bg-black text-white" onClick={fire}>
      <p className="px-5 pt-6 font-mono text-xs text-white/40">lab 92 — flash</p>
      <div className="flex min-h-0 flex-1 items-center justify-center px-5">
        {at !== null && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={at}
            src={shots[at].src}
            alt={shots[at].alt}
            draggable={false}
            className="pointer-events-none max-h-full w-auto max-w-full rounded-xl object-contain ring-1 ring-white/10 motion-safe:animate-[flash_1.4s_ease] motion-reduce:animate-none"
          />
        )}
      </div>
      <p className="pb-6 text-center font-mono text-xs tabular-nums text-white/40">
        {at !== null ? `${pad(at)} / ${shots.length}` : "– –"}
      </p>
      <style>{`@keyframes flash { 0% { opacity: 0; transform: scale(1.04); } 12% { opacity: 1; transform: scale(1); } 80% { opacity: 1; } 100% { opacity: 0; } }`}</style>
    </main>
  );
}
