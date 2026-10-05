"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The frame rail. One dash per landed frame, fixed to the left edge on
 * wide screens — a fast way down a long run. Each dash is a tiny meter:
 * it fills as its frame travels through the middle of your screen, so the
 * rail reads along with you. A small counter up top reads your position;
 * hovering a dash reveals that frame's caption, and the dash you're on
 * pins its caption open. On narrow screens the same state drives a compact
 * right-edge dot rail — position plus jump, no labels. Plain anchor links,
 * so it jumps without JS; the fills and the highlight are enhancement
 * only. Nothing renders for short runs.
 */
export function CaseRail({ labels }: { labels: string[] }) {
  const [active, setActive] = useState(0);
  const fills = useRef<Array<HTMLSpanElement | null>>([]);
  const count = labels.length;

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.frame);
            if (!Number.isNaN(i)) setActive(i);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    const els = document.querySelectorAll("[data-frame]");
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [count]);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = window.innerHeight / 2;
      const figs = document.querySelectorAll("[data-frame]");
      figs.forEach((f, i) => {
        const r = f.getBoundingClientRect();
        const frac = Math.min(1, Math.max(0, (mid - r.top) / (r.bottom - r.top || 1)));
        const el = fills.current[i];
        if (el) el.style.width = `${Math.round(frac * 100)}%`;
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [count]);

  if (count < 2) return null;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <>
    <nav
      aria-label="Frames"
      className="fixed left-6 top-1/2 hidden -translate-y-1/2 flex-col gap-2.5 xl:flex"
    >
      <p
        aria-hidden
        className="mb-1 font-sans text-2xs tabular-nums text-[#767676] dark:text-[#8a8a8a]"
      >
        {pad(active + 1)}/{pad(count)}
      </p>
      <div className="flex flex-col gap-1">
        {labels.map((label, i) => (
          <a
            key={i}
            href={`#frame-${i + 1}`}
            aria-label={`Frame ${i + 1} of ${count}: ${label}`}
            className="group/rail relative flex h-3 items-center"
          >
            <span
              aria-hidden
              className="relative h-[3px] w-5 overflow-hidden rounded-full bg-[#171717]/15 dark:bg-white/20"
            >
              <span
                ref={(el) => {
                  fills.current[i] = el;
                }}
                aria-hidden
                className="absolute inset-y-0 left-0 rounded-full bg-[#171717] dark:bg-white"
                style={{ width: "0%" }}
              />
            </span>
            <span
              aria-hidden
              className={`pointer-events-none absolute left-full ml-3 whitespace-nowrap font-sans text-2xs text-[#767676] transition-opacity dark:text-[#8a8a8a] ${
                i === active ? "opacity-100" : "opacity-0 group-hover/rail:opacity-100"
              }`}
            >
              {label}
            </span>
          </a>
        ))}
      </div>
    </nav>
    {/* compact twin for narrow screens — counter, progress, steppers */}
    <div className="fixed inset-x-0 bottom-4 z-30 flex justify-center xl:hidden">
      <div className="flex items-center gap-1 rounded-full bg-white/85 py-1.5 pl-2 pr-2 ring-1 ring-[#e5e5e5] backdrop-blur-md dark:bg-[#1e1e1e]/85 dark:ring-white/10">
        <button
          type="button"
          onClick={() => {
            const prev = (active - 1 + count) % count;
            document
              .querySelector(`#frame-${prev + 1}`)
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          aria-label={`Previous frame — ${labels[(active - 1 + count) % count]}`}
          className="grid min-h-9 min-w-9 cursor-pointer place-items-center rounded-full text-[#767676] transition-colors hover:text-[#171717] dark:text-[#8a8a8a] dark:hover:text-white"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3 5 8l5 5" />
          </svg>
        </button>
        <span
          aria-hidden
          className="font-sans text-2xs tabular-nums text-[#767676] dark:text-[#8a8a8a]"
        >
          {pad(active + 1)}/{pad(count)}
        </span>
        <span aria-hidden className="mx-1 h-[3px] w-10 overflow-hidden rounded-full bg-[#171717]/15 dark:bg-white/20">
          <span
            aria-hidden
            className="block h-full rounded-full bg-[#171717] dark:bg-white"
            style={{ width: `${Math.round((active / Math.max(count - 1, 1)) * 100)}%` }}
          />
        </span>
        <button
          type="button"
          onClick={() => {
            const next = (active + 1) % count;
            document
              .querySelector(`#frame-${next + 1}`)
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          aria-label={`Next frame — ${labels[(active + 1) % count]}`}
          className="grid min-h-9 min-w-9 cursor-pointer place-items-center rounded-full text-[#767676] transition-colors hover:text-[#171717] dark:text-[#8a8a8a] dark:hover:text-white"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3l5 5-5 5" />
          </svg>
        </button>
      </div>
    </div>
    </>
  );
}
