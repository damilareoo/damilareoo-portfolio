import type { Metadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";
import { notFound } from "next/navigation";
import { DFloor } from "@/components/dfooter";
import { CaseImage, CaseVideo } from "@/components/case-frame";
import { ChapterReader } from "@/components/chapter-reader";
import { LinkedText } from "@/components/linked-text";
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
 const chapters: { title: string; body: string; frames: (number | [number, number])[] }[] =
 c.chapters ?? [{ title: c.name, body: "", frames: frames.map((_, i) => i).slice(1) }];

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
 <p className="text-pretty font-sans text-lg leading-snug text-ink-2">{c.oneLiner}</p>
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

 {/* The chapters. On a wide screen one guide stays pinned on the left
     for the whole story (components/chapter-reader.tsx): the chapter you
     are in, beside the frames that
     make its claim. On a phone each chapter's words sit above its frames. */}
 <div className="mt-20 lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-x-16">
 <aside className="lg:relative">
 <ChapterReader chapters={chapters.map(({ title, body }) => ({ title, body }))} links={c.links} />
 </aside>
 <div className="space-y-20">
 {chapters.map((ch, k) => (
 <section key={ch.title} data-chapter={k} aria-labelledby={`ch-${k}`} className="scroll-mt-20">
 <div className="mb-6 lg:sr-only">
 <h2 id={`ch-${k}`} className="text-pretty font-sans text-lg font-medium leading-snug text-ink">
 {ch.title}
 </h2>
 {ch.body && (
 <p className="mt-3 text-pretty font-sans text-sm leading-relaxed text-ink-2">
 <LinkedText text={ch.body} links={c.links} />
 </p>
 )}
 </div>
 <div className="space-y-12">
 {ch.frames.map((item) =>
 Array.isArray(item) ? (
 /* Two frames of one subject, side by side: it breaks the
    single-file run and lets a comparison read as one. */
 <div key={item.join("-")} className="grid gap-x-4 gap-y-12 sm:grid-cols-2">
 {item.map((fi) => (
 <Frame key={frames[fi].src} g={frames[fi]} n={fi} slug={c.slug} />
 ))}
 </div>
 ) : (
 <Frame key={frames[item].src} g={frames[item]} n={item} slug={c.slug} />
 ),
 )}
 </div>
 </section>
 ))}
 </div>
 </div>

 {c.outcome && (
 <section aria-labelledby="outcome" className="mt-24 grid gap-x-16 gap-y-3 border-t border-line pt-8 lg:grid-cols-[300px_minmax(0,1fr)]">
 <h2 id="outcome" className="font-sans text-sm text-ink-3">
 Where it landed
 </h2>
 <p className="text-pretty font-sans text-lg leading-snug text-ink">
 <LinkedText text={c.outcome} links={c.links} />
 </p>
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

 <DFloor className="mt-24 lg:ml-[calc(300px+4rem)]" />
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
 {/* The caption names the frame and nothing more: the chapter beside it
     already says what to see, and saying it twice made both weaker. */}
 {g.caption && (
 <figcaption className={`mt-2.5 font-sans text-xs text-ink-3 ${g.tall ? "mx-auto sm:max-w-[400px]" : ""}`}>
 {g.caption}
 </figcaption>
 )}
 </figure>
 );
}
