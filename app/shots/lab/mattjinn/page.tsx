"use client";

import { useEffect, useRef, useState } from "react";
import { LabViewer } from "@/components/lab-viewer";
import { LabSetProvider, useLabShots } from "@/components/lab-set";

const pad = (i: number) => String(i + 1).padStart(2, "0");

/** Matt Jinn study tile: honest-2D warp tracked to the pointer. */
function WarpTile({ src, alt, eager }: { src: string; alt: string; eager?: boolean }) {
  const frameRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img) return;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bend = (e: PointerEvent) => {
      const r = frame.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        img.style.transition = "transform 60ms linear";
        img.style.transform = `perspective(600px) rotateX(${(-y * 9).toFixed(2)}deg) rotateY(${(x * 11).toFixed(2)}deg) skewX(${(x * 2.5).toFixed(2)}deg) scale(1.05)`;
      });
    };
    const rest = () => {
      cancelAnimationFrame(raf.current);
      img.style.transition = "transform 600ms cubic-bezier(0.16,1,0.3,1)";
      img.style.transform = "";
    };
    frame.addEventListener("pointermove", bend, { passive: true });
    frame.addEventListener("pointerleave", rest);
    return () => {
      cancelAnimationFrame(raf.current);
      frame.removeEventListener("pointermove", bend);
      frame.removeEventListener("pointerleave", rest);
    };
  }, []);

  return (
    <figure ref={frameRef} className="block h-full w-full overflow-hidden" style={{ perspective: "600px" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={eager ? undefined : "lazy"}
        draggable={false}
        className="pointer-events-none h-full w-full object-cover will-change-transform"
      />
    </figure>
  );
}

/**
 * Lab Matt Jinn study — images that warp under the cursor.
 * His runs on WebGL; this one is honest 2D: rotate + skew tracked
 * to the pointer with a breath of scale. Tap for fullscreen.
 */
function MattjinnPageInner() {
  const { shots, ratio } = useLabShots();
  const [at, setAt] = useState<number | null>(null);

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8">
        <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab — matt jinn study</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {shots.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setAt(i)}
              aria-label={`Open frame ${pad(i)}: ${s.alt}`}
              className="block w-full cursor-pointer overflow-hidden rounded-xl bg-white text-left ring-1 ring-[#e0e0e0] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
              style={{ aspectRatio: ratio }}
            >
              <span className="pointer-events-none block h-full w-full">
                <WarpTile src={s.src} alt="" eager={i < 3} />
              </span>
            </button>
          ))}
        </div>
      </div>
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} />}
    </main>
  );
}

export default function MattjinnPage() {
  return (
    <LabSetProvider>
      <MattjinnPageInner />
    </LabSetProvider>
  );
}
