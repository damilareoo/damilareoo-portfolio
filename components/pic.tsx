/**
 * An image that serves WebP when the browser takes it, the original file
 * otherwise. Every static raster under /dossier ships a full-resolution
 * `.webp` companion (Pillow, quality 90, no downscale) plus narrower
 * `-480/-768/-1200/-1800` companions from scripts/make-responsive.py.
 *
 * The widths come from the generated manifest rather than being hardcoded,
 * because a srcSet entry pointing at a file that was never generated is a 404,
 * and an image whose every candidate 404s renders as nothing at all. The
 * generator refuses to upscale, so an image narrower than the smallest width
 * has no companions and must fall back to its single original. The manifest is
 * regenerated whenever the companions are, so it cannot drift from disk.
 *
 * This component is bundled for the browser, so it must not reach for node:fs
 * to check that itself — doing so fails the build. See pic-manifest.ts.
 */
import React from "react";
import { PIC_CANDIDATES, SHOT_SIZES } from "./pic-manifest";

export { PIC_WIDTHS, SHOT_SIZES, FILL_SIZES } from "./pic-manifest";
export type { PicWidth } from "./pic-manifest";

function stem(src: string): string {
  return src.replace(/\.[^/.]+$/, "");
}

/** Animated GIFs, vectors and remote URLs have no companions of ours. */
function isOpaque(src: string): boolean {
  return /\.(gif|svg|avif|webp)$/i.test(src) || !src.startsWith("/");
}

const Pic = React.forwardRef(function Pic(
  {
    src,
    alt = "",
    sizes = SHOT_SIZES,
    width,
    height,
    ...imgProps
  }: { src: string; alt?: string; sizes?: string } & React.ImgHTMLAttributes<HTMLImageElement>,
  ref: React.Ref<HTMLImageElement>,
) {
  const base = stem(src);
  /* Three ways to have nothing to choose between, and all three must fall
     through to the original alone:
       - a GIF/SVG/remote URL, which the generator never touches
       - a raster the manifest has no entry for
       - a raster narrow enough that no width was generated
     The manifest records the third case as an empty list, so `[]` and
     `undefined` have to be handled identically. Offering a `.webp` here
     regardless is what 404'd every animated cover on the site: no GIF has a
     WebP companion, and `<source type="image/webp">` on one makes the browser
     pick it and render nothing. */
  const widths = isOpaque(src) ? undefined : PIC_CANDIDATES[src];
  const hasCandidates = Array.isArray(widths) && widths.length > 0;

  if (!hasCandidates) {
    const plain = (
      <img ref={ref} src={src} alt={alt} width={width} height={height} decoding="async" {...imgProps} />
    );
    // A static raster narrower than the smallest generated width still has a
    // full-size WebP companion; only skip the <source> when one cannot exist.
    if (isOpaque(src)) return plain;
    return <picture>{plain}</picture>;
  }

  const origExt = src.split(".").pop();
  const webpSet = widths.map((w) => `${base}-${w}.webp ${w}w`).join(", ");
  const origSet = widths.map((w) => `${base}-${w}.${origExt} ${w}w`).join(", ");

  return (
    <picture>
      <source type="image/webp" srcSet={webpSet} sizes={sizes} />
      {/* The full-size original carries no width descriptor: it is the floor
          for a browser that ignored the WebP source, not a candidate to
          choose between. */}
      <img
        ref={ref}
        src={src}
        alt={alt}
        srcSet={`${origSet}, ${src} 9999w`}
        sizes={sizes}
        width={width}
        height={height}
        decoding="async"
        {...imgProps}
      />
    </picture>
  );
});

Pic.displayName = "Pic";

export default Pic;

/**
 * The WebP path for a static raster, for the places `<picture>` cannot go:
 * CSS `background-image`, `<video poster>`, and canvas `new Image()` sources.
 * Only raster extensions are rewritten, and only where a companion was
 * generated — rewriting `/badges/chelsea.svg` or a logo with no WebP would
 * 404 into a CSS background that silently renders nothing.
 */
export function webp(src: string): string {
  if (isOpaque(src)) return src;
  return `${stem(src)}.webp`;
}