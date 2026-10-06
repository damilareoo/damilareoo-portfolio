import type { Metadata } from "next";
import Link from "next/link";
import { DFooter } from "@/components/dfooter";
import { DNav } from "@/components/dnav";

export const metadata: Metadata = {
  title: { absolute: "Damilare Osofisan — Product Designer" },
  description:
    "Damilare Osofisan — product designer building 0–1 products. Currently building Hitman's Library. Previously Endgame.ai, ChessEver, HEX.",
  openGraph: {
    type: "website",
    siteName: "Damilare Osofisan",
  },
  twitter: {
    card: "summary_large_image",
  },
};

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

const EXPLORATIONS = [
  {
    slug: "nothing-pedometer",
    exhibit: "Exploration 01",
    title: "Nothing Pedometer",
    sub: "Interaction concept — widget to run to poster",
    video: {
      src: "/dossier/explorations/nothing-pedometer/nothing-pedometer-concept.mp4",
      poster: "/dossier/explorations/nothing-pedometer/nothing-pedometer-poster.png",
    },
  },
  {
    slug: "workbench",
    exhibit: "Exploration 02",
    title: "Workbench",
    sub: "Live canvas — open and arrange",
    embed: "https://nacre-quake-50137672.figma.site/",
  },
];

export default function Home() {
  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <DNav />
      <div id="top" className="mx-auto w-full max-w-[600px] scroll-mt-20 px-5 pb-10">
        {/* ── header ── */}
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
          <p className="mt-4 text-pretty font-sans text-sm leading-relaxed">
            Now I&apos;m building{" "}
            <Link
              href="/work/hitmans-library"
              className="link-sheen"
            >
              Hitman&apos;s Library
            </Link>
            , a growing collection of things on the web I don&apos;t want to
            forget.
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

        {/* ── work ── */}
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

        {/* ── explorations — swipe rail, playground card layout ── */}
        <section aria-label="Explorations" className="mt-12">
          <div className="flex items-baseline justify-between">
            <h2 className="font-sans text-sm font-medium">Explorations</h2>
            <p aria-hidden className="font-mono text-xs uppercase tracking-widest text-[#767676] dark:text-[#8a8a8a]">
              Swipe →
            </p>
          </div>
          <div className="mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {EXPLORATIONS.map((e, i) => (
              <article
                key={e.slug}
                className="w-[85%] shrink-0 snap-start rounded-2xl bg-[#e8e8e6] p-4 ring-1 ring-[#e0e0de]"
              >
                <div className="flex items-baseline justify-between font-mono text-xs uppercase tracking-widest text-[#55534f]">
                  <span>{e.exhibit}</span>
                  <span aria-hidden>[{String(i + 1).padStart(2, "0")}]</span>
                </div>
                <div className="mt-3 h-80 overflow-hidden rounded-xl bg-[#0b0b0d]">
                  {"video" in e && e.video ? (
                    <video
                      src={e.video.src}
                      poster={e.video.poster}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      aria-label={`${e.title} interaction concept film`}
                      className="mx-auto h-full w-auto"
                    />
                  ) : "embed" in e && e.embed ? (
                    <iframe
                      src={e.embed}
                      title={`${e.title} — live canvas`}
                      loading="lazy"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      className="h-full w-full border-0 bg-white"
                    />
                  ) : null}
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-2 font-mono text-xs uppercase tracking-widest text-[#55534f]">
                  <span className="truncate">{e.title}</span>
                  {"embed" in e && e.embed ? (
                    <a
                      href={e.embed}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 underline decoration-[#b9b9b6] underline-offset-2"
                    >
                      Open live ↗
                    </a>
                  ) : (
                    <span aria-hidden className="shrink-0">Concept film</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <DFooter />
      </div>
    </main>
  );
}
