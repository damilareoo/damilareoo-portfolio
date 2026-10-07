"use client";

import { useCallback, useEffect, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 01 — numeric index + preview (TWOMUCH, de-labeled).
 * Rows are pure numbers; the frame follows the active row. No words.
 */
export default function IndexPreviewPage() {
  const [at, setAt] = useState(0);
  const [open, setOpen] = useState(false);

  const move = useCallback(
    (dir: 1 | -1) => setAt((a) => (a + dir + shots.length) % shots.length),
    [],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (open) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        move(1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        move(-1);
      } else if (e.key === "Enter") {
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move, open]);

  const current = shots[at];

  return (
    <main className="mx-auto w-full max-w-[1120px] px-5 py-8">
      <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 01 — numeric index + preview</p>
      <div className="mt-6 grid gap-8 md:grid-cols-[180px_1fr]">
        <ol className="order-2 max-h-[70vh] overflow-y-auto md:order-1">
          {shots.map((s, i) => (
            <li key={s.src}>
              <button
                type="button"
                onMouseEnter={() => setAt(i)}
                onFocus={() => setAt(i)}
                onClick={() => {
                  setAt(i);
                  setOpen(true);
                }}
                aria-label={`Open frame ${pad(i)}: ${s.alt}`}
                className={`block w-full cursor-pointer px-3 py-1 text-left font-mono text-sm transition-colors ${
                  i === at ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717]" : "text-[#767676] hover:text-[#171717] dark:text-[#8a8a8a] dark:hover:text-white"
                }`}
              >
                {pad(i)}
              </button>
            </li>
          ))}
        </ol>
        <div className="order-1 md:order-2">
          <div className="md:sticky md:top-8">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={`Open frame ${pad(at)} fullscreen`}
              className="block w-full cursor-zoom-in overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img key={current.src} src={current.src} alt={current.alt} draggable={false} className="block aspect-video w-full object-cover" />
            </button>
            <p className="mt-3 text-center font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">
              {pad(at)} / {shots.length}
            </p>
          </div>
        </div>
      </div>
      {open && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setOpen(false)} />}
    </main>
  );
}
