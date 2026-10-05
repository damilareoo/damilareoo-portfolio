import { useMediaQuery } from "./use-media-query";

/**
 * Every duration and curve on this site.
 *
 * The primary curve is not invented. dejiajetomobi.com transitions its nav
 * pill with `width .42s cubic-bezier(.22,.61,.36,1)`, and that number is
 * borrowed intact rather than eyeballed into something close. Everything else
 * is spaced around it.
 *
 * Seconds here because `motion` takes seconds; the same four are mirrored into
 * CSS as milliseconds in app/globals.css, and lib/motion.test.ts holds the two
 * in agreement. A component that needs a timing reaches for one of these —
 * there is no fifth duration and no second curve.
 */
export const EASE_OUT = [0.22, 0.61, 0.36, 1] as const satisfies readonly [number, number, number, number];
export const EASE_INOUT = [0.65, 0, 0.35, 1] as const satisfies readonly [number, number, number, number];

export const DUR = {
  /** Hover, press, focus. Fast enough to read as feedback rather than motion. */
  micro: 0.18,
  /** The default. Deji's nav figure. */
  base: 0.42,
  /** A staged reveal, where the stagger needs room to be legible. */
  staged: 0.72,
  /** Entrance and the boot screen. The only budget this long. */
  entrance: 1.2,
} as const;

/**
 * The gap between one staged item arriving and the next.
 *
 * Not a member of DUR, because it is not a duration — nothing lasts 60ms here.
 * It is the offset between two things that each last `DUR.staged`, and giving
 * it a name keeps it out of the components: a bare `i * 0.06` in a reveal is a
 * component hand-rolling a timing, which is the one thing the token set exists
 * to stop. Long enough to read as sequence, short enough that the last line is
 * not still arriving after the eye has moved on.
 */
export const STAGGER = 0.06;

/**
 * How long a finished thing rests before it leaves.
 *
 * The boot counter reaches 100 and the screen does not go at once — a beat of
 * stillness is what stops the exit reading as a cut. Named for the same reason
 * STAGGER is: `DUR.entrance * 1000 + 200` buries a timing decision in a
 * component, and the token set exists so that every such decision is visible
 * in one file.
 */
export const HOLD = 0.2;

/**
 * Whether this visitor has asked for less motion.
 *
 * `false` on the server so the prerendered shell matches the common case, and
 * corrected on hydration before anything has had time to animate. Read through
 * matchMedia rather than an effect, like everything else here.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)", false);
}
