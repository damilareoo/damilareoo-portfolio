import type { Metadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";
import { notFound } from "next/navigation";
import { DFloor } from "@/components/dfooter";
import { CaseImage, CaseVideo } from "@/components/case-frame";
import { WayBack } from "@/components/way-back";
import { findCase, workCases } from "@/data/dossier-work";

/** Home-row covers, reused so the next-project cards show the same face
 as the front page.

  These point at the small builds (scripts/shrink-cover-gifs.py), not the
  originals. The rail is a strip of cards, not a hero: on a phone a card is
  about a third of the viewport, so the 1600px originals were five times the
  pixels anything could show. The full-size files are still what the front
  page uses, where the card is much larger. */
const COVERS: Record<string, { src: string; alt: string; fit?: "contain"; bg?: string }> = {
 "hitmans-library": { src: "/dossier/work/hitman/hitman-cover-sm.webp", alt: "Hitman's Library cover", fit: "contain", bg: "#ececec" },
 endgame: { src: "/dossier/work/endgame/endgame-cover-sm.webp", alt: "Endgame cover" },
 chessever: { src: "/dossier/work/chessever/chessever-cover-sm.webp", alt: "ChessEver cover" },
 sylvan: { src: "/dossier/work/sylvan/sylvan-cover-sm.webp", alt: "Sylvan cover" },
};

export function generateStaticParams() {
 return workCases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
 params,
}: {
 params: Promise<{ slug: string }>;
}): Promise<Metadata> {
 const { slug } = await params;
 const c = findCase(slug);
 if (!c) return { title: "Work" };
 return {
 title: `${c.name}`,
 description: c.oneLiner,
 openGraph: { images: [{ url: c.gallery[0]?.poster ?? c.gallery[0]?.src ?? c.logo }] },
 };
}

/**
 * Case file in Nelson's rhythm, Murat's architecture, Emisho's brief,
 * our voice: a fixed way back (button plus Esc), a breadcrumb plus Case
 * study marker, narrow title/lede/meta and a quick-scan brief — then the
 * cover, the story beats, and the rest of the run breaks wide, with a
 * fixed rail down long runs. Frames carry no labels, only their context
 * sentence. Every frame in the record renders: the files are proved present
 * at build time (data/dossier-work.test.ts), never by asking the runtime to
 * read a disk. A Worker has no disk to read, and a check that cannot pass
 * there silently blanks the whole run. No new type steps.
 */
