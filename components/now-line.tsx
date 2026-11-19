"use client";

import { useEffect, useState } from "react";

type Track = { title?: string; artist?: string; isPlaying?: boolean };

/** Shares the music tile's cache key, so the footer reads what the tile
    already fetched instead of asking Spotify twice. */
const KEY = "damilareoo-now-playing-v1";

/** The current or last track, from the music tile's cache first and then
    the feed. Null until anything is known, or when there is no feed. */
export function useNowPlaying(): Track | null {
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

  return track;
}
