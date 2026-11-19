"use client";

import { useEffect, useState } from "react";
import { LinkedText } from "./linked-text";

type Chapter = { title: string; body: string };

/**
 * The case study's chapter guide: the claim of the chapter you are in and
 * its lines, pinned beside the frames that make the claim, handed over to
 * the next chapter with a short fade as you arrive at it. Nothing else: no
 * numbers, no progress marks, just the words that belong to what you are
 * looking at.
 *
 * Chapters are found by `[data-chapter]` on the page, so the server-rendered
 * sections stay the source of truth (and the only copy a screen reader
 * hears: this panel is a visual reading aid and is hidden from it).
 */
export function ChapterReader({
  chapters,
  links,
}: {
  chapters: Chapter[];
  links: { label: string; href: string; sheen?: string }[];
}) {
  const [active, setActive] = useState(0);
  const n = chapters.length;

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.45;
      let current = 0;
      document.querySelectorAll<HTMLElement>("[data-chapter]").forEach((el, i) => {
        if (el.getBoundingClientRect().top <= line) current = i;
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

  const ch = chapters[active];

  return (
    <div aria-hidden className="sticky top-20 hidden lg:block">
      <div key={active} className="chapter-in">
        <p className="text-pretty font-sans text-lg font-medium leading-snug text-ink">{ch.title}</p>
        {ch.body && (
          <p className="mt-3 text-pretty font-sans text-sm leading-relaxed text-ink-2">
            <LinkedText text={ch.body} links={links} tabbable={false} />
          </p>
        )}
      </div>
    </div>
  );
}
