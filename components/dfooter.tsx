import { ClockTile, DotsTile, MusicTile, StepsTile } from "./instruments";
import { NowLine } from "./now-line";

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

/** The sign-off, in the site's own voice: one quiet row on a hairline, on
 the page's left edge like everything above it. Who made it, what it was
 made with (the music named, from the same feed as the music tile), and the
 way back up. It replaced a tilted yellow sticker, the one saturated colour
 on an otherwise monochrome site. Same on every page. */
export function DFloor({ className = "" }: { className?: string }) {
 return (
 <div className={`mt-16 border-t border-line pt-5 pb-10 ${className}`}>
 <p className="flex flex-col gap-2 font-sans text-xs text-ink-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
 <span className="shrink-0">
 © {new Date().getFullYear()}{" "}
 <a href="https://x.com/damilare_oo" target="_blank" rel="noopener noreferrer" className="text-ink link-sheen">
 Damilare Osofisan
 </a>
 </span>
 <NowLine />
 <a href="#top" className="shrink-0 text-ink-2 transition-colors hover:text-ink">
 Back to top ↑
 </a>
 </p>
 </div>
 );
}
