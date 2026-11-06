// @vitest-environment jsdom
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import Pic from "@/components/pic";
import {
  PIC_AVIF_CANDIDATES,
  PIC_AVIF_FULL,
  PIC_CANDIDATES,
  PIC_FULL,
} from "@/components/pic-manifest";

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
  /** The `<picture>` leads with AVIF, so the older assertions have to name
   *  the source they mean rather than taking the first one. */
  const webpSource = () => host.querySelector('source[type="image/webp"]');
  const avifSource = () => host.querySelector('source[type="image/avif"]');

  it("offers the real full-size WebP as the srcSet ceiling", () => {
    render(<Pic src={src} alt="Intempus purples" />);
    expect(webpSource()?.getAttribute("srcset")).toContain(
      "/dossier/shots/intempus-purples.webp 1600w",
    );
  });

  it("never advertises a fake 9999w descriptor", () => {
    render(<Pic src={src} alt="Intempus purples" />);
    for (const source of Array.from(host.querySelectorAll("source"))) {
      expect(source.getAttribute("srcset"), source.getAttribute("type") ?? "").not.toContain(
        "9999w",
      );
    }
    expect(host.querySelector("img")?.getAttribute("srcset")).not.toContain("9999w");
  });

  it("gives the non-WebP fallback the same real ceiling", () => {
    render(<Pic src={src} alt="Intempus purples" />);
    const fallback = host.querySelector("img");
    expect(fallback?.getAttribute("srcset")).toContain(
      "/dossier/shots/intempus-purples.jpg 1600w",
    );
  });

  it("leads with AVIF and keeps WebP beneath it", () => {
    render(<Pic src={src} alt="Intempus purples" />);
    const sources = Array.from(host.querySelectorAll("source"));
    expect(sources.map((s) => s.getAttribute("type"))).toEqual(["image/avif", "image/webp"]);
    // Both sources must describe the same box, or a browser that takes the
    // second one gets a different resolution than one that takes the first.
    expect(avifSource()?.getAttribute("sizes")).toBe(webpSource()?.getAttribute("sizes"));
    expect(avifSource()?.getAttribute("srcset")).toContain(
      "/dossier/shots/intempus-purples-768.avif 768w",
    );
  });

  it("leaves an animated GIF as a plain image", () => {
    render(<Pic src="/dossier/loop.gif" alt="Loop" />);
    expect(host.querySelector("picture")).toBeNull();
    expect(host.querySelector("img")?.getAttribute("src")).toBe("/dossier/loop.gif");
  });
});

const stemOf = (src: string) => src.replace(/\.[^/.]+$/, "");

/**
 * The manifest is the only thing standing between this component and a 404,
 * and a source whose every candidate 404s renders as an empty frame. Render
 * cannot check disk — this ships to Cloudflare Workers, where there isn't any
 * — so it is checked here, against the files the generator was told to write.
 */
describe("the companion manifest", () => {
  const publicRoot = resolve(__dirname, "..", "public");
  const has = (p: string) => existsSync(resolve(publicRoot, p.slice(1)));

  it("lists a width only where every file it implies is on disk", () => {
    const phantom: string[] = [];
    for (const [src, widths] of Object.entries(PIC_CANDIDATES)) {
      const ext = src.split(".").pop();
      for (const w of widths) {
        if (!has(`${stemOf(src)}-${w}.webp`)) phantom.push(`${src} -${w}.webp`);
        if (!has(`${stemOf(src)}-${w}.${ext}`)) phantom.push(`${src} -${w}.${ext}`);
      }
    }
    expect(phantom).toEqual([]);
  });

  it("lists an AVIF width only where the AVIF is on disk", () => {
    const phantom = Object.entries(PIC_AVIF_CANDIDATES).flatMap(([src, widths]) =>
      widths.filter((w) => !has(`${stemOf(src)}-${w}.avif`)).map((w) => `${src} -${w}.avif`),
    );
    expect(phantom).toEqual([]);
  });

  it("never offers an AVIF a browser would have to fall back from", () => {
    // The AVIF source is a subset of the WebP one: a width with a WebP and no
    // AVIF is fine, but a width with an AVIF and no WebP means the lists are
    // being generated from different facts.
    const orphans = Object.entries(PIC_AVIF_CANDIDATES).flatMap(([src, widths]) =>
      widths.filter((w) => !(PIC_CANDIDATES[src] ?? []).includes(w)).map((w) => `${src} -${w}`),
    );
    expect(orphans).toEqual([]);
  });

  it("gives both full-size ceilings a real file", () => {
    const phantom = Object.keys(PIC_FULL)
      .filter((src) => !has(`${stemOf(src)}.webp`))
      .concat(Object.keys(PIC_AVIF_FULL).filter((src) => !has(`${stemOf(src)}.avif`)));
    expect(phantom).toEqual([]);
  });

  it("agrees with itself on how wide a source is", () => {
    // Two records, one source: a mismatch means the descriptor sent the
    // browser to the wrong candidate, which is the postage-stamp bug.
    const mismatch = Object.keys(PIC_AVIF_FULL).filter(
      (src) => PIC_FULL[src] !== PIC_AVIF_FULL[src],
    );
    expect(mismatch).toEqual([]);
  });
});
