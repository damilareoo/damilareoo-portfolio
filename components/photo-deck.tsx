"use client";

import { useCallback, useEffect, useState } from "react";

const PHOTOS = [
  { src: "/dossier/about/about-1.jpg", alt: "Mirror fit check", pos: "object-[72%_18%]" },
  { src: "/dossier/about/about-2.jpg", alt: "Night out in Lagos", pos: "object-center" },
  { src: "/dossier/about/about-3.jpg", alt: "Mirror selfie at the decks", pos: "object-center" },
  { src: "/dossier/about/about-4.jpg", alt: "DJ controllers close-up", pos: "object-center" },
  { src: "/dossier/about/about-5.jpg", alt: "Basketball pickup run", pos: "object-center" },
];

/** The fan — offset, sink and tilt per depth in the pile. */
const FAN = [
  { r: 0, x: 0, y: 0, s: "shadow-[0_14px_28px_rgba(0,0,0,0.28)]" },
  { r: -10, x: -30, y: 7, s: "shadow-[0_10px_20px_rgba(0,0,0,0.20)]" },
  { r: 9, x: 32, y: 9, s: "shadow-[0_10px_20px_rgba(0,0,0,0.20)]" },
  { r: -5, x: -13, y: 17, s: "shadow-[0_6px_14px_rgba(0,0,0,0.15)]" },
  { r: 6, x: 15, y: 19, s: "shadow-[0_6px_14px_rgba(0,0,0,0.15)]" },
];

/**
 * The photo strip — five prints fanned on the desk. Tap and
 * the top print slides to the back of the pile. No labels;
 * still life under reduced motion.
 *
 * Loading borrows the Are.na intro choreography (Martin Silvestre's
 * portfolio animation: a deck that deals itself into place): on
 * arrival every print sits in one pile and only the top shows,
 * then each glides out to its slot on a stagger. Shuffles reuse
 * the same glide, so the pile deals itself every time.
 */
export function PhotoDeck() {
  const [order, setOrder] = useState<number[]>([0, 1, 2, 3, 4]);
  const [ready, setReady] = useState(false);
  const [dealt, setDealt] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setReady(true));
    // The stagger belongs to the deal only — after it lands, hovers
    // and shuffles answer at once instead of queuing behind it.
    const done = setTimeout(() => setDealt(true), 1300);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(done);
    };
  }, []);

  const shuffle = useCallback(() => {
    setOrder((o) => [...o.slice(1), o[0]]);
  }, []);

  return (
    <div className="relative h-32 w-52" role="group" aria-label="Photos of Damilare — tap to shuffle">
      {order.map((photoIdx, depth) => {
        const p = PHOTOS[photoIdx];
        const fan = FAN[Math.min(depth, FAN.length - 1)];
        return (
          <button
            key={p.src}
            type="button"
            onClick={shuffle}
            data-tone="shuffle"
            aria-label={depth === 0 ? "Photos of Damilare — tap to shuffle" : `Show ${p.alt}`}
            tabIndex={depth > 2 ? -1 : 0}
            className={`absolute left-8 top-0 h-24 w-20 cursor-pointer overflow-hidden rounded-md bg-white ring-1 ring-[#e0e0e0] dark:ring-[#2b2b2b] transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 motion-reduce:transition-none ${fan.s}`}
            style={{
              transform: ready
                ? `translate(${fan.x}px, ${fan.y}px) rotate(${fan.r}deg)`
                : `translate(0px, 0px) rotate(0deg) scale(0.94)`,
              opacity: ready || depth === 0 ? 1 : 0,
              transitionDelay: !dealt && ready ? `${depth * 90}ms` : "0ms",
              zIndex: PHOTOS.length - depth,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.src}
              alt=""
              width={80}
              height={96}
              draggable={false}
              loading={depth > 1 ? "lazy" : undefined}
              className={`pointer-events-none h-full w-full object-cover ${p.pos}`}
            />
          </button>
        );
      })}
    </div>
  );
}
