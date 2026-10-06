import { ImageResponse } from "next/og";
import { capDataUri, capSize } from "@/lib/portrait-file";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * The home-screen icon: the coin's opening face, at 180.
 *
 * The same cap as the tab icon — iOS rounds the corners itself, and a
 * different crop here would be a second icon. See `app/icon.tsx`.
 */
export default function AppleIcon() {
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
