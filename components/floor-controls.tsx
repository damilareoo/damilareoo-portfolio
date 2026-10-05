"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { setSoundOn, soundOn } from "./sound";

function IconButton({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      aria-label={label}
      data-tone="tap"
      className="grid min-h-11 min-w-11 cursor-pointer place-items-center text-[#767676] transition-colors hover:text-[#171717] dark:text-[#8a8a8a] dark:hover:text-white"
    >
      {children}
    </button>
  );
}

/** The theme toggle alone — lives in the nav and the way-back,
    not the footer. Mount-gated like the floor cluster. */
export function ThemeButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const [on, setOn] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!on) {
    return <span aria-hidden className="block min-h-11 min-w-11" />;
  }

  const dark = resolvedTheme === "dark";

  return (
    <IconButton
      label={dark ? "Switch to light mode" : "Switch to dark mode"}
      pressed={dark}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
        <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 1.8 A6.2 6.2 0 0 1 8 14.2 Z" fill="currentColor" />
      </svg>
    </IconButton>
  );
}

/** Footer floor control: the speaker alone. Theme lives up top. */
export function FloorControls() {
  const [on, setOn] = useState<boolean | null>(null);
  const [quiet, setQuiet] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setOn(true);
      setQuiet(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const [muted, setMuted] = useState(
    () => typeof window !== "undefined" && !soundOn(),
  );

  if (!on) {
    return <span aria-hidden className="flex min-h-11 items-center gap-1" />;
  }

  return (
    <span className="flex items-center gap-1">
      <IconButton
        label={muted ? "Unmute interface sounds" : "Mute interface sounds"}
        pressed={!muted}
        onClick={() => {
          const next = !muted;
          setMuted(next);
          setSoundOn(!next);
        }}
      >
        {muted || quiet ? (
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 6v4h2.5L8 13.5v-11L4.5 6H2Z" fill="currentColor" stroke="none" />
            <line x1="10.5" x2="14.5" y1="6.5" y2="10.5" />
            <line x1="14.5" x2="10.5" y1="6.5" y2="10.5" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 6v4h2.5L8 13.5v-11L4.5 6H2Z" fill="currentColor" stroke="none" />
            <path d="M10.5 6.2a3.4 3.4 0 0 1 0 3.6" />
            <path d="M12.3 4.4a5.8 5.8 0 0 1 0 7.2" />
          </svg>
        )}
      </IconButton>
    </span>
  );
}
