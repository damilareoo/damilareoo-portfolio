"use client";

import { useEffect, useRef } from "react";

/**
 * The warp — a tile that bends toward the pointer.
 *
 * Matt Jinn's images warp under the cursor (his runs on WebGL;
 * this one is honest 2D: rotate + skew tracked 1:1 to the pointer
 * with a breath of scale). Bencho's tilt card is the same family —
 * everything on the wall answers hover because nothing there is
 * a screenshot.
 *
 * Fine pointers only, still life under reduced motion, and with
 * no JS it renders the exact static tile it enhances.
 */
export function WarpShot({ src, alt, eager, index, square }: { src: string; alt: string; eager?: boolean; index: number; square?: boolean }) {
  const frameRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img) return;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const bend = (e: PointerEvent) => {
      const r = frame.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        img.style.transition = "transform 60ms linear";
        img.style.transform = `perspective(600px) rotateX(${(-y * 9).toFixed(2)}deg) rotateY(${(x * 11).toFixed(2)}deg) skewX(${(x * 2.5).toFixed(2)}deg) scale(1.05)`;
      });
    };
    const rest = () => {
      cancelAnimationFrame(raf.current);
      img.style.transition = "transform 600ms cubic-bezier(0.16,1,0.3,1)";
      img.style.transform = "";
    };
    frame.addEventListener("pointermove", bend, { passive: true });
    frame.addEventListener("pointerleave", rest);
    return () => {
      cancelAnimationFrame(raf.current);
      frame.removeEventListener("pointermove", bend);
      frame.removeEventListener("pointerleave", rest);
    };
  }, []);

  return (
    <figure
      ref={frameRef}
      className="shot-in block h-full w-full break-inside-avoid overflow-hidden ring-1 ring-[#e5e5e5] dark:ring-[#2b2b2b] motion-reduce:animate-none"
      style={{ perspective: "600px", animationDelay: `${Math.min(index, 10) * 40}ms` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={eager ? undefined : "lazy"}
        sizes="(max-width: 600px) 50vw, 280px"
        draggable={false}
        className={`h-full w-full object-cover will-change-transform ${square ? "aspect-square" : ""}`}
      />
    </figure>
  );
}
