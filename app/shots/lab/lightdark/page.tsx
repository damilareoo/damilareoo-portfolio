"use client";

import { useMemo, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/** Value fingerprints: average brightness per file. */
const VAL: [file: string, v: number][] = [
  ["110.png", 0.93], ["113.png", 0.733], ["116.png", 0.388], ["119.png", 0.875],
  ["123.png", 0.976], ["124.png", 0.93], ["131.png", 0.685], ["1511.png", 0.515],
  ["1512.png", 0.509], ["1537.png", 0.768], ["2012.png", 0.598], ["2013.png", 0.645],
  ["2014.png", 0.531], ["2031.png", 0.92], ["2032.png", 0.922], ["2033.png", 0.62],
  ["2036.png", 0.811], ["2047.png", 0.619], ["2049.png", 0.655], ["2050.png", 0.693],
  ["2057.png", 0.689], ["2062.png", 0.71], ["2072.png", 0.631], ["2075.png", 0.594],
  ["2079.png", 0.509], ["2084.png", 0.889], ["2085.png", 0.662], ["2087.png", 0.859],
  ["2088.png", 0.884], ["2095.png", 0.244], ["2097.png", 0.915], ["2101.png", 0.243],
  ["2104.png", 0.565], ["2107.png", 0.745], ["2114.png", 0.269], ["2115.png", 0.331],
  ["2116.png", 0.516], ["2121.png", 0.898], ["2124.png", 0.867], ["2125.png", 0.537],
  ["2127.png", 0.507], ["2129.png", 0.647], ["2131.png", 0.76], ["96.png", 0.642],
  ["chessever-rookie-rook.png", 0.715], ["frame-2087329441.png", 0.97],
  ["frame-2147237416.png", 0.58], ["frame-2147237418.png", 0.511],
  ["frame-2147255600.png", 0.474], ["frame-2147255601.png", 0.561],
  ["frame-34.png", 0.113], ["intempus-1.png", 0.868], ["intempus-2.png", 0.954],
  ["intempus.png", 0.786], ["remi-1.png", 0.74], ["remi.png", 0.677],
  ["sequence.png", 0.964], ["thumbnail.png", 0.105], ["vienna-1.png", 0.636],
  ["vienna-2.png", 0.729], ["vienna-3.png", 0.913], ["vienna.png", 0.91],
  ["wb1.png", 0.623], ["zlink.png", 0.891],
];

/**
 * Lab 73 — light / dark split.
 * The set weighed by brightness: day shift on a light ground, night
 * shift on black. Two weathers, one wall.
 */
export default function LightdarkPage() {
  const [at, setAt] = useState<number | null>(null);

  const halves = useMemo(() => {
    const byFile = new Map(VAL);
    const light = shots.map((_, i) => i).filter((i) => (byFile.get(shots[i].src.split("/").pop()!) ?? 0.5) >= 0.55);
    const dark = shots.map((_, i) => i).filter((i) => (byFile.get(shots[i].src.split("/").pop()!) ?? 0.5) < 0.55);
    return { light, dark };
  }, []);

  return (
    <main>
      <section className="bg-[#fafafa] text-[#171717]">
        <div className="mx-auto w-full max-w-[1120px] px-5 pb-16 pt-8">
          <p className="font-mono text-xs text-[#767676]">lab 73 — light / dark · day shift</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {halves.light.map((i) => (
              <button key={shots[i].src} type="button" onClick={() => setAt(i)} aria-label={`Open frame ${pad(i)}: ${shots[i].alt}`} className="block w-full cursor-zoom-in overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={shots[i].src} alt="" aria-hidden loading="lazy" draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-black text-white">
        <div className="mx-auto w-full max-w-[1120px] px-5 py-16">
          <p className="font-mono text-xs text-white/50">night shift</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {halves.dark.map((i) => (
              <button key={shots[i].src} type="button" onClick={() => setAt(i)} aria-label={`Open frame ${pad(i)}: ${shots[i].alt}`} className="block w-full cursor-zoom-in overflow-hidden rounded-xl ring-1 ring-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={shots[i].src} alt="" aria-hidden loading="lazy" draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </section>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} dark={true} />}
    </main>
  );
}
