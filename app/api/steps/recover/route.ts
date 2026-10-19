import { NextResponse } from "next/server";
import { forgetDay, readDayState, readSummary } from "@/lib/steps";

export const dynamic = "force-dynamic";

const NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
};

/**
 * RECOVERY for a day the store holds wrongly.
 *
 * Why this has to exist: HC Webhook sends only the records new since its last
 * successful sync, so the server is the only party that can hold a bad figure
 * and the only one that can repair it. No future delivery will fix a wrong
 * day — the phone has no reason to resend what it already counted as
 * delivered. Every merge rule protects the store going forward; only this
 * clears a day that is already wrong.
 *
 * It deletes and nothing else. There is deliberately no way to write a number
 * through this route, because every prior corruption came from exactly that:
 * a figure posted to check something, over a feed that had no way to push it
 * back. Recovery is therefore:
 *
 *   1. DELETE the day here (this route), then
 *   2. re-read the range in HC Webhook, which ignores the watermark and
 *      re-delivers every record in it. Those intervals land on an empty day
 *      and rebuild it correctly, idempotent by interval key.
 *
 * Step 2 is the only way a day's figure ever becomes right, and it has to come
 * from the phone. This route just clears the floor.
 *
 * GET reports which days are standing on a bare total and therefore cannot
 * heal on their own — a day backed by intervals is self-healing, because a
 * later delivery merges onto it correctly.
 */
function authed(req: Request): boolean {
  const secret = process.env.STEPS_WEBHOOK_SECRET;
  return Boolean(secret) && req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authed(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401, headers: NO_CACHE });
  }
  const { days, needsFullResync } = await readDayState();
  return NextResponse.json(
    {
      ok: true,
      days: Object.keys(days).sort(),
      needsFullResync,
      note: "A day in needsFullResync is standing on a single total. Re-read that range in HC Webhook to rebuild it from intervals.",
      summary: await readSummary(),
    },
    { headers: NO_CACHE },
  );
}

export async function DELETE(req: Request) {
  if (!authed(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401, headers: NO_CACHE });
  }
  const day = new URL(req.url).searchParams.get("day");
  if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    return NextResponse.json(
      { ok: false, error: 'pass ?day=YYYY-MM-DD (Lagos)' },
      { status: 400, headers: NO_CACHE },
    );
  }
  await forgetDay(day);
  return NextResponse.json(
    {
      ok: true,
      cleared: day,
      next: "Re-read that range in HC Webhook (explicit range ignores the watermark) to rebuild the day from intervals.",
      summary: await readSummary(),
    },
    { headers: NO_CACHE },
  );
}