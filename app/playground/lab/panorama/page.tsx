"use client";

import { useRef, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 31 — panorama band.
 * One gapless ultra-wide band: no cards, no corners, no gutters —
 * the frames run into each other and you scrub the whole river.
 */
export default function PanoramaPage() {
  const [at, setAt] = useState<number | null>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; sl: number } | null>(null);

  const down = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, sl: bandRef.current ? bandRef.current.scrollLeft : 0 };
  };
  const move = (e: React.PointerEvent) => {
    if (bandRef.current && drag.current) {
      bandRef.current.scrollLeft = drag.current.sl - (e.clientX - drag.current.x) * 1.6;
    }
  };
  const up = () => {
    drag.current = null;
  };
  const tap = (i: number) => {
    if (!drag.current) setAt(i);
  };

  return (
    <main className="flex h-dvh flex-col justify-center overflow-hidden bg-black text-white">
      <p className="px-5 pb-4 font-mono text-xs text-white/50">lab 31 — panorama band</p>
      <div
        ref={bandRef}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        className="flex w-full cursor-ew-resize snap-x snap-mandatory overflow-x-auto"
      >
        {shots.map((s, i) => (
          <button
            key={s.src}
            type="button"
            onClick={() => tap(i)}
            aria-label={`Open frame ${pad(i)}: ${s.alt}`}
            className="h-[62dvh] flex-none cursor-pointer snap-center"
            style={{ width: "min(78vw, 1100px)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt="" aria-hidden loading={i < 3 ? undefined : "lazy"} draggable={false} className="pointer-events-none block h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <p className="pt-4 text-center font-mono text-xs text-white/50">{shots.length} frames</p>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} dark={true} />}
    </main>
  );
}
