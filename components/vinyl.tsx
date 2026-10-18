"use client";

import { useState } from "react";

import { webp } from "./pic";

/**
 * A word that drops its vinyl. Hover (fine pointers only) pops a sleeve
 * above the word; the disc slides out and spins while you stay. Touch
 * readers get the same popover on tap instead — the word wears a dotted
 * underline where there is no hover, so the invitation is visible, and a
 * tap toggles it open. Desktop hover is untouched pure CSS.
 */
export function Vinyl({ word, cover, sheen }: { word: string; cover: string; sheen: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="group/vinyl relative inline-block" data-open={open || undefined}>
      <button
        type="button"
        onClick={() => {
          if (window.matchMedia("(hover: none)").matches) setOpen((o) => !o);
        }}
        aria-expanded={open}
        aria-label={`${word} — tap to preview`}
        className={`link-sheen peek-word ${sheen} cursor-pointer`}
      >
        {word}
      </button>
      <span aria-hidden className="vinyl-pop">
        <span className="vinyl-sleeve" style={{ backgroundImage: `url(${webp(cover)})` }} />
        <span className="vinyl-disc" style={{ backgroundImage: `url(${webp(cover)})` }} />
      </span>
    </span>
  );
}

/**
 * A word that badges its club. Same hover popover choreography as vinyl,
 * but the crest sits still on a white card — no disc, no spin. Chelsea
 * for football. Same tap-to-open contract on touch.
 */
export function Badge({ word, cover }: { word: string; cover: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="group/vinyl relative inline-block" data-open={open || undefined}>
      <button
        type="button"
        onClick={() => {
          if (window.matchMedia("(hover: none)").matches) setOpen((o) => !o);
        }}
        aria-expanded={open}
        aria-label={`${word} — tap to preview`}
        className="link-sheen peek-word sheen-chelsea cursor-pointer"
      >
        {word}
      </button>
      <span aria-hidden className="vinyl-pop">
        <span className="badge-crest" style={{ backgroundImage: `url(${webp(cover)})` }} />
      </span>
    </span>
  );
}
