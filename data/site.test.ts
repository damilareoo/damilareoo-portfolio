import { describe, expect, it } from "vitest";
import { elsewhere, site } from "./site";

describe("site record", () => {
  /* Damilare's LinkedIn vanity URL, matching the footer's social row. */
  it("points at Damilare's real LinkedIn vanity URL", () => {
    expect(site.linkedin).toContain("linkedin.com/in/damilareoo");
  });

  /* `site.url` is `metadataBase`. Every absolute URL the site emits resolves
     against it — og:image, twitter:image, the canonical, every sitemap row,
     robots' sitemap line — so a host that does not exist silently breaks every
     link preview the site will ever get. It shipped pointing at
     kennyolajide.com, which has no DNS.

     The assertion is deliberately not "equals the vercel URL": buying the
     custom domain is the expected next change and a test that forbids it is a
     test that gets deleted. What it holds is the shape — a bare https origin,
     no path, no trailing slash, and not the one host already known to be
     unresolvable. */
  it("resolves absolute metadata against an origin that exists", () => {
    expect(site.url).toMatch(/^https:\/\/[a-z0-9.-]+[a-z]$/);
    expect(site.url, "kennyolajide.com has no DNS — see data/site.ts").not.toContain(
      "kennyolajide.com",
    );
    expect(() => new URL(site.url)).not.toThrow();
  });

  it("gives every elsewhere entry a real destination", () => {
    expect(elsewhere.length).toBeGreaterThan(0);
    for (const e of elsewhere) {
      expect(e.href, `${e.label} has no href`).toBeTruthy();
      expect(e.href).toMatch(/^(https:\/\/|mailto:)/);
    }
  });
});
