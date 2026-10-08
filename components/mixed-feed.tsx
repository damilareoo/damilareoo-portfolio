"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EXPLORATION_SETS } from "@/data/exploration-sets";
import { ExplorationSpotlight } from "./exploration-spotlight";

type Shot = { src: string; alt: string };
type Filter = "all" | "cases" | "shots" | "explorations";

const WORK = [
  { slug: "hitmans-library", title: "Hitman's Library", sub: "A growing collection of web experiences", img: "/dossier/work/hitman/hitman-title.jpg", alt: "Hitman's Library shelf mark and wordmark", tint: "hitman" },
  { slug: "endgame", title: "Endgame", sub: "Product design — most recent role", img: "/dossier/work/endgame/endgame-og.png", alt: "Endgame.ai", tint: "rainbow" },
  { slug: "chessever", title: "ChessEver", sub: "Live tournaments, players & standings", img: "/dossier/work/chessever/17-lockup.jpg", alt: "ChessEver mark and wordmark", tint: "chessever" },
  { slug: "sylvan", title: "Sylvan", sub: "Revenue intelligence for modern teams", img: "/dossier/work/sylvan/sylvan-logo-full.jpg", alt: "Sylvan mark and wordmark", tint: "sylvan" },
];

type Item =
  | { kind: "case"; w: (typeof WORK)[number] }
  | { kind: "shot"; s: Shot }
  | { kind: "exploration"; slug: "film" | "spotlight" };

/**
 * DRAFT feed — one mixed index in our language. Case cards keep their
 * 16/10 grammar with title + sub; shots run three-up, captionless,
 * linking to /shots; explorations reuse their rail cards. Filters are
 * transport with honest counts; All interleaves work-first so the
 * case studies still read as the proof.
 */
