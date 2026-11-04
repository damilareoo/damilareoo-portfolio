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
 *
    The key is the exact interval, so a resend of the same record replaces
    itself rather than adding to it. That alone is not enough, and getting
    that wrong is what inflated a day to 84,336 steps: a relay's background
    sync and its explicit-range resync emit buckets at DIFFERENT granularities
    over the same hours. A 00:00-23:59 bucket and four six-hour buckets cover
    identical time but are four different keys, so keying on exact bounds let
    both survive and counted the same steps twice. Overlap is therefore
    resolved in time, not by string equality — see absorbOverlaps. */
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

/** An interval's bounds, parsed. Unparseable bounds (a payload with a count
    but no times) score as zero-width so they never absorb anything. */
function span(key: string): { start: number; end: number } {
  const [s, e] = key.split("|");
  const start = Date.parse(s ?? "");
  const end = Date.parse(e ?? "");
  return {
    start: Number.isFinite(start) ? start : 0,
    end: Number.isFinite(end) ? end : 0,
  };
}

/**
 * Fold a day's intervals down so no two cover the same instant.
 *
 * Records arrive at whatever granularity the sender felt like, and a coarser
 * record is the more authoritative of the two: if Health Connect reports the
 * whole day at once, that total supersedes the four chunks it was assembled
 * from. So for each interval, anything already stored that it fully covers is
 * dropped, and it in turn drops only what it covers. Intervals that merely
 * overlap without containing one another are left alone — Health Connect can
 * legitimately report adjacent windows that share a boundary instant, and
 * inventing a subtraction here would lose real steps.
 *
 * Order matters: widest first, so a broad record claims its ground before a
 * narrow one arrives to argue about it.
 */
export function absorbOverlaps(incoming: DayBuckets, existing?: DayBuckets): DayBuckets {
  /* Start from what is already stored, so an incremental payload keeps every
     interval the day had. Only the ones an incoming record fully covers are
     dropped — that is the entire set of changes this function makes. */
  const out: DayBuckets = { ...(existing ?? {}) };

  const ordered = Object.entries(incoming)
    .map(([key, count]) => ({ key, count: count ?? 0, ...span(key) }))
    .sort((a, b) => b.end - b.start - (a.end - a.start));

  for (const cand of ordered) {
    if (!(cand.end > cand.start)) {
      // No usable times: keep it, it cannot be reasoned about.
      out[cand.key] = cand.count;
      continue;
    }
    const supersedes = (s: number, e: number) => e > s && cand.start <= s && cand.end >= e;
    for (const key of Object.keys(out)) {
      const s = span(key);
      if (supersedes(s.start, s.end)) delete out[key];
    }
    out[cand.key] = cand.count;
  }
  return out;
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

/** One stored day, tolerantly: the file backend keeps objects while KV hands
    back the string it was given. Either shape must survive — a throw here
    silently drops the whole feed. */
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

/** Cloudflare KV, spoken to over its REST API rather than a binding, so the
    store works the same whether the runtime is a Worker, a Node server or
    `vitest`. Three variables: which account, which namespace, and a token
    scoped to KV read and write — nothing broader, because it lives in a
    deployment others can read the configuration of. */
type KvRest = { account: string; namespace: string; token: string };

function kvRest(): KvRest | null {
  const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_KV_NAMESPACE_ID, CLOUDFLARE_KV_API_TOKEN } =
    process.env;
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_KV_NAMESPACE_ID || !CLOUDFLARE_KV_API_TOKEN) {
    return null;
  }
  return {
    account: CLOUDFLARE_ACCOUNT_ID,
    namespace: CLOUDFLARE_KV_NAMESPACE_ID,
    token: CLOUDFLARE_KV_API_TOKEN,
  };
}

function hasKvStore(): boolean {
  return kvRest() !== null;
}

const KV_BASE = (k: KvRest) =>
  `https://api.cloudflare.com/client/v4/accounts/${k.account}/storage/kv/namespaces/${k.namespace}`;

/** `cache: "no-store"` is load-bearing, not hygiene: without it Next replays
    the first — empty — read forever while writes keep landing, so the tile
    looks permanently idle on a store that is actually filling up. */
