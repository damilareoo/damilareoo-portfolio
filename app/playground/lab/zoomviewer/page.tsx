"use client";

import { useEffect, useRef, useState } from "react";
import { dossier } from "@/data/dossier";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 77 — zoom viewer.
 * Fullscreen with a loupe built in: scroll to magnify up to 4×, drag
 * to pan the grain. For reading the craft, not the composition.
 */
export default function ZoomviewerPage() {
  const [at, setAt] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setAt((a) => (a + 1) % shots.length);
      } else if (e.key === "ArrowLeft") {
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setAt((a) => (a - 1 + shots.length) % shots.length);
      } else if (e.key === "0") {
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-black text-white">
      <p className="px-5 pt-6 font-mono text-xs text-white/50">lab 77 — zoom viewer</p>
      <div
        className="min-h-0 flex-1 cursor-move touch-none overflow-hidden px-5"
        onWheel={(e) => setZoom((z) => Math.min(4, Math.max(1, z - e.deltaY * 0.002)))}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, y: e.clientY, ox: pan.x, oy: pan.y };
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (drag.current) setPan({ x: drag.current.ox + e.clientX - drag.current.x, y: drag.current.oy + e.clientY - drag.current.y });
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        onDoubleClick={() => {
          setZoom(1);
          setPan({ x: 0, y: 0 });
        }}
      >
        <div className="flex h-full items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={shots[at].src}
            src={shots[at].src}
            alt={shots[at].alt}
            draggable={false}
            className="pointer-events-none max-h-full w-auto max-w-none rounded-xl object-contain ring-1 ring-white/10"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
          />
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-[560px] items-center gap-4 px-5 pb-6">
        <button
          type="button"
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
            setAt((a) => (a - 1 + shots.length) % shots.length);
          }}
          aria-label="Previous frame"
          className="cursor-pointer rounded-full p-2 ring-1 ring-white/15"
        >
          ←
        </button>
        <input
          type="range"
          min={1}
          max={4}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          aria-label="Zoom level"
          className="flex-1 cursor-pointer accent-white"
        />
        <button
          type="button"
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
            setAt((a) => (a + 1) % shots.length);
          }}
          aria-label="Next frame"
          className="cursor-pointer rounded-full p-2 ring-1 ring-white/15"
        >
          →
        </button>
        <span className="font-mono text-xs text-white/50">
          {pad(at)} · {zoom.toFixed(1)}×
        </span>
      </div>
    </main>
  );
}
