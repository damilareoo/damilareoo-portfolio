import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { TILE_SIZES, WALL_COLUMNS, WALL_SIZES, shotBox } from "@/components/shots-wall";
import { orderGroups, projectOf } from "@/lib/wall-order";
import { SHOT_DIMENSIONS } from "@/components/shot-dimensions";
import { dossier } from "@/data/dossier";

/**
 * The wall's rules, held where they can be checked: projects interleave,
 * every tile knows its own shape, and nothing is labelled by hope.
 */
describe("the wall rhythm", () => {
  it("reads the project off the caption, falling back to alt", () => {
    expect(projectOf({ alt: "Vienna study 1", caption: "vienna — study 01." })).toBe("vienna");
    expect(projectOf({ alt: "Zlink study" })).toBe("zlink study");
  });

  it("deals projects against each other, deterministically", () => {
    const shots = [
      { alt: "a study 1", caption: "a — study 01." },
      { alt: "a study 2", caption: "a — study 02." },
      { alt: "a study 3", caption: "a — study 03." },
      { alt: "b study", caption: "b — study." },
      { alt: "c study", caption: "c — study." },
      { alt: "d study", caption: "d — study." },
    ];
    const once = orderGroups(shots, 7).map((s) => s.alt);

    // same seed, same wall
    expect(orderGroups(shots, 7).map((s) => s.alt)).toEqual(once);
    // nothing lost, nothing doubled
    expect([...once].sort()).toEqual(
      ["a study 1", "a study 2", "a study 3", "b study", "c study", "d study"].sort(),
    );
    // studies keep their order within a project
    expect(once.indexOf("a study 1")).toBeLessThan(once.indexOf("a study 2"));
    expect(once.indexOf("a study 2")).toBeLessThan(once.indexOf("a study 3"));
    // and the projects interleave rather than running in blocks
    const project = (alt: string) => alt.split(" ")[0];
    for (let i = 1; i < once.length; i++) {
      expect(project(once[i])).not.toBe(project(once[i - 1]));
    }
  });

  it("only repeats a project when it has no other choice", () => {
    // four of one project against one other: the repeats are unavoidable,
    // but they should be spread rather than clumped at the end
    const shots = [
      ...Array.from({ length: 4 }, (_, i) => ({ alt: `a study ${i + 1}`, caption: `a — study 0${i + 1}.` })),
      { alt: "b study", caption: "b — study." },
    ];
    const out = orderGroups(shots, 3).map((s) => s.alt.split(" ")[0]);
    expect(out).toHaveLength(5);
    expect(out[0]).toBe("a");
    expect(out[1]).toBe("b");
  });
});

/**
 * The wall is masonry, so a tile's height comes from its plate rather than
 * from the grid. Render cannot measure the files — this ships to Cloudflare
 * Workers, where there is no filesystem — so the shapes are a generated
 * manifest, and the manifest is only trustworthy if it covers the list.
 */
describe("the wall's shapes", () => {
  it("knows the size of every study it lists", () => {
    const unmeasured = dossier.shots.filter((s) => !shotBox(s.src));
    expect(unmeasured.map((s) => s.src)).toEqual([]);
  });

  it("lists a dimension for nothing the wall does not show", () => {
    const listed = new Set(dossier.shots.map((s) => s.src));
    const orphans = Object.keys(SHOT_DIMENSIONS).filter((src) => !listed.has(src));
    expect(orphans).toEqual([]);
  });

  it("points at files that exist", () => {
    // Proven here rather than at render, where a missing file is a blank tile
    // and `existsSync` under OpenNext is false for everything. The srcs start
    // with "/" and `resolve` discards the base for a trailing absolute path,
    // so the public root is the thing being appended to.
    const publicRoot = resolve(__dirname, "..", "public");
    const absent = dossier.shots
      .map((s) => s.src)
      .filter((src) => !existsSync(resolve(publicRoot, src.slice(1))));
    expect(absent).toEqual([]);
  });

  it("labels every study, because an unlabelled tile cannot be described", () => {
    const blank = dossier.shots.filter((s) => !s.caption?.trim()).map((s) => s.src);
    expect(blank).toEqual([]);
  });
});

describe("the density steps", () => {
  it("offers three, largest first", () => {
    expect(WALL_SIZES).toEqual(["l", "m", "s"]);
  });

  it("gives every step a column count at every breakpoint", () => {
    for (const size of WALL_SIZES) {
      const cols = WALL_COLUMNS[size];
      expect(cols, size).toContain("columns-");
      expect(cols, size).toContain("sm:columns-");
      expect(cols, size).toContain("lg:columns-");
    }
  });

  it("asks for the boxes each step actually draws", () => {
    // 1200px content above 1024, 1560 above 1800, 1760 above 2200, 12px gutters.
    expect(TILE_SIZES.m).toContain("(min-width: 1800px) 381px");
    expect(TILE_SIZES.m).toContain("(min-width: 2200px) 431px");
    expect(TILE_SIZES.l).toContain("(min-width: 1800px) 512px");
    expect(TILE_SIZES.s).toContain("(min-width: 2200px) 283px");
    // Tailwind's columns switch at 640/1024, so the media queries must too.
    for (const size of WALL_SIZES) {
      expect(TILE_SIZES[size], size).toContain("(max-width: 639px)");
      expect(TILE_SIZES[size], size).toContain("(max-width: 1023px)");
    }
  });

  it("narrows the requested pixels as the steps get denser", () => {
    // A 6-column wall asking for the 4-column file is how the wall gets heavy.
    // The last term of a `sizes` list is the width above 1024px.
    const px = (s: string) => Number(s.split(",").pop()?.match(/(\d+)px/)?.[1]);
    expect(px(TILE_SIZES.s)).toBeLessThan(px(TILE_SIZES.m));
    expect(px(TILE_SIZES.m)).toBeLessThan(px(TILE_SIZES.l));
  });

  it("still has three real steps on a phone", () => {
    // The first breakpoint is the one with no room to spare, so it is where a
    // step quietly becomes a duplicate of its neighbour. Both the column count
    // and the requested width must differ at <640, not just above it.
    const phoneCols = (s: string) => Number(s.match(/columns-(\d)/)?.[1]);
    // The phone term is expressed in vw, so it can follow the grid rather than
    // guess at it; 92 / 46 / 30 is one plate, two, three.
    const phonePx = (s: string) => Number(s.match(/\(max-width: 639px\) (\d+)vw/)?.[1]);

    const cols = WALL_SIZES.map((s) => phoneCols(WALL_COLUMNS[s]));
    const px = WALL_SIZES.map((s) => phonePx(TILE_SIZES[s]));
    expect(new Set(cols).size, `columns on a phone: ${cols}`).toBe(3);
    expect(new Set(px).size, `widths on a phone: ${px}`).toBe(3);
    // Denser means more columns and smaller files.
    expect(cols).toEqual([...cols].sort((a, b) => a - b));
    expect(px).toEqual([...px].sort((a, b) => b - a));
  });
});
