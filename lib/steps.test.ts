import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  absorbOverlaps,
  ADHOC_BUCKET,
  type DayBuckets,
  dayKey,
  forgetDay,
  isPlausibleDay,
  MAX_DAY_STEPS,
  normalizeReading,
  parseDayEntry,
  readDayState,
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
  it("converts with the documented stride", () => {
    // Production runs STEPS_STRIDE_M=0.762; the code default is 0.75.
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
    // STRIDE_M is read at module load, so these assert the documented default
    // (0.75), not the 0.762 production sets via STEPS_STRIDE_M.
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

  it("discards a bare total when real intervals arrive for the same day", async () => {
    // A day written as one total has no intervals behind it, so the first
    // relay sync has nothing to add to — and its total is the authority.
    await saveDay(normalizeReading({ date: "2026-10-05", steps: 6933 })!.days);
    await saveDay(normalizeReading({ steps: [interval(1500, "2026-10-05T07:00:00Z", "2026-10-05T09:00:00Z")] })!.days);
    const s = await readSummary(new Date("2026-10-05T12:00:00Z"));
    expect(s.steps).toBe(1500);
  });

  it("refuses to let a bare total destroy a day's intervals", async () => {
    // The relay streams intervals and never resends them, so a coarser total
    // arriving later must not discard the day's only copy of them.
    await saveDay(
      normalizeReading({
        steps: [
          interval(600, "2026-10-05T08:00:00Z", "2026-10-05T09:00:00Z"),
          interval(450, "2026-10-05T09:00:00Z", "2026-10-05T10:00:00Z"),
        ],
      })!.days,
    );
    await saveDay(normalizeReading({ date: "2026-10-05", steps: 1050 })!.days);
    const s = await readSummary(new Date("2026-10-05T12:00:00Z"));
    expect(s.steps).toBe(1050);
  });

  it("does not double-count when a resync re-reads a day at a different granularity", async () => {
    // A background sync sends six-hour chunks...
    await saveDay(
      normalizeReading({
        steps: [
          interval(600, "2026-10-05T06:00:00Z", "2026-10-05T12:00:00Z"),
          interval(450, "2026-10-05T12:00:00Z", "2026-10-05T18:00:00Z"),
        ],
      })!.days,
    );
    expect((await readSummary(new Date("2026-10-05T12:00:00Z"))).steps).toBe(1050);

    // ...and an explicit-range resync reports the same hours as one record.
    // Same steps, different key. Keying on exact bounds counted both.
    await saveDay(
      normalizeReading({
        steps: [interval(1050, "2026-10-05T06:00:00Z", "2026-10-05T18:00:00Z")],
      })!.days,
    );
    const s = await readSummary(new Date("2026-10-05T12:00:00Z"));
    expect(s.steps).toBe(1050);
  });

  it("lets a coarser record supersede the chunks it covers", () => {
    // The wide record is the authority and drops what it contains...
    const wide = absorbOverlaps({ "2026-10-05T06:00:00Z|2026-10-05T18:00:00Z": 1050 });
    expect(sumBuckets(wide)).toBe(1050);
    // ...and the same happens against what is already stored.
    const stored: DayBuckets = {
      "2026-10-05T06:00:00Z|2026-10-05T12:00:00Z": 600,
      "2026-10-05T12:00:00Z|2026-10-05T18:00:00Z": 450,
    };
    const merged = absorbOverlaps({ "2026-10-05T06:00:00Z|2026-10-05T18:00:00Z": 1050 }, stored);
    expect(Object.keys(merged)).toHaveLength(1);
    expect(sumBuckets(merged)).toBe(1050);
  });

  it("keeps genuinely separate intervals", () => {
    const b = absorbOverlaps({
      "2026-10-05T06:00:00Z|2026-10-05T12:00:00Z": 600,
      "2026-10-05T12:00:00Z|2026-10-05T18:00:00Z": 450,
    });
    expect(sumBuckets(b)).toBe(1050);
  });

  it("keeps records with unusable times rather than dropping real steps", () => {
    const b = absorbOverlaps({ "nonsense": 700 });
    expect(sumBuckets(b)).toBe(700);
  });

  it("still lets a bare total overwrite another bare total", async () => {
    // MacroDroid posts the day's running total repeatedly; the newest wins.
    await saveDay(normalizeReading({ date: "2026-10-05", steps: 1000 })!.days);
    await saveDay(normalizeReading({ date: "2026-10-05", steps: 4200 })!.days);
    const s = await readSummary(new Date("2026-10-05T12:00:00Z"));
    expect(s.steps).toBe(4200);
  });
});

describe("recovery", () => {
  it("names the days that cannot heal on their own", async () => {
    await saveDay(normalizeReading({ steps: [interval(900, "2026-10-05T08:00:00Z", "2026-10-05T09:00:00Z")] })!.days);
    await saveDay(normalizeReading({ date: "2026-10-06", steps: 4242 })!.days);
    const state = await readDayState();
    // The interval-backed day is self-healing. The total-backed day is not:
    // the phone will never resend what it already counted as delivered.
    expect(state.needsFullResync).toEqual(["2026-10-06"]);
  });

  it("clears a wrong day so a full resync can rebuild it", async () => {
    await saveDay(normalizeReading({ date: "2026-10-05", steps: 424242 })!.days);
    expect((await readSummary(new Date("2026-10-05T12:00:00Z"))).steps).toBe(424242);

    await forgetDay("2026-10-05");
    const empty = await readSummary(new Date("2026-10-05T12:00:00Z"));
    expect(empty.configured).toBe(false);

    // The phone re-reads the range and re-delivers every record in it. Landing
    // on an empty day, they rebuild it — and because they are keyed by their
    // own bounds, doing this twice is harmless.
    await saveDay(
      normalizeReading({
        steps: [
          interval(1500, "2026-10-05T07:00:00Z", "2026-10-05T10:00:00Z"),
          interval(2200, "2026-10-05T10:00:00Z", "2026-10-05T13:00:00Z"),
        ],
      })!.days,
    );
    const rebuilt = await readSummary(new Date("2026-10-05T12:00:00Z"));
    expect(rebuilt.steps).toBe(3700);
    expect(rebuilt.source).toBe("intervals");
  });

  it("reports source so the widget can tell a live day from a posted one", async () => {
    await saveDay(normalizeReading({ date: "2026-10-05", steps: 5000 })!.days);
    expect((await readSummary(new Date("2026-10-05T12:00:00Z"))).source).toBe("total");

    await saveDay(normalizeReading({ steps: [interval(5000, "2026-10-05T07:00:00Z", "2026-10-05T13:00:00Z")] })!.days);
    expect((await readSummary(new Date("2026-10-05T12:00:00Z"))).source).toBe("intervals");
  });
});

describe("implausible readings", () => {
  it("classifies by the highest day ever recorded", () => {
    expect(isPlausibleDay(0)).toBe(true);
    expect(isPlausibleDay(18_072)).toBe(true);
    expect(isPlausibleDay(MAX_DAY_STEPS)).toBe(true);
    expect(isPlausibleDay(MAX_DAY_STEPS + 1)).toBe(false);
    // A mistyped marker must never pass as a real day.
    expect(isPlausibleDay(424_242)).toBe(false);
    expect(isPlausibleDay(-1)).toBe(false);
    expect(isPlausibleDay(NaN)).toBe(false);
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