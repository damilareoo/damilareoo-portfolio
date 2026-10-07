"use client";

import { useMemo, useRef, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");
const GROUPS = [7, 9, 4, 3, 4, 3, 3, 4, 5, 1, 3, 3, 3, 3, 2, 1, 1, 5];

const CELL = 300;
const GAP = 24;

/**
 * Lab 85 — infinite canvas.
 * The set as a map: eighteen project territories on one plane. Drag
 * to travel, scroll to dive from all-64 down to a single frame.
 */
export default function CanvasPage() {
  const [view, setView] = useState({ x: 0, y: 0, z: 0.5 });
  const [at, setAt] = useState<number | null>(null);
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const moved = useRef(false);

  const nodes = useMemo(() => {
    const out: { i: number; x: number; y: number; g: number }[] = [];
    let i = 0;
    const perRow = 6;
    GROUPS.forEach((size, g) => {
      const gx = (g % perRow) * 1150;
      const gy = Math.floor(g / perRow) * 950;
      const cols = Math.ceil(Math.sqrt(size));
      for (let t = 0; t < size && i < shots.length; t++, i++) {
        out.push({
          i,
          g,
          x: gx + (t % cols) * (CELL + GAP),
          y: gy + Math.floor(t / cols) * ((CELL * 9) / 16 + GAP),
        });
      }
    });
    return out;
  }, []);

  const world = useMemo(() => {
    let w = 0;
    let h = 0;
    nodes.forEach((n) => {
      w = Math.max(w, n.x + CELL);
      h = Math.max(h, n.y + CELL);
    });
    return { w, h };
  }, [nodes]);

  const zoomAt = (clientX: number, clientY: number, factor: number) => {
    setView((v) => {
      const z = Math.min(2.5, Math.max(0.12, v.z * factor));
      const k = z / v.z;
      return { z, x: clientX - (clientX - v.x) * k, y: clientY - (clientY - v.y) * k };
    });
  };

  return (
    <main className="relative h-dvh touch-none overflow-hidden bg-[#0d0d0d] text-[#f2f2f2] select-none">
      <p className="absolute left-5 top-6 z-10 font-mono text-xs text-[#8a8a8a]">lab 85 — infinite canvas</p>
      <div className="absolute bottom-6 left-5 z-10 flex items-center gap-2">
        {(["−", "+"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
              zoomAt(window.innerWidth / 2, window.innerHeight / 2, s === "+" ? 1.35 : 1 / 1.35);
              void r;
            }}
            aria-label={s === "+" ? "Zoom in" : "Zoom out"}
            className="h-10 w-10 cursor-pointer rounded-full bg-white/10 font-mono text-lg backdrop-blur-md"
          >
            {s}
          </button>
        ))}
        <button
          type="button"
          onDoubleClick={() => setView({ x: 0, y: 0, z: 0.5 })}
          onClick={() => setView({ x: 0, y: 0, z: 0.5 })}
          aria-label="Reset view"
          className="h-10 w-10 cursor-pointer rounded-full bg-white/10 font-mono text-sm backdrop-blur-md"
        >
          ◎
        </button>
        <span className="ml-2 font-mono text-xs tabular-nums text-[#8a8a8a]">{Math.round(view.z * 100)}%</span>
      </div>
      <div
        className="h-full w-full cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => {
          moved.current = false;
          drag.current = { sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y };
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 5) moved.current = true;
          if (moved.current) setView((v) => ({ ...v, x: d.ox + e.clientX - d.sx, y: d.oy + e.clientY - d.sy }));
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        onWheel={(e) => zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.12 : 1 / 1.12)}
        onDoubleClick={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          zoomAt(e.clientX, e.clientY, 1.6);
        }}
      >
        <div
          className="origin-top-left will-change-transform"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})`, width: world.w, height: world.h }}
        >
          {nodes.map((n) => (
            <button
              key={shots[n.i].src}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (moved.current) return;
                setAt(n.i);
              }}
              aria-label={`Open frame ${pad(n.i)}: ${shots[n.i].alt}`}
              className="absolute cursor-pointer overflow-hidden rounded-lg ring-1 ring-white/15 hover:ring-white/60"
              style={{ left: n.x, top: n.y, width: CELL }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shots[n.i].src} alt="" aria-hidden draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} dark={true} />}
    </main>
  );
}
