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

/** Intervals merged with what is already stored for that day. A resend of
    an interval the phone already sent lands on the same key and replaces
    itself, which is what makes a retry safe to acknowledge with a 2xx. */
function mergeDay(existing: DayEntry | null, incoming: DayEntry): DayEntry {
  const incomingBuckets = incoming.buckets ?? {};
  /* A whole-day total wins outright. It cannot be split into intervals, so
     adding it to intervals already stored would count the day twice. */
  if (ADHOC_BUCKET in incomingBuckets) {
    return { ...incoming, buckets: incomingBuckets };
  }
  const buckets: DayBuckets = existing?.buckets ? { ...existing.buckets } : {};
  for (const [k, v] of Object.entries(incomingBuckets)) buckets[k] = v;
  return { steps: sumBuckets(buckets), updatedAt: incoming.updatedAt, buckets };
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

/** Today plus the trailing 7-day mean, in whole steps. */
export async function readSummary(now = new Date()): Promise<{
  configured: boolean;
  date?: string;
  steps?: number;
  km?: number;
  averageKm?: number;
  updatedAt?: string;
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
  };
}

/* ── last-attempt trace ────────────────────────────────────────────────
   TEMPORARY diagnostic. The reading above cannot tell "the macro never
   fired" apart from "the macro fired and was rejected", because a failed
   POST writes nothing. This records the outcome of every attempt,
   including the ones that never reach storage, so the two separate.

   Kept out of the days hash on purpose: readSummary() walks every key in
   that hash as if it were a day, and a non-day entry there would poison
   the summary the widget renders.

   Delete this block and app/api/steps/debug once the feed is healthy. */

const KV_ATTEMPT = "portfolio:steps:lastAttempt";

export type StepAttemptOutcome = "accepted" | "unauthorized" | "bad-json" | "no-count";

export type StepAttempt = {
  at: string;
  outcome: StepAttemptOutcome;
  ua: string | null;
  /** First two segments only. Enough to tell a phone from a crawler,
      not enough to be a fingerprint. */
  ip: string | null;
  steps?: number;
  date?: string;
  /* TEMPORARY. Kept only for attempts that failed to produce a reading,
     because the reason they failed is a payload shape, and the shape is
     the thing that has to be read off the wire rather than guessed from a
     relay app's documentation. Truncated, and never stored for an attempt
     that succeeded — a working payload has nothing left to diagnose. */
  raw?: string;
  rawLen?: number;
  keys?: string[];
};

/** How much of an unparseable or unreadable body to keep. Enough for any
    relay app's envelope; a real day's step records run far past this and
    the head is where the shape lives. */
export const RAW_CAPTURE_LIMIT = 4000;

/** Field names only, one level deep. Lets a shape be recognised even when
    the body is too large to keep whole. */
export function topLevelKeys(body: unknown): string[] | undefined {
  if (!body || typeof body !== "object" || Array.isArray(body)) return undefined;
  return Object.keys(body as Record<string, unknown>).slice(0, 40);
}

/** Keep enough of the address to tell callers apart, drop the rest. */
export function coarseIp(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const parts = raw.split(/[.:]/);
  return parts.length <= 2 ? raw : `${parts.slice(0, 2).join(".")}.x`;
}

function attemptPath(): string {
  if (process.env.STEPS_FILE) return `${process.env.STEPS_FILE}.attempt.json`;
  if (process.env.VERCEL) return join("/tmp", "steps-attempt.json");
  return join(process.cwd(), "data", "steps.attempt.local.json");
}

export async function recordAttempt(a: Omit<StepAttempt, "at">): Promise<void> {
  const entry: StepAttempt = { ...a, at: new Date().toISOString() };
  if (hasKvStore()) {
    try {
      await store().set(KV_ATTEMPT, JSON.stringify(entry));
      return;
    } catch {
      /* fall through to the file so a KV hiccup still leaves a trace */
    }
  }
  try {
    const p = attemptPath();
    mkdirSync(/*turbopackIgnore: true*/ dirname(p), { recursive: true });
    writeFileSync(/*turbopackIgnore: true*/ p, JSON.stringify(entry));
  } catch {
    /* diagnostics must never break ingest */
  }
}

export async function readLastAttempt(): Promise<StepAttempt | null> {
  if (hasKvStore()) {
    try {
      const raw = await store().get<string>(KV_ATTEMPT);
      if (!raw) return null;
      return (typeof raw === "string" ? JSON.parse(raw) : raw) as StepAttempt;
    } catch {
      /* fall through to the file */
    }
  }
  try {
    const p = attemptPath();
    if (!existsSync(/*turbopackIgnore: true*/ p)) return null;
    return JSON.parse(readFileSync(/*turbopackIgnore: true*/ p, "utf8")) as StepAttempt;
  } catch {
    return null;
  }
}
