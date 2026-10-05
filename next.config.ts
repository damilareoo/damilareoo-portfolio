import type { NextConfig } from "next";

/* No `remotePatterns`, on purpose. Nothing external is optimised directly;
   Apple's artwork comes through /api/app-store/art instead. Widening this
   would hand every future component permission to load from mzstatic.com. */
const nextConfig: NextConfig = {};

export default nextConfig;
