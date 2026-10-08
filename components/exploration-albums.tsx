"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/motion";
import type { LabShots } from "./lab-set";

const pad = (i: number) => String(i + 1).padStart(2, "0");

/** Shared autoplay clock: advances alone, never on hover alone. */
function useAutoIndex(n: number, dwell: number) {
  const [at, setAt] = useState(0);
  const [paused, setPaused] = useState(false);
  const lastRef = useRef(0);
  const seenRef = useRef(true);
  const pausedRef = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const touch = useCallback(() => {
    lastRef.current = Date.now();
  }, []);
  const go = useCallback(
    (i: number) => {
      touch();
      setAt(((i % n) + n) % n);
    },
    [n, touch],
  );
  const step = useCallback(
    (d: 1 | -1) => {
      touch();
      setAt((a) => (a + d + n) % n);
    },
    [n, touch],
  );
  const toggle = useCallback(() => {
    touch();
    setPaused((p) => {
      pausedRef.current = !p;
      return !p;
    });
  }, [touch]);

  useEffect(() => {
    if (reduced) return;
    const stage = stageRef.current;
    if (!stage) return;
    touch();
    const io = new IntersectionObserver(([e]) => (seenRef.current = e.isIntersecting), { threshold: 0.15 });
    io.observe(stage);
    const id = window.setInterval(() => {
      if (document.hidden || !seenRef.current || pausedRef.current) return;
      if (Date.now() - lastRef.current < dwell) return;
      lastRef.current = Date.now();
      setAt((a) => (a + 1) % n);
    }, 250);
    return () => {
      window.clearInterval(id);
      io.disconnect();
    };
  }, [reduced, n, dwell, touch]);

  return { at, step, go, toggle, paused, stageRef, reduced };
}

function Foot({
  at, n, label, dwell, reduced, paused, onToggle, onPrev, onNext, countLabel, prevLabel = "Previous cover", nextLabel = "Next cover",
}: {
  at: number; n: number; label: string; dwell: number; reduced: boolean;
  paused: boolean; onToggle: () => void; onPrev: () => void; onNext: () => void;
  countLabel?: string; prevLabel?: string; nextLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between pt-2">
      <p aria-live="polite" className="truncate font-mono text-[11px] text-[#55534f]">
        {countLabel ?? (
          <>
            <span className="tabular-nums text-[#767676] dark:text-[#8a8a8a]">{pad(at)}</span>
            {" — "}
          </>
        )}
        {label}
      </p>
      {!reduced && (
        <span aria-hidden className="mx-3 h-px flex-1 overflow-hidden rounded bg-[#e0e0e0] dark:bg-white/10">
          <span
            key={`${at}-${paused}`}
            className={`block h-full w-full bg-[#767676]/70 dark:bg-white/40 ${paused ? "" : "flow-dwell"}`}
            style={paused ? undefined : { animationDuration: `${dwell}ms` }}
          />
        </span>
      )}
      <div className="flex flex-none items-center gap-2 pl-2">
        {!reduced && (
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={!paused}
            aria-label={paused ? "Resume the show" : "Pause the show"}
            className="cursor-pointer font-mono text-[11px] uppercase tracking-widest text-[#767676] transition-colors hover:text-[#171717] dark:text-[#8a8a8a] dark:hover:text-white"
          >
            {paused ? "play" : "pause"}
          </button>
        )}
        <button
          type="button"
          onClick={onPrev}
          aria-label={prevLabel}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full ring-1 ring-[#e0e0e0] transition-colors hover:text-[#171717] dark:ring-[#2e2e2e] dark:hover:text-white"
        >
          ←
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label={nextLabel}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full ring-1 ring-[#e0e0e0] transition-colors hover:text-[#171717] dark:ring-[#2e2e2e] dark:hover:text-white"
        >
          →
        </button>
      </div>
    </div>
  );
}

/**
 * Direction A — living wall. All eleven covers tiled at once; every
 * round a different third of the wall turns over to the next cover,
 * each tile drifting on its own slow zoom. No selection, no action.
 */
export function AlbumsWall({ shots }: { shots: LabShots[] }) {
  const n = shots.length;
  const { at: round, stageRef, reduced, paused, toggle, step } = useAutoIndex(n, 2200);

  return (
    <div className="flex h-80 flex-col">
      <div ref={stageRef} role="group" aria-label={`Living wall of ${n} album covers, turning over on its own`} className="grid min-h-0 flex-1 grid-cols-4 grid-rows-3 gap-1.5 overflow-hidden">
        {shots.map((_, t) => {
          const s = shots[(t + round) % n];
          return (
            <div key={t} className="relative min-h-0 overflow-hidden rounded-md ring-1 ring-black/15 dark:ring-white/15">
              {(round + t) % 3 === 0 || reduced ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={s.src}
                  src={s.src}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  draggable={false}
                  className="tile-in block h-full w-full object-cover"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={s.src}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  draggable={false}
                  className="kb-drift block h-full w-full object-cover"
                  style={{ animationDuration: `${9 + (t % 4) * 2.5}s`, animationDelay: `${-t * 1.3}s` }}
                />
              )}
            </div>
          );
        })}
      </div>
      <Foot
        at={round % n} n={n} label="turning over" countLabel={`${n} covers — `}
        dwell={2200} reduced={reduced} paused={paused}
        onToggle={toggle} onPrev={() => step(-1)} onNext={() => step(1)}
        prevLabel="Turn the wall back" nextLabel="Turn the wall over"
      />
    </div>
  );
}

/**
 * Direction B — chart run. Full-bleed cover dissolving into the next
 * with a giant rank numeral rising over it, like a radio chart
 * counting through your eleven.
 */
export function AlbumsChart({ shots }: { shots: LabShots[] }) {
  const n = shots.length;
  const { at, step, stageRef, reduced, paused, toggle } = useAutoIndex(n, 3000);
  const s = shots[at];
  const label = s?.alt.replace(" — cover", "") ?? "";

  return (
    <div className="flex h-80 flex-col">
      <div ref={stageRef} role="group" aria-label={`Chart run — currently ${pad(at)} ${label}`} className="relative min-h-0 flex-1 overflow-hidden rounded-xl bg-[#0d0d0d]">
        {s && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={s.src}
            src={s.src}
            alt=""
            aria-hidden
            draggable={false}
            className="chart-cover absolute inset-0 block h-full w-full object-cover"
          />
        )}
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
        <span key={at} aria-hidden className="chart-num absolute -bottom-5 left-3 font-mono text-[104px] font-medium leading-none tabular-nums text-white">
          {pad(at)}
        </span>
      </div>
      <Foot
        at={at} n={n} label={label}
        dwell={3000} reduced={reduced} paused={paused}
        onToggle={toggle} onPrev={() => step(-1)} onNext={() => step(1)}
      />
    </div>
  );
}

