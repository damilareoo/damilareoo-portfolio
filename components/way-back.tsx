import Link from "next/link";
import { CaseKeys } from "./case-keys";

/** The way back — a fixed dismiss plus Esc, on every page but home. */
export function WayBack() {
  return (
    <>
      <Link
        href="/"
        aria-label="Back home"
        className="fixed right-5 top-5 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-[#171717]/[0.06] text-[#424242] transition-colors hover:bg-[#171717]/[0.12] hover:text-[#171717] dark:bg-white/10 dark:text-[#b8b8b8] dark:hover:bg-white/20 dark:hover:text-white"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M2 2l10 10M12 2L2 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </Link>
      <CaseKeys />
    </>
  );
}
