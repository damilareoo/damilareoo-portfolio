"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 24 — cover + mosaic.
 * One hero holds the stage; the mosaic below feeds it. Tap anything
 * small to promote it. The wall is a stage with understudies.
 */
export default function CoverPage() {
  const [at, setAt] = useState(0);
  const [open, setOpen] = useState(false);

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <p className="px-5 pt-6 font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 24 — cover + mosaic</p>
      <div className="mx-auto flex min-h-0 w-full max-w-[1120px] flex-1 flex-col px-5 py-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Open frame ${pad(at)} fullscreen: ${shots[at].alt}`}
          className="block min-h-0 w-full flex-1 cursor-zoom-in overflow-hidden rounded-2xl bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={shots[at].src} src={shots[at].src} alt={shots[at].alt} draggable={false} className="pointer-events-none block h-full w-full object-cover" />
        </button>
        <div className="flex snap-x gap-2 overflow-x-auto pt-3">
          {shots.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setAt(i)}
              onMouseEnter={() => setAt(i)}
              aria-label={`Promote frame ${pad(i)}: ${s.alt}`}
              className={`h-14 w-24 flex-none cursor-pointer snap-start overflow-hidden rounded-lg ring-1 transition-all motion-reduce:transition-none ${
                i === at ? "ring-2 ring-[#171717] dark:ring-white" : "opacity-55 ring-[#e0e0e0] hover:opacity-100 dark:ring-[#2b2b2b]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt="" aria-hidden loading="lazy" draggable={false} className="pointer-events-none block h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
      <p className="pb-5 text-center font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">
        {pad(at)} / {shots.length}
      </p>
      {open && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setOpen(false)} />}
    </main>
  );
}
