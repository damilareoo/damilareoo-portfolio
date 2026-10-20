import React from "react";

import Pic from "./pic";

/**
 * A frame in the playground lab.
 *
 * Labs show the same shot at every scale: a 63-frame filmstrip, a two-up
 * vote, a full-bleed wipe at 1400px. The site's default `sizes` describes a
 * case-study column (840px at desktop), so reusing it in the labs told the
 * browser to fetch files smaller than the boxes they landed in — the frames
 * looked soft until opened fullscreen, exactly the earlier bug the wall had.
 *
 * `auto` lets the browser measure the rendered box, but it is only honoured
 * for lazy-loaded images; eager images and browsers without the keyword use
 * 100vw. Both err large rather than soft. The wall passes its own exact sizes
 * and is not affected; this is only for the lab's one-off layouts.
 */
const LabPic = React.forwardRef(function LabPic(
  { sizes = "auto", ...props }: React.ComponentPropsWithoutRef<typeof Pic>,
  ref: React.Ref<HTMLImageElement>,
) {
  return <Pic ref={ref} sizes={sizes} {...props} />;
});

LabPic.displayName = "LabPic";

export default LabPic;
