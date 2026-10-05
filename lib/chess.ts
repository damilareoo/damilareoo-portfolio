/**
 * One position, and the one move that solves it.
 *
 * White Ka6, Qa1. Black Ka8. White to move and mate in one, with `Qh8#`.
 *
 * **`Qh8` is the only mate.** That is a different and stronger claim than
 * "`Qh8` is mate", and it is the claim a problem advertised as *mate in one*
 * actually makes. It was established by search rather than by analysis:
 * enumerating every white move in every legal K+Q vs K arrangement and keeping
 * only the positions with exactly one mating move. 1,456 positions qualify;
 * this is one of them. Re-derived here in lib/chess.test.ts, over every legal
 * white move from this position — queen and king — so the claim is checked by
 * something other than the person making it.
 *
 * After `Qh8` the black king has three squares and none of them: a7 and b7 are
 * covered by the white king on a6, b8 by the queen on the eighth rank. The
 * queen cannot be taken — h8 is nowhere near a8's king. Zero escape squares.
 * The a1–h8 diagonal is clear, the kings are not adjacent, and Black is not
 * already in check before White moves.
 *
 * It is also a better key than most: the queen crosses the whole board, corner
 * to corner, along the long diagonal.
 *
 * **Why this is the second position in this file.** The first was White Kg6,
 * Qb2 vs Black Kh8, solved by `Qb8#`. `Qb8` is mate there — that was verified
 * and it was true. But `Qg7` is *also* mate there, which the original check
 * never asked about: it tested "Qb8 is mate" and never "Qb8 is the only mate".
 * The dual was found by re-running the search before writing this file rather
 * than by reading the spec, and the position was replaced rather than the
 * board being taught to refuse a legitimate mate. That history is kept here on
 * purpose — it is the reason this file's standard is *verify*, not *trust*.
 *
 * It is attributed to nobody because it is nobody's study. It was chosen
 * because it is small enough to verify rather than trust, which on a chess
 * person's portfolio is the only acceptable standard.
 *
 * Nothing here knows about the DOM, and nothing here is a chess engine. There
 * is no move generator, no second position, and no legality beyond the queen's
 * own geometry — `queenCanReach` — which is all the board needs to stop a
 * piece being put somewhere a queen could never go. The mate check that proves
 * uniqueness lives in the test file, not here: it is how the claim is
 * verified, not something the site ships.
 */

/** "a1".."h8". */
export type Square = string;

export type Piece = { colour: "w" | "b"; kind: "K" | "Q"; at: Square };

export const START: Piece[] = [
  { colour: "w", kind: "K", at: "a6" },
  { colour: "w", kind: "Q", at: "a1" },
  { colour: "b", kind: "K", at: "a8" },
];

export const SOLUTION: { from: Square; to: Square } = { from: "a1", to: "h8" };

/** How the solution is written in a game score. */
export const SOLUTION_SAN = "Qh8#";

/** The move that opens this, and the most played first move in chess. */
export const TRIGGER = "e4";

export const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
export const RANKS = [8, 7, 6, 5, 4, 3, 2, 1] as const;

/** 1..8 for a..h. */
export function file(s: Square) {
  return s.charCodeAt(0) - 96;
}

/** 1..8. */
export function rank(s: Square) {
  return Number(s[1]);
}

/** Whether a queen could move from one square to another on an empty board. */
export function queenCanReach(from: Square, to: Square): boolean {
  if (from === to) return false;
  const df = file(to) - file(from);
  const dr = rank(to) - rank(from);
  return df === 0 || dr === 0 || Math.abs(df) === Math.abs(dr);
}

export function isSolution(from: Square, to: Square): boolean {
  return from === SOLUTION.from && to === SOLUTION.to;
}

/** The piece standing on a square, if any. */
export function pieceAt(pieces: Piece[], at: Square): Piece | undefined {
  return pieces.find((p) => p.at === at);
}
