"use client";

import { useEffect, useRef, useState } from "react";
import type { LabShots } from "./lab-set";

const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Exploration: spotlight develop (Evervault mask technique).
 * Dark wall; a lerped spotlight trails the cursor and develops
 * whatever it passes over. Tap pins a frame lit; tap again to
 * park it back. Concepts don't open.
 */
export function ExplorationSpotlight({ shots }: { shots: LabShots[] }) {
  const [pinned, setPinned] = useState<Set<number>>(new Set());
  const wallRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -9999, y: -9999 });
  const raf = useRef(0);

  useEffect(() => {
    const wall = wallRef.current;
    if (!wall) return;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
  }, []);

  return (
    <div ref={wallRef} className="relative h-80 overflow-hidden rounded-xl bg-[#0d0d0d]">
      <div className="grid h-full grid-cols-4 gap-1.5 p-1.5 brightness-[0.22]">
        {shots.map((s, i) => (
          <button
            key={s.src}
            type="button"
            onClick={() => {
              setPinned((p) => {
                const next = new Set(p);
                if (next.has(i)) next.delete(i);
                else next.add(i);
                return next;
              });
            }}
            aria-label={pinned.has(i) ? `Park frame ${pad(i)} back` : `Light up frame ${pad(i)}`}
            aria-pressed={pinned.has(i)}
            className={`block h-full w-full cursor-pointer overflow-hidden rounded-lg transition-all duration-500 motion-reduce:transition-none ${
              pinned.has(i) ? "brightness-100" : ""
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt="" aria-hidden loading="lazy" draggable={false} className="pointer-events-none block h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 p-1.5"
        style={{
          WebkitMaskImage: "radial-gradient(140px circle at var(--sx, -9999px) var(--sy, -9999px), black 30%, transparent 70%)",
          maskImage: "radial-gradient(140px circle at var(--sx, -9999px) var(--sy, -9999px), black 30%, transparent 70%)",
        }}
      >
        <div className="grid h-full grid-cols-4 gap-1.5">
          {shots.map((s) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img key={s.src} src={s.src} alt="" aria-hidden loading="lazy" draggable={false} className="block h-full w-full rounded-lg object-cover" />
          ))}
        </div>
      </div>
    </div>
  );
}
