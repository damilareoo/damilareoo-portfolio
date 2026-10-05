"use client";

import { useEffect, useRef, useState } from "react";

const SIZE = 24;
const MARGIN = 20;
const SCARE = 70;

/**
 * The stray cap — the avatar coin's restless twin. Crawls around
 * the viewport, darts off when your pointer gets close, and does
 * a celebratory spin when tapped. Never dies; never touches the
 * original. Gone entirely under reduced motion.
 */
export function StrayCap() {
  const [on, setOn] = useState(false);
  const elRef = useRef<HTMLButtonElement>(null);
  const pointer = useRef({ x: -9999, y: -9999 });
  const boostRef = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setOn(true);
  }, []);

  useEffect(() => {
    if (!on) return;
    const el = elRef.current;
    if (!el) return;

    const pos = {
      x: MARGIN + Math.random() * (window.innerWidth - MARGIN * 2),
      y: MARGIN + 100 + Math.random() * (window.innerHeight - MARGIN * 2 - 100),
    };
    let heading = Math.random() * Math.PI * 2;
    let speed = 26;
    let dartUntil = 0;
    let spin = Math.random() * 360;
    let spinBoost = 0;
    let target = { x: pos.x, y: pos.y };
    let nextRetarget = 0;
    boostRef.current = 0;

    const pickTarget = (now: number) => {
      target = {
        x: MARGIN + Math.random() * (window.innerWidth - MARGIN * 2),
        y: MARGIN + Math.random() * (window.innerHeight - MARGIN * 2),
      };
      nextRetarget = now + 6000 + Math.random() * 6000;
    };
    pickTarget(performance.now());

    const onMove = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const dx = pointer.current.x - pos.x;
      const dy = pointer.current.y - pos.y;
      const dist = Math.hypot(dx, dy);

      if (boostRef.current > 0.5) {
        // tapped: celebratory burst, then a dash elsewhere
        speed = 430;
        spinBoost = Math.max(spinBoost, 12);
        boostRef.current = 0;
        dartUntil = now + 450;
        pickTarget(now);
      } else if (dist < SCARE) {
        // startled: away from the pointer, fast
        heading = Math.atan2(-dy, -dx) + (Math.random() - 0.5) * 0.6;
        speed = 430;
        dartUntil = now + 550;
        spinBoost = Math.max(spinBoost, 9);
      } else if (now > dartUntil) {
        if (now > nextRetarget) pickTarget(now);
        const tx = target.x - pos.x;
        const ty = target.y - pos.y;
        const want = Math.atan2(ty, tx);
        let diff = want - heading;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        heading += diff * Math.min(1, dt * 3);
        // wiggle like something small with somewhere to be
        heading += Math.sin(now / 240) * 0.05;
        speed += (26 - speed) * Math.min(1, dt * 4);
      }

      // steer back inside the glass
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (pos.x < MARGIN || pos.x > w - MARGIN || pos.y < MARGIN || pos.y > h - MARGIN) {
        heading = Math.atan2(h / 2 - pos.y, w / 2 - pos.x);
        speed = Math.max(speed, 120);
      }

      pos.x += Math.cos(heading) * speed * dt;
      pos.y += Math.sin(heading) * speed * dt;
      spin += (60 + speed * 0.35 + spinBoost * 60) * dt;
      spinBoost *= 0.94;

      el.style.transform = `translate(${pos.x - SIZE / 2}px, ${pos.y - SIZE / 2}px) rotate(${spin}deg)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [on ]);

  if (!on) return null;

  return (
    <button
      ref={elRef}
      type="button"
      data-tone="cap"
      onClick={() => {
        boostRef.current = 14;
      }}
      aria-label="A stray bottle cap — tap to shoo it"
      className="fixed left-0 top-0 z-40 block h-6 w-6 cursor-pointer rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
      style={{ willChange: "transform" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/dossier/cap.png"
        alt=""
        width={SIZE}
        height={SIZE}
        draggable={false}
        className="pointer-events-none h-full w-full rounded-full object-cover"
      />
    </button>
  );
}