export default async function WorkCasePage({
 params,
}: {
 params: Promise<{ slug: string }>;
}) {
 const { slug } = await params;
 const c = findCase(slug);
 if (!c) notFound();

 const idx = workCases.findIndex((w) => w.slug === slug);
 const prev = workCases[(idx - 1 + workCases.length) % workCases.length];
 const next = workCases[(idx + 1) % workCases.length];

 const frames = c.gallery;

 const lead = frames[0];
 const chapters = c.chapters ?? [{ title: c.name, body: "", frames: frames.map((_, i) => i).slice(1) }];
 const pad = (n: number) => String(n).padStart(2, "0");

 return (
 <main className="bg-bg text-ink">
 <WayBack />
 <div id="top" className="mx-auto w-full max-w-[1160px] scroll-mt-20 px-5 pb-16">
 {/* The opening: the name and what it is on the left, the facts on the
     right, on the same two columns the chapters use below. */}
 <header className="pt-8">
 <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-2xs tracking-wide text-ink-3">
 <Link href="/" className="link-sheen">
 Home
 </Link>
 <span aria-hidden="true">/</span>
 <span aria-current="page" className="text-ink-2">
 Case study
 </span>
 </nav>
 <div className="mt-4 grid gap-x-16 gap-y-6 lg:grid-cols-[300px_minmax(0,1fr)]">
 <h1 className="font-sans text-lg font-medium leading-snug">{c.name}</h1>
 <div>
 <p className="max-w-[46ch] text-balance font-sans text-lg leading-snug text-ink-2">{c.oneLiner}</p>
 <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 font-sans text-sm sm:flex sm:flex-wrap sm:gap-x-10">
 {c.year && (
 <div>
 <dt className="text-ink-3">Year</dt>
 <dd className="mt-0.5 text-ink">{c.year}</dd>
 </div>
 )}
 <div>
 <dt className="text-ink-3">Role</dt>
 <dd className="mt-0.5 text-ink">{c.role}</dd>
 </div>
 <div>
 <dt className="text-ink-3">With</dt>
 <dd className="mt-0.5 text-ink">
 {c.credits
 .filter((cr) => cr.name !== "Damilare Osofisan")
 .map((cr, i) => (
 <span key={cr.name}>
 {i > 0 && ", "}
 {cr.href ? (
 <a href={cr.href} target="_blank" rel="noopener noreferrer" className="link-sheen">
 {cr.name}
 </a>
 ) : (
 cr.name
 )}
 </span>
 ))}
 </dd>
 </div>
 {c.links.length > 0 && (
 <div>
 <dt className="text-ink-3">{c.links.length > 1 ? "Links" : "Link"}</dt>
 <dd className="mt-0.5 flex flex-wrap gap-x-3">
 {c.links.map((l) => (
 <a
 key={l.href}
 href={l.href}
 target="_blank"
 rel="noopener noreferrer"
 aria-label={`${c.name} — ${l.label}`}
 className={`link-sheen ${l.sheen ?? ""}`}
 >
 {l.label}
 </a>
 ))}
 </dd>
 </div>
 )}
 </dl>
 </div>
 </div>
 </header>

 <div className="frame-run">
 {lead && (
 <div className="mt-12">
 <Frame g={lead} n={0} lead slug={c.slug} />
 </div>
 )}

 {/* The chapters. On a wide screen each one's words stay pinned beside
     its frames while they scroll past, so the claim is always next to
     the work that makes it; the next chapter takes over as it arrives.
     On a phone they simply stack. */}
 {chapters.map((ch, k) => (
 <section
 key={ch.title}
 aria-labelledby={`ch-${k}`}
 className="mt-20 grid gap-x-16 gap-y-6 lg:grid-cols-[300px_minmax(0,1fr)]"
 >
 <div>
 <div className="lg:sticky lg:top-20">
 <p className="font-sans text-xs tabular-nums text-ink-3">
 {pad(k + 1)} / {pad(chapters.length)}
 </p>
 <h2 id={`ch-${k}`} className="mt-2 text-balance font-sans text-lg font-medium leading-snug text-ink">
 {ch.title}
 </h2>
 {ch.body && (
 <p className="mt-3 text-pretty font-sans text-sm leading-relaxed text-ink-2">{ch.body}</p>
 )}
 </div>
 </div>
 <div className="space-y-12">
 {ch.frames.map((fi) => (
 <Frame key={frames[fi].src} g={frames[fi]} n={fi} slug={c.slug} />
 ))}
 </div>
 </section>
 ))}

 {c.outcome && (
 <section aria-labelledby="outcome" className="mt-24 grid gap-x-16 gap-y-3 border-t border-line pt-8 lg:grid-cols-[300px_minmax(0,1fr)]">
 <h2 id="outcome" className="font-sans text-sm text-ink-3">
 Where it landed
 </h2>
 <p className="max-w-[40ch] text-balance font-sans text-lg leading-snug text-ink">{c.outcome}</p>
 </section>
 )}
 </div>

 {/* prev / next — visual cards, so the next project sells itself */}
 <nav aria-label="More work" className="mt-20 grid grid-cols-2 gap-3 lg:ml-[calc(300px+4rem)]">
 {(
 [
 { c: prev, label: "Previous" },
 { c: next, label: "Next" },
 ] as const
 ).map(({ c: w, label }) => (
 <Link
 key={label}
 href={`/work/${w.slug}`}
 aria-label={`${label}: ${w.name}`}
 className="group block overflow-hidden ring-1 ring-line transition-[box-shadow,transform] duration-150 ease-out hover:ring-ink-3 active:scale-[0.99]"
 >
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img
 src={COVERS[w.slug]?.src ?? w.logo}
 alt=""
 loading="lazy"
 style={COVERS[w.slug]?.bg ? { background: COVERS[w.slug].bg } : undefined}
 className={`aspect-video w-full ${COVERS[w.slug]?.fit === "contain" ? "object-contain" : "object-cover"} transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]`}
 />
 <span className="block p-3">
 <span className="block text-2xs tracking-wide text-ink-3">{label}</span>
 <span className="mt-1 block font-sans text-sm font-medium">{w.name}</span>
 </span>
 </Link>
 ))}
 </nav>

 <DFloor />
 </div>
 </main>
 );
}

type GalleryFrame = (typeof workCases)[number]["gallery"][number];

/** One frame of the run, with its caption beneath, starting at the frame's
    own left edge. The caption names the frame; the note says what to see. */
function Frame({ g, n, lead = false, slug }: { g: GalleryFrame; n: number; lead?: boolean; slug: string }) {
 const box = (
 <div className={`frame relative overflow-hidden ${g.tall ? "mx-auto max-w-[400px] bg-surface p-3" : "bg-surface-2"}`}>
 {g.kind === "video" ? (
 <CaseVideo
 src={g.src}
 poster={g.poster}
 alt={g.alt}
 lead={lead}
 className={g.tall ? "mx-auto block max-h-[72vh] w-auto" : "block h-auto w-full"}
 />
 ) : (
 <CaseImage
 src={g.src}
 alt={g.alt}
 lead={lead}
 className={g.tall ? "mx-auto block max-h-[72vh] w-auto" : "block h-auto w-full bg-surface-2"}
 />
 )}
 {g.motion && <div aria-hidden className={`cover-${g.motion} pointer-events-none absolute inset-0`} />}
 </div>
 );
 return (
 <figure id={`frame-${n + 1}`} data-frame={n} className="scroll-mt-24">
 {lead ? (
 <ViewTransition name={`work-${slug}`} share="morph" default="none">
 {box}
 </ViewTransition>
 ) : (
 box
 )}
 {(g.caption || g.note) && (
 <figcaption className={`mt-3 max-w-[64ch] text-pretty font-sans text-xs leading-normal ${g.tall ? "mx-auto sm:max-w-[400px]" : ""}`}>
 {g.caption && <span className="text-ink">{g.caption}.</span>}
 {g.caption && g.note && " "}
 {g.note && <span className="text-ink-2">{g.note}</span>}
 </figcaption>
 )}
 </figure>
 );
}
