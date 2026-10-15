"use client";

import { ThemeButton } from "@/components/floor-controls";
import { ClockTile, DotsTile, MusicTile, StepsTile } from "@/components/instruments";
import { WayBack } from "@/components/way-back";
import { site } from "@/data/site";

const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Footer lab, round four — ten sticker studies.
 *
 * One sentence on volt, one ride home in its own yellow fill, zero
 * hairlines. What varies is arrangement: row, stack, spread, scale,
 * tilt, and what the ↑ button is shaped like. Widgets above each.
 */
function Widgets() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      <ClockTile />
      <DotsTile />
      <StepsTile />
      <MusicTile />
    </div>
  );
}

function Sticker({ big, tilt = "-rotate-2" }: { big?: boolean; tilt?: string }) {
  return (
    <p
      className={`inline-block ${tilt} rounded-lg bg-[#ffd60a] px-4 py-2 font-sans font-medium text-[#0a0a0a] shadow-[0_8px_20px_rgba(0,0,0,0.18)] ${big ? "text-base" : "text-sm"}`}
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

function UpDot() {
  return (
    <a
      href="#top"
      aria-label="Back to top"
      className="grid min-h-11 min-w-11 place-items-center rounded-full bg-[#ffd60a] text-[#0a0a0a] shadow-[0_8px_20px_rgba(0,0,0,0.18)] transition-transform duration-200 hover:-translate-y-0.5"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 13.5v-11M3.5 7.5 8 3l4.5 4.5" />
      </svg>
    </a>
  );
}

function UpPill() {
  return (
    <a
      href="#top"
      aria-label="Back to top"
      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#ffd60a] px-5 font-mono text-xs tracking-wide text-[#0a0a0a] shadow-[0_8px_20px_rgba(0,0,0,0.18)] transition-transform duration-200 hover:-translate-y-0.5"
    >
      BACK TO TOP
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 13.5v-11M3.5 7.5 8 3l4.5 4.5" />
      </svg>
    </a>
  );
}

function Copy() {
  return (
    <p className="font-mono text-xs text-ink-3">© {new Date().getFullYear()} {site.name}</p>
  );
}

const IDEAS: { name: string; note: string; body: React.ReactNode }[] = [
  {
    name: "Row",
    note: "Sentence left, ride right — the classic pair.",
    body: (
      <div className="space-y-3">
        <p className="flex items-center justify-center gap-3"><Sticker /><UpDot /></p>
        <div className="text-center"><Copy /></div>
      </div>
    ),
  },
  {
    name: "Stack",
    note: "Sticker, then the dot drops below it.",
    body: (
      <div className="space-y-3 text-center">
        <p><Sticker /></p>
        <p className="flex justify-center"><UpDot /></p>
        <Copy />
      </div>
    ),
  },
  {
    name: "Dot first",
    note: "The ride leads; the sentence follows.",
    body: (
      <div className="space-y-3 text-center">
        <p className="flex justify-center"><UpDot /></p>
        <p><Sticker /></p>
        <Copy />
      </div>
    ),
  },
  {
    name: "Spread",
    note: "Sticker hugs the left, the dot holds the right edge.",
    body: (
      <div className="space-y-3">
        <p className="flex items-center justify-between gap-3"><Sticker /><UpDot /></p>
        <Copy />
      </div>
    ),
  },
  {
    name: "Big",
    note: "One size up on the sentence; the dot keeps up.",
    body: (
      <div className="space-y-3 text-center">
        <p><Sticker big /></p>
        <p className="flex justify-center"><UpDot /></p>
        <Copy />
      </div>
    ),
  },
  {
    name: "Straight",
    note: "No tilt anywhere — the sticker stands at attention.",
    body: (
      <div className="space-y-3 text-center">
        <p><Sticker tilt="" /></p>
        <p className="flex justify-center"><UpDot /></p>
        <Copy />
      </div>
    ),
  },
  {
    name: "Lean right",
    note: "Tipped the other way, two degrees clockwise.",
    body: (
      <div className="space-y-3 text-center">
        <p><Sticker tilt="rotate-2" /></p>
        <p className="flex justify-center"><UpDot /></p>
        <Copy />
      </div>
    ),
  },
  {
    name: "Pill ride",
    note: "The ↑ grows into a full BACK TO TOP pill.",
    body: (
      <div className="space-y-3 text-center">
        <p><Sticker /></p>
        <p><UpPill /></p>
        <Copy />
      </div>
    ),
  },
  {
    name: "Badge",
    note: "The dot rides the sticker's corner like a notification.",
    body: (
      <div className="space-y-3 text-center">
        <p className="relative inline-block">
          <Sticker />
          <span className="absolute -right-4 -top-4"><UpDot /></span>
        </p>
        <div className="pt-2"><Copy /></div>
      </div>
    ),
  },
  {
    name: "Ritual",
    note: "Centered column: ©, sentence, ride. The calmest of the ten.",
    body: (
      <div className="space-y-3 text-center">
        <Copy />
        <p><Sticker /></p>
        <p className="flex justify-center"><UpDot /></p>
      </div>
    ),
  },
];

export default function FooterLabPage() {
  return (
    <main className="bg-bg text-ink">
      <WayBack />
      <div className="fixed left-5 top-5 z-40">
        <ThemeButton />
      </div>
      <div id="top" className="mx-auto w-full max-w-[600px] scroll-mt-20 px-5 pb-10">
        <div className="pt-8">
          <p className="text-xs tracking-wide text-ink-3">[Footer lab]</p>
          <h1 className="sr-only">Sticker footer studies</h1>
          <p className="mt-2 text-pretty font-sans text-sm leading-normal text-ink-2">
            Ten sticker studies — sentence on volt, ride home in its own
            yellow fill, no hairlines. Pick a number.
          </p>
        </div>

        <div className="mt-10 space-y-14">
          {IDEAS.map((idea, i) => (
            <section key={idea.name} aria-label={`Footer ${pad(i)} — ${idea.name}`}>
              <h2 className="font-sans text-sm font-medium text-ink">
                [{pad(i)} — {idea.name}]
              </h2>
              <div className="mt-4">
                <Widgets />
              </div>
              <div className="mt-6">{idea.body}</div>
              <p className="mt-4 font-mono text-xs text-ink-3">{idea.note}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
