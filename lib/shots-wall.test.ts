import { describe, expect, it } from "vitest";
import { LEAD_MIN, leadsFor, orderGroups, projectOf } from "@/components/shots-wall";

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

  it("asks for four studies before a lead", () => {
    expect(LEAD_MIN).toBe(4);
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

