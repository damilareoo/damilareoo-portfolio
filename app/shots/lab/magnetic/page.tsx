"use client";

import { useEffect, useRef, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 56 — magnetic cursor.
 * One frame trails the pointer with lag, always a half-step behind.
 * Catch it with a click to go fullscreen. The work plays keep-away.
 */
export default function MagneticPage() {
  const [at, setAt] = useState(0);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const target = useRef({ x: 50, y: 50 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const cur = { x: 50, y: 50 };
    const tick = () => {
      cur.x += (target.current.x - cur.x) * 0.06;
      cur.y += (target.current.y - cur.y) * 0.06;
      setPos({ x: cur.x, y: cur.y });
      raf = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      target.current = { x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 };
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open) return;
      if (e.key === "ArrowRight") setAt((a) => (a + 1) % shots.length);
      else if (e.key === "ArrowLeft") setAt((a) => (a - 1 + shots.length) % shots.length);
      else if (e.key === "Enter") setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open ]);

  return (
    <main className="relative h-dvh overflow-hidden bg-[#0d0d0d] text-[#f2f2f2]">
      <p className="absolute left-5 top-6 z-10 font-mono text-xs text-[#8a8a8a]">lab 56 — magnetic cursor</p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Open frame ${pad(at)} fullscreen: ${shots[at].alt}`}
        className="absolute w-[min(64vw,560px)] cursor-pointer"
        style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={shots[at].src} src={shots[at].src} alt={shots[at].alt} draggable={false} className="pointer-events-none block aspect-video w-full rounded-xl object-cover ring-1 ring-white/15 drop-shadow-[0_24px_48px_rgba(0,0,0,0.5)]" />
      </button>
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3">
        <button type="button" onClick={() => setAt((a) => (a - 1 + shots.length) % shots.length)} aria-label="Previous frame" className="cursor-pointer rounded-full p-2 ring-1 ring-white/15">←</button>
        <span className="font-mono text-xs text-[#8a8a8a]">
          {pad(at)} / {shots.length}
        </span>
        <button type="button" onClick={() => setAt((a) => (a + 1) % shots.length)} aria-label="Next frame" className="cursor-pointer rounded-full p-2 ring-1 ring-white/15">→</button>
      </div>
      {open && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setOpen(false)} dark={true} />}
    </main>
  );
}
