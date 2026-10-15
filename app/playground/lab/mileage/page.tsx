"use client";

import { useEffect, useState } from "react";
import { ThemeButton } from "@/components/floor-controls";
import { ClockTile, DotsTile, MusicTile, StepsTile } from "@/components/instruments";
import { WayBack } from "@/components/way-back";

const pad = (i: number) => String(i + 1).padStart(2, "0");

/* Shared mileage state: live depth, deepest point, and progress. */
function useMileage() {
  const [px, setPx] = useState(0);
  const [max, setMax] = useState(0);
  const [deep, setDeep] = useState(1);
  useEffect(() => {
    const read = () => {
      const y = Math.round(window.scrollY);
      setPx(y);
      setMax((m) => Math.max(m, y));
      setDeep(Math.max(1, document.documentElement.scrollHeight - window.innerHeight));
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, []);
  const pct = Math.min(100, Math.round((px / deep) * 100));
  return { px, max, pct };
}

type Mile = { px: number; max: number; pct: number };

function BackUp({ big }: { big?: boolean }) {
  return (
    <a
      href="#top"
      className={`link-sheen ${big ? "font-sans text-sm font-medium" : "font-mono text-xs tracking-wide"}`}
    >
      Back to top ↑
    </a>
  );
}

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

/* Five straight readings of the odometer. Each renders twice: light panel,
 then the identical markup forced dark, so both modes judge side by side —
 or flip the switcher, top left, and judge in the live theme instead. */
const STUDIES: { name: string; note: string; render: (m: Mile) => React.ReactNode }[] = [
  {
    name: "Ledger",
    note: "One mono line, everything inline.",
    render: (m) => (
      <p className="font-mono text-xs tracking-wide text-ink-2">
        SCROLLED {String(m.px).padStart(4, "0")} PX · <BackUp />
      </p>
    ),
  },
  {
    name: "Big digits",
    note: "The number is the voice; count and ride second.",
    render: (m) => (
      <div className="space-y-1">
        <p className="font-mono text-3xl tabular-nums text-ink">{String(m.px).padStart(4, "0")}</p>
        <p className="font-mono text-xs tracking-wide text-ink-2">
          PX DOWN · <BackUp />
        </p>
      </div>
    ),
  },
  {
    name: "Progress",
    note: "A hairline bar does the counting; words do the talking.",
    render: (m) => (
      <div className="space-y-2">
        <div aria-hidden className="h-px w-full bg-ink/15">
          <div className="h-px bg-ink" style={{ width: `${m.pct}%` }} />
        </div>
        <p className="font-mono text-xs tracking-wide text-ink-2">
          {m.pct}% DOWN · <BackUp />
        </p>
      </div>
    ),
  },
  {
    name: "Depth",
    note: "Coordinates energy: depth over a known bottom.",
    render: (m) => (
      <p className="font-mono text-xs tracking-wide text-ink-2">
        DEPTH {String(m.px).padStart(4, "0")} / {String(m.max).padStart(4, "0")} PX · <BackUp />
      </p>
    ),
  },
  {
    name: "Ritual",
    note: "Centered stack: the count first, the ride home biggest.",
    render: (m) => (
      <div className="space-y-1 text-center">
        <p className="font-mono text-xs tracking-wide text-ink-2">
          {String(m.px).padStart(4, "0")} PX DOWN
        </p>
        <p>
          <BackUp big />
        </p>
      </div>
    ),
  },
];

export default function MileageLabPage() {
  const m = useMileage();
  return (
    <main className="bg-bg text-ink">
      <WayBack />
      <div className="fixed left-5 top-5 z-40">
        <ThemeButton />
      </div>
      <div id="top" className="mx-auto w-full max-w-[600px] scroll-mt-20 px-5 pb-10">
        <div className="pt-8">
          <p className="text-xs tracking-wide text-ink-3">[Mileage studies]</p>
          <h1 className="sr-only">Mileage footer studies</h1>
          <p className="mt-2 text-pretty font-sans text-sm leading-normal text-ink-2">
            Five straight readings of footer sixteen — each in light, each in
            dark. Scroll the page; everything counts the same descent.
          </p>
        </div>

        <div className="mt-10 space-y-14">
          {STUDIES.map((s, i) => (
            <section key={s.name} aria-label={`Mileage ${pad(i)} — ${s.name}`}>
              <h2 className="font-sans text-sm font-medium text-ink">
                [M{pad(i)} — {s.name}]
              </h2>
              <div className="mt-4">
                <Widgets />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="border-t border-line pt-3">{s.render(m)}</div>
                <div className="dark border-t border-line bg-[#090909] pt-3">
                  <div className="px-1">{s.render(m)}</div>
                </div>
              </div>
              <p className="mt-2 font-mono text-xs text-ink-3">{s.note}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
