import { describe, expect, it } from "vitest";
import {
  FILES,
  RANKS,
  START,
  SOLUTION,
  SOLUTION_SAN,
  file,
  isSolution,
  pieceAt,
  queenCanReach,
  rank,
  type Square,
} from "./chess";

/* ------------------------------------------------------------------ *
 * A mate checker, and why it is HERE and not in lib/chess.ts.
 *
 * The claim on the board is "mate in one", which means two things — that the
 * solution mates, and that nothing else does. The second cannot be re-derived
 * from lib/chess.ts's exports: `isSolution` is an equality check against a
 * hardcoded pair of squares, so asserting that exactly one move satisfies it
 * would only be asserting that `===` works. It would pass just as happily for
 * a position with three mates.
 *
 * So the check is written out properly, and it lives in the test file. The
 * spec's scope discipline (§9) is that the SITE ships no move generator and no
 * legality engine, and it still does not: none of this is imported by
 * lib/chess.ts or by anything the browser loads. It is the verification, not
 * the product — which is the same reason the position was searched for rather
 * than reasoned about in the first place.
 *
 * Small enough to read in one sitting: three pieces, eight directions, and no
 * concept of any piece that is not a king or a queen.
 * ------------------------------------------------------------------ */

type Point = readonly [number, number];

const DIRS: Point[] = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];

const at = (s: Square): Point => [file(s), rank(s)];
const name = ([f, r]: Point): Square => `${FILES[f - 1]}${r}`;
const same = (a: Point, b: Point) => a[0] === b[0] && a[1] === b[1];
const onBoard = ([f, r]: Point) => f >= 1 && f <= 8 && r >= 1 && r <= 8;
const adjacent = (a: Point, b: Point) =>
  !same(a, b) && Math.abs(a[0] - b[0]) <= 1 && Math.abs(a[1] - b[1]) <= 1;

/** Every square a queen can slide to, stopping ON the first blocker. */
function queenTargets(q: Point, blockers: Point[]): Point[] {
  const out: Point[] = [];
  for (const [df, dr] of DIRS) {
    let s: Point = [q[0] + df, q[1] + dr];
    while (onBoard(s)) {
      out.push(s);
      if (blockers.some((b) => same(b, s))) break;
      s = [s[0] + df, s[1] + dr];
    }
  }
  return out;
}

/**
 * Whether White controls a square.
 *
 * `blockers` deliberately excludes the black king when asking whether one of
 * its flight squares is covered: a king cannot block its own escape by
 * standing in the ray it is trying to run out of. Getting that wrong is how a
 * naive checker invents escape squares and misses a mate.
 */
function whiteControls(wk: Point, wq: Point, target: Point, blockers: Point[]) {
  return adjacent(wk, target) || queenTargets(wq, blockers).some((s) => same(s, target));
}

/** Whether the black king on `bk` is mated by a white king on `wk`, queen on `wq`. */
function isMate(wk: Point, wq: Point, bk: Point) {
  if (!whiteControls(wk, wq, bk, [wk, wq])) return false; // not even check

  for (const [df, dr] of DIRS) {
    const flight: Point = [bk[0] + df, bk[1] + dr];
    if (!onBoard(flight)) continue;
    if (same(flight, wk)) continue; // a king may not be captured
    if (same(flight, wq)) {
      // Taking the queen is legal only if the white king does not defend her.
      if (adjacent(wk, flight)) continue;
      return false;
    }
    if (whiteControls(wk, wq, flight, [wk, wq])) continue;
    return false; // a square to run to
  }
  return true;
}

/** Every legal white move from a K+Q vs K position, in coordinate form. */
function whiteMoves(wk: Point, wq: Point, bk: Point) {
  const moves: { san: string; wk: Point; wq: Point }[] = [];

  for (const t of queenTargets(wq, [wk, bk])) {
    if (same(t, wk)) continue; // may not land on its own king
    if (same(t, bk)) continue; // may not capture a king
    if (adjacent(t, bk) && !adjacent(wk, t)) continue; // would simply hang
    moves.push({ san: `Q${name(t)}`, wk, wq: t });
  }

  for (const [df, dr] of DIRS) {
    const t: Point = [wk[0] + df, wk[1] + dr];
    if (!onBoard(t) || same(t, wq) || adjacent(t, bk)) continue;
    moves.push({ san: `K${name(t)}`, wk: t, wq });
  }

  return moves;
}

const WK = at(START.filter((p) => p.colour === "w" && p.kind === "K")[0].at);
const WQ = at(START.filter((p) => p.colour === "w" && p.kind === "Q")[0].at);
const BK = at(START.filter((p) => p.colour === "b")[0].at);

