import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The files for the surfaces that cannot use a component.
 *
 * `app/icon.tsx` and `app/apple-icon.tsx` are drawn by `next/og`, which
 * renders a small subset of CSS on the server and cannot run React
 * components, canvas, or `next/image` — so the files are read off disk and
 * inlined here. `app/opengraph-image.tsx` reads the portrait the same way.
 *
 * The tab and home-screen icons are the coin's opening face: his cap,
 * full-bleed. The live tab upgrades to the spinning coin on the client
 * (see `components/coin-favicon.tsx`), so the static icon is frame zero
 * of that loop — one icon everywhere, never two. The share card keeps the
 * portrait; it is a different surface with a different job.
 */
export const PORTRAIT_FILE = "public/portrait/damilare.png";

/** His bottle cap — the coin's opening face, near-square. */
export const CAP_FILE = "public/dossier/cap.png";

/** 800 square, circle-masked. Cropped from his night-out photograph. */
export const PORTRAIT_SIZE = 800;

/**
 * The head, as fractions of the file, measured off the image.
 *
 * A favicon is 32 pixels across. The whole frame scaled into 32 gives the head
 * about fourteen of them and the rest to a wall, a shirt and a framed print —
 * at which size it is a grey smudge, not a person. So the icons take a square
 * window around the head instead: it is the same photograph, cropped to the one
 * part of it that can survive being that small.
 *
 * The window is square so it can be dropped into a square box without the
 * aspect being decided twice.
 */
export const HEAD = { x: 0.1, y: 0.22, size: 0.52 };

/**
 * The file as a data URI.
 *
 * Read once per module instance rather than per request. All three routes that
 * use it are static, so in practice this happens at build time.
 */
export function portraitDataUri(): string {
  const bytes = readFileSync(join(process.cwd(), PORTRAIT_FILE));
  return `data:image/png;base64,${bytes.toString("base64")}`;
}

/** The cap as a data URI — the static icon, frame zero of the tab loop. */
export function capDataUri(): string {
  const bytes = readFileSync(join(process.cwd(), CAP_FILE));
  return `data:image/png;base64,${bytes.toString("base64")}`;
}

/** The cap's natural size, read off its PNG header — no magic numbers. */
export function capSize(): { width: number; height: number } {
  const bytes = readFileSync(join(process.cwd(), CAP_FILE));
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}
