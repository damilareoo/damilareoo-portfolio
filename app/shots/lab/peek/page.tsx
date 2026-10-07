"use client";

import { useEffect, useRef, useState } from "react";
import { dossier } from "@/data/dossier";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * One tile: press-and-hold lifts it to near-fullscreen; release settles
 * it back. A quick tap pins it open instead. Zero chrome, zero travel.
 */
function PeekTile({ src, alt, i }: { src: string; alt: string; i: number }) {
  const [lift, setLift] = useState(false);
  const [pin, setPin] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const down = () => {
    timer.current = setTimeout(() => setLift(true), 220);
  };
  const up = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (!lift) setPin(true);
    setLift(false);
  };

  return (
    <>
      <button
        type="button"
        onPointerDown={down}
        onPointerUp={up}
        onPointerLeave={() => {
          if (timer.current) clearTimeout(timer.current);
          timer.current = null;
          setLift(false);
        }}
        onContextMenu={(e) => e.preventDefault()}
        aria-label={`Peek frame ${pad(i)}: ${alt}`}
        className="block w-full cursor-pointer touch-none select-none overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" aria-hidden loading={i < 6 ? undefined : "lazy"} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
      </button>
      {(lift || pin) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0d0d]/95 p-5"
          onPointerUp={() => pin && setPin(false)}
          onClick={() => setPin(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} — ${pad(i)} of ${shots.length}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            draggable={false}
            className={`max-h-[86vh] w-auto max-w-[92vw] rounded-xl object-contain ring-1 ring-white/10 motion-safe:animate-[peek-in_0.25s_ease] motion-reduce:animate-none ${lift && !pin ? "pointer-events-none" : ""}`}
          />
        </div>
      )}
    </>
  );
}

/**
 * Lab 13 — press-to-peek.
 * Hold any tile to lift it near-fullscreen; let go and it settles back.
 * Tap pins it until you tap away. The viewer is a gesture, not a page.
 */
export default function PeekPage() {
  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 13 — press-to-peek</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {shots.map((s, i) => (
            <PeekTile key={s.src} src={s.src} alt={s.alt} i={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
