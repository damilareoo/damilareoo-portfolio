import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PIC_CANDIDATES } from "@/components/pic-manifest";
import { workCases } from "./dossier-work";

/* The page used to filter its gallery by asking the runtime whether each file
 was on disk. That check can only ever pass at build time: a deployed Worker
 has no readable `public/`, so every frame looked missing and the whole run
 rendered blank. The same proof now happens here, where a real failure fails
 the suite instead of quietly emptying a page. */
describe("case-file frames", () => {
  it("points every frame and poster at a file in the repo", () => {
    for (const c of workCases) {
      expect(c.gallery.length, `${c.name} declares no frames`).toBeGreaterThan(0);
      for (const g of c.gallery) {
        expect(existsSync(`public${g.src}`), `${c.name} — ${g.src} is missing`).toBe(true);
        if (g.poster) {
          expect(existsSync(`public${g.poster}`), `${c.name} — poster ${g.poster} is missing`).toBe(true);
        }
      }
    }
  });

  /* A srcSet entry with no generated companion 404s, and a <picture> whose
     every candidate 404s renders nothing. GIFs and videos are never resized
     by the generator, so they are absent from the manifest on purpose. */
  it("lists every still frame in the responsive manifest", () => {
    for (const c of workCases) {
      for (const g of c.gallery) {
        if (g.kind === "video" || /\.(gif|svg|mov)$/i.test(g.src)) continue;
        expect(PIC_CANDIDATES[g.src], `${c.name} — ${g.src} has no manifest entry`).toBeDefined();
      }
    }
  });
});

describe("case-file links", () => {
  /* Every exhibit needs a way out of the case study. The records have carried
     links from the start, but nothing ever drew them, so the only route to a
     shipped project was to guess its address. */
  it("gives every project at least one https destination", () => {
    for (const c of workCases) {
      expect(c.links.length, `${c.name} has no project link`).toBeGreaterThan(0);
      for (const link of c.links) {
        expect(link.label, `${c.name} has an unlabelled link`).toBeTruthy();
        expect(() => new URL(link.href), `${c.name} — ${link.label}`).not.toThrow();
        expect(link.href, `${c.name} — ${link.label}`).toMatch(/^https:\/\//);
      }
    }
  });

  /* The chess products ship as apps, so their case files point at the stores
     rather than the marketing sites. Both stores, on both platforms. */
  it("sends the chess apps to both app stores", () => {
    for (const slug of ["chessever", "endgame"]) {
      const c = workCases.find((w) => w.slug === slug);
      expect(c, `${slug} is missing`).toBeDefined();
      const hosts = c!.links.map((l) => new URL(l.href).host);
      expect(hosts, `${slug} is missing a store`).toEqual(
        expect.arrayContaining(["apps.apple.com", "play.google.com"]),
      );
    }
  });
});
