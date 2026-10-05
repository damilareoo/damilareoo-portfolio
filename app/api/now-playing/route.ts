import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_URL = "https://api.spotify.com/v1/me/player/currently-playing";

const NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
};

async function getAccessToken() {
  const basic = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
  ).toString("base64");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: process.env.SPOTIFY_REFRESH_TOKEN ?? "",
    }),
  });

  return res.json() as Promise<{ access_token?: string }>;
}

export async function GET() {
  try {
    if (
      !process.env.SPOTIFY_CLIENT_ID ||
      !process.env.SPOTIFY_CLIENT_SECRET ||
      !process.env.SPOTIFY_REFRESH_TOKEN
    ) {
      return NextResponse.json({ isPlaying: false }, { headers: NO_CACHE });
    }

    const { access_token } = await getAccessToken();
    if (!access_token) {
      return NextResponse.json({ isPlaying: false }, { headers: NO_CACHE });
    }

    const res = await fetch(NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${access_token}` },
      cache: "no-store",
    });

    if (res.status === 204 || res.status >= 400) {
      return NextResponse.json({ isPlaying: false }, { headers: NO_CACHE });
    }

    const data = await res.json();
    if (!data?.item) {
      return NextResponse.json({ isPlaying: false }, { headers: NO_CACHE });
    }

    return NextResponse.json(
      {
        isPlaying: data.is_playing,
        title: data.item.name,
        artist: data.item.artists.map((a: { name: string }) => a.name).join(", "),
        songUrl: data.item.external_urls.spotify,
        albumArt: data.item.album.images[0]?.url ?? null,
        progress: data.progress_ms,
        duration: data.item.duration_ms,
      },
      { headers: NO_CACHE },
    );
  } catch {
    return NextResponse.json({ isPlaying: false }, { headers: NO_CACHE });
  }
}
