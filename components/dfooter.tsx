import { ClockTile, DotsTile, MusicTile, StepsTile } from "./instruments";
import { NowLine } from "./now-line";
import { LagosTime } from "./lagos-time";

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

/** The foot of every page: one quiet row on the page's left edge. Who made
 it, the time where it was made, what was playing while it was (the music
 tile's feed), and the way back up. */
export function DFloor({ className = "" }: { className?: string }) {
 return (
 <div className={`mt-24 pb-10 ${className}`}>
 <p className="flex flex-col gap-2 font-sans text-xs text-ink-3 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-6">
 <span className="shrink-0">© {new Date().getFullYear()} Damilare Osofisan</span>
 <LagosTime />
 <NowLine />
 <a href="#top" className="shrink-0 transition-colors hover:text-ink sm:ml-auto">
 Back to top ↑
 </a>
 </p>
 </div>
 );
}
