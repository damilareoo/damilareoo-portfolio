"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ALBUM_SET, EXPLORATION_SETS } from "@/data/exploration-sets";
import { ExplorationOrbit } from "./exploration-orbit";

type Exploration =
  | {
      slug: string;
      exhibit: string;
      title: string;
      video: { src: string; poster: string };
      embed?: undefined;
    }
  | {
      slug: string;
      exhibit: string;
      title: string;
      embed: string;
      video?: undefined;
    };

const EXPLORATIONS: Exploration[] = [
  {
    slug: "nothing-pedometer",
    exhibit: "Exploration 01",
    title: "Nothing Pedometer",
    video: {
      src: "/dossier/explorations/nothing-pedometer/nothing-pedometer-concept.mp4",
      poster: "/dossier/explorations/nothing-pedometer/nothing-pedometer-poster.png",
    },
  },
];

/** Inline interaction studies — labeled exhibits, unlabeled images. */
const LIVE = [
  { slug: "x-orbit", exhibit: "Exploration 02", title: "Orbit", kind: "orbit", set: "" },
] as const;

/**
 * Explorations rail — native horizontal swipe with arrow buttons that
 * scroll by exactly one card. The arrows are transport, not replacement:
 * touch, trackpad and keyboard swipe all still work.
 */
export function ExplorationsRail() {
  const railRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const syncEdges = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setAtStart(rail.scrollLeft <= 4);
    setAtEnd(rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4);
  }, []);

  useEffect(() => {
    syncEdges();
    window.addEventListener("resize", syncEdges);
    return () => window.removeEventListener("resize", syncEdges);
  }, [syncEdges]);

  const step = useCallback((dir: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector("article");
    const w = card ? card.getBoundingClientRect().width + 16 : rail.clientWidth * 0.85;
    rail.scrollBy({ left: dir * w, behavior: "smooth" });
  }, []);

  const arrow =
    "flex h-7 w-7 items-center justify-center rounded-full font-sans text-sm ring-1 transition-colors disabled:opacity-30 disabled:pointer-events-none text-[#626262] ring-[#e0e0e0] hover:text-[#171717] hover:ring-[#c9c9c9] dark:text-[#a8a8a8] dark:ring-[#2e2e2e] dark:hover:text-[#f2f2f2] dark:hover:ring-[#4a4a4a]";

  return (
    <section aria-label="Explorations" className="mt-12">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-sm font-medium">Explorations</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={atStart}
            aria-label="Previous exploration"
            className={arrow}
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={atEnd}
            aria-label="Next exploration"
            className={arrow}
          >
            →
          </button>
        </div>
      </div>
      <div
        ref={railRef}
        onScroll={syncEdges}
        className="mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {EXPLORATIONS.map((e, i) => (
          <article
            key={e.slug}
            className="w-[85%] shrink-0 snap-start rounded-2xl bg-[#e8e8e6] p-4 ring-1 ring-[#e0e0de]"
          >
            <div className="flex items-baseline justify-between font-mono text-xs uppercase tracking-widest text-[#55534f]">
              <span>{e.exhibit}</span>
              <span aria-hidden>[{String(i + 1).padStart(2, "0")}]</span>
            </div>
            <div className="mt-3 h-80 overflow-hidden rounded-xl">
              {e.video ? (
                <video
                  src={e.video.src}
                  poster={e.video.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={`${e.title} interaction concept film`}
                  className="mx-auto h-full w-auto rounded-xl"
                />
              ) : (
                <iframe
                  src={e.embed}
                  title={`${e.title} — live canvas`}
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  className="h-full w-full border-0 bg-white rounded-xl"
                />
              )}
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-2 font-mono text-xs uppercase tracking-widest text-[#55534f]">
              <span className="truncate">{e.title}</span>
              {e.embed ? (
                <a
                  href={e.embed}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 underline decoration-[#b9b9b6] underline-offset-2"
                >
                  Open live ↗
                </a>
              ) : (
                <span aria-hidden className="shrink-0">
                  Interaction concept
                </span>
              )}
            </div>
          </article>
        ))}
        {LIVE.map((e) => {
          const shots = e.kind === "orbit" ? ALBUM_SET.shots : ((e.set ? EXPLORATION_SETS[e.set]?.shots : []) ?? []);
          return (
            <article
              key={e.slug}
              className="w-[85%] shrink-0 snap-start rounded-2xl bg-[#e8e8e6] p-4 ring-1 ring-[#e0e0de]"
            >
              <div className="flex items-baseline justify-between font-mono text-xs uppercase tracking-widest text-[#55534f]">
                <span>{e.exhibit}</span>
                <span aria-hidden>[{e.exhibit.replace("Exploration ", "")}]</span>
              </div>
              <div className="mt-3">
                {e.kind === "orbit" && <ExplorationOrbit shots={shots} />}
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-2 font-mono text-xs uppercase tracking-widest text-[#55534f]">
                <span className="truncate">{e.title}</span>
                <span aria-hidden className="shrink-0">
                  Interaction concept
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
