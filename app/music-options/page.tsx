import type { Metadata } from "next";
import { WayBack } from "@/components/way-back";

export const metadata: Metadata = {
  title: "Music tile options",
  description: "Three directions for the footer music tile. Unlisted.",
};

const TRACK = {
  status: "now playing",
  title: "Sin City",
  artist: "Kizz Daniel",
  art: "https://picsum.photos/seed/spotify-cover/400",
};

function Shell({ n, name, note, live, children }: { n: string; name: string; note: string; live?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between font-mono text-xs uppercase tracking-widest text-[#626262] dark:text-[#a8a8a8]">
        <span>
          Option {n} — {name}
        </span>
        {live && <span className="text-[#E11A1B]">live</span>}
      </div>
      <div className="mt-3 aspect-square w-full overflow-hidden rounded-xl ring-1 ring-[#e0e0e0] dark:ring-white/10">
        {children}
      </div>
      <p className="mt-2 font-mono text-xs text-[#626262] dark:text-[#a8a8a8]">{note}</p>
    </div>
  );
}

/** 01 — the record, as shipped: black disc, art label, spins while playing. */
function RecordOption() {
  return (
    <div className="relative h-full w-full bg-[#141414]">
      <svg viewBox="0 0 100 100" aria-hidden className="block h-full w-full">
        <circle cx="50" cy="50" r="50" fill="#141414" />
        <g className="vinyl-spin">
          <circle cx="50" cy="50" r="46" fill="#060607" stroke="rgba(255,255,255,0.10)" strokeWidth="0.6" />
          {[42, 38, 34, 30, 26].map((r) => (
            <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          ))}
          <path d="M 50 4 A 46 46 0 0 1 96 50" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="2.5" strokeLinecap="round" />
          <clipPath id="opt-record-label">
            <circle cx="50" cy="50" r="15" />
          </clipPath>
          <circle cx="50" cy="50" r="15" fill="#101013" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <image
            href={TRACK.art}
            x="35"
            y="35"
            width="30"
            height="30"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#opt-record-label)"
          />
          <circle cx="50" cy="50" r="15" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="0.6" />
          <circle cx="50" cy="50" r="1.7" fill="#000" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
        </g>
      </svg>
    </div>
  );
}

/** 02 — cover-forward: full-bleed art, big title, record peeking. */
function CoverOption() {
  return (
    <div className="relative h-full w-full bg-black">
      <svg viewBox="0 0 100 100" aria-hidden className="block h-full w-full">
        <defs>
          <linearGradient id="opt-scrim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity="0.55" />
            <stop offset="28%" stopColor="#000" stopOpacity="0" />
            <stop offset="58%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.8" />
          </linearGradient>
          <clipPath id="opt-peek-label">
            <circle cx="84" cy="64" r="8" />
          </clipPath>
        </defs>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <image href={TRACK.art} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" />
        <rect x="0" y="0" width="100" height="100" fill="url(#opt-scrim)" />
        <g className="vinyl-spin">
          <circle cx="84" cy="64" r="24" fill="#060607" stroke="rgba(255,255,255,0.16)" strokeWidth="0.6" />
          {[21, 18, 15, 12].map((r) => (
            <circle key={r} cx="84" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
          ))}
          <circle cx="84" cy="64" r="8" fill="#101013" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <image
            href={TRACK.art}
            x="76"
            y="56"
            width="16"
            height="16"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#opt-peek-label)"
          />
          <circle cx="84" cy="64" r="8" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <circle cx="84" cy="64" r="1.4" fill="#000" stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" />
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-x-0 top-0 p-2.5" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.85)" }}>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/75">{TRACK.status}</p>
        <p className="mt-0.5 line-clamp-2 font-sans text-[15px] font-medium leading-tight text-white">
          {TRACK.title}
        </p>
      </div>
    </div>
  );
}

/** 03 — type-led: no artwork at all, the words carry it. Dot-matrix
    numerals for the position, mono micro for the state. */
