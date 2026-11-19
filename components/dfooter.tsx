import { FooterWidgets } from "./footer-widgets";
import { ClockTile, DotsTile, MusicTile, StepsTile } from "./instruments";

/** Home footer: the four instruments, with the footer widgets as their
 second row, one panel. */
export function DFooter() {
 return (
 <footer className="mt-12">
 <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
 <ClockTile />
 <DotsTile />
 <StepsTile />
 <MusicTile />
 </div>

 <DFloor className="mt-4" />
 </footer>
 );
}

/** The foot of every page: two more instruments in the tiles' family (see
 FooterWidgets), at the tiles' width, on the page's left edge. */
export function DFloor({ className = "mt-12" }: { className?: string }) {
 return (
 <div className={`max-w-[600px] pb-10 ${className}`}>
 <FooterWidgets />
 </div>
 );
}