async function kvFetch(k: KvRest, path: string, init: RequestInit = {}) {
  const res = await fetch(`${KV_BASE(k)}${path}`, {
    ...init,
    cache: "no-store",
    headers: { Authorization: `Bearer ${k.token}`, ...init.headers },
  });
  /* A 404 is the store saying "this day has never been reported", which is an
     answer, not an outage. Anything else throws, because a 401 or 503 treated
     as an empty store is a tile that goes quiet while the pipeline looks fine. */
  if (!res.ok && res.status !== 404) throw new Error(`kv ${res.status} ${path}`);
  return res;
}

async function kvGet(k: KvRest, key: string): Promise<string | null> {
  const res = await kvFetch(k, `/values/${encodeURIComponent(key)}`);
  return res.ok ? res.text() : null;
}

/** Days read in parallel, one request each.
 *
    There is no bulk read on KV's REST API. `GET /values/{name}` takes exactly
    one key, and a path like `/values/bulk?keys=…` is not a batch endpoint — it
    is answered as a lookup for a key literally named `bulk`, which does not
    exist, so every such request comes back `key not found`. Writes are bulk;
    reads are not. Issuing them together keeps the wall clock at one round trip
    and makes a missing day answer as itself: a 404 for one day is not a 404 for
    the feed, and a stored day can never be read as empty. */
async function kvGetMany(k: KvRest, keys: string[]): Promise<Record<string, string>> {
  const found = await Promise.all(
    keys.map(async (key) => [key, await kvGet(k, key)] as const),
  );
  const out: Record<string, string> = {};
  for (const [key, v] of found) if (v !== null) out[key] = v;
  return out;
}

/** A write that the store refuses still answers HTTP 200, with the rejected
    keys listed in the body — so the envelope has to be read, or a relay gets a
    2xx for a reading that never landed and stops sending it. */
