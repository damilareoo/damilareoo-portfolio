"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { WarpShot } from "./warp-shot";

type Shot = { src: string; alt: string; caption?: string; fit?: "contain" };

/** Project groups with at least this many studies open the wall with a
 double-size lead tile — rhythm with an editorial reason, not decoration. */
export const LEAD_MIN = 4;

export function projectOf(s: { alt: string; caption?: string }): string {
 return (s.caption ?? s.alt).split("—")[0].trim().toLowerCase();
}

/** The wall's shuffle, dealt once and forever: project groups keep their
 internal order and their lead tiles, but the groups themselves run in a
 fixed-seed order. Random at render would split server from client, so
 the seed is written down — same wall for everyone, every visit. */
export const WALL_SEED = 102;

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
 const order = [...groups.values()];
 const rand = mulberry32(seed);
 for (let i = order.length - 1; i > 0; i--) {
 const j = Math.floor(rand() * (i + 1));
 [order[i], order[j]] = [order[j], order[i]];
 }
 return order.flat();
}

/** One boolean per shot: true for the lead tile of each qualifying group. */
export function leadsFor(shots: { alt: string; caption?: string }[], min = LEAD_MIN): boolean[] {
 const counts = new Map<string, number>();
 for (const s of shots) counts.set(projectOf(s), (counts.get(projectOf(s)) ?? 0) + 1);
 const seen = new Set<string>();
 return shots.map((s) => {
 const p = projectOf(s);
 const lead = !seen.has(p) && (counts.get(p) ?? 0) >= min;
 seen.add(p);
 return lead;
 });
}

/**
 * The wall — studies filed by project, click-to-open. One intro line,
 * a jump list, then a section per project with the same bracket labels
 * the site already uses. Same masonry tiles, same viewer; the sections
 * only say what the clusters already were.
 */
export function ShotsWall({ shots }: { shots: Shot[] }) {
 const [focus, setFocus] = useState<number | null>(null);
 const ordered = useMemo(() => orderGroups(shots), [shots]);
 const leads = leadsFor(ordered);

 const step = useCallback(
 (dir: 1 | -1) => {
 setFocus((f) =>
 f === null || ordered.length === 0
 ? f
 : (f + dir + ordered.length) % ordered.length,
 );
 },
 [ordered.length],
 );

 /* Keys: the viewer takes arrows + Esc when open. */
 useEffect(() => {
 const onKey = (e: KeyboardEvent) => {
 const t = e.target as HTMLElement | null;
 if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
 if (focus === null) return;
 if (e.key === "Escape") setFocus(null);
 else if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); step(1); }
 else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); step(-1); }
 };
 window.addEventListener("keydown", onKey);
 return () => window.removeEventListener("keydown", onKey);
 }, [focus, step]);

 /* Lock the page behind the viewer. */
 useEffect(() => {
 if (focus === null) return;
 const prev = document.body.style.overflow;
 document.body.style.overflow = prev;
 return () => {
 document.body.style.overflow = prev;
 };
 }, [focus]);

 const current = focus !== null ? ordered[focus] : null;

 return (
 <div className="pt-8">
 <p className="text-xs tracking-wide text-ink-3">[Playground]</p>
 <p className="mt-2 font-sans text-sm text-ink-2">
 {shots.length} studies and sketches — click any tile to open.
 </p>

 <div className="mt-6 grid grid-cols-2 grid-flow-dense gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
 {ordered.map((s, i) => (
 <button
 key={s.src}
 type="button"
 onClick={() => setFocus(i)}
 aria-label={`Open ${s.alt}`}
 data-tone="tap"
 className={`block w-full cursor-zoom-in overflow-hidden bg-surface-2 text-left ring-1 ring-line ${leads[i] ? "col-span-2 row-span-2" : ""}`}
 >
 <span className={`pointer-events-none block w-full ${leads[i] ? "h-full" : "aspect-video"}`}>
 <WarpShot src={s.src} alt={s.alt} eager={i < 8} index={i} fit={s.fit} />
 </span>
 </button>
 ))}
 </div>

 {/* the viewer — captionless: blurred stage, counter, arrows, Esc */}
 {current !== null && focus !== null && (
 <div
 role="dialog"
 aria-modal="true"
 aria-label={`${current.alt} — ${focus + 1} of ${ordered.length}`}
 className="fixed inset-0 z-50 flex items-center justify-center"
 >
 <div
 className="absolute inset-0 bg-bg/90 backdrop-blur-md dark:bg-black/80"
 onClick={() => setFocus(null)}
 />
 <figure className="relative z-10 mx-4 flex max-h-[86vh] flex-col items-center">
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img
 key={current.src}
 src={current.src}
 alt={current.alt}
 draggable={false}
 className="shot-in max-h-[74vh] w-auto max-w-[92vw] rounded-xl object-contain ring-1 ring-line drop-shadow-[0_24px_48px_rgba(0,0,0,0.24)]"
 />
 <figcaption className="mt-4 flex items-center gap-2">
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
 onClick={() => setFocus(null)}
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
 </div>
 )}
 </div>
 );
}
