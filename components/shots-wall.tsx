"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WarpShot } from "./warp-shot";

type Shot = { src: string; alt: string };
type View = "grid" | "compass";

const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * The wall, two quiet modes. Grid is the masonry run, click-to-open;
 * Compass is a dial that walks all 64 — angle maps to position, the
 * stage shows where you are. One sticky pill at the bottom holds both.
 * No captions, no chips, no counts on the wall itself.
 */
export function ShotsWall({ shots }: { shots: Shot[] }) {
  const [view, setView] = useState<View>("grid");
  const [focus, setFocus] = useState<number | null>(null);
  const [dial, setDial] = useState(0);
  const dragging = useRef(false);

  const step = useCallback(
    (dir: 1 | -1) => {
      if (view === "compass" && focus === null) {
        setDial((d) => (d + dir + shots.length) % shots.length);
        return;
      }
      setFocus((f) =>
        f === null || shots.length === 0
          ? f
          : (f + dir + shots.length) % shots.length,
      );
    },
    [shots.length, view, focus],
  );

  /* Keys: arrows step, Esc closes. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.key === "Escape") setFocus(null);
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); step(1); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); step(-1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  /* Lock the page behind the viewer. */
  useEffect(() => {
    if (focus === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = prev;
    return () => {
      document.body.style.overflow = prev;
    };
  }, [focus]);

  const fromAngle = useCallback(
    (clientX: number, clientY: number, el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      const dx = clientX - (r.left + r.width / 2);
      const dy = clientY - (r.top + r.height / 2);
      let a = Math.atan2(dy, dx) + Math.PI / 2;
      if (a < 0) a += Math.PI * 2;
      setDial(Math.floor((a / (Math.PI * 2)) * shots.length) % shots.length);
    },
    [shots.length],
  );

  const current = focus !== null ? shots[focus] : null;
  const staged = shots[dial];

  return (
    <div className="pt-8">
      <p className="text-xs tracking-wide text-[#767676] dark:text-[#8a8a8a]">Shots</p>

      {view === "grid" && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {shots.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setFocus(i)}
              aria-label={`Open ${s.alt}`}
              data-tone="tap"
              className="block w-full cursor-zoom-in overflow-hidden rounded-xl bg-white text-left ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
            >
              <span className="pointer-events-none block aspect-video w-full">
                <WarpShot src={s.src} alt={s.alt} eager={i < 3} index={i} />
              </span>
            </button>
          ))}
        </div>
      )}

      {view === "compass" && staged && (
        <div className="mt-6 flex flex-col items-center">
          <button
            type="button"
            onClick={() => setFocus(dial)}
            aria-label={`Open frame ${pad(dial)} fullscreen`}
            data-tone="tap"
            className="block w-full cursor-zoom-in overflow-hidden rounded-2xl bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={staged.src} src={staged.src} alt={staged.alt} draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
          </button>
          <div
            role="slider"
            tabIndex={0}
            aria-label={`Frame ${pad(dial)} of ${shots.length}`}
            aria-valuemin={1}
            aria-valuemax={shots.length}
            aria-valuenow={dial + 1}
            onPointerDown={(e) => {
              dragging.current = true;
              (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              fromAngle(e.clientX, e.clientY, e.currentTarget);
            }}
            onPointerMove={(e) => dragging.current && fromAngle(e.clientX, e.clientY, e.currentTarget)}
            onPointerUp={() => (dragging.current = false)}
            onPointerCancel={() => (dragging.current = false)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); step(1); }
              else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); step(-1); }
            }}
            className="relative mt-6 h-36 w-36 cursor-pointer touch-none rounded-full ring-1 ring-[#e5e5e5] dark:ring-white/10"
          >
            <span
              aria-hidden
              className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-[#171717] dark:bg-white"
              style={{ transform: `rotate(${(dial / shots.length) * 360}deg) translateY(-62px) translate(-50%, -50%)` }}
            />
            <span aria-hidden className="absolute inset-0 flex items-center justify-center font-mono text-sm tabular-nums">
              {pad(dial)}
            </span>
          </div>
        </div>
      )}

      {/* one sticky pill at the bottom: grid, compass */}
      <div className="sticky bottom-6 z-30 mt-8 flex justify-center" role="group" aria-label="Change the wall view">
        <div className="flex items-center gap-1 rounded-full bg-white/85 p-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-[#e5e5e5] backdrop-blur-md dark:bg-[#1e1e1e]/85 dark:ring-white/10">
          {(["grid", "compass"] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              aria-label={v === "grid" ? "Show wall" : "Show compass"}
              data-tone="tap"
              className={`cursor-pointer rounded-full p-2.5 transition-colors ${
                view === v
                  ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717]"
                  : "text-[#767676] hover:text-[#171717] dark:text-[#8a8a8a] dark:hover:text-white"
              }`}
            >
              {v === "grid" ? (
                <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="2" y1="4" x2="14" y2="4" />
                  <line x1="2" y1="8" x2="14" y2="8" />
                  <line x1="2" y1="12" x2="14" y2="12" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="8" cy="8" r="6" />
                  <path d="M10.5 5.5 8.8 8.8 5.5 10.5 7.2 7.2Z" fill="currentColor" stroke="none" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* the viewer — captionless: blurred stage, counter, arrows, Esc */}
      {current !== null && focus !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${current.alt} — ${focus + 1} of ${shots.length}`}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-[#fafafa]/90 backdrop-blur-md dark:bg-black/80"
            onClick={() => setFocus(null)}
          />
          <figure className="relative z-10 mx-4 flex max-h-[86vh] flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current.src}
              src={current.src}
              alt={current.alt}
              draggable={false}
              className="shot-in max-h-[74vh] w-auto max-w-[92vw] rounded-xl object-contain ring-1 ring-[#e0e0e0] drop-shadow-[0_24px_48px_rgba(0,0,0,0.24)] dark:ring-[#2b2b2b]"
            />
            <figcaption className="mt-4 flex items-center gap-3">
              <span className="flex items-center gap-1 rounded-full bg-white/85 p-1 ring-1 ring-[#e5e5e5] backdrop-blur-md dark:bg-[#1e1e1e]/85 dark:ring-white/10">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous shot"
                  data-tone="tap"
                  className="cursor-pointer rounded-full p-2 text-[#424242] transition-colors hover:text-[#171717] dark:text-[#b8b8b8] dark:hover:text-white"
                >
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 3 5 8l5 5" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next shot"
                  data-tone="tap"
                  className="cursor-pointer rounded-full p-2 text-[#424242] transition-colors hover:text-[#171717] dark:text-[#b8b8b8] dark:hover:text-white"
                >
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 3 5 5-5 5" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setFocus(null)}
                  aria-label="Close viewer"
                  data-tone="tap"
                  className="cursor-pointer rounded-full p-2 text-[#424242] transition-colors hover:text-[#171717] dark:text-[#b8b8b8] dark:hover:text-white"
                >
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M3 3l10 10M13 3 3 13" />
                  </svg>
                </button>
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}
