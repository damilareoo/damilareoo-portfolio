import { NextResponse } from "next/server";
import { dayKey, normalizeReading, readSummary, saveDay, stepsToKm } from "@/lib/steps";

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
      { ok: false, error: "no step count found — send {\"steps\": <count>}" },
      { status: 422, headers: NO_CACHE },
    );
  }
  const date =
    body && typeof body === "object" && typeof (body as Record<string, unknown>).date === "string"
      ? String((body as Record<string, unknown>).date).slice(0, 10)
      : dayKey();
  const { persisted } = await saveDay(date, reading.steps);
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
