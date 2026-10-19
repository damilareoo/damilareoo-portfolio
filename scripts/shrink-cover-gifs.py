"""
Right-size the animated covers.

Original problem: three animated GIFs were 867KB of the playground's 2.16MB -
40% of the page for three tiles that render at roughly 300px wide on a phone.
The sources are 1600px, so a phone was downloading five times the pixels it
could display, and the browser cannot pick a smaller candidate for an animated
GIF the way it can for a still.

Second problem, which the owner caught: re-encoding the shrunk versions as GIF
shifted their colours. A GIF cannot hold more than 256 colours, and the
re-encode had to build a fresh colour table from scratch, so a rich animation
such as Endgame - 107 distinct colours in its opening frame - came out visibly
different from the original on the homepage.

Two fixes, in order of importance:

  Animated WebP instead of GIF. WebP carries 24-bit colour, so there is no
  colour table to lose. Measured on Endgame at 900px: WebP q80 is 299KB at
  1.28 mean absolute error, where the best GIF was 404KB at 2.33. Smaller AND
  more faithful, on the same animation, with every frame count and duration
  preserved.

  Quality chosen per file, by measurement. The earlier version used one
  palette size for every file - 32 colours, tuned on Sylvan's flat green
  field. It looked fine on the file it was tuned against and quietly spoiled
  the others. Now each file is encoded at a range of qualities and the
  smallest one that lands under TOLERANCE is kept.

Two size wins that are not about the codec at all:

  Duplicate frames are merged by summing their durations. Measured on the
  originals: Sylvan held 67 slots for 33 distinct frames and Hitman's 73 for
  29 - a median of ZERO pixels changing between frames, because each frame had
  been written twice. Timing is preserved exactly.

  The frames are rebuilt at the width the wall actually shows. 900px covers
  the widest a tile ever gets at DPR2 with room to spare; the 1600px sources
  were five times the pixels of a phone tile.

The GIF originals are left on disk untouched: they are still the source of
truth, and the homepage cards render much larger than the wall.
"""

from PIL import Image, ImageChops
import io
import os

# The playground wall is a masonry grid inside max-w-[1240px]. On a phone a
# tile is about a third of the viewport; on a laptop about a quarter of 1240.
TILE_W = 900

# Mean absolute error, out of 255, at the size the card actually renders.
# Under 1.0 is indistinguishable from the original without a diff tool; under
# 1.5 survives a side-by-side. The palettised GIFs sat at 2.3-2.5, which is
# what the owner spotted by eye.
TOLERANCE = 1.0

QUALITY_CHOICES = (70, 76, 82, 88, 92)

TARGETS = [
    ("public/dossier/work/sylvan/sylvan-cover.gif", "sylvan-cover-sm.webp"),
    ("public/dossier/work/chessever/chessever-cover.gif", "chessever-cover-sm.webp"),
    ("public/dossier/work/hitman/hitman-cover.gif", "hitman-cover-sm.webp"),
    ("public/dossier/work/endgame/endgame-cover.gif", "endgame-cover-sm.webp"),
]


def read_frames(path):
    """Read every slot, merging consecutive byte-identical frames by summing
    their duration, so the animation stays exactly as long."""
    im = Image.open(path)
    frames, durations = [], []
    prev_bytes = None
    prev_img = None
    prev_ms = 0
    for i in range(im.n_frames):
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


def encode(frames, durations, loop, quality):
    buf = io.BytesIO()
    # method=2 keeps this fast enough to run on every cover; the slower methods
    # buy single-digit percentages for minutes of CPU.
    frames[0].save(
        buf,
        "WEBP",
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=loop,
        quality=quality,
        method=2,
    )
    return buf.getvalue()


def error(data, reference):
    """Mean and worst absolute error at display size.

    Decoded frame against the original downscaled to the same size, so the
    number describes what a person sees rather than what a pixel-peeper
    measuring at 1600px would see.
    """
    probe = Image.open(io.BytesIO(data))
    step = max(1, probe.n_frames // 5)
    means, worst = [], 0
    for i in range(0, probe.n_frames, step):
        probe.seek(i)
        d = ImageChops.difference(reference[i], probe.convert("RGB")).convert("L")
        px = list(d.getdata())
        means.append(sum(px) / len(px))
        worst = max(worst, max(px))
    return sum(means) / len(means), worst


total_before = 0
total_after = 0

for src, name in TARGETS:
    if not os.path.exists(src):
        print(f"  skip {src} (missing)")
        continue

    frames, durations, loop = read_frames(src)
    w0, h0 = frames[0].size
    if w0 <= TILE_W:
        print(f"  {name}: source already {w0}px, leaving alone")
        continue

    wh = (TILE_W, max(1, round(h0 * TILE_W / w0)))
    resized = [f.resize(wh, Image.LANCZOS) for f in frames]
    original_bytes = os.path.getsize(src)

    best = None
    results = []
    for q in QUALITY_CHOICES:
        data = encode(resized, durations, loop, q)
        mean, worst = error(data, resized)
        results.append((q, data, mean, worst))
        if mean <= TOLERANCE and (best is None or len(data) < len(best[1])):
            best = (q, data, mean, worst)

    print(f"\n  {name}: {w0}x{h0} -> {wh[0]}x{wh[1]}, {len(frames)} frames, "
          f"{sum(durations) / 1000:.2f}s, original GIF {original_bytes // 1024}KB")
    for q, data, mean, worst in results:
        mark = "  <- chosen" if best and q == best[0] else ""
        print(f"    q{q:<3} {len(data) // 1024:>5}KB   err {mean:.2f} (worst {worst}){mark}")

    if best is None:
        # Diminishing returns: past a point, another 200KB buys a difference
        # nobody can see. Take the smallest encode within 0.2 of the best this
        # file can reach, rather than the most faithful at any cost.
        floor = min(r[2] for r in results)
        eligible = [r for r in results if r[2] <= floor + 0.2 and len(r[1]) < original_bytes]
        q, data, mean, worst = min(eligible, key=lambda r: len(r[1]))
        print(f"    nothing hit {TOLERANCE}; best reachable was {floor:.2f}, "
              f"taking the smallest within 0.2 of it")
    else:
        q, data, mean, worst = best

    dst = os.path.join(os.path.dirname(src), name)
    with open(dst, "wb") as fh:
        fh.write(data)
    total_before += original_bytes
    total_after += len(data)
    print(f"    SHIPPED {name}: q{q}, {len(data) // 1024}KB "
          f"({100 - len(data) / original_bytes * 100:.0f}% smaller), err {mean:.2f}, "
          f"{len(frames)} frames, {sum(durations) / 1000:.2f}s preserved")

# The GIF small builds are superseded and would otherwise linger as dead weight.
for group in ("sylvan", "chessever", "hitman", "endgame"):
    stale = f"public/dossier/work/{group}/{group}-cover-sm.gif"
    if os.path.exists(stale):
        os.remove(stale)
        print(f"\n  removed superseded {stale}")

print(f"\n  four covers: {total_before // 1024}KB of GIF -> {total_after // 1024}KB of WebP")
