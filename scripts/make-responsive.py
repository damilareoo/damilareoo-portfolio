"""
Generate responsive width companions for every dossier raster.

Why this exists: every image was served at one fixed size. Measured on a
390px phone at DPR 3, a case-study shot renders at 350 CSS px and needs
~1050 device px, but the file on disk is 2248px wide — 2.1x more pixels than
the screen can resolve, on every page view. Companions let the browser pick a
candidate that fits the layout instead of always taking the largest.

Two rules this script must not break, both learned the hard way:

  1. Never advertise a width that has no file. `components/pic.tsx` builds its
     srcSet from a fixed list, so every image narrower than the largest width
     would otherwise reference four URLs that 404 — which is what broke
     images on localhost. The generator skips `t >= w` (never upscales), so
     the component must too, and `pic.tsx` reads this list at build time
     rather than assuming it.

  2. Never feed the generator its own output. Globbing `*.jpg` picks up the
     `-480.jpg` companions from the previous run, which then get companions of
     their own, and the tree grows every run. Sources are matched by excluding
     the `-<width>` suffix.

Encoding is unchanged (quality 90, as already shipped): the existing WebP
measures 0.31 mean absolute error against its source, far below the ~2.0
where loss becomes visible. Sharpness was never the encoder's fault — the
absence of candidates was.
"""

from PIL import Image
import os
import json
import re
import glob

QUALITY = 90
# Halving past 1200 wastes bytes nobody can resolve; 1800 covers a 840px
# column at DPR 2, which is the widest this site's shot layout gets.
WIDTHS = [480, 768, 1200, 1800]

# A generated companion ends in -<width>. Anything matching is output, not input.
GENERATED = re.compile(r"-(480|768|1200|1800)$")


def is_generated(path: str) -> bool:
    stem = os.path.splitext(os.path.basename(path))[0]
    return bool(GENERATED.search(stem))


sources = []
for ext in ("png", "jpg", "jpeg"):
    for f in glob.glob(f"public/dossier/**/*.{ext}", recursive=True):
        if not is_generated(f):
            sources.append(f)
sources.sort()

made = skipped = 0
for f in sources:
    try:
        im = Image.open(f)
        w, _ = im.size
    except Exception:
        continue

    base = os.path.splitext(f)[0]
    ext = f.rsplit(".", 1)[1].lower()
    has_alpha = im.mode in ("RGBA", "LA")

    # Only widths strictly smaller than the source. This is the set the
    # component is allowed to advertise, and it is why pic.tsx must not
    # hardcode the list.
    for tw in WIDTHS:
        if tw >= w:
            continue

        webp = f"{base}-{tw}.webp"
        if not (os.path.exists(webp) and os.path.getmtime(webp) >= os.path.getmtime(f)):
            out = im.resize((tw, max(1, round(im.size[1] * tw / w))), Image.LANCZOS)
            out.save(webp, "WEBP", quality=QUALITY, method=5)
            made += 1
        else:
            skipped += 1

        # A browser that ignores the WebP source still benefits from a
        # right-sized original rather than the full-size file.
        orig = f"{base}-{tw}.{ext}"
        if not (os.path.exists(orig) and os.path.getmtime(orig) >= os.path.getmtime(f)):
            out = im.resize((tw, max(1, round(im.size[1] * tw / w))), Image.LANCZOS)
            if ext == "png":
                out.save(orig, "PNG", optimize=True)
            else:
                out.convert("RGB").save(orig, "JPEG", quality=88, optimize=True,
                                       progressive=True, subsampling=0)
            made += 1

    # The full-size companion: no width suffix, no downscale. pic.tsx offers
    # it as the srcSet ceiling so a wide 2x box falls back to the source
    # instead of upscaling the largest generated width.
    full = f"{base}.webp"
    if not (os.path.exists(full) and os.path.getmtime(full) >= os.path.getmtime(f)):
        im.save(full, "WEBP", quality=QUALITY, method=5)
        made += 1

