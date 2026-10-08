"use client";

/**
 * Back to top — a quiet arrow on the footer's empty right end.
 * Smooth scrolls, instant when reduced motion asks, and hands focus
 * to the top so keyboard readers land somewhere sensible.
 * Label shows on larger screens; phones get the icon alone.
 */
export function BackToTop() {
  const top = () => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" });
    const anchor = document.getElementById("top");
    if (anchor) {
      anchor.setAttribute("tabindex", "-1");
      anchor.focus({ preventScroll: true });
    }
  };

  return (
    <button
      type="button"
      onClick={top}
      aria-label="Back to top"
      className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 tracking-wide link-sheen"
    >
      <span aria-hidden className="hidden sm:inline">
        top
      </span>
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 13V3M3 8l5-5 5 5" />
      </svg>
    </button>
  );
}
