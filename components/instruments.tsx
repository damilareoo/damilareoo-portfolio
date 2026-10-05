"use client";

import { useEffect, useRef, useState } from "react";

/* ── shared ─────────────────────────────────────────────── */

function lagosParts() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return { h: get("hour") % 12, m: get("minute"), s: get("second") };
}

function lagosDigits() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

function Tile({
  label,
  value,
  children,
  onTap,
  tapLabel,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
  onTap?: () => void;
  tapLabel?: string;
}) {
  const face = (
    <div className="aspect-square w-full overflow-hidden rounded-xl bg-[#141414] ring-1 ring-transparent transition-transform duration-200 hover:-translate-y-0.5 dark:bg-[#1e1e1e] dark:ring-white/10">
      {children}
    </div>
  );
  return (
    <div>
      <span className="sr-only">{label}</span>
      {onTap ? (
        <button
          type="button"
          onClick={onTap}
          aria-label={tapLabel ?? label}
          className="block w-full cursor-pointer"
        >
          {face}
        </button>
      ) : (
        face
      )}
      <p className="mt-2 truncate text-center font-mono text-xs tabular-nums text-[#626262] dark:text-[#a8a8a8]">
        {value}
      </p>
    </div>
  );
}

/* ── clock ──────────────────────────────────────────────── */

const INDEX = Array.from({ length: 12 }, (_, hour) => {
  const a = (hour * Math.PI) / 6;
  const quarter = hour % 3 === 0;
  return {
    cx: Math.round((50 + 43 * Math.sin(a)) * 1000) / 1000,
    cy: Math.round((50 - 43 * Math.cos(a)) * 1000) / 1000,
    r: hour === 0 ? 2.2 : quarter ? 1.6 : 0.9,
    o: hour === 0 ? 0.7 : quarter ? 0.5 : 0.28,
  };
});

export function ClockTile() {
  const [now, setNow] = useState("--:--:--");
  const [hands, setHands] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const { h, m, s } = lagosParts();
      setHands({
        h: ((h + m / 60) * 30) % 360,
        m: (m * 6) % 360,
        s: (s * 6) % 360,
      });
      setNow(lagosDigits());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Tile label="Lagos time" value={now}>
      <svg viewBox="0 0 100 100" role="img" aria-label="Lagos time" className="block h-full w-full">
        <circle cx="50" cy="50" r="50" fill="#141414" />
        {INDEX.map((mk, i) => (
          <circle key={i} cx={mk.cx} cy={mk.cy} r={mk.r} fill="#fff" opacity={mk.o} />
        ))}
        <line x1="50" y1="50" x2="50" y2="33" stroke="#fff" strokeWidth="6.5" strokeLinecap="round" opacity="0.72" transform={`rotate(${hands.h} 50 50)`} />
        <line x1="50" y1="50" x2="50" y2="14" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" transform={`rotate(${hands.m} 50 50)`} />
        <line x1="50" y1="60" x2="50" y2="11" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" transform={`rotate(${hands.s} 50 50)`} />
        <circle cx="50" cy="50" r="1.6" fill="#141414" />
      </svg>
    </Tile>
  );
}

/* ── dot-matrix canvas helper ───────────────────────────── */

const DOT = {
  cols: 21,
  pitch(S: number) {
    return S / this.cols;
  },
};

function setupCanvas(ref: React.RefObject<HTMLCanvasElement | null>, S = 300) {
  const canvas = ref.current;
  if (!canvas) return null;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = S * dpr;
  canvas.height = S * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, S };
}

