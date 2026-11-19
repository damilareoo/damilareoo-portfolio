"use client";

import { useEffect, useRef, useState } from "react";
import Pic from "./pic";
import { CASE_CORNERS, CASE_DIMENSIONS } from "./case-dimensions";

/**
 * One frame of a case-study run.
 *
 * Three things made the run feel heavy, and each is answered here:
 *
 * - Every frame was zero pixels tall until it decoded, so each lazy arrival
 *   shoved the page below it down mid-scroll. The frame now carries its own
 *   width and height (scripts/case-dimensions.py) and holds its box from the
 *   first paint.
 * - A frame appeared as a hard cut, often painting top-down as it decoded.
 *   It now develops in: hidden until fully decoded, then a short opacity and
 *   blur settle (`.frame-in` in globals.css). The blur is what makes it read
 *   as one image resolving rather than two states swapping.
 * - Every video autoplayed, so every clip on the page downloaded at once and
 *   competed with the stills for bandwidth. Below the lead, a clip now loads
 *   nothing until it is near the viewport and pauses when it leaves.
 *
 * The lead frame skips the develop: it is the largest paint on the page, and
 * fading it in would only delay the one thing the visitor came to see.
 */

export function CaseImage({
  src,
  alt,
  lead,
  className,
}: {
  src: string;
  alt: string;
  lead: boolean;
  className: string;
}) {
  const ref = useRef<HTMLImageElement>(null);
  const [developed, setDeveloped] = useState(lead);
  const develop = () => setDeveloped(true);
  const [w, h] = CASE_DIMENSIONS[src] ?? [];
  /* A plate exported with pre-rounded corners is scaled just enough that the
     white wedges fall outside the square frame (which clips). Twelve pixels
     of a 2248px plate: nothing of the design is lost, only the corners. */
  const trim = CASE_CORNERS[src];
  const zoom = trim && w && h ? Math.max(w / (w - 2 * trim), h / (h - 2 * trim)) : 0;

  useEffect(() => {
    const img = ref.current;
    if (!img || developed) return;
    /* A cached image can finish before hydration attaches onLoad, and then the
       event never fires. Decode first so the reveal never shows a half-painted
       frame. */
    if (img.complete && img.naturalWidth > 0) {
      img.decode().catch(() => {}).finally(() => setDeveloped(true));
    }
  }, [developed]);

  return (
    <Pic
      ref={ref}
      src={src}
      alt={alt}
      width={w}
      height={h}
      loading={lead ? "eager" : "lazy"}
      fetchPriority={lead ? "high" : undefined}
      decoding="async"
      onLoad={(e) => {
        if (developed) return;
        e.currentTarget.decode().catch(() => {}).finally(develop);
      }}
      onError={develop}
      data-developed={developed ? "" : undefined}
      style={zoom ? { transform: `scale(${zoom.toFixed(4)})` } : undefined}
      className={`${className} ${lead ? "" : "frame-in"}`}
    />
  );
}

export function CaseVideo({
  src,
  poster,
  alt,
  lead,
  className,
}: {
  src: string;
  poster?: string;
  alt: string;
  lead: boolean;
  className: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(lead);
  const visible = useRef(false);
  const [w, h] = CASE_DIMENSIONS[src] ?? [];

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    /* Two observers with two jobs: a wide margin starts the download early
       enough that the clip is ready by the time it scrolls in; the tight one
       plays and pauses on actual visibility, so off-screen clips cost nothing. */
    const load = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          load.disconnect();
        }
      },
      { rootMargin: "800px 0px" },
    );
    const play = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    load.observe(video);
    play.observe(video);
    return () => {
      load.disconnect();
      play.disconnect();
    };
  }, []);

  return (
    <video
      ref={ref}
      src={near ? src : undefined}
      poster={poster}
      width={w}
      height={h}
      autoPlay={lead}
      muted
      loop
      playsInline
      preload={near ? "auto" : "none"}
      aria-label={alt}
      /* The source attaches after the visibility check may already have run,
         so a clip that is on screen when it becomes playable starts itself. */
      onCanPlay={(e) => {
        if (visible.current) e.currentTarget.play().catch(() => {});
      }}
      className={className}
    />
  );
}
