import { readFileSync } from "node:fs";
import { join } from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Damilare Osofisan — black bottle cap on white";

/* The share card is the coin, full stop. It used to be a generated dark
   lockup with the portrait; the owner chose the cap instead, so this route
   serves the static artwork in `public/dossier/og-image.png` rather than
   drawing a second card. One card, automatic on every route that does not
   set its own (work pages use their gallery frames). A scraper only ever
   fetches a static file, so no spin can reach a feed — the most motion this
   surface can carry is the coin caught at an angle, which is how the file
   itself is composed. */
export default function Image() {
  const bytes = readFileSync(join(process.cwd(), "public/dossier/og-image.png"));
  return new Response(bytes, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
