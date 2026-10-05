import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  dayKey,
  normalizeReading,
  readSummary,
  saveDay,
  stepsToKm,
} from "./steps";

const OLD_ENV = { ...process.env };

beforeEach(() => {
  process.env.STEPS_FILE = join(mkdtempSync(join(tmpdir(), "steps-")), "steps.json");
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  delete process.env.STEPS_STRIDE_M;
});

afterEach(() => {
  process.env = { ...OLD_ENV };
});

describe("dayKey", () => {
  it("keys by the Lagos calendar day", () => {
    // 00:30 UTC is 01:30 in Lagos — still the 5th there until 23:00 UTC.
    expect(dayKey(new Date("2026-10-05T00:30:00Z"))).toBe("2026-10-05");
    expect(dayKey(new Date("2026-10-05T23:30:00Z"))).toBe("2026-10-06");
  });
});

describe("stepsToKm", () => {
  it("converts with the default stride", () => {
    expect(stepsToKm(6719)).toBeCloseTo(5.12, 2);
  });
});

describe("normalizeReading", () => {
  it("takes steps under several keys", () => {
    expect(normalizeReading({ steps: 1000 })).toEqual({ steps: 1000 });
    expect(normalizeReading({ step_count: "2,500" })).toEqual({ steps: 2500 });
    expect(normalizeReading({ value: 42 })).toEqual({ steps: 42 });
  });
  it("takes kilometres directly", () => {
    expect(normalizeReading({ km: 5.12 })).toEqual({ steps: 6719 });
  });
  it("rejects emptiness", () => {
    expect(normalizeReading(null)).toBeNull();
    expect(normalizeReading({})).toBeNull();
    expect(normalizeReading({ foo: "bar" })).toBeNull();
  });
});

describe("store round-trip", () => {
  it("saves today and reports the trailing average", async () => {
    await saveDay("2026-10-03", 5000);
    await saveDay("2026-10-04", 7000);
    await saveDay("2026-10-05", 9000);
    const s = await readSummary(new Date("2026-10-05T12:00:00Z"));
    expect(s.configured).toBe(true);
    expect(s.date).toBe("2026-10-05");
    expect(s.steps).toBe(9000);
    expect(s.km).toBeCloseTo(6.86, 2);
    expect(s.averageKm).toBeCloseTo(5.33, 2);
  });
  it("reports unconfigured when empty", async () => {
    expect(await readSummary()).toEqual({ configured: false });
  });
});
