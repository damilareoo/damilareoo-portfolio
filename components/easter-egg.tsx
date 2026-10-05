"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DUR, EASE_INOUT, EASE_OUT, useReducedMotion } from "@/lib/motion";
import {
  FILES,
  RANKS,
  SOLUTION,
  SOLUTION_SAN,
  START,
  TRIGGER,
  file,
  isSolution,
  pieceAt,
  queenCanReach,
  rank,
  type Piece,
  type Square,
} from "@/lib/chess";

/**
 * The pieces, as Unicode.
 *
 * U+FE0E (VARIATION SELECTOR-15) is appended to every glyph, and it is not
 * decoration. U+2654–265F sit in a block that several platforms — iOS and
 * Windows among them — will happily resolve through a colour emoji font,
 * which would put two full-colour pieces on a site with no accent hue at all.
 * VS-15 asks for the text presentation explicitly, which is the black-and-
 * white glyph every desktop font ships.
 *
 * No font-family is set on them. Inter carries no chess glyphs, so the
 * browser falls through to whatever system face does — a fallback for
 * characters the site's one typeface does not contain, which is not a second
 * typeface any more than an emoji is.
 */
const GLYPH: Record<string, { char: string; name: string }> = {
  wK: { char: "♔︎", name: "white king" },
  wQ: { char: "♕︎", name: "white queen" },
  bK: { char: "♚︎", name: "black king" },
};

/** Where the white king stands. Read from the position, not retyped. */
const WHITE_KING = START.filter((p) => p.colour === "w" && p.kind === "K").map((p) => p.at)[0];

/** The black king, for marking when it is mated. */
const BLACK_KING = START.filter((p) => p.colour === "b").map((p) => p.at)[0];

type Status = "idle" | "refused" | "impossible" | "mate";

const MESSAGE: Record<Status, string> = {
  idle: "White to move. Mate in one.",
  /* "Not the move" — never "not mate", even though in THIS position nothing
     else mates and the stronger line would now be true. Two reasons it stays.
     It is the honest sentence under either position: the first one shipped
     here admitted a second mate with Qg7, and a board that had been telling
     players it was "not mate" would have been making a false statement about
     chess on a chess player's portfolio. And it does not lecture — a player
     who tried a reasonable move is told what the puzzle wants, not what he
     got wrong. lib/chess.ts carries the full history. */
  refused: "Not the move. The queen goes back.",
  impossible: "A queen cannot go there.",
  mate: `Mate. ${SOLUTION_SAN}`,
};

/**
 * A chess puzzle, hidden behind the most played first move in chess.
 *
 * **Trigger.** `e4`, typed anywhere that is not a text field. The guard is the
 * point: a visitor typing an email address into a form is not summoning a
 * chessboard, so inputs, textareas, selects and anything `contentEditable`
 * are skipped, and a keystroke held with ctrl, cmd or alt is not typing at
 * all — cmd+E then ctrl+4 must not open this. The buffer is only ever two
 * characters long and resets whenever it is fed a key it does not want.
 *
 * **It is not a chess engine.** One position, one scripted answer, and the
 * only legality it knows is the queen's own geometry (`queenCanReach`) so a
 * piece cannot be put where a queen could never go. Everything else the
 * board needs is in lib/chess.ts, which has no DOM in it.
 *
 * **Reduced motion.** The overlay's entrance and the shake are both `motion`
 * animations, which the globals.css block cannot reach, so they are gated
 * here. A refused move under reduced motion is an instant state — the square
 * marks itself, the line below the board says so — rather than the same shake
 * played faster.
 *
 * **The wrapper outlives the board.** `AnimatePresence` holds a removed child
 * in the tree long enough for its exit to play, so the component never
 * returns null: the outer div is always rendered and carries `aria-hidden`
 * while the board is absent. Returning null on close would unmount the
 * wrapper in the same commit as its child and the exit would never run.
 */
