"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type TouchEvent } from "react";
import Pic from "./pic";
import { PIC_FULL } from "./pic-manifest";
import { WarpShot } from "./warp-shot";

type Shot = { src: string; alt: string; caption?: string; fit?: "contain" };

/** Project groups with at least this many studies open the wall with a
 double-size lead tile — rhythm with an editorial reason, not decoration. */
export const LEAD_MIN = 3;

/** A lead is twice the size of a tile, so it needs real pixels: a 900px cover
    blown up to 874px at 2x was the softest thing on the wall. The lead is the
    first study in the group at least this wide, falling back to the first. */
export const LEAD_WIDTH_MIN = 1600;

export function projectOf(s: { alt: string; caption?: string }): string {
 return (s.caption ?? s.alt).split("—")[0].trim().toLowerCase();
}

/** The wall's shuffle. Each project keeps its studies in order, but the
 *  projects are dealt out against each other rather than run end to end, so
 *  the grid mixes studios instead of showing seven Vienna tiles in a row and
 *  then seven Intempus ones.
 *
 *  Two rules, both of them about evenness rather than taste:
 *
 *    Deterministic. Random at render would split server from client, so the
 *    seed is written down — same wall for everyone, every visit.
 *
 *    Deal the biggest remaining pile that is not the project you just used.
 *    Largest-first spreads the long groups evenly instead of letting them
 *    clump, and the no-repeat rule is what stops two studies from the same
 *    project landing side by side. It only gives in when the same project is
 *    genuinely the only one left, which is what a group larger than half the
 *    wall would force.
 */
export const WALL_SEED = 1234;

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function orderGroups<T extends { alt: string; caption?: string }>(shots: T[], seed = WALL_SEED): T[] {
  const groups = new Map<string, T[]>();
  for (const s of shots) {
    const p = projectOf(s);
    if (!groups.has(p)) groups.set(p, []);
    groups.get(p)!.push(s);
  }

  const piles = [...groups.values()];
  const rand = mulberry32(seed);
  for (let i = piles.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [piles[i], piles[j]] = [piles[j], piles[i]];
  }

  const cursor = new Array<number>(piles.length).fill(0);
  const out: T[] = [];
  let last = -1;

  while (out.length < shots.length) {
    /* Candidates are every project with studies left, minus the one we have
       just used — that exclusion is what stops two studies from the same
       project landing side by side. It is dropped only when the same project
       is genuinely all that remains, which a group of more than half the wall
       would force. */
    let candidates = piles.map((_, i) => i).filter((i) => piles[i].length - cursor[i] > 0 && i !== last);
    if (candidates.length === 0) {
      candidates = piles.map((_, i) => i).filter((i) => piles[i].length - cursor[i] > 0);
    }
    if (candidates.length === 0) break;

    /* Weighted by what each project still has left, so a long group appears
       more often across the wall but never twice in a row. Picking the
       outright biggest every time would be even but mechanical: it opens
       sylvan, intempus, sylvan, intempus... */
    const total = candidates.reduce((n, i) => n + (piles[i].length - cursor[i]), 0);
    let roll = rand() * total;
    let pick = candidates[candidates.length - 1];
    for (const i of candidates) {
      roll -= piles[i].length - cursor[i];
      if (roll <= 0) {
        pick = i;
        break;
      }
    }

    out.push(piles[pick][cursor[pick]++]);
    last = pick;
  }

  return out;
}

/** One boolean per shot: true for the lead tile of each qualifying group. */
export function leadsFor(
 shots: { alt: string; caption?: string; src?: string }[],
 min = LEAD_MIN,
 widthOf: (s: { src?: string }) => number = () => Number.POSITIVE_INFINITY,
): boolean[] {
 const counts = new Map<string, number>();
 for (const s of shots) counts.set(projectOf(s), (counts.get(projectOf(s)) ?? 0) + 1);
 const first = new Map<string, number>();
 const chosen = new Map<string, number>();
 for (let i = 0; i < shots.length; i++) {
 const p = projectOf(shots[i]);
 if ((counts.get(p) ?? 0) < min) continue;
 if (!first.has(p)) first.set(p, i);
 if (!chosen.has(p) && widthOf(shots[i]) >= LEAD_WIDTH_MIN) chosen.set(p, i);
 }
 for (const [p, i] of first) if (!chosen.has(p)) chosen.set(p, i);
 return shots.map((s, i) => chosen.get(projectOf(s)) === i);
}

