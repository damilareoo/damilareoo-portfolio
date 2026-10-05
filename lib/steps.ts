import { kv } from "@vercel/kv";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export const STRIDE_M = Number(process.env.STEPS_STRIDE_M ?? 0.762) || 0.762;

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

function hasKvStore(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function filePath(): string {
  if (process.env.STEPS_FILE) return process.env.STEPS_FILE;
  if (process.env.VERCEL) return join("/tmp", "steps.json");
  return join(process.cwd(), "data", "steps.local.json");
}

function readFile(): Record<string, DayEntry> {
  try {
    const p = filePath();
    if (!existsSync(p)) return {};
    return JSON.parse(readFileSync(p, "utf8")) as Record<string, DayEntry>;
  } catch {
    return {};
  }
}

function writeFile(all: Record<string, DayEntry>): boolean {
  try {
    const p = filePath();
    mkdirSync(dirname(p), { recursive: true });
    const keys = Object.keys(all).sort().slice(-60);
    const pruned: Record<string, DayEntry> = {};
    for (const k of keys) pruned[k] = all[k];
    writeFileSync(p, JSON.stringify(pruned));
    return true;
  } catch {
    return false;
  }
}

/**
 * The store is KV when connected, a small JSON file otherwise (local dev,
 * or prod before the store is attached). The file backend keeps the Test
 * Webhook button green end to end; KV makes it survive restarts.
 */
export async function saveDay(
  day: string,
  steps: number,
): Promise<{ persisted: boolean }> {
  const entry: DayEntry = { steps, updatedAt: new Date().toISOString() };
  if (hasKvStore()) {
    await kv.hset("steps:days", { [day]: JSON.stringify(entry) });
    return { persisted: true };
  }
  const all = readFile();
  all[day] = entry;
  return { persisted: writeFile(all) };
}

export async function readDays(): Promise<Record<string, DayEntry>> {
  if (hasKvStore()) {
    const raw = await kv.hgetall<Record<string, string>>("steps:days");
    const out: Record<string, DayEntry> = {};
    if (raw) {
      for (const [k, v] of Object.entries(raw)) {
        try {
          out[k] = JSON.parse(v) as DayEntry;
        } catch {
          /* skip a bad row, keep the rest */
        }
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
