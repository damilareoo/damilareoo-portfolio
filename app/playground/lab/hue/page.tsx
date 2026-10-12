"use client";

import { useMemo, useState } from "react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Average-hue fingerprints, measured off the files. Near-zero saturation
 * reads as grey — those sink to the front of the spectrum.
 */
const PRINTS: [file: string, h: number, s: number][] = [
  ["110.png", 0.0879, 0.007], ["113.png", 0.3731, 0.008], ["116.png", 0.0767, 0.129],
  ["119.png", 0.1053, 0.023], ["123.png", 0.58, 0.024], ["124.png", 0.578, 0.014],
  ["131.png", 0.4906, 0.022], ["1511.png", 0.5735, 0.015], ["1512.png", 0.6715, 0.055],
  ["1537.png", 0.5606, 0.198], ["2012.png", 0.4662, 0.016], ["2013.png", 0.1326, 0.023],
  ["2014.png", 0.1892, 0.009], ["2031.png", 0.098, 0.017], ["2032.png", 0.0649, 0.015],
  ["2033.png", 0.6059, 0.017], ["2036.png", 0.5939, 0.259], ["2047.png", 0.8544, 0.026],
  ["2049.png", 0.576, 0.092], ["2050.png", 0.6117, 0.301], ["2057.png", 0.1429, 0.141],
  ["2062.png", 0.57, 0.001], ["2072.png", 0.4789, 0.074], ["2075.png", 0.513, 0.075],
  ["2079.png", 0.0, 0.0], ["2084.png", 0.0773, 0.002], ["2085.png", 0.0, 0.162],
  ["2087.png", 0.0727, 0.034], ["2088.png", 0.2692, 0.007], ["2095.png", 0.4785, 0.484],
  ["2097.png", 0.1814, 0.008], ["2101.png", 0.4785, 0.486], ["2104.png", 0.9197, 0.017],
  ["2107.png", 0.2127, 0.073], ["2114.png", 0.4819, 0.413], ["2115.png", 0.4677, 0.317],
  ["2116.png", 0.4616, 0.137], ["2121.png", 0.0357, 0.0], ["2124.png", 0.6792, 0.005],
  ["2125.png", 0.0734, 0.018], ["2127.png", 0.2207, 0.016], ["2129.png", 0.5772, 0.061],
  ["2131.png", 0.5548, 0.321], ["96.png", 0.0861, 0.01], ["chessever-rookie-rook.png", 0.406, 0.007],
  ["frame-2147237416.png", 0.1506, 0.019],
  ["frame-2147237418.png", 0.8256, 0.002], ["frame-2147255600.png", 0.0, 0.0],
  ["frame-2147255601.png", 0.117, 0.016], ["frame-34.png", 0.538, 0.141],
  ["intempus-1.png", 0.0995, 0.038], ["intempus-2.png", 0.0233, 0.175],
  ["intempus.png", 0.9602, 0.011], ["remi-1.png", 0.172, 0.062],
  ["remi.png", 0.2182, 0.094], ["sequence.png", 0.0, 0.0], ["thumbnail.png", 0.5381, 0.139],
  ["vienna-1.png", 0.1142, 0.14], ["vienna-2.png", 0.1004, 0.101],
  ["vienna-3.png", 0.0679, 0.088], ["vienna.png", 0.0751, 0.082],
  ["wb1.png", 0.5783, 0.217], ["zlink.png", 0.6446, 0.009],
];

/**
 * Lab 26 — hue spectrum.
 * The wall sorted by average hue: greys first, then the wheel from red
 * through green to blue. Colour becomes the wayfinding.
 */
export default function HuePage() {
  const [at, setAt] = useState<number | null>(null);

  const order = useMemo(() => {
    const byFile = new Map(PRINTS.map((p) => [p[0], { h: p[1], s: p[2] }]));
    return shots
      .map((s) => s.src.split("/").pop()!)
      .map((f) => ({ f, ...(byFile.get(f) ?? { h: 0, s: 0 }) }))
      .sort((a, b) => b.s - a.s || a.h - b.h)
      .map((x) => shots.findIndex((s) => s.src.endsWith(x.f)));
  }, []);

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 26 — hue spectrum</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {order.map((i) => (
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
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
