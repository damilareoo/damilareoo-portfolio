import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Damilare Osofisan",
    short_name: "Damilare",
    start_url: "/",
    display: "standalone",
    /* --bg on each skin, from app/globals.css. The old pair (#ffffff/#101010)
       was the v2 palette and neither value is in the new ramp. */
    background_color: "#fcfcfc",
    theme_color: "#090909",
  };
}
