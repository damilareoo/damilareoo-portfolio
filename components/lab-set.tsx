"use client";

import { Suspense, createContext, useContext, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { dossier } from "@/data/dossier";
import { EXPLORATION_SETS } from "@/data/exploration-sets";

export type LabShots = { src: string; alt: string };
type Value = { shots: LabShots[]; ratio: string };

const DEFAULT_VALUE: Value = { shots: [], ratio: "16 / 9" };

const Ctx = createContext<Value>(DEFAULT_VALUE);

function Reader({ children }: { children: React.ReactNode }) {
  const params = useSearchParams();
  const value = useMemo<Value>(() => {
    const key = params.get("set");
    if (key && EXPLORATION_SETS[key]) {
      const s = EXPLORATION_SETS[key];
      return { shots: s.shots, ratio: s.ratio };
    }
    return { shots: dossier.shots, ratio: "16 / 9" };
  }, [params]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/**
 * Provides the lab image source under Suspense so `useLabShots` can
 * read `?set=` on first render — no flash of the wrong set, no
 * wasted preloads. Wrap the route content; read with `useLabShots`.
 */
export function LabSetProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <Reader>{children}</Reader>
    </Suspense>
  );
}

/**
 * Lab image source. Default is the portfolio's own shots; `?set=<name>`
 * swaps in one of the explorations-rail study sets (see
 * data/exploration-sets.ts) with its display aspect.
 */
export function useLabShots(): Value {
  return useContext(Ctx);
}
