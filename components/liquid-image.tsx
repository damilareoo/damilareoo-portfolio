"use client";

import { useEffect, useRef, useState } from "react";

const MASK_W = 160;

/**
 * An image that melts in through liquid.
 *
 * A field of blobs rises on a tiny offscreen mask, the mask is
 * thresholded to merge them into one gooey body, and the photo
 * is drawn through it — smoothing on the upscale melts the rim.
 * Scroll starts it, hover re-ripples it. A plain picture under
 * reduced motion or no JS.
 */
export function LiquidImage({ src, alt }: { src: string; alt: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [simple, setSimple] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSimple(true);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setSimple(true);
      return;
    }

    const img = new Image();
    let raf = 0;
    let observer: IntersectionObserver | null = null;
    let W = 0;
    let H = 0;
    let animating = false;
    let done = false;
    const mask = document.createElement("canvas");
    const mctx = mask.getContext("2d");
    if (!mctx) {
      setSimple(true);
      return;
    }

    const N = 9;
    const seeds = Array.from({ length: N }, (_, i) => ({
      x: 0.12 + 0.76 * ((i * 0.61803398875) % 1),
      y: 0.95 - (i / N) * 0.9 + (((i * 0.381966) % 1) - 0.5) * 0.1,
      r: 0.16 + ((i * 0.279) % 1) * 0.12,
      dx: (((i * 0.717) % 1) - 0.5) * 0.06,
      t0: (i / N) * 0.45,
    }));

    const paint = (p: number) => {
      const mw = MASK_W;
      const mh = Math.max(1, Math.round((MASK_W * H) / W));
      if (mask.width !== mw || mask.height !== mh) {
        mask.width = mw;
        mask.height = mh;
      }
      mctx.globalCompositeOperation = "source-over";
      mctx.fillStyle = "#000";
      mctx.fillRect(0, 0, mw, mh);
      mctx.fillStyle = "#fff";
      for (const s of seeds) {
        const local = Math.min(1, Math.max(0, (p - s.t0) / (1 - s.t0 || 1)));
        if (local <= 0) continue;
        const e = 1 - Math.pow(1 - local, 3);
        mctx.beginPath();
        mctx.arc(
          (s.x + s.dx * e) * mw,
          s.y * mh - e * mh * 0.15,
          Math.max(0.1, s.r * e * mw * 1.4),
          0,
          Math.PI * 2,
        );
        mctx.fill();
      }
      const d = mctx.getImageData(0, 0, mw, mh);
      const px = d.data;
      for (let i = 3; i < px.length; i += 4) px[i] = px[i] > 110 ? 255 : 0;
      mctx.putImageData(d, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(img, 0, 0, W, H);
      ctx.save();
      ctx.globalCompositeOperation = "destination-in";
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(mask, 0, 0, W, H);
      ctx.restore();
    };

    const run = (dur: number, then?: () => void) => {
      if (animating) return;
      animating = true;
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        paint(p);
        if (p < 1) {
          raf = requestAnimationFrame(step);
        } else {
          animating = false;
          ctx.clearRect(0, 0, W, H);
          ctx.drawImage(img, 0, 0, W, H);
          then?.();
        }
      };
      raf = requestAnimationFrame(step);
    };

    img.onload = () => {
      const scale = Math.min(1, 1000 / img.naturalWidth);
      W = Math.round(img.naturalWidth * scale);
      H = Math.round(img.naturalHeight * scale);
      canvas.width = W;
      canvas.height = H;
      paint(0);
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            run(1500, () => {
              done = true;
            });
            observer?.disconnect();
          }
        },
        { threshold: 0.2 },
      );
      observer.observe(canvas);
    };
    img.src = src;

    const ripple = () => {
      if (done && !animating) {
        done = false;
        run(900, () => {
          done = true;
        });
      }
    };
    canvas.addEventListener("pointerenter", ripple);

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      canvas.removeEventListener("pointerenter", ripple);
    };
  }, [src]);

  if (simple) {
    return (
      <div className="overflow-hidden rounded-lg bg-black/[0.03] ring-1 ring-black/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" className="block h-auto w-full" />
      </div>
    );
  }

  return (
    <div className="group overflow-hidden rounded-lg bg-black/[0.03] ring-1 ring-black/10">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={alt}
        className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.01]"
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" className="block h-auto w-full" />
      </noscript>
    </div>
  );
}
