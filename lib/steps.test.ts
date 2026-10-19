import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ADHOC_BUCKET,
  dayKey,
  normalizeReading,
  parseDayEntry,
  readSummary,
  saveDay,
  stepsToKm,
  sumBuckets,
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

/** A relay interval, spelled the way HC Webhook spells one. */
const interval = (count: number, start: string, end: string) => ({
  count,
  start_time: start,
  end_time: end,
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
    expect(stepsToKm(6719)).toBeCloseTo(5.04, 2);
  });
});

describe("normalizeReading", () => {
  it("takes steps under several keys", () => {
    const now = new Date("2026-10-05T12:00:00Z");
    expect(normalizeReading({ steps: 1000 }, now)).toEqual({
      days: { "2026-10-05": { [ADHOC_BUCKET]: 1000 } },
    });
    expect(normalizeReading({ step_count: "2,500" }, now)).toEqual({
      days: { "2026-10-05": { [ADHOC_BUCKET]: 2500 } },
    });
    expect(normalizeReading({ value: 42 }, now)).toEqual({
      days: { "2026-10-05": { [ADHOC_BUCKET]: 42 } },
    });
  });

  it("takes kilometres directly", () => {
    const now = new Date("2026-10-05T12:00:00Z");
    const r = normalizeReading({ km: 5.12 }, now);
    expect(sumBuckets(r?.days["2026-10-05"])).toBe(6827);
  });

  it("lets an explicit date beat the clock", () => {
    // A macro firing just after midnight Lagos must be able to land the
    // previous day's total rather than the new day's.
    const r = normalizeReading({ date: "2026-10-04", steps: 8000 });
    expect(sumBuckets(r?.days["2026-10-04"])).toBe(8000);
    expect(r?.days["2026-10-05"]).toBeUndefined();
  });

  it("sums a relay's step intervals onto the day they started in", () => {
    const r = normalizeReading({
      timestamp: "2026-10-05T18:00:00Z",
      app_version: "1.9.0",
      timezone: "UTC",
      steps: [
        interval(600, "2026-10-05T08:00:00Z", "2026-10-05T12:00:00Z"),
        interval(450, "2026-10-05T12:00:00Z", "2026-10-05T18:00:00Z"),
      ],
    });
    expect(sumBuckets(r?.days["2026-10-05"])).toBe(1050);
    expect(Object.keys(r?.days["2026-10-05"] ?? {})).toHaveLength(2);
  });

  it("splits a rolling 48-hour window across two Lagos days", () => {
    const r = normalizeReading({
      timestamp: "2026-10-06T12:00:00Z",
      steps: [
        interval(1200, "2026-10-05T00:00:00Z", "2026-10-06T00:00:00Z"),
        interval(800, "2026-10-06T00:00:00Z", "2026-10-07T00:00:00Z"),
      ],
    });
    expect(sumBuckets(r?.days["2026-10-05"])).toBe(1200);
    expect(sumBuckets(r?.days["2026-10-06"])).toBe(800);
  });

  it("keys intervals by their own bounds, so a resend replaces rather than adds", () => {
    const r1 = normalizeReading({ steps: [interval(500, "2026-10-05T08:00:00Z", "2026-10-05T09:00:00Z")] });
    const r2 = normalizeReading({ steps: [interval(500, "2026-10-05T08:00:00Z", "2026-10-05T09:00:00Z")] });
    const r3 = normalizeReading({ steps: [interval(520, "2026-10-05T08:00:00Z", "2026-10-05T09:00:00Z")] });
    expect(r1?.days["2026-10-05"]).toEqual(r2?.days["2026-10-05"]);
    expect(Object.keys(r3?.days["2026-10-05"] ?? {})).toHaveLength(1);
  });

  it("rejects emptiness", () => {
    expect(normalizeReading(null)).toBeNull();
    expect(normalizeReading({})).toBeNull();
    expect(normalizeReading({ foo: "bar" })).toBeNull();
  });

  it("rejects a steps array with nothing usable in it", () => {
    expect(normalizeReading({ steps: [] })).toBeNull();
    expect(normalizeReading({ steps: [{ count: 1 }] })).toBeNull();
  });
});

