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
      <div className="mt-3 aspect-square w-full overflow-hidden rounded-xl ring-1 ring-[#e5e5e5] dark:ring-white/10">
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
          <circle cx="50" cy="50" r="1.7" fill="#0A0A0A" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
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
            <stop offset="0%" stopColor="#0A0A0A" stopOpacity="0.55" />
            <stop offset="28%" stopColor="#0A0A0A" stopOpacity="0" />
            <stop offset="58%" stopColor="#0A0A0A" stopOpacity="0" />
            <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0.8" />
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
          <circle cx="84" cy="64" r="1.4" fill="#0A0A0A" stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" />
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-x-0 top-0 p-3" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.85)" }}>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/75">{TRACK.status}</p>
        <p className="mt-1 line-clamp-2 font-sans text-[15px] font-medium leading-tight text-white">
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
          <circle cx="50" cy="50" r="2" fill="#0A0A0A" stroke="rgba(255,255,255,0.5)" strokeWidth="0.6" />
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-2.5" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.85)" }}>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/75">{TRACK.status}</p>
        <p className="mt-0.5 truncate font-sans text-sm font-medium text-white">
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

/** Shared bits for the playful set: stub art that always resolves. */
const PLAY_ART = "https://picsum.photos/seed/spotify-cover/400";

/** 06 — cassette: reels turn while the tape plays. */
function CassetteOption() {
  const reel = () => (
    <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6 shrink-0">
      <g className="vinyl-spin">
        <circle cx="12" cy="12" r="10" fill="none" stroke="#0B0B0D" strokeWidth="2.5" />
        {[0, 60, 120].map((a) => (
          <line key={a} x1="12" y1="12" x2={12 + 8 * Math.cos((a * Math.PI) / 180)} y2={12 + 8 * Math.sin((a * Math.PI) / 180)} stroke="#0B0B0D" strokeWidth="2.5" />
        ))}
        <circle cx="12" cy="12" r="2" fill="#0B0B0D" />
      </g>
    </svg>
  );
  return (
    <div className="flex h-full w-full flex-col justify-center bg-[#E11A1B] p-4">
      <div className="rounded-lg bg-[#0B0B0D] p-3">
        <div className="flex items-center justify-between gap-2 rounded bg-[#F4F1EA] px-2 py-1.5">
          {reel()}
          <p className="min-w-0 flex-1 truncate text-center font-mono text-[10px] uppercase tracking-[0.14em] text-[#0B0B0D]">{TRACK.title}</p>
          {reel()}
        </div>
        <div className="mx-auto mt-2 h-2 w-16 rounded-b-lg bg-[#F4F1EA]" />
      </div>
      <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-white/80">{TRACK.status}</p>
    </div>
  );
}

/** 07 — boombox: speakers pump, antenna up. */
function BoomboxOption() {
  const speaker = (cx: number) => (
    <g>
      <circle cx={cx} cy="62" r="16" fill="none" stroke="#fff" strokeWidth="2" />
      <circle cx={cx} cy="62" r="6" fill="#fff">
        <animate attributeName="r" values="6;8;6" dur="0.5s" repeatCount="indefinite" />
      </circle>
    </g>
  );
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#0B0B0D]">
      <svg viewBox="0 0 100 100" aria-hidden className="block h-full w-full">
        <line x1="70" y1="30" x2="86" y2="8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <rect x="8" y="34" width="84" height="44" rx="5" fill="none" stroke="#fff" strokeWidth="2.5" />
        <rect x="38" y="44" width="24" height="10" rx="1.5" fill="#E11A1B" />
        {speaker(26)}
        {speaker(74)}
      </svg>
      <p className="-mt-6 font-mono text-[9px] uppercase tracking-[0.2em] text-white/70">{TRACK.title}</p>
    </div>
  );
}

