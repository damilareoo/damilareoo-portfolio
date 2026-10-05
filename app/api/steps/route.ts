import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Steps stub. Returns unconfigured until the phone ingest pipeline
 * (POST with STEPS_INGEST_SECRET + a store) is wired — the tile
 * shows the field at rest meanwhile, exactly like the reference.
 */
export async function GET() {
  return NextResponse.json(
    { configured: false },
    { headers: { "Cache-Control": "no-store" } },
  );
}
