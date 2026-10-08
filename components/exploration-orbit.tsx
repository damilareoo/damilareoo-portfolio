"use client";

import { useEffect, useRef, useState } from "react";
import type { LabShots } from "./lab-set";

const pad = (i: number) => String(i + 1).padStart(2, "0");
const TAU = Math.PI * 2;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
/** Slow majestic drift: one lap per ~50s. */
const BASE = 0.125;

type Pt = { x: number; y: number; z: number };

/** Evenly spread points on a sphere (fibonacci). */
function sphere(n: number): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const t = i * GOLDEN;
    return { x: Math.cos(t) * r, y, z: Math.sin(t) * r };
  });
}

/**
 * Exploration: orbit, done properly.
 * The eleven covers are planets on a glass globe — sphere glow, rim,
 * equator, back hemisphere dimmed behind glass. It drifts on its own;
 * drag to spin with real inertia, tap a planet to pull it front,
 * arrows step the chart. Front planet names itself. Pure 2D canvas,
 * time-based physics (same speed on any display), parked offscreen
 * and under reduced motion. Concepts don't open.
 */
export function ExplorationOrbit({ shots }: { shots: LabShots[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [at, setAt] = useState(0);
  const [paused, setPaused] = useState(false);
  const atRef = useRef(0);
  const pausedRef = useRef(false);
  const apiRef = useRef<{ step: (d: 1 | -1) => void; toggle: () => void }>({
    step: () => {},
    toggle: () => {},
  });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas || shots.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pts = sphere(shots.length);
    const imgs = shots.map((s) => {
      const im = new Image();
      im.src = s.src;
      return im;
    });
    const stars = Array.from({ length: 70 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 0.9,
      a: 0.12 + Math.random() * 0.3,
    }));

    let W = 0;
    let H = 0;
    const fit = () => {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(1.75, window.devicePixelRatio || 1);
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);

    let rotX = 0.38;
    let rotY = 0;
    let vel = reduced ? 0 : BASE;
    let velX = 0;
    let target: { x: number; y: number } | null = null;
    let dragging = false;
    let raf = 0;
    let visible = true;

    const spinY = (p: Pt, ry: number): Pt => {
      const c = Math.cos(ry);
      const s = Math.sin(ry);
      return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
    };
    const spinX = (p: Pt, rx: number): Pt => {
      const c = Math.cos(rx);
      const s = Math.sin(rx);
      return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
    };
    const rotated = (p: Pt): Pt => spinX(spinY(p, rotY), rotX);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const R = Math.min(W, H) * 0.36;
      const cx = W / 2;
      const cy = H / 2 - 4;

      for (const s of stars) {
        ctx.globalAlpha = s.a;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      const glow = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 1.4);
      glow.addColorStop(0, "rgba(255,255,255,0.07)");
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.4, 0, TAU);
      ctx.fill();

      const order = pts.map((p, i) => ({ q: rotated(p), i })).sort((a, b) => a.q.z - b.q.z);
      const planet = (q: Pt, i: number, front: boolean) => {
        const t = (q.z + 1) / 2;
        const rad = R * (0.13 + 0.21 * t);
        const x = cx + q.x * R;
        const y = cy + q.y * R;
        const im = imgs[i];
        ctx.save();
        ctx.globalAlpha = front ? 0.6 + 0.4 * t : 0.22 + 0.38 * t;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, TAU);
        ctx.clip();
        if (im.complete && im.naturalWidth > 0) {
          ctx.drawImage(im, x - rad, y - rad, rad * 2, rad * 2);
        } else {
          ctx.fillStyle = "#1c1c1c";
          ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
        }
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = front ? 0.5 + 0.5 * t : 0.3;
        if (front && t > 0.93) {
          ctx.shadowColor = "rgba(255,255,255,0.55)";
          ctx.shadowBlur = 16;
        }
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, TAU);
        ctx.lineWidth = front && t > 0.93 ? 2 : 1;
        ctx.strokeStyle = front && t > 0.93 ? "#fafafa" : "rgba(250,250,250,0.4)";
        ctx.stroke();
        ctx.restore();
      };

      for (const { q, i } of order) if (q.z < 0) planet(q, i, false);

      const glass = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      glass.addColorStop(0, "rgba(255,255,255,0.075)");
      glass.addColorStop(1, "rgba(255,255,255,0.015)");
      ctx.fillStyle = glass;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(250,250,250,0.22)";
      ctx.lineWidth = Math.max(1, R * 0.008);
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = "rgba(250,250,250,0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, R, R * 0.3, -0.15, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = "rgba(250,250,250,0.08)";
      ctx.beginPath();
      ctx.ellipse(cx, cy, R * 0.34, R, -0.15, 0, TAU);
      ctx.stroke();

      for (const { q, i } of order) if (q.z >= 0) planet(q, i, true);

      const front = order[order.length - 1];
      if (front && front.i !== atRef.current) {
        atRef.current = front.i;
        setAt(front.i);
      }
    };

    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const live = target !== null || dragging || (!reduced && !pausedRef.current);
      if (visible && !document.hidden && live) {
        if (target) {
          const k = reduced ? 1 : 1 - Math.exp(-dt * 5);
          rotY += (target.y - rotY) * k;
          rotX += (target.x - rotX) * k;
          if (Math.abs(target.y - rotY) < 0.004 && Math.abs(target.x - rotX) < 0.004) target = null;
        } else if (!reduced) {
          rotY += vel * dt;
          rotX = clamp(rotX + velX * dt, -0.9, 0.9);
          const f = Math.exp(-dt * 1.1);
          vel = vel * f + BASE * (1 - f);
          velX *= f;
        }
        draw();
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.05 });
    io.observe(wrap);

    const bringFront = (i: number) => {
      const q = spinY(pts[i], rotY);
      let d = -Math.atan2(q.x, q.z);
      if (d > Math.PI) d -= TAU;
      if (d < -Math.PI) d += TAU;
      const t = { y: rotY + d, x: clamp(rotX * 0.4, -0.6, 0.6) };
      if (reduced) {
        rotY = t.y;
        rotX = t.x;
        draw();
      } else {
        target = t;
      }
    };

    let down: { x: number; y: number } | null = null;
    let lastP = { x: 0, y: 0 };
    let lastT = 0;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      down = { x: e.clientX, y: e.clientY };
      lastP = { x: e.clientX, y: e.clientY };
      lastT = e.timeStamp;
      target = null;
      canvas.setPointerCapture?.(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging || !down) return;
      const dx = e.clientX - lastP.x;
      const dy = e.clientY - lastP.y;
      lastP = { x: e.clientX, y: e.clientY };
      const dt = Math.max(8, e.timeStamp - lastT) / 1000;
      lastT = e.timeStamp;
      rotY += dx * 0.006;
      rotX = clamp(rotX + dy * 0.004, -0.9, 0.9);
      const iv = 0.75;
      vel = vel * iv + ((dx * 0.006) / dt) * (1 - iv);
      velX = velX * iv + ((dy * 0.004) / dt) * (1 - iv);
    };
    const onUp = (e: PointerEvent) => {
      const tapped = down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6;
      down = null;
      dragging = false;
      if (reduced) {
        vel = 0;
        velX = 0;
      } else {
        vel = clamp(vel, -6, 6);
        velX = clamp(velX, -3, 3);
      }
      if (!tapped) return;
      const r = canvas.getBoundingClientRect();
      const sc = canvas.width / r.width;
      const mx = (e.clientX - r.left) * sc;
      const my = (e.clientY - r.top) * sc;
      const R = Math.min(canvas.width, canvas.height) * 0.36;
      const cxp = canvas.width / 2;
      const cyp = canvas.height / 2 - 4 * sc;
      let best = -1;
      let bestZ = -Infinity;
      pts.forEach((p, i) => {
        const q = rotated(p);
        const t = (q.z + 1) / 2;
        const rad = R * (0.13 + 0.21 * t) + 8 * sc;
        const x = cxp + q.x * R;
        const y = cyp + q.y * R;
        const ex = (e.clientX - r.left) * sc;
        const ey = (e.clientY - r.top) * sc;
        if (Math.hypot(ex - x, ey - y) < rad && q.z > bestZ) {
          bestZ = q.z;
          best = i;
        }
      });
      if (best >= 0) bringFront(best);
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", () => {
      down = null;
      dragging = false;
    });

    apiRef.current.step = (d: 1 | -1) => bringFront((atRef.current + d + shots.length) % shots.length);
    apiRef.current.toggle = () => {
      pausedRef.current = !pausedRef.current;
      setPaused(pausedRef.current);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
    };
  }, [shots]);

  const label = shots[at]?.alt.replace(" — cover", "") ?? "";

  return (
    <div className="flex h-80 flex-col">
      <div
        ref={wrapRef}
        role="slider"
        tabIndex={0}
        aria-label={`Orbiting globe of ${shots.length} album covers. Currently ${label}. Drag to spin, use arrows to step.`}
        aria-valuemin={1}
        aria-valuemax={shots.length}
        aria-valuenow={at + 1}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); apiRef.current.step(1); }
          else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); apiRef.current.step(-1); }
        }}
        className="relative min-h-0 flex-1 overflow-hidden rounded-xl bg-[#0d0d0d]"
      >
        <canvas ref={canvasRef} className="block h-full w-full cursor-grab touch-pan-y active:cursor-grabbing" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <p aria-live="polite" className="truncate font-mono text-[11px] text-[#55534f]">
          <span className="tabular-nums text-[#767676] dark:text-[#8a8a8a]">{pad(at)}</span>
          {" — "}
          {label}
        </p>
        <div className="flex flex-none items-center gap-2 pl-2">
          <button
            type="button"
            onClick={() => apiRef.current.toggle()}
            aria-pressed={!paused}
            aria-label={paused ? "Resume the orbit" : "Pause the orbit"}
            className="cursor-pointer font-mono text-[11px] uppercase tracking-widest text-[#767676] transition-colors hover:text-[#171717] dark:text-[#8a8a8a] dark:hover:text-white"
          >
            {paused ? "play" : "pause"}
          </button>
          <button
            type="button"
            onClick={() => apiRef.current.step(-1)}
            aria-label="Previous record"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full ring-1 ring-[#e0e0e0] transition-colors hover:text-[#171717] dark:ring-[#2e2e2e] dark:hover:text-white"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => apiRef.current.step(1)}
            aria-label="Next record"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full ring-1 ring-[#e0e0e0] transition-colors hover:text-[#171717] dark:ring-[#2e2e2e] dark:hover:text-white"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
