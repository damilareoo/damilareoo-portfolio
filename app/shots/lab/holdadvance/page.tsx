"use client";

import { useEffect, useRef, useState } from "react";
import { dossier } from "@/data/dossier";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 55 — hold to advance.
 * Press and hold anywhere: frames pour past while held, freezing the
 * instant you let go. Throttle as interaction. Release lands.
 */
export default function HoldadvancePage() {
  const [at, setAt] = useState(0);
  const holding = useRef(false);

  useEffect(() => {
    const t = setInterval(() => {
      if (holding.current) setAt((a) => (a + 1) % shots.length);
    }, 320);
    return () => clearInterval(t);
  }, []);

  return (
    <main
      className="flex h-dvh cursor-pointer touch-none select-none flex-col overflow-hidden bg-black text-white"
      onPointerDown={() => (holding.current = true)}
      onPointerUp={() => (holding.current = false)}
      onPointerCancel={() => (holding.current = false)}
      onPointerLeave={() => (holding.current = false)}
    >
      <p className="px-5 pt-6 font-mono text-xs text-white/50">lab 55 — hold to advance</p>
      <div className="flex min-h-0 flex-1 items-center justify-center px-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={shots[at].src} src={shots[at].src} alt={shots[at].alt} draggable={false} className="pointer-events-none max-h-full w-auto max-w-full rounded-xl object-contain ring-1 ring-white/10" />
      </div>
      <div className="px-5 pb-8">
        <div className="mx-auto h-[3px] max-w-[560px] rounded-full bg-white/15" aria-hidden>
          <div className="h-full rounded-full bg-white" style={{ width: `${((at + 1) / shots.length) * 100}%` }} />
        </div>
        <p className="mt-2 text-center font-mono text-xs text-white/50">
          {pad(at)} / {shots.length}
        </p>
      </div>
    </main>
  );
}
