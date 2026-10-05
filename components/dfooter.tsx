import { ClockTile, MusicTile, StepsTile, WeatherTile } from "./instruments";
import { FloorControls } from "./floor-controls";

const SOCIALS = [
  { label: "x", href: "https://x.com/damilareoo" },
  { label: "github", href: "https://github.com/damilareoo" },
  { label: "layers", href: "https://layers.to/damilareoo" },
  { label: "linkedin", href: "https://www.linkedin.com/in/damilareoo" },
  { label: "email", href: "mailto:dosofisan7@gmail.com" },
];

/** Site footer — live tiles, then the sign-off. Same on every page. */
export function DFooter() {
  return (
    <footer className="mt-16">
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        <ClockTile />
        <WeatherTile />
        <MusicTile />
        <StepsTile />
      </div>

      <DFloor />
    </footer>
  );
}

/** The sign-off alone — © plus socials. Controls live up top now:
    theme and sound in the home nav, sound beside the way-back. */
export function DFloor() {
  return (
    <div className="mt-6 border-t border-[#e5e5e5] pt-3 dark:border-[#2b2b2b]">
      <p className="flex flex-wrap items-center gap-x-4 font-sans text-2xs text-[#767676] dark:text-[#8a8a8a]">
        <span>© {new Date().getFullYear()} Damilare Osofisan</span>
        {SOCIALS.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center tracking-wide link-sheen"
          >
            {s.label}
          </a>
        ))}
      </p>
    </div>
  );
}
