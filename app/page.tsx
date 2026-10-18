import type { Metadata } from "next";
import Link from "next/link";
import { DFooter } from "@/components/dfooter";
import { DNav } from "@/components/dnav";
import { ExplorationsRail } from "@/components/explorations-rail";

export const metadata: Metadata = {
 title: { absolute: "Damilare Osofisan — Software Designer" },
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
 img: "/dossier/work/hitman/hitman-cover.gif",
 poster: "/dossier/work/hitman/hitman-cover-poster.jpg",
 alt: "Hitman's Library shelf mark and wordmark",
 still: true,
 fit: "contain",
 bg: "#ececec",
 width: 1600,
 height: 1000,
 },
 {
 slug: "sylvan",
 title: "Sylvan",
 sub: "Revenue intelligence for modern teams",
 img: "/dossier/work/sylvan/sylvan-cover.gif",
 poster: "/dossier/work/sylvan/sylvan-cover-poster.jpg",
 alt: "Sylvan signal marks",
 still: true,
 width: 1600,
 height: 1000,
 },
 {
 slug: "endgame",
 title: "Endgame",
 sub: "Product design",
 img: "/dossier/work/endgame/endgame-cover.gif",
 poster: "/dossier/work/endgame/endgame-cover-poster.jpg",
 alt: "Endgame E mark in stars and stripes",
 still: true,
 width: 1600,
 height: 1000,
 },
 {
 slug: "chessever",
 title: "ChessEver",
 sub: "Live tournaments, players & standings",
 img: "/dossier/work/chessever/chessever-cover.gif",
 poster: "/dossier/work/chessever/chessever-cover-poster.jpg",
 alt: "ChessEver rookie rook mark",
 still: true,
 width: 1920,
 height: 1200,
 },
];

export default function Home() {
 return (
 <main className="bg-bg text-ink">
 <DNav />
 <div id="top" className="mx-auto w-full max-w-[600px] scroll-mt-20 px-5 pb-10">
 {/* ── header ── */}
 <header className="mt-6">
 <h1 className="sr-only">Damilare Osofisan — Software Designer</h1>
 <p className="font-sans text-sm font-medium text-ink">I like figuring things out.</p>
 <p className="mt-4 text-pretty font-sans text-sm leading-normal">
 I design and build digital products across web and mobile.
 I&apos;ve worked in product, brand and web design at{" "}
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
 <p className="mt-4 text-pretty font-sans text-sm leading-normal text-ink-2">
 <a
 href="mailto:dosofisan7@gmail.com"
 className="link-sheen"
 >
 email
 </a>
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
 href="https://github.com/damilareoo"
 target="_blank"
 rel="noopener noreferrer"
 className="link-sheen"
 >
 github
 </a>
 {" / "}
 <a
 href="https://www.linkedin.com/in/damilareoo"
 target="_blank"
 rel="noopener noreferrer"
 className="link-sheen"
 >
 linkedin
 </a>
 {" / "}
 <a
 href="https://www.are.na/damilare-osofisan"
 target="_blank"
 rel="noopener noreferrer"
 className="link-sheen"
 >
 are.na
 </a>
 </p>
 </header>

 {/* ── work ── */}
 <section aria-label="Work" id="work" className="mt-12 scroll-mt-20">
 <h2 className="font-sans text-sm font-medium">[Work]</h2>
 <div className="mt-3 space-y-8">
 {WORK.map((w, i) => (
 <div key={w.slug}>
 <Link
 href={`/work/${w.slug}`}
 aria-label={`${w.title} — ${w.sub}`}
 className="group relative block overflow-hidden bg-surface-2 ring-1 ring-line"
 >
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img
 src={w.img}
 alt={w.alt}
 width={"width" in w ? (w.width as number) : 1600}
 height={"height" in w ? (w.height as number) : 1000}
 loading={i === 0 ? "eager" : "lazy"}
 fetchPriority={i === 0 ? "high" : "auto"}
 decoding="async"
 style={
 "poster" in w && w.poster
 ? {
 backgroundImage: `url(${w.poster as string})`,
 backgroundSize: "fit" in w && w.fit === "contain" ? "contain" : "cover",
 backgroundPosition: "center",
 backgroundRepeat: "no-repeat",
 ...("bg" in w && w.bg ? { backgroundColor: w.bg as string } : { backgroundColor: "var(--surface-2)" }),
 }
 : "bg" in w && w.bg
 ? { background: w.bg as string }
 : { background: "var(--surface-2)" }
 }
 className={`aspect-[16/10] w-full ${"fit" in w && w.fit === "contain" ? "object-contain" : "object-cover"} ${"still" in w && w.still ? "" : "transition-transform duration-500 group-hover:scale-[1.02]"}`}
 />
 </Link>
 <p className="mt-2 font-sans text-sm">
 <Link href={`/work/${w.slug}`} className="font-medium link-sheen">
 {w.title}
 </Link>
 </p>
 <p className="font-sans text-sm text-ink-2">{w.sub}</p>
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
