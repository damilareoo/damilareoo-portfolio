import type { Metadata } from "next";
import Link from "next/link";
import { DFooter } from "@/components/dfooter";
import { DNav } from "@/components/dnav";
import { ExplorationsRail } from "@/components/explorations-rail";
import { ShotsWall } from "@/components/shots-wall";
import { dossier } from "@/data/dossier";

/**
 * DRAFT — not linked from anywhere, noindex. Rough idea only: what if
 * the homepage led with all the shots? Same header minus the library
 * line, then the unmodified wall, then work. Judge the rhythm here
 * before touching the real homepage.
 */
export const metadata: Metadata = {
  title: "DRAFT — work upfront",
  robots: { index: false, follow: false },
};

// Draft mirror of the homepage WORK list.
const WORK = [
  {
    slug: "hitmans-library",
    title: "Hitman's Library",
    sub: "A growing collection of web experiences",
    img: "/dossier/work/hitman/hitman-title.jpg",
    alt: "Hitman's Library shelf mark and wordmark",
    tint: "hitman",
  },
  {
    slug: "endgame",
    title: "Endgame",
    sub: "Product design — most recent role",
    img: "/dossier/work/endgame/endgame-og.png",
    alt: "Endgame.ai",
    tint: "rainbow",
  },
  {
    slug: "chessever",
    title: "ChessEver",
    sub: "Live tournaments, players & standings",
    img: "/dossier/work/chessever/17-lockup.jpg",
    alt: "ChessEver mark and wordmark",
    tint: "chessever",
  },
  {
    slug: "sylvan",
    title: "Sylvan",
    sub: "Revenue intelligence for modern teams",
    img: "/dossier/work/sylvan/sylvan-logo-full.jpg",
    alt: "Sylvan mark and wordmark",
    tint: "sylvan",
  },
];

export default function WorkUpfrontDraft() {
  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <DNav />
      <div id="top" className="mx-auto w-full max-w-[600px] scroll-mt-20 px-5 pb-10">
        {/* ── header (library line removed) ── */}
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

          <p className="mt-4 text-pretty font-sans text-sm leading-relaxed text-[#626262] dark:text-[#a8a8a8]">
            <Link href="/about" className="link-sheen">about</Link>
            {" / "}
            <Link href="/shots" className="link-sheen">shots</Link>
            {" / "}
            <a
              href="https://x.com/damilareoo"
              target="_blank"
              rel="noopener noreferrer"
              className="link-sheen"
            >
              x
            </a>
            {" / "}
            <a
              href="https://layers.to/damilareoo"
              target="_blank"
              rel="noopener noreferrer"
              className="link-sheen"
            >
              layers
            </a>
            {" / "}
            <a
              href="mailto:dosofisan7@gmail.com"
              className="link-sheen"
            >
              email
            </a>
          </p>
        </header>

        {/* ── the experiment: all shots, right up top ── */}
        <section aria-label="Shots upfront" className="mt-12">
          <ShotsWall shots={dossier.shots} />
        </section>

        {/* ── work, pushed below ── */}
        <section aria-label="Work" id="work" className="mt-12 scroll-mt-20">
          <h2 className="font-sans text-sm font-medium">Work</h2>
          <div className="mt-3 space-y-8">
            {WORK.map((w) => (
              <div key={w.slug}>
                <Link
                  href={`/work/${w.slug}`}
                  aria-label={`${w.title} — ${w.sub}`}
                  className="group relative block overflow-hidden rounded-lg ring-1 ring-[#e5e5e5] dark:ring-[#2b2b2b] bg-[#0c1f1c]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={w.img}
                    alt={w.alt}
                    loading="lazy"
                    className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  {"tint" in w && w.tint && (
                    <div
                      aria-hidden
                      className={`cover-${w.tint} pointer-events-none absolute inset-0`}
                    />
                  )}
                </Link>
                <p className="mt-2 font-sans text-sm">
                  <Link href={`/work/${w.slug}`} className="font-medium link-sheen">
                    {w.title}
                  </Link>
                </p>
                <p className="font-sans text-sm text-[#626262] dark:text-[#a8a8a8]">{w.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── explorations rail ── */}
        <ExplorationsRail />

        <DFooter />
      </div>
    </main>
  );
}
