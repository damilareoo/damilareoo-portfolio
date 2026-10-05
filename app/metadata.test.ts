import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import sitemap from "./sitemap";
import robots from "./robots";
import manifest from "./manifest";

describe("metadata", () => {
  it("lists every real route in the sitemap, and only those", () => {
    // Three routes, and no others — §1 of the v3 spec. /work and /writing are
    // gone; a sitemap that still named them would send crawlers at 404s.
    const urls = sitemap().map((e) => new URL(e.url).pathname).sort();
    expect(urls).toEqual(["/", "/about", "/shots"]);
  });

  it("keeps the artwork proxy out of the crawl — it is plumbing", () => {
    expect(robots().rules).toMatchObject({ userAgent: "*", disallow: "/api/" });
  });

  it("names the app and takes its colours from the two grounds", () => {
    // Both figures are --bg, one per skin, read off app/globals.css. They moved
    // with the palette: #ffffff/#101010 was v2's and is not in the new ramp.
    expect(manifest().name).toBe("Damilare Osofisan");
    expect(manifest().background_color).toBe("#fcfcfc");
    expect(manifest().theme_color).toBe("#090909");
  });

  it("holds the browser-chrome colours to the stylesheet's own grounds", () => {
    /* app/layout.tsx writes --bg for each skin into `viewport.themeColor` by
       hand, because a CSS custom property cannot be read from a Next metadata
       export. That is two literals that can drift from the stylesheet, so this
       reads both files and compares them. */
    const css = readFileSync("app/globals.css", "utf8");
    const layout = readFileSync("app/layout.tsx", "utf8");
    const bg = (selector: string) =>
      css.match(new RegExp(`${selector}\\s*\\{[^}]*?--bg:\\s*(#[0-9a-f]{6})`, "s"))![1];

    expect(layout).toContain(`color: "${bg(":root")}"`);
    expect(layout).toContain(`color: "${bg("\\.dark")}"`);
  });
});

describe("page titles", () => {
  /* The template in app/layout.tsx already appends " — Damilare Osofisan". A page
     whose own title also ends in the name renders it twice —
     "About — Damilare Osofisan — Damilare Osofisan" — which is the first thing a browser
     tab, a search result and a link unfurl show. This shipped once; the
     assertion is here so it cannot ship again. */
  const routes = ["app/about/page.tsx", "app/shots/page.tsx", "app/not-found.tsx"];

  it("never repeats the site name in a page title", () => {
    for (const route of routes) {
      const src = readFileSync(route, "utf8");
      const titles = [...src.matchAll(/title:\s*([^,\n}]+)/g)].map((m) => m[1]);
      for (const t of titles) {
        expect(t, `${route} repeats the site name in its title`).not.toMatch(/Damilare Osofisan/);
      }
    }
  });

  it("keeps the template that supplies the name exactly once", () => {
    expect(readFileSync("app/layout.tsx", "utf8")).toMatch(/template:\s*`%s — \$\{site\.name\}`/);
  });
});