/** Paint a dot field: color(x, y) returns a fill or null to skip. */
function paintDots(
  ctx: CanvasRenderingContext2D,
  S: number,
  cols: number,
  color: (x: number, y: number) => string | null,
  rFrac = 0.32,
) {
  const pitch = S / cols;
  ctx.clearRect(0, 0, S, S);
  for (let y = 0; y < cols; y++) {
    for (let x = 0; x < cols; x++) {
      const c = color(x, y);
      if (!c) continue;
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc((x + 0.5) * pitch, (y + 0.5) * pitch, pitch * rFrac, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/* ── weather ────────────────────────────────────────────── */

type Condition = "sun" | "cloud" | "rain";

function codeToCondition(code: number): Condition {
  if (code <= 1) return "sun";
  if (code >= 51 || code >= 80) return "rain";
  return "cloud";
}

/** Cloud = union of three discs; rain = drops under it. In grid units. */
function cloudAt(x: number, y: number): boolean {
  const inDisc = (cx: number, cy: number, r: number) =>
    (x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r;
  return inDisc(7.5, 11, 3.4) || inDisc(10.5, 9, 4.2) || inDisc(13.8, 11, 3.0);
}

function dropAt(x: number, y: number): boolean {
  return (
    (x === 7 && y >= 16 && y <= 19 && (y - x) % 2 === 0) ||
    (x === 10.5 && y >= 16 && y <= 19) ||
    (x === 14 && y >= 16 && y <= 19 && (y + x) % 2 === 0)
  );
}

export function WeatherTile() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [t, setT] = useState<{ t: number; c: number } | null>(null);

  useEffect(() => {
    let dead = false;
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=6.45&longitude=3.39&current=temperature_2m,weather_code",
    )
      .then((r) => r.json())
      .then((j) => {
        if (!dead && j?.current) {
          setT({ t: Math.round(j.current.temperature_2m), c: j.current.weather_code });
        }
      })
      .catch(() => {});
    return () => {
      dead = true;
    };
  }, []);

  useEffect(() => {
    const s = setupCanvas(ref);
    if (!s) return;
    const cond: Condition = t ? codeToCondition(t.c) : "cloud";
    paintDots(s.ctx, s.S, DOT.cols, (x, y) => {
      if (cloudAt(x, y)) return "rgba(255,255,255,0.95)";
      if (cond === "rain" && dropAt(x, y)) return "rgba(255,255,255,0.55)";
      return "rgba(255,255,255,0.10)";
    });
  }, [t]);

  return (
    <Tile label="Lagos weather" value={t ? `${t.t}°` : "—"}>
      <canvas ref={ref} aria-hidden className="h-full w-full" />
    </Tile>
  );
}

/* ── music: halftone disc ───────────────────────────────── */

const GRID = 48;

type Track = {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  songUrl?: string;
  albumArt?: string | null;
  progress?: number;
  duration?: number;
};

export function MusicTile() {
  const ref = useRef<HTMLCanvasElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const [track, setTrack] = useState<Track | null>(null);

  useEffect(() => {
    let dead = false;
    const poll = async () => {
      try {
        const res = await fetch("/api/now-playing", { cache: "no-store" });
        const json = (await res.json()) as Track;
        if (!dead && typeof json.isPlaying === "boolean") setTrack(json);
        else if (!dead) setTrack(null);
      } catch {
        if (!dead) setTrack(null);
      }
    };
    poll();
    const id = setInterval(poll, 30_000);
    return () => {
      dead = true;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const s = setupCanvas(ref);
    if (!s) return;
    const art = track?.isPlaying ? track.albumArt : undefined;

    const rest = () =>
      paintDots(s.ctx, s.S, GRID, (x, y) => {
        const dx = x + 0.5 - GRID / 2;
        const dy = y + 0.5 - GRID / 2;
        return dx * dx + dy * dy <= (GRID / 2 - 1) * (GRID / 2 - 1)
          ? "rgba(255,255,255,0.10)"
          : null;
      }, 0.4);

    if (!art) {
      rest();
      if (arcRef.current) arcRef.current.style.opacity = "0";
      return;
    }

    let dead = false;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (dead) return;
      const off = document.createElement("canvas");
      off.width = GRID;
      off.height = GRID;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;
      octx.imageSmoothingEnabled = true;
      octx.imageSmoothingQuality = "high";
      octx.drawImage(img, 0, 0, GRID, GRID);
      try {
        const data = octx.getImageData(0, 0, GRID, GRID).data;
        paintDots(s.ctx, s.S, GRID, (x, y) => {
          const dx = x + 0.5 - GRID / 2;
          const dy = y + 0.5 - GRID / 2;
          if (dx * dx + dy * dy > (GRID / 2 - 1) * (GRID / 2 - 1)) return null;
          const i = (y * GRID + x) * 4;
          return `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`;
        }, 0.42);
      } catch {
        rest();
      }
    };
    img.onerror = rest;
    img.src = `/api/now-playing/art?u=${encodeURIComponent(art)}`;
    return () => {
      dead = true;
    };
  }, [track?.albumArt, track?.isPlaying]);

  useEffect(() => {
    const arc = arcRef.current;
    if (!arc) return;
    const L = 2 * Math.PI * 47;
    const done =
      track?.isPlaying && track.duration && track.duration > 0
        ? Math.min(1, (track.progress ?? 0) / track.duration)
        : 0;
    arc.style.strokeDashoffset = String(L * (1 - done));
    arc.style.opacity = done * L >= 4 * 0.6 ? "1" : "0";
  }, [track]);

  const playing = Boolean(track?.isPlaying && track.title);
  const value = track === null ? "—" : playing ? `${track.title}` : "Silent";

  return (
    <Tile
      label={playing ? `Now playing: ${track!.title} by ${track!.artist}` : "Nothing playing"}
      value={value}
    >
      <div className="relative h-full w-full">
        <canvas ref={ref} aria-hidden className="h-full w-full" />
        <svg viewBox="0 0 100 100" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full text-white/40">
          <circle
            ref={arcRef}
            cx="50"
            cy="50"
            r="47"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 47}
            strokeDashoffset={2 * Math.PI * 47}
            opacity={0}
            transform="rotate(-90 50 50)"
          />
        </svg>
        {playing && track!.songUrl && (
          <a
            href={track!.songUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${track!.title} on Spotify`}
            className="absolute inset-0"
          />
        )}
      </div>
    </Tile>
  );
}

/* ── steps: morphing dot-matrix kilometres ────────────── */

const DIGITS: Record<string, string[]> = {
  "0": ["111", "101", "101", "101", "111"],
  "1": ["010", "110", "010", "010", "111"],
  "2": ["111", "001", "111", "100", "111"],
  "3": ["111", "001", "111", "001", "111"],
  "4": ["101", "101", "111", "001", "001"],
  "5": ["111", "100", "111", "001", "111"],
  "6": ["111", "100", "111", "101", "111"],
  "7": ["111", "001", "001", "010", "010"],
  "8": ["111", "101", "111", "101", "111"],
  "9": ["111", "101", "111", "001", "111"],
  ".": ["0", "0", "0", "0", "1"],
};

const DOT_CELL = 24;
/* Widest reading the tile ever holds ("00.00"), so the units column
   never wanders while the decimals tick. Steps digits run bigger than
   the shared field — the tile is the number. */
const MAX_COLS = 3 + 3 + 1 + 3 + 3 + 4;
const STEPS_CELL = 19;

type Dot = { col: number; row: number; x: number; y: number };

function layoutDots(text: string, S: number, cy: number): Dot[] {
  const cell = S / STEPS_CELL;
  const x0 = S / 2 - (MAX_COLS * cell) / 2;
  const dots: Dot[] = [];
  let col = 0;
  for (const ch of text.split("")) {
    const g = DIGITS[ch] ?? DIGITS["0"];
    for (let r = 0; r < g.length; r++) {
      for (let c = 0; c < g[r].length; c++) {
        if (g[r][c] === "1") {
          dots.push({
            col: col + c,
            row: r,
            x: x0 + (col + c + 0.5) * cell,
            y: cy + (r - 2.5) * cell,
          });
        }
      }
    }
    col += g[0].length + 1;
  }
  return dots;
}

const dotKey = (d: Dot) => `${d.col}:${d.row}:${Math.round(d.y)}`;

/**
 * The morph — dots the new reading needs grow in left to right, dots
 * it drops shrink away first. Shared dots never blink, so a 5.11 →
 * 5.12 change moves one dot instead of repainting the digit.
 */
function morphDots(
  ctx: CanvasRenderingContext2D,
  S: number,
  from: Dot[],
  to: Dot[],
  color: string,
  chrome: () => void,
) {
  const cell = S / STEPS_CELL;
  const fromKeys = new Set(from.map(dotKey));
  const toMap = new Map(to.map((d) => [dotKey(d), d]));
  const leaving = from.filter((d) => !toMap.has(dotKey(d)));
  const entering = to.filter((d) => !fromKeys.has(dotKey(d)));
  const staying = to.filter((d) => fromKeys.has(dotKey(d)));
  const calm =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const t0 = performance.now();

  if (calm) {
    paintDots(ctx, S, 0, () => null);
    ctx.fillStyle = color;
    for (const d of to) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, cell * 0.34, 0, Math.PI * 2);
      ctx.fill();
    }
    chrome();
    return () => {};
  }

  let raf = 0;
  const paint = (now: number) => {
    const t = now - t0;
    ctx.clearRect(0, 0, S, S);
    ctx.fillStyle = color;
    for (const d of staying) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, cell * 0.34, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const d of leaving) {
      const k = Math.max(0, 1 - t / 180);
      if (k <= 0) continue;
      ctx.beginPath();
      ctx.arc(d.x, d.y, cell * 0.34 * k, 0, Math.PI * 2);
      ctx.fill();
    }
    let live = t < 180;
    for (const d of entering) {
      const k = Math.min(1, Math.max(0, (t - 120 - d.col * 14) / 260));
      if (k <= 0) {
        live = true;
        continue;
      }
      if (k < 1) live = true;
      ctx.beginPath();
      ctx.arc(d.x, d.y, cell * 0.34 * k, 0, Math.PI * 2);
      ctx.fill();
    }
    if (live) {
      raf = requestAnimationFrame(paint);
    }
    chrome();
  };
  raf = requestAnimationFrame(paint);
  return () => cancelAnimationFrame(raf);
}

type StepsReading = { km: number; averageKm: number; steps: number; date: string } | null;

const fmtKm = (n: number) => n.toFixed(2);

export function StepsTile() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<StepsReading>(null);
  const [page, setPage] = useState(0);
  const shownRef = useRef<Dot[] | null>(null);

  useEffect(() => {
    let dead = false;
    const poll = async () => {
      try {
        const res = await fetch("/api/steps", { cache: "no-store" });
        const j = await res.json();
        if (!dead && j && j.configured && typeof j.km === "number") {
          setData({ km: j.km, averageKm: j.averageKm ?? j.km, steps: j.steps ?? 0, date: j.date ?? "" });
        }
      } catch {
        /* offline — the last reading (or the rest field) stands */
      }
    };
    poll();
    const id = setInterval(poll, 5 * 60_000);
    const onVis = () => {
      if (document.visibilityState === "visible") poll();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      dead = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    const s = setupCanvas(ref);
    if (!s) return;
    const { ctx, S } = s;
    if (!data) {
      // unreported: the field at rest
      shownRef.current = null;
      paintDots(ctx, S, DOT.cols, () => "rgba(255,255,255,0.10)");
      return;
    }
    const regions =
      page === 0
        ? [{ text: fmtKm(data.km), cy: S / 2 }]
        : [
            { text: fmtKm(data.km), cy: S * 0.28 },
            { text: fmtKm(data.averageKm), cy: S * 0.72 },
          ];
    const next = regions.flatMap((r) => layoutDots(r.text, S, r.cy));
    const from = shownRef.current ?? [];
    shownRef.current = next;
    const cancel = morphDots(ctx, S, from, next, "rgba(255,255,255,0.95)", () => {
      // chrome — repainted every frame because the morph clears the canvas.
      // The pager borrows the poster's rule: red means you-are-here, so the
      // today dot burns red while it is the page underfoot, nowhere else.
      const pager: Array<[number, string, number]> = [
        [S / 2 - 7, page === 0 ? "#D71920" : "rgba(255,255,255,0.9)", page === 0 ? 1 : 0.25],
        [S / 2 + 7, "rgba(255,255,255,0.9)", page === 1 ? 1 : 0.25],
      ];
      for (const [x, c, a] of pager) {
        ctx.globalAlpha = a;
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(x, S - 16, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (page === 0) {
        // the poster's unit line, letterspaced mono under the numerals
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.font = `500 ${Math.max(10, S * 0.04)}px ui-monospace, "SF Mono", Menlo, monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        try {
          (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "3px";
        } catch {
          /* older canvas — tracking falls back to the font itself */
        }
        ctx.fillText("KILOMETRES", S / 2, S * 0.74);
        try {
          (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";
        } catch {
          /* reset is best-effort; the canvas clears every frame anyway */
        }
      }
    });
    return cancel;
  }, [data, page]);

  return (
    <Tile
      label={
        data
          ? `Run ${data.date}: ${fmtKm(data.km)} kilometres, ${data.steps.toLocaleString("en-US")} steps. 7-day average ${fmtKm(data.averageKm)} kilometres. Tap to turn the page.`
          : "Steps not reported"
      }
      value={data ? `${fmtKm(data.km)} km` : "—"}
      onTap={() => setPage((p) => (p + 1) % 2)}
      tapLabel={data ? `Run, page ${page + 1} of 2. Tap to turn the page.` : "Steps not reported"}
    >
      <canvas ref={ref} aria-hidden className="h-full w-full" />
    </Tile>
  );
}
