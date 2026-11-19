"use client";

import { useEffect, useLayoutEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import Pic from "./pic";

/** Thumb width and the pitch between thumbs, in px. The offset maths below
    depends on every thumb being the same width, so the current one is marked
    with a transform rather than by growing. */
const W = 28;
const PITCH = 32;
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/**
 * The viewer's scrubber: a filmstrip that slides under a fixed centre. The
 * thumb in the middle is the shot on stage.
 *
 * Drag the strip and it follows the pointer one-to-one, swapping the stage
 * whenever a new thumb crosses the centre. Let go with some speed and it
 * carries on a little before settling on the nearest thumb, since a flick
 * should be enough to travel. Past either end it stretches and springs back
 * instead of hitting a wall. A press without movement is a tap, which jumps
 * to that thumb.
 *
 * The strip's position is written straight to the row's transform. Pointer
 * moves never go through React state; only the index change does.
 */
export function ScrubStrip({
  shots,
  focus,
  onSeek,
}: {
  shots: { src: string; alt: string; caption?: string }[];
  focus: number;
  onSeek: (i: number) => void;
}) {
  const n = shots.length;
  const boxRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const pos = useRef(focus);
  const mounted = useRef(false);
  const draggingRef = useRef(false);
  const drag = useRef<{
    startX: number;
    startPos: number;
    lastX: number;
    lastT: number;
    v: number;
    moved: boolean;
    seen: number;
  } | null>(null);

  const place = (p: number, animate: boolean) => {
    const box = boxRef.current;
    const row = rowRef.current;
    if (!box || !row) return;
    row.style.transition = animate ? `transform 260ms ${EASE}` : "none";
    row.style.transform = `translate3d(${box.clientWidth / 2 - (p * PITCH + W / 2)}px, 0, 0)`;
  };

  /* Keys, arrows and the stage halves move the shot from outside; the strip
     follows. Not while a drag is in hand: the pointer owns the strip then. */
  useLayoutEffect(() => {
    if (draggingRef.current) return;
    pos.current = focus;
    place(focus, mounted.current);
    mounted.current = true;
  }, [focus]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => place(pos.current, false));
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  const clamp = (i: number) => Math.min(n - 1, Math.max(0, i));

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      startX: e.clientX,
      startPos: pos.current,
      lastX: e.clientX,
      lastT: e.timeStamp,
      v: 0,
      moved: false,
      seen: focus,
    };
    draggingRef.current = true;
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 4) d.moved = true;
    if (!d.moved) return;
    const dt = e.timeStamp - d.lastT;
    /* Velocity in px/ms, smoothed so one jumpy event cannot dominate, and
       capped at a hard human flick. Uncapped, two events a millisecond apart
       read as a speed that threw the strip from one end to the other. */
    if (dt > 0) {
      const inst = Math.max(-2.5, Math.min(2.5, (e.clientX - d.lastX) / Math.max(dt, 8)));
      d.v = d.v * 0.6 + inst * 0.4;
    }
    d.lastX = e.clientX;
    d.lastT = e.timeStamp;

    const raw = d.startPos - dx / PITCH;
    // Past the ends the strip still gives, at a third of the pull.
    const shown = raw < 0 ? raw / 3 : raw > n - 1 ? n - 1 + (raw - (n - 1)) / 3 : raw;
    pos.current = shown;
    place(shown, false);
    const i = clamp(Math.round(raw));
    if (i !== d.seen) {
      d.seen = i;
      onSeek(i);
    }
  };

  const release = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    draggingRef.current = false;
    if (!d) return;
    let target: number;
    if (!d.moved) {
      /* A tap. The strip holds pointer capture, so the event's target is the
         strip itself, never the thumb; read the thumb off the pointer's
         distance from the centre instead. */
      const box = boxRef.current;
      if (!box) return;
      const r = box.getBoundingClientRect();
      target = clamp(Math.round(pos.current + (e.clientX - (r.left + r.width / 2)) / PITCH));
    } else {
      /* A flick carries on for roughly what it would cover in another 120ms,
         at most eight shots. A drag that stopped before release carries none. */
      const stale = e.timeStamp - d.lastT > 80;
      const carry = stale ? 0 : Math.max(-8, Math.min(8, (-d.v * 120) / PITCH));
      target = clamp(Math.round(pos.current + carry));
    }
    pos.current = target;
    place(target, true);
    if (target !== focus) onSeek(target);
  };

  return (
    <div
      ref={boxRef}
      role="slider"
      tabIndex={0}
      aria-label="Shots"
      aria-valuemin={1}
      aria-valuemax={n}
      aria-valuenow={focus + 1}
      aria-valuetext={`${focus + 1} of ${n}: ${shots[focus]?.caption ?? shots[focus]?.alt ?? ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={release}
      onPointerCancel={release}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      /* The system's horizontal-resize cursor, as fayemi.design uses on its
         scrubbing carousel: the native left-right arrows say "slide this
         sideways" without a drawn label, and stay crisp at any density. */
      className="relative h-14 w-full cursor-ew-resize touch-none select-none overflow-hidden outline-none"
      style={{
        maskImage: "linear-gradient(to right, transparent, #000 14%, #000 86%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, #000 14%, #000 86%, transparent)",
      }}
    >
      <div
        ref={rowRef}
        className="absolute bottom-2 left-0 flex items-end will-change-transform"
        style={{ gap: PITCH - W }}
      >
        {shots.map((shot, i) => {
          const here = i === focus;
          return (
            <span
              key={shot.src}
              data-i={i}
              aria-hidden
              className={`relative block h-9 shrink-0 origin-bottom overflow-hidden rounded-[4px] bg-ink/10 transition-[transform,opacity] duration-150 ease-out ${
                here ? "scale-[1.22] opacity-100 ring-1 ring-ink" : "opacity-55"
              }`}
              style={{ width: W }}
            >
              <Pic
                src={shot.src}
                alt=""
                sizes="56px"
                loading="lazy"
                draggable={false}
                className="pointer-events-none h-full w-full object-cover"
              />
            </span>
          );
        })}
      </div>
    </div>
  );
}
