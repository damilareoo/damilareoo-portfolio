import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shots lab",
  robots: { index: false, follow: false },
};

const PROTOS = [
  { href: "/shots", n: "01", name: "grid", note: "mode one. the masonry stack that stays." },
  { href: "/shots/lab/index-preview", n: "02", name: "numeric index + preview", note: "64 numbered rows, frame follows the cursor. TWOMUCH, de-labeled." },
  { href: "/shots/lab/morph", n: "03", name: "index ⇄ grid morph", note: "one toggle, everything glides to its new home. Codrops menu-to-grid." },
  { href: "/shots/lab/flicker", n: "04", name: "rapid flicker", note: "full-bleed scroll-driven flicker, release to land. Codrops rapid layers." },
  { href: "/shots/lab/spotlight", n: "05", name: "spotlight develop", note: "dark wall, cursor develops frames. Evervault mask technique." },
  { href: "/shots/lab/accordion", n: "06", name: "expanding accordion", note: "filmstrip slices bloom under the cursor. hover to expand, tap open." },
  { href: "/shots/lab/stack", n: "07", name: "sticky stack", note: "frames pile as you scroll. pure scroll, nothing to learn." },
  { href: "/shots/lab/editorial", n: "08", name: "editorial rhythm", note: "lookbook cadence: hero, duo, trio, offset. space does the work." },
  { href: "/shots/lab/scrub", n: "09", name: "scrub rail", note: "a timeline: drag to scrub all 64 like footage." },
  { href: "/shots/lab/carousel", n: "10", name: "snap carousel", note: "center stage, neighbors peeking. the middle frame is always the one." },
  { href: "/shots/lab/chapters", n: "11", name: "chapter rails", note: "the set's project grouping, surfaced. one snap rail per ghost number." },
  { href: "/shots/lab/dice", n: "12", name: "dice", note: "one full-bleed frame, tap for another. randomness is the interaction." },
  { href: "/shots/lab/cinema", n: "13", name: "cinema", note: "slow Ken Burns crossfade that plays itself. hover holds it." },
  { href: "/shots/lab/peek", n: "14", name: "press-to-peek", note: "hold to lift near-fullscreen, release to settle. tap pins." },
  { href: "/shots/lab/develop", n: "15", name: "develop-in", note: "frames resolve from block fields on scroll. steps-tile family." },
  { href: "/shots/lab/wipe", n: "16", name: "wipe-to-clear", note: "every frame starts frosted; first pass wipes it clear. harbour dialect." },
  { href: "/shots/lab/gravity", n: "17", name: "gravity field", note: "frames lean toward the cursor and settle behind it. ambient physics." },
  { href: "/shots/lab/rivers", n: "18", name: "rivers", note: "three drifts against each other. hover stills one. alive on arrival." },
  { href: "/shots/lab/sequence", n: "19", name: "fullbleed sequence", note: "one frame per viewport, snap scroll. a film, not a page." },
  { href: "/shots/lab/waterfall", n: "20", name: "waterfall", note: "three vertical falls drifting against each other. never sits still." },
  { href: "/shots/lab/justified", n: "21", name: "justified bands", note: "full-bleed rows, heights cycling. nothing cropped, nothing gapped." },
  { href: "/shots/lab/pages", n: "22", name: "paged book", note: "eight frames to a page. finite, calm, a book not a feed." },
  { href: "/shots/lab/twin", n: "23", name: "twin rails", note: "two snap rails, evens one way, odds the other." },
  { href: "/shots/lab/cover", n: "24", name: "cover + mosaic", note: "one hero holds the stage; the mosaic below feeds it." },
  { href: "/shots/lab/focus", n: "25", name: "focus grid", note: "tap a tile and it grows in place. tap again for fullscreen." },
  { href: "/shots/lab/hue", n: "26", name: "hue spectrum", note: "the wall sorted by average hue. colour is the wayfinding." },
  { href: "/shots/lab/cascade", n: "27", name: "shuffle cascade", note: "one tap, every tile glides to its new home. serendipity on tap." },
  { href: "/shots/lab/loupe", n: "28", name: "loupe", note: "contact sheet plus a magnifier that rides the cursor. archivist energy." },
  { href: "/shots/lab/slots", n: "29", name: "slots", note: "three reels spin and settle staggered. tap a column to read it." },
  { href: "/shots/lab/flip", n: "30", name: "detail flip", note: "every tile two-sided: frame, then 2× detail. the work, then the craft." },
  { href: "/shots/lab/panorama", n: "31", name: "panorama band", note: "one gapless ultra-wide band. no cards, no corners, no gutters." },
  { href: "/shots/lab/breathe", n: "32", name: "breathing wave", note: "a swell rolls through on its own. the page inhales untouched." },
  { href: "/shots/lab/scatter", n: "33", name: "scatter pile", note: "tossed on the table. drag any frame anywhere; tap opens it." },
  { href: "/shots/lab/density", n: "34", name: "density slider", note: "the grid is a zoom level: one thumb, one to six columns." },
  { href: "/shots/lab/entrance", n: "35", name: "staggered entrance", note: "a blur-fade cascade on load, then perfectly still." },
  { href: "/shots/lab/coverflow", n: "36", name: "coverflow", note: "the classic, straight: center front, neighbors receding with mirrors." },
  { href: "/shots/lab/scrubbar", n: "37", name: "scrub bar", note: "one fullscreen frame and a single hairline. the bar is the interface." },
  { href: "/shots/lab/velocity", n: "38", name: "velocity skew", note: "tiles shear with scroll speed, snap straight at rest. a VU meter." },
  { href: "/shots/lab/dip", n: "39", name: "dip slideshow", note: "frames dissolving through black. deliberate, not frantic." },
  { href: "/shots/lab/wander", n: "40", name: "wandering light", note: "a lit cell roams on its own; hover takes the wheel." },
  { href: "/shots/lab/anchor", n: "41", name: "anchor rail", note: "numbered spine jumps the wall. photographer pattern." },
  { href: "/shots/lab/typejump", n: "42", name: "type-to-jump", note: "digits dial a frame like a combination lock. no visible interface." },
  { href: "/shots/lab/compass", n: "43", name: "compass dial", note: "drag the ring, angle maps to position. navigation as instrument." },
  { href: "/shots/lab/stepper", n: "44", name: "stepper", note: "leap in tens across 64. shift-arrow energy, touch friendly." },
  { href: "/shots/lab/parallax", n: "45", name: "parallax layers", note: "locomotive dialect: depth lanes drift against scroll." },
  { href: "/shots/lab/scrolljack", n: "46", name: "scrolljack horizontal", note: "the wheel goes down, the work goes sideways." },
  { href: "/shots/lab/crossfade", n: "47", name: "pinned crossfade", note: "scrollytelling stage: scroll dissolves frame into frame." },
  { href: "/shots/lab/progressrail", n: "48", name: "progress rail", note: "hairline spine marks depth; tap it to dive anywhere." },
  { href: "/shots/lab/chapterdips", n: "49", name: "chapter dips", note: "project clusters separated by black beats. punctuation as rhythm." },
  { href: "/shots/lab/stickyzoom", n: "50", name: "sticky zoom", note: "each frame swells toward you in turn. one at a time, large." },
  { href: "/shots/lab/metronome", n: "51", name: "metronome", note: "fullscreen on a steady beat, pulse ring marking time." },
  { href: "/shots/lab/slowdrift", n: "52", name: "slow drift", note: "eight-second pans. for looking, not browsing." },
  { href: "/shots/lab/shuffleplay", n: "53", name: "shuffle play", note: "random fullscreen sliding in alternating sides. a station." },
  { href: "/shots/lab/pingpong", n: "54", name: "ping-pong", note: "01→64→01 forever. direction reverses at the edges." },
  { href: "/shots/lab/holdadvance", n: "55", name: "hold to advance", note: "press and frames pour past; release lands. throttle as interaction." },
  { href: "/shots/lab/magnetic", n: "56", name: "magnetic cursor", note: "one frame trails the pointer, always half a step behind." },
  { href: "/shots/lab/splitwipe", n: "57", name: "split wipe", note: "cursor x wipes between neighbors. compare by moving." },
  { href: "/shots/lab/tiltwall", n: "58", name: "tilt wall", note: "the wall banks toward the pointer; depths shift apart." },
  { href: "/shots/lab/ripple", n: "59", name: "ripple", note: "tap fires a ring from that point, lifting tiles as it passes." },
  { href: "/shots/lab/echotrail", n: "60", name: "echo trail", note: "your last five frames follow the cursor as a fading comet." },
  { href: "/shots/lab/edgezones", n: "61", name: "edge zones", note: "park at the screen edge and the rail drives itself." },
  { href: "/shots/lab/flicktoss", n: "62", name: "flick toss", note: "throw the fullscreen frame; release velocity flies frames past." },
  { href: "/shots/lab/brick", n: "63", name: "brick weave", note: "offset courses, alternating widths. masonry's orderly cousin." },
  { href: "/shots/lab/diagonal", n: "64", name: "diagonal stack", note: "rows slide downhill. order reads like a staircase." },
  { href: "/shots/lab/orbit", n: "65", name: "orbit ring", note: "the set strung on an ellipse you drag around. real geometry." },
  { href: "/shots/lab/collage", n: "66", name: "overlap collage", note: "heroes, halves, quarters overlapping. tap rises to the top." },
  { href: "/shots/lab/baseline", n: "67", name: "baseline row", note: "everything on one baseline like type. scroll along the line." },
  { href: "/shots/lab/triangle", n: "68", name: "triangle", note: "rows of 1-2-3-4 widening down. monumental order." },
  { href: "/shots/lab/mirrorpairs", n: "69", name: "mirror pairs", note: "odd rows run right-to-left. the eye snakes down." },
  { href: "/shots/lab/abab", n: "70", name: "ABAB rhythm", note: "statement, pair, statement, pair. regularity is the design." },
  { href: "/shots/lab/piles", n: "71", name: "project piles", note: "eighteen fanned piles; tap to spread a project's frames." },
  { href: "/shots/lab/huebands", n: "72", name: "hue bands", note: "vivid leads, monochrome closes. a gradient you browse." },
  { href: "/shots/lab/lightdark", n: "73", name: "light / dark split", note: "day shift on light, night shift on black. two weathers." },
  { href: "/shots/lab/dealin", n: "74", name: "deal-in", note: "the wall deals itself on arrival, then sits still." },
  { href: "/shots/lab/sorttoggle", n: "75", name: "sort toggle", note: "projects ⇄ hue ⇄ random. the reflow is the show." },
  { href: "/shots/lab/splitviewer", n: "76", name: "split viewer", note: "two frames, stepping independently. the seam never moves." },
  { href: "/shots/lab/zoomviewer", n: "77", name: "zoom viewer", note: "fullscreen with loupe: scroll to 4×, drag to pan the grain." },
  { href: "/shots/lab/stripviewer", n: "78", name: "strip viewer", note: "stage plus filmstrip that follows. theatre with orchestra." },
  { href: "/shots/lab/timedviewer", n: "79", name: "timed viewer", note: "ring timer drains per frame; tap resets the clock. broadcast pacing." },
  { href: "/shots/lab/driftfield", n: "80", name: "drift field", note: "every tile floats its own slow sine. never holds still." },
  { href: "/shots/lab/pulsediag", n: "81", name: "pulse diagonal", note: "brightness sweeps corner to corner. light walks the wall." },
  { href: "/shots/lab/swaptide", n: "82", name: "swap tide", note: "two random tiles trade places every few seconds." },
  { href: "/shots/lab/fireflies", n: "83", name: "fireflies", note: "random tiles glow and fade. the wall winks at you." },
  { href: "/shots/lab/countup", n: "84", name: "count-up", note: "a counter runs 01→64 and the wall scrolls itself to match." },
  { href: "/shots/lab/canvas", n: "85", name: "infinite canvas", note: "the set as a map: drag to travel, scroll to dive 64→1." },
  { href: "/shots/lab/pairs", n: "86", name: "fullbleed pairs", note: "two stacked fullbleeds per screen. compare as you go." },
  { href: "/shots/lab/edgebleed", n: "87", name: "edge bleed", note: "frames wider than the viewport, bleeding off. generous to a fault." },
  { href: "/shots/lab/scalecontrast", n: "88", name: "scale contrast", note: "stamp, billboard, stamp, billboard. small makes large enormous." },
  { href: "/shots/lab/stickyduo", n: "89", name: "sticky duo", note: "pairs hold the viewport, then slide over. company all the way down." },
  { href: "/shots/lab/loopcol", n: "90", name: "loop column", note: "one column, endless: past 64 you're back at 01." },
  { href: "/shots/lab/versus", n: "91", name: "versus", note: "two frames, tap the winner. taste, gamified." },
  { href: "/shots/lab/flash", n: "92", name: "flash", note: "black wall; every tap detonates one frame for a heartbeat." },
  { href: "/shots/lab/tray", n: "93", name: "visited tray", note: "everything you open stays in a re-tappable tray at the bottom." },
  { href: "/shots/lab/counterscroll", n: "94", name: "counter-scroll", note: "left column descends while the right ascends off one scroll." },
  { href: "/shots/lab/curtain", n: "95", name: "curtain reveal", note: "blinds part per tile on scroll into view. theatre curtains." },
  { href: "/shots/lab/blink", n: "96", name: "blink cascade", note: "the wall blinks awake diagonally, then holds still." },
  { href: "/shots/lab/mirrorgrid", n: "97", name: "mirror grid", note: "twin grids across a seam, scrolling as one." },
  { href: "/shots/lab/focuspull", n: "98", name: "focus pull", note: "one frame sharp, the rest in blur; sharpness follows you." },
  { href: "/shots/lab/slit", n: "99", name: "slit scan", note: "only the viewport's middle band is ever lit. a scanner reading." },
  { href: "/shots/lab/moment", n: "100", name: "the moment", note: "one frame per hour, reseeded by the clock. time decides." },
];

/** Backstage index for the shots interaction prototypes. Lab only. */
export default function ShotsLabPage() {
  return (
    <main className="mx-auto w-full max-w-[720px] px-5 py-16">
      <p className="font-mono text-xs text-[#767676] dark:text-[#8a8a8a]">shots / lab</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">four ways to browse 64 frames</h1>
      <ol className="mt-8 space-y-3">
        {PROTOS.map((p) => (
          <li key={p.href}>
            <Link
              href={p.href}
              className="group flex items-baseline gap-4 rounded-xl p-4 ring-1 ring-[#e5e5e5] transition-colors hover:bg-white dark:ring-white/10 dark:hover:bg-[#1e1e1e]"
            >
              <span className="font-mono text-sm text-[#767676] dark:text-[#8a8a8a]">{p.n}</span>
              <span>
                <span className="block text-base font-medium">{p.name}</span>
                <span className="block text-sm text-[#767676] dark:text-[#8a8a8a]">{p.note}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-8">
        <Link href="/shots" className="text-sm text-[#767676] underline dark:text-[#8a8a8a]">← back to shots</Link>
      </p>
    </main>
  );
}
