"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coin } from "./coin";
import { FloorControls, ThemeButton } from "./floor-controls";

const LINKS = [
 { href: "/about", label: "about" },
 { href: "/playground", label: "playground" },
];

/** Site nav — one row: the coin + name left, about/playground right. */
export function DNav() {
 const pathname = usePathname();
 const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

 return (
 <nav aria-label="Primary" className="sticky top-0 z-40 w-full bg-bg/85 backdrop-blur-md">
 <div className="mx-auto flex w-full max-w-[600px] flex-row items-center gap-2 px-5 pb-3 pt-16 sm:pt-[88px]">
 <div className="flex min-w-0 flex-1 items-center gap-2">
 <Coin />
 {/* prefetch={false}: the home link sits in the header of every page, so
     Next prefetched the front page and its four animated covers — the
     full-size ones — on any visit to the playground or a case study. That was
     a 173KB GIF arriving before anyone asked for it. The front page is one
     click away and nothing on it depends on being warm. */}
 <Link
 href="/"
 prefetch={false}
 aria-label="Damilare Osofisan — back home"
 className="truncate rounded-md py-1.5 font-sans text-sm text-ink transition-opacity hover:opacity-60"
 >
 <span className="sm:hidden">Damilare O.</span>
 <span className="hidden sm:inline">Damilare Osofisan</span>
 </Link>
 </div>
 <div className="flex shrink-0 items-center gap-2">
 {LINKS.map((l) => (
 <Link
 key={l.href}
 href={l.href}
 aria-current={active(l.href) ? "page" : undefined}
 className={`rounded-md px-2 py-1.5 font-sans text-xs transition-colors link-sheen ${
 active(l.href) ? "text-ink" : "text-ink-2 hover:text-ink dark:hover:text-ink"
 }`}
 >
 {l.label}
 </Link>
 ))}
 <span aria-hidden className="mx-1 hidden h-4 w-px bg-ink/10 sm:block dark:bg-ink/15" />
 <span className="flex items-center gap-0">
 <ThemeButton />
 <FloorControls />
 </span>
 </div>
 </div>
 </nav>
 );
}
