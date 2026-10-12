import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Playground lab",
  robots: { index: false, follow: false },
};

const PROTOS = [
  { href: "/playground", n: "01", name: "grid", note: "mode one. the masonry stack that stays." },
  { href: "/playground/lab/index-preview", n: "02", name: "numeric index + preview", note: "66 numbered rows, frame follows the cursor. TWOMUCH, de-labeled." },
  { href: "/playground/lab/morph", n: "03", name: "index ⇄ grid morph", note: "one toggle, everything glides to its new home. Codrops menu-to-grid." },
  { href: "/playground/lab/flicker", n: "04", name: "rapid flicker", note: "full-bleed scroll-driven flicker, release to land. Codrops rapid layers." },
  { href: "/playground/lab/spotlight", n: "05", name: "spotlight develop", note: "dark wall, cursor develops frames. Evervault mask technique." },
  { href: "/playground/lab/accordion", n: "06", name: "expanding accordion", note: "filmstrip slices bloom under the cursor. hover to expand, tap open." },
  { href: "/playground/lab/stack", n: "07", name: "sticky stack", note: "frames pile as you scroll. pure scroll, nothing to learn." },
  { href: "/playground/lab/editorial", n: "08", name: "editorial rhythm", note: "lookbook cadence: hero, duo, trio, offset. space does the work." },
  { href: "/playground/lab/scrub", n: "09", name: "scrub rail", note: "a timeline: drag to scrub all 66 like footage." },
  { href: "/playground/lab/carousel", n: "10", name: "snap carousel", note: "center stage, neighbors peeking. the middle frame is always the one." },
  { href: "/playground/lab/chapters", n: "11", name: "chapter rails", note: "the set's project grouping, surfaced. one snap rail per ghost number." },
  { href: "/playground/lab/dice", n: "12", name: "dice", note: "one full-bleed frame, tap for another. randomness is the interaction." },
  { href: "/playground/lab/cinema", n: "13", name: "cinema", note: "slow Ken Burns crossfade that plays itself. hover holds it." },
  { href: "/playground/lab/peek", n: "14", name: "press-to-peek", note: "hold to lift near-fullscreen, release to settle. tap pins." },
  { href: "/playground/lab/develop", n: "15", name: "develop-in", note: "frames resolve from block fields on scroll. steps-tile family." },
  { href: "/playground/lab/wipe", n: "16", name: "wipe-to-clear", note: "every frame starts frosted; first pass wipes it clear. harbour dialect." },
  { href: "/playground/lab/gravity", n: "17", name: "gravity field", note: "frames lean toward the cursor and settle behind it. ambient physics." },
  { href: "/playground/lab/rivers", n: "18", name: "rivers", note: "three drifts against each other. hover stills one. alive on arrival." },
  { href: "/playground/lab/sequence", n: "19", name: "fullbleed sequence", note: "one frame per viewport, snap scroll. a film, not a page." },
  { href: "/playground/lab/waterfall", n: "20", name: "waterfall", note: "three vertical falls drifting against each other. never sits still." },
  { href: "/playground/lab/justified", n: "21", name: "justified bands", note: "full-bleed rows, heights cycling. nothing cropped, nothing gapped." },
  { href: "/playground/lab/pages", n: "22", name: "paged book", note: "eight frames to a page. finite, calm, a book not a feed." },
  { href: "/playground/lab/twin", n: "23", name: "twin rails", note: "two snap rails, evens one way, odds the other." },
  { href: "/playground/lab/cover", n: "24", name: "cover + mosaic", note: "one hero holds the stage; the mosaic below feeds it." },
  { href: "/playground/lab/focus", n: "25", name: "focus grid", note: "tap a tile and it grows in place. tap again for fullscreen." },
  { href: "/playground/lab/hue", n: "26", name: "hue spectrum", note: "the wall sorted by average hue. colour is the wayfinding." },
  { href: "/playground/lab/cascade", n: "27", name: "shuffle cascade", note: "one tap, every tile glides to its new home. serendipity on tap." },
  { href: "/playground/lab/loupe", n: "28", name: "loupe", note: "contact sheet plus a magnifier that rides the cursor. archivist energy." },
  { href: "/playground/lab/slots", n: "29", name: "slots", note: "three reels spin and settle staggered. tap a column to read it." },
  { href: "/playground/lab/flip", n: "30", name: "detail flip", note: "every tile two-sided: frame, then 2× detail. the work, then the craft." },
  { href: "/playground/lab/panorama", n: "31", name: "panorama band", note: "one gapless ultra-wide band. no cards, no corners, no gutters." },
  { href: "/playground/lab/breathe", n: "32", name: "breathing wave", note: "a swell rolls through on its own. the page inhales untouched." },
  { href: "/playground/lab/scatter", n: "33", name: "scatter pile", note: "tossed on the table. drag any frame anywhere; tap opens it." },
  { href: "/playground/lab/density", n: "34", name: "density slider", note: "the grid is a zoom level: one thumb, one to six columns." },
  { href: "/playground/lab/entrance", n: "35", name: "staggered entrance", note: "a blur-fade cascade on load, then perfectly still." },
  { href: "/playground/lab/coverflow", n: "36", name: "coverflow", note: "the classic, straight: center front, neighbors receding with mirrors." },
  { href: "/playground/lab/scrubbar", n: "37", name: "scrub bar", note: "one fullscreen frame and a single hairline. the bar is the interface." },
  { href: "/playground/lab/velocity", n: "38", name: "velocity skew", note: "tiles shear with scroll speed, snap straight at rest. a VU meter." },
  { href: "/playground/lab/dip", n: "39", name: "dip slideshow", note: "frames dissolving through black. deliberate, not frantic." },
  { href: "/playground/lab/wander", n: "40", name: "wandering light", note: "a lit cell roams on its own; hover takes the wheel." },
  { href: "/playground/lab/anchor", n: "41", name: "anchor rail", note: "numbered spine jumps the wall. photographer pattern." },
  { href: "/playground/lab/typejump", n: "42", name: "type-to-jump", note: "digits dial a frame like a combination lock. no visible interface." },
  { href: "/playground/lab/compass", n: "43", name: "compass dial", note: "drag the ring, angle maps to position. navigation as instrument." },
  { href: "/playground/lab/stepper", n: "44", name: "stepper", note: "leap in tens across 66. shift-arrow energy, touch friendly." },
  { href: "/playground/lab/parallax", n: "45", name: "parallax layers", note: "locomotive dialect: depth lanes drift against scroll." },
  { href: "/playground/lab/scrolljack", n: "46", name: "scrolljack horizontal", note: "the wheel goes down, the work goes sideways." },
  { href: "/playground/lab/crossfade", n: "47", name: "pinned crossfade", note: "scrollytelling stage: scroll dissolves frame into frame." },
  { href: "/playground/lab/progressrail", n: "48", name: "progress rail", note: "hairline spine marks depth; tap it to dive anywhere." },
  { href: "/playground/lab/chapterdips", n: "49", name: "chapter dips", note: "project clusters separated by black beats. punctuation as rhythm." },
  { href: "/playground/lab/stickyzoom", n: "50", name: "sticky zoom", note: "each frame swells toward you in turn. one at a time, large." },
  { href: "/playground/lab/metronome", n: "51", name: "metronome", note: "fullscreen on a steady beat, pulse ring marking time." },
  { href: "/playground/lab/slowdrift", n: "52", name: "slow drift", note: "eight-second pans. for looking, not browsing." },
  { href: "/playground/lab/shuffleplay", n: "53", name: "shuffle play", note: "random fullscreen sliding in alternating sides. a station." },
  { href: "/playground/lab/pingpong", n: "54", name: "ping-pong", note: "01→66→01 forever. direction reverses at the edges." },
  { href: "/playground/lab/holdadvance", n: "55", name: "hold to advance", note: "press and frames pour past; release lands. throttle as interaction." },
  { href: "/playground/lab/magnetic", n: "56", name: "magnetic cursor", note: "one frame trails the pointer, always half a step behind." },
  { href: "/playground/lab/splitwipe", n: "57", name: "split wipe", note: "cursor x wipes between neighbors. compare by moving." },
  { href: "/playground/lab/tiltwall", n: "58", name: "tilt wall", note: "the wall banks toward the pointer; depths shift apart." },
  { href: "/playground/lab/ripple", n: "59", name: "ripple", note: "tap fires a ring from that point, lifting tiles as it passes." },
  { href: "/playground/lab/echotrail", n: "60", name: "echo trail", note: "your last five frames follow the cursor as a fading comet." },
  { href: "/playground/lab/edgezones", n: "61", name: "edge zones", note: "park at the screen edge and the rail drives itself." },
  { href: "/playground/lab/flicktoss", n: "62", name: "flick toss", note: "throw the fullscreen frame; release velocity flies frames past." },
  { href: "/playground/lab/brick", n: "63", name: "brick weave", note: "offset courses, alternating widths. masonry's orderly cousin." },
  { href: "/playground/lab/diagonal", n: "64", name: "diagonal stack", note: "rows slide downhill. order reads like a staircase." },
  { href: "/playground/lab/orbit", n: "65", name: "orbit ring", note: "the set strung on an ellipse you drag around. real geometry." },
  { href: "/playground/lab/collage", n: "66", name: "overlap collage", note: "heroes, halves, quarters overlapping. tap rises to the top." },
  { href: "/playground/lab/baseline", n: "67", name: "baseline row", note: "everything on one baseline like type. scroll along the line." },
  { href: "/playground/lab/triangle", n: "68", name: "triangle", note: "rows of 1-2-3-4 widening down. monumental order." },
  { href: "/playground/lab/mirrorpairs", n: "69", name: "mirror pairs", note: "odd rows run right-to-left. the eye snakes down." },
  { href: "/playground/lab/abab", n: "70", name: "ABAB rhythm", note: "statement, pair, statement, pair. regularity is the design." },
  { href: "/playground/lab/piles", n: "71", name: "project piles", note: "eighteen fanned piles; tap to spread a project's frames." },
  { href: "/playground/lab/huebands", n: "72", name: "hue bands", note: "vivid leads, monochrome closes. a gradient you browse." },
  { href: "/playground/lab/lightdark", n: "73", name: "light / dark split", note: "day shift on light, night shift on black. two weathers." },
  { href: "/playground/lab/dealin", n: "74", name: "deal-in", note: "the wall deals itself on arrival, then sits still." },
  { href: "/playground/lab/sorttoggle", n: "75", name: "sort toggle", note: "projects ⇄ hue ⇄ random. the reflow is the show." },
  { href: "/playground/lab/splitviewer", n: "76", name: "split viewer", note: "two frames, stepping independently. the seam never moves." },
  { href: "/playground/lab/zoomviewer", n: "77", name: "zoom viewer", note: "fullscreen with loupe: scroll to 4×, drag to pan the grain." },
  { href: "/playground/lab/stripviewer", n: "78", name: "strip viewer", note: "stage plus filmstrip that follows. theatre with orchestra." },
  { href: "/playground/lab/timedviewer", n: "79", name: "timed viewer", note: "ring timer drains per frame; tap resets the clock. broadcast pacing." },
  { href: "/playground/lab/driftfield", n: "80", name: "drift field", note: "every tile floats its own slow sine. never holds still." },
  { href: "/playground/lab/pulsediag", n: "81", name: "pulse diagonal", note: "brightness sweeps corner to corner. light walks the wall." },
  { href: "/playground/lab/swaptide", n: "82", name: "swap tide", note: "two random tiles trade places every few seconds." },
  { href: "/playground/lab/fireflies", n: "83", name: "fireflies", note: "random tiles glow and fade. the wall winks at you." },
  { href: "/playground/lab/countup", n: "84", name: "count-up", note: "a counter runs 01→66 and the wall scrolls itself to match." },
  { href: "/playground/lab/canvas", n: "85", name: "infinite canvas", note: "the set as a map: drag to travel, scroll to dive 66→1." },
  { href: "/playground/lab/pairs", n: "86", name: "fullbleed pairs", note: "two stacked fullbleeds per screen. compare as you go." },
  { href: "/playground/lab/edgebleed", n: "87", name: "edge bleed", note: "frames wider than the viewport, bleeding off. generous to a fault." },
  { href: "/playground/lab/scalecontrast", n: "88", name: "scale contrast", note: "stamp, billboard, stamp, billboard. small makes large enormous." },
  { href: "/playground/lab/stickyduo", n: "89", name: "sticky duo", note: "pairs hold the viewport, then slide over. company all the way down." },
  { href: "/playground/lab/loopcol", n: "90", name: "loop column", note: "one column, endless: past 66 you're back at 01." },
  { href: "/playground/lab/versus", n: "91", name: "versus", note: "two frames, tap the winner. taste, gamified." },
  { href: "/playground/lab/flash", n: "92", name: "flash", note: "black wall; every tap detonates one frame for a heartbeat." },
  { href: "/playground/lab/tray", n: "93", name: "visited tray", note: "everything you open stays in a re-tappable tray at the bottom." },
  { href: "/playground/lab/counterscroll", n: "94", name: "counter-scroll", note: "left column descends while the right ascends off one scroll." },
  { href: "/playground/lab/curtain", n: "95", name: "curtain reveal", note: "blinds part per tile on scroll into view. theatre curtains." },
  { href: "/playground/lab/blink", n: "96", name: "blink cascade", note: "the wall blinks awake diagonally, then holds still." },
  { href: "/playground/lab/mirrorgrid", n: "97", name: "mirror grid", note: "twin grids across a seam, scrolling as one." },
  { href: "/playground/lab/focuspull", n: "98", name: "focus pull", note: "one frame sharp, the rest in blur; sharpness follows you." },
  { href: "/playground/lab/slit", n: "99", name: "slit scan", note: "only the viewport's middle band is ever lit. a scanner reading." },
  { href: "/playground/lab/moment", n: "100", name: "the moment", note: "one frame per hour, reseeded by the clock. time decides." },
];

/** Backstage index for the playground interaction prototypes. Lab only. */
export default function ShotsLabPage() {
  return (
    <main className="mx-auto w-full max-w-[720px] px-5 py-16">
      <p className="font-mono text-xs text-[#595959] dark:text-[#8a8a8a]">playground / lab</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">four ways to browse 66 frames</h1>
      <ol className="mt-8 space-y-3">
        {PROTOS.map((p) => (
          <li key={p.href}>
            <Link
              href={p.href}
              className="group flex items-baseline gap-4 rounded-xl p-4 ring-1 ring-[#e5e5e5] transition-colors hover:bg-white dark:ring-white/10 dark:hover:bg-[#1e1e1e]"
            >
              <span className="font-mono text-sm text-[#595959] dark:text-[#8a8a8a]">{p.n}</span>
              <span>
                <span className="block text-base font-medium">{p.name}</span>
                <span className="block text-sm text-[#595959] dark:text-[#8a8a8a]">{p.note}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-8">
        <Link href="/playground" className="text-sm text-[#595959] underline dark:text-[#8a8a8a]">← back to playground</Link>
      </p>
    </main>
  );
}