function TypeOption() {  return (
    <div className="relative flex h-full w-full flex-col justify-between bg-[#0B0B0D] p-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/55">{TRACK.status}</p>
        <span className="vinyl-spin block h-3 w-3 rounded-full bg-[#E11A1B]" aria-hidden />
      </div>
      <div>
        <p className="text-balance font-sans text-[26px] font-medium leading-[1.05] text-white">
          {TRACK.title}
        </p>
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">
          {TRACK.artist}
        </p>
      </div>
      <div className="flex items-center gap-[5px]" aria-hidden>
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="h-[4px] flex-1 rounded-full"
            style={{ background: i < 15 ? "#FFFFFF" : "rgba(255,255,255,0.16)" }}
          />
        ))}
      </div>
    </div>
  );
}

/** 04 — picture disc, from the circular-art school: the cover cropped
    round and huge, spinning like wax. No grooves, no label ring. */
function DiscOption() {
  return (
    <div className="relative h-full w-full bg-black">
      <svg viewBox="0 0 100 100" aria-hidden className="block h-full w-full">
        <clipPath id="opt-disc">
          <circle cx="50" cy="50" r="46" />
        </clipPath>
        <g className="vinyl-spin">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <image
            href={TRACK.art}
            x="4"
            y="4"
            width="92"
            height="92"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#opt-disc)"
          />
          <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
          <circle cx="50" cy="50" r="2" fill="#000" stroke="rgba(255,255,255,0.5)" strokeWidth="0.6" />
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-2.5" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.85)" }}>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/75">{TRACK.status}</p>
        <p className="mt-0.5 truncate font-sans text-[13px] font-medium text-white">
          {TRACK.title} · {TRACK.artist}
        </p>
      </div>
    </div>
  );
}

/** 05 — sleeve notes, from the back-cover school: a library card.
    Thumb, title, and three mono rows, all real data. */
function SleeveOption() {
  const rows: [string, string][] = [
    ["artist", TRACK.artist],
    ["length", "2:47"],
    ["state", TRACK.status],
  ];
  return (
    <div className="flex h-full w-full flex-col bg-[#F4F1EA] p-3.5">
      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#6b675c]">sleeve notes</p>
      <div className="mt-2 flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={TRACK.art} alt="" draggable={false} className="h-14 w-14 shrink-0 rounded-md object-cover" />
        <p className="text-balance font-sans text-[17px] font-medium leading-tight text-[#171717]">
          {TRACK.title}
        </p>
      </div>
      <div className="mt-auto border-t border-[#171717]/15 pt-2">
        {rows.map(([k, v]) => (
          <p key={k} className="flex items-baseline justify-between gap-2 font-mono text-[10px] tracking-[0.08em] text-[#171717]">
            <span className="uppercase text-[#6b675c]">{k}</span>
            <span className="truncate">{v}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

export default function MusicOptions() {
  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <WayBack />
      <div className="mx-auto w-full max-w-[600px] px-5 pb-16">
        <h1 className="font-sans text-sm font-medium">Music tile — three directions</h1>
        <p className="mt-2 font-sans text-sm text-[#626262] dark:text-[#a8a8a8]">
          Same song, same tile size. Unlisted page, just for picking.
        </p>
        <div className="mt-8 space-y-10">
          <Shell n="01" name="record" note="As shipped. Black disc, art label, spins while playing." live>
            <RecordOption />
          </Shell>
          <Shell n="02" name="cover" note="Full-bleed artwork, big title, record peeking off the edge.">
            <CoverOption />
          </Shell>
          <Shell n="03" name="type" note="No artwork. Words and a progress bar do all of it.">
            <TypeOption />
          </Shell>
          <Shell n="04" name="disc" note="Picture disc: the cover cropped round and huge, spinning.">
            <DiscOption />
          </Shell>
          <Shell n="05" name="sleeve" note="Back-cover library card. Thumb, title, three true rows.">
            <SleeveOption />
          </Shell>
        </div>
      </div>
    </main>
  );
}
