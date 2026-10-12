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

  it("shuffles groups deterministically, keeping studies together", () => {
    const shots = [
      { alt: "a study 1", caption: "a — study 01." },
      { alt: "a study 2", caption: "a — study 02." },
      { alt: "b study", caption: "b — study." },
      { alt: "c study", caption: "c — study." },
    ];
    const once = orderGroups(shots, 7).map((s) => s.alt);
    expect(orderGroups(shots, 7).map((s) => s.alt)).toEqual(once);
    expect([...once].sort()).toEqual(["a study 1", "a study 2", "b study", "c study"]);
    expect(Math.abs(once.indexOf("a study 1") - once.indexOf("a study 2"))).toBe(1);
  });
});
