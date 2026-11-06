"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type TouchEvent } from "react";
import { WALL_SEED, orderGroups, projectOf } from "@/lib/wall-order";
import Pic from "./pic";
import { SHOT_DIMENSIONS } from "./shot-dimensions";
import { WarpShot } from "./warp-shot";

type Shot = {
  src: string;
  alt: string;
  caption?: string;
  fit?: "contain";
  /** Animated covers carry their own pixels; stills read the manifest. */
  width?: number;
  height?: number;
};

/**
 * The three density steps. Each is a column count per breakpoint, and the
 * only thing the control moves: which is the whole reason it is allowed to
 * exist. The site's old dial changed type size, which overrode the text size
 * the visitor had already set in their browser — see the note on `html` in
 * globals.css. How many studies fit across a wall is not a preference of
 * theirs in the same way; it is how much of ours they want to see at once.
 */
export type WallSize = "l" | "m" | "s";
export const WALL_SIZES: readonly WallSize[] = ["l", "m", "s"];

export const WALL_COLUMNS: Record<WallSize, string> = {
  l: "columns-1 sm:columns-2 lg:columns-3",
  m: "columns-2 sm:columns-3 lg:columns-4",
  /* Three on a phone, not two. At two columns the small step was an exact
     copy of the medium one — same columns, same requested pixels — so the
     densest setting did nothing on the one screen where screen space is
     scarcest. */
  s: "columns-3 sm:columns-4 lg:columns-6",
};

/** What a tile actually measures, per step and breakpoint, against the wall
   below: the grid sits inside `max-w-[1240px] px-5`, so the column field is
   1200px, 1560px at the 1800 breakpoint and 1760px at 2200, with a 12px gutter
   taken out of each row. `m` carries the numbers the old fixed four-column
   grid had; `l` and `s` are the same arithmetic at three and six columns.

   These have to be the real numbers. They were previously declared as
   "50vw, 280px" for every tile, which was wrong in both directions: the
   browser was choosing a 768px file for a box that needed 1188px on a laptop,
   and the screenshots looked soft until you clicked one and the viewer loaded
   the full-size original. */
export const TILE_SIZES: Record<WallSize, string> = {
  l: "(min-width: 2200px) 579px, (min-width: 1800px) 512px, (max-width: 639px) 92vw, (max-width: 1023px) 47vw, 392px",
  m: "(min-width: 2200px) 431px, (min-width: 1800px) 381px, (max-width: 639px) 46vw, (max-width: 1023px) 31vw, 291px",
  /* 30vw, not 46: three columns at 640 and below. The gutter is 12px and the
     page padding 20px either side, so (100vw - 52px) / 3 lands just under
     30vw. Requesting the two-column file here is how a dense wall goes soft. */
  s: "(min-width: 2200px) 283px, (min-width: 1800px) 250px, (max-width: 639px) 30vw, (max-width: 1023px) 23vw, 190px",
};
const VIEWER_SIZES = "(min-width: 1280px) 1184px, calc(100vw - 32px)";

/** The plate's own shape, from the manifest the importer writes. A tile with
    no entry still renders — it just cannot reserve its box, so the column
    reflows when the image lands. */
export function shotBox(src: string): { width: number; height: number } | null {
  const d = SHOT_DIMENSIONS[src];
  return d ? { width: d[0], height: d[1] } : null;
}

/**
 * The wall — every study at its own shape.
 *
 * The plates are art-directed, not screenshots: a card centred on a dotted
 * ground, a device on white, a full-bleed poster. The composition *is* the
 * design, so the grid cannot crop it. This used to force `aspect-video` on
 * all of them, which cut the margins that make a plate look deliberate and
 * sliced the portrait and square studies down to a strip. Multicolumn keeps
 * each ratio and still packs a dense, even field.
 *
 * What a tile is, it says on hover — the caption used to live only inside the
 * viewer, so 71 studies went past unlabelled. On a device that cannot hover
 * the caption would have to sit on every tile at once, which on a three-column
 * phone wall is a caption over the art rather than a label for it; there it
 * waits for the tap instead and is drawn in the viewer.
 */
