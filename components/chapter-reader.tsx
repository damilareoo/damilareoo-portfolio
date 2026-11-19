"use client";

import { useEffect, useRef, useState } from "react";

type Chapter = { title: string; body: string };

/**
 * The case study's reader: the frame rail's language, grown into the story.
 *
 * One dash per chapter, stacked, each a tiny meter that fills as you read
 * through that chapter, the way the old rail filled per frame. Every dash
 * carries its chapter's title, so the rail is also the contents: click to
 * go there. Under it, the chapter you are in, its claim and its lines,
 * pinned beside the frames that make the claim, and handed over to the next
 * chapter with a short fade as you arrive at it.
 *
 * Chapters are found by `[data-chapter]` on the page, so the server-rendered
 * sections stay the source of truth (and the only copy a screen reader
 * hears: this panel is a visual reading aid and is hidden from it).
 * Progress is written straight to each fill's width on a frame-throttled
 * scroll handler; only the active index goes through React.
 */
export function ChapterReader({ chapters }: { chapters: Chapter[] }) {
  const [active, setActive] = useState(0);
  const fills = useRef<Array<HTMLSpanElement | null>>([]);
  const bars = useRef<Array<HTMLSpanElement | null>>([]);
  const n = chapters.length;

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.45;
      const sections = document.querySelectorAll<HTMLElement>("[data-chapter]");
      let current = 0;
      sections.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const frac = Math.min(1, Math.max(0, (line - r.top) / (r.height || 1)));
        const w = `${Math.round(frac * 100)}%`;
        const a = fills.current[i];
        const b = bars.current[i];
        if (a) a.style.width = w;
        if (b) b.style.width = w;
        if (r.top <= line) current = i;
      });
      setActive((prev) => (prev === current ? prev : current));
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
  }, [n]);

  const go = (i: number) => {
    const el = document.querySelector<HTMLElement>(`[data-chapter="${i}"]`);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: reduce ? "auto" : "smooth" });
  };

  const ch = chapters[active];
  const pad = (k: number) => String(k).padStart(2, "0");

  return (
    <>
      {/* Wide screens: the pinned reader. */}
      <div aria-hidden className="sticky top-20 hidden lg:block">
        <ol className="space-y-1.5">
          {chapters.map((c, i) => (
            <li key={c.title}>
              <button
                type="button"
                tabIndex={-1}
                onClick={() => go(i)}
                className="group/ch flex w-full cursor-pointer items-center gap-3 text-left"
              >
                <span className="relative h-[3px] w-5 shrink-0 overflow-hidden rounded-full bg-ink/15">
                  <span
                    ref={(el) => {
                      fills.current[i] = el;
                    }}
                    className="absolute inset-y-0 left-0 rounded-full bg-ink"
                    style={{ width: "0%" }}
                  />
                </span>
                <span
                  className={`truncate font-sans text-xs transition-colors duration-150 ${
                    i === active ? "text-ink" : "text-ink-3 group-hover/ch:text-ink-2"
                  }`}
                >
                  {c.title}
                </span>
              </button>
            </li>
          ))}
        </ol>

        <div key={active} className="chapter-in mt-10">
          <p className="font-sans text-xs tabular-nums text-ink-3">
            {pad(active + 1)} / {pad(n)}
          </p>
          <p className="mt-2 text-balance font-sans text-lg font-medium leading-snug text-ink">{ch.title}</p>
          {ch.body && <p className="mt-3 text-pretty font-sans text-sm leading-relaxed text-ink-2">{ch.body}</p>}
        </div>
      </div>

      {/* Narrow screens: the same meters as one hairline across the top of
          the screen, a segment per chapter. Nothing to cover the text. */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-40 flex gap-1 lg:hidden">
        {chapters.map((c, i) => (
          <span key={c.title} className="relative h-[2px] flex-1 overflow-hidden bg-ink/10">
            <span
              ref={(el) => {
                bars.current[i] = el;
              }}
              className="absolute inset-y-0 left-0 bg-ink"
              style={{ width: "0%" }}
            />
          </span>
        ))}
      </div>
    </>
  );
}
