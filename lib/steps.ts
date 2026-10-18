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
    const n = Number(v.replace(/[^0-9.]/g, ""));
    if (Number.isFinite(n)) return Math.max(0, Math.floor(n));
  }
  return null;
}

/**
 * MacroDroid posts whatever JSON template the macro holds, so the ingest
 * is liberal: steps under several likely keys, or kilometres directly.
 * Returns null when nothing usable is present.
 */
export function normalizeReading(body: unknown): { steps: number } | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  for (const k of ["steps", "step_count", "stepcount", "count", "value", "total"]) {
    const n = toInt(b[k]);
    if (n !== null) return { steps: n };
  }
  for (const k of ["km", "kilometers", "kilometres", "distance_km", "distance"]) {
    const v = b[k];
    const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
    if (Number.isFinite(n) && n >= 0 && STRIDE_M > 0) {
      return { steps: Math.round((n * 1000) / STRIDE_M) };
    }
  }
  return null;
}

export type DayEntry = { steps: number; updatedAt: string };

/** One stored day, tolerantly: the file backend keeps raw strings while the
    KV client auto-parses JSON responses into objects. Either shape must
    survive — a throw here silently drops the whole feed. */
export function parseDayEntry(v: unknown): DayEntry | null {
  try {
    const e = (typeof v === "string" ? JSON.parse(v) : v) as DayEntry;
    if (e && typeof e.steps === "number" && Number.isFinite(e.steps)) {
      return { steps: Math.max(0, Math.floor(e.steps)), updatedAt: typeof e.updatedAt === "string" ? e.updatedAt : new Date(0).toISOString() };
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
export async function saveDay(
  day: string,
  steps: number,
): Promise<{ persisted: boolean }> {
  const entry: DayEntry = { steps, updatedAt: new Date().toISOString() };
  if (hasKvStore()) {
    await store().hset(KV_HASH, { [day]: JSON.stringify(entry) });
    return { persisted: true };
  }
  const all = readFile();
  all[day] = entry;
  return { persisted: writeFile(all) };
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
};

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
