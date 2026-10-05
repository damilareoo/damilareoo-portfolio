import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";

describe("project scaffold", () => {
  it("pins the exact React and Next versions the plan names", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    expect(pkg.dependencies.next).toBe("16.3.0");
    expect(pkg.dependencies.react).toBe("19.2.8");
  });

  it("declares no dependency that pulls in a second typeface", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    const names = Object.keys(pkg.dependencies).join(" ");
    expect(names).not.toMatch(/font|typeface/i);
  });
});
