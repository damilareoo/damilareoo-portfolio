import { describe, expect, it } from "vitest";
import { LEAD_MIN, LEAD_SIZES, LEAD_WIDTH_MIN, TILE_SIZES, leadsFor, orderGroups, projectOf } from "@/components/shots-wall";

/**
 * The wall's rhythm: the lead tile of each qualifying project group opens
 * at double size. Qualification is a study count, never taste — hold the
 * rule here.
 */
describe("the wall rhythm", () => {
  it("reads the project off the caption, falling back to alt", () => {
    expect(projectOf({ alt: "Vienna study 1", caption: "vienna — study 01." })).toBe("vienna");
    expect(projectOf({ alt: "Zlink study" })).toBe("zlink study");
  });

  it("leads only firsts of groups at or above the minimum", () => {
    const shots = [
      { alt: "a study 1", caption: "a — study 01." },
      { alt: "a study 2", caption: "a — study 02." },
      { alt: "b study", caption: "b — study." },
    ];
    expect(leadsFor(shots, 2)).toEqual([true, false, false]);
    expect(leadsFor(shots, 3)).toEqual([false, false, false]);
  });

  it("moves the lead off a soft cover onto the first sharp study", () => {
    const shots = [
      { src: "/small.jpg", alt: "a study 1", caption: "a — study 01." },
      { src: "/big.jpg", alt: "a study 2", caption: "a — study 02." },
      { src: "/other.jpg", alt: "b study", caption: "b — study." },
    ];
    const widthOf = (s: { src?: string }) => (s.src === "/big.jpg" ? 1920 : 900);
    expect(leadsFor(shots, 2, widthOf)).toEqual([false, true, false]);
  });

  it("asks for three studies and real pixels before a lead", () => {
    expect(LEAD_MIN).toBe(3);
    expect(LEAD_WIDTH_MIN).toBe(1600);
  });

  it("asks for the boxes the wide layout actually draws", () => {
    // 1600px container above 1800, 1800px above 2200; four columns, 12px gaps.
    expect(TILE_SIZES).toContain("(min-width: 1800px) 381px");
    expect(TILE_SIZES).toContain("(min-width: 2200px) 431px");
    expect(LEAD_SIZES).toContain("(min-width: 1800px) 774px");
    expect(LEAD_SIZES).toContain("(min-width: 2200px) 874px");
    // Tailwind's columns switch at 640/1024, so the media queries must too.
    expect(TILE_SIZES).toContain("(max-width: 639px)");
    expect(TILE_SIZES).toContain("(max-width: 1023px)");
    expect(LEAD_SIZES).toContain("(max-width: 639px)");
    expect(LEAD_SIZES).toContain("(max-width: 1023px)");
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

