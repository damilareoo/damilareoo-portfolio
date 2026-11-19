"use client";

import { useRef, useState } from "react";

/**
 * A work cover that opens a window onto the work on hover.
 *
 * The cover is the brand; the clip is the product. On a pointer that can
 * hover, resting on a cover plays a short muted loop of the real interface
 * over it, and leaving settles back to the cover. Nothing loads until the
 * first hover: `preload="none"` with no src until then, so the home page
 * pays for none of it on arrival. The clip only shows once it is actually
 * playing, so a slow network never swaps the cover for a black frame.
 *
 * Touch devices never see it: a tap is a navigation, not a hover, and the
 * clip would only flash on the way out.
 */
export function CoverPeek({
  clip,
  children,
}: {
  clip?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [armed, setArmed] = useState(false);
  const [showing, setShowing] = useState(false);

  if (!clip) return <>{children}</>;

  const enter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    setArmed(true);
    const v = ref.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  };
  const leave = () => {
    setShowing(false);
    ref.current?.pause();
  };

  return (
    <div className="relative" onPointerEnter={enter} onPointerLeave={leave}>
      {children}
      {armed && (
        <video
          ref={ref}
          src={clip}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          aria-hidden
          onPlaying={() => setShowing(true)}
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ease-out motion-reduce:hidden ${
            showing ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
