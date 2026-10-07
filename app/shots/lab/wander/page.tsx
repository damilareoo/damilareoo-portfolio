"use client";

import { useEffect, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";
import { useReducedMotion } from "@/lib/motion";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 40 — wandering light.
 * A lit cell roams the grid on its own every couple of seconds; hover
 * takes the steering wheel, tap opens fullscreen. The wall visits you.
 */
export default function WanderPage() {
  const reduced = useReducedMotion();
  const [lit, setLit] = useState(0);
  const [held, setHeld] = useState(false);
  const [at, setAt] = useState<number | null>(null);

  useEffect(() => {
    if (reduced || held) return;
    const t = setInterval(() => {
      setLit((l) => {
        let n = l;
        while (n === l) n = Math.floor(Math.random() * shots.length);
        return n;
      });
    }, 2200);
    return () => clearInterval(t);
  }, [reduced, held, lit]);

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 40 — wandering light</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {shots.map((s, i) => {
            const on = i === lit;
            return (
              <button
                key={s.src}
                type="button"
                onMouseEnter={() => {
                  setLit(i);
                  setHeld(true);
                }}
                onMouseLeave={() => setHeld(false)}
                onFocus={() => {
                  setLit(i);
                  setHeld(true);
                }}
                onBlur={() => setHeld(false)}
                onClick={() => setAt(i)}
                aria-label={`Open frame ${pad(i)}: ${s.alt}`}
                className={`block w-full cursor-zoom-in overflow-hidden rounded-xl ring-1 transition-all duration-500 motion-reduce:transition-none ${
                  on
                    ? "scale-[1.03] bg-white ring-2 ring-[#171717] dark:bg-[#1e1e1e] dark:ring-white"
                    : "bg-white opacity-60 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt={on ? s.alt : ""} aria-hidden={!on} loading={i < 8 ? undefined : "lazy"} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
              </button>
            );
          })}
        </div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
