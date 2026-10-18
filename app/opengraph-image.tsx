import { readFileSync } from "node:fs";
import { join } from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Damilare Osofisan, Software Designer — close-up of a bottle cap on white";

/* The share card, and it is one file because a scraper will only ever fetch
   one. The owner's composition is used exactly as sent: the source is
   already 1.9048:1, the Open Graph ratio, so serving it is a downscale and
   never a crop. Nothing is re-laid-out here — the cap stays on the right,
   the name and role stay on the left, because a redrawn card is a second
   card and would drift from the one the owner approved.

   Next appends a per-build hash to this route's URL, so a deploy changes
   the address and every platform re-scrapes instead of serving the card
   it cached from the last one. That is why the long-lived immutable
   header below is safe here and would not be on a fixed URL. */
export default function Image() {
  const bytes = readFileSync(join(process.cwd(), "public/dossier/og-image.png"));
  return new Response(bytes, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
