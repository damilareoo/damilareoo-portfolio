// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import Pic from "@/components/pic";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});
const render = (ui: React.ReactElement) => act(() => root.render(ui));

describe("Pic", () => {
  const src = "/dossier/shots/intempus-purples.jpg";

  it("offers the real full-size WebP as the srcSet ceiling", () => {
    render(<Pic src={src} alt="Intempus purples" />);
    expect(host.querySelector("source")?.getAttribute("srcset")).toContain(
      "/dossier/shots/intempus-purples.webp 1600w",
    );
  });

  it("never advertises a fake 9999w descriptor", () => {
    render(<Pic src={src} alt="Intempus purples" />);
    expect(host.querySelector("source")?.getAttribute("srcset")).not.toContain("9999w");
    expect(host.querySelector("img")?.getAttribute("srcset")).not.toContain("9999w");
  });

  it("gives the non-WebP fallback the same real ceiling", () => {
    render(<Pic src={src} alt="Intempus purples" />);
    const fallback = host.querySelector("img");
    expect(fallback?.getAttribute("srcset")).toContain(
      "/dossier/shots/intempus-purples.jpg 1600w",
    );
  });

  it("leaves an animated GIF as a plain image", () => {
    render(<Pic src="/dossier/loop.gif" alt="Loop" />);
    expect(host.querySelector("picture")).toBeNull();
    expect(host.querySelector("img")?.getAttribute("src")).toBe("/dossier/loop.gif");
  });
});