/**
 * Direction C — now spinning. One big cover breathing slowly and
 * dissolving into the next, Apple-Music-animated-artwork calm, with
 * the about-page spindle dot at its center.
 */
export function AlbumsSpinning({ shots }: { shots: LabShots[] }) {
  const n = shots.length;
  const { at, step, stageRef, reduced, paused, toggle } = useAutoIndex(n, 4500);
  const s = shots[at];
  const label = s?.alt.replace(" — cover", "") ?? "";

  return (
    <div className="flex h-80 flex-col">
      <div ref={stageRef} role="group" aria-label={`Now spinning — ${label}`} className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl bg-[#0d0d0d]">
        {s && (
          <span key={s.src} aria-hidden className="spin-in block h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.src}
              alt=""
              draggable={false}
              className={`block aspect-square h-full object-cover ${reduced ? "" : "spin-breathe"}`}
            />
          </span>
        )}
        <span aria-hidden className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fafafa]/90 ring-1 ring-black/30" />
      </div>
      <Foot
        at={at} n={n} label={label}
        dwell={4500} reduced={reduced} paused={paused}
        onToggle={toggle} onPrev={() => step(-1)} onNext={() => step(1)}
      />
    </div>
  );
}

type Mode = "wall" | "chart" | "spinning";

/**
 * TEMP playground — three autoplay directions behind one switcher so
 * the owner can see them all live. Delete the losers and this switch.
 */
export function AlbumsPlayground({ shots }: { shots: LabShots[] }) {
  const [mode, setMode] = useState<Mode>("wall");
  return (
    <div>
      <div className="mb-2 flex justify-center gap-1" role="group" aria-label="TEMP — pick the album direction to preview">
        {(["wall", "chart", "spinning"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={`cursor-pointer rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-widest transition-colors ${
              mode === m ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717]" : "text-[#767676] hover:text-[#171717] dark:text-[#8a8a8a] dark:hover:text-white"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      {mode === "wall" && <AlbumsWall shots={shots} />}
      {mode === "chart" && <AlbumsChart shots={shots} />}
      {mode === "spinning" && <AlbumsSpinning shots={shots} />}
    </div>
  );
}
