"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useTheme } from "next-themes";
import { coinSound, tapSound } from "./sound";

/* ── shared ─────────────────────────────────────────────── */

function localParts() {
 const parts = new Intl.DateTimeFormat("en-GB", {
 hour: "2-digit",
 minute: "2-digit",
 second: "2-digit",
 hour12: false,
 }).formatToParts(new Date());
 const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
 return { h: get("hour") % 12, m: get("minute"), s: get("second") };
}

function localDigits() {
 return new Intl.DateTimeFormat("en-GB", {
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
 faceStyle,
}: {
 label: string;
 value: string;
 children: React.ReactNode;
 onTap?: () => void;
 tapLabel?: string;
 faceStyle?: CSSProperties;
}) {
 const face = (
 <div
 style={faceStyle}
 className="aspect-square w-full overflow-hidden rounded-xl bg-[#141414] ring-1 ring-transparent transition-transform duration-200 hover:-translate-y-0.5 dark:bg-surface dark:ring-white/10"
 >
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
 <p className="mt-2 truncate text-center font-sans text-xs tabular-nums text-ink-2">
 {value}
 </p>
 </div>
 );
}

/** Mount-guarded dark flag — server and first paint agree on light,
 the stored theme lands a frame later. Shared by every tile that
 flips its face with the page. */
function useDark(): boolean {
 const { resolvedTheme } = useTheme();
 const [on, setOn] = useState(false);
 useEffect(() => {
 const raf = requestAnimationFrame(() => setOn(true));
 return () => cancelAnimationFrame(raf);
 }, []);
 return on && resolvedTheme === "dark";
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
 const [now, setNow] = useState("");
 const [hands, setHands] = useState({ h: 0, m: 0, s: 0 });
 /* White face on dark pages, black face on light ones — the footer
 flips as one, led by the run widget. No square behind it: the dial
 is a circle and floats on its own shadow. */
 const dark = useDark();
 const face = dark ? "#FFFFFF" : "#141414";
 const ink = dark ? "#0A0A0A" : "#FFFFFF";

 useEffect(() => {
 const tick = () => {
 const { h, m, s } = localParts();
 setHands({
 h: ((h + m / 60) * 30) % 360,
 m: (m * 6) % 360,
 s: (s * 6) % 360,
 });
 setNow(localDigits());
 };
 tick();
 const id = setInterval(tick, 1000);
 return () => clearInterval(id);
 }, []);

 return (
 <Tile label="Local time" value={now} faceStyle={{ background: "transparent", boxShadow: "none" }}>
 <svg viewBox="0 0 100 100" role="img" aria-label="Local time" className="block h-full w-full">
 <circle cx="50" cy="50" r="50" fill={face} />
 {INDEX.map((mk, i) => (
 <circle key={i} cx={mk.cx} cy={mk.cy} r={mk.r} fill={ink} opacity={mk.o} />
 ))}
 <line x1="50" y1="50" x2="50" y2="33" stroke={ink} strokeWidth="6.5" strokeLinecap="round" opacity="0.72" transform={`rotate(${hands.h} 50 50)`} />
 <line x1="50" y1="50" x2="50" y2="14" stroke={ink} strokeWidth="3.4" strokeLinecap="round" transform={`rotate(${hands.m} 50 50)`} />
 <line x1="50" y1="60" x2="50" y2="11" stroke={ink} strokeWidth="1.4" strokeLinecap="round" opacity="0.55" transform={`rotate(${hands.s} 50 50)`} />
 <circle cx="50" cy="50" r="1.6" fill={face} />
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

/* ── dots: reaction game ──────────────────────────────── */

const DOTS_N = 5;
const BEST_KEY = "damilareoo-dots-best";

/** The ramp: a fresh mole every ~950ms, down to a 320ms floor. */
export function speedFor(kills: number): number {
 return Math.max(320, 950 - kills * 45);
}

/** A new mole that is never the old mole. Randomness takes an injectable
 die so tests can load it. */
export function nextMole(prev: number | null, n = DOTS_N, rand: () => number = Math.random): number {
 const m = Math.floor(rand() * n * n);
 if (m === prev) return (m + 1) % (n * n);
 return m;
}

type DotPhase = "idle" | "play" | "over";

/** The caption never truncates mid-thought: every branch fits a 171px
 tile in 12px mono. */
export function dotsCaption(phase: DotPhase, score: number, best: number, isNewBest: boolean): string {
 if (phase === "play") return `score ${score} · best ${Math.max(best, score)}`;
 if (phase === "over") return isNewBest ? `new best ${score} — retry` : `${score} — retry`;
 return best > 0 ? `best ${best} — play` : "tap to play";
}

export function DotsTile() {
 const ref = useRef<HTMLCanvasElement>(null);
 const [phase, setPhase] = useState<DotPhase>("idle");
 const [score, setScore] = useState(0);
 const [combo, setCombo] = useState(0);
 const [mole, setMole] = useState<number | null>(null);
 const [flash, setFlash] = useState<number | null>(null);
 const [cursor, setCursor] = useState(12);
 const [blink, setBlink] = useState(true);
 const [best, setBest] = useState<number>(() => {
 try {
 return Number(localStorage.getItem(BEST_KEY) ?? 0) || 0;
 } catch {
 /* server render or private mode — the session best stands */
 return 0;
 }
 });
 const bestRef = useRef(0);
 const bestStartRef = useRef(0);
 const [isNewBest, setIsNewBest] = useState(false);
 const flashTimer = useRef(0);

 /* White face on dark pages: the game dots flip to ink with it. */
 const dark = useDark();
 const dotBase = dark ? "rgba(10,10,10,0.10)" : "rgba(255,255,255,0.10)";
 const dotLit = dark ? "rgba(10,10,10,0.9)" : "rgba(255,255,255,0.95)";
 const dotRing = dark ? "rgba(10,10,10,0.55)" : "rgba(255,255,255,0.55)";

 /* latest-* mirrors let timeouts read fresh state without re-arming
 chains that drift. */
 const latest = useRef({ phase: phase as DotPhase, score, combo, mole });
 useEffect(() => {
 latest.current = { phase, score, combo, mole };
 if (bestRef.current === 0) bestRef.current = best;
 });

 useEffect(() => {
 if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
 const id = setInterval(() => setBlink((b) => !b), 700);
 return () => clearInterval(id);
 }, []);

 useEffect(() => {
 const s = setupCanvas(ref);
 if (!s) return;
 paintDots(s.ctx, s.S, DOTS_N, (x, y) => {
 const i = y * DOTS_N + x;
 if (phase === "play" && i === mole) return dotLit;
 if (i === flash) return "#E11A1B";
 if (phase === "idle" && i === 12) return blink ? dotLit : dotBase;
 return dotBase;
 });
 if (phase !== "idle") {
 const pitch = s.S / DOTS_N;
 const cx = (cursor % DOTS_N) + 0.5;
 const cy = Math.floor(cursor / DOTS_N) + 0.5;
 s.ctx.strokeStyle = dotRing;
 s.ctx.lineWidth = 2;
 s.ctx.beginPath();
 s.ctx.arc(cx * pitch, cy * pitch, pitch * 0.42, 0, Math.PI * 2);
 s.ctx.stroke();
 }
 return () => window.clearTimeout(flashTimer.current);
 }, [phase, mole, flash, cursor, blink, dotBase, dotLit, dotRing]);

 const gameOver = (finalScore: number) => {
 setPhase("over");
 setMole(null);
 setCombo(0);
 setIsNewBest(finalScore > bestStartRef.current);
 if (finalScore > bestRef.current) {
 bestRef.current = finalScore;
 setBest(finalScore);
 try {
 localStorage.setItem(BEST_KEY, String(finalScore));
 } catch {
 /* private mode */
 }
 [0.5, 0.75, 1].forEach((b, k) => window.setTimeout(() => coinSound(b), k * 110));
 } else {
 coinSound(0.15);
 }
 };

 const registerMiss = () => {
 const st = latest.current;
 if (st.phase !== "play") return;
 missesRef.current += 1;
 setCombo(0);
 setFlash(st.mole);
 window.clearTimeout(flashTimer.current);
 flashTimer.current = window.setTimeout(() => setFlash(null), 220);
 tapSound();
 if (missesRef.current >= 3) gameOver(st.score);
 };
 const missesRef = useRef(0);

 const start = () => {
 missesRef.current = 0;
 bestStartRef.current = bestRef.current;
 setIsNewBest(false);
 setScore(0);
 setCombo(0);
 setFlash(null);
 setMole(nextMole(null));
 setPhase("play");
 coinSound(0.4);
 };

 /* The round clock: every mole gets one interval. A hit re-arms it fresh
 off the new mole, so the ramp is always fair. */
 useEffect(() => {
 if (phase !== "play") return;
 const id = window.setTimeout(() => {
 const st = latest.current;
 if (st.phase !== "play" || st.mole === null) return;
 const nm = (missesRef.current += 1);
 setCombo(0);
 setFlash(st.mole);
 window.clearTimeout(flashTimer.current);
 flashTimer.current = window.setTimeout(() => setFlash(null), 220);
 tapSound();
 if (nm >= 3) gameOver(st.score);
 else setMole(nextMole(st.mole));
 }, speedFor(latest.current.score));
 return () => window.clearTimeout(id);
 }, [phase, mole, score]);

 const whack = (i: number) => {
 const st = latest.current;
 if (st.phase !== "play") {
 start();
 return;
 }
 setCursor(i);
 if (i === st.mole) {
 const c = st.combo + 1;
 const ns = st.score + 1;
 setCombo(c);
 setScore(ns);
 setMole(nextMole(st.mole));
 if (ns > bestRef.current) {
 // passing the best mid-run: the record ticks up with you, at pitch
 bestRef.current = ns;
 setBest(ns);
 try {
 localStorage.setItem(BEST_KEY, String(ns));
 } catch {
 /* private mode */
 }
 coinSound(Math.min(1, 0.35 + c * 0.06));
 window.setTimeout(() => coinSound(1), 90);
 } else {
 coinSound(Math.min(1, 0.35 + c * 0.06));
 }
 } else {
 registerMiss();
 }
 };

 const onPointer = (e: React.PointerEvent<HTMLDivElement>) => {
 const el = ref.current;
 if (!el) return;
 const r = el.getBoundingClientRect();
 const x = Math.min(DOTS_N - 1, Math.max(0, Math.floor(((e.clientX - r.left) / r.width) * DOTS_N)));
 const y = Math.min(DOTS_N - 1, Math.max(0, Math.floor(((e.clientY - r.top) / r.height) * DOTS_N)));
 whack(y * DOTS_N + x);
 };

 const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
 const moves: Record<string, [number, number]> = {
 ArrowLeft: [-1, 0],
 ArrowRight: [1, 0],
 ArrowUp: [0, -1],
 ArrowDown: [0, 1],
 };
 const move = moves[e.key];
 if (move) {
 e.preventDefault();
 const cx = Math.min(DOTS_N - 1, Math.max(0, (cursor % DOTS_N) + move[0]));
 const cy = Math.min(DOTS_N - 1, Math.max(0, Math.floor(cursor / DOTS_N) + move[1]));
 setCursor(cy * DOTS_N + cx);
 return;
 }
 if (e.key === "Enter" || e.key === " ") {
 e.preventDefault();
 whack(cursor);
 }
 };

 const isNewBestNow = phase === "over" && isNewBest;
 const value = dotsCaption(phase, score, best, isNewBestNow);

 return (
 <Tile
 label={`Reaction dots. ${phase === "play" ? `Score ${score}, best ${best}.` : phase === "over" ? `Game over, ${score}${isNewBestNow ? ", a new best" : ""}.` : best > 0 ? `Best ${best}.` : ""} Arrows move, Enter whacks.`}
 value={value}
 faceStyle={dark ? { background: "#FFFFFF" } : undefined}
 >
 <div
 role="button"
 tabIndex={0}
 aria-label={`Reaction dots game — ${value}. Arrows move the cursor, Enter whacks.`}
 onPointerDown={onPointer}
 onKeyDown={onKey}
 className="h-full w-full cursor-pointer outline-none"
 >
 <canvas ref={ref} aria-hidden className="pointer-events-none h-full w-full" />
 </div>
 </Tile>
 );
}

/* ── music: spinning record ───────────────────────────── */

type Track = {
 isPlaying: boolean;
 lastPlayed?: boolean;
 playedAt?: string | null;
 title?: string;
 artist?: string;
 songUrl?: string;
 albumArt?: string | null;
 progress?: number;
 duration?: number;
};

export function MusicTile() {
 const [track, setTrack] = useState<Track | null>(null);
 const [artOk, setArtOk] = useState(true);

 useEffect(() => {
 let dead = false;
 const KEY = "damilareoo-now-playing-v1";
 const once = async () => {
 try {
 const cached = sessionStorage.getItem(KEY);
 if (cached) {
 const json = JSON.parse(cached) as Track;
 if (typeof json.isPlaying === "boolean") {
 if (!dead) setTrack(json);
 return;
 }
 }
 } catch {
 /* private mode — fall through to the single fetch */
 }
 try {
 const res = await fetch("/api/now-playing", { cache: "no-store" });
 const json = (await res.json()) as Track;
 if (!dead && typeof json.isPlaying === "boolean") {
 setTrack(json);
 try {
 sessionStorage.setItem(KEY, JSON.stringify(json));
 } catch {
 /* private mode */
 }
 }
 else if (!dead) setTrack(null);
 } catch {
 if (!dead) setTrack(null);
 }
 };
 once();
 return () => {
 dead = true;
 };
 }, []);

 useEffect(() => {
 setArtOk(true);
 }, [track?.albumArt]);

 if (track === null || !track.title) return null;
 const playing = Boolean(track?.isPlaying && track.title);
 const lastPlayed = Boolean(!playing && track?.title);
 const status = playing ? "now playing" : "last played";
 const value = `${track.artist ?? status}`;
 const art = track?.albumArt ?? null;
 const artUrl = art && artOk ? `/api/now-playing/art?u=${encodeURIComponent(art)}` : null;

 return (
 <Tile
 label={playing ? `Now playing: ${track!.title} by ${track!.artist}` : lastPlayed ? `Last played: ${track!.title} by ${track!.artist}` : "Nothing playing"}
 value={value}
 faceStyle={{ background: "transparent", boxShadow: "none" }}
 >
 <div className="relative h-full w-full">
 {artUrl ? (
 <>
 {/* Cover-forward: full-bleed artwork, big title, record peeking
 off the edge. Falls back to the bare record without art. */}
 <svg viewBox="0 0 100 100" aria-hidden className="block h-full w-full">
 <defs>
 <linearGradient id="cover-scrim" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#0A0A0A" stopOpacity="0.55" />
 <stop offset="28%" stopColor="#0A0A0A" stopOpacity="0" />
 <stop offset="58%" stopColor="#0A0A0A" stopOpacity="0" />
 <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0.8" />
 </linearGradient>
 <clipPath id="vinyl-peek-label">
 <circle cx="84" cy="64" r="8" />
 </clipPath>
 </defs>
 <image
 href={artUrl}
 x="0"
 y="0"
 width="100"
 height="100"
 preserveAspectRatio="xMidYMid slice"
 onError={() => setArtOk(false)}
 />
 <rect x="0" y="0" width="100" height="100" fill="url(#cover-scrim)" />
 <g className={playing ? "vinyl-spin" : undefined}>
 <circle cx="84" cy="64" r="24" fill="#060607" stroke="rgba(255,255,255,0.16)" strokeWidth="0.6" />
 {[21, 18, 15, 12].map((r) => (
 <circle key={r} cx="84" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
 ))}
 <circle cx="84" cy="64" r="8" fill="#101013" />
 <image
 href={artUrl}
 x="76"
 y="56"
 width="16"
 height="16"
 preserveAspectRatio="xMidYMid slice"
 clipPath="url(#vinyl-peek-label)"
 onError={() => setArtOk(false)}
 />
 <circle cx="84" cy="64" r="8" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
 <circle cx="84" cy="64" r="1.4" fill="#0A0A0A" stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" />
 </g>
 </svg>
 <div className="pointer-events-none absolute inset-x-0 top-0 p-3" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.85)" }}>
 <p className="font-sans text-2xs uppercase tracking-[0.2em] text-white/75">{status}</p>
 <p className="mt-1 line-clamp-2 font-sans text-base font-medium leading-tight text-white">
 {track!.title}
 </p>
 </div>
 </>
 ) : (
 /* No artwork: the bare record waits. */
 <svg viewBox="0 0 100 100" role="img" aria-hidden className="block h-full w-full">
 <circle cx="50" cy="50" r="50" fill="#141414" />
 <g className={playing ? "vinyl-spin" : undefined}>
 <circle cx="50" cy="50" r="46" fill="#060607" stroke="rgba(255,255,255,0.10)" strokeWidth="0.6" />
 {[42, 38, 34, 30, 26].map((r) => (
 <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
 ))}
 <path d="M 50 4 A 46 46 0 0 1 96 50" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="2.5" strokeLinecap="round" />
 <circle cx="50" cy="50" r="15" fill="#101013" />
 <circle cx="50" cy="50" r="15" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="0.6" />
 <circle cx="50" cy="50" r="1.7" fill="#0A0A0A" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
 </g>
 </svg>
 )}
 {(playing || lastPlayed) && track!.songUrl && (
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

/* ── steps: run-trace tile ──────────────────────────────── */

/** Step counts stay inside the tile caption: four digits plain, beyond
 that whole thousands. */
export function fmtSteps(n: number): string {
 const v = Math.max(0, Math.floor(n));
 if (v < 10000) return String(v);
 return `${Math.min(999, Math.round(v / 1000))}k`;
}

type StepsReading = { km: number; averageKm: number; steps: number; date: string } | null;

/* The five share canvases, measured off the poster exports — the tile wears
 one a day, rotating, exactly the poster rotation on the live concept. */
export const PEDO_CANVASES = [
 { name: "onyx", bg: "#0b0b0d", ink: "#ffffff", dim: "rgba(255,255,255,0.10)", hot: "#E11A1B", chip: "#FFFFFF", onChip: "#0B0B0D" },
 { name: "bone", bg: "#ffffff", ink: "#0a0a0a", dim: "rgba(10,10,10,0.10)", hot: "#E11A1B", chip: "#0A0A0A", onChip: "#FFFFFF" },
 { name: "signal", bg: "#e11b1c", ink: "#ffffff", dim: "rgba(255,255,255,0.16)", hot: "#ffffff", chip: "#FFFFFF", onChip: "#E11A1B" },
 { name: "volt", bg: "#ffd60a", ink: "#0a0a0a", dim: "rgba(10,10,10,0.12)", hot: "#E11A1B", chip: "#0A0A0A", onChip: "#FFD60A" },
 { name: "dusk", bg: "#3c2b35", ink: "#ffffff", dim: "rgba(255,255,255,0.12)", hot: "#E11A1B", chip: "#FFFFFF", onChip: "#232838" },
];

/** The tile wears one canvas, bound to the page theme: black on light,
 white on dark. No rotation — contrast is the whole point. */
export function canvasForTheme(theme: string | undefined) {
 return theme === "dark"
 ? PEDO_CANVASES.find((c) => c.name === "bone") ?? PEDO_CANVASES[0]
 : (PEDO_CANVASES.find((c) => c.name === "onyx") ?? PEDO_CANVASES[0]);
}

/** One canvas a day, rotating — stable per calendar day, no storage. */
export function canvasForDay(dayIndex: number) {
 return PEDO_CANVASES[((dayIndex % PEDO_CANVASES.length) + PEDO_CANVASES.length) % PEDO_CANVASES.length];
}

/** The run route itself, sampled off the concept's shared path
 (lib/route.ts in the nothing-pedometer repo — one path, every
 renderer): 70 dots every ~9 units along its 626-unit length,
 normalized to the 360×250 viewBox. First point is the start (44, 200);
 the privacy point sits at (96, 200). */
export const ROUTE_PTS: Array<[number, number]> = [
 [0.1222, 0.8], [0.1235, 0.7641], [0.1271, 0.7285], [0.1336, 0.6938], [0.1434, 0.6607],
 [0.1566, 0.6302], [0.1732, 0.6033], [0.1928, 0.581], [0.2147, 0.5639], [0.2384, 0.5524],
 [0.263, 0.5464], [0.288, 0.5455], [0.3128, 0.5494], [0.3375, 0.5554], [0.3624, 0.5542],
 [0.386, 0.5432], [0.4071, 0.524], [0.426, 0.5004], [0.4441, 0.4755], [0.4627, 0.4516],
 [0.4829, 0.4304], [0.5051, 0.4138], [0.5288, 0.4029], [0.5536, 0.3977], [0.5785, 0.398],
 [0.6031, 0.4041], [0.6269, 0.4153], [0.6497, 0.4299], [0.6721, 0.4459], [0.6948, 0.4611],
 [0.7182, 0.4734], [0.7426, 0.481], [0.7676, 0.4828], [0.7925, 0.4794], [0.8174, 0.4781],
 [0.8418, 0.4854], [0.8633, 0.5031], [0.879, 0.531], [0.8869, 0.5649], [0.8877, 0.6008],
 [0.8828, 0.636], [0.8732, 0.6692], [0.8595, 0.6991], [0.8415, 0.7241], [0.8205, 0.7434],
 [0.7978, 0.7585], [0.7748, 0.7725], [0.7527, 0.7894], [0.7346, 0.8139], [0.7231, 0.8458],
 [0.7067, 0.8727], [0.6854, 0.8915], [0.6618, 0.9032], [0.6371, 0.9082], [0.6122, 0.9068],
 [0.5879, 0.8984], [0.5652, 0.9085], [0.5418, 0.9211], [0.5177, 0.9306], [0.4931, 0.937],
 [0.4682, 0.9404], [0.4432, 0.9408], [0.4183, 0.9382], [0.3936, 0.9326], [0.3694, 0.9234],
 [0.3462, 0.9103], [0.3244, 0.8928], [0.3038, 0.8724], [0.2846, 0.8493], [0.2698, 0.8206],
];

const fmtKm = (n: number) => n.toFixed(2);

/* Run figures scale off the curated sample (32:14 over 5.2 km, 268 kcal,
 6'12''/KM) — the day's live kilometres drive time and energy so the tile
 always reconciles with the day that contains it. */
export const RUN_BASE_KM = 5.2;
const RUN_BASE_SEC = 32 * 60 + 14;
const RUN_BASE_KCAL = 268;
export const RUN_PACE = "6'12''";

export function runTimeForKm(km: number): string {
 const total = Math.max(0, (RUN_BASE_SEC * km) / RUN_BASE_KM);
 let m = Math.floor(total / 60);
 let s = Math.round(total % 60);
 if (s === 60) {
 m += 1;
 s = 0;
 }
 return `${m}:${String(s).padStart(2, "0")}`;
}

export function kcalForKm(km: number): number {
 return Math.max(0, Math.round((RUN_BASE_KCAL * km) / RUN_BASE_KM));
}

/** 5×7 dot-matrix numerals — the concept's own letterforms
 (nothing-pedometer dot-matrix), digits and point only. */
export const TILE_GLYPHS: Record<string, string[]> = {
 "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
 "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
 "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
 "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
 "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
 "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
 "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
 "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
 "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
 "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
 ".": ["00000", "00000", "00000", "00000", "00000", "00110", "00110"],
};

/** Ink held at a fixed floor — the poster's unlit matrix (0.08), measured
 off the exports, not the text-dim token. */
export function inkFloor(hex: string, alpha: number): string {
 const n = parseInt(hex.slice(1), 16);
 return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

/* Mini-poster geometry (300×300 face), measured off the adequate-size
 exports: matrix 17 columns at pitch 9.5, KILOMETRES caps under it,
 route band with endpoints at 0.8 height, stats baseline at 288. */
const FACE = 300;
const MX_PITCH = 9.5;
const MX_COLS = 17;
const MX_X = (FACE - MX_COLS * MX_PITCH) / 2;
const MX_Y = 13;
const MX_DOT = 3.2;
const KILO_Y = 103;
/* Route in poster coordinates: translate(50,125.3) scale(0.5556) over the
 360×250 viewBox — the adequate exports are 0.485 crops of the poster,
 so this lands dots, endpoints, and air exactly where they sit there. */
const ROUTE_TX = 50;
const ROUTE_TY = 125.3;
const ROUTE_SC = 0.5556;
const ROUTE_DOT = 0.83;
const ROUTE_END = 3.9;
const STATS_Y = 284;
const MONO = "var(--font-bdo), system-ui, sans-serif";

export function StepsTile() {
 const runnerRef = useRef<SVGCircleElement>(null);
 const [data, setData] = useState<StepsReading>(null);
 /* Theme-bound canvas: black tile on light pages, white on dark. */
 const pal = canvasForTheme(useDark() ? "dark" : undefined);

 useEffect(() => {
 let dead = false;
 const KEY = "damilareoo-steps-v1";
 const once = async () => {
 try {
 const cached = sessionStorage.getItem(KEY);
 if (cached) {
 const j = JSON.parse(cached);
 if (j && typeof j.km === "number") {
 if (!dead) setData({ km: j.km, averageKm: j.averageKm ?? j.km, steps: j.steps ?? 0, date: j.date ?? "" });
 return;
 }
 }
 } catch {
 /* private mode — fall through to the single fetch */
 }
 try {
 const res = await fetch("/api/steps", { cache: "no-store" });
 const j = await res.json();
 if (!dead && j && j.configured && typeof j.km === "number") {
 const reading = { km: j.km, averageKm: j.averageKm ?? j.km, steps: j.steps ?? 0, date: j.date ?? "" };
 setData(reading);
 try {
 sessionStorage.setItem(KEY, JSON.stringify(reading));
 } catch {
 /* private mode */
 }
 }
 } catch {
 /* offline — unconfigured widgets stay unrendered */
 }
 };
 once();
 return () => {
 dead = true;
 };
 }, []);

 /* Travelling dot: written straight to the DOM so the loop never
 re-renders. Parked (hidden) with no data or under reduced motion. */
 useEffect(() => {
 const el = runnerRef.current;
 if (!el || !data) {
 return;
 }
 if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
 el.style.display = "none";
 return;
 }
 el.style.display = "";
 let raf = 0;
 const t0 = performance.now();
 const loop = (now: number) => {
 const [nx, ny] = ROUTE_PTS[Math.floor(((now - t0) / 45) % ROUTE_PTS.length)];
 el.setAttribute("cx", String(ROUTE_TX + nx * 360 * ROUTE_SC));
 el.setAttribute("cy", String(ROUTE_TY + ny * 250 * ROUTE_SC));
 raf = requestAnimationFrame(loop);
 };
 raf = requestAnimationFrame(loop);
 return () => cancelAnimationFrame(raf);
 }, [data, pal]);

 /* Unconfigured: nothing server-side, nothing before data — a dead
 tile must not cost a caption flash nor a second request. */
 if (!data) return null;

 /* The mini-poster: live kilometres as dot-matrix, the shared trace with
 its endpoints, and figures scaled off the distance — the adequate-size
 composition, exactly. */
 const km = data?.km ?? 0;
 const dist = km.toFixed(1);
 const time = runTimeForKm(km);
 const kcal = kcalForKm(km);
 const live = Boolean(data);
 const routeX = (nx: number) => ROUTE_TX + nx * 360 * ROUTE_SC;
 const routeY = (ny: number) => ROUTE_TY + ny * 250 * ROUTE_SC;

 return (
 <Tile
 label={`Run ${data.date}: ${fmtKm(data.km)} kilometres in ${time}, ${kcal} kilocalories, ${data.steps.toLocaleString("en-US")} steps. 7-day average ${fmtKm(data.averageKm)} kilometres, on the ${pal.name} canvas.`}
 value={`${fmtKm(data.km)} km · ${fmtSteps(data.steps)}`}
 faceStyle={{ background: pal.bg }}
 >
 <svg viewBox={`0 0 ${FACE} ${FACE}`} aria-hidden className="block h-full w-full">
 {dist.split("").flatMap((ch, ci) =>
 (TILE_GLYPHS[ch] ?? TILE_GLYPHS["0"]).flatMap((row, r) =>
 row.split("").map((bit, c) => (
 <circle
 key={`${ci}-${r}-${c}`}
 cx={MX_X + ci * 6 * MX_PITCH + c * MX_PITCH + MX_PITCH / 2}
 cy={MX_Y + r * MX_PITCH + MX_PITCH / 2}
 r={MX_DOT}
 fill={bit === "1" && live ? pal.ink : inkFloor(pal.ink, 0.08)}
 />
 )),
 ),
 )}
 <text x={FACE / 2} y={KILO_Y} textAnchor="middle" fontFamily={MONO} fontSize={10} letterSpacing={2.8} fill={live ? pal.ink : pal.dim}>
 KILOMETRES
 </text>
 {ROUTE_PTS.map(([nx, ny], i) => (
 <circle key={i} cx={routeX(nx)} cy={routeY(ny)} r={ROUTE_DOT} fill={live ? pal.ink : pal.dim} />
 ))}
 <circle cx={routeX(44 / 360)} cy={routeY(200 / 250)} r={ROUTE_END} fill={live ? pal.ink : pal.dim} />
 <circle cx={routeX(96 / 360)} cy={routeY(200 / 250)} r={ROUTE_END} fill={live ? pal.hot : pal.dim} />
 {live && <circle ref={runnerRef} cx={routeX(ROUTE_PTS[0][0])} cy={routeY(ROUTE_PTS[0][1])} r={4} fill={pal.ink} />}
 <text x={FACE / 2} y={STATS_Y} textAnchor="middle" fontFamily={MONO} fontSize={11.5} fill={live ? pal.ink : pal.dim}>
 <tspan>{time}</tspan>
 <tspan dx={17}>{RUN_PACE}/KM</tspan>
 <tspan dx={17}>{kcal} KCAL</tspan>
 </text>
 </svg>
 </Tile>
 );
}
