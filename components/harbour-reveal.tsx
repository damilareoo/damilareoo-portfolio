"use client";

import { useEffect, useRef, useState } from "react";

const SRC = "/dossier/harbour-ship.mp4";
const POSTER = "/dossier/harbour-ship-poster.png";

/**
 * Harbour reveal — condensation you wipe away to find the ship.
 *
 * The reference (sa-sa-sa) is a milky frosted pane: dense micro-speckle,
 * scattered beaded droplets with a highlight, and thin vertical drip trails
 * each ending in a bead. A drag clears it to sharp video. So the overlay is
 * a canvas that paints that frost once, then erases with a soft organic
 * brush under the pointer. The looping harbour ship lives underneath.
 *
 * Reduced motion / no JS: the ship video (or its poster) with no frost.
 */
export function HarbourReveal() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [simple, setSimple] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [touched, setTouched] = useState(false);
  const [frostKey, setFrostKey] = useState(0);
  const stateRef = useRef({
    w: 0,
    h: 0,
    down: false,
    cleared: 0,
    samples: 0,
    done: false,
  });

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setSimple(true);
      }
    });
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return () => cancelAnimationFrame(raf);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      setSimple(true);
      return () => cancelAnimationFrame(raf);
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;

    // Deterministic pseudo-random so the frost is stable per load.
    let seed = 20261003;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 0xffffffff;
    };

    type Drip = { x: number; y: number; len: number; w: number; bead: number };
    let drips: Drip[] = [];

    const paintFrost = () => {
      // Milky sage-grey pane, like the reference mid-wipe.
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#c9cfc4");
      g.addColorStop(0.5, "#bdc4b8");
      g.addColorStop(1, "#aeb6ac");
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // Dense micro-speckle — the condensation grain.
      for (let i = 0; i < 5200; i++) {
        const x = rnd() * W;
        const y = rnd() * H;
        const r = 0.4 + rnd() * 1.1;
        ctx.fillStyle =
          rnd() > 0.5 ? "rgba(255,255,255,0.28)" : "rgba(40,48,42,0.16)";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Beaded droplets with a top-left highlight, as in the reference.
      for (let i = 0; i < 150; i++) {
        const x = rnd() * W;
        const y = rnd() * H;
        const r = 1.5 + rnd() * rnd() * 7;
        // Dark rim.
        ctx.fillStyle = "rgba(45,55,48,0.28)";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        // Glass body.
        const body = ctx.createRadialGradient(
          x - r * 0.3,
          y - r * 0.3,
          r * 0.1,
          x,
          y,
          r,
        );
        body.addColorStop(0, "rgba(255,255,255,0.85)");
        body.addColorStop(0.55, "rgba(230,236,228,0.45)");
        body.addColorStop(1, "rgba(120,130,122,0.35)");
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        // Specular dot.
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.beginPath();
        ctx.arc(x - r * 0.32, y - r * 0.34, Math.max(0.5, r * 0.22), 0, Math.PI * 2);
        ctx.fill();
      }

      // Vertical drip trails, each ending in a bead.
      drips = Array.from({ length: 14 }, () => ({
        x: rnd() * W,
        y: rnd() * H * 0.55,
        len: H * (0.12 + rnd() * 0.3),
        w: 1.5 + rnd() * 2,
        bead: 2.5 + rnd() * 4.5,
      }));
      for (const d of drips) {
        const trail = ctx.createLinearGradient(0, d.y, 0, d.y + d.len);
        trail.addColorStop(0, "rgba(70,80,72,0)");
        trail.addColorStop(0.35, "rgba(70,80,72,0.22)");
        trail.addColorStop(1, "rgba(70,80,72,0.34)");
        ctx.strokeStyle = trail;
        ctx.lineWidth = d.w;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        // Slight wobble like a real run.
        ctx.bezierCurveTo(
          d.x + 3,
          d.y + d.len * 0.3,
          d.x - 3,
          d.y + d.len * 0.6,
          d.x + 1,
          d.y + d.len,
        );
        ctx.stroke();
        // Bead at the foot of the run.
        const bx = d.x + 1;
        const by = d.y + d.len;
        ctx.fillStyle = "rgba(40,50,44,0.4)";
        ctx.beginPath();
        ctx.arc(bx, by, d.bead, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.beginPath();
        ctx.arc(bx - d.bead * 0.3, by - d.bead * 0.3, d.bead * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      W = Math.max(1, Math.round(rect.width * dpr));
      H = Math.max(1, Math.round(rect.height * dpr));
      canvas.width = W;
      canvas.height = H;
      seed = 20261003;
      paintFrost();
      stateRef.current.cleared = 0;
      stateRef.current.samples = 0;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const coarse =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;
    const lastRef = { x: 0, y: 0, live: false };

    const stamp = (x: number, y: number, R: number) => {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      // Soft organic brush: three overlapping soft discs so the wipe edge
      // stays irregular like a finger on glass, not a perfect circle.
      const blobs: Array<[number, number, number]> = [
        [0, 0, R],
        [R * 0.35, R * 0.15, R * 0.7],
        [-R * 0.3, -R * 0.2, R * 0.6],
      ];
      for (const [dx, dy, r] of blobs) {
        const rad = ctx.createRadialGradient(x + dx, y + dy, r * 0.2, x + dx, y + dy, r);
        rad.addColorStop(0, "rgba(0,0,0,1)");
        rad.addColorStop(0.55, "rgba(0,0,0,0.75)");
        rad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = rad;
        ctx.beginPath();
        ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const eraseAt = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * W;
      const y = ((clientY - rect.top) / rect.height) * H;
      const R = (coarse ? 84 : 64) * dpr;
      if (!lastRef.live) {
        stamp(x, y, R);
      } else {
        // Stamp along the segment so fast drags wipe solid, not dotted.
        const dx = x - lastRef.x;
        const dy = y - lastRef.y;
        const dist = Math.hypot(dx, dy);
        const step = Math.max(1, R * 0.35);
        const n = Math.min(24, Math.floor(dist / step));
        for (let i = 1; i <= n; i++) {
          stamp(lastRef.x + (dx * i) / (n || 1), lastRef.y + (dy * i) / (n || 1), R);
        }
        if (n === 0) stamp(x, y, R);
      }
      lastRef.x = x;
      lastRef.y = y;
      lastRef.live = true;
    };

    const thumb = document.createElement("canvas");
    thumb.width = 24;
    thumb.height = 24;
    const thumbCtx = thumb.getContext("2d", { willReadFrequently: true });

    const sampleProgress = () => {
      // Cheap coverage estimate: shrink the pane to a thumbnail and read that.
      if (!thumbCtx) return;
      try {
        thumbCtx.clearRect(0, 0, 24, 24);
        thumbCtx.drawImage(canvas, 0, 0, 24, 24);
        const data = thumbCtx.getImageData(0, 0, 24, 24).data;
        let clear = 0;
        const total = 24 * 24;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 40) clear++;
        }
        stateRef.current.cleared = clear;
        stateRef.current.samples = total;
        if (clear / total > 0.6 && !stateRef.current.done) {
          stateRef.current.done = true;
          try {
            navigator.vibrate?.(12);
          } catch {
            /* haptics unavailable — the fade is the feedback */
          }
          setRevealed(true);
        }
      } catch {
        /* tainted canvas — leave the frost; video still loops beneath */
      }
    };
    let lastSample = 0;

    const pos = (e: PointerEvent) => {
      eraseAt(e.clientX, e.clientY);
      setTouched(true);
      const now = performance.now();
      if (now - lastSample > 180) {
        lastSample = now;
        sampleProgress();
      }
    };
    const down = (e: PointerEvent) => {
      stateRef.current.down = true;
      lastRef.live = false;
      canvas.setPointerCapture?.(e.pointerId);
      pos(e);
    };
    const move = (e: PointerEvent) => {
      if (!stateRef.current.down) return;
      pos(e);
    };
    const up = () => {
      stateRef.current.down = false;
      lastRef.live = false;
    };

    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    };
  }, [frostKey]);

  const refrost = () => {
    stateRef.current.done = false;
    setRevealed(false);
    setTouched(false);
    setFrostKey((k) => k + 1);
  };

  if (simple) {
    return (
      <div className="overflow-hidden rounded-lg ring-1 ring-[#e5e5e5] dark:ring-[#2b2b2b]">
        <video
          src={SRC}
          poster={POSTER}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          aria-label="A container ship at rest in the harbour"
          className="block aspect-[16/10] max-h-[180px] w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative overflow-hidden rounded-lg ring-1 ring-[#e5e5e5] dark:ring-[#2b2b2b]">
      <video
        ref={videoRef}
        src={SRC}
        poster={POSTER}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        aria-label="A container ship at rest in the harbour"
        className="block aspect-[16/10] max-h-[180px] w-full object-cover"
      />
      {!simple && (
        <canvas
          ref={canvasRef}
          aria-label="Frosted glass over the harbour. Drag to wipe it clear."
          role="img"
          className={`absolute inset-0 h-full w-full touch-none transition-opacity duration-700 ${revealed ? "pointer-events-none opacity-0" : "cursor-crosshair opacity-100"}`}
        />
      )}
      {!touched && !revealed && (
        <p className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
          <span className="frost-hint rounded-full bg-black/55 px-3 py-1 font-sans text-xs text-white backdrop-blur-sm">
            drag to wipe the glass
          </span>
        </p>
      )}
      {revealed && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center">
          <button
            type="button"
            onClick={refrost}
            className="rounded-full bg-black/55 px-3 py-1 font-sans text-xs text-white backdrop-blur-sm transition-colors hover:bg-black/75"
          >
            frost it again
          </button>
        </div>
      )}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={POSTER} alt="A container ship at rest in the harbour" className="block w-full" />
      </noscript>
    </div>
  );
}
