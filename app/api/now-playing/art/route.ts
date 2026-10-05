import { NextResponse } from "next/server";

/** Same-origin proxy for album art: canvas pixel reads would taint on Spotify's CDN. */
export async function GET(req: Request) {
  const u = new URL(req.url).searchParams.get("u");
  if (!u || !/^https:\/\/i\.scdn\.co\//.test(u)) {
    return new NextResponse(null, { status: 400 });
  }
  try {
    const res = await fetch(u);
    if (!res.ok || !res.body) return new NextResponse(null, { status: 502 });
    return new NextResponse(res.body, {
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
