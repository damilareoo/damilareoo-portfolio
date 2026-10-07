"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 93 — visited tray.
 * Every frame you open leaves a mini in the tray pinned to the
 * bottom. Your path through the set, kept, re-tappable.
 */
export default function TrayPage() {
  const [at, setAt] = useState<number | null>(null);
  const [seen, setSeen] = useState<number[]>([]);

  const open = (i: number) => {
    setAt(i);
    setSeen((s) => [i, ...s.filter((x) => x !== i)].slice(0, 12));
  };

  return (
    <main className="bg-[#fafafa] pb-28 text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 93 — visited tray</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {shots.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => open(i)}
              aria-label={`Open frame ${pad(i)}: ${s.alt}`}
              className={`block w-full cursor-zoom-in overflow-hidden rounded-xl ring-1 transition-opacity ${
                seen.includes(i) ? "bg-white opacity-100 ring-[#171717] dark:bg-[#1e1e1e] dark:ring-white" : "bg-white opacity-80 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt="" aria-hidden loading={i < 6 ? undefined : "lazy"} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
      {seen.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e5e5e5] bg-[#fafafa]/92 py-2 backdrop-blur-md dark:border-white/10 dark:bg-[#131313]/92">
          <div className="mx-auto flex w-full max-w-[1120px] gap-2 overflow-x-auto px-5">
            {seen.map((i) => (
              <button
                key={shots[i].src}
                type="button"
                onClick={() => setAt(i)}
                aria-label={`Revisit frame ${pad(i)}: ${shots[i].alt}`}
                className="h-12 w-20 flex-none cursor-pointer overflow-hidden rounded-md ring-1 ring-[#171717] dark:ring-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={shots[i].src} alt="" aria-hidden loading="lazy" draggable={false} className="pointer-events-none block h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
