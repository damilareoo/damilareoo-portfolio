"use client";

import { useRef, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 65 — orbit ring.
 * The set strung on an ellipse you drag around: the front frame is
 * full-size, the rest swing behind. A carousel with real geometry.
 */
export default function OrbitPage() {
  const [angle, setAngle] = useState(0);
  const [at, setAt] = useState<number | null>(null);
  const drag = useRef<{ x: number; a: number } | null>(null);

  const N = shots.length;
  const front = ((-Math.round((angle / 360) * N) % N) + N) % N;

  return (
    <main
      className="flex h-dvh flex-col overflow-hidden bg-[#0d0d0d] text-[#f2f2f2]"
      onPointerDown={(e) => (drag.current = { x: e.clientX, a: angle })}
      onPointerMove={(e) => {
        if (drag.current) setAngle(drag.current.a + (e.clientX - drag.current.x) * 0.25);
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
    >
      <p className="px-5 pt-6 font-mono text-xs text-[#8a8a8a]">lab 65 — orbit ring</p>
      <div className="relative min-h-0 flex-1 cursor-grab touch-none select-none active:cursor-grabbing" style={{ perspective: 1200 }}>
        {shots.map((s, i) => {
          const rel = (((i - front) % N) + N) % N;
          const a = (rel / N) * Math.PI * 2;
          const z = Math.cos(a);
          const x = Math.sin(a);
          const w = 200 + z * 130;
          return (
            <button
              key={s.src}
              type="button"
              onClick={() => setAt(i)}
              aria-label={`Open frame ${pad(i)}: ${s.alt}`}
              className="absolute left-1/2 top-1/2 cursor-pointer overflow-hidden rounded-xl ring-1 ring-white/15"
              style={{
                width: w,
                transform: `translate(-50%, -50%) translateX(${(x * 42).toFixed(1)}vw) translateZ(${(z * 260).toFixed(0)}px)`,
                opacity: z > -0.2 ? 1 : 0.25,
                zIndex: Math.round((z + 1) * 50),
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt="" aria-hidden loading="lazy" draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
            </button>
          );
        })}
      </div>
      <p className="pb-6 text-center font-mono text-xs text-[#8a8a8a]">
        {pad(front)} / {shots.length}
      </p>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} dark={true} />}
    </main>
  );
}
