import type { NextConfig } from "next";

/* No `remotePatterns`, on purpose. Nothing external is optimised directly;
   Apple's artwork comes through /api/app-store/art instead. Widening this
   would hand every future component permission to load from mzstatic.com. */
const nextConfig: NextConfig = {
  /* /shots became /playground: bookmarks and crawlers land where the work
     still is, permanently. */
  async redirects() {
    return [
      { source: "/shots", destination: "/playground", permanent: true },
      { source: "/shots/:path*", destination: "/playground/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
