"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 57 — split wipe.
 * Cursor x-position wipes between neighbors: left half shows one
 * frame, right half the next, the seam follows you. Compare by moving.
 */
export default function SplitwipePage() {
  const [at, setAt] = useState(0);
  const [split, setSplit] = useState(50);
  const [open, setOpen] = useState(false);

  const next = (at + 1) % shots.length;

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-black text-white">
      <p className="px-5 pt-6 font-mono text-xs text-white/50">lab 57 — split wipe</p>
      <div
        className="relative mx-5 min-h-0 flex-1 cursor-ew-resize overflow-hidden rounded-xl ring-1 ring-white/10"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setSplit(Math.min(Math.max(((e.clientX - r.left) / r.width) * 100, 0), 100));
        }}
        onClick={() => {
          setAt(next);
          setOpen(true);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={`b-${shots[next].src}`} src={shots[next].src} alt="" aria-hidden draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={`a-${shots[at].src}`}
          src={shots[at].src}
          alt={shots[at].alt}
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
        />
        <span aria-hidden className="absolute inset-y-0 w-px bg-white/80" style={{ left: `${split}%` }} />
      </div>
      <div className="mx-auto flex w-full max-w-[560px] items-center gap-4 px-5 py-5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setAt((a) => (a - 1 + shots.length) % shots.length);
          }}
          aria-label="Previous pair"
          className="cursor-pointer rounded-full p-2 ring-1 ring-white/15"
        >
          ←
        </button>
        <span className="flex-1 text-center font-mono text-xs text-white/50">
          {pad(at)} ⇄ {pad(next)}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setAt((a) => (a + 1) % shots.length);
          }}
          aria-label="Next pair"
          className="cursor-pointer rounded-full p-2 ring-1 ring-white/15"
        >
          →
        </button>
      </div>
      {open && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setOpen(false)} dark={true} />}
    </main>
  );
}
