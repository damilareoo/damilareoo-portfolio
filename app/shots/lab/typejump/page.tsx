"use client";

import { useEffect, useRef, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 42 — type-to-jump.
 * The wall is quiet until you type: digits dial a frame like a
 * combination lock, fullscreen answers. No visible interface at all.
 */
export default function TypejumpPage() {
  const [buf, setBuf] = useState("");
  const [at, setAt] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (at !== null) return;
      if (/^[0-9]$/.test(e.key)) {
        const next = (buf + e.key).slice(-2);
        setBuf(next);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          const n = parseInt(next, 10);
          if (n >= 1 && n <= shots.length) setAt(n - 1);
          setBuf("");
        }, 600);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [at, buf]);

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <div className="flex items-baseline justify-between">
          <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 42 — type-to-jump</p>
          <p aria-hidden className="font-mono text-2xl tabular-nums text-[#171717] dark:text-white">{buf || "––"}</p>
        </div>
        <div className="mt-6 grid grid-cols-4 gap-1.5 sm:grid-cols-8">
          {shots.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setAt(i)}
              aria-label={`Open frame ${pad(i)}: ${s.alt}`}
              className="block w-full cursor-zoom-in overflow-hidden rounded-md bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt="" aria-hidden loading="lazy" draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
