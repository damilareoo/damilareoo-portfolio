import { createClient } from "@vercel/kv";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

/** Average adult stride: the standard pedometer assumption behind every
    step-to-distance readout — same constant as the nothing-pedometer
    concept, so the tile and the concept can never disagree. */
export const STRIDE_M = Number(process.env.STEPS_STRIDE_M ?? 0.75) || 0.75;

/** Lagos calendar day — the site's clock, the widget's day boundary. */
export function dayKey(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function stepsToKm(steps: number): number {
  return Math.round(((steps * STRIDE_M) / 1000) * 100) / 100;
}

function toInt(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return Math.max(0, Math.floor(v));
  if (typeof v === "string") {
    const cleaned = v.replace(/[^0-9.]/g, "");
    /* A string with no digits in it is not a number that happens to be zero,
       it is not a number. Number("") is 0, so without this a payload reading
       `{"steps": "n/a"}` would store a zero-step day and quietly overwrite
       a real reading. */
    if (cleaned === "" || cleaned === ".") return null;
    const n = Number(cleaned);
    if (Number.isFinite(n)) return Math.max(0, Math.floor(n));
  }
  return null;
}

/** Step intervals for one Lagos day, keyed by the interval they cover.
    A relay that streams step records sends each interval once, but resends
    an interval the phone later edits and retries any delivery it never saw
    acknowledged. Keying by interval identity rather than by a running
    number is what makes accumulating them safe in the face of all three. */
export type DayBuckets = Record<string, number>;

/** Reserved key for a payload carrying one whole-day figure instead of
    intervals. It cannot be decomposed into intervals, so it is kept apart
    from them and replaces the day outright rather than adding to it. */
export const ADHOC_BUCKET = "whole-day";

export type NormalizedReading = {
  /** Lagos day -> interval key -> step count. */
  days: Record<string, DayBuckets>;
};

export function sumBuckets(b: DayBuckets | undefined): number {
  if (!b) return 0;
  let total = 0;
  for (const v of Object.values(b)) if (Number.isFinite(v)) total += v;
  return total;
}

/** A streaming relay: HC Webhook posts
    `{ steps: [{count, start_time, end_time}, ...] }`, sending only what
    changed since its last successful sync across a rolling 48-hour
    window — so one payload can legitimately touch two Lagos days. */
function collectIntervals(records: unknown[]): Record<string, DayBuckets> {
  const days: Record<string, DayBuckets> = {};
  for (const r of records) {
    if (!r || typeof r !== "object") continue;
    const rec = r as Record<string, unknown>;
    const count = toInt(rec.count);
    const startMs = typeof rec.start_time === "string" ? Date.parse(rec.start_time) : NaN;
    if (count === null || !Number.isFinite(startMs)) continue;
    const day = dayKey(new Date(startMs));
    if (!days[day]) days[day] = {};
    days[day][`${rec.start_time}|${String(rec.end_time ?? "")}`] = count;
  }
  return days;
}

/** An explicit YYYY-MM-DD in the body beats the clock: a macro firing just
    after midnight in Lagos has to be able to land the previous day's total
    rather than the new day's. */
function bodyDay(b: Record<string, unknown>): string | null {
  if (typeof b.date !== "string") return null;
  const d = b.date.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
}

/**
 * Every shape the widget accepts, mapped onto one thing: intervals bucketed
 * by Lagos day. A streaming relay sends arrays of step intervals; a macro
 * template sends a single total. Both land in the same structure, so storage
 * never has to know which phone app is talking to it.
 * Returns null when nothing usable is present.
 */
export function normalizeReading(body: unknown, now = new Date()): NormalizedReading | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const b = body as Record<string, unknown>;

  if (Array.isArray(b.steps)) {
    const days = collectIntervals(b.steps);
    if (Object.keys(days).length > 0) return { days };
  }

  const day = bodyDay(b) ?? dayKey(now);
  for (const k of ["steps", "step_count", "stepcount", "count", "value", "total"]) {
    const n = toInt(b[k]);
    if (n !== null) return { days: { [day]: { [ADHOC_BUCKET]: n } } };
  }
  for (const k of ["km", "kilometers", "kilometres", "distance_km", "distance"]) {
    const v = b[k];
    const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
    if (Number.isFinite(n) && n >= 0 && STRIDE_M > 0) {
      return { days: { [day]: { [ADHOC_BUCKET]: Math.round((n * 1000) / STRIDE_M) } } };
    }
  }
  return null;
}

export type DayEntry = {
  steps: number;
  updatedAt: string;
  /** The intervals `steps` was summed from. Absent for a whole-day total,
      and for every day stored before a relay streamed intervals — both stay
      readable, they simply have nothing to accumulate onto. */
  buckets?: DayBuckets;
};

/** One stored day, tolerantly: the file backend keeps raw strings while the
    KV client auto-parses JSON responses into objects. Either shape must
    survive — a throw here silently drops the whole feed. */
