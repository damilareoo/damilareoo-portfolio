import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { DFloor } from "@/components/dfooter";
import { CaseRail } from "@/components/case-rail";
import Pic from "@/components/pic";
import { WayBack } from "@/components/way-back";
import { findCase, workCases } from "@/data/dossier-work";

/** Home-row covers, reused so the next-project cards show the same face
 as the front page. */
const COVERS: Record<string, { src: string; alt: string; fit?: "contain"; bg?: string }> = {
 "hitmans-library": { src: "/dossier/work/hitman/hitman-cover.gif", alt: "Hitman's Library cover", fit: "contain", bg: "#ececec" },
 endgame: { src: "/dossier/work/endgame/endgame-cover.gif", alt: "Endgame cover" },
 chessever: { src: "/dossier/work/chessever/chessever-cover.gif", alt: "ChessEver cover" },
 sylvan: { src: "/dossier/work/sylvan/sylvan-cover.gif", alt: "Sylvan cover" },
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
 * sentence. Only frames whose files have landed render; anything missing
 * stays an empty slot, no new type steps.
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

 const landed = c.gallery.filter((g) => existsSync(join(process.cwd(), "public", g.src.replace(/^\//, ""))));

 /* Cover first, then the story, then the rest — sections are the beats
 between the cover and the run. Role & Contribution stays out: the
 header already carries the role. Numbering runs straight through. */
 const first = landed.slice(0, 1);
 const rest = landed.slice(1);
 const beats = c.sections.filter((s) => s.k !== "Role & Contribution");

 return (
 <main className="bg-bg text-ink">
 {/* the way back — fixed, always in reach, like the reference */}
 <WayBack />
 <CaseRail labels={landed.map((g) => g.caption || g.alt)} />
 {/* the story — narrow, quiet, like the reference prose */}
 <div id="top" className="mx-auto w-full max-w-[600px] scroll-mt-20 px-5 pb-10">
 <div className="pt-8">
 <nav
 aria-label="Breadcrumb"
 className="flex items-center gap-2 text-2xs tracking-wide text-ink-3"
 >
 <Link href="/" className="link-sheen">
 Home
 </Link>
 <span aria-hidden="true">/</span>
 <span aria-current="page" className="text-ink-2">
 Case study
 </span>
 </nav>
 <h1 className="mt-2 text-balance font-sans text-lg font-medium leading-snug">{c.name}</h1>
 <p className="mt-3 text-pretty font-sans text-sm leading-normal text-ink-2">
 {c.oneLiner}
 </p>

 <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
 {c.year && (
 <div>
 <dt className="text-2xs tracking-wide text-ink-3">Year</dt>
 <dd className="mt-1 font-sans text-sm text-ink">{c.year}</dd>
 </div>
 )}
 <div>
 <dt className="text-2xs tracking-wide text-ink-3">Role</dt>
 <dd className="mt-1 font-sans text-sm text-ink">{c.role}</dd>
 </div>
 </dl>

 {c.summary.length > 0 && (
 <div className="mt-6 space-y-4">
 {c.summary.map((p, i) => (
 <p
 key={i}
 className="text-pretty font-sans text-sm leading-normal text-ink-2"
 >
 {p}
 </p>
 ))}
 </div>
 )}
 </div>
 </div>
 {/* the frame run — wide cards under narrow words, like the reference.
 Only frames whose files have landed render; anything still missing
 stays an empty slot. Portrait work stays column-narrow. */}
 <div className="mx-auto w-full max-w-[880px] px-5 pb-10">
 <div className="mt-2 space-y-12">
 {first.map((g) => (
 <figure key={g.src} id="frame-1" data-frame={0} className="scroll-mt-24">
 {g.note && (
 <p className="mx-auto mb-3 w-full max-w-[560px] font-sans text-sm leading-normal text-ink-2">
 {g.note}
 </p>
 )}
 <div className={g.motion ? "relative overflow-hidden bg-surface-2 ring-1 ring-line" : g.tall ? "mx-auto max-w-[400px] bg-surface p-3 ring-1 ring-line" : "bg-surface-2 ring-1 ring-line"}>
 {g.kind === "video" ? (
 <video
 src={g.src}
 poster={g.poster}
 autoPlay
 muted
 loop
 playsInline
 preload="auto"
 aria-label={g.alt}
 className={
 g.tall
 ? `mx-auto max-h-[72vh] w-auto ${g.motion ? "" : g.tall ? "" : "ring-1 ring-line"}`
 : `aspect-[16/10] w-full object-cover ${g.motion ? "" : "ring-1 ring-line"}`
 }
 />
 ) : (
 <Pic
 src={g.src}
 alt={g.alt}
 loading="eager"
 fetchPriority="high"
 decoding="async"
 className={
 g.tall
 ? `mx-auto max-h-[72vh] w-auto ${g.motion ? "" : g.tall ? "" : "ring-1 ring-line"}`
 : `aspect-[16/10] w-full bg-surface-2 object-cover ${g.motion ? "" : "ring-1 ring-line"}`
 }
 />
 )}
 {g.motion && (
 <div aria-hidden className={`cover-${g.motion} pointer-events-none absolute inset-0`} />
 )}
 </div>
 </figure>
 ))}
 {beats.length > 0 && (
 <div className="mx-auto w-full max-w-[560px] space-y-6">
 {beats.map((s) => (
 <div key={s.k}>
 <h2 className="font-sans text-sm font-medium text-ink">
 {s.k}
 </h2>
 <p className="mt-2 text-pretty font-sans text-sm leading-normal text-ink-2">
 {s.v}
 </p>
 </div>
 ))}
 </div>
 )}
 {rest.map((g, i) => {
 const n = i + 1;
 return (
 <figure
 key={g.src}
 id={`frame-${n + 1}`}
 data-frame={n}
 className="scroll-mt-24"
 >
 {g.note && (
 <p className="mx-auto mb-3 w-full max-w-[560px] font-sans text-sm leading-normal text-ink-2">
 {g.note}
 </p>
 )}
 <div className={g.motion ? "relative overflow-hidden bg-surface-2 ring-1 ring-line" : g.tall ? "mx-auto max-w-[400px] bg-surface p-3 ring-1 ring-line" : "bg-surface-2 ring-1 ring-line"}>
 {g.kind === "video" ? (
 <video
 src={g.src}
 poster={g.poster}
 autoPlay
 muted
 loop
 playsInline
 preload="metadata"
 aria-label={g.alt}
 className={
 g.tall
 ? `mx-auto max-h-[72vh] w-auto ${g.motion ? "" : g.tall ? "" : "ring-1 ring-line"}`
 : `aspect-[16/10] w-full object-cover ${g.motion ? "" : "ring-1 ring-line"}`
 }
 />
 ) : (
 <Pic
 src={g.src}
 alt={g.alt}
 loading="lazy"
 decoding="async"
 className={
 g.tall
 ? `mx-auto max-h-[72vh] w-auto ${g.motion ? "" : g.tall ? "" : "ring-1 ring-line"}`
 : `aspect-[16/10] w-full bg-surface-2 object-cover ${g.motion ? "" : "ring-1 ring-line"}`
 }
 />
 )}
 {g.motion && (
 <div aria-hidden className={`cover-${g.motion} pointer-events-none absolute inset-0`} />
 )}
 </div>
 </figure>
 );
 })}
 {landed.length === 0 &&
 [0, 1, 2].map((i) => (
 <div
 key={`slot-${i}`}
 aria-hidden
 className="mx-auto aspect-[16/10] w-full max-w-[600px] bg-ink/[0.03] ring-1 ring-line dark:bg-ink/[0.04]"
 />
 ))}
 </div>
 </div>
 <div className="mx-auto w-full max-w-[600px] px-5 pb-10">
 <div>
 <p className="mt-2 text-pretty font-sans text-sm leading-normal text-ink-2">
 Credits: {c.credits}
 </p>
 </div>
 {/* prev / next — visual cards, so the next project sells itself */}
 <nav aria-label="More work" className="mt-12 grid grid-cols-2 gap-3">
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
 className="group block overflow-hidden rounded-xl ring-1 ring-line transition-colors hover:ring-ink-3 dark:hover:ring-ink-3"
 >
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img
 src={COVERS[w.slug]?.src ?? w.logo}
 alt=""
 loading="lazy"
 style={COVERS[w.slug]?.bg ? { background: COVERS[w.slug].bg } : undefined}
 className={`aspect-video w-full ${COVERS[w.slug]?.fit === "contain" ? "object-contain" : "object-cover"} transition-transform duration-500 group-hover:scale-[1.02]`}
 />
 <span className="block p-3">
 <span className="block text-2xs tracking-wide text-ink-3">{label}</span>
 <span className="mt-1 block font-sans text-sm font-medium link-sheen">{w.name}</span>
 </span>
 </Link>
 ))}
 </nav>

 <DFloor />
 </div>
 </main>
 );
}
