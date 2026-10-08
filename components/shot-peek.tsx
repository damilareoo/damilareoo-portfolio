"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { dossier } from "@/data/dossier";

const WANT = [
  "/dossier/shots/110.png",
  "/dossier/shots/2072.png",
  "/dossier/shots/2131.png",
  "/dossier/shots/2062.png",
  "/dossier/shots/2057.png",
];

const PEEK = WANT.map((src) => dossier.shots.find((s) => s.src === src) ?? { src, alt: "", caption: "" });
const TOTAL = dossier.shots.length;

/**
 * A word that peeks its shots. Hover (fine pointers only) pops a little
 * live window above the word: traffic bar, auto-cycling studies, caption
 * + progress. Pure progressive enhancement — touch and no-JS readers keep
 * the plain sheened link, reduced motion keeps a single still.
 */
export function ShotPeek({ word = "shots", href = "/shots" }: { word?: string; href?: string }) {
  const [index, setIndex] = useState(0);
  const [live, setLive] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!live) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % PEEK.length), 1100);
    return () => window.clearInterval(t);
  }, [live]);

  const open = () => {
    setIndex(0);
    setLive(true);
  };

  const tilt = (e: React.MouseEvent) => {
    const el = wrapRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const tx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const ty = (e.clientY - (r.top + r.height / 2)) / r.height;
    el.style.setProperty("--tx", tx.toFixed(3));
    el.style.setProperty("--ty", (-ty).toFixed(3));
  };

  const untilt = () => {
    wrapRef.current?.style.removeProperty("--tx");
    wrapRef.current?.style.removeProperty("--ty");
  };

  return (
    <span
      ref={wrapRef}
      className="group/vinyl relative inline-block"
      onMouseEnter={open}
      onMouseLeave={() => {
        setLive(false);
        untilt();
      }}
      onMouseMove={tilt}
      onFocus={open}
      onBlur={() => setLive(false)}
    >
      <Link href={href} className="link-sheen">
        {word}
      </Link>
      <span aria-hidden className="shot-pop shot-peek">
        <span className="shot-peek-window">
          <span className="shot-peek-bar">
            <span className="shot-peek-dots">
              <i />
              <i />
              <i />
            </span>
            <span className="shot-peek-title">shots — {TOTAL} studies</span>
            <span className="shot-peek-live" data-on={live || undefined} />
          </span>
          <span className="shot-peek-stage">
            {PEEK.map((s, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={s.src}
                src={s.src}
                alt=""
                draggable={false}
                loading={i < 2 ? "eager" : "lazy"}
                decoding="async"
                data-active={i === index || undefined}
              />
            ))}
          </span>
          <span className="shot-peek-foot">
            <span className="shot-peek-cap">{PEEK[index]?.caption}</span>
            <span className="shot-peek-progress">
              {PEEK.map((s, i) => (
                <i key={s.src} data-on={i === index || undefined} />
              ))}
            </span>
          </span>
        </span>
      </span>
    </span>
  );
}