/** 08 — equalizer: twelve bars, no two alike. */
function EqOption() {
  const hs = [14, 26, 20, 32, 24, 36, 18, 30, 22, 34, 16, 28];
  return (
    <div className="flex h-full w-full flex-col justify-center bg-[#0B0B0D] p-4">
      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/55">{TRACK.status}</p>
      <div className="mt-2 flex h-16 items-end gap-1.5">
        {hs.map((h, i) => (
          <span key={i} className="relative flex-1 overflow-hidden rounded-sm bg-white/15" style={{ height: h * 2 }}>
            <span className="absolute inset-x-0 bottom-0 rounded-sm bg-white" style={{ animation: `eq-bounce ${0.4 + (i % 5) * 0.13}s ease-in-out ${-i * 0.11}s infinite alternate`, transformOrigin: "bottom" }} >
              <span className="block h-full w-full" style={{ height: h * 2 }} />
            </span>
          </span>
        ))}
      </div>
      <p className="mt-2 truncate font-sans text-[15px] font-medium text-white">{TRACK.title}</p>
    </div>
  );
}

/** 09 — marquee: chasing bulbs around the billing. */
function MarqueeOption() {
  const bulbs = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    return { x: 50 + 42 * Math.cos(a), y: 50 + 34 * Math.sin(a), on: i % 2 === 0 };
  });
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#141414]">
      <svg viewBox="0 0 100 100" aria-hidden className="block h-full w-full">
        <rect x="12" y="22" width="76" height="56" rx="8" fill="#0B0B0D" stroke="#E11A1B" strokeWidth="1.5" />
        {bulbs.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r="1.8" fill="#FFD60A">
            <animate attributeName="opacity" values={b.on ? "1;0.15;1" : "0.15;1;0.15"} dur="1s" repeatCount="indefinite" />
          </circle>
        ))}
        <text x="50" y="48" textAnchor="middle" fill="#fff" fontSize="8" fontFamily="monospace" letterSpacing="2">{TRACK.status.toUpperCase()}</text>
        <text x="50" y="62" textAnchor="middle" fill="#FFD60A" fontSize="9" fontFamily="monospace">{TRACK.title}</text>
      </svg>
    </div>
  );
}

/** 10 — neon: the title buzzes and drops a letter now and then. */
function NeonOption() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#0B0B0D]">
      <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#7df9ff]">
        <animate attributeName="opacity" values="1;1;0.3;1;1;0.5;1" dur="4s" repeatCount="indefinite" />
        {TRACK.status}
      </p>
      <p className="mt-2 text-center font-sans text-[30px] font-medium leading-none text-[#ff71ce]" style={{ textShadow: "0 0 8px #ff71ce, 0 0 24px #ff71ce" }}>
        {TRACK.title}
      </p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#fffb96]" style={{ textShadow: "0 0 10px #fffb96" }}>
        {TRACK.artist}
      </p>
    </div>
  );
}

/** 11 — ticket: admit one, perforated and proud. */
function TicketOption() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#F4F1EA] p-4">
      <div className="-rotate-6 rounded-lg border-2 border-dashed border-[#E11A1B] bg-white px-4 py-3 text-center">
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#E11A1B]">admit one</p>
        <p className="mt-1 font-sans text-[20px] font-medium leading-tight text-[#0B0B0D]">{TRACK.title}</p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#6b675c]">{TRACK.artist} · {TRACK.status}</p>
      </div>
    </div>
  );
}

/** 12 — stamp: slammed on, slightly crooked, legal everywhere. */
function StampOption() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#F4F1EA]">
      <p className="rotate-[-8deg] rounded border-[3px] border-[#0B0B0D] px-3 py-1 font-mono text-sm uppercase tracking-[0.2em] text-[#0B0B0D]">
        {TRACK.status}
      </p>
      <p className="max-w-[80%] text-center font-sans text-[22px] font-medium leading-tight text-[#0B0B0D]">{TRACK.title}</p>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6b675c]">{TRACK.artist}</p>
    </div>
  );
}

/** 13 — pac-man: eats the progress, row by row. */
function PacOption() {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-3 bg-[#0B0B0D] p-4">
      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/55">{TRACK.status}</p>
      <svg viewBox="0 0 100 40" aria-hidden className="block w-full">
        {[12, 28, 44, 60, 76].map((x) => (
          <circle key={x} cx={x} cy="20" r="3" fill="#FFD60A" />
        ))}
        <g>
          <animateMotion dur="3s" repeatCount="indefinite" path="M 4 20 L 92 20" />
          <path d="M 10 12 A 10 10 0 1 0 10 28 L 2 20 Z" fill="#FFD60A" />
        </g>
      </svg>
      <p className="truncate font-sans text-[15px] font-medium text-white">{TRACK.title}</p>
    </div>
  );
}

