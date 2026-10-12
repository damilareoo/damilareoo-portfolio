import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { DFloor } from "@/components/dfooter";
import { CaseRail } from "@/components/case-rail";
import { WayBack } from "@/components/way-back";
import { explorations, findExploration } from "@/data/dossier-explorations";

/** Exploration case file — the work-case sizes and rhythm, labelled
    apart: narrow words, wide frames, problem first. */
export function generateStaticParams() {
  return explorations.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const e = findExploration(slug);
  if (!e) return { title: "Exploration" };
  return {
    title: e.name,
    description: e.oneLiner,
    openGraph: { images: [{ url: e.gallery[0]?.poster ?? e.gallery[0]?.src }] },
  };
}

export default async function ExplorationCasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = findExploration(slug);
  if (!c) notFound();

  const landed = c.gallery.filter((g) => existsSync(join(process.cwd(), "public", g.src.replace(/^\//, ""))));
  const first = landed.slice(0, 1);
  const rest = landed.slice(1);
  const beats = c.sections.filter((s) => s.k !== "Role & Contribution");

  return (
    <main className="bg-[#fafafa] text-[#171717] dark:bg-[#131313] dark:text-[#f2f2f2]">
      <WayBack />
      <CaseRail labels={landed.map((g) => g.caption || g.alt)} />
      {/* the story — narrow, quiet. The problem leads, like the reference. */}
      <div id="top" className="mx-auto w-full max-w-[600px] scroll-mt-20 px-5 pb-10">
        <div className="pt-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-2xs tracking-wide text-[#595959] dark:text-[#8a8a8a]"
          >
            <Link href="/" className="link-sheen">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-[#424242] dark:text-[#b8b8b8]">
              Exploration
            </span>
          </nav>
          <h1 className="mt-2 text-balance font-sans text-lg font-medium leading-snug">{c.name}</h1>
          <p className="mt-3 text-pretty font-sans text-sm leading-normal text-[#626262] dark:text-[#a8a8a8]">
            {c.oneLiner}
          </p>

          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
            {c.year && (
              <div>
                <dt className="text-2xs tracking-wide text-[#595959] dark:text-[#8a8a8a]">Year</dt>
                <dd className="mt-1 font-sans text-sm text-[#171717] dark:text-[#f2f2f2]">{c.year}</dd>
              </div>
            )}
            <div>
              <dt className="text-2xs tracking-wide text-[#595959] dark:text-[#8a8a8a]">Role</dt>
              <dd className="mt-1 font-sans text-sm text-[#171717] dark:text-[#f2f2f2]">{c.role}</dd>
            </div>
            {c.status && (
              <div>
                <dt className="text-2xs tracking-wide text-[#595959] dark:text-[#8a8a8a]">Status</dt>
                <dd className="mt-1 font-sans text-sm text-[#171717] dark:text-[#f2f2f2]">{c.status}</dd>
              </div>
            )}
            {c.site && (
              <div>
                <dt className="text-2xs tracking-wide text-[#595959] dark:text-[#8a8a8a]">Live</dt>
                <dd className="mt-1 font-sans text-sm">
                  <a
                    href={c.site.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-sheen"
                  >
                    {c.site.label}
                  </a>
                </dd>
              </div>
            )}
          </dl>

          {c.summary.length > 0 && (
            <div className="mt-6 space-y-4">
              {c.summary.map((p, i) => (
                <p
                  key={i}
                  className="text-pretty font-sans text-sm leading-normal text-[#424242] dark:text-[#b8b8b8]"
                >
                  {p}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* the frame run — wide cards under narrow words. Only frames whose
          files have landed render. */}
      <div className="mx-auto w-full max-w-[880px] px-5 pb-10">
        <div className="mt-2 space-y-12">
          {first.map((g) => (
            <figure key={g.src} id="frame-1" data-frame={0} className="scroll-mt-24">
              {g.note && (
                <p className="mx-auto mb-3 w-full max-w-[560px] font-sans text-sm leading-normal text-[#424242] dark:text-[#b8b8b8]">
                  {g.note}
                </p>
              )}
              <div className="relative overflow-hidden ring-1 ring-[#e5e5e5] dark:ring-[#2b2b2b]">
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
                  className="w-full ring-1 ring-[#e5e5e5] dark:ring-[#2b2b2b]"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={g.src}
                  alt={g.alt}
                  loading="lazy"
                  className="w-full ring-1 ring-[#e5e5e5] dark:ring-[#2b2b2b]"
                />
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
                  <p className="mt-2 text-pretty font-sans text-sm leading-normal text-[#424242] dark:text-[#b8b8b8]">
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
                  <p className="mx-auto mb-3 w-full max-w-[560px] font-sans text-sm leading-normal text-[#424242] dark:text-[#b8b8b8]">
                    {g.note}
                  </p>
                )}
                <div className="relative overflow-hidden ring-1 ring-[#e5e5e5] dark:ring-[#2b2b2b]">
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
                    className="w-full ring-1 ring-[#e5e5e5] dark:ring-[#2b2b2b]"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={g.src}
                    alt={g.alt}
                    loading="lazy"
                    className="w-full ring-1 ring-[#e5e5e5] dark:ring-[#2b2b2b]"
                  />
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
                className="mx-auto aspect-[16/10] w-full max-w-[600px] bg-[#171717]/[0.03] ring-1 ring-[#e5e5e5] dark:bg-white/[0.04] dark:ring-[#2b2b2b]"
              />
            ))}
        </div>
      </div>
      <div className="mx-auto w-full max-w-[600px] px-5 pb-10">
        <div>
          <p className="mt-2 text-pretty font-sans text-sm leading-normal text-[#626262] dark:text-[#a8a8a8]">
            Credits — {c.credits}.
          </p>
          {c.extraLinks && c.extraLinks.length > 0 && (
            <p className="mt-2 flex flex-wrap gap-x-4 font-sans text-sm">
              {c.extraLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-sheen"
                >
                  {l.label}
                </a>
              ))}
            </p>
          )}
        </div>

        <DFloor />
      </div>
    </main>
  );
}
