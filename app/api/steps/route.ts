import { NextResponse } from "next/server";
import { dayKey, normalizeReading, readSummary, recordAttempt, saveDay, stepsToKm } from "@/lib/steps";

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
 * Steps ingest. The phone macro (Health Connect → macro → webhook) POSTs
 * the day's count with `Authorization: Bearer <STEPS_WEBHOOK_SECRET>`.
 * Recommended macro body: {"steps": <count>}. Kilometres are derived
 * server-side from STEPS_STRIDE_M so the macro stays dumb.
 *
 * Every attempt is traced, including the ones that never reach storage —
 * a rejected POST writes nothing, so without a trace there is no way to
 * tell a macro that stopped firing from one that is firing and being
 * turned away. See recordAttempt(); that trace is temporary and goes
 * away with /api/steps/debug.
 */
export async function POST(req: Request) {
  const trace = (outcome: Parameters<typeof recordAttempt>[0]["outcome"], extra?: { steps?: number; date?: string }) =>
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
  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    await trace("bad-json");
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400, headers: NO_CACHE });
  }
  const reading = normalizeReading(body);
  if (!reading) {
    await trace("no-count");
    return NextResponse.json(
      { ok: false, error: "no step count found — send {\"steps\": <count>}" },
      { status: 422, headers: NO_CACHE },
    );
  }
  const date =
    body && typeof body === "object" && typeof (body as Record<string, unknown>).date === "string"
      ? String((body as Record<string, unknown>).date).slice(0, 10)
      : dayKey();
  const { persisted } = await saveDay(date, reading.steps);
  await trace("accepted", { steps: reading.steps, date });
  return NextResponse.json(
    {
      ok: true,
      date,
      steps: reading.steps,
      km: stepsToKm(reading.steps),
      persisted,
    },
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
