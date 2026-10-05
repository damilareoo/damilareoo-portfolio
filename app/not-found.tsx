import Link from "next/link";
import { SectionLabel } from "@/components/ui";

export const metadata = { title: "Not found" };

/**
 * A real 404, not a soft one. It ships with the framework's 404 status code
 * intact.
 *
 * Re-drawn in the new tokens: `--text-1`/`--text-2` became `text-ink`/`text-ink-2`
 * and the type steps are Tailwind classes off the scale rather than
 * `text-[length:var(--text-xl)]` literals, which is what the source's own
 * `@theme inline` block exists to make possible.
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60svh] w-full max-w-[1240px] flex-1 flex-col items-center justify-center px-5 text-center sm:px-6">
      <SectionLabel>404</SectionLabel>
      <h1 className="mt-4 text-xl font-medium tracking-tight text-ink">Page not found</h1>
      <p className="mt-3 text-base text-ink-2">
        The page you&rsquo;re looking for doesn&rsquo;t exist.
      </p>
      <Link href="/" className="mt-8 text-sm text-ink link-sheen">
        Back home
      </Link>
    </main>
  );
}
