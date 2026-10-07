"use client";

import { useState } from "react";
import { dossier } from "@/data/dossier";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 91 — versus.
 * Two frames, one tap: the winner stays, the loser is replaced by a
 * stranger. Rounds count up. Taste, gamified, no words needed.
 */
export default function VersusPage() {
  const [pair, setPair] = useState<[number, number]>([0, 1]);
  const [rounds, setRounds] = useState(0);
  const [wins, setWins] = useState<Record<number, number>>({});

  const vote = (winner: number) => {
    setWins((w) => ({ ...w, [winner]: (w[winner] ?? 0) + 1 }));
    setRounds((r) => r + 1);
    setPair(([a, b]) => {
      const keep = winner === 0 ? a : b;
      let n = keep;
      while (n === a || n === b) n = Math.floor(Math.random() * shots.length);
      return winner === 0 ? [keep, n] : [n, keep];
    });
  };

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[#0d0d0d] text-[#f2f2f2]">
      <div className="flex items-baseline justify-between px-5 pt-6">
        <p className="font-mono text-xs text-[#8a8a8a]">lab 91 — versus</p>
        <p aria-hidden className="font-mono text-xs tabular-nums text-[#8a8a8a]">round {rounds}</p>
      </div>
      <div className="grid min-h-0 flex-1 grid-rows-2 gap-3 px-5 py-4">
        {pair.map((i, k) => (
          <button
            key={`${i}-${rounds}-${k}`}
            type="button"
            onClick={() => vote(k)}
            aria-label={`Prefer frame ${pad(i)}: ${shots[i].alt}`}
            className="block min-h-0 w-full cursor-pointer overflow-hidden rounded-xl ring-1 ring-white/15 transition-transform active:scale-[0.99]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shots[i].src} alt="" aria-hidden draggable={false} className="pointer-events-none block h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <p className="pb-6 text-center font-mono text-xs text-[#8a8a8a]">
        {Object.keys(wins).length} preferred · {shots.length} in play
      </p>
    </main>
  );
}
