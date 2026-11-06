// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ShotsWall } from "@/components/shots-wall";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * Two rules the wall has to keep about its labels: a caption may not cover the
 * art unless the visitor asked for it, and on a touch screen the asking is the
 * tap that opens the viewer.
 */
let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  // WarpShot asks whether the pointer can hover; jsdom has no media queries.
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  }));
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

const SHOTS = [
  { src: "/dossier/shots/vienna.jpg", alt: "Vienna study 1", caption: "vienna — study 01." },
  { src: "/dossier/shots/intempus.jpg", alt: "Intempus study 1", caption: "intempus — study 01." },
];

const render = (ui: React.ReactElement) => act(() => root.render(ui));

describe("the wall's labels", () => {
  it("keeps the caption off the art until the tile is pointed at or focused", () => {
    render(<ShotsWall shots={SHOTS} />);
    const tile = host.querySelector<HTMLElement>('button[aria-label^="Open "]')!;
    const plate = tile.querySelector<HTMLElement>('span[aria-hidden]')!;
    const text = plate.querySelector<HTMLElement>("span")!;

    expect(text.textContent).toBeTruthy();
    expect(plate.className).toContain("opacity-0");
    expect(plate.className).toContain("group-hover:opacity-100");
    expect(plate.className).toContain("group-focus-visible:opacity-100");
    // The old rule pinned it open on every touch screen, which is the wall of
    // labels this deliberately is not.
    expect(plate.className).not.toContain("hover:none");
  });

  it("puts the caption in the viewer once the tile is opened", () => {
    render(<ShotsWall shots={SHOTS} />);
    const tile = host.querySelector<HTMLElement>('button[aria-label^="Open "]')!;
    const caption = tile.getAttribute("aria-label")!.split(" — ").slice(1).join(" — ");

    act(() => tile.click());

    const dialog = host.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog).toBeTruthy();
    expect(dialog.textContent).toContain(caption);
  });
});