async function kvPutMany(k: KvRest, pairs: Record<string, string>): Promise<void> {
  const body = Object.entries(pairs).map(([key, value]) => ({ key, value }));
  if (body.length === 0) return;
  const res = await kvFetch(k, "/bulk", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const env = (await res.json()) as {
    success?: boolean;
    result?: { unsuccessful_keys?: string[] };
  };
  const bad = env.result?.unsuccessful_keys ?? [];
  if (!env.success || bad.length > 0) throw new Error(`kv write rejected: ${bad.join(",")}`);
}

async function kvDelete(k: KvRest, key: string): Promise<void> {
  await kvFetch(k, `/values/${encodeURIComponent(key)}`, { method: "DELETE" });
}

/** Names only, which is a cheap way to ask "which days do we hold".
    `newest` lists backwards, because day keys sort chronologically and the
    listing endpoint will hand them back in reverse — one page is then the
    recent window, no matter how much history the namespace has accumulated. */
async function kvListKeys(k: KvRest, prefix: string, newest = 0): Promise<string[]> {
  const q = [`prefix=${encodeURIComponent(prefix)}`];
  if (newest > 0) {
    /* KV rejects a limit under 10, so the page is slightly wider than asked
       for; the caller slices. */
    q.push("direction=desc", `limit=${Math.max(10, newest)}`);
  }
  const res = await kvFetch(k, `/keys?${q.join("&")}`);
  if (!res.ok) return [];
  const body = (await res.json()) as { result?: { name: string }[] };
  const names = (body.result ?? []).map((r) => r.name);
  return newest > 0 ? names.slice(0, newest) : names;
}

/** Which store a reading lands in. Reported by both step routes because the
    wrong answer used to be invisible: a deployment that comes up without KV
    credentials falls to the file, a file cannot be written on a runtime with
    no disk, and every read after that returns nothing while the tile simply
    looks idle. */
export function stepsBackend(): "kv" | "file" {
  return hasKvStore() ? "kv" : "file";
}

/** Local dev fallback, and nothing more. `STEPS_FILE` overrides it. */
function filePath(): string {
  return process.env.STEPS_FILE ?? join(process.cwd(), "data", "steps.local.json");
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
 *
 * One key per Lagos day rather than a single hash: KV has no hash type, and
 * a day that lives on its own key is a day that can be read, replaced or
 * forgotten without touching the rest of the history.
 */
const KEY_PREFIX = "steps:";

/** How many days a summary is allowed to look at. Reads are one request per
    day — KV has no bulk read — and the tile polls every minute, so an
    unbounded read prices the whole history into every page view. Ten covers
    the seven-day window plus slack for a day the phone reports late. */
const STORED_WINDOW = 10;
const dayKeyOf = (day: string) => `${KEY_PREFIX}${day}`;

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
  const stored: DayBuckets = {};
  for (const [k, v] of Object.entries(existing?.buckets ?? {})) {
    if (k !== ADHOC_BUCKET) stored[k] = v;
  }
  /* Overlap is resolved across BOTH sets, not just within the new payload. A
     resync after a background sync re-reads the same hours at a different
     granularity, and keying on exact bounds let both generations of buckets
     coexist — which is how a morning's walk reached 84,336 steps. */
  const buckets = absorbOverlaps(incomingBuckets, stored);
  return { steps: sumBuckets(buckets), updatedAt: incoming.updatedAt, buckets };
}

/** Forget a day entirely, so the next payload that covers it starts from
    nothing. This is the only way out of a day the store holds wrongly: a relay
    will never resend records it already counted as delivered, so merging more
    onto a bad copy only compounds it. The phone has to re-read the range, and
    for that to work the store must be empty for the day first. */
export async function forgetDay(day: string): Promise<boolean> {
  const k = kvRest();
  if (k) {
    await kvDelete(k, dayKeyOf(day));
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
  const k = kvRest();
  if (k) {
    const ordered = Object.keys(days).sort();
    /* Read the days this payload touches, in parallel, then write them back in
       one bulk call. Merging has to see what is stored — a relay's second
       payload of a day is incremental, and treating a stored day as empty is
       how a day loses every interval the phone already delivered. */
    const stored = await kvGetMany(
      k,
      ordered.map((day) => dayKeyOf(day)),
    );
    const out: Record<string, string> = {};
    for (const day of ordered) {
      let existing: DayEntry | null = null;
      try {
        existing = parseDayEntry(stored[dayKeyOf(day)] ?? null);
      } catch {
        /* An unreadable day is replaced rather than dropped — a stale total
           is a smaller lie than a feed that stops. */
      }
      const incoming: DayEntry = { steps: sumBuckets(days[day]), updatedAt: now, buckets: days[day] };
      const merged = mergeDay(existing, incoming);
      totals[day] = merged.steps;
      out[dayKeyOf(day)] = JSON.stringify(merged);
    }
    await kvPutMany(k, out);
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

export async function readDays(newest = 0): Promise<Record<string, DayEntry>> {
  const k = kvRest();
  if (k) {
    const names = await kvListKeys(k, KEY_PREFIX, newest);
    /* Listing lags a write by a few seconds — it is the one part of KV that is
       eventually consistent. Today is the number the tile puts in its headline,
       so ask for it by name rather than waiting for the index to notice it. */
    const wanted = new Set(names);
    wanted.add(dayKeyOf(dayKey()));
    const raw = await kvGetMany(k, [...wanted]);
    const out: Record<string, DayEntry> = {};
    for (const [key, v] of Object.entries(raw)) {
      const e = parseDayEntry(v);
      if (e) out[key.slice(KEY_PREFIX.length)] = e;
    }
    return out;
  }
  return readFile();
}

/** One day in the trailing week. `steps: null` means nobody reported it —
 *  distinct from a reported zero, and carried that way all the way out so a
 *  consumer can render a hollow day instead of inventing a quiet one. */
export type SummaryDay = { date: string; steps: number | null };

/** The seven Lagos days ending on `now`, oldest first. */
function trailingWeek(now: Date): string[] {
  const out: string[] = [];
  for (let i = 6; i >= 0; i--) {
    out.push(dayKey(new Date(now.getTime() - i * 86_400_000)));
  }
  return out;
}

/** The lagos midnight opening a YYYY-MM-DD, as ms. Lagos is UTC+1 year-round. */
function lagosMidnight(date: string): number {
  return Date.parse(`${date}T00:00:00+01:00`);
}

/**
 * Split a day's intervals into 24 hourly totals for the day chart.
 *
 * An interval is spread evenly across the hours it overlaps, so a two-hour
 * record contributes to both hours it covers rather than dumping its whole
 * count on its start hour. A `whole-day` total has no time inside it and
 * returns null; so does any interval longer than two hours, because at that
 * coarseness an "hourly" shape is a guess, not a reading. The caller shows the
 * week instead of inventing a morning.
 */
const MAX_HOURLY_SPAN_MS = 2 * 60 * 60 * 1000;
export function hourlyBuckets(buckets: DayBuckets | undefined, date: string): number[] | null {
  if (!buckets) return null;
  const dayStart = lagosMidnight(date);
  if (!Number.isFinite(dayStart)) return null;
  const dayEnd = dayStart + 86_400_000;
  const hours = Array.from({ length: 24 }, () => 0);
  let sawInterval = false;
  for (const [key, count] of Object.entries(buckets)) {
    if (key === ADHOC_BUCKET) continue;
    const [rawStart, rawEnd] = key.split("|");
    const start = Date.parse(rawStart ?? "");
    const parsedEnd = Date.parse(rawEnd ?? "");
    if (!Number.isFinite(start)) continue;
    const end = Number.isFinite(parsedEnd) && parsedEnd > start ? parsedEnd : start + 1;
    if (end - start > MAX_HOURLY_SPAN_MS) return null;
    const from = Math.max(start, dayStart);
    const to = Math.min(end, dayEnd);
    if (to <= from) continue;
    const perMs = count / (end - start);
    let cursor = from;
    while (cursor < to) {
      const hour = Math.floor((cursor - dayStart) / 3_600_000);
      const hourEnd = Math.min(to, dayStart + (hour + 1) * 3_600_000);
      hours[hour] += perMs * (hourEnd - cursor);
      cursor = hourEnd;
    }
    sawInterval = true;
  }
  return sawInterval ? hours.map((n) => Math.round(n)) : null;
}

/** Today plus the trailing 7-day mean, in whole steps.
 *
 *  `source` reports whether the day's figure came from relay intervals or a
 *  single posted total. It is not decoration: only an interval-backed day can
 *  correct itself, so the widget says which it is showing rather than
 *  presenting an unrecoverable number with the same confidence as a live one.
 *
 *  The summary is deliberately self-contained: `today`, `days`, `average7`,
 *  and `hours` let a second surface (the Nothing pedometer concept) render the
 *  same truth without reaching into the store or re-deriving the day. */
export async function readSummary(now = new Date()): Promise<{
  configured: boolean;
  date?: string;
  steps?: number;
  km?: number;
  averageKm?: number;
  average7?: number;
  reportedDays?: number;
  goal?: number;
  today?: number | null;
  days?: SummaryDay[];
  hours?: number[] | null;
  updatedAt?: string;
  source?: DaySource;
}> {
  const all = await readDays(STORED_WINDOW);
  const storedDays = Object.keys(all).sort();
  if (storedDays.length === 0) return { configured: false };
  const today = dayKey(now);
  const last7 = storedDays.slice(-7);
  const sum = last7.reduce((a, d) => a + (all[d]?.steps ?? 0), 0);
  const latest = all[today] ?? all[storedDays[storedDays.length - 1]];
  const latestDay = all[today] ? today : storedDays[storedDays.length - 1];

  /* Calendar week, not stored week: missing days stay null so a stale store
     cannot masquerade as seven quiet ones. The average is over reported days
     only, and `reportedDays` carries the denominator so nobody has to guess. */
  const week: SummaryDay[] = trailingWeek(now).map((date) => ({
    date,
    steps: all[date]?.steps ?? null,
  }));
  const reported = week.filter((d): d is { date: string; steps: number } => d.steps !== null);
  const average7 = reported.length
    ? Math.round(reported.reduce((a, d) => a + d.steps, 0) / reported.length)
    : 0;
  const goal = Number(process.env.STEPS_GOAL ?? 10_000);
  const intervalBacked = Boolean(latest.buckets && !(ADHOC_BUCKET in (latest.buckets ?? {})));

  return {
    configured: true,
    date: latestDay,
    steps: latest.steps,
    km: stepsToKm(latest.steps),
    averageKm: stepsToKm(Math.round(sum / last7.length)),
    average7,
    reportedDays: reported.length,
    goal: Number.isFinite(goal) && goal > 0 ? Math.floor(goal) : 10_000,
    today: all[today]?.steps ?? null,
    days: week,
    hours: intervalBacked ? hourlyBuckets(latest.buckets, latestDay) : null,
    updatedAt: latest.updatedAt,
    source: intervalBacked ? "intervals" : "total",
  };
}
