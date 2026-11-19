import { Fragment } from "react";

type ProjectLink = { label: string; href: string; sheen?: string };

/**
 * A sentence with the project's own destinations linked where they are
 * named: "Live at hitmanslibrary.xyz…", "5.0 on the App Store…". Same sheen
 * as the links in the case header, so a named place always reads as one you
 * can go to. `tabbable={false}` is for the pinned guide, which is a visual
 * copy of text the page already carries (with its links) for keyboards and
 * screen readers.
 */
export function LinkedText({
  text,
  links,
  tabbable = true,
}: {
  text: string;
  links: ProjectLink[];
  tabbable?: boolean;
}) {
  const usable = links.filter((l) => text.includes(l.label));
  if (usable.length === 0) return <>{text}</>;
  const escape = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(${usable.map((l) => escape(l.label)).join("|")})`);
  return (
    <>
      {text.split(pattern).map((part, i) => {
        const link = usable.find((l) => l.label === part);
        if (!link) return <Fragment key={i}>{part}</Fragment>;
        return (
          <a
            key={i}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={tabbable ? undefined : -1}
            className={`link-sheen ${link.sheen ?? ""}`}
          >
            {part}
          </a>
        );
      })}
    </>
  );
}
