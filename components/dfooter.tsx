import { ClockTile, DotsTile, MusicTile, StepsTile } from "./instruments";
import { BackToTop } from "./back-to-top";

/** Site footer — the instruments free on the page, the sign-off on
 its own tinted band. Same on every page. */
export function DFooter() {
 return (
 <footer className="mt-12">
 <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
 <ClockTile />
 <DotsTile />
 <StepsTile />
 <MusicTile />
 </div>

 <DFloor />
 </footer>
 );
}

/** The sticker footer: sentence on volt beside its yellow ride home.
 Hovering either rolls both — the sticker rolls, the dot's arrow spins
 along. Same on every page. */
export function DFloor() {
 return (
 <div className="mt-6 py-6 text-center">
 <p className="foot-group flex items-center justify-center gap-4">
 <span className="fx-roll inline-block -rotate-2 rounded-lg bg-[#ffd60a] px-4 py-2 font-sans text-sm font-medium text-[#0a0a0a] shadow-[0_8px_20px_rgba(0,0,0,0.18)]">
 Built with love and music by{" "}
 <a
 href="https://x.com/damilareoo"
 target="_blank"
 rel="noopener noreferrer"
 className="underline"
 >
 Damilare
 </a>
 .
 </span>
 <a
 href="#top"
 aria-label="Back to top"
 className="fx-spindot grid min-h-11 min-w-11 cursor-pointer place-items-center rounded-full bg-[#ffd60a] text-[#0a0a0a] shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
 >
 <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
 <path d="M8 13.5v-11M3.5 7.5 8 3l4.5 4.5" />
 </svg>
 </a>
 </p>
 <p className="mt-4 font-sans text-xs text-ink-3">
 © {new Date().getFullYear()} Damilare Osofisan
 </p>
 </div>
 );
}