export function parseDayEntry(v: unknown): DayEntry | null {
  try {
    const e = (typeof v === "string" ? JSON.parse(v) : v) as DayEntry;
    if (e && typeof e.steps === "number" && Number.isFinite(e.steps)) {
      const entry: DayEntry = {
        steps: Math.max(0, Math.floor(e.steps)),
        updatedAt: typeof e.updatedAt === "string" ? e.updatedAt : new Date(0).toISOString(),
      };
      if (e.buckets && typeof e.buckets === "object" && !Array.isArray(e.buckets)) {
        const buckets: DayBuckets = {};
        for (const [k, n] of Object.entries(e.buckets as Record<string, unknown>)) {
          const c = toInt(n);
          if (c !== null) buckets[k] = c;
        }
        if (Object.keys(buckets).length > 0) entry.buckets = buckets;
      }
      return entry;
    }
    return null;
  } catch {
    return null;
  }
}

function hasKvStore(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

/** Own client with fetch caching off. The default export lets Next.js
    cache KV reads (`cache: "default"`), so the first — empty — read
    replays forever while writes land fine. Reads must always hit the
    store. */
let _store: ReturnType<typeof createClient> | null = null;
function store() {
  if (!_store) {
    _store = createClient({
      url: process.env.KV_REST_API_URL ?? "",
      token: process.env.KV_REST_API_TOKEN ?? "",
      cache: "no-store",
    });
  }
  return _store;
}

function filePath(): string {
  if (process.env.STEPS_FILE) return process.env.STEPS_FILE;
  if (process.env.VERCEL) return join("/tmp", "steps.json");
  return join(process.cwd(), "data", "steps.local.json");
}

function readFile(): Record<string, DayEntry> {
  try {
    const p = filePath();
    if (!existsSync(/*turbopackIgnore: true*/ p)) return {};
    return JSON.parse(readFileSync(/*turbopackIgnore: true*/ p, "utf8")) as Record<string, DayEntry>;
  } catch {
    return {};
  }
}

function writeFile(all: Record<string, DayEntry>): boolean {
  try {
    const p = filePath();
    mkdirSync(/*turbopackIgnore: true*/ dirname(p), { recursive: true });
    const keys = Object.keys(all).sort().slice(-60);
    const pruned: Record<string, DayEntry> = {};
    for (const k of keys) pruned[k] = all[k];
    writeFileSync(/*turbopackIgnore: true*/ p, JSON.stringify(pruned));
    return true;
  } catch {
    return false;
  }
}

/**
 * The store is KV when connected, a small JSON file otherwise (local dev,
 * or prod before the store is attached). The file backend keeps the Test
 * Webhook button green end to end; KV makes readings survive restarts.
 */
const KV_HASH = "portfolio:steps:days";

/** Ceiling on a single day's step count. The most ever recorded in a day is
    around 115,000, so 150,000 sits above anything a phone can legitimately
    report from a human and well below the figures a bad payload produces.
    It exists because a single mistyped or mis-signed POST would otherwise
    overwrite a real reading with one that looks entirely plausible on the
    tile, and the relay would never resend the intervals it already
    considered delivered. */
export const MAX_DAY_STEPS = 150_000;

export function isPlausibleDay(steps: number): boolean {
  return Number.isFinite(steps) && steps >= 0 && steps <= MAX_DAY_STEPS;
}

/** How a day's figure was arrived at: relay intervals, or a single posted
    total. Only the first can correct itself, so the widget reports which it
    is showing rather than presenting both with equal confidence. */
export type DaySource = "intervals" | "total";

/** Read the store and classify each day.
 *
 * This is the piece every previous fix was missing. A relay sends only records
 * new since its last successful sync, so the server is the only party that can
 * hold a wrong figure and the only party that can repair one. Nothing about a
 * later delivery will fix a bad day: the phone has no reason to resend what it
 * already counted as delivered. So the store has to be able to say which days
 * are backed by intervals (recoverable, self-healing) and which are standing on
 * a single hand-posted total (not recoverable without a full resync).
 */
export type DayState = {
  days: Record<string, DayEntry>;
  /** Days holding a bare total rather than intervals. A day listed here cannot
      improve on its own; it needs the phone to re-read the range. */
  needsFullResync: string[];
};

export async function readDayState(): Promise<DayState> {
  const days = await readDays();
  const needsFullResync = Object.entries(days)
    .filter(([, e]) => !e.buckets || ADHOC_BUCKET in e.buckets)
    .map(([d]) => d)
    .sort();
  return { days, needsFullResync };
}

/** Intervals merged with what is already stored for that day. A resend of
    an interval the phone already sent lands on the same key and replaces
    itself, which is what makes a retry safe to acknowledge with a 2xx. */
function mergeDay(existing: DayEntry | null, incoming: DayEntry): DayEntry {
  const incomingBuckets = incoming.buckets ?? {};
  /* A whole-day total wins outright, unless the day already holds intervals.

     A relay streams intervals and never resends them — it only sends what is
     new since its last successful sync — so intervals already stored are
     irreplaceable. A bare total can only ever be coarser than them, and
     accepting one here would discard the day's detail for good, leaving the
     relay with nothing left to send. Intervals therefore outrank a total in
     both directions: the two rules below are one decision, not two. */
  if (ADHOC_BUCKET in incomingBuckets) {
    const existingIsIntervalBased =
      existing?.buckets !== undefined && !(ADHOC_BUCKET in existing.buckets);
    if (existingIsIntervalBased && sumBuckets(existing?.buckets) > 0) return existing;
    return { ...incoming, buckets: incomingBuckets };
  }
  /* The reverse: a day first written as one total, then written again as
     intervals by a relay. The stored total is a reserved key, not a real
     interval, so it must not be carried into the interval set — otherwise
     the first relay sync reports the old total plus every real step,
     permanently inflated. */
  const buckets: DayBuckets = {};
  for (const [k, v] of Object.entries(existing?.buckets ?? {})) {
    if (k !== ADHOC_BUCKET) buckets[k] = v;
  }
  for (const [k, v] of Object.entries(incomingBuckets)) buckets[k] = v;
  return { steps: sumBuckets(buckets), updatedAt: incoming.updatedAt, buckets };
}

/** Forget a day entirely, so the next payload that covers it starts from
    nothing. This is the only way out of a day the store holds wrongly: a relay
    will never resend records it already counted as delivered, so merging more
    onto a bad copy only compounds it. The phone has to re-read the range, and
    for that to work the store must be empty for the day first. */
export async function forgetDay(day: string): Promise<boolean> {
  if (hasKvStore()) {
    await store().hdel(KV_HASH, day);
    return true;
  }
  const all = readFile();
  if (!(day in all)) return false;
  delete all[day];
  return writeFile(all);
}

/**
 * Store one or more days' intervals. A single payload can span two Lagos
 * days, because a relay streams a rolling 48-hour window, so the days
 * arrive together rather than one at a time.
 *
 * Returns each written day's total *after* merging, not just the increment
 * this payload carried. A relay's caller reads the response in its logs, and
 * the number worth seeing there is what the day now stands at.
 */
export async function saveDay(
  days: Record<string, DayBuckets>,
): Promise<{ persisted: boolean; totals: Record<string, number> }> {
  const now = new Date().toISOString();
  const totals: Record<string, number> = {};
  if (hasKvStore()) {
    const s = store();
    for (const day of Object.keys(days).sort()) {
      let existing: DayEntry | null = null;
      try {
        existing = parseDayEntry(await s.hget<string | DayEntry>(KV_HASH, day));
      } catch {
        /* An unreadable day is replaced rather than dropped — a stale total
           is a smaller lie than a feed that stops. */
      }
      const incoming: DayEntry = { steps: sumBuckets(days[day]), updatedAt: now, buckets: days[day] };
      const merged = mergeDay(existing, incoming);
      totals[day] = merged.steps;
      await s.hset(KV_HASH, { [day]: JSON.stringify(merged) });
    }
    return { persisted: true, totals };
  }
  const all = readFile();
  for (const day of Object.keys(days).sort()) {
    const incoming: DayEntry = { steps: sumBuckets(days[day]), updatedAt: now, buckets: days[day] };
    const merged = mergeDay(parseDayEntry(all[day]), incoming);
    totals[day] = merged.steps;
    all[day] = merged;
  }
  return { persisted: writeFile(all), totals };
}

export async function readDays(): Promise<Record<string, DayEntry>> {
  if (hasKvStore()) {
    const raw = await store().hgetall<Record<string, string>>(KV_HASH);
    const out: Record<string, DayEntry> = {};
    if (raw) {
      for (const [k, v] of Object.entries(raw)) {
        const e = parseDayEntry(v);
        if (e) out[k] = e;
      }
    }
    return out;
  }
  return readFile();
}

/** Today plus the trailing 7-day mean, in whole steps.
 *
 *  `source` reports whether the day's figure came from relay intervals or a
 *  single posted total. It is not decoration: only an interval-backed day can
 *  correct itself, so the widget says which it is showing rather than
 *  presenting an unrecoverable number with the same confidence as a live one. */
export async function readSummary(now = new Date()): Promise<{
  configured: boolean;
  date?: string;
  steps?: number;
  km?: number;
  averageKm?: number;
  updatedAt?: string;
  source?: DaySource;
}> {
  const all = await readDays();
  const days = Object.keys(all).sort();
  if (days.length === 0) return { configured: false };
  const today = dayKey(now);
  const last7 = days.slice(-7);
  const sum = last7.reduce((a, d) => a + (all[d]?.steps ?? 0), 0);
  const latest = all[today] ?? all[days[days.length - 1]];
  const latestDay = all[today] ? today : days[days.length - 1];
  return {
    configured: true,
    date: latestDay,
    steps: latest.steps,
    km: stepsToKm(latest.steps),
    averageKm: stepsToKm(Math.round(sum / last7.length)),
    updatedAt: latest.updatedAt,
    source: latest.buckets && !(ADHOC_BUCKET in latest.buckets) ? "intervals" : "total",
  };
}
