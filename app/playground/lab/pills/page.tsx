"use client";

import { ThemeButton } from "@/components/floor-controls";
import { WayBack } from "@/components/way-back";

const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Pill lab, round two — the ride is a bare arrow riding shotgun.
 *
 * No fills, no pills on the arrow: ink on the page beside the sticker.
 * The radius question answers itself (the sticker keeps its corners;
 * the arrow has no shape to match). Six hover motions to judge.
 */
function Sticker({ fx }: { fx: string }) {
  return (
    <p
      className={`inline-block -rotate-2 rounded-lg bg-[#ffd60a] px-4 py-2 font-sans text-sm font-medium text-[#0a0a0a] shadow-[0_8px_20px_rgba(0,0,0,0.18)] ${fx}`}
    >
      Built with love and music by{" "}
      <a
        href="https://x.com/damilareoo"
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        Damilare
      </a>
      .
    </p>
  );
}

function Arrow({ fx }: { fx: string }) {
  return (
    <a
      href="#top"
      aria-label="Back to top"
      className={`grid min-h-11 min-w-11 cursor-pointer place-items-center rounded-full bg-[#ffd60a] text-[#0a0a0a] shadow-[0_8px_20px_rgba(0,0,0,0.18)] ${fx}`}
    >
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 13.5v-11M3.5 7.5 8 3l4.5 4.5" />
      </svg>
    </a>
  );
}

const EFFECTS: { name: string; note: string; sticker: string; arrow: string; group?: boolean }[] = [
  {
    name: "Spin",
    note: "The arrow rolls once, every hover.",
    sticker: "",
    arrow: "fx-spin",
  },
  {
    name: "Bounce",
    note: "The arrow hops while you stay on it.",
    sticker: "",
    arrow: "fx-bounce",
  },
  {
    name: "Straighten",
    note: "The sticker stands at attention; the arrow keeps still.",
    sticker: "fx-straighten",
    arrow: "",
  },
  {
    name: "Draw",
    note: "The arrow redraws itself, stroke by stroke.",
    sticker: "",
    arrow: "fx-draw",
  },
  {
    name: "Pulse",
    note: "The arrow breathes. Nothing else moves.",
    sticker: "",
    arrow: "fx-pulse",
  },
  {
    name: "Roll",
    note: "Hovering either rolls both — the sticker rolls, the dot spins along.",
    sticker: "fx-roll",
    arrow: "fx-spindot",
    group: true,
  },
];

export default function PillLabPage() {
  return (
    <main className="bg-bg text-ink">
      <WayBack />
      <div className="fixed left-5 top-5 z-40">
        <ThemeButton />
      </div>
      <div id="top" className="mx-auto w-full max-w-[600px] scroll-mt-20 px-5 pb-10">
        <div className="pt-8">
          <p className="text-xs tracking-wide text-ink-3">[Pill lab]</p>
          <h1 className="sr-only">Arrow motion studies</h1>
          <p className="mt-2 text-pretty font-sans text-sm leading-normal text-ink-2">
            The ride is a bare arrow beside the sticker now — no fill, no
            shape. Six hover motions. Pick one.
          </p>
        </div>

        <div className="mt-10 space-y-14">
          {EFFECTS.map((fx, i) => (
            <section key={fx.name} aria-label={`Effect ${pad(i)} — ${fx.name}`}>
              <h2 className="font-sans text-sm font-medium text-ink">
                [{pad(i)} — {fx.name}]
              </h2>
              <div className={`mt-4 flex items-center justify-center gap-4 py-2 ${fx.group ? "foot-group" : ""}`}>
                <Sticker fx={fx.sticker} />
                <Arrow fx={fx.arrow} />
              </div>
              <p className="mt-2 text-center font-sans text-xs text-ink-3">{fx.note}</p>
            </section>
          ))}
        </div>
      </div>

      <style>{`
        .fx-spin svg{transition:transform 500ms ease}
        .fx-spin:hover svg{transform:rotate(360deg)}
        .fx-bounce:hover svg{animation:pill-bounce 600ms ease infinite}
        @keyframes pill-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        .fx-straighten{transition:transform 250ms ease}
        .fx-straighten:hover{transform:rotate(0deg)}
        .fx-draw path{stroke-dasharray:24;stroke-dashoffset:0}
        .fx-draw:hover path{animation:pill-draw 600ms ease}
        @keyframes pill-draw{from{stroke-dashoffset:24}to{stroke-dashoffset:0}}
        .fx-pulse:hover svg{animation:pill-pulse 900ms ease-in-out infinite}
        @keyframes pill-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.25)}}
        .fx-roll{transition:transform 600ms cubic-bezier(.16,1,.3,1)}
        .fx-roll:hover{transform:rotate(358deg)}
        .foot-group:hover .fx-roll{transform:rotate(358deg)}
        .fx-spindot svg{transition:transform 500ms ease}
        .foot-group:hover .fx-spindot svg{transform:rotate(360deg)}
      `}</style>
    </main>
  );
}
