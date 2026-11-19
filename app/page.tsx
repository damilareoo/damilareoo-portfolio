import type { Metadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";
import { CoverPeek } from "@/components/cover-peek";
import { DFooter } from "@/components/dfooter";
import { ContactLinks } from "@/components/contact-links";
import { DNav } from "@/components/dnav";
import { ExplorationsRail } from "@/components/explorations-rail";
import { webp } from "@/components/pic";
import { dossier } from "@/data/dossier";

export const metadata: Metadata = {
 title: { absolute: "Damilare Osofisan — Software Designer" },
 description:
 "Damilare Osofisan — software designer building 0–1 products. Currently building Hitman's Library. Previously Endgame.ai, ChessEver, HEX.",
 openGraph: {
 type: "website",
 siteName: "Damilare Osofisan",
 },
 twitter: {
 card: "summary_large_image",
 },
};

const WORK = dossier.workCovers;

/* The product, in motion, behind each cover. Prototype mapping: these are the
   clips already on disk, and two of them are far heavier than a hover should
   cost — they would be cut down to short, small loops before shipping. */
const PEEK: Record<string, string> = {
 "hitmans-library": "/dossier/work/hitman/hitman-k-panel.mp4",
 sylvan: "/dossier/work/sylvan/sylvan-cover.mp4",
 endgame: "/dossier/work/endgame/endgame-theme.mov",
};

export default function Home() {
 return (
 <main className="bg-bg text-ink">
 <DNav />
 <div id="top" className="mx-auto w-full max-w-[600px] scroll-mt-20 px-5 pb-10">
 {/* ── header ── */}
 <header className="mt-6">
 <h1 className="sr-only">Damilare Osofisan — Software Designer</h1>
 <p className="font-sans text-sm font-medium text-ink">
 Software designer building 0–1 products.
 </p>
 <p className="mt-4 text-pretty font-sans text-sm leading-normal">
 I like figuring things out. I design and build digital products on web and mobile,
 and I&apos;ve worked across product, brand and web design at{" "}
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
 <p className="mt-4 font-sans text-sm leading-normal text-ink-2">
 Currently building{" "}
 <Link href="/work/hitmans-library" className="link-sheen">
 Hitman&apos;s Library
 </Link>
 {" "}— open to new work.
 </p>
 <ContactLinks className="mt-4" />
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
 {/* The cover is the object that carries over: opening a case
     study grows it into that page's lead frame. */}
 <ViewTransition name={`work-${w.slug}`} share="morph" default="none">
 <CoverPeek clip={PEEK[w.slug]}>
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
 backgroundImage: `url(${webp(w.poster as string)})`,
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
 </CoverPeek>
 </ViewTransition>
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
