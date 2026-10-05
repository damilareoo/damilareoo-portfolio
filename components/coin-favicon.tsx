"use client";

import { useEffect } from "react";

const CAP = "/dossier/cap.png";
/* The header coin's reverse, drawn with the same cover math:
   object-fit: cover, object-position 50% 38%. */
const FACE = "/dossier/dami.jpg";
const SIZE = 64;

/**
 * The tab coin — the header flip at favicon scale: his cap to him and
 * back, twelve frames a second. Reduced motion keeps the static face
 * every page already serves; background tabs pause on their own
 * because the loop runs on rAF. Safari (and no-JS) keeps the static
 * icon link this upgrades — the animation is progressive enhancement.
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
    let angle = 0;

    const drawContain = (img: HTMLImageElement) => {
      const s = Math.max(img.naturalWidth, img.naturalHeight);
      const sc = SIZE / s;
      const w = img.naturalWidth * sc;
      const h = img.naturalHeight * sc;
      ctx.drawImage(img, (SIZE - w) / 2, (SIZE - h) / 2, w, h);
    };

    const drawHead = (img: HTMLImageElement) => {
      const sc = Math.max(SIZE / img.naturalWidth, SIZE / img.naturalHeight);
      const w = img.naturalWidth * sc;
      const h = img.naturalHeight * sc;
      ctx.drawImage(img, (SIZE - w) / 2, 0.38 * (SIZE - h), w, h);
    };

    const frame = (now: number) => {
      if (stopped) return;
      if (now - last >= 80) {
        last = now;
        angle = (angle + 9) % 360;
        const squish = Math.abs(Math.cos((angle * Math.PI) / 180));
        ctx.clearRect(0, 0, SIZE, SIZE);
        ctx.save();
        ctx.beginPath();
        ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.translate(SIZE / 2, 0);
        ctx.scale(Math.max(0.1, squish), 1);
        ctx.translate(-SIZE / 2, 0);
        if (angle < 180) drawContain(cap);
        else drawHead(face);
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
