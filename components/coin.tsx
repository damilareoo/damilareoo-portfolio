"use client";

import { useEffect, useRef } from "react";
import Pic from "./pic";
import { coinSound } from "./sound";

/**
 * The avatar coin — his bottle cap up front, him on the
 * reverse. Spins endlessly; tap to whip it faster. Rests
 * on him under reduced motion.
 *
 * Both faces are small dedicated assets, not the original artwork, and both
 * reproduce exactly what the browser was already drawing.
 *
 * The face is cropped to the square window object-fit:cover with
 * object-position:50% 38% took out of a 576x864 portrait, then kept at
 * 240px. The coin draws 40px, so it was pulling 718KB above the fold on
 * every page to fill 40x40; 240px is six times the drawn size and stays
 * sharp at 2x on any display.
 *
 * The cap keeps its alpha and its original 153x145 aspect. It must not be
 * flattened to RGB or forced square: the transparent surround is what makes
 * it read as a cap, and squashing it turns the crimped edge into an oval.
 * Do not point either face back at the originals, and do not "optimise"
 * the cap into an RGB square.
 */
export function Coin() {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const burst = useRef(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--spin", "180deg");
      return;
    }
    let angle = 0;
    let raf = 0;
    const loop = () => {
      angle += 1.8 + burst.current;
      burst.current *= 0.95;
      el.style.setProperty("--spin", `${angle}deg`);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        coinSound(Math.min(1, 0.3 + burst.current / 40));
        burst.current += 12;
      }}
      aria-label="Spinning coin — tap to spin it faster"
      data-tone="coin"
      className="block h-10 w-10 cursor-pointer rounded-full"
      style={{ perspective: "400px" }}
    >
      <span
        aria-hidden
        ref={wrapRef}
        className="relative block h-full w-full"
        style={{ transform: "rotateY(var(--spin, 0deg))", transformStyle: "preserve-3d" }}
      >
        {/* front — the cap */}
        <span className="absolute inset-0 overflow-hidden rounded-full" style={{ backfaceVisibility: "hidden" }}>
          <Pic src="/dossier/cap-coin.png" alt="" width={40} height={40} className="h-full w-full object-cover" />
        </span>
        {/* back — him */}
        <span className="absolute inset-0 overflow-hidden rounded-full" style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}>
          <Pic src="/dossier/dami-coin.jpg" alt="" width={40} height={40} className="h-full w-full object-cover" />
        </span>
      </span>
    </button>
  );
}
