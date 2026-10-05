import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { DUR, EASE_OUT, EASE_INOUT, HOLD, STAGGER } from "./motion";

const css = readFileSync("app/globals.css", "utf8");

/**
 * What is left of the v2 motion token set, and why it is still here.
 *
 * The design language switch took the stylesheet these tokens used to be
 * mirrored into. The old `app/globals.css` declared `--ease-out`, `--ease-inout`
 * and four `--dur-*` custom properties so a CSS transition and a `motion`
 * animation could be given the same figure; the source repository's stylesheet
 * declares none of them and animates arrivals with its own `.arrive` and
 * `.tl-track` rules instead. Every assertion about that mirror has gone with
 * it, rather than being loosened until it passed.
 *
 * The tokens themselves stay because `components/easter-egg.tsx` still reads
 * four of them, and the easter egg belongs to neither design language — it is
 * Kenny's, it was asked for by name, and its board is simply re-drawn in the
 * new colours. One consumer is enough to keep a token set; it is not enough to
 * keep assertions about a stylesheet that no longer exists.
 */
describe("the motion token set", () => {
  it("holds the primary curve and its duration exactly", () => {
    expect(EASE_OUT).toEqual([0.22, 0.61, 0.36, 1]);
    expect(DUR.base).toBe(0.42);
  });

  it("holds EASE_INOUT for symmetric moves", () => {
    expect(EASE_INOUT).toEqual([0.65, 0, 0.35, 1]);
  });

  it("offers exactly four durations", () => {
    expect(Object.keys(DUR).sort()).toEqual(["base", "entrance", "micro", "staged"]);
  });

  it("exports STAGGER as a separate, non-DUR timing for staged offsets", () => {
    expect(typeof STAGGER).toBe("number");
    expect(Object.keys(DUR)).not.toContain("stagger");
  });

  it("exports HOLD as a separate, non-DUR rest beat", () => {
    expect(typeof HOLD).toBe("number");
    expect(Object.keys(DUR)).not.toContain("hold");
  });

  it("is read by the one surface that still animates in JS", () => {
    /* The set had ten consumers and has one. If the easter egg ever stops
       reading these, `lib/motion.ts` is dead and should be deleted rather than
       kept as furniture — this assertion is what makes that visible. */
    const egg = readFileSync("components/easter-egg.tsx", "utf8");
    for (const token of ["DUR", "EASE_OUT", "EASE_INOUT", "useReducedMotion"]) {
      expect(egg, token).toContain(token);
    }
  });
});

describe("the stylesheet's own reduced-motion guard", () => {
  it("collapses to the final frame under reduced motion, not to a faster one", () => {
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);

    const global = css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\*,[\s\S]*?\n\}/);
    expect(global, "no global reduced-motion block found").not.toBeNull();
    expect(global![0]).toMatch(/animation-duration:\s*0\.01ms/);
    expect(global![0]).toMatch(/transition-duration:\s*0\.01ms/);
  });

  it("reaches the one delay the blanket rule cannot", () => {
    /* The timeline's line is drawn with a transition DELAY taken from the
       dates, and zeroing durations alone would leave a late segment sitting
       empty for most of a second before snapping in. See `.tl-track` in
       app/globals.css. */
    expect(css).toMatch(/\.tl-track \{\s*transition-delay: 0ms !important;\s*\}/);
  });

  it("guards both arrival mechanisms on scripting, so a page with no JS still renders", () => {
    // `.arrive` starts at opacity 0 and `.tl-track` at a full dash offset;
    // nothing sets `data-arrived` or `data-drawn` without JS, so both starting
    // states must be withheld when scripting is off or the page ships blank.
    const guarded = [...css.matchAll(/@media \(scripting: enabled\)\s*\{/g)];
    expect(guarded.length).toBe(2);
  });
});
