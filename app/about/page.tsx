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
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <WayBack />
      <div id="top" className="mx-auto w-full max-w-[600px] scroll-mt-20 px-5 pb-10">
        <div className="pt-8">
          <p className="text-xs tracking-wide text-[#767676] dark:text-[#8a8a8a]">About</p>
          <h1 className="sr-only">About Damilare Osofisan</h1>
        </div>

        <div className="mt-8">
          <PhotoDeck />
        </div>

        <div className="mt-8 space-y-5 text-pretty font-sans text-sm leading-relaxed">
          <p className="font-medium text-[#171717] dark:text-[#f2f2f2]">
            I&apos;m Damilare Osofisan.
          </p>
          <p className="font-medium text-[#171717] dark:text-[#f2f2f2]">
            I like making things and figuring out how they work.
          </p>
          <p>
            I&apos;ve worked across product, web and brand at{" "}
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
            </a>{" "}
            and{" "}
            <a
              href="https://endgame.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="link-sheen sheen-endgame"
            >
              endgame.ai
            </a>
            . I like being involved early, when there&apos;s still a lot to
            figure out.
          </p>
          <p>
            Outside of work, I&apos;m usually around music, basketball,{" "}
            <Badge word="football" cover="/dossier/badges/chelsea.svg" /> or chess. I listen to a lot of{" "}
            <Vinyl word="9ice" cover="/dossier/vinyl/9ice-gongo-aso.jpg" sheen="sheen-9ice" />{" "}
            and <Vinyl word="Skepta" cover="/dossier/vinyl/skepta-ignorance.jpg" sheen="sheen-skepta" />,
            love clothes, and DJ sometimes.
          </p>
          <p>
            I believe in myself. Maybe a little too much. It keeps me going.
          </p>
          <p className="font-medium text-[#171717] dark:text-[#f2f2f2]">
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
