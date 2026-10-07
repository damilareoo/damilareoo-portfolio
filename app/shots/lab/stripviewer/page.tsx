"use client";

import { useEffect, useRef, useState } from "react";
import { dossier } from "@/data/dossier";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 78 — strip viewer.
 * Fullscreen stage with a filmstrip underneath: the strip scrolls to
 * follow, tap any frame to jump the stage. Theatre with orchestra.
 */
export default function StripviewerPage() {
  const [at, setAt] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    stripRef.current?.querySelector(`[data-s="${at}"]`)?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [at]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setAt((a) => (a + 1) % shots.length);
      else if (e.key === "ArrowLeft") setAt((a) => (a - 1 + shots.length) % shots.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-black text-white">
      <p className="px-5 pt-6 font-mono text-xs text-white/50">lab 78 — strip viewer</p>
      <div className="flex min-h-0 flex-1 items-center justify-center px-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={shots[at].src} src={shots[at].src} alt={shots[at].alt} draggable={false} className="max-h-full w-auto max-w-full rounded-xl object-contain ring-1 ring-white/10" />
      </div>
      <div ref={stripRef} className="flex snap-x gap-2 overflow-x-auto px-5 pb-2">
        {shots.map((s, i) => (
          <button
            key={s.src}
            type="button"
            data-s={i}
            onClick={() => setAt(i)}
            aria-label={`Show frame ${pad(i)}: ${s.alt}`}
            className={`h-14 w-24 flex-none cursor-pointer snap-start overflow-hidden rounded-md ring-1 transition-opacity ${i === at ? "opacity-100 ring-white" : "opacity-45 ring-white/10 hover:opacity-90"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt="" aria-hidden loading="lazy" draggable={false} className="pointer-events-none block h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <p className="pb-5 pt-1 text-center font-mono text-xs text-white/50">
        {pad(at)} / {shots.length}
      </p>
    </main>
  );
}
