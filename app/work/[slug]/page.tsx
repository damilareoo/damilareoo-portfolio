import type { Metadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";
import { notFound } from "next/navigation";
import { DFloor } from "@/components/dfooter";
import { CaseRail } from "@/components/case-rail";
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
 const rest = frames.slice(1);
 const story = c.sections.filter((s) => s.k !== "Role & Contribution");

 return (
 <main className="bg-bg text-ink">
 <WayBack />
 <CaseRail labels={frames.map((g) => g.caption || g.alt)} />
 {/* One column, one left edge. The header, the story, every caption and
     the cards at the foot all start where the frames start, so nothing
     floats in an inset of its own. Text keeps a reading measure inside it. */}
 <div id="top" className="mx-auto w-full max-w-[880px] scroll-mt-20 px-5 pb-16">
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
 <div className="mt-3 grid gap-x-12 gap-y-6 sm:grid-cols-[minmax(0,1fr)_240px] sm:items-end">
 <div>
 <h1 className="text-balance font-sans text-lg font-medium leading-snug">{c.name}</h1>
 <p className="mt-2 max-w-[52ch] text-pretty font-sans text-sm leading-normal text-ink-2">{c.oneLiner}</p>
 </div>
 <dl className="grid grid-cols-[56px_minmax(0,1fr)] gap-x-4 gap-y-1.5 font-sans text-sm">
 {c.year && (
 <>
 <dt className="text-ink-3">Year</dt>
 <dd className="text-ink">{c.year}</dd>
 </>
 )}
 <dt className="text-ink-3">Role</dt>
 <dd className="text-ink">{c.role}</dd>
 {c.links.length > 0 && (
 <>
 <dt className="text-ink-3">{c.links.length > 1 ? "Links" : "Link"}</dt>
 <dd className="flex flex-wrap gap-x-3">
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
 </>
 )}
 </dl>
 </div>
 </header>

 <div className="frame-run mt-10 space-y-14">
 {lead ? (
 <Frame g={lead} n={0} lead slug={c.slug} />
 ) : (
 [0, 1, 2].map((i) => (
 <div key={`slot-${i}`} aria-hidden className="aspect-[16/10] w-full rounded-xl bg-ink/[0.03] ring-1 ring-line" />
 ))
 )}

 {/* The story: a label column and a reading column, divided by
     hairlines, so the four parts scan as a list before they are read. */}
 {story.length > 0 && (
 <section aria-label="About the project" className="border-b border-line">
 {story.map((s) => (
 <div key={s.k} className="grid gap-x-12 gap-y-1.5 border-t border-line py-5 sm:grid-cols-[160px_minmax(0,1fr)]">
 <h2 className="font-sans text-sm text-ink-3">{s.k}</h2>
 <p className="max-w-[60ch] text-pretty font-sans text-sm leading-relaxed text-ink">{s.v}</p>
 </div>
 ))}
 </section>
 )}

 {rest.map((g, i) => (
 <Frame key={g.src} g={g} n={i + 1} slug={c.slug} />
 ))}
 </div>

 <p className="mt-14 text-pretty font-sans text-sm leading-normal text-ink-2">
 <span className="text-ink-3">Credits</span>{" "}
 {c.credits.map((credit, i) => (
 <span key={credit.name}>
 {i > 0 && ", "}
 {credit.href ? (
 <a href={credit.href} target="_blank" rel="noopener noreferrer" className="link-sheen">
 {credit.name}
 </a>
 ) : (
 credit.name
 )}
 </span>
 ))}
 </p>

 {/* prev / next — visual cards, so the next project sells itself */}
 <nav aria-label="More work" className="mt-8 grid grid-cols-2 gap-3">
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
 className="group block overflow-hidden rounded-xl ring-1 ring-line transition-[box-shadow,transform] duration-150 ease-out hover:ring-ink-3 active:scale-[0.99]"
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
 className={g.tall ? "mx-auto block max-h-[72vh] w-auto rounded-[calc(var(--frame-r)-6px)]" : "block h-auto w-full"}
 />
 ) : (
 <CaseImage
 src={g.src}
 alt={g.alt}
 lead={lead}
 className={g.tall ? "mx-auto block max-h-[72vh] w-auto rounded-[calc(var(--frame-r)-6px)]" : "block h-auto w-full bg-surface-2"}
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
 <figcaption className={`mt-3 max-w-[64ch] text-pretty font-sans text-sm leading-normal ${g.tall ? "mx-auto sm:max-w-[400px]" : ""}`}>
 {g.caption && <span className="text-ink">{g.caption}.</span>}
 {g.caption && g.note && " "}
 {g.note && <span className="text-ink-2">{g.note}</span>}
 </figcaption>
 )}
 </figure>
 );
}
