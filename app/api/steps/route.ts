import { NextResponse } from "next/server";
import {
  normalizeReading,
  readSummary,
  RAW_CAPTURE_LIMIT,
  recordAttempt,
  saveDay,
  stepsToKm,
  topLevelKeys,
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
 *   HC Webhook — `{ steps: [{count, start_time, end_time}, ...], ... }`.
 *     A relay app streaming records. It sends only what changed since its
 *     last successful sync, across a rolling 48-hour window, so a payload
 *     is an increment rather than a day total and one payload can touch two
 *     days. Intervals accumulate onto whatever is already stored.
 *
 *   A macro template (MacroDroid) — `{ steps: <count> }`. One whole-day
 *     figure. It cannot be decomposed into intervals, so it replaces the day
 *     outright.
 *
 * Kilometres are derived server-side from STEPS_STRIDE_M so the phone stays
 * dumb about distance.
 *
 * Every attempt is traced, including the ones that never reach storage — a
 * rejected POST writes nothing, so without a trace there is no way to tell a
 * relay that stopped firing from one that is firing and being turned away.
 * See recordAttempt(); that trace is temporary and goes away with
 * /api/steps/debug.
 */
export async function POST(req: Request) {
  const trace = (
    outcome: Parameters<typeof recordAttempt>[0]["outcome"],
    extra?: Partial<Parameters<typeof recordAttempt>[0]>,
  ) =>
    recordAttempt({
      outcome,
      ua: req.headers.get("user-agent"),
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      ...extra,
    });

  if (!authorized(req)) {
    await trace("unauthorized");
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401, headers: NO_CACHE });
  }

  /* Read once, as text. Parsing by hand rather than via req.json() is what
     lets an unreadable body be captured instead of discarded — and the shape
     of that body is the entire reason a delivery gets turned away. */
  let raw = "";
  try {
    raw = await req.text();
  } catch {
    await trace("bad-json", { rawLen: 0 });
    return NextResponse.json({ ok: false, error: "body could not be read" }, { status: 400, headers: NO_CACHE });
  }

  let body: unknown = null;
  try {
    body = JSON.parse(raw);
  } catch {
    await trace("bad-json", { raw: raw.slice(0, RAW_CAPTURE_LIMIT), rawLen: raw.length });
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400, headers: NO_CACHE });
  }

  const reading = normalizeReading(body);
  if (!reading) {
    await trace("no-count", {
      raw: raw.slice(0, RAW_CAPTURE_LIMIT),
      rawLen: raw.length,
      keys: topLevelKeys(body),
    });
    return NextResponse.json(
      { ok: false, error: "no step count found — send {\"steps\": <count>} or {\"steps\":[{\"count\",\"start_time\",\"end_time\"}]}" },
      { status: 422, headers: NO_CACHE },
    );
  }

  const { persisted, totals } = await saveDay(reading.days);
  const dates = Object.keys(totals).sort();
  const day = dates[dates.length - 1] ?? "";
  const steps = totals[day] ?? 0;
  await trace("accepted", { steps, date: day });
  return NextResponse.json(
    // `steps` is the day total after merging, not the increment this payload
    // carried — this body is what a relay shows in its delivery log, and an
    // increment there reads as though the day only went up by that much.
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