/** What a tile actually measures, per breakpoint, against the grid below:
   two columns under 640px, three to 1024px, four inside a max-w-[1240px]
   container above it. A normal tile is one cell; a lead spans two in both
   directions and so needs roughly double.

   These have to be the real numbers. They were previously declared as
   "50vw, 280px" for every tile, which was wrong in both directions: on a
   phone a tile is about 46vw of the viewport rather than 50 of a
   half-width, and a lead is twice that, so the browser was choosing a 768px
   file for a box that needed 1188px on a laptop and 1050px on a phone. The
   screenshots looked soft until you clicked one and the viewer loaded the
   full-size original. */
export const TILE_SIZES =
  "(min-width: 2200px) 431px, (min-width: 1800px) 381px, (max-width: 639px) 46vw, (max-width: 1023px) 31vw, 310px";
export const LEAD_SIZES =
  "(min-width: 2200px) 874px, (min-width: 1800px) 774px, (max-width: 639px) 94vw, (max-width: 1023px) 62vw, 594px";
const VIEWER_SIZES = "(min-width: 1280px) 1184px, calc(100vw - 32px)";

/**
 * The wall — studies filed by project, click-to-open. One intro line,
 * a jump list, then a section per project with the same bracket labels
 * the site already uses. Same masonry tiles, same viewer; the sections
 * only say what the clusters already were.
 */
export function ShotsWall({ shots }: { shots: Shot[] }) {
 const [focus, setFocus] = useState<number | null>(null);
 const [previous, setPrevious] = useState<number | null>(null);
 const [loaded, setLoaded] = useState(false);
 const focusRef = useRef<number | null>(null);
 const loadedRef = useRef(false);
 const [seed, setSeed] = useState(WALL_SEED);
 const ordered = useMemo(() => orderGroups(shots, seed), [shots, seed]);
 const leads = leadsFor(ordered, LEAD_MIN, (s) => (s.src ? PIC_FULL[s.src] ?? 0 : 0));

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
 <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
 <p className="font-sans text-sm text-ink-2">
 Interface studies, visual experiments, and ideas in progress. Click any tile to open.
 </p>
 {process.env.NODE_ENV !== "production" && (
 <button
 type="button"
 onClick={() => setSeed(Math.floor(Math.random() * 0xffffffff))}
 aria-label="Shuffle the wall"
 data-tone="tap"
 className="shrink-0 cursor-pointer rounded-full px-3 py-1.5 font-mono text-xs text-ink-2 ring-1 ring-line transition-colors hover:text-ink"
 >
 Shuffle
 </button>
 )}
 </div>

 <div className="mt-6 grid grid-cols-2 grid-flow-dense gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
 {ordered.map((s, i) => (
 <button
 key={s.src}
 type="button"
 onClick={(e) => {
 returnFocus.current = e.currentTarget;
 openShot(i);
 }}
 aria-label={`Open ${s.alt}`}
 data-tone="tap"
 className={`block w-full cursor-zoom-in overflow-hidden bg-surface-2 text-left ring-1 ring-line ${leads[i] ? "col-span-2 row-span-2" : ""}`}
 >
 <span className={`pointer-events-none block w-full ${leads[i] ? "h-full" : "aspect-video"}`}>
 <WarpShot
              src={s.src}
              alt={s.alt}
              eager={i < 4}
              index={i}
              fit={s.fit}
              sizes={leads[i] ? LEAD_SIZES : TILE_SIZES}
            />
 </span>
 </button>
 ))}
 </div>

 {/* the viewer — captionless: washed stage, counter, arrows, Esc */}
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
 className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between px-4 py-4 sm:hidden"
 style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
 >
 <span className="rounded-full bg-surface/85 px-2.5 py-1 font-mono text-xs text-ink-2 ring-1 ring-line backdrop-blur-md dark:bg-black/50 dark:ring-white/10">
 {focus + 1} / {ordered.length}
 </span>
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
