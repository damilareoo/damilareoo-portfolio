"use client";

import { useEffect, useState } from "react";

type Track = { title?: string; artist?: string; isPlaying?: boolean };

/** Shares the music tile's cache key, so the footer reads what the tile
    already fetched instead of asking Spotify twice. */
const KEY = "damilareoo-now-playing-v1";

/**
 * "Built with love and music" — with the music named. While something is
 * playing it says so; otherwise it names the last thing played; with no
 * feed at all (no credentials, offline) it is just the sentence.
 */
export function NowLine() {
  const [track, setTrack] = useState<Track | null>(null);

  useEffect(() => {
    let dead = false;
    try {
      const cached = localStorage.getItem(KEY);
      if (cached) {
        const t = JSON.parse(cached) as Track;
        // Applied a tick later, so the first paint matches the server's.
        if (t.title) queueMicrotask(() => !dead && setTrack(t));
      }
    } catch {
      /* private mode: straight to the network */
    }
    fetch("/api/now-playing", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((t: Track | null) => {
        if (!dead && t?.title) setTrack(t);
      })
      .catch(() => {});
    return () => {
      dead = true;
    };
  }, []);

  return (
    <span className="min-w-0">
      Built with love and music
      {track?.title && (
        <span className="text-ink-3">
          {" · "}
          {track.isPlaying ? "now" : "last"}: <span className="text-ink-2">{track.title}</span>
          {track.artist && <> — {track.artist}</>}
        </span>
      )}
    </span>
  );
}
