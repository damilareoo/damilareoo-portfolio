"""
Install a new ChessEver cover, matched to how the homepage actually renders it.

Two things about the source and one about the card:

  The card is `aspect-[16/10] object-cover`, so whatever is installed gets
  centre-cropped to 1.6:1 by the browser. The source is 4:3, so installing it
  raw would silently throw away a quarter of the width. Cropping here instead
  keeps the mark where the composition puts it and makes the poster's aspect
  match the card's, so the frame before the GIF starts is the same picture.

  The source holds 46 frame slots, but 19 are pixel-identical to the one
  before — the export wrote each frame twice. They still carry duration, so
  they are merged by summing duration into the survivor rather than dropped:
  same frames, same length, a third fewer bytes.

  Pillow's GIF writer collapses similar frames when `optimize=True` and raises
  on `disposal` when a quantized frame carries transparency. Both are avoided
  deliberately; the output is written exactly as computed above.
"""

from PIL import Image
import os
import sys

SRC = sys.argv[1] if len(sys.argv) > 1 else \
    "/private/var/folders/ck/_v68zw3164v6tn6n73p3x_kh0000gn/T/opencode/gifwork/Chessever Deep Plum Video Export.gif"
DST = "public/dossier/work/chessever/chessever-cover.gif"
POSTER = "public/dossier/work/chessever/chessever-cover-poster.jpg"

CARD_RATIO = 16 / 10  # what the homepage card crops to

src = Image.open(SRC)
W, H = src.size
slots = src.n_frames

# Read every slot, merging consecutive identical frames by summing duration.
frames: list[Image.Image] = []
durations: list[int] = []
prev_bytes = None
prev_img = None
prev_ms = 0

for i in range(slots):
    src.seek(i)
    ms = src.info.get("duration", 70)
    img = src.convert("RGB")
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

merged = slots - len(frames)
print(f"  source   {W}x{H} ({W/H:.3f})  {slots} slots -> {len(frames)} frames ({merged} duplicate slots merged)")

# Centre-crop each frame to the card's ratio so nothing is thrown away later.
cropped = []
for img in frames:
    tw, th = img.size
    if tw / th > CARD_RATIO:
        nw = int(round(th * CARD_RATIO))
        left = (tw - nw) // 2
        img = img.crop((left, 0, left + nw, th))
    else:
        nh = int(round(tw / CARD_RATIO))
        top = (th - nh) // 2
        img = img.crop((0, top, tw, top + nh))
    cropped.append(img)

cw, ch = cropped[0].size
length = sum(durations) / 1000
print(f"  cropped  {cw}x{ch} ({cw/ch:.3f})  <- matches the card's 16/10")
print(f"  timing   {length:.2f}s, loop forever")

# One palette for the whole animation, sampled across it rather than from the
# opening frames alone — the mark animates, so later frames carry colour the
# first ones do not, and per-frame palettes band.
#
# The palette is deliberately small. This cover is flat vector art on a flat
# plum field, measured at 0.11 mean absolute error whether it gets 32 colours
# or 256: the mark does not need more, and every extra entry only dithers
# noise across the large empty background. 128 with no dithering measured the
# same error at a third of the dithered file's weight.
spread = [cropped[round(i * (len(cropped) - 1) / 5)] for i in range(6)]
strip = Image.new("RGB", (cw, ch * len(spread)))
for k, f in enumerate(spread):
    strip.paste(f, (0, ch * k))
pal = strip.quantize(colors=128, method=Image.MEDIANCUT)

out = []
for f in cropped:
    q = f.quantize(palette=pal, dither=Image.NONE)
    # Dropping the transparency tuple Pillow attaches is the documented
    # workaround for the disposal crash, and costs nothing: this cover is opaque.
    q.info.pop("transparency", None)
    out.append(q)

# Frame differencing. Measured on this cover, only 0.7% of pixels change
between consecutive frames — the plum field is static and just the mark moves.
`disposal=1` ("do not dispose") lets the encoder skip the rectangles that did
not change instead of re-encoding 1.6M pixels per frame: 693KB down to 253KB
for a file that plays back identically (verified frame by frame at 0.00 mean
error).
#
# `optimize=True` stays off because Pillow's own frame-merging shortened the
# animation; `disposal` is safe here precisely because the transparency tuple is
# popped above, which is what triggered the earlier crash.
out[0].save(DST, save_all=True, append_images=out[1:], loop=0,
            duration=durations, optimize=False, disposal=1)
print(f"  wrote {DST}  {os.path.getsize(DST)/1024:.0f}KB")

# The poster must match the card's aspect or the frame shown before the GIF
# loads jumps to a different crop.
out[0].convert("RGB").save(POSTER, "JPEG", quality=88, optimize=True, progressive=True)
print(f"  wrote {POSTER}  {os.path.getsize(POSTER)/1024:.0f}KB  {Image.open(POSTER).size}")