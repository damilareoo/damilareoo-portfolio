import { NextResponse } from "next/server";
import {
  isPlausibleDay,
  MAX_DAY_STEPS,
  normalizeReading,
  readSummary,
  saveDay,
  stepsToKm,
  sumBuckets,
} from "@/lib/steps";

export const dynamic = "force-dynamic";

const NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
};

function authorized(req: Request): boolean {
  const secret = process.env.STEPS_WEBHOOK_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * Steps ingest, `Authorization: Bearer <STEPS_WEBHOOK_SECRET>`.
 *
 * Two payload shapes arrive here, and lib/steps.ts folds both into step
 * intervals bucketed by Lagos day:
 *
 *   A relay app (HC Webhook) — `{ steps: [{count, start_time, end_time}] }`.
 *     Records streamed rather than a figure. It sends only what changed
 *     since its last successful sync, across a rolling 48-hour window, so a
 *     payload is an increment rather than a day total and one payload can
 *     touch two days. Intervals accumulate onto whatever is stored.
 *
 *   A macro template (MacroDroid) — `{ steps: <count> }`. One whole-day
 *     figure. It cannot be decomposed into intervals, so it replaces the day
 *     outright, in either direction: a total written after intervals and a
 *     relay sync after a total each supersede rather than add.
 *
 * Kilometres are derived server-side from STEPS_STRIDE_M so the phone stays
 * dumb about distance.
 *
 * Every rejection returns a specific status so the sender's own log says what
 * went wrong: 401 for a bad bearer, 400 for a body that is not JSON, 422 for
 * JSON carrying no count in either shape above. All three tell the caller to
 * stop retrying something that will never succeed.
 */
export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401, headers: NO_CACHE });
  }

  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400, headers: NO_CACHE });
  }

  const reading = normalizeReading(body);
  if (!reading) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'no step count found — send {"steps": <count>}, {"km": <distance>}, or {"steps": [{"count", "start_time", "end_time"}]}',
      },
      { status: 422, headers: NO_CACHE },
    );
  }

  /* Refuse an impossible day rather than store it. A relay streams intervals
     and never resends them, so a figure that should never have been written
     cannot be walked back by waiting — the steps behind it are gone for good.
     Rejecting loudly at least leaves the last good reading on the tile. */
  for (const [day, buckets] of Object.entries(reading.days)) {
    const steps = sumBuckets(buckets);
    if (!isPlausibleDay(steps)) {
      return NextResponse.json(
        { ok: false, error: `implausible step count for ${day}: ${steps} (max ${MAX_DAY_STEPS})`, refused: true },
        { status: 422, headers: NO_CACHE },
      );
    }
  }

  const { persisted, totals } = await saveDay(reading.days);
  const dates = Object.keys(totals).sort();
  const day = dates[dates.length - 1] ?? "";
  const steps = totals[day] ?? 0;
  return NextResponse.json(
    // `steps` is the day total after merging, not the increment this payload
    // carried — this body is what a relay shows in its delivery log, and an
    // increment there reads as though the day only rose by that much.
    { ok: true, date: day, dates, steps, km: stepsToKm(steps), stored: totals, persisted },
    { headers: NO_CACHE },
  );
}

export async function GET() {
  try {
    const summary = await readSummary();
    return NextResponse.json(summary, { headers: NO_CACHE });
  } catch {
    return NextResponse.json({ configured: false }, { headers: NO_CACHE });
  }
}