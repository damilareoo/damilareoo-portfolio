"use client";

import { useEffect, useRef, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";
import { useReducedMotion } from "@/lib/motion";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 04 — spotlight develop (Evervault mask technique).
 * The wall sits dark; a lerped spotlight trails the cursor and develops
 * whatever it passes over. Touch taps straight into the viewer.
 */
export default function SpotlightPage() {
  const reduced = useReducedMotion();
  const [at, setAt] = useState<number | null>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -9999, y: -9999 });
  const raf = useRef(0);

  useEffect(() => {
    const wall = wallRef.current;
    if (!wall || reduced) return;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

    const cur = { x: -9999, y: -9999 };
    let first = true;
    const onMove = (e: PointerEvent) => {
      const r = wall.getBoundingClientRect();
      target.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const tick = () => {
      if (first) {
        cur.x = target.current.x;
        cur.y = target.current.y;
        first = false;
      }
      cur.x += (target.current.x - cur.x) * 0.12;
      cur.y += (target.current.y - cur.y) * 0.12;
      wall.style.setProperty("--sx", `${cur.x.toFixed(1)}px`);
      wall.style.setProperty("--sy", `${cur.y.toFixed(1)}px`);
      raf.current = requestAnimationFrame(tick);
    };
    wall.addEventListener("pointermove", onMove);
    raf.current = requestAnimationFrame(tick);
    return () => {
      wall.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, [reduced]);

  const lit = reduced;

  return (
    <main className="bg-[#0d0d0d] py-8 text-[#f2f2f2]">
      <p className="px-5 font-mono text-xs text-[#8a8a8a]">lab 04 — spotlight develop</p>
      <div ref={wallRef} className="relative mx-auto mt-6 w-full max-w-[1120px] px-5">
        {/* dim base */}
        <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 ${lit ? "" : "brightness-[0.22]"}`}>
          {shots.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setAt(i)}
              aria-label={`Open frame ${pad(i)}: ${s.alt}`}
              className="block w-full cursor-pointer overflow-hidden rounded-xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt="" aria-hidden loading={i < 6 ? undefined : "lazy"} draggable={false} className="block aspect-video w-full object-cover" />
            </button>
          ))}
        </div>
        {/* full-bright layer, visible only inside the spotlight */}
        {!lit && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 px-5"
            style={{
              WebkitMaskImage: "radial-gradient(240px circle at var(--sx, -9999px) var(--sy, -9999px), black 30%, transparent 70%)",
              maskImage: "radial-gradient(240px circle at var(--sx, -9999px) var(--sy, -9999px), black 30%, transparent 70%)",
            }}
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              {shots.map((s) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img key={s.src} src={s.src} alt="" aria-hidden loading="lazy" draggable={false} className="block aspect-video w-full rounded-xl object-cover" />
              ))}
            </div>
          </div>
        )}
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} dark={true} />}
    </main>
  );
}