export function MixedFeed({ shots }: { shots: Shot[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [shown, setShown] = useState(14);

  const items = useMemo<Item[]>(() => {
    const out: Item[] = [];
    let si = 0;
    const takeShots = (n: number) => {
      for (let k = 0; k < n && si < shots.length; k++, si++) out.push({ kind: "shot", s: shots[si] });
    };
    out.push({ kind: "case", w: WORK[0] });
    takeShots(6);
    out.push({ kind: "case", w: WORK[1] });
    takeShots(6);
    out.push({ kind: "exploration", slug: "film" });
    takeShots(6);
    out.push({ kind: "case", w: WORK[2] });
    takeShots(6);
    out.push({ kind: "exploration", slug: "spotlight" });
    takeShots(6);
    out.push({ kind: "case", w: WORK[3] });
    takeShots(999);
    return out;
  }, [shots]);

  const visible = useMemo(() => {
    if (filter === "cases") return items.filter((i) => i.kind === "case");
    if (filter === "shots") return items.filter((i) => i.kind === "shot");
    if (filter === "explorations") return items.filter((i) => i.kind === "exploration");
    return items.slice(0, shown);
  }, [items, filter, shown]);

  const counts: Record<Filter, number> = {
    all: items.length,
    cases: WORK.length,
    shots: shots.length,
    explorations: 2,
  };
  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All work" },
    { key: "cases", label: "Case studies" },
    { key: "shots", label: "Shots" },
    { key: "explorations", label: "Explorations" },
  ];

  // Group consecutive shots into three-up rows for the mixed view.
  const rows: Item[][] = [];
  for (const it of visible) {
    if (it.kind === "shot") {
      const last = rows[rows.length - 1];
      if (last && last[0].kind === "shot" && last.length < 6) last.push(it);
      else rows.push([it]);
    } else {
      rows.push([it]);
    }
  }

  return (
    <section aria-label="All work" className="mt-12">
      <div className="sticky top-0 z-30 flex justify-center py-3">
        <div
          role="group"
          aria-label="Filter the work"
          className="flex items-center gap-1 rounded-full bg-white/85 p-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-[#e5e5e5] backdrop-blur-md dark:bg-[#1e1e1e]/85 dark:ring-white/10"
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setFilter(t.key);
                setShown(14);
              }}
              aria-pressed={filter === t.key}
              className={`cursor-pointer whitespace-nowrap rounded-full px-3 py-1.5 font-sans text-xs transition-colors ${
                filter === t.key
                  ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717]"
                  : "text-[#767676] hover:text-[#171717] dark:text-[#8a8a8a] dark:hover:text-white"
              }`}
            >
              {t.label} [{counts[t.key]}]
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 space-y-8">
        {rows.map((row, ri) =>
          row[0].kind === "shot" ? (
            <div key={ri} className="grid grid-cols-3 gap-3">
              {row.map((it, k) =>
                it.kind === "shot" ? (
                  <Link
                    key={`${ri}-${k}-${it.s.src}`}
                    href="/shots"
                    aria-label={`${it.s.alt} — see all shots`}
                    className="block overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.s.src} alt={it.s.alt} loading="lazy" decoding="async" draggable={false} className="block aspect-video w-full object-cover" />
                  </Link>
                ) : null,
              )}
            </div>
          ) : (
            <div key={ri}>
              {row.map((it, k) => {
                if (it.kind === "shot") return null;
                if (it.kind === "case") {
                  const w = it.w;
                  return (
                    <div key={k}>
                      <Link
                        href={`/work/${w.slug}`}
                        aria-label={`${w.title} — ${w.sub}`}
                        className="group relative block overflow-hidden rounded-lg bg-[#0c1f1c] ring-1 ring-[#e5e5e5] dark:ring-[#2b2b2b]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={w.img}
                          alt={w.alt}
                          loading="lazy"
                          className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                        <div aria-hidden className={`cover-${w.tint} pointer-events-none absolute inset-0`} />
                      </Link>
                      <p className="mt-2 font-sans text-sm">
                        <Link href={`/work/${w.slug}`} className="font-medium link-sheen">
                          {w.title}
                        </Link>
                      </p>
                      <p className="font-sans text-sm text-[#626262] dark:text-[#a8a8a8]">{w.sub}</p>
                    </div>
                  );
                }
                return (
                  <div key={k} className="rounded-2xl bg-[#e8e8e6] p-4 ring-1 ring-[#e0e0de]">
                    <div className="flex items-baseline justify-between font-mono text-xs uppercase tracking-widest text-[#55534f]">
                      <span>{it.slug === "film" ? "Exploration 01" : "Exploration 02"}</span>
                      <span aria-hidden>{it.slug === "film" ? "[01]" : "[02]"}</span>
                    </div>
                    <div className="mt-3 h-80 overflow-hidden rounded-xl">
                      {it.slug === "film" ? (
                        <video
                          src="/dossier/explorations/nothing-pedometer/nothing-pedometer-concept.mp4"
                          poster="/dossier/explorations/nothing-pedometer/nothing-pedometer-poster.png"
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          aria-label="Nothing Pedometer interaction concept film"
                          className="mx-auto h-full w-auto rounded-xl"
                        />
                      ) : (
                        <ExplorationSpotlight shots={EXPLORATION_SETS.rivers.shots} />
                      )}
                    </div>
                    <div className="mt-3 flex items-baseline justify-between gap-2 font-mono text-xs uppercase tracking-widest text-[#55534f]">
                      <span className="truncate">{it.slug === "film" ? "Nothing Pedometer" : "Spotlight"}</span>
                      <span aria-hidden className="shrink-0">
                        Interaction concept
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ),
        )}
      </div>

      {filter === "all" && shown < items.length && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setShown((s) => s + 14)}
            className="cursor-pointer rounded-full bg-[#171717] px-6 py-3 font-sans text-sm text-white transition-transform active:scale-95 dark:bg-white dark:text-[#171717]"
          >
            Load more content
          </button>
        </div>
      )}
    </section>
  );
}
