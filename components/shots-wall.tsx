"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WarpShot } from "./warp-shot";

type Shot = { src: string; alt: string };
type View = "stack" | "deck";

function shuffled(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Deck offsets — a loose pile, top card straight. Shared rhythm per depth. */
function deckPose(depth: number) {
  if (depth === 0) return { r: 0, x: 0, y: 0 };
  const side = depth % 2 === 0 ? 1 : -1;
  return { r: side * (3 + depth * 2.5), x: side * (14 + depth * 12), y: 6 + depth * 10 };
}

/**
 * The wall in two views. Stack is the masonry run — shufflable,
 * click-to-open; Deck the viewfinder pile that deals itself in
 * and re-deals on tap. No captions, no chips, no counts: one
 * sticky pill with three icons, plus the title above it.
 */
export function ShotsWall({ shots }: { shots: Shot[] }) {
  const [view, setView] = useState<View>("stack");
  const [epoch, setEpoch] = useState(0);
  const [stackOrder, setStackOrder] = useState<number[] | null>(null);
  const [order, setOrder] = useState<number[]>(() => shots.map((_, i) => i));
  const [focus, setFocus] = useState<number | null>(null);

  const displayed = useMemo(
    () =>
      stackOrder && stackOrder.length === shots.length
        ? stackOrder.map((p) => shots[p])
        : shots,
    [shots, stackOrder],
  );

  const shuffle = useCallback(() => {
    setStackOrder(shuffled(shots.length));
    setOrder(shuffled(shots.length));
    setEpoch((e) => e + 1);
  }, [shots.length]);

  const cycle = useCallback(() => {
    setOrder((o) => [...o.slice(1), o[0]]);
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      setFocus((f) =>
        f === null || displayed.length === 0
          ? f
          : (f + dir + displayed.length) % displayed.length,
      );
    },
    [displayed.length],
  );

  /* Drag-to-deal: the top card follows the pointer and flings past a
     threshold. Tap still deals. Reduced motion keeps tap-only. */
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const startRef = useRef<{ x: number; y: number; id: number } | null>(null);
  const flungRef = useRef(false);
  const calm = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onDown = (e: React.PointerEvent) => {
    if (calm()) return;
    startRef.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    flungRef.current = false;
  };
  const onMove = (e: React.PointerEvent) => {
    const s = startRef.current;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.hypot(dx, dy) > 8) flungRef.current = true;
    setDrag({ x: dx, y: dy });
  };
  const onUp = (e: React.PointerEvent) => {
    const s = startRef.current;
    if (!s || s.id !== e.pointerId) return;
    startRef.current = null;
    const dx = e.clientX - s.x;
    setDrag(null);
    if (Math.abs(dx) > 90) cycle();
  };
  const onTap = () => {
    if (flungRef.current) {
      flungRef.current = false;
      return;
    }
    cycle();
  };

  /* Keys: the viewer takes arrows + Esc when open, otherwise arrows deal the deck. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (focus !== null) {
        if (e.key === "Escape") setFocus(null);
        else if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); step(1); }
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); step(-1); }
        return;
      }
      if (view !== "deck") return;
      if (e.key !== "ArrowRight" && e.key !== "ArrowDown" && e.key !== " ") return;
      e.preventDefault();
      cycle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cycle, focus, step, view]);

  /* Lock the page behind the viewer. */
  useEffect(() => {
    if (focus === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [focus]);

  const current = focus !== null ? displayed[focus] : null;

  return (
    <div className="pt-8">
      <p className="text-xs tracking-wide text-[#767676] dark:text-[#8a8a8a]">Shots</p>

      {/* the toolbar — one sticky pill, three icons: wall, deck, shuffle */}
      <div className="sticky top-4 z-30 mb-8 mt-6 flex justify-center" role="group" aria-label="Change the wall view">
        <div className="flex items-center gap-1 rounded-full bg-white/85 p-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-[#e5e5e5] backdrop-blur-md dark:bg-[#1e1e1e]/85 dark:ring-white/10">
          {(["stack", "deck"] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              aria-label={v === "stack" ? "Show wall" : "Show deck"}
              data-tone="tap"
              className={`cursor-pointer rounded-full p-2.5 transition-colors ${
                view === v
                  ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717]"
                  : "text-[#767676] hover:text-[#171717] dark:text-[#8a8a8a] dark:hover:text-white"
              }`}
            >
              {v === "stack" ? (
                <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="2" y1="4" x2="14" y2="4" />
                  <line x1="2" y1="8" x2="14" y2="8" />
                  <line x1="2" y1="12" x2="14" y2="12" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
                  <rect x="4.5" y="4.5" width="9" height="9" rx="2" />
                  <path d="M11.5 4.5v-1a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h1" />
                </svg>
              )}
            </button>
          ))}
          <span aria-hidden className="h-4 w-px bg-[#171717]/10 dark:bg-white/15" />
          <button
            type="button"
            onClick={shuffle}
            aria-label="Shuffle the wall"
            data-tone="shuffle"
            className="cursor-pointer rounded-full p-2.5 text-[#767676] transition-colors hover:text-[#171717] dark:text-[#8a8a8a] dark:hover:text-white"
          >
            <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1.5 5h3l7 6h3" />
              <path d="M1.5 11h3l1.8-1.5M10.7 6.5 12.5 5h2" />
              <path d="M12.5 2.5v2.5h-2.5M12.5 13.5V11H10" />
            </svg>
          </button>
        </div>
      </div>

      {view === "stack" && (
        <div className="columns-2 gap-3 sm:columns-3 sm:gap-4">
          {displayed.map((s, i) => (
            <button
              key={`${epoch}-${s.src}`}
              type="button"
              onClick={() => setFocus(i)}
              aria-label={`Open ${s.alt}`}
              data-tone="tap"
              className="mb-3 block w-full break-inside-avoid cursor-zoom-in text-left sm:mb-4"
            >
              <WarpShot src={s.src} alt={s.alt} eager={i < 3} index={i} />
            </button>
          ))}
        </div>
      )}

      {view === "deck" && (
        <div className="relative mx-auto h-[68vh] max-h-[560px] min-h-[400px] w-full max-w-[420px]">
          {order.map((shotIdx, depth) => {
            const s = shots[shotIdx];
            if (!s) return null;
            const pose = deckPose(Math.min(depth, 5));
            return (
              <div
                key={s.src}
                className={`absolute left-1/2 top-1/2 w-[82%] transition-transform duration-300 ease-[cubic-bezier(0.34,1.35,0.64,1)] motion-reduce:transition-none ${depth === 0 ? "touch-pan-y select-none" : ""}`}
                style={{
                  transform:
                    drag && depth === 0
                      ? `translate(calc(-50% + ${pose.x + drag.x}px), calc(-50% + ${pose.y + drag.y}px)) rotate(${pose.r + drag.x * 0.05}deg)`
                      : `translate(calc(-50% + ${pose.x}px), calc(-50% + ${pose.y}px)) rotate(${pose.r}deg)`,
                  transition: drag && depth === 0 ? "none" : undefined,
                  zIndex: shots.length - depth,
                }}
                onPointerDown={depth === 0 ? onDown : undefined}
                onPointerMove={depth === 0 ? onMove : undefined}
                onPointerUp={depth === 0 ? onUp : undefined}
                onPointerCancel={depth === 0 ? onUp : undefined}
              >
                <button
                  type="button"
                  onClick={depth === 0 ? onTap : cycle}
                  data-tone="shuffle"
                  aria-label={depth === 0 ? "Shots pile — tap to deal the next one" : `Show ${s.alt}`}
                  tabIndex={depth > 2 ? -1 : 0}
                  className="shot-in block w-full cursor-pointer overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] drop-shadow-[0_16px_28px_rgba(0,0,0,0.16)] motion-reduce:animate-none dark:bg-[#1e1e1e] dark:ring-[#2b2b2b] dark:drop-shadow-[0_16px_28px_rgba(0,0,0,0.5)]"
                  style={{ animationDelay: `${Math.min(depth, 10) * 40}ms` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.src}
                    alt=""
                    loading={depth > 1 ? "lazy" : undefined}
                    draggable={false}
                    className="pointer-events-none block max-h-[52vh] w-full object-contain"
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* the viewer — captionless: blurred stage, counter, arrows, Esc */}
      {current !== null && focus !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${current.alt} — ${focus + 1} of ${displayed.length}`}
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
