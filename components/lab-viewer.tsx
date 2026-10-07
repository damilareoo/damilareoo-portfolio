"use client";

import { useCallback, useEffect } from "react";

type Shot = { src: string; alt: string };

/**
 * Shared fullscreen viewer for the shots lab. Captionless: blurred stage,
 * counter, arrows, Esc. Throwaway scaffolding for choosing an interaction —
 * not the site's viewer.
 */
export function LabViewer({
  shots,
  at,
  onAt,
  onClose,
  dark,
}: {
  shots: Shot[];
  at: number;
  onAt: (i: number) => void;
  onClose: () => void;
  dark?: boolean;
}) {
  const step = useCallback(
    (dir: 1 | -1) => onAt((at + dir + shots.length) % shots.length),
    [at, onAt, shots.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        step(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, step]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const s = shots[at];
  if (!s) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label={`${s.alt} — ${at + 1} of ${shots.length}`} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className={`absolute inset-0 ${dark ? "bg-black/80" : "bg-[#fafafa]/90 backdrop-blur-md dark:bg-black/80"}`} onClick={onClose} />
      <figure className="relative z-10 mx-4 flex max-h-[86vh] flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={s.src}
          src={s.src}
          alt={s.alt}
          draggable={false}
          className="max-h-[74vh] w-auto max-w-[92vw] rounded-xl object-contain ring-1 ring-[#e0e0e0] drop-shadow-[0_24px_48px_rgba(0,0,0,0.24)] dark:ring-[#2b2b2b]"
        />
        <figcaption className="mt-4 flex items-center gap-3">
          <span className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">
            {String(at + 1).padStart(2, "0")} / {shots.length}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-white/85 p-1 ring-1 ring-[#e5e5e5] backdrop-blur-md dark:bg-[#1e1e1e]/85 dark:ring-white/10">
            <button type="button" onClick={() => step(-1)} aria-label="Previous shot" className="cursor-pointer rounded-full p-2 text-[#424242] hover:text-[#171717] dark:text-[#b8b8b8] dark:hover:text-white">←</button>
            <button type="button" onClick={() => step(1)} aria-label="Next shot" className="cursor-pointer rounded-full p-2 text-[#424242] hover:text-[#171717] dark:text-[#b8b8b8] dark:hover:text-white">→</button>
            <button type="button" onClick={onClose} aria-label="Close viewer" className="cursor-pointer rounded-full p-2 text-[#424242] hover:text-[#171717] dark:text-[#b8b8b8] dark:hover:text-white">×</button>
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
