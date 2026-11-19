"use client";

import { useEffect, useRef } from "react";
import { TILE_GLYPHS } from "./instruments";
import { useNowPlaying } from "./now-line";

/* 5×7 dot-matrix letterforms, drawn to sit with the step tile's numerals
   (TILE_GLYPHS): same grid, same weight, one dot of air between glyphs. */
const LETTERS: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11100", "10010", "10001", "10001", "10001", "10010", "11100"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "10001", "11001", "10101", "10011", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "10001", "01010", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  "·": ["00000", "00000", "00000", "00100", "00000", "00000", "00000"],
  ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
  ",": ["00000", "00000", "00000", "00000", "00110", "00100", "01000"],
  "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  "?": ["01110", "10001", "00001", "00010", "00100", "00000", "00100"],
  "/": ["00000", "00001", "00010", "00100", "01000", "10000", "00000"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  "♥": ["00000", "01010", "11111", "11111", "01110", "00100", "00000"],
};

function glyph(ch: string): string[] {
  const c = ch.toUpperCase();
  if (c === "—" || c === "–") return LETTERS["-"];
  return LETTERS[c] ?? TILE_GLYPHS[c] ?? LETTERS[" "];
}

/** The message as dot columns: 7 bits each, one blank column between glyphs. */
function columnsFor(text: string): boolean[][] {
  const cols: boolean[][] = [];
  for (const ch of text) {
    const g = glyph(ch);
    for (let c = 0; c < 5; c++) cols.push(g.map((row) => row[c] === "1"));
    cols.push(Array(7).fill(false));
  }
  return cols;
}

/* The tiles' face and ink, so the footer is one more instrument, not a
   different object. Dark skin follows the tiles: the surface token. */
const FACE = "relative w-full overflow-hidden rounded-xl bg-[#141414] dark:bg-surface dark:ring-1 dark:ring-white/10";
const LIT = "rgba(255,255,255,0.92)";
const UNLIT = "rgba(255,255,255,0.08)";

/**
 * The ticker. A seven-row dot matrix that crawls a message one column at a
 * time, the way a real LED matrix does: stepped, not smooth, which is both
 * the look and the cheap way to draw it. It only runs while on screen, and
 * holds still for reduced motion.
 */
function Ticker({ text }: { text: string }) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = box.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const msg = columnsFor(`${text}   `);
    let offset = 0;
    let timer = 0;
    let visible = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const draw = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (cv.width !== Math.round(w * dpr)) {
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const pitch = Math.max(6, Math.min(12, (h * 0.42) / 7));
      const cols = Math.floor((w - pitch) / pitch);
      const x0 = (w - cols * pitch) / 2 + pitch / 2;
      const y0 = (h - 7 * pitch) / 2 + pitch / 2;
      const r = pitch * 0.34;
      for (let c = 0; c < cols; c++) {
        const col = msg[(c + offset) % msg.length];
        for (let row = 0; row < 7; row++) {
          ctx.fillStyle = col[row] ? LIT : UNLIT;
          ctx.beginPath();
          ctx.arc(x0 + c * pitch, y0 + row * pitch, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const start = () => {
      if (timer || reduce) return;
      timer = window.setInterval(() => {
        offset = (offset + 1) % msg.length;
        draw();
      }, 90);
    };
    const stop = () => {
      window.clearInterval(timer);
      timer = 0;
    };

    draw();
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(el);
    const ro = new ResizeObserver(draw);
    ro.observe(el);
    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
    };
  }, [text]);

  return (
    <div ref={box} className={`${FACE} aspect-[2/1] sm:aspect-auto sm:min-h-0 sm:flex-1`}>
      <canvas ref={canvas} aria-hidden className="absolute inset-0 h-full w-full" />
    </div>
  );
}

/* Up arrow on a 9×9 matrix. */
const ARROW = [
  "000010000",
  "000111000",
  "001111100",
  "011111110",
  "000111000",
  "000111000",
  "000111000",
  "000111000",
  "000000000",
];

/** Back to the top, as a tile: a dot-matrix arrow that lifts a row on hover. */
function TopTile() {
  const up = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };
  return (
    <button
      type="button"
      onClick={up}
      aria-label="Back to top"
      data-tone="tap"
      className={`${FACE} group aspect-square cursor-pointer transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97]`}
    >
      <svg viewBox="0 0 90 90" aria-hidden className="absolute inset-0 h-full w-full p-[22%]">
        {ARROW.flatMap((row, r) =>
          row.split("").map((bit, c) => (
            <circle
              key={`${r}-${c}`}
              cx={c * 10 + 5}
              cy={r * 10 + 5}
              r={3.4}
              fill={bit === "1" ? LIT : UNLIT}
              className={bit === "1" ? "transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-[6px]" : ""}
            />
          )),
        )}
      </svg>
    </button>
  );
}

/**
 * The foot of every page, as two more instruments beside the ones on the
 * home page: a dot-matrix ticker carrying "built with love and music" and
 * the track behind it, and a back-to-top tile. Captions sit under each, the
 * way the tiles label themselves.
 */
export function FooterWidgets() {
  const track = useNowPlaying();
  const heard = track?.title
    ? ` · ${track.isPlaying ? "NOW" : "LAST"}: ${track.title}${track.artist ? ` — ${track.artist}` : ""}`
    : "";
  const message = `BUILT WITH ♥ AND MUSIC${heard}`;
  const caption = track?.title
    ? `${track.isPlaying ? "now playing" : "last played"} · ${track.title}`
    : "built with love and music";

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      {/* On wide screens the ticker takes the square tile's height exactly:
          the figure stretches to the row, and the face fills what the
          caption leaves, so the two faces line up like the tiles above. */}
      <figure className="col-span-2 flex flex-col sm:col-span-3">
        <Ticker text={message} />
        <figcaption className="mt-2 truncate text-center font-sans text-xs text-ink-2">{caption}</figcaption>
        <span className="sr-only">{message}</span>
      </figure>
      <figure>
        <TopTile />
        <figcaption className="mt-2 text-center font-sans text-xs text-ink-2">back to top</figcaption>
      </figure>
      <p className="col-span-2 mt-4 font-sans text-xs text-ink-3 sm:col-span-4">
        © {new Date().getFullYear()} Damilare Osofisan
      </p>
    </div>
  );
}