export function ShotsWall({ shots }: { shots: Shot[] }) {
 const [focus, setFocus] = useState<number | null>(null);
 const [previous, setPrevious] = useState<number | null>(null);
 const [loaded, setLoaded] = useState(false);
 const [size, setSize] = useState<WallSize>("m");
 const focusRef = useRef<number | null>(null);
 const loadedRef = useRef(false);
 const [seed, setSeed] = useState(WALL_SEED);
 const ordered = useMemo(() => orderGroups(shots, seed), [shots, seed]);
 const projectCount = useMemo(() => new Set(ordered.map(projectOf)).size, [ordered]);

 const openShot = useCallback((i: number) => {
 focusRef.current = i;
 loadedRef.current = false;
 setPrevious(null);
 setLoaded(false);
 setFocus(i);
 }, []);

 const closeViewer = useCallback(() => {
 focusRef.current = null;
 loadedRef.current = false;
 setPrevious(null);
 setLoaded(false);
 setFocus(null);
 }, []);

 const step = useCallback(
 (dir: 1 | -1) => {
 const f = focusRef.current;
 if (f === null || ordered.length < 2) return;
 const next = (f + dir + ordered.length) % ordered.length;
 focusRef.current = next;
 /* Hold the last painted shot behind the incoming one. If the previous
    move has not decoded yet, keep the frame before it rather than showing
    an empty stage while this one loads. */
 if (loadedRef.current) setPrevious(f);
 loadedRef.current = false;
 setLoaded(false);
 setFocus(next);
 },
 [ordered.length],
 );

 /* A phone has no arrow keys, so the same moves are a horizontal swipe and a
    downward swipe to close. The page behind is already scroll-locked, which
    is what makes the vertical gesture unambiguous. */
 const touchStart = useRef<{ x: number; y: number } | null>(null);
 const dialogRef = useRef<HTMLDivElement>(null);
 const returnFocus = useRef<HTMLElement | null>(null);
 const restoreFocusRaf = useRef(0);
 const onTouchStart = (e: TouchEvent) => {
 const t = e.touches[0];
 touchStart.current = { x: t.clientX, y: t.clientY };
 };
 const onTouchEnd = (e: TouchEvent) => {
 const start = touchStart.current;
 touchStart.current = null;
 if (!start) return;
 const t = e.changedTouches[0];
 const dx = t.clientX - start.x;
 const dy = t.clientY - start.y;
 if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.2) {
 step(dx < 0 ? 1 : -1);
 } else if (dy > 80 && Math.abs(dy) > Math.abs(dx)) {
 closeViewer();
 }
 };

 /* Keys: the viewer takes arrows + Esc when open. Capture phase, because
    CaseKeys also listens on window for Esc (to go home) and was registered
    first; without stopping the event here, closing the viewer also left the
    page. Tab is deliberately left alone for the dialog's focus trap. */
 useEffect(() => {
 if (focus === null) return;
 const onKey = (e: KeyboardEvent) => {
 const t = e.target as HTMLElement | null;
 if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
 if (e.key === "Escape") {
 e.preventDefault();
 e.stopImmediatePropagation();
 closeViewer();
 } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
 e.preventDefault();
 e.stopImmediatePropagation();
 step(1);
 } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
 e.preventDefault();
 e.stopImmediatePropagation();
 step(-1);
 }
 };
 window.addEventListener("keydown", onKey, true);
 return () => window.removeEventListener("keydown", onKey, true);
 }, [focus, step, closeViewer]);

 /* Lock the page behind the viewer. This used to write the previous value
    straight back, so a swipe over the overlay scrolled the wall underneath
    and the shot appeared to drift out of place on a phone. */
 useEffect(() => {
 if (focus === null) return;
 const prev = document.body.style.overflow;
 document.body.style.overflow = "hidden";
 return () => {
 document.body.style.overflow = prev;
 };
 }, [focus]);

 /* The viewer is a modal: put focus inside it on open and give it back to the
    tile that opened it on close. Without this, Tab walked the wall behind the
    overlay and Enter could swap the shot the user thought they were done with. */
 const isOpen = focus !== null;
 useEffect(() => {
 if (!isOpen) return;
 cancelAnimationFrame(restoreFocusRaf.current);
 if (!returnFocus.current) returnFocus.current = document.activeElement as HTMLElement | null;
 dialogRef.current?.focus();
 return () => {
 const target = returnFocus.current;
 returnFocus.current = null;
 // Wait for the dialog to leave the DOM; focusing during the close event
 // let the browser drop focus back to <body> a tick later.
 restoreFocusRaf.current = requestAnimationFrame(() => {
 restoreFocusRaf.current = 0;
 target?.focus();
 });
 };
 }, [isOpen]);

 const onDialogKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
 if (e.key !== "Tab") return;
 const root = dialogRef.current;
 if (!root) return;
 const focusable = Array.from(
 root.querySelectorAll<HTMLElement>("button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])"),
 ).filter((el) => el.offsetParent !== null);
 if (focusable.length === 0) return;
 const first = focusable[0];
 const last = focusable[focusable.length - 1];
 const active = document.activeElement;
 if (e.shiftKey && (active === first || active === root)) {
 e.preventDefault();
 last.focus();
 } else if (!e.shiftKey && active === last) {
 e.preventDefault();
 first.focus();
 }
 };

 const current = focus !== null ? (ordered[focus] ?? null) : null;
 const previousShot = previous !== null ? (ordered[previous] ?? null) : null;
 const neighborIndices =
 focus === null || ordered.length < 2
 ? []
 : [
 ...new Set([
 (focus - 1 + ordered.length) % ordered.length,
 (focus + 1) % ordered.length,
 ]),
 ].filter((i) => i !== focus && i !== previous);

 return (
 <div className="pt-8">
 <p className="text-xs tracking-wide text-ink-3">[Playground]</p>
 <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
 <p className="font-sans text-sm text-ink-2">
 {shots.length} studies across {projectCount} projects, each at the shape it was
 drawn in. Hover a tile for what it is; click to open.
 </p>
 {/* Full width on a phone, where the description has already taken the row
     and a left-clustered control block reads as a stray. Shuffle pulls to the
     far edge instead. */}
 <div className="flex w-full shrink-0 items-center justify-between gap-2 sm:w-auto sm:justify-start">
 <span aria-hidden className="font-sans text-2xs tracking-wide text-ink-3">SIZE</span>
 <span
 role="radiogroup"
 aria-label="Tile size"
 className="flex items-center gap-0.5 rounded-full p-1 ring-1 ring-line"
 >
 {WALL_SIZES.map((z) => (
 <button
 key={z}
 type="button"
 role="radio"
 aria-checked={size === z}
 onClick={() => setSize(z)}
 aria-label={`${z === "l" ? "Large" : z === "m" ? "Medium" : "Small"} tiles`}
 data-tone="tap"
 className={`grid min-h-8 min-w-8 cursor-pointer place-items-center rounded-full font-sans text-xs transition-colors [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11 ${
 size === z ? "bg-ink text-bg" : "text-ink-2 hover:text-ink"
 }`}
 >
 {z.toUpperCase()}
 </button>
 ))}
 </span>
 <button
 type="button"
 onClick={() => setSeed(Math.floor(Math.random() * 0xffffffff))}
 aria-label="Shuffle the wall"
 data-tone="tap"
 className="ml-1 flex shrink-0 cursor-pointer items-center rounded-full px-3 py-1.5 font-sans text-xs text-ink-2 ring-1 ring-line transition-colors [@media(pointer:coarse)]:min-h-11 hover:text-ink"
 >
 Shuffle
 </button>
 </div>
 </div>

 <div className={`mt-6 gap-3 ${WALL_COLUMNS[size]}`}>
 {ordered.map((s, i) => {
 const box = s.width && s.height ? { width: s.width, height: s.height } : shotBox(s.src);
 return (
 <button
 key={s.src}
 type="button"
 onClick={(e) => {
 returnFocus.current = e.currentTarget;
 openShot(i);
 }}
 aria-label={`Open ${s.alt}${s.caption ? ` — ${s.caption}` : ""}`}
 data-tone="tap"
 className="group relative mb-3 block w-full cursor-zoom-in break-inside-avoid overflow-hidden bg-surface-2 text-left"
 >
 <WarpShot
                  src={s.src}
                  alt={s.alt}
                  eager={i < 6}
                  index={i}
                  fit={s.fit}
                  sizes={TILE_SIZES[size]}
                  {...box}
                />
 {s.caption && (
 <span
 aria-hidden
 className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center px-2 pb-2 opacity-0 mix-blend-difference transition-opacity duration-150 ease-out motion-reduce:transition-none group-hover:opacity-100 group-focus-visible:opacity-100 sm:px-3"
 >
 {/* No plate behind it: the caption sits on the artwork, so white under
     `difference` inverts against whatever is beneath and stays legible on
     a white plate and a black one alike. On the three-column phone wall
     there is no room to wrap, so it truncates — the full line is in the
     tile's label and in the viewer. */}
 <span className="truncate font-sans text-xs text-white">{s.caption}</span>
 </span>
 )}
 </button>
 );
 })}
 </div>

 {/* the viewer — washed stage, counter, arrows, Esc. The tile's caption is
     drawn here instead of over the art, so a label is something you ask for
     by opening a shot, not something every tile wears at once. */}
 {current !== null && focus !== null && (
 <div
 ref={dialogRef}
 role="dialog"
 aria-modal="true"
 aria-label={`${current.alt} — ${focus + 1} of ${ordered.length}`}
 tabIndex={-1}
 onKeyDown={onDialogKeyDown}
 className="fixed inset-0 z-50 flex h-dvh items-center justify-center overflow-hidden overscroll-contain outline-none"
 >
 <div
 className="absolute inset-0 overflow-hidden bg-bg dark:bg-black"
 onClick={() => closeViewer()}
 aria-hidden
 >
 {/* The shot's own colours fill the stage on a phone, where a 16:9 frame
     otherwise floats in a lot of empty page. Decorative only. The
     outgoing wash stays behind the incoming one so the whole stage does
     not flash when the shot changes. */}
 <div className="absolute inset-0">
 {previousShot !== null && (
 <Pic
 key={previousShot.src}
 src={previousShot.src}
 alt=""
 draggable={false}
 loading="eager"
 fetchPriority="low"
 sizes="240px"
 className={`absolute inset-0 h-full w-full scale-110 object-cover blur-3xl saturate-150 transition-opacity duration-200 ease-out motion-reduce:transition-none ${loaded ? "opacity-0" : "opacity-60"}`}
 />
 )}
 <Pic
 key={current.src}
 src={current.src}
 alt=""
 draggable={false}
 loading="eager"
 fetchPriority="low"
 sizes="240px"
 className={`absolute inset-0 h-full w-full scale-110 object-cover blur-3xl saturate-150 transition-opacity duration-200 ease-out motion-reduce:transition-none ${loaded ? "opacity-60" : "opacity-0"}`}
 />
 </div>
 <div className="absolute inset-0 bg-bg/35 dark:bg-black/45" />
 </div>
 {/* Decode the shots on either side of the current one before they are
     needed. The viewer holds the last frame until the next one has
     decoded, but this is what makes the step feel instant instead of
     merely non-blank. */}
 {neighborIndices.length > 0 && (
 <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-px w-px overflow-hidden opacity-0">
 {neighborIndices.map((i) => (
 <Pic
 key={ordered[i].src}
 src={ordered[i].src}
 alt=""
 draggable={false}
 loading="eager"
 fetchPriority="low"
 sizes={VIEWER_SIZES}
 onLoad={(e) => {
 const img = e.currentTarget;
 if (typeof img.decode === "function") void img.decode().catch(() => {});
 }}
 className="h-px w-px"
 />
 ))}
 </div>
 )}
 <div
 className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col items-start gap-2 px-4 py-4 sm:hidden"
 style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
 >
 <span className="rounded-full bg-surface/85 px-2.5 py-1 font-sans text-xs text-ink-2 ring-1 ring-line backdrop-blur-md dark:bg-black/50 dark:ring-white/10">
 {focus + 1} / {ordered.length}
 </span>
 {current.caption && (
 <span className="max-w-[80vw] truncate rounded-full bg-surface/85 px-2.5 py-1 font-sans text-xs text-ink-2 ring-1 ring-line backdrop-blur-md dark:bg-black/50 dark:ring-white/10">
 {current.caption}
 </span>
 )}
 </div>
 <figure
 onTouchStart={onTouchStart}
 onTouchEnd={onTouchEnd}
 onTouchCancel={() => { touchStart.current = null; }}
 className="relative z-10 flex max-h-[86dvh] w-full flex-col items-center px-4"
 >
 <div className="relative flex w-full items-center justify-center">
 {previousShot !== null && (
 <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
 <Pic
 key={previousShot.src}
 src={previousShot.src}
 alt=""
 draggable={false}
 loading="eager"
 fetchPriority="low"
 sizes={VIEWER_SIZES}
 className={`max-h-[74dvh] w-auto max-w-[calc(100vw-32px)] rounded-xl object-contain ring-1 ring-line drop-shadow-[0_24px_48px_rgba(0,0,0,0.24)] transition-opacity duration-200 ease-out motion-reduce:transition-none ${loaded ? "opacity-0" : "opacity-100"}`}
 />
 </div>
 )}
 <Pic
 key={current.src}
 src={current.src}
 alt={current.alt}
 draggable={false}
 loading="eager"
 fetchPriority="high"
 sizes={VIEWER_SIZES}
 onLoad={(e) => {
 const img = e.currentTarget;
 const show = () => {
 if (focusRef.current !== focus) return;
 loadedRef.current = true;
 setLoaded(true);
 };
 const decoded = typeof img.decode === "function" ? img.decode().catch(() => {}) : Promise.resolve();
 void decoded.then(show);
 }}
 className={`relative z-10 max-h-[74dvh] w-auto max-w-[calc(100vw-32px)] rounded-xl object-contain ring-1 ring-line drop-shadow-[0_24px_48px_rgba(0,0,0,0.24)] transition-opacity duration-200 ease-out motion-reduce:transition-none ${loaded ? "opacity-100" : "opacity-0"}`}
 />
 </div>
 <figcaption className="mt-4 hidden items-center gap-2 sm:flex">
 {current.caption && (
 <span className="max-w-[40ch] truncate rounded-full bg-surface/85 px-3 py-1.5 font-sans text-xs text-ink-2 ring-1 ring-line backdrop-blur-md dark:bg-black/50 dark:ring-white/10">
 {current.caption}
 </span>
 )}
 <span className="flex items-center gap-1 rounded-full bg-surface/85 p-1 ring-1 ring-line backdrop-blur-md dark:ring-white/10">
 <button
 type="button"
 onClick={() => step(-1)}
 aria-label="Previous shot"
 data-tone="tap"
 className="grid min-h-11 min-w-11 cursor-pointer place-items-center rounded-full text-ink-2 transition-colors hover:text-ink dark:hover:text-ink"
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
 className="grid min-h-11 min-w-11 cursor-pointer place-items-center rounded-full text-ink-2 transition-colors hover:text-ink dark:hover:text-ink"
 >
 <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
 <path d="m6 3 5 5-5 5" />
 </svg>
 </button>
 </span>
 <span className="rounded-full bg-surface/85 p-1 ring-1 ring-line backdrop-blur-md dark:ring-white/10">
 <button
 type="button"
 onClick={() => closeViewer()}
 aria-label="Close viewer"
 data-tone="tap"
 className="grid min-h-11 min-w-11 cursor-pointer place-items-center rounded-full text-ink-2 transition-colors hover:text-ink dark:hover:text-ink"
 >
 <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
 <path d="M3 3l10 10M13 3 3 13" />
 </svg>
 </button>
 </span>
 </figcaption>
 </figure>
 <div
 className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center sm:hidden"
 style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
 >
 <div className="pointer-events-auto flex items-center gap-1">
 <span className="flex items-center gap-1 rounded-full bg-surface/85 p-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-line backdrop-blur-md dark:bg-black/50 dark:ring-white/10">
 <button
 type="button"
 onClick={() => step(-1)}
 aria-label="Previous shot"
 data-tone="tap"
 className="grid min-h-11 min-w-11 cursor-pointer place-items-center rounded-full text-ink-2 transition-colors hover:text-ink dark:hover:text-ink"
 >
 <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
 <path d="M10 3 5 8l5 5" />
 </svg>
 </button>
 <button
 type="button"
 onClick={() => step(1)}
 aria-label="Next shot"
 data-tone="tap"
 className="grid min-h-11 min-w-11 cursor-pointer place-items-center rounded-full text-ink-2 transition-colors hover:text-ink dark:hover:text-ink"
 >
 <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
 <path d="m6 3 5 5-5 5" />
 </svg>
 </button>
 </span>
 <span className="rounded-full bg-surface/85 p-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-line backdrop-blur-md dark:bg-black/50 dark:ring-white/10">
 <button
 type="button"
 onClick={() => closeViewer()}
 aria-label="Close viewer"
 data-tone="tap"
 className="grid min-h-11 min-w-11 cursor-pointer place-items-center rounded-full text-ink-2 transition-colors hover:text-ink dark:hover:text-ink"
 >
 <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
 <path d="M3 3l10 10M13 3 3 13" />
 </svg>
 </button>
 </span>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
