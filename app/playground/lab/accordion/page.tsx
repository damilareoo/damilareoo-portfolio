"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LabSetProvider, useLabShots } from "@/components/lab-set";
import { LabViewer } from "@/components/lab-viewer";

const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lab 05 — expanding accordion.
 * A scrubable filmstrip: collapsed slices bloom open under the cursor.
 * Tap expands on touch; tapping the open frame goes fullscreen.
 */
function AccordionPageInner() {
  const { shots } = useLabShots();
  const [at, setAt] = useState(0);
  const [open, setOpen] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  const go = useCallback((i: number) => {
    setAt(((i % shots.length) + shots.length) % shots.length);
  }, []);

  /* keep the active panel in view */
  useEffect(() => {
    stripRef.current
      ?.querySelector(`[data-i="${at}"]`)
      ?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [at]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        go(at + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        go(at - 1);
      } else if (e.key === "Enter") {
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [at, go, open]);

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <p className="px-5 pt-6 font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">lab 05 — expanding accordion</p>
      <div className="flex min-h-0 flex-1 items-center">
        <div ref={stripRef} className="flex h-[72vh] w-full items-stretch gap-2 overflow-x-auto px-5 pb-2">
          {shots.map((s, i) => {
            const live = i === at;
            return (
              <button
                key={s.src}
                type="button"
                data-i={i}
                onMouseEnter={() => go(i)}
                onFocus={() => go(i)}
                onClick={() => (live ? setOpen(true) : go(i))}
                aria-label={live ? `Open frame ${pad(i)} fullscreen` : `Expand frame ${pad(i)}: ${s.alt}`}
                aria-expanded={live}
                className="relative h-full flex-none cursor-pointer overflow-hidden rounded-xl bg-white ring-1 ring-[#e0e0e0] transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]"
                style={{ width: live ? "min(72vw, 880px)" : 56 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.src}
                  alt={live ? s.alt : ""}
                  aria-hidden={!live}
                  loading={i < 4 ? undefined : "lazy"}
                  draggable={false}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${live ? "opacity-100" : "opacity-70"}`}
                />
                <span
                  aria-hidden
                  className={`absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[11px] transition-opacity duration-300 ${live ? "opacity-0" : "opacity-100 text-white drop-shadow"}`}
                >
                  {pad(i)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <p className="pb-6 text-center font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">
        {pad(at)} / {shots.length}
      </p>
      {open && <LabViewer shots={shots} at={at} onAt={go} onClose={() => setOpen(false)} />}
    </main>
  );
}

export default function AccordionPage() {
  return (
    <LabSetProvider>
      <AccordionPageInner />
    </LabSetProvider>
  );
}
