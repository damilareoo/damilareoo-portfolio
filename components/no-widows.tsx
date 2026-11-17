"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/* The no-widows rule for browsers that cannot keep it themselves.
   globals.css sets `text-wrap: pretty`, which Chrome and Safari honour; Firefox
   ignores it and will still leave one word alone on a last line. Where the
   property is unsupported, this joins each block's last two words with a
   no-break space, so they always wrap together.

   It edits text nodes after hydration, never during render, so the server
   markup and React's tree still agree. Short words only: gluing two long words
   on a 360px screen would trade a widow for an overflow. */
const BLOCKS = "p, li, dd, dt, figcaption, blockquote, h1, h2, h3, h4, h5, h6";
const MAX_PAIR = 22; // characters in the joined pair, past which we leave it

function lastTextNode(el: Element): Text | null {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP),
  });
  let last: Text | null = null;
  for (let n = walker.nextNode(); n; n = walker.nextNode()) last = n as Text;
  return last;
}

function glue(root: ParentNode) {
  for (const el of root.querySelectorAll(BLOCKS)) {
    if ((el.textContent ?? "").trim().split(/\s+/).length < 4) continue;
    const node = lastTextNode(el);
    if (!node) continue;
    const text = node.data;
    const m = /(\S+)[ \t]+(\S+\s*)$/.exec(text);
    if (!m || m[1].length + m[2].trim().length + 1 > MAX_PAIR) continue;
    node.data = text.slice(0, m.index) + m[1] + " " + m[2];
  }
}

export function NoWidows() {
  const pathname = usePathname();
  useEffect(() => {
    if (CSS.supports("text-wrap", "pretty")) return;
    glue(document.body);
    // Client navigations and late content (rails, viewers) arrive after this.
    const mo = new MutationObserver((records) => {
      for (const r of records) for (const n of r.addedNodes) if (n instanceof Element) glue(n.parentElement ?? n);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [pathname]);
  return null;
}
