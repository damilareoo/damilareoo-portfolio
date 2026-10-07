"use client";

import { useMemo, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/** Saturation fingerprints: vivid first, greys last. */
const SAT: [file: string, s: number][] = [
  ["110.png", 0.007], ["113.png", 0.008], ["116.png", 0.129], ["119.png", 0.023],
  ["123.png", 0.024], ["124.png", 0.014], ["131.png", 0.022], ["1511.png", 0.015],
  ["1512.png", 0.055], ["1537.png", 0.198], ["2012.png", 0.016], ["2013.png", 0.023],
  ["2014.png", 0.009], ["2031.png", 0.017], ["2032.png", 0.015], ["2033.png", 0.017],
  ["2036.png", 0.259], ["2047.png", 0.026], ["2049.png", 0.092], ["2050.png", 0.301],
  ["2057.png", 0.141], ["2062.png", 0.001], ["2072.png", 0.074], ["2075.png", 0.075],
  ["2079.png", 0.0], ["2084.png", 0.002], ["2085.png", 0.162], ["2087.png", 0.034],
  ["2088.png", 0.007], ["2095.png", 0.484], ["2097.png", 0.008], ["2101.png", 0.486],
  ["2104.png", 0.017], ["2107.png", 0.073], ["2114.png", 0.413], ["2115.png", 0.317],
  ["2116.png", 0.137], ["2121.png", 0.0], ["2124.png", 0.005], ["2125.png", 0.018],
  ["2127.png", 0.016], ["2129.png", 0.061], ["2131.png", 0.321], ["96.png", 0.01],
  ["chessever-rookie-rook.png", 0.007], ["frame-2087329441.png", 0.0],
  ["frame-2147237416.png", 0.019], ["frame-2147237418.png", 0.002],
  ["frame-2147255600.png", 0.0], ["frame-2147255601.png", 0.016],
  ["frame-34.png", 0.141], ["intempus-1.png", 0.038], ["intempus-2.png", 0.175],
  ["intempus.png", 0.011], ["remi-1.png", 0.062], ["remi.png", 0.094],
  ["sequence.png", 0.0], ["thumbnail.png", 0.139], ["vienna-1.png", 0.14],
  ["vienna-2.png", 0.101], ["vienna-3.png", 0.088], ["vienna.png", 0.082],
  ["wb1.png", 0.217], ["zlink.png", 0.009],
];

/**
 * Lab 72 — hue bands.
 * The set poured into saturation bands: vivid leads, monochrome
 * closes. A gradient you browse instead of a list.
 */
export default function HuebandsPage() {
  const [at, setAt] = useState<number | null>(null);

  const bands = useMemo(() => {
    const byFile = new Map(SAT);
    const idx = shots.map((_, i) => i);
    const vivid = idx.filter((i) => (byFile.get(shots[i].src.split("/").pop()!) ?? 0) >= 0.1);
    const mid = idx.filter((i) => {
      const s = byFile.get(shots[i].src.split("/").pop()!) ?? 0;
      return s >= 0.02 && s < 0.1;
    });
    const grey = idx.filter((i) => (byFile.get(shots[i].src.split("/").pop()!) ?? 0) < 0.02);
    return [vivid, mid, grey];
  }, []);

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] space-y-10 px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 72 — hue bands</p>
        {bands.map((band, b) => (
          <div key={b} className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {band.map((i) => (
              <button
                key={shots[i].src}
                type="button"
                onClick={() => setAt(i)}
                aria-label={`Open frame ${pad(i)}: ${shots[i].alt}`}
                className="block w-full cursor-zoom-in overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={shots[i].src} alt="" aria-hidden loading="lazy" draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
              </button>
            ))}
          </div>
        ))}
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
