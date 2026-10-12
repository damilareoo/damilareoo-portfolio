"use client";

import { useRef, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

function pilePose(i: number) {
  const r = ((i * 137) % 100) / 100;
  const r2 = ((i * 89) % 100) / 100;
  return { rot: (r - 0.5) * 10, x: (r2 - 0.5) * 36, y: (r - 0.5) * 24 };
}

/**
 * Lab 33 — scatter pile.
 * The set tossed on the table: drag any frame wherever you like, tap
 * to go fullscreen. Your arrangement, your mess, your wall.
 */
export default function ScatterPage() {
  const [at, setAt] = useState<number | null>(null);
  const [moved, setMoved] = useState<Record<number, { x: number; y: number }>>({});
  const drag = useRef<{ i: number; sx: number; sy: number; ox: number; oy: number } | null>(null);

  const down = (i: number, e: React.PointerEvent) => {
    const m = moved[i] ?? { x: 0, y: 0 };
    drag.current = { i, sx: e.clientX, sy: e.clientY, ox: m.x, oy: m.y };
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (Math.hypot(dx, dy) > 6) {
      setMoved((mm) => ({ ...mm, [d.i]: { x: d.ox + dx, y: d.oy + dy } }));
    }
  };
  const up = (e: React.PointerEvent, i: number) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) <= 6) setAt(i);
  };

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 33 — scatter pile</p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3" onPointerMove={move}>
          {shots.map((s, i) => {
            const p = pilePose(i);
            const m = moved[i] ?? { x: 0, y: 0 };
            return (
              <div
                key={s.src}
                onPointerDown={(e) => down(i, e)}
                onPointerUp={(e) => up(e, i)}
                role="button"
                tabIndex={0}
                aria-label={`Move or open frame ${pad(i)}: ${s.alt}`}
                onKeyDown={(e) => e.key === "Enter" && setAt(i)}
                className="cursor-grab touch-none select-none active:cursor-grabbing"
                style={{ transform: `translate(${p.x + m.x}px, ${p.y + m.y}px) rotate(${p.rot}deg)`, zIndex: m.x !== 0 || m.y !== 0 ? 5 : 0 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt="" aria-hidden draggable={false} className="pointer-events-none block aspect-video w-full rounded-lg bg-white object-cover ring-1 ring-[#e0e0e0] drop-shadow-[0_10px_20px_rgba(0,0,0,0.18)] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]" />
              </div>
            );
          })}
        </div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
