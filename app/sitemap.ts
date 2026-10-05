import type { MetadataRoute } from "next";
import { site } from "@/data/site";

/**
 * Three routes, and no others — §1 of the v3 spec. /work, /work/[slug],
 * /writing and /writing/[slug] went with the design language, and this went
 * with them: a sitemap listing a route that 404s is a contradiction a crawler
 * resolves against us.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/about", "/shots"].map((path) => ({ url: `${site.url}${path}` }));
}
