import "@testing-library/jest-dom/vitest";

/* jsdom implements no matchMedia, and this site reads three of them —
   reduced motion, the pointer type, and the breakpoints — through
   useSyncExternalStore. Without a stub every component that reaches one
   throws on render, which would mean no test could render the footer or the
   nav without first mocking a seam it has no opinion about.

   It answers `false` to everything, which is the honest default for a
   headless run: no reduced-motion preference, no fine pointer, no wide
   viewport. A test that cares about one of those still mocks it at the seam
   (`@/lib/motion`, `@/lib/use-media-query`) the way nav, boot-screen and
   theme-control already do — this only stops the throw. */
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      media: query,
      matches: false,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

/* jsdom has no global `CSS` object either, so `CSS.escape` — the standard way
   to turn a `useId()` value into a safe selector — is missing. `components/product.tsx`
   reaches for it. Carried across from the source repository's own setup file.

   The IntersectionObserver stub that used to stand here is gone with the
   components that needed it. It was a no-op that never fired, which was the
   honest answer for a document with no layout — but the arrival machinery this
   repo now carries (`lib/reveal.tsx`, `lib/glyph/sweep.ts`) takes the absence of
   the constructor as its own signal: with no observer to be had, a watched
   element is reported as already seen rather than left hidden forever. A stub
   that exists and never fires is the one state that hides content in a
   headless run, so jsdom is left as it is. */
if (typeof globalThis.CSS === "undefined") {
  (globalThis as unknown as { CSS: { escape: (value: string) => string } }).CSS = {
    escape: (value: string) => value.replace(/([^\w-])/g, "\\$1"),
  };
}
