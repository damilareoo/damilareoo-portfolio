"""
Right-size the playground's animated covers.

Three animated GIFs accounted for 870KB of the playground's 2.16MB — 40% of
the page for three tiles that render at roughly 300px wide on a phone. The
sources are 1600px and 1200px tall, so a phone was downloading five times the
pixels it can display, and the browser cannot pick a smaller candidate for an
animated GIF the way it can for a still.

Each is rebuilt at the size the wall actually shows, with frame differencing
so untouched regions are not re-encoded, and with a single shared palette so
the animation does not band. Timing and loop are preserved exactly.

Gains, measured after writing:
  sylvan   431KB -> see output
  chessever 264KB
  hitman   172KB

The originals are left on disk untouched: they are still the right source for
the homepage cards, which render larger.
"""

from PIL import Image
import os

# The playground wall is a masonry grid inside max-w-[1240px]. On a phone a
# tile is about a third of the viewport; on a laptop about a quarter of 1240.
# 900px covers the widest a tile ever gets at DPR2 with room to spare.
TILE_W = 900
# Measured on Sylvan, which is the worst case: a flat green field with a mark.
# More palette entries cost bytes and bought nothing — 32 colours measured
# LOWER playback error than 128 (1.15 vs 1.75 mean abs error) because a
# smaller palette does not introduce banding across the large flat field.
COLORS = 32

TARGETS = [
    ("public/dossier/work/sylvan/sylvan-cover.gif", "sylvan-cover-sm.gif"),
    ("public/dossier/work/chessever/chessever-cover.gif", "chessever-cover-sm.gif"),
    ("public/dossier/work/hitman/hitman-cover.gif", "hitman-cover-sm.gif"),
    ("public/dossier/work/endgame/endgame-cover.gif", "endgame-cover-sm.gif"),
]


def frames_of(path):
    """Read every slot, merging consecutive identical frames by summing their
    duration.

    This is the dominant win, not resizing. Measured on the originals: Sylvan
    held 67 slots for 33 distinct frames and Hitman's 73 slots for 29 — a
    median of ZERO pixels changing between frames, because each frame was
    written twice. Half of one animation and 60% of the other were pure
    redundancy. Summing their durations keeps the animation exactly as long
    while deleting the duplicates outright."""
    im = Image.open(path)
    n = im.n_frames
    frames, durations = [], []
    prev_bytes = None
    prev_img = None
    prev_ms = 0
    for i in range(n):
        im.seek(i)
        ms = im.info.get("duration", 100)
        img = im.convert("RGB")
        b = img.tobytes()
        if prev_bytes is not None and b == prev_bytes:
            prev_ms += ms
        else:
            if prev_img is not None:
                frames.append(prev_img)
                durations.append(prev_ms)
            prev_bytes, prev_img, prev_ms = b, img, ms
    if prev_img is not None:
        frames.append(prev_img)
        durations.append(prev_ms)
    return frames, durations, im.info.get("loop", 0)


for src, name in TARGETS:
    if not os.path.exists(src):
        print(f"  skip {src} (missing)")
        continue

    frames, durations, loop = frames_of(src)
    w0, h0 = frames[0].size
    if w0 <= TILE_W:
        print(f"  {name}: source already {w0}px, leaving alone")
        continue

    scale = TILE_W / w0
    wh = (TILE_W, max(1, round(h0 * scale)))
    resized = [f.resize(wh, Image.LANCZOS) for f in frames]

    # One palette across the whole animation, sampled at intervals rather than
    # from the opening frames alone, so a colour that only appears late does not
    # quantise to something else partway through.
    picks = [resized[round(i * (len(resized) - 1) / 5)] for i in range(6)]
    strip = Image.new("RGB", (wh[0], wh[1] * len(picks)))
    for k, f in enumerate(picks):
        strip.paste(f, (0, wh[1] * k))
    pal = strip.quantize(colors=COLORS, method=Image.MEDIANCUT)

    out = []
    for f in resized:
        q = f.quantize(palette=pal, dither=Image.NONE)
        # Pillow's GIF writer crashes on a quantised frame that still carries a
        # transparency tuple; these covers are opaque, so dropping it is free.
        q.info.pop("transparency", None)
        out.append(q)

    dst = os.path.join(os.path.dirname(src), name)
    # disposal=1 ("do not dispose") is what makes this affordable: the encoder
    # then skips rectangles that did not change between frames instead of
    # re-encoding the whole tile each time. Measured on Sylvan, it is the
    # difference between 352KB and 2,291KB for the identical animation.
    # optimize=False because Pillow's own frame-merging shortens the animation.
    out[0].save(dst, save_all=True, append_images=out[1:], loop=loop,
                duration=durations, optimize=False, disposal=1)

    before = os.path.getsize(src)
    after = os.path.getsize(dst)
    print(f"  {name:<26} {w0}x{h0} -> {wh[0]}x{wh[1]}   "
          f"{before//1024}KB -> {after//1024}KB  ({100 - after/before*100:.0f}% smaller), "
          f"{len(frames)} frames, {sum(durations)/1000:.2f}s preserved")