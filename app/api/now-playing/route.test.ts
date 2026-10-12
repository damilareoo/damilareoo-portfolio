import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/now-playing/route";

function jsonResponse(body: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

function envOn() {
  vi.stubEnv("SPOTIFY_CLIENT_ID", "id");
  vi.stubEnv("SPOTIFY_CLIENT_SECRET", "secret");
  vi.stubEnv("SPOTIFY_REFRESH_TOKEN", "refresh");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("now-playing", () => {
  it("returns the live track without touching recently-played", async () => {
    envOn();
    const fetchMock = vi.fn(async (url: string) =>
      String(url).includes("accounts.spotify.com")
        ? jsonResponse({ access_token: "tok" })
        : jsonResponse({ is_playing: true, progress_ms: 1000, item: { name: "Song", artists: [{ name: "A" }], external_urls: { spotify: "https://x" }, album: { images: [{ url: "https://i.scdn.co/art" }] }, duration_ms: 200000 } }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const res = await GET();
    const body = await res.json();
    expect(body.isPlaying).toBe(true);
    expect(body.title).toBe("Song");
    expect(body.lastPlayed).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("falls back to the last played track when the player is empty", async () => {
    envOn();
    const fetchMock = vi.fn(async (url: string) => {
      const u = String(url);
      if (u.includes("accounts.spotify.com")) return jsonResponse({ access_token: "tok" });
      if (u.includes("currently-playing")) return jsonResponse(null, 204);
      return jsonResponse({ items: [{ played_at: "2026-10-12T10:00:00Z", track: { name: "Old Song", artists: [{ name: "B" }], external_urls: { spotify: "https://y" }, album: { images: [{ url: "https://i.scdn.co/old" }] }, duration_ms: 180000 } }] });
    });
    vi.stubGlobal("fetch", fetchMock);
    const res = await GET();
    const body = await res.json();
    expect(body.isPlaying).toBe(false);
    expect(body.lastPlayed).toBe(true);
    expect(body.title).toBe("Old Song");
    expect(body.albumArt).toBe("https://i.scdn.co/old");
  });

  it("rests only when both endpoints are empty", async () => {
    envOn();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        const u = String(url);
        if (u.includes("accounts.spotify.com")) return jsonResponse({ access_token: "tok" });
        if (u.includes("currently-playing")) return jsonResponse(null, 204);
        return jsonResponse({ items: [] });
      }),
    );
    const body = await (await GET()).json();
    expect(body).toEqual({ isPlaying: false, reason: "nothing-found" });
  });

  it("rests without credentials and never calls Spotify", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const body = await (await GET()).json();
    expect(body).toEqual({ isPlaying: false, reason: "no-credentials" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
