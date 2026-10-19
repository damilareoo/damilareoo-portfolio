import { NextResponse } from "next/server";
import { readLastAttempt, readSummary } from "@/lib/steps";

export const dynamic = "force-dynamic";

const NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
};

/**
 * TEMPORARY. Why the steps feed went quiet without any visible symptom.
 *
 * The reading itself cannot answer it: a successful POST writes a day and
 * moves `updatedAt`, but every other outcome writes nothing at all. So a
 * macro that stopped firing and a macro that is firing and being rejected
 * look identical from the widget. This reports the last attempt whatever
 * its outcome, which separates them.
 *
 * Read it like this:
 *   lastAttempt.at is null            → nothing has ever arrived. The macro
 *                                       is not posting: trigger, permission,
 *                                       or the URL is unreachable.
 *   lastAttempt.at keeps moving       → it is posting. Then outcome tells
 *                                       you which layer failed.
 *   lastAttempt.at is frozen          → it fired at some point and stopped.
 *                                       Compare `at` against your last
 *                                       known-good reading.
 *
 *   unauthorized → the bearer no longer matches STEPS_WEBHOOK_SECRET
 *   bad-json     → body is not being sent as JSON
 *   no-count     → JSON parsed, but no step count inside it. `keys` lists the
 *                  top-level field names and `raw` carries the first 4 KB,
 *                  which is what makes an unreadable shape readable rather
 *                  than a guess. Both are present only on a failed attempt:
 *                  a delivery that produced a reading has nothing left to
 *                  diagnose and is never stored raw.
 *   accepted     → it is working; if the widget still looks old, the tile
 *                  is the problem rather than the feed
 *
 * Bearer-protected with the same secret as the ingest, because the trace
 * carries a caller address. Delete this route and the recordAttempt block
 * in lib/steps.ts once the feed is healthy.
 */
export async function GET(req: Request) {
  const secret = process.env.STEPS_WEBHOOK_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401, headers: NO_CACHE });
  }
  try {
    const [lastAttempt, summary] = await Promise.all([readLastAttempt(), readSummary()]);
    return NextResponse.json(
      {
        now: new Date().toISOString(),
        lagosDay: new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date()),
        lastAttempt,
        summary,
      },
      { headers: NO_CACHE },
    );
  } catch {
    return NextResponse.json({ ok: false, error: "read failed" }, { status: 500, headers: NO_CACHE });
  }
}
