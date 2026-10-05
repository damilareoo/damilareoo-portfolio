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

/* ── steps: dot digits, tap flips ───────────────────────── */

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
  ",": ["000", "000", "000", "010", "100"],
};

function group(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

function stampNumber(
  ctx: CanvasRenderingContext2D,
  S: number,
  text: string,
  cx: number,
  cy: number,
  color: string,
) {
  const cell = S / 24;
  const glyphs = text.split("").map((ch) => DIGITS[ch] ?? DIGITS["0"]);
  const widths = glyphs.map((g) => g[0].length);
  const total = widths.reduce((a, b) => a + b, 0) + (glyphs.length - 1);
  let x = cx - (total * cell) / 2;
  glyphs.forEach((g, gi) => {
    for (let r = 0; r < g.length; r++) {
      for (let c = 0; c < g[r].length; c++) {
        if (g[r][c] === "1") {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x + (c + 0.5) * cell, cy + (r - 2.5) * cell, cell * 0.34, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    x += (widths[gi] + 1) * cell;
  });
}

type StepsReading = { today: number; average: number } | null;

export function StepsTile() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<StepsReading | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let dead = false;
    fetch("/api/steps", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!dead && j && typeof j.today === "number") {
          setData({ today: j.today, average: j.average ?? j.today });
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
    const { ctx, S } = s;
    ctx.clearRect(0, 0, S, S);
    if (!data) {
      // unreported: the field at rest
      paintDots(ctx, S, DOT.cols, () => "rgba(255,255,255,0.10)");
      return;
    }
    if (page === 0) {
      stampNumber(ctx, S, group(data.today), S / 2, S / 2, "rgba(255,255,255,0.95)");
    } else {
      stampNumber(ctx, S, group(data.today), S / 2, S * 0.28, "rgba(255,255,255,0.95)");
      stampNumber(ctx, S, group(data.average), S / 2, S * 0.72, "rgba(255,255,255,0.95)");
    }
    // pager
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    [0, 1].forEach((i) => {
      ctx.globalAlpha = i === page ? 1 : 0.25;
      ctx.beginPath();
      ctx.arc(S / 2 + (i - 0.5) * 14, S - 16, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }, [data, page]);

  return (
    <Tile
      label={data ? `Steps today ${group(data.today)}, 7-day average ${group(data.average)}. Tap to turn the page.` : "Steps not reported"}
      value={data ? group(data.today) : "—"}
      onTap={() => setPage((p) => (p + 1) % 2)}
      tapLabel={data ? `Steps, page ${page + 1} of 2. Tap to turn the page.` : "Steps not reported"}
    >
      <canvas ref={ref} aria-hidden className="h-full w-full" />
    </Tile>
  );
}
