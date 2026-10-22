import { describe, expect, it } from "vitest";
import { workCases } from "./dossier-work";

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
