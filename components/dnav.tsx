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
    <nav aria-label="Primary" className="sticky top-0 z-40 w-full bg-[#fafafa]/85 backdrop-blur-md dark:bg-[#131313]/85">
      <div className="mx-auto flex w-full max-w-[600px] flex-row items-center gap-2 px-4 pb-3 pt-16 sm:px-5 sm:pt-[88px]">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Coin />
          <Link
            href="/"
            aria-label="Damilare Osofisan — back home"
            className="truncate rounded-md py-1.5 font-sans text-sm text-[#171717] transition-opacity hover:opacity-60 dark:text-[#f2f2f2]"
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
                active(l.href) ? "text-[#171717] dark:text-[#f2f2f2]" : "text-[#626262] dark:text-[#a8a8a8] hover:text-[#171717] dark:hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <span aria-hidden className="mx-1 hidden h-4 w-px bg-[#171717]/10 sm:block dark:bg-white/15" />
          <span className="flex items-center gap-0">
            <ThemeButton />
            <FloorControls />
          </span>
        </div>
      </div>
    </nav>
  );
}
