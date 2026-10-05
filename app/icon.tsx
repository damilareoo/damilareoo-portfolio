import { ImageResponse } from "next/og";
import { HEAD, portraitDataUri } from "@/lib/portrait-file";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * The tab icon is his face, cropped to the head.
 *
 * It was a letter K on the dark ground, which is what a site has when it has no
 * picture; this one has a picture. The crop and the reason for it are in
 * `lib/portrait-file.ts`.
 *
 * `next/og` has no `object-fit` and no background-size, so the window is done
 * the way it is done in a layout: a box that hides its overflow, holding an
 * image scaled past it and pushed into position. `scale` is how many icon
 * widths the whole file is once the head fills the box.
 */
export default function Icon() {
  const scale = 1 / HEAD.size;

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
          src={portraitDataUri()}
          alt=""
          width={size.width * scale}
          height={size.height * scale}
          style={{
            marginLeft: -size.width * scale * HEAD.x,
            marginTop: -size.height * scale * HEAD.y,
          }}
        />
      </div>
    ),
    size,
  );
}
