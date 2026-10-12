import { describe, expect, it } from "vitest";
import { dotsCaption, nextMole, speedFor } from "@/components/instruments";

/**
 * The dots game's rules: the ramp falls and floors, and a mole is never
 * its own successor. The addiction is the curve — hold it here.
 */
describe("the dots game", () => {
  it("ramps from ~950ms down to a 320ms floor", () => {
    expect(speedFor(0)).toBe(950);
    expect(speedFor(5)).toBeLessThan(950);
    expect(speedFor(100)).toBe(320);
    expect(speedFor(1000)).toBe(320);
  });

  it("never repeats the same mole", () => {
    expect(nextMole(7, 5, () => 0.35)).not.toBe(7);
    const m = nextMole(24, 5, () => 0.999);
    expect(m).toBeGreaterThanOrEqual(0);
    expect(m).toBeLessThan(25);
    expect(m).not.toBe(24);
  });

  it("loads any die the tests bring", () => {
    expect(nextMole(null, 5, () => 0)).toBe(0);
    expect(nextMole(3, 5, () => 0.5)).toBe(12);
  });

  it("captions every state inside a tile's width", () => {
    expect(dotsCaption("idle", 0, 0, false)).toBe("tap to play");
    expect(dotsCaption("idle", 0, 8, false)).toBe("best 8 — play");
    expect(dotsCaption("play", 9, 8, false)).toBe("score 9 · best 9");
    expect(dotsCaption("over", 12, 12, true)).toBe("new best 12 — retry");
    expect(dotsCaption("over", 5, 8, false)).toBe("5 — retry");
    for (const s of [
      dotsCaption("play", 123, 123, false),
      dotsCaption("over", 123, 123, true),
      dotsCaption("idle", 0, 123, false),
    ]) {
      expect(s.length).toBeLessThanOrEqual(23);
    }
  });
});
