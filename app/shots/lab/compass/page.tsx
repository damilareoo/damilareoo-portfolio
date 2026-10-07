"use client";

import { useRef, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 43 — compass dial.
 * A ring you drag around: angle maps to position in the set, the
 * center shows where you are. Navigation as an instrument.
 */
export default function CompassPage() {
  const [at, setAt] = useState(0);
  const [open, setOpen] = useState(false);
  const dial = useRef(false);

  const fromAngle = (clientX: number, clientY: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const dx = clientX - (r.left + r.width / 2);
    const dy = clientY - (r.top + r.height / 2);
    let a = Math.atan2(dy, dx) + Math.PI / 2;
    if (a < 0) a += Math.PI * 2;
    setAt(Math.floor((a / (Math.PI * 2)) * shots.length) % shots.length);
  };

  return (
    <main className="flex h-dvh flex-col items-center justify-center gap-8 overflow-hidden bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 43 — compass dial</p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Open frame ${pad(at)} fullscreen: ${shots[at].alt}`}
        className="block w-[min(78vw,520px)] cursor-zoom-in overflow-hidden rounded-2xl bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={shots[at].src} src={shots[at].src} alt={shots[at].alt} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
      </button>
      <div
        role="slider"
        tabIndex={0}
        aria-label={`Frame ${pad(at)} of ${shots.length}`}
        aria-valuemin={1}
        aria-valuemax={shots.length}
        aria-valuenow={at + 1}
        onPointerDown={(e) => {
          dial.current = true;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          fromAngle(e.clientX, e.clientY, e.currentTarget);
        }}
        onPointerMove={(e) => dial.current && fromAngle(e.clientX, e.clientY, e.currentTarget)}
        onPointerUp={() => (dial.current = false)}
        onPointerCancel={() => (dial.current = false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setAt((a) => (a + 1) % shots.length);
          else if (e.key === "ArrowLeft") setAt((a) => (a - 1 + shots.length) % shots.length);
        }}
        className="relative h-44 w-44 cursor-pointer touch-none rounded-full ring-1 ring-[#e5e5e5] dark:ring-white/10"
      >
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-[#171717] dark:bg-white"
          style={{ transform: `rotate(${(at / shots.length) * 360}deg) translateY(-76px) translate(-50%, -50%)` }}
        />
        <span aria-hidden className="absolute inset-0 flex items-center justify-center font-mono text-sm tabular-nums">
          {pad(at)}
        </span>
      </div>
      {open && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setOpen(false)} />}
    </main>
  );
}
