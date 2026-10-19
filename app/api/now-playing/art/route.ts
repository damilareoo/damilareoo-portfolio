import { NextResponse } from "next/server";

/**
 * Same-origin proxy for album art.
 *
 * Two reasons it exists rather than a direct `<image href>` to Spotify:
 *
 *  - Spotify's CDN URLs are opaque. The leading token is a size, but swapping
 *    it for another documented size 404s, so the API's exact URL is the only
 *    one that resolves and the tile cannot ask for a smaller image itself.
 *  - The tile never draws art to a canvas (nothing on the site calls
 *    drawImage with album art), so this is not about canvas tainting.
 *
 * What the proxy does buy is caching. Spotify's own cache headers are passed
 * through, which is what lets a returning visitor skip Spotify entirely, and
 * the response is tagged immutable because the URL — and therefore the bytes
 * behind it — never change for a given track. A transient Spotify failure
 * falls back to the tile's bare record rather than a broken image.
 */
export async function GET(req: Request) {
  const u = new URL(req.url).searchParams.get("u");
  if (!u || !/^https:\/\/i\.scdn\.co\/image\/[a-z0-9]+$/i.test(u)) {
    return new NextResponse(null, { status: 400 });
  }
  try {
    const res = await fetch(u, { next: { revalidate: 60 * 60 * 24 * 7 } });
    if (!res.ok || !res.body) return new NextResponse(null, { status: 502 });
    const spotifyCache = res.headers.get("Cache-Control");
    return new NextResponse(res.body, {
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "image/jpeg",
        // Honour Spotify's own freshness when it sends one; otherwise cache
        // hard, since a track's art does not change under a fixed URL.
        "Cache-Control": spotifyCache ?? "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}