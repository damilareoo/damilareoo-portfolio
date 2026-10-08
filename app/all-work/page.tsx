import type { Metadata } from "next";
import { DFooter } from "@/components/dfooter";
import { DNav } from "@/components/dnav";
import { MixedFeed } from "@/components/mixed-feed";
import { dossier } from "@/data/dossier";

/**
 * DRAFT — not linked from anywhere, noindex. The emisho.work move in
 * our language: one sticky filter pill (All / Case studies / Shots /
 * Explorations, honest counts), one mixed feed, load more. Compare
 * against /work-upfront (wall-first) and / (sections).
 */
export const metadata: Metadata = {
  title: "DRAFT — all work, one feed",
  robots: { index: false, follow: false },
};

export default function AllWorkDraft() {
  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <DNav />
      <div id="top" className="mx-auto w-full max-w-[600px] scroll-mt-20 px-5 pb-10">
        <header className="mt-6">
          <p className="font-sans text-sm font-medium text-[#171717] dark:text-[#f2f2f2]">I like figuring things out.</p>
          <p className="mt-4 text-pretty font-sans text-sm leading-relaxed">
            I design and build digital products across web and mobile.
            I&apos;ve worked across product, brand and web at{" "}
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
            .
          </p>
        </header>

        <MixedFeed shots={dossier.shots} />

        <DFooter />
      </div>
    </main>
  );
}
