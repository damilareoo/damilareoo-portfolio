import { ImageResponse } from "next/og";
import { capDataUri, capSize } from "@/lib/portrait-file";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * The tab icon is the coin's opening face: his cap, full-bleed.
 *
 * It was his face cropped to the head, which meant first paint showed a
 * different icon than the spinning loop the client upgrades to. Now the
 * static icon is frame zero of that loop — one icon everywhere.
 *
 * `next/og` has no `object-fit`, so the cover is done the way it is done
 * in a layout: a box that hides its overflow, holding an image scaled past
 * it and centred. The cap file is near-square (153×145), so the overspill
 * is a pixel either side.
 */
export default function Icon() {
  const nat = capSize();
  const scale = Math.max(size.width / nat.width, size.height / nat.height);
  const w = nat.width * scale;
  const h = nat.height * scale;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          overflow: "hidden",
          background: "#090909",
        }}
      >
        <img
          src={capDataUri()}
          alt=""
          width={w}
          height={h}
          style={{
            marginLeft: (size.width - w) / 2,
            marginTop: (size.height - h) / 2,
          }}
        />
      </div>
    ),
    size,
  );
}
