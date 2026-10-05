import { ImageResponse } from "next/og";
import { HEAD, portraitDataUri } from "@/lib/portrait-file";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * The home-screen icon: the same crop as the tab icon, at 180.
 *
 * The same window rather than a looser one. iOS rounds the corners itself and a
 * wider crop would put the shoulders where the rounding takes them, so the two
 * icons are deliberately the same picture at two sizes. See `app/icon.tsx`.
 */
export default function AppleIcon() {
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
