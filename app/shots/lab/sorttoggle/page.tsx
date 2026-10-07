"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { dossier } from "@/data/dossier";
import { LabViewer } from "@/components/lab-viewer";
import { useReducedMotion } from "@/lib/motion";

const shots = dossier.shots;
const pad = (i: number) => String(i + 1).padStart(2, "0");

type Mode = "projects" | "hue" | "random";

const PRINTS: Record<string, { h: number; s: number }> = {
  "110.png": { h: 0.0879, s: 0.007 }, "113.png": { h: 0.3731, s: 0.008 },
  "116.png": { h: 0.0767, s: 0.129 }, "119.png": { h: 0.1053, s: 0.023 },
  "123.png": { h: 0.58, s: 0.024 }, "124.png": { h: 0.578, s: 0.014 },
  "131.png": { h: 0.4906, s: 0.022 }, "1511.png": { h: 0.5735, s: 0.015 },
  "1512.png": { h: 0.6715, s: 0.055 }, "1537.png": { h: 0.5606, s: 0.198 },
  "2012.png": { h: 0.4662, s: 0.016 }, "2013.png": { h: 0.1326, s: 0.023 },
  "2014.png": { h: 0.1892, s: 0.009 }, "2031.png": { h: 0.098, s: 0.017 },
  "2032.png": { h: 0.0649, s: 0.015 }, "2033.png": { h: 0.6059, s: 0.017 },
  "2036.png": { h: 0.5939, s: 0.259 }, "2047.png": { h: 0.8544, s: 0.026 },
  "2049.png": { h: 0.576, s: 0.092 }, "2050.png": { h: 0.6117, s: 0.301 },
  "2057.png": { h: 0.1429, s: 0.141 }, "2062.png": { h: 0.57, s: 0.001 },
  "2072.png": { h: 0.4789, s: 0.074 }, "2075.png": { h: 0.513, s: 0.075 },
  "2079.png": { h: 0.0, s: 0.0 }, "2084.png": { h: 0.0773, s: 0.002 },
  "2085.png": { h: 0.0, s: 0.162 }, "2087.png": { h: 0.0727, s: 0.034 },
  "2088.png": { h: 0.2692, s: 0.007 }, "2095.png": { h: 0.4785, s: 0.484 },
  "2097.png": { h: 0.1814, s: 0.008 }, "2101.png": { h: 0.4785, s: 0.486 },
  "2104.png": { h: 0.9197, s: 0.017 }, "2107.png": { h: 0.2127, s: 0.073 },
  "2114.png": { h: 0.4819, s: 0.413 }, "2115.png": { h: 0.4677, s: 0.317 },
  "2116.png": { h: 0.4616, s: 0.137 }, "2121.png": { h: 0.0357, s: 0.0 },
  "2124.png": { h: 0.6792, s: 0.005 }, "2125.png": { h: 0.0734, s: 0.018 },
  "2127.png": { h: 0.2207, s: 0.016 }, "2129.png": { h: 0.5772, s: 0.061 },
  "2131.png": { h: 0.5548, s: 0.321 }, "96.png": { h: 0.0861, s: 0.01 },
  "chessever-rookie-rook.png": { h: 0.406, s: 0.007 },
  "frame-2087329441.png": { h: 0.0, s: 0.0 }, "frame-2147237416.png": { h: 0.1506, s: 0.019 },
  "frame-2147237418.png": { h: 0.8256, s: 0.002 }, "frame-2147255600.png": { h: 0.0, s: 0.0 },
  "frame-2147255601.png": { h: 0.117, s: 0.016 }, "frame-34.png": { h: 0.538, s: 0.141 },
  "intempus-1.png": { h: 0.0995, s: 0.038 }, "intempus-2.png": { h: 0.0233, s: 0.175 },
  "intempus.png": { h: 0.9602, s: 0.011 }, "remi-1.png": { h: 0.172, s: 0.062 },
  "remi.png": { h: 0.2182, s: 0.094 }, "sequence.png": { h: 0.0, s: 0.0 },
  "thumbnail.png": { h: 0.5381, s: 0.139 }, "vienna-1.png": { h: 0.1142, s: 0.14 },
  "vienna-2.png": { h: 0.1004, s: 0.101 }, "vienna-3.png": { h: 0.0679, s: 0.088 },
  "vienna.png": { h: 0.0751, s: 0.082 }, "wb1.png": { h: 0.5783, s: 0.217 },
  "zlink.png": { h: 0.6446, s: 0.009 },
};

/**
 * Lab 75 — sort toggle.
 * Three orders, one wall: project sequence, hue spectrum, random.
 * The reflow between them is the whole show.
 */
export default function SorttogglePage() {
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<Mode>("projects");
  const [at, setAt] = useState<number | null>(null);

  const order = useMemo(() => {
    if (mode === "hue") {
      return shots
        .map((_, i) => i)
        .sort((a, b) => {
          const pa = PRINTS[shots[a].src.split("/").pop()!] ?? { h: 0, s: 0 };
          const pb = PRINTS[shots[b].src.split("/").pop()!] ?? { h: 0, s: 0 };
          return pb.s - pa.s || pa.h - pb.h;
        });
    }
    if (mode === "random") {
      const a = shots.map((_, i) => i);
      let seed = 7;
      for (let i = a.length - 1; i > 0; i--) {
        seed = (seed * 16807) % 2147483647;
        const j = seed % (i + 1);
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
    return shots.map((_, i) => i);
  }, [mode]);

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 75 — sort toggle</p>
          <div className="flex items-center gap-1 rounded-full bg-white/85 p-1 ring-1 ring-[#e5e5e5] dark:bg-[#1e1e1e]/85 dark:ring-white/10">
            {(["projects", "hue", "random"] as Mode[]).map((m, k) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                aria-label={`Sort ${k + 1} of 3`}
                className={`cursor-pointer rounded-full px-3 py-1.5 font-mono text-xs transition-colors ${
                  mode === m ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717]" : "text-[#767676] hover:text-[#171717] dark:text-[#8a8a8a] dark:hover:text-white"
                }`}
              >
                {["Ⅰ", "Ⅱ", "Ⅲ"][k]}
              </button>
            ))}
          </div>
        </div>
        <motion.div layout={!reduced} className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {order.map((i) => (
            <motion.button
              key={shots[i].src}
              type="button"
              layout={!reduced}
              transition={{ type: "spring", stiffness: 240, damping: 30 }}
              onClick={() => setAt(i)}
              aria-label={`Open frame ${pad(i)}: ${shots[i].alt}`}
              className="block w-full cursor-zoom-in overflow-hidden rounded-xl bg-white text-left ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shots[i].src} alt="" aria-hidden loading="lazy" draggable={false} className="pointer-events-none block aspect-video w-full object-cover" />
            </motion.button>
          ))}
        </motion.div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}
