"use client";

import { useEffect } from "react";

const CAP = "/dossier/cap.png";
/* The header coin's reverse, drawn with the same cover math:
   object-fit: cover, object-position 50% 38%. */
const FACE = "/dossier/dami.jpg";
const SIZE = 64;
/* The header's own speed — 1.8 degrees per 1/60s frame, linear, endless.
   Time-based so the tab keeps the exact phase speed at any frame rate. */
const DEGREES_PER_MS = 1.8 / (1000 / 60);

/**
 * The tab coin — the header flip at favicon scale: his cap to him and
 * back, linear and endless at the header's own 108°/s. The squish is the
 * bare cosine with no minimum and the faces trade at edge-on, exactly
 * like the header's backface swap — no dwell, no whip, one motion in
 * both places. Reduced motion keeps the static face every page already
 * serves; background tabs pause on their own because the loop runs on
 * rAF. Safari (and no-JS) keeps the static icon link this upgrades —
 * the animation is progressive enhancement.
 */
export function CoinFavicon() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    const fallback = link?.href ?? "/icon";
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cap = new Image();
    const face = new Image();
    let stopped = false;
    let raf = 0;
    let last = 0;
    let start = 0;

    const drawCover = (img: HTMLImageElement, yFrac: number) => {
      const sc = Math.max(SIZE / img.naturalWidth, SIZE / img.naturalHeight);
      const w = img.naturalWidth * sc;
      const h = img.naturalHeight * sc;
      ctx.drawImage(img, (SIZE - w) / 2, yFrac * (SIZE - h), w, h);
    };

    const frame = (now: number) => {
      if (stopped) return;
      if (!start) start = now;
      if (now - last >= 33) {
        last = now;
        const angle = (((now - start) * DEGREES_PER_MS) % 360) * (Math.PI / 180);
        const squish = Math.cos(angle);
        ctx.clearRect(0, 0, SIZE, SIZE);
        ctx.save();
        ctx.beginPath();
        ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.translate(SIZE / 2, 0);
        ctx.scale(Math.max(Math.abs(squish), 0.001), 1);
        ctx.translate(-SIZE / 2, 0);
        if (squish >= 0) drawCover(cap, 0.5);
        else drawCover(face, 0.38);
        ctx.restore();
        if (link) link.href = canvas.toDataURL("image/png");
      }
      raf = requestAnimationFrame(frame);
    };

    let ready = 0;
    const kick = () => {
      ready++;
      if (ready === 2 && !stopped) raf = requestAnimationFrame(frame);
    };
    cap.onload = kick;
    face.onload = kick;
    cap.src = CAP;
    face.src = FACE;

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      if (link) link.href = fallback;
    };
  }, []);

  return null;
}
