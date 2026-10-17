/**
 * An image that serves WebP when the browser takes it, the original file
 * otherwise. Every static raster under /dossier ships a full-resolution
 * `.webp` companion (Pillow, quality 90, no downscale — nothing loses
 * crispness on retina or large breakpoints). Animated GIFs have no
 * companion and fall straight through to the original, so a cover stays
 * animated and no request ever 404s. A forwarded ref lands on the inner
 * `img` so components that measure or track it keep working. The immutable
 * /dossier cache header (next.config.ts) covers the WebP too, so a second
 * visit revalidates nothing.
 */
import React from "react";

const Pic = React.forwardRef(function Pic(
  { src, alt = "", ...imgProps }: { src: string; alt?: string } & React.ImgHTMLAttributes<HTMLImageElement>,
  ref: React.Ref<HTMLImageElement>,
) {
  const isGif = src.toLowerCase().endsWith(".gif");
  // Companions sit next to the original with the extension swapped (jpg→webp),
  // never appended (`dami.jpg` → `dami.webp`, not `dami.jpg.webp`).
  const webpSrc = isGif ? "" : src.replace(/\.[^/.]+$/, ".webp");
  return (
    <picture>
      {webpSrc && (
        <source srcSet={webpSrc} type="image/webp" />
      )}
      <img ref={ref} src={src} alt={alt} {...imgProps} />
    </picture>
  );
});

Pic.displayName = "Pic";

export default Pic;