/** 14 — invader: marches across, two frames, no mercy. */
function InvaderOption() {
  const rows = ["00100000100", "00010001000", "00111111100", "01101110110", "11111111111", "10111111101", "10100000101", "00011011000"];
  const dots = (dx: number) =>
    rows.flatMap((row, r) =>
      row.split("").flatMap((b, c) =>
        b === "1" ? [{ x: dx + c * 4, y: 20 + r * 4 }] : [],
      ),
    );
  return (
    <div className="flex h-full w-full flex-col justify-center bg-[#0B0B0D] p-4">
      <svg viewBox="0 0 100 70" aria-hidden className="block w-full">
        <g fill="#39FF14">
          <animateTransform attributeName="transform" type="translate" values="0 0; 44 0; 44 0; 0 0" dur="4s" repeatCount="indefinite" />
          {dots(4).map((d, i) => (
            <rect key={i} x={d.x} y={d.y} width="3.4" height="3.4" />
          ))}
        </g>
      </svg>
      <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-[#39FF14]">{TRACK.status} · {TRACK.title}</p>
    </div>
  );
}

/** 15 — tetris: the week stacks itself. */
function TetrisOption() {
  const well = [
    { x: 30, y: 52, w: 12, h: 6, c: "#E11A1B" },
    { x: 42, y: 52, w: 12, h: 6, c: "#FFD60A" },
    { x: 54, y: 52, w: 12, h: 6, c: "#26A5E4" },
  ];
  return (
    <div className="flex h-full w-full flex-col justify-center bg-[#0B0B0D] p-4">
      <svg viewBox="0 0 100 70" aria-hidden className="block w-full">
        {well.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill={b.c} />
        ))}
        <g fill="#39FF14">
          <animateTransform attributeName="transform" type="translate" values="0 -46; 0 34; 0 34" dur="1.6s" repeatCount="indefinite" />
          <rect x="42" y="6" width="18" height="6" />
          <rect x="48" y="0" width="6" height="6" />
        </g>
      </svg>
      <p className="mt-1 truncate font-sans text-[15px] font-medium text-white">{TRACK.title}</p>
    </div>
  );
}

/** 16 — dice: the day's roll, shaken not stirred. */
function DiceOption() {
  const pips: Record<number, [number, number][]> = {
    5: [[32, 32], [68, 32], [50, 50], [32, 68], [68, 68]],
  };
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#25D366]">
      <svg viewBox="0 0 100 70" aria-hidden className="block w-full">
        <g>
          <animateTransform attributeName="transform" type="rotate" values="-8 50 35; 8 50 35; -8 50 35" dur="1.2s" repeatCount="indefinite" />
          <rect x="28" y="10" width="44" height="44" rx="9" fill="#fff" />
          {pips[5].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="4" fill="#0B0B0D" />
          ))}
        </g>
      </svg>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#0B0B0D]">{TRACK.status} · {TRACK.title}</p>
    </div>
  );
}

/** 17 — slots: three reels, always lands on the track. */
function SlotsOption() {
  const reel = (x: number, begin: string) => (
    <g fontFamily="monospace" fontSize="11" textAnchor="middle" fill="#fff">
      {[0, 1, 2].map((k) => (
        <text key={k} x={x} y={30 + k * 16}>
          <animate attributeName="y" values="14;30;46;62" dur="0.9s" begin={begin} repeatCount="indefinite" />
          {["7", "◆", "●"][k]}
        </text>
      ))}
      <rect x={x - 13} y="14" width="26" height="32" fill="none" stroke="#FFD60A" strokeWidth="1.5" rx="3" />
    </g>
  );
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#0B0B0D]">
      <svg viewBox="0 0 100 60" aria-hidden className="block w-full">
        {reel(26, "0s")}
        {reel(50, "-0.3s")}
        {reel(74, "-0.6s")}
      </svg>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFD60A]">jackpot · {TRACK.title}</p>
    </div>
  );
}

