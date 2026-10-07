"use client";

import { useEffect, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 47 — pinned crossfade.
 * Scrollytelling, straight: the viewport pins while scroll dissolves
 * one frame into the next. A pudding-style stage for 64 frames.
 */
export default function CrossfadePage() {
  const [at, setAt] = useState<number | null>(null);

  const [pos, setPos] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = document.getElementById("x-track");
        if (!el) return;
        const r = el.getBoundingClientRect();
        const total = el.offsetHeight - window.innerHeight;
        const t = Math.min(Math.max(-r.top / total, 0), 1);
        setPos(Math.min(Math.floor(t * shots.length), shots.length - 1));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <main id="x-track" className="bg-black text-white" style={{ height: `${100 + shots.length * 30}vh` }}>
      <div className="sticky top-0 flex h-dvh flex-col items-center justify-center px-5">
        <p className="absolute left-5 top-6 font-mono text-xs text-white/50">lab 47 — pinned crossfade</p>
        <button
          type="button"
          onClick={() => setAt(pos)}
          aria-label={`Open frame ${pad(pos)} fullscreen: ${shots[pos].alt}`}
          className="relative block aspect-video w-full max-w-[1100px] cursor-zoom-in"
        >
          {shots.map((s, i) => {
            const near = Math.abs(i - pos) < 3;
            return (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={s.src}
                src={near ? s.src : undefined}
                alt={i === pos ? s.alt : ""}
                aria-hidden={i !== pos}
                draggable={false}
                className="pointer-events-none absolute inset-0 h-full w-full rounded-xl object-cover ring-1 ring-white/10 transition-opacity duration-500"
                style={{ opacity: i === pos ? 1 : 0 }}
              />
            );
          })}
        </button>
        <p className="absolute bottom-6 font-mono text-xs text-white/50">
          {pad(pos)} / {shots.length}
        </p>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} dark={true} />}
    </main>
  );
}
