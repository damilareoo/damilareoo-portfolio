"use client";

import { useEffect, useRef, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 99 — slit scan.
 * A horizontal slit rides the scroll: only the band at the viewport's
 * middle is ever fully visible, the rest falls into darkness above
 * and below. A scanner reading the set.
 */
export default function SlitPage() {
  const [at, setAt] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const onScroll = () => {
    const list = listRef.current;
    if (!list) return;
    const mid = window.innerHeight / 2;
    Array.from(list.children).forEach((kid) => {
      const r = (kid as HTMLElement).getBoundingClientRect();
      const c = r.top + r.height / 2;
      const d = Math.min(Math.abs(c - mid) / (window.innerHeight / 2), 1);
      (kid as HTMLElement).style.filter = `brightness(${(1 - d * 0.85).toFixed(3)})`;
      (kid as HTMLElement).style.transform = `scale(${(1 - d * 0.06).toFixed(4)})`;
    });
  };

  useEffect(() => {
    let raf = 0;
    const apply = () => {
      raf = 0;
      onScroll();
    };
    const listen = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    listen();
    window.addEventListener("scroll", listen, { passive: true });
    return () => {
      window.removeEventListener("scroll", listen);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="bg-black text-white">
      <div ref={listRef} className="mx-auto w-full max-w-[900px] space-y-6 px-5 py-16">
        <p className="font-mono text-xs text-white/50">lab 99 — slit scan</p>
        {shots.map((s, i) => (
          <button
            key={s.src}
            type="button"
            onClick={() => setAt(i)}
            aria-label={`Open frame ${pad(i)}: ${s.alt}`}
            className="block w-full cursor-zoom-in overflow-hidden rounded-xl ring-1 ring-white/10 will-change-transform"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt="" aria-hidden loading={i < 2 ? undefined : "lazy"} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
          </button>
        ))}
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} dark={true} />}
    </main>
  );
}
