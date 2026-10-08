/**
 * Exploration image sets — one per explorations-rail exhibit, each a
 * different set so every vibe reads on its own images.
 *
 * Sourced from public are.na boards (cosmos.so has no public API) via
 * api.are.na, October 2026. These are other people's saved images used
 * as interaction-study material — placeholders for the owner's own
 * frames, credited per set below. Swap a set's files and the exhibit
 * follows with no code change.
 */

export type ExplorationSet = {
  /** Directory under public/dossier/explorations. */
  dir: string;
  /** Display aspect for the exhibit, chosen off the set's majority. */
  ratio: string;
  /** The are.na board each file came from. */
  credit: string;
  shots: { src: string; alt: string }[];
};

const set = (dir: string, ratio: string, credit: string, n = 8): ExplorationSet => ({
  dir,
  ratio,
  credit,
  shots: Array.from({ length: n }, (_, i) => ({
    src: `/dossier/explorations/${dir}/${String(i + 1).padStart(2, "0")}.jpg`,
    alt: `Study ${i + 1} — via are.na`,
  })),
});

export const EXPLORATION_SETS: Record<string, ExplorationSet> = {
  coverflow: set("coverflow", "1 / 1", "are.na — editorial / lookbook"),
  velocity: set("velocity", "16 / 10", "are.na — lookbook"),
  index: set("index", "4 / 5", "are.na — fashion / lookbook"),
  accordion: set("accordion", "3 / 4", "are.na — lookbook"),
  waterfall: set("waterfall", "16 / 10", "are.na — fruteria image archive"),
  rivers: set("rivers", "16 / 10", "are.na — image archive"),
  cover: set("cover", "16 / 10", "are.na — editorial / lookbook"),
  "matt-jinn": set("matt-jinn", "4 / 5", "are.na — fashion / lookbook"),
  compass: set("compass", "16 / 10", "are.na — image archive"),
  progressrail: set("progressrail", "16 / 10", "are.na — fruteria image archive"),
  triangle: set("triangle", "4 / 5", "are.na — fashion / lookbook, lookbook inspiration"),
};

const ALBUMS = [
  { file: "skepta-konnichiwa", label: "Skepta — Konnichiwa" },
  { file: "9ice-tradition", label: "9ice — Tradition" },
  { file: "skepta-ignorance", label: "Skepta — Ignorance Is Bliss" },
  { file: "huncho-huncholini", label: "M Huncho — Huncholini the 1st" },
  { file: "nines-crop-circle", label: "Nines — Crop Circle 3" },
  { file: "wizkid-superstar", label: "Wizkid — Superstar" },
  { file: "burna-outside", label: "Burna Boy — Outside" },
  { file: "jhus-conspiracy", label: "J Hus — Big Conspiracy" },
  { file: "santi-mandy", label: "Santi — Mandy and the Jungle" },
  { file: "metro-capes", label: "Metro Boomin — Not All Heroes Wear Capes" },
  { file: "skepta-blacklisted", label: "Skepta — Blacklisted" },
];

/** Eleven covers in the owner's order, artwork via Deezer + Cover Art Archive. */
export const ALBUM_SET: ExplorationSet = {
  dir: "albums",
  ratio: "1 / 1",
  credit: "cover art — the labels",
  shots: ALBUMS.map((a, i) => ({
    src: `/dossier/explorations/albums/${String(i + 1).padStart(2, "0")}.jpg`,
    alt: `${a.label} — cover`,
  })),
};
