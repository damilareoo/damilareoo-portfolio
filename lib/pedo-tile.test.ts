import { describe, expect, it } from "vitest";
import { PEDO_CANVASES, ROUTE_PTS, RUN_BASE_KM, RUN_PACE, TILE_GLYPHS, canvasForDay, fmtSteps, inkFloor, kcalForKm, runTimeForKm } from "@/components/instruments";

/**
 * The pedometer tile's rotation: five sampled share canvases, one a day,
 * and a closed dotted trace. The poster sets the palette — hold it here.
 */
describe("the pedometer tile", () => {
  it("wears the five share canvases, all distinct and legible", () => {
    expect(PEDO_CANVASES.map((c) => c.name)).toEqual(["onyx", "bone", "signal", "volt", "dusk"]);
    for (const c of PEDO_CANVASES) {
      expect(c.bg).toMatch(/^#[0-9a-f]{6}$/);
      expect(c.ink).toMatch(/^#[0-9a-f]{6}$/);
      expect(c.ink).not.toBe(c.bg);
    }
  });

  it("rotates one canvas per day, forever", () => {
    expect(canvasForDay(0).name).toBe("onyx");
    expect(canvasForDay(4).name).toBe("dusk");
    expect(canvasForDay(5).name).toBe("onyx");
    expect(canvasForDay(-1).name).toBe("dusk");
  });

  it("fits step counts inside the glyph set", () => {
    expect(fmtSteps(0)).toBe("0");
    expect(fmtSteps(8432)).toBe("8432");
    expect(fmtSteps(9999)).toBe("9999");
    expect(fmtSteps(12345)).toBe("12k");
    expect(fmtSteps(-5)).toBe("0");
  });

  it("traces the concept's own shared path", () => {
    expect(ROUTE_PTS.length).toBeGreaterThan(60);
    for (const [nx, ny] of ROUTE_PTS) {
      expect(nx).toBeGreaterThanOrEqual(0);
      expect(nx).toBeLessThanOrEqual(1);
      expect(ny).toBeGreaterThanOrEqual(0);
      expect(ny).toBeLessThanOrEqual(1);
    }
    // starts at the path's real start, ends near the privacy point
    expect(ROUTE_PTS[0][0]).toBeCloseTo(44 / 360, 3);
    expect(ROUTE_PTS[0][1]).toBeCloseTo(200 / 250, 3);
    const last = ROUTE_PTS[ROUTE_PTS.length - 1];
    expect(Math.hypot(last[0] - 96 / 360, last[1] - 200 / 250)).toBeLessThan(0.05);
  });
});

/**
 * The tile's figures scale off the curated sample (32:14 over 5.2 km,
 * 268 kcal) so time and energy always reconcile with the live distance.
 */
describe("the run widget figures", () => {
  it("holds the sample anchors at 5.2 km", () => {
    expect(RUN_BASE_KM).toBe(5.2);
    expect(RUN_PACE).toBe("6'12''");
    expect(runTimeForKm(5.2)).toBe("32:14");
    expect(kcalForKm(5.2)).toBe(268);
  });

  it("scales with the live distance — the poster exports agree", () => {
    expect(runTimeForKm((5.2 * 2134) / 1934)).toBe("35:34");
    expect(kcalForKm((5.2 * 2134) / 1934)).toBe(296);
    expect(runTimeForKm((5.2 * 1234) / 1934)).toBe("20:34");
    expect(kcalForKm((5.2 * 1234) / 1934)).toBe(171);
  });

  it("rests at zeros, never negatives", () => {
    expect(runTimeForKm(0)).toBe("0:00");
    expect(kcalForKm(0)).toBe(0);
    expect(runTimeForKm(-5)).toBe("0:00");
    expect(kcalForKm(-5)).toBe(0);
  });

  it("knows every numeral the distance needs", () => {
    for (const ch of "0123456789.") {
      expect(TILE_GLYPHS[ch]).toHaveLength(7);
      for (const row of TILE_GLYPHS[ch]) expect(row).toMatch(/^[01]{5}$/);
    }
  });
});

describe("the unlit floor", () => {
  it("matches the poster exports at 0.08", () => {
    expect(inkFloor("#ffffff", 0.08)).toBe("rgba(255,255,255,0.08)");
    expect(inkFloor("#0a0a0a", 0.08)).toBe("rgba(10,10,10,0.08)");
  });
});