export function EasterEgg() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [queenAt, setQueenAt] = useState<Square>(SOLUTION.from);
  const [selected, setSelected] = useState<Square | null>(null);
  const [cursor, setCursor] = useState<Square>(SOLUTION.from);
  const [status, setStatus] = useState<Status>("idle");
  const [refusedAt, setRefusedAt] = useState<Square | null>(null);
  const [shakes, setShakes] = useState(0);

  const dialog = useRef<HTMLDivElement>(null);
  const squares = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const typed: string[] = [];

    function onKeyDown(event: KeyboardEvent) {
      /* A held modifier means this is a shortcut, not typing. cmd+E followed
         by ctrl+4 is two commands that happen to spell the move. */
      if (event.ctrlKey || event.metaKey || event.altKey) {
        typed.length = 0;
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target?.isContentEditable ||
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT"
      ) {
        typed.length = 0;
        return;
      }

      // Tab, Escape, the arrows: named keys are not characters and leave the
      // buffer alone rather than clearing a half-typed move.
      if (event.key.length !== 1) return;

      typed.push(event.key.toLowerCase());
      if (typed.length > TRIGGER.length) typed.splice(0, typed.length - TRIGGER.length);
      if (typed.join("") === TRIGGER) {
        typed.length = 0;
        setOpen(true);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Focus moves into the board when it opens. A DOM call, not a state write.
  useEffect(() => {
    if (open) dialog.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    setQueenAt(SOLUTION.from);
    setSelected(null);
    setCursor(SOLUTION.from);
    setStatus("idle");
    setRefusedAt(null);
  }

  function choose(square: Square) {
    setCursor(square);
    if (status === "mate") return;

    if (square === queenAt) {
      setSelected(selected === queenAt ? null : queenAt);
      setRefusedAt(null);
      setStatus("idle");
      return;
    }

    // Nothing in hand: a click on an empty square is not a move.
    if (selected !== queenAt) return;

    setSelected(null);
    setRefusedAt(null);

    if (isSolution(queenAt, square)) {
      setQueenAt(square);
      setStatus("mate");
      return;
    }

    /* Refused. The queen is not moved at all — it returns because it never
       left — and the square it was aimed at is marked, which is the whole of
       the rejection under reduced motion. */
    setRefusedAt(square);
    setStatus(queenCanReach(queenAt, square) && square !== WHITE_KING ? "refused" : "impossible");
    setShakes((n) => n + 1);
  }

  function onDialogKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      close();
      return;
    }

    const step: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, 1],
      ArrowDown: [0, -1],
    };
    const move = step[event.key];
    if (!move) return;

    event.preventDefault();
    const f = Math.min(8, Math.max(1, file(cursor) + move[0]));
    const r = Math.min(8, Math.max(1, rank(cursor) + move[1]));
    const next = `${FILES[f - 1]}${r}`;
    setCursor(next);
    squares.current[next]?.focus();
  }

  const pieces: Piece[] = START.map((p) =>
    p.colour === "w" && p.kind === "Q" ? { ...p, at: queenAt } : p,
  );

  return (
    <div aria-hidden={open ? undefined : true} data-easter-egg="">
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(0_0_0/0.5)] p-6"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : DUR.base, ease: EASE_OUT }}
            onClick={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <div
              ref={dialog}
              role="dialog"
              aria-modal="true"
              aria-label="Chess puzzle. White to move, mate in one."
              tabIndex={-1}
              onKeyDown={onDialogKeyDown}
              className="bg-bg border-border w-full max-w-[420px] rounded-lg border p-6 outline-none"
            >
              <p className="label">Mate in one</p>

              <div
                className="mt-4 grid gap-0"
                style={{ gridTemplateColumns: "1.25rem repeat(8, 1fr)" }}
              >
                {RANKS.map((r) => (
                  <Fragment key={r}>
                    <span className="label flex items-center justify-center" aria-hidden="true">
                      {r}
                    </span>
                    {FILES.map((f) => {
                      const square = `${f}${r}`;
                      const piece = pieceAt(pieces, square);
                      const glyph = piece ? GLYPH[`${piece.colour}${piece.kind}`] : undefined;
                      const dark = (file(square) + rank(square)) % 2 === 0;
                      const mated = status === "mate" && square === BLACK_KING;
                      return (
                        <button
                          key={square}
                          type="button"
                          ref={(node) => {
                            squares.current[square] = node;
                          }}
                          tabIndex={cursor === square ? 0 : -1}
                          aria-label={glyph ? `${square}, ${glyph.name}` : square}
                          aria-pressed={square === queenAt ? selected === queenAt : undefined}
                          data-square={square}
                          data-refused={refusedAt === square ? "" : undefined}
                          data-mated={mated ? "" : undefined}
                          onClick={() => choose(square)}
                          className={`relative flex aspect-square items-center justify-center text-[length:var(--text-lg)] leading-none ${
                            dark ? "bg-surface-2" : "bg-surface"
                          } ${selected === square ? "ring-text-1 ring-2 ring-inset" : ""} ${
                            refusedAt === square ? "ring-text-3 ring-2 ring-inset" : ""
                          } ${mated ? "ring-text-1 ring-2 ring-inset" : ""} ${
                            cursor === square ? "z-10 outline-1 -outline-offset-2 outline-[color:var(--text-4)]" : ""
                          }`}
                        >
                          {glyph && (
                            <motion.span
                              /* A new key on each refusal remounts the glyph,
                                 which is what replays the shake — an `animate`
                                 array would be a fresh reference every render
                                 and would replay on renders that are not
                                 rejections. Under reduced motion there is no
                                 shake at all; the marked square and the line
                                 below the board are the whole rejection. */
                              key={`${square}-${shakes}`}
                              className="text-text-1 block"
                              animate={reduced ? { x: 0 } : { x: [0, -4, 4, -3, 3, 0] }}
                              transition={{ duration: reduced ? 0 : DUR.base, ease: EASE_INOUT }}
                            >
                              {glyph.char}
                            </motion.span>
                          )}
                        </button>
                      );
                    })}
                  </Fragment>
                ))}

                <span aria-hidden="true" />
                {FILES.map((f) => (
                  <span key={f} className="label flex justify-center pt-1" aria-hidden="true">
                    {f}
                  </span>
                ))}
              </div>

              <p
                aria-live="polite"
                data-status={status}
                className="text-text-2 mt-4 text-[length:var(--text-sm)]"
              >
                {MESSAGE[status]}
              </p>
              <p className="text-text-3 mt-1 text-[length:var(--text-xs)]">
                Arrow keys to move about the board, Esc to close.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
