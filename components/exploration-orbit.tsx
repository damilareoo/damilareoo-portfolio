"use client";

import { useEffect, useRef, useState } from "react";
import type { LabShots } from "./lab-set";

const pad = (i: number) => String(i + 1).padStart(2, "0");
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

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
 * Exploration: orbit.
 * The eleven covers are planets on a spinnable globe — drag to spin,
 * tap one to pull it front, arrows step the chart. The front planet
 * names itself below. Pure 2D canvas (no WebGL to lose), parks under
 * reduced motion, pauses offscreen. Concepts don't open.
 */
export function ExplorationOrbit({ shots }: { shots: LabShots[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [at, setAt] = useState(0);
  const atRef = useRef(0);
  const apiRef = useRef<{ step: (d: 1 | -1) => void }>({ step: () => {} });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || shots.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pts = sphere(shots.length);
    const imgs = shots.map((s) => {
      const im = new Image();
      im.src = s.src;
      return im;
    });

    let rotX = 0.35;
    let rotY = 0;
    let velX = 0;
    let velY = reduced ? 0 : 0.0016;
    let target: { x: number; y: number } | null = null;
    let raf = 0;
    let visible = true;
    let w = 0;
    let h = 0;

    const size = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.max(1, Math.round(r.width * dpr));
      h = Math.max(1, Math.round(r.height * dpr));
      canvas.width = w;
      canvas.height = h;
    };
    size();
    window.addEventListener("resize", size);

    const rotated = (p: Pt): Pt => {
      const cy = Math.cos(rotY);
      const sy = Math.sin(rotY);
      const x1 = p.x * cy + p.z * sy;
      const z1 = -p.x * sy + p.z * cy;
      const cx = Math.cos(rotX);
      const sx = Math.sin(rotX);
      const y1 = p.y * cx - z1 * sx;
      const z2 = p.y * sx + z1 * cx;
      return { x: x1, y: y1, z: z2 };
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const R = Math.min(w, h) * 0.36;
      const cx = w / 2;
      const cy = h / 2;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(250,250,250,0.14)";
      ctx.lineWidth = Math.max(1, R * 0.006);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(250,250,250,0.05)";
      ctx.lineWidth = Math.max(2, R * 0.05);
      ctx.stroke();
      ctx.restore();
      const order = pts
        .map((p, i) => ({ p: rotated(p), i }))
        .sort((a, b) => a.p.z - b.p.z);
      for (const { p, i } of order) {
        const t = (p.z + 1) / 2;
        const rad = R * (0.16 + 0.2 * t);
        const x = cx + p.x * R;
        const y = cy + p.y * R;
        const im = imgs[i];
        ctx.save();
        ctx.globalAlpha = 0.35 + 0.65 * t;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.clip();
        if (im.complete && im.naturalWidth > 0) {
          ctx.drawImage(im, x - rad, y - rad, rad * 2, rad * 2);
        } else {
          ctx.fillStyle = "#2b2b2b";
          ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
        }
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = 0.35 + 0.65 * t;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.lineWidth = Math.max(1, rad * 0.06) * (t > 0.92 ? 2 : 1);
        ctx.strokeStyle = t > 0.92 ? "#fafafa" : "rgba(250,250,250,0.35)";
        ctx.stroke();
        ctx.restore();
      }
      const front = order[order.length - 1];
      if (front && front.i !== atRef.current) {
        atRef.current = front.i;
        setAt(front.i);
      }
    };

    const tick = () => {
      if (visible) {
        if (target) {
          rotY += (target.y - rotY) * 0.1;
          rotX += (target.x - rotX) * 0.1;
          if (Math.abs(target.y - rotY) < 0.005 && Math.abs(target.x - rotX) < 0.005) target = null;
        } else if (!reduced) {
          rotY += velY;
          rotX += velX;
          velX *= 0.95;
          velY += (0.0016 - velY) * 0.02;
          rotX = Math.max(-1.1, Math.min(1.1, rotX));
        }
        draw();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.05 });
    io.observe(canvas);

    let down: { x: number; y: number } | null = null;
    let moved = false;
    let last = { x: 0, y: 0 };
    const onDown = (e: PointerEvent) => {
      down = { x: e.clientX, y: e.clientY };
      last = { x: e.clientX, y: e.clientY };
      moved = false;
      target = null;
      canvas.setPointerCapture?.(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      last = { x: e.clientX, y: e.clientY };
      if (Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y) > 6) moved = true;
      if (moved) {
        rotY += dx * 0.008;
        rotX += dy * 0.005;
        rotX = Math.max(-1.1, Math.min(1.1, rotX));
        velY = dx * 0.0004;
        velX = dy * 0.0002;
      }
    };
    const onUp = (e: PointerEvent) => {
      if (down && !moved) {
        const r = canvas.getBoundingClientRect();
        const scale = canvas.width / r.width;
        const mx = (e.clientX - r.left) * scale;
        const my = (e.clientY - r.top) * scale;
        const R = Math.min(canvas.width, canvas.height) * 0.36;
        const cxp = canvas.width / 2;
        const cyp = canvas.height / 2;
        let best = -1;
        let bestZ = -Infinity;
        pts.forEach((p, i) => {
          const q = rotated(p);
          const t = (q.z + 1) / 2;
          const rad = R * (0.16 + 0.2 * t) + 6 * scale;
          const x = cxp + q.x * R;
          const y = cyp + q.y * R;
          if (Math.hypot(mx - x, my - y) < rad && q.z > bestZ) {
            bestZ = q.z;
            best = i;
          }
        });
        if (best >= 0) {
          const q = rotated(pts[best]);
          target = {
            x: Math.max(-1.1, Math.min(1.1, rotX - Math.asin(Math.max(-1, Math.min(1, q.y))))),
            y: rotY - Math.atan2(q.x, q.z),
          };
        }
      }
      down = null;
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", () => (down = null));

    apiRef.current.step = (d: 1 | -1) => {
      const next = (atRef.current + d + shots.length) % shots.length;
      const nxt = rotated(pts[next]);
      target = {
        x: Math.max(-1.1, Math.min(1.1, rotX - Math.asin(Math.max(-1, Math.min(1, nxt.y))) * 0.5)),
        y: rotY + d * ((Math.PI * 2) / shots.length),
      };
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", size);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
    };
  }, [shots]);

  const label = shots[at]?.alt.replace(" — cover", "") ?? "";

  return (
    <div className="flex h-80 flex-col">
      <canvas
        ref={canvasRef}
        aria-label={`Spinning globe of ${shots.length} album covers. Drag to spin, use the arrows to step the chart.`}
        className="min-h-0 w-full flex-1 cursor-grab touch-pan-y rounded-xl bg-[#0d0d0d] active:cursor-grabbing"
      />
      <div className="flex items-center justify-between pt-2">
        <p aria-live="polite" className="truncate font-mono text-[11px] text-[#55534f]">
          <span className="tabular-nums text-[#767676] dark:text-[#8a8a8a]">{pad(at)}</span>
          {" — "}
          {label}
        </p>
        <div className="flex flex-none gap-2 pl-2">
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