/** 18 — pong: now vs last, eternal rally. */
function PongOption() {
  return (
    <div className="flex h-full w-full flex-col justify-center bg-[#0B0B0D] p-4">
      <div className="flex justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-white/60">
        <span>now</span>
        <span>last</span>
      </div>
      <svg viewBox="0 0 100 56" aria-hidden className="mt-1 block w-full">
        <line x1="50" y1="2" x2="50" y2="54" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="2 3" />
        <rect x="4" y="20" width="3" height="16" fill="#fff">
          <animate attributeName="y" values="8;32;8" dur="2.2s" repeatCount="indefinite" />
        </rect>
        <rect x="93" y="20" width="3" height="16" fill="#fff">
          <animate attributeName="y" values="32;8;32" dur="2.2s" repeatCount="indefinite" />
        </rect>
        <circle r="2.6" fill="#E11A1B">
          <animate attributeName="cx" values="8;92;8" dur="2.2s" repeatCount="indefinite" />
          <animate attributeName="cy" values="12;44;12" dur="2.2s" repeatCount="indefinite" />
        </circle>
      </svg>
      <p className="mt-1 truncate font-sans text-[15px] font-medium text-white">{TRACK.title}</p>
    </div>
  );
}

/** 19 — snake: eats its way to the chorus. */
function SnakeOption() {
  return (
    <div className="flex h-full w-full flex-col justify-center bg-[#0B0B0D] p-4">
      <svg viewBox="0 0 100 60" aria-hidden className="block w-full">
        <path id="opt-snake-path" d="M 6 50 L 6 30 L 50 30 L 50 12 L 94 12" fill="none" stroke="rgba(57,255,20,0.3)" strokeWidth="4" strokeLinecap="round" />
        <circle r="4" fill="#39FF14">
          <animateMotion dur="4s" repeatCount="indefinite" rotate="auto">
            <mpath href="#opt-snake-path" />
          </animateMotion>
        </circle>
        <circle cx="94" cy="12" r="3" fill="#E11A1B" />
      </svg>
      <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-[#39FF14]">{TRACK.status} · {TRACK.title}</p>
    </div>
  );
}

/** 20 — radio dial: sweeps the band, lands on the track. */
function DialOption() {
  return (
    <div className="flex h-full w-full flex-col justify-center bg-[#141414] p-4">
      <svg viewBox="0 0 100 60" aria-hidden className="block w-full">
        {[10, 26, 42, 58, 74, 90].map((x) => (
          <line key={x} x1={x} y1="40" x2={x} y2="46" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
        ))}
        <line x1="6" y1="46" x2="94" y2="46" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
        <g>
          <animateTransform attributeName="transform" type="rotate" values="-24 50 46; 24 50 46; -24 50 46" dur="5s" repeatCount="indefinite" />
          <line x1="50" y1="46" x2="50" y2="14" stroke="#E11A1B" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
      <p className="mt-1 text-center font-mono text-[11px] tracking-[0.1em] text-white">87.{TRACK.title.length} {TRACK.title} FM</p>
    </div>
  );
}

/** 21 — VU meter: the needle can't sit still. */
function VuOption() {
  return (
    <div className="flex h-full w-full flex-col justify-center bg-[#F4F1EA] p-4">
      <svg viewBox="0 0 100 60" aria-hidden className="block w-full">
        <path d="M 12 52 A 42 42 0 0 1 88 52" fill="none" stroke="#0B0B0D" strokeWidth="1.5" />
        {[0, 30, 60, 90, 120, 150, 180].map((a) => {
          const r = ((a - 90) * Math.PI) / 180;
          return <line key={a} x1={50 + 36 * Math.cos(r)} y1={52 + 36 * Math.sin(r)} x2={50 + 42 * Math.cos(r)} y2={52 + 42 * Math.sin(r)} stroke="#0B0B0D" strokeWidth="1.2" />;
        })}
        <g>
          <animateTransform attributeName="transform" type="rotate" values="-38 50 52; 34 50 52; -12 50 52; 38 50 52; -38 50 52" dur="1.8s" repeatCount="indefinite" />
          <line x1="50" y1="52" x2="50" y2="16" stroke="#E11A1B" strokeWidth="2" strokeLinecap="round" />
        </g>
        <circle cx="50" cy="52" r="3.5" fill="#0B0B0D" />
      </svg>
      <p className="mt-1 text-center font-mono text-[9px] uppercase tracking-[0.24em] text-[#6b675c]">volume · {TRACK.title}</p>
    </div>
  );
}

/** 22 — lava lamp: three blobs, nowhere to be. */
function LavaOption() {
  const blob = (cx: number, dur: string, begin: string, c: string) => (
    <ellipse cx={cx} cy="50" rx="9" ry="12" fill={c}>
      <animate attributeName="cy" values="72;28;72" dur={dur} begin={begin} repeatCount="indefinite" />
      <animate attributeName="rx" values="9;7;11;9" dur={dur} begin={begin} repeatCount="indefinite" />
    </ellipse>
  );
  return (
    <div className="flex h-full w-full flex-col justify-center bg-[#1a0b2e] p-4">
      <svg viewBox="0 0 100 90" aria-hidden className="block w-full">
        <path d="M 30 6 L 70 6 L 64 18 L 36 18 Z" fill="rgba(255,255,255,0.7)" />
        <rect x="30" y="18" width="40" height="56" rx="18" fill="rgba(255,255,255,0.10)" />
        {blob(42, "5s", "0s", "#ff71ce")}
        {blob(56, "6.5s", "-2s", "#fffb96")}
        {blob(49, "7.5s", "-4s", "#7df9ff")}
        <rect x="28" y="74" width="44" height="8" rx="3" fill="rgba(255,255,255,0.7)" />
      </svg>
      <p className="mt-1 text-center font-mono text-[9px] uppercase tracking-[0.22em] text-white/70">{TRACK.status} · {TRACK.title}</p>
    </div>
  );
}

/** 23 — aquarium: one fish, doing loops. */
function AquariumOption() {
  return (
    <div className="flex h-full w-full flex-col justify-center bg-[#06283D] p-4">
      <svg viewBox="0 0 100 70" aria-hidden className="block w-full">
        <path d="M 12 68 C 10 50, 14 40, 12 26 M 88 68 C 90 52, 86 44, 88 30" fill="none" stroke="#39FF14" strokeWidth="2" strokeLinecap="round" />
        <g>
          <animateMotion dur="7s" repeatCount="indefinite" path="M -12 44 C 20 30, 45 58, 75 40 C 90 32, 100 40, 114 34" />
          <g>
            <ellipse cx="0" cy="0" rx="8" ry="4.5" fill="#FFD60A" />
            <path d="M -8 0 L -13 -4 L -13 4 Z" fill="#FFD60A" />
            <circle cx="3.5" cy="-1" r="1" fill="#06283D" />
          </g>
        </g>
        {[30, 55, 75].map((x, i) => (
          <circle key={i} cx={x} cy="60" r="1.6" fill="rgba(255,255,255,0.5)">
            <animate attributeName="cy" values="60;18" dur={`${3 + i}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0" dur={`${3 + i}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
      <p className="mt-1 text-center font-mono text-[9px] uppercase tracking-[0.22em] text-white/70">{TRACK.title} · deep cut</p>
    </div>
  );
}

/** 24 — piano: one key can't stop pressing itself. */
function PianoOption() {
  return (
    <div className="flex h-full w-full flex-col justify-center bg-[#F4F1EA] p-4">
      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#6b675c]">{TRACK.status}</p>
      <div className="mt-2 flex gap-[3px]">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
          <span key={k} className="relative h-16 flex-1 rounded-b border border-[#0B0B0D]/20 bg-white">
            {k === 4 && <span className="absolute inset-x-1 top-0 h-8 rounded-b bg-[#0B0B0D]" style={{ animation: "eq-bounce 0.7s ease-in-out infinite alternate", transformOrigin: "bottom" }} />}
            {[1, 2, 4, 5, 6].includes(k) && <span className="absolute -right-[5px] top-0 z-10 h-9 w-[7px] rounded-b bg-[#0B0B0D]" />}
          </span>
        ))}
      </div>
      <p className="mt-2 truncate font-sans text-[15px] font-medium text-[#0B0B0D]">{TRACK.title}</p>
    </div>
  );
}

/** 25 — tamagotchi: a small pet bops to the track. */
function TamaOption() {
  const px: [number, number][] = [[-2, 0], [2, 0], [-1, -4], [1, -4], [0, -8]];
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#FFD60A]">
      <div className="rounded-[46%_46%_48%_48%] bg-[#0B0B0D] px-8 pb-6 pt-8 text-center">
        <svg viewBox="-14 -16 28 26" aria-hidden className="mx-auto block h-16 w-16">
          <g fill="#FFD60A">
            <animateTransform attributeName="transform" type="translate" values="0 0; 0 -4; 0 0" dur="0.6s" repeatCount="indefinite" />
            {px.map(([x, y], i) => (
              <rect key={i} x={x - 2} y={y - 2} width="4" height="4" />
            ))}
            <rect x="-4" y="-6" width="2" height="2" fill="#0B0B0D" />
            <rect x="2" y="-6" width="2" height="2" fill="#0B0B0D" />
          </g>
        </svg>
        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[#FFD60A]">{TRACK.status}</p>
        <p className="mt-0.5 max-w-[110px] truncate font-sans text-sm font-medium text-white">{TRACK.title}</p>
      </div>
    </div>
  );
}

export default function MusicOptions() {
  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <WayBack />
      <div className="mx-auto w-full max-w-[600px] px-5 pb-16">
        <h1 className="font-sans text-sm font-medium">Music tile — twenty-five directions</h1>
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
          <Shell n="06" name="cassette" note="Reels turn, tape window carries the title.">
            <CassetteOption />
          </Shell>
          <Shell n="07" name="boombox" note="Speakers pump, antenna up.">
            <BoomboxOption />
          </Shell>
          <Shell n="08" name="equalizer" note="Twelve bars, no two alike.">
            <EqOption />
          </Shell>
          <Shell n="09" name="marquee" note="Chasing bulbs around the billing.">
            <MarqueeOption />
          </Shell>
          <Shell n="10" name="neon" note="Buzzes, drops a letter now and then.">
            <NeonOption />
          </Shell>
          <Shell n="11" name="ticket" note="Admit one, perforated and proud.">
            <TicketOption />
          </Shell>
          <Shell n="12" name="stamp" note="Slammed on, slightly crooked.">
            <StampOption />
          </Shell>
          <Shell n="13" name="pac-man" note="Eats the progress, row by row.">
            <PacOption />
          </Shell>
          <Shell n="14" name="invader" note="Marches across, no mercy.">
            <InvaderOption />
          </Shell>
          <Shell n="15" name="tetris" note="The week stacks itself.">
            <TetrisOption />
          </Shell>
          <Shell n="16" name="dice" note="The day's roll, shaken.">
            <DiceOption />
          </Shell>
          <Shell n="17" name="slots" note="Three reels, always lands on the track.">
            <SlotsOption />
          </Shell>
          <Shell n="18" name="pong" note="Now vs last, eternal rally.">
            <PongOption />
          </Shell>
          <Shell n="19" name="snake" note="Eats its way to the chorus.">
            <SnakeOption />
          </Shell>
          <Shell n="20" name="dial" note="Sweeps the band, lands on the track.">
            <DialOption />
          </Shell>
          <Shell n="21" name="vu" note="The needle can't sit still.">
            <VuOption />
          </Shell>
          <Shell n="22" name="lava" note="Three blobs, nowhere to be.">
            <LavaOption />
          </Shell>
          <Shell n="23" name="aquarium" note="One fish, doing loops.">
            <AquariumOption />
          </Shell>
          <Shell n="24" name="piano" note="One key keeps pressing itself.">
            <PianoOption />
          </Shell>
          <Shell n="25" name="tamagotchi" note="A small pet bops to the track.">
            <TamaOption />
          </Shell>
        </div>
      </div>
    </main>
  );
}