describe("the position", () => {
  it("is three pieces and nothing else", () => {
    expect(START).toHaveLength(3);
    expect(START.map((p) => `${p.colour}${p.kind}${p.at}`).sort()).toEqual([
      "bKa8",
      "wKa6",
      "wQa1",
    ]);
  });

  it("is legal: the two kings are not adjacent", () => {
    expect(adjacent(WK, BK)).toBe(false);
  });

  it("is a puzzle, not a position already won: Black is not yet in check", () => {
    expect(whiteControls(WK, WQ, BK, [WK, WQ])).toBe(false);
  });

  it("leaves the queen a clear run down the long diagonal", () => {
    expect(queenTargets(WQ, [WK, BK]).map(name)).toContain(SOLUTION.to);
  });

  it("writes the solution the way a game score would", () => {
    expect(SOLUTION_SAN).toBe("Qh8#");
  });

  it("names every file and rank exactly once", () => {
    expect([...FILES]).toEqual(["a", "b", "c", "d", "e", "f", "g", "h"]);
    expect([...RANKS]).toEqual([8, 7, 6, 5, 4, 3, 2, 1]);
  });
});

describe("the solution", () => {
  it("mates", () => {
    expect(isMate(WK, at(SOLUTION.to), BK)).toBe(true);
  });

  it("leaves the black king no square: a7 and b7 to the king, b8 to the queen", () => {
    const queen = at(SOLUTION.to);
    for (const flight of ["a7", "b7", "b8"] as Square[]) {
      expect(whiteControls(WK, queen, at(flight), [WK, queen]), flight).toBe(true);
    }
  });

  /* THE assertion this file exists for. "Mate in one" claims that nothing else
     mates, and that claim is checked here over every legal white move in the
     position — sixty-odd queen moves and every king step — rather than taken
     on trust. It is what the previous position (Kg6/Qb2, where Qg7 mates as
     well as Qb8) would have failed, and it is what any future substitution
     with a dual will fail. */
  it("is the ONLY mate — checked over every legal white move, not just the queen's", () => {
    const mating = whiteMoves(WK, WQ, BK)
      .filter((m) => isMate(m.wk, m.wq, BK))
      .map((m) => m.san);

    expect(mating).toEqual([`Q${SOLUTION.to}`]);
  });

  it("would have caught the dual in the position this one replaced", () => {
    // White Kg6, Qb2 vs Black Kh8: Qb8 mates, and so does Qg7.
    const oldWK = at("g6");
    const oldWQ = at("b2");
    const oldBK = at("h8");
    const mating = whiteMoves(oldWK, oldWQ, oldBK)
      .filter((m) => isMate(m.wk, m.wq, oldBK))
      .map((m) => m.san)
      .sort();

    expect(mating).toEqual(["Qb8", "Qg7"]);
    expect(mating).toHaveLength(2);
  });
});

describe("queenCanReach", () => {
  it("accepts a move along a rank", () => {
    expect(queenCanReach("a1", "h1")).toBe(true);
  });

  it("accepts a move along a file", () => {
    expect(queenCanReach("a1", "a4")).toBe(true);
  });

  it("accepts a move along a diagonal", () => {
    expect(queenCanReach("a1", "h8")).toBe(true);
  });

  it("rejects a knight's move", () => {
    expect(queenCanReach("a1", "b3")).toBe(false);
    expect(queenCanReach("a1", "c2")).toBe(false);
  });

  it("rejects standing still", () => {
    expect(queenCanReach("a1", "a1")).toBe(false);
  });
});

describe("isSolution", () => {
  it("accepts only a1 to h8", () => {
    expect(isSolution("a1", "h8")).toBe(true);
  });

  it("rejects every other destination from a1", () => {
    for (const to of ["a4", "h1", "g7", "b2", "d4", "a2", "b1"]) {
      expect(isSolution("a1", to), `a1-${to}`).toBe(false);
    }
  });

  it("rejects the right destination from the wrong square", () => {
    expect(isSolution("b2", "h8")).toBe(false);
  });
});

describe("file, rank and pieceAt", () => {
  it("reads a square's coordinates", () => {
    expect([file("a1"), rank("a1")]).toEqual([1, 1]);
    expect([file("h8"), rank("h8")]).toEqual([8, 8]);
  });

  it("finds the piece standing on a square, and nothing on an empty one", () => {
    expect(pieceAt(START, "a1")).toMatchObject({ colour: "w", kind: "Q" });
    expect(pieceAt(START, "e4")).toBeUndefined();
  });
});
