"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 36 — coverflow.
 * The classic, done straight: center frame front and large, neighbors
 * receding with mirror sheen. Arrows, swipe, or tap a neighbor.
 */
export default function CoverflowPage() {
  const [at, setAt] = useState(0);
  const [open, setOpen] = useState(false);
  const [dir, setDir] = useState<1 | -1>(1);

  const go = useCallback(
    (d: 1 | -1) => {
      setDir(d);
      setAt((a) => (a + d + shots.length) % shots.length);
    },
    [],
  );

  const pick = (i: number) => {
    if (i === at) setOpen(true);
    else {
      setDir(i > at || (at === shots.length - 1 && i === 0) ? 1 : -1);
      setAt(i);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Enter") setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, open]);

  const x = useRef<number | null>(null);

  const window5 = [-2, -1, 0, 1, 2].map((o) => (at + o + shots.length) % shots.length);

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[#0d0d0d] text-[#f2f2f2]">
      <p className="px-5 pt-6 font-mono text-xs text-[#8a8a8a]">lab 36 — coverflow</p>
      <div
        className="flex min-h-0 flex-1 items-center justify-center gap-2 px-4"
        style={{ perspective: 1400 }}
        onTouchStart={(e) => (x.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (x.current === null) return;
          const dx = e.changedTouches[0].clientX - x.current;
          if (dx < -50) go(1);
          else if (dx > 50) go(-1);
          x.current = null;
        }}
      >
        {window5.map((i, k) => {
          const o = k - 2;
          const live = o === 0;
          return (
            <button
              key={shots[i].src}
              type="button"
              onClick={() => pick(i)}
              aria-label={live ? `Open frame ${pad(i)} fullscreen` : `Focus frame ${pad(i)}: ${shots[i].alt}`}
              className="flex-none cursor-pointer"
              style={{
                width: live ? "min(58vw, 640px)" : "min(22vw, 240px)",
                transform: `rotateY(${o * -38}deg) translateX(${o * -18}px) scale(${live ? 1 : 0.82})`,
                opacity: live ? 1 : 0.55,
                zIndex: 5 - Math.abs(o),
                transition: "all 0.45s cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={`${i}-${dir}`}
                src={shots[i].src}
                alt={live ? shots[i].alt : ""}
                aria-hidden={!live}
                draggable={false}
                className="block aspect-video w-full rounded-xl object-cover ring-1 ring-white/15"
              />
              {!live && (
                <span
                  aria-hidden
                  className="block aspect-video w-full rounded-xl object-cover opacity-30"
                  style={{ transform: "scaleY(-1)", maskImage: "linear-gradient(to top, black, transparent 70%)", WebkitMaskImage: "linear-gradient(to top, black, transparent 70%)", backgroundImage: `url(${shots[i].src})`, backgroundSize: "cover" }}
                />
              )}
            </button>
          );
        })}
      </div>
      <p className="pb-6 text-center font-mono text-xs text-[#8a8a8a]">
        {pad(at)} / {shots.length}
      </p>
      {open && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setOpen(false)} dark={true} />}
    </main>
  );
}
