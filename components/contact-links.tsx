/** The contact row: one list, read by the home header and the About page, so
    a visitor can reach out from either without going back. */
import { site } from "@/data/site";

const LINKS = [
  { label: "email", href: `mailto:${site.email}` },
  { label: "x", href: "https://x.com/damilare_oo" },
  { label: "github", href: "https://github.com/damilareoo" },
  { label: "linkedin", href: site.linkedin },
  { label: "are.na", href: "https://www.are.na/damilare-osofisan" },
];

export function ContactLinks({ className = "" }: { className?: string }) {
  return (
    <p className={`text-pretty font-sans text-sm leading-normal text-ink-2 ${className}`}>
      {LINKS.map((l, i) => (
        <span key={l.label}>
          {i > 0 && " / "}
          <a
            href={l.href}
            {...(l.href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
            className="link-sheen"
          >
            {l.label}
          </a>
        </span>
      ))}
    </p>
  );
}
