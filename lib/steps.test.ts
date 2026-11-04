import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
  readDays,
  readSummary,
  saveDay,
  stepsBackend,
  stepsToKm,
  sumBuckets,
} from "./steps";

const OLD_ENV = { ...process.env };

beforeEach(() => {
  process.env.STEPS_FILE = join(mkdtempSync(join(tmpdir(), "steps-")), "steps.json");
  delete process.env.CLOUDFLARE_ACCOUNT_ID;
  delete process.env.CLOUDFLARE_KV_NAMESPACE_ID;
  delete process.env.CLOUDFLARE_KV_API_TOKEN;
  delete process.env.STEPS_STRIDE_M;
});

afterEach(() => {
  process.env = { ...OLD_ENV };
  vi.unstubAllGlobals();
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

/** A stand-in for Cloudflare's KV REST API, answering the way the real one
    does: raw text for a single value, a `success`/`result` envelope for bulk
    and listing, 404 for a key that is not there. It exists because a wrong URL
    in that client is not an error anyone sees — it is a feed that stops. */
function mockKv() {
  const ns = new Map<string, string>();
  const calls: { method: string; path: string; init: RequestInit }[] = [];
  const base = "/client/v4/accounts/acct1/storage/kv/namespaces/ns1";
  const fetchImpl = async (input: string, init: RequestInit = {}) => {
    const u = new URL(input);
    const method = init.method ?? "GET";
    const json = (result: unknown, status = 200) =>
      new Response(JSON.stringify({ success: status < 400, result, errors: status >= 400 ? [{}] : [] }), {
        status,
        headers: { "content-type": "application/json" },
      });
    if (!u.pathname.startsWith(base)) return json(null, 400);
    const rest = u.pathname.slice(base.length);
    calls.push({ method, path: `${rest}${u.search}`, init });

    if (method === "GET" && rest === "/keys") {
      const prefix = u.searchParams.get("prefix") ?? "";
      const desc = u.searchParams.get("direction") === "desc";
      const limit = Number(u.searchParams.get("limit") ?? "1000");
      const names = [...ns.keys()].filter((k) => k.startsWith(prefix)).sort();
      const window = (desc ? names.reverse() : names).slice(0, limit);
      return json(window.map((name) => ({ name })));
    }
    if (method === "PUT" && rest === "/bulk") {
      const pairs = JSON.parse(String(init.body)) as { key: string; value: string }[];
      const bad = pairs.filter((p) => typeof p.value !== "string").map((p) => p.key);
      for (const p of pairs) if (!bad.includes(p.key)) ns.set(p.key, p.value);
      /* A rejected key still answers 200, so the envelope is the only truth. */
      return json({ successful_key_count: pairs.length - bad.length, unsuccessful_keys: bad });
    }
    if (rest.startsWith("/values/")) {
      const key = decodeURIComponent(rest.slice("/values/".length));
      if (method === "DELETE") {
        ns.delete(key);
        return json({});
      }
      const value = ns.get(key);
      return value === undefined
        ? new Response("not found", { status: 404 })
        : new Response(value, { status: 200 });
    }
    return json(null, 400);
  };
  return { ns, calls, fetchImpl };
}

describe("Cloudflare KV backend", () => {
  const DAY = "2026-10-05";
  const bucket = (start: string, end: string, count: number): DayBuckets => ({
    [`${start}|${end}`]: count,
  });

  beforeEach(() => {
    process.env.CLOUDFLARE_ACCOUNT_ID = "acct1";
    process.env.CLOUDFLARE_KV_NAMESPACE_ID = "ns1";
    process.env.CLOUDFLARE_KV_API_TOKEN = "tok1";
  });

  it("is the reported backend only when all three variables are present", () => {
    expect(stepsBackend()).toBe("kv");
    delete process.env.CLOUDFLARE_KV_API_TOKEN;
    expect(stepsBackend()).toBe("file");
  });

  it("round-trips a day through the REST API", async () => {
    const kv = mockKv();
    vi.stubGlobal("fetch", kv.fetchImpl);
    const { persisted, totals } = await saveDay({ [DAY]: bucket("2026-10-05T08:00:00Z", "2026-10-05T09:00:00Z", 600) });
    expect(persisted).toBe(true);
    expect(totals[DAY]).toBe(600);
    expect(kv.ns.get(`steps:${DAY}`)).toContain('"steps":600');

    const all = await readDays();
    expect(all[DAY]?.steps).toBe(600);
    expect(all[DAY]?.buckets).toEqual({ "2026-10-05T08:00:00Z|2026-10-05T09:00:00Z": 600 });
  });

  it("accumulates a second payload onto the stored day", async () => {
    const kv = mockKv();
    vi.stubGlobal("fetch", kv.fetchImpl);
    await saveDay({ [DAY]: bucket("2026-10-05T08:00:00Z", "2026-10-05T09:00:00Z", 600) });
    const { totals } = await saveDay({
      [DAY]: bucket("2026-10-05T09:00:00Z", "2026-10-05T10:00:00Z", 450),
    });
    // The merge has to read what is stored, so the day is 600 + 450, not 450.
    expect(totals[DAY]).toBe(1050);
    expect((await readDays())[DAY]?.steps).toBe(1050);
  });

  it("never asks the API for a bulk read, because there is none", async () => {
    /* Live KV answers `GET /values/bulk?keys=…` as a lookup for a key literally
       named "bulk": HTTP 404, `key not found`. A client that read that as an
       empty store would overwrite days it had already accumulated. */
    const kv = mockKv();
    vi.stubGlobal("fetch", kv.fetchImpl);
    await saveDay({
      "2026-10-04": bucket("2026-10-04T08:00:00Z", "2026-10-04T09:00:00Z", 100),
      "2026-10-05": bucket("2026-10-05T08:00:00Z", "2026-10-05T09:00:00Z", 200),
    });
    expect(kv.calls.some((c) => c.path.includes("/values/bulk"))).toBe(false);
    const reads = kv.calls.filter((c) => c.method === "GET" && c.path.startsWith("/values/"));
    expect(reads.map((c) => c.path).sort()).toEqual([
      "/values/steps%3A2026-10-04",
      "/values/steps%3A2026-10-05",
    ]);
    expect(kv.calls.filter((c) => c.method === "PUT" && c.path === "/bulk")).toHaveLength(1);
  });

  it("finds today even when the index has not caught up with it", async () => {
    /* A relay POST lands and the page polls a second later. `/keys` is the one
       part of KV that is eventually consistent, so a listing-only read answers
       "no data today" for a store that has today — the headline number, gone.
       Today is therefore asked for by name, not waited on. */
    const kv = mockKv();
    const today = dayKey();
    kv.ns.set(
      `steps:${today}`,
      JSON.stringify({ steps: 800, updatedAt: "2026-11-04T09:00:00Z", buckets: { "a|b": 800 } }),
    );
    vi.stubGlobal("fetch", async (input: string, init: RequestInit = {}) => {
      if (new URL(input).pathname.endsWith("/keys")) {
        return new Response(JSON.stringify({ success: true, result: [], errors: [] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      return kv.fetchImpl(input, init);
    });
    expect((await readDays(10))[today]?.steps).toBe(800);
  });

  it("reads only a window of the history, newest first", async () => {
    const kv = mockKv();
    vi.stubGlobal("fetch", kv.fetchImpl);
    for (let d = 1; d <= 20; d++) {
      const day = `2026-10-${String(d).padStart(2, "0")}`;
      await saveDay({ [day]: bucket(`${day}T08:00:00Z`, `${day}T09:00:00Z`, 100) });
    }
    kv.calls.length = 0;
    const recent = await readDays(10);
    expect(Object.keys(recent)).toHaveLength(10);
    expect(recent["2026-10-20"]?.steps).toBe(100);
    expect(recent["2026-10-01"]).toBeUndefined();
    const list = kv.calls.find((c) => c.path.startsWith("/keys"));
    expect(list?.path).toContain("direction=desc");
  });

  it("keeps a stored day when the same payload also opens a new one", async () => {
    /* The trap the live API exposed: a bulk read of [known day, new day]
       answers 404, not a partial list. Read as "nothing stored", the known
       day's intervals would be overwritten by the payload alone — silently
       losing every step the phone had already delivered for it. */
    const kv = mockKv();
    vi.stubGlobal("fetch", kv.fetchImpl);
    await saveDay({ [DAY]: bucket("2026-10-05T08:00:00Z", "2026-10-05T09:00:00Z", 600) });
    const { totals } = await saveDay({
      [DAY]: bucket("2026-10-05T09:00:00Z", "2026-10-05T10:00:00Z", 450),
      "2026-10-06": bucket("2026-10-06T07:00:00Z", "2026-10-06T08:00:00Z", 300),
    });
    expect(totals[DAY]).toBe(1050);
    expect(totals["2026-10-06"]).toBe(300);
    const all = await readDays();
    expect(all[DAY]?.steps).toBe(1050);
    expect(all["2026-10-06"]?.steps).toBe(300);
  });

  it("never lets Next cache a read, and authenticates every call", async () => {
    const kv = mockKv();
    vi.stubGlobal("fetch", kv.fetchImpl);
    await saveDay({ [DAY]: bucket("2026-10-05T08:00:00Z", "2026-10-05T09:00:00Z", 600) });
    await readDays();
    for (const call of kv.calls) {
      expect(call.init.cache).toBe("no-store");
      expect((call.init.headers as Record<string, string>).Authorization).toBe("Bearer tok1");
    }
  });

  it("forgets a day by deleting its key", async () => {
    const kv = mockKv();
    vi.stubGlobal("fetch", kv.fetchImpl);
    await saveDay({ [DAY]: bucket("2026-10-05T08:00:00Z", "2026-10-05T09:00:00Z", 600) });
    expect(await forgetDay(DAY)).toBe(true);
    expect(kv.ns.size).toBe(0);
    expect(await readDays()).toEqual({});
  });

  it("survives an empty namespace", async () => {
    const kv = mockKv();
    vi.stubGlobal("fetch", kv.fetchImpl);
    expect(await readDays()).toEqual({});
    expect((await readSummary()).configured).toBe(false);
  });
});
