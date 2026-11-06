"""
Import a batch of study masters into public/dossier/shots.

Takes the exports as they arrive from Figma — spaces, apostrophes, frame
numbers, one accidental crop — and writes them out as web-sized JPEGs with
names that are safe in a URL and readable in data/dossier.ts.

Two ceilings, both about bytes rather than taste:

  1. 2400px wide. The viewer renders at 1184 CSS px, so 2x is 2368. Anything
     wider is pixels no screen resolves; the masters arrive up to 10398px.
  2. Encoding matches make-responsive.py's originals (q88, subsampling=0),
     because the companions generated from these inherit that look and a
     different source encoding shows up as a seam between tile and viewer.

Names are the authoring interface, so the mapping is explicit below rather
than inferred: `1981.jpg` and `0.jpg` are Figma frame numbers, not titles, and
guessing at them would put a study on the wall labelled with a digit.

Usage: python3 scripts/import-shot-masters.py <directory of masters>
"""

from PIL import Image
import os
import sys

MAX_WIDTH = 2400
QUALITY = 88
OUT = "public/dossier/shots"

# Master filename -> shot slug. Anything absent is dropped with a warning, so
# a new export never lands on the wall under a name nobody chose.
RENAMES = {
    "0.jpg": "intempus-emotions",
    "1981.jpg": "chronicle-labs-trace",
    "SMALLGPT.jpg": "smallgpt",
    "mederve.jpg": "mederva-2",
    "mederva.jpg": "mederva",
    "arpelos.jpg": "arpelos",
    "axion.jpg": "axion",
    "ciego.jpg": "ciego",
    "strix.jpg": "strix",
    "textedly.jpg": "textedly",
    "volvo.jpg": "volvo",
    "whosampled.jpg": "whosampled",
    "zlink.jpg": "zlink",
    "prayerpause.jpg": "prayerpause",
    "nothing pedometer.jpg": "nothing-pedometer",
    "nothing pedometer-1.jpg": "nothing-pedometer-1",
    "hitman's library.jpg": "hitmans-library",
    "hitman's library-1.jpg": "hitmans-library-1",
    "chronicle labs.jpg": "chronicle-labs",
    "chronicle labs-1.jpg": "chronicle-labs-1",
    "glint.jpg": "glint",
    "glint-1.jpg": "glint-1",
    "glint-2.jpg": "glint-2",
    "intempus.jpg": "intempus",
    "intempus-1.jpg": "intempus-1",
    "intempus-2.jpg": "intempus-2",
    "inunity.jpg": "inunity",
    "inunity-1.jpg": "inunity-1",
    "inunity-2.jpg": "inunity-2",
    "pintours.jpg": "pintours",
    "pintours-1.jpg": "pintours-1",
    "pintours-2.jpg": "pintours-2",
    "pintours-3.jpg": "pintours-3",
    "remi.jpg": "remi",
    "remi-1.jpg": "remi-1",
    "remi-2.jpg": "remi-2",
    "remi-3.jpg": "remi-3",
    "remi-4.jpg": "remi-4",
    "sea12.jpg": "sea12",
    "sea12-1.jpg": "sea12-1",
    "sea12-2.jpg": "sea12-2",
    "sequence.jpg": "sequence",
    "sequence-1.jpg": "sequence-1",
    "superr.jpg": "superr",
    "superr-1.jpg": "superr-1",
    "superr-2.jpg": "superr-2",
    "sylvan.jpg": "sylvan",
    "sylvan-1.jpg": "sylvan-1",
    "sylvan-2.jpg": "sylvan-2",
    "sylvan-3.jpg": "sylvan-3",
    "sylvan-4.jpg": "sylvan-4",
    "sylvan-5.jpg": "sylvan-5",
    "sylvan-6.jpg": "sylvan-6",
    "sylvan-7.jpg": "sylvan-7",
    "vienna.jpg": "vienna",
    "vienna-1.jpg": "vienna-1",
    "vienna-2.jpg": "vienna-2",
    "vienna-3.jpg": "vienna-3",
    "vienna-4.jpg": "vienna-4",
    "vienna-5.jpg": "vienna-5",
    "chessever.jpg": "chessever",
    "chessever-1.jpg": "chessever-1",
    "chessever-2.jpg": "chessever-2",
}

# Deliberately not imported. `1x.jpg` is a crop of the literal text "1x" from a
# Figma export frame, not a study.
EXCLUDED = {"1x.jpg"}


def main(src_dir: str) -> int:
    os.makedirs(OUT, exist_ok=True)
    count = 0
    dropped = []

    for name in sorted(os.listdir(src_dir)):
        path = os.path.join(src_dir, name)
        if not os.path.isfile(path) or not name.lower().endswith((".jpg", ".jpeg", ".png")):
            continue
        if name in EXCLUDED:
            dropped.append(f"{name} (excluded on purpose)")
            continue
        slug = RENAMES.get(name)
        if not slug:
            dropped.append(f"{name} (no entry in RENAMES)")
            continue

        im = Image.open(path)
        im.load()
        w, h = im.size
        if w > MAX_WIDTH:
            h = max(1, round(h * MAX_WIDTH / w))
            im = im.resize((MAX_WIDTH, h), Image.LANCZOS)
        out = os.path.join(OUT, f"{slug}.jpg")
        im.convert("RGB").save(out, "JPEG", quality=QUALITY, optimize=True,
                               progressive=True, subsampling=0)
        count += 1

    print(f"imported {count} -> {OUT}")
    for d in dropped:
        print("  skipped:", d)
    print("next: add the entries to data/dossier.ts, then run scripts/shot-dimensions.py")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)
    sys.exit(main(sys.argv[1]))