print(f"sources (generated files excluded): {len(sources)}")
print(f"companions written: {made}   already current: {skipped}")

# Publish what was written. components/pic.tsx cannot check the filesystem —
# it is bundled for the browser, and reaching for node:fs there fails the
# build — so the list of real candidates has to be a build-time fact instead of
# an assumption. Regenerated on every run, so it cannot drift from disk.
manifest = {}
fulls = {}
for f in sources:
    try:
        w = Image.open(f).size[0]
    except Exception:
        continue
    base = os.path.splitext(f)[0]
    ext = f.rsplit(".", 1)[1]
    widths = [
        t for t in WIDTHS
        if t < w and os.path.exists(f"{base}-{t}.webp") and os.path.exists(f"{base}-{t}.{ext}")
    ]
    key = "/" + f[len("public/"):]
    manifest[key] = widths
    # The companion is generated from the source with no downscale, so the
    # source width is the honest descriptor. (Reading the WebP instead once
    # shipped a stale, 1920-wide companion as the width of a 1600-wide JPG;
    # the fallback then lied about its own pixels.)
    if os.path.exists(f"{base}.webp"):
        fulls[key] = w

MANIFEST = "components/pic-manifest.ts"
lines = [
    "/**",
    " * Which width companions exist for each dossier raster, as a build-time fact.",
    " *",
    " * GENERATED by scripts/make-responsive.py — do not edit by hand.",
    " *",
    " * It exists because a srcSet entry pointing at a file that was never",
    " * generated is a 404, and an image whose every candidate 404s renders as",
    " * nothing at all. `components/pic.tsx` cannot check the filesystem itself:",
    " * it is bundled for the browser, and reaching for node:fs there fails the",
    " * build outright.",
    " */",
    "",
    "export const PIC_WIDTHS = [480, 768, 1200, 1800] as const;",
    "",
    "export type PicWidth = (typeof PIC_WIDTHS)[number];",
    "",
    "/** src -> the widths generated for it. An empty list means no companions:",
    "    the source is narrower than the smallest width, or is a GIF or SVG, and",
    "    the original is served on its own. */",
    "export const PIC_CANDIDATES: Record<string, readonly number[]> = {",
]
for key in sorted(manifest):
    widths = ", ".join(str(x) for x in manifest[key])
    lines.append(f"  {json.dumps(key)}: [{widths}],")
lines += [
    "};",
    "",
    "/** src -> the source raster's width. The full-size WebP companion (no",
    "    width suffix) is generated from that source without downscale, so this",
    "    is both the ceiling and the honest descriptor for the original",
    "    fallback. `Pic` adds it only where the file is real, because a",
    "    candidate that 404s can leave the frame empty, and a fake descriptor",
    "    shrinks the intrinsic box of any `w-auto` image (the viewer). */",
    "export const PIC_FULL: Record<string, number> = {",
]
for key in sorted(fulls):
    if fulls[key]:
        lines.append(f"  {json.dumps(key)}: {fulls[key]},")
lines += [
    "};",
    "",
    "/**",
    " * `sizes` for the layouts that use `Pic`, measured rather than assumed.",
    " * A work page wraps its gallery in `max-w-[880px] px-5`, so the shot column",
    " * is 840px on a laptop; below that it is the viewport minus the same",
    " * padding. Overstating this makes every phone take the largest candidate",
    " * and hands back all of the saving.",
    " */",
    'export const SHOT_SIZES =',
    '  "(min-width: 1280px) 840px, (min-width: 640px) calc(100vw - 40px), calc(100vw - 40px)";',
    "",
    "/** For tiles that fill their grid cell at any width. */",
    'export const FILL_SIZES = "100vw";',
    "",
]
with open(MANIFEST, "w") as fh:
    fh.write("\n".join(lines))
print(f"wrote {MANIFEST}  ({len(manifest)} sources listed)")