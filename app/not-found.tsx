import Link from "next/link";

export const metadata = { title: "Not found" };

/**
 * A real 404, not a soft one: it ships with the framework's 404 status code
 * intact.
 *
 * Set like every other inner page, in the 600px column on the left edge,
 * rather than as the one centred page on the site
 * in a type size nothing else uses. Two ways on: home, and the playground,
 * which is where most of the work actually is.
 */
export default function NotFound() {
  return (
    <main className="bg-bg text-ink">
      <div className="mx-auto w-full max-w-[600px] px-5 pb-16">
        <p className="pt-24 font-sans text-xs tabular-nums text-ink-3">404</p>
        <h1 className="mt-2 font-sans text-lg font-medium leading-snug text-ink">This page doesn&rsquo;t exist.</h1>
        <p className="mt-3 max-w-[46ch] text-pretty font-sans text-sm leading-relaxed text-ink-2">
          The link may be old, or mistyped. Everything that&rsquo;s here is one step away.
        </p>
        <p className="mt-6 flex gap-4 font-sans text-sm">
          <Link href="/" className="text-ink link-sheen">
            Go home
          </Link>
          <Link href="/playground" className="text-ink link-sheen">
            See the playground
          </Link>
        </p>
      </div>
    </main>
  );
}
