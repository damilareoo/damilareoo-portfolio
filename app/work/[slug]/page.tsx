import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { DFloor } from "@/components/dfooter";
import { CaseRail } from "@/components/case-rail";
import { WayBack } from "@/components/way-back";
import { findCase, workCases } from "@/data/dossier-work";

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
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      {/* the way back — fixed, always in reach, like the reference */}
      <WayBack />
      <CaseRail labels={landed.map((g) => g.caption || g.alt)} />
      {/* the story — narrow, quiet, like the reference prose */}
      <div id="top" className="mx-auto w-full max-w-[600px] scroll-mt-20 px-5 pb-10">
        <div className="pt-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-2xs tracking-wide text-[#767676] dark:text-[#8a8a8a]"
          >
            <Link href="/" className="link-sheen">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-[#424242] dark:text-[#b8b8b8]">
              Case study
            </span>
          </nav>
          <h1 className="mt-2 text-balance font-sans text-lg font-medium leading-snug">{c.name}</h1>
          <p className="mt-3 text-pretty font-sans text-sm leading-relaxed text-[#626262] dark:text-[#a8a8a8]">
            {c.oneLiner}
          </p>

          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
            {c.year && (
              <div>
                <dt className="text-2xs tracking-wide text-[#767676] dark:text-[#8a8a8a]">Year</dt>
                <dd className="mt-1 font-sans text-sm text-[#171717] dark:text-[#f2f2f2]">{c.year}</dd>
              </div>
            )}
            <div>
              <dt className="text-2xs tracking-wide text-[#767676] dark:text-[#8a8a8a]">Role</dt>
              <dd className="mt-1 font-sans text-sm text-[#171717] dark:text-[#f2f2f2]">{c.role}</dd>
            </div>
          </dl>

          {c.summary.length > 0 && (
            <div className="mt-6 space-y-4">
              {c.summary.map((p, i) => (
                <p
                  key={i}
                  className="text-pretty font-sans text-sm leading-relaxed text-[#424242] dark:text-[#b8b8b8]"
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
                <p className="mx-auto mb-3 w-full max-w-[560px] font-sans text-sm leading-relaxed text-[#424242] dark:text-[#b8b8b8]">
                  {g.note}
                </p>
              )}
              <div className={g.motion ? "relative overflow-hidden rounded-lg ring-1 ring-[#e5e5e5] dark:ring-[#2b2b2b]" : g.tall ? "mx-auto max-w-[400px] rounded-lg bg-white p-3 ring-1 ring-[#e5e5e5] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]" : undefined}>
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
                      ? `mx-auto max-h-[72vh] w-auto ${g.motion ? "" : g.tall ? "rounded" : "rounded-lg ring-1 ring-[#e5e5e5] dark:ring-[#2b2b2b]"}`
                      : `w-full ${g.motion ? "" : "rounded-lg ring-1 ring-[#e5e5e5] dark:ring-[#2b2b2b]"}`
                  }
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={g.src}
                  alt={g.alt}
                  loading="lazy"
                  className={
                    g.tall
                      ? `mx-auto max-h-[72vh] w-auto ${g.motion ? "" : g.tall ? "rounded" : "rounded-lg ring-1 ring-[#e5e5e5] dark:ring-[#2b2b2b]"}`
                      : `w-full ${g.motion ? "" : "rounded-lg ring-1 ring-[#e5e5e5] dark:ring-[#2b2b2b]"}`
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
                  <h2 className="font-sans text-sm font-medium text-[#171717] dark:text-[#f2f2f2]">
                    {s.k}
                  </h2>
                  <p className="mt-2 text-pretty font-sans text-sm leading-relaxed text-[#424242] dark:text-[#b8b8b8]">
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
                  <p className="mx-auto mb-3 w-full max-w-[560px] font-sans text-sm leading-relaxed text-[#424242] dark:text-[#b8b8b8]">
                    {g.note}
                  </p>
                )}
                <div className={g.motion ? "relative overflow-hidden rounded-lg ring-1 ring-[#e5e5e5] dark:ring-[#2b2b2b]" : g.tall ? "mx-auto max-w-[400px] rounded-lg bg-white p-3 ring-1 ring-[#e5e5e5] dark:bg-[#1e1e1e] dark:ring-[#2b2b2b]" : undefined}>
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
                        ? `mx-auto max-h-[72vh] w-auto ${g.motion ? "" : g.tall ? "rounded" : "rounded-lg ring-1 ring-[#e5e5e5] dark:ring-[#2b2b2b]"}`
                        : `w-full ${g.motion ? "" : "rounded-lg ring-1 ring-[#e5e5e5] dark:ring-[#2b2b2b]"}`
                    }
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={g.src}
                    alt={g.alt}
                    loading="lazy"
                    className={
                      g.tall
                        ? `mx-auto max-h-[72vh] w-auto ${g.motion ? "" : g.tall ? "rounded" : "rounded-lg ring-1 ring-[#e5e5e5] dark:ring-[#2b2b2b]"}`
                        : `w-full ${g.motion ? "" : "rounded-lg ring-1 ring-[#e5e5e5] dark:ring-[#2b2b2b]"}`
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
                className="mx-auto aspect-[16/10] w-full max-w-[600px] rounded-lg bg-[#171717]/[0.03] ring-1 ring-[#e5e5e5] dark:bg-white/[0.04] dark:ring-[#2b2b2b]"
              />
            ))}
        </div>
      </div>
      <div className="mx-auto w-full max-w-[600px] px-5 pb-10">
        <div>
          <p className="mt-2 text-pretty font-sans text-sm leading-relaxed text-[#626262] dark:text-[#a8a8a8]">
            Credits — {c.credits}.
          </p>
        </div>
        {/* prev / next */}
        <nav aria-label="More work" className="mt-12 flex items-start justify-between gap-4">
          <Link href={`/work/${prev.slug}`} className="group">
            <span className="block text-2xs tracking-wide text-[#767676] dark:text-[#8a8a8a]">Previous</span>
            <span className="mt-1 block font-sans text-sm link-sheen">{prev.name}</span>
          </Link>
          <Link href={`/work/${next.slug}`} className="group text-right">
            <span className="block text-2xs tracking-wide text-[#767676] dark:text-[#8a8a8a]">Next</span>
            <span className="mt-1 block font-sans text-sm link-sheen">{next.name}</span>
          </Link>
        </nav>

        <DFloor />
      </div>
    </main>
  );
}