describe("store round-trip", () => {
  it("saves today and reports the trailing average", async () => {
    await saveDay({
      "2026-10-03": { [ADHOC_BUCKET]: 5000 },
      "2026-10-04": { [ADHOC_BUCKET]: 7000 },
      "2026-10-05": { [ADHOC_BUCKET]: 9000 },
    });
    const s = await readSummary(new Date("2026-10-05T12:00:00Z"));
    expect(s.configured).toBe(true);
    expect(s.date).toBe("2026-10-05");
    expect(s.steps).toBe(9000);
    expect(s.km).toBeCloseTo(6.75, 2);
    expect(s.averageKm).toBeCloseTo(5.25, 2);
  });

  it("reports unconfigured when empty", async () => {
    expect(await readSummary()).toEqual({ configured: false });
  });

  it("accumulates successive incremental payloads into a day total", async () => {
    const first = await saveDay(normalizeReading({ steps: [interval(600, "2026-10-05T08:00:00Z", "2026-10-05T09:00:00Z")] })!.days);
    expect(first.totals["2026-10-05"]).toBe(600);
    const second = await saveDay(normalizeReading({ steps: [interval(450, "2026-10-05T09:00:00Z", "2026-10-05T10:00:00Z")] })!.days);
    // The reported total is the day after merging, not this payload's
    // increment — a relay shows this number in its delivery log.
    expect(second.totals["2026-10-05"]).toBe(1050);
    const s = await readSummary(new Date("2026-10-05T12:00:00Z"));
    expect(s.steps).toBe(1050);
  });

  it("reports both days when one payload spans two", async () => {
    const { totals } = await saveDay(
      normalizeReading({
        steps: [
          interval(1200, "2026-10-05T00:00:00Z", "2026-10-06T00:00:00Z"),
          interval(800, "2026-10-06T00:00:00Z", "2026-10-07T00:00:00Z"),
        ],
      })!.days,
    );
    expect(totals).toEqual({ "2026-10-05": 1200, "2026-10-06": 800 });
  });

  it("does not double-count a resent interval", async () => {
    const payload = { steps: [interval(600, "2026-10-05T08:00:00Z", "2026-10-05T09:00:00Z")] };
    await saveDay(normalizeReading(payload)!.days);
    await saveDay(normalizeReading(payload)!.days);
    await saveDay(normalizeReading(payload)!.days);
    const s = await readSummary(new Date("2026-10-05T12:00:00Z"));
    expect(s.steps).toBe(600);
  });

  it("applies an edited interval in place of the one it replaces", async () => {
    await saveDay(normalizeReading({ steps: [interval(600, "2026-10-05T08:00:00Z", "2026-10-05T09:00:00Z")] })!.days);
    await saveDay(normalizeReading({ steps: [interval(520, "2026-10-05T08:00:00Z", "2026-10-05T09:00:00Z")] })!.days);
    const s = await readSummary(new Date("2026-10-05T12:00:00Z"));
    expect(s.steps).toBe(520);
  });

  it("lets a whole-day total replace accumulated intervals outright", async () => {
    await saveDay(normalizeReading({ steps: [interval(600, "2026-10-05T08:00:00Z", "2026-10-05T09:00:00Z")] })!.days);
    // A bare total cannot be decomposed into intervals, so adding it to the
    // 600 already stored would count the day twice.
    await saveDay(normalizeReading({ date: "2026-10-05", steps: 9000 })!.days);
    const s = await readSummary(new Date("2026-10-05T12:00:00Z"));
    expect(s.steps).toBe(9000);
  });
});

describe("parseDayEntry", () => {
  it("reads file-backend strings", () => {
    expect(parseDayEntry('{"steps":6933,"updatedAt":"2026-10-12T00:00:00.000Z"}')).toEqual({
      steps: 6933,
      updatedAt: "2026-10-12T00:00:00.000Z",
    });
  });

  it("reads KV auto-parsed objects — the feed must survive the client", () => {
    expect(parseDayEntry({ steps: 6933, updatedAt: "2026-10-12T00:00:00.000Z" })).toEqual({
      steps: 6933,
      updatedAt: "2026-10-12T00:00:00.000Z",
    });
  });

  it("carries intervals through, so accumulation survives a round trip", () => {
    const stored = JSON.stringify({
      steps: 1050,
      updatedAt: "2026-10-05T18:00:00.000Z",
      buckets: { "2026-10-05T08:00:00Z|2026-10-05T09:00:00Z": 600, "2026-10-05T09:00:00Z|2026-10-05T10:00:00Z": 450 },
    });
    const e = parseDayEntry(stored);
    expect(sumBuckets(e?.buckets)).toBe(1050);
  });

  it("drops intervals that are not counts rather than throwing", () => {
    const e = parseDayEntry({ steps: 100, updatedAt: "x", buckets: { good: 100, bad: "many" } });
    expect(e?.buckets).toEqual({ good: 100 });
  });

  it("rejects garbage without throwing", () => {
    expect(parseDayEntry("[object Object]")).toBeNull();
    expect(parseDayEntry(null)).toBeNull();
    expect(parseDayEntry({ steps: "many" })).toBeNull();
  });
});