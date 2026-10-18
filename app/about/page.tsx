import type { Metadata } from "next";
import { DFloor } from "@/components/dfooter";
import { HarbourReveal } from "@/components/harbour-reveal";
import { PhotoDeck } from "@/components/photo-deck";
import { WayBack } from "@/components/way-back";
import { Vinyl, Badge } from "@/components/vinyl";

export const metadata: Metadata = {
 title: "About",
 description: "About Damilare Osofisan, a product designer in Lagos building 0–1 products.",
};

export default function AboutPage() {
 return (
 <main className="bg-bg text-ink">
 <WayBack />
 <div id="top" className="mx-auto w-full max-w-[600px] scroll-mt-20 px-5 pb-10">
 <div className="pt-8">
 <p className="text-xs tracking-wide text-ink-3">[About]</p>
 <h1 className="sr-only">About Damilare Osofisan</h1>
 </div>

 <div className="mt-8">
 <PhotoDeck />
 </div>

 <div className="mt-8 space-y-5 text-pretty font-sans text-sm leading-normal">
 <p className="font-medium text-ink">
 I&apos;m Damilare Osofisan.
 </p>
 <p>
 I like making things, figuring out how they work, and seeing what they
 could become. Sometimes that&apos;s designing a product, building an app,
 trying out a new idea, or going down a rabbit hole because I got curious
 about something.
 </p>
 <p>
 I&apos;ve worked across product, web, and brand at{" "}
 <a
 href="https://hex.inc"
 target="_blank"
 rel="noopener noreferrer"
 className="link-sheen sheen-hex"
 >
 HEX
 </a>,{" "}
 <a
 href="https://chessever.com"
 target="_blank"
 rel="noopener noreferrer"
 className="link-sheen sheen-chessever"
 >
 ChessEver
 </a>, and{" "}
 <a
 href="https://endgame.ai"
 target="_blank"
 rel="noopener noreferrer"
 className="link-sheen sheen-endgame"
 >
 Endgame.ai
 </a>
 . I enjoy getting involved early, when there&apos;s still room to ask
 questions, try things out, and see where an idea goes.
 </p>
 <p>
 Outside of work, music is a big part of my life.{" "}
 <Vinyl word="9ice" cover="/dossier/vinyl/9ice-gongo-aso.jpg" sheen="sheen-9ice" />{" "}
 and <Vinyl word="Skepta" cover="/dossier/vinyl/skepta-ignorance.jpg" sheen="sheen-skepta" />{" "}
 are always in rotation. I&apos;ve been a{" "}
 <Badge word="Chelsea" cover="/dossier/badges/chelsea.svg" />{" "}
 fan since I was six, I enjoy playing basketball, and somewhere along the
 way, designing chess products got me interested in playing chess too. I
 love good clothes, and I&apos;m learning to DJ.
 </p>
 <p>
 I&apos;m curious about a lot of things, and I tend to follow that curiosity
 wherever it leads. Not everything turns into something, and that&apos;s
 fine. Sometimes it&apos;s just fun to see where it goes.
 </p>
 <p className="font-medium text-ink">
 I believe in myself. Maybe a little too much. It keeps me going.
 </p>
 <p className="font-medium text-ink">
 &ldquo;A ship in harbor is safe, but that is not what ships are
 built for.&rdquo;
 </p>
 </div>

 <section aria-label="Harbour" className="mt-6">
 <HarbourReveal />
 </section>

 <footer className="mt-10">
 <DFloor />
 </footer>
 </div>
 </main>
 );
}
