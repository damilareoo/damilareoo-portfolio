# v2 Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Rebuild the home and case layouts as layered editorial compositions, add a real navigation system and theme control, land Kenny's verified history, and hide a playable chess puzzle in it.

**Architecture:** Extends the live v1 site. Every v1 invariant still binds. New surfaces are composed from the existing primitives (`Reveal`, `RevealLines`, `Label`, `Chip`, `RecordRow`, `ShotCarousel`, `CaseHeader`) and the existing token sets; where a new token is genuinely needed it joins `lib/motion.ts` or `globals.css` with a test, never a component literal.

**Tech Stack:** Next.js 16.3.0, React 19.2.8, Tailwind 4, `motion` v13, vitest. pnpm.

**Spec:** `docs/superpowers/specs/2026-09-14-v2-expansion-design.md` (and v1's spec, still binding)

## Global Constraints

Every task's requirements implicitly include this section.

- `pnpm` only. Inter only. Neutrals only, no accent hue.
- Every duration and curve from `lib/motion.ts` — `DUR`, `EASE_OUT`, `EASE_INOUT`, `STAGGER`, `HOLD`. No numeric timing literal or cubic-bezier string in a component.
- **Reduced motion renders the FINAL FRAME instantly.** The `globals.css` block reaches CSS-declared animations only. Anything driven by `motion` or the Web Animations API needs its own `useReducedMotion()` guard in the component.
- **`AnimatePresence` must OUTLIVE the element it animates away.** Never return null in the same commit that removes its child.
- **A `layoutId` IS the animation** — guard it by withholding the id, and withhold on BOTH halves of a pair or one half animates alone.
- **EXCLUDED BY EXPLICIT USER INSTRUCTION:** the ruler / tick-strip / gauge / measuring motif in any form. A scroll-progress indicator is this motif under another name.
- **Content honesty:** nothing about Kenny's career may be invented. Endgame AI has no corroborated role — its Record omits the role row.
- No page title may contain the site name (`layout.tsx`'s template supplies it). `app/metadata.test.ts` enforces this.
- Never commit a secret, key, or token.
- Every commit ends with:
  ```
  Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01DtiZwK9xL4Nz8oyfhfvihh
  ```

## Baseline

94 tests, 19 files. `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` all clean. Live at https://kenny-olajide-portfolio.vercel.app.

---

### Task 1: Tokens, type scale, and the real data

**Files:** `app/globals.css`, `lib/motion.ts`, `lib/type-scale.test.ts`, `data/experience.ts`, `data/work.ts`, `data/site.ts`, `data/placeholders.test.ts`

**Produces:** `--text-display`, `--text-lead`, `--tracking-display`; `roles` (5 real entries, `IS_PLACEHOLDER = false`); `site.education`, `site.headline`.

- [ ] **Step 1: Extend the type scale in `app/globals.css`**, appended inside the existing `:root`:

```css
  /* One step above --text-xl for the home's name, and one between --text-lg and
     --text-base for a case page's lead paragraph. Same rules as the other six:
     rem at both clamp ends, a rem-leading preferred value, ramp stops at the
     measure. */
  --text-display: clamp(3rem, 2.0833rem + 4.58vw, 5.75rem);
  --text-lead: clamp(1.125rem, 1.0833rem + 0.21vw, 1.25rem);
  /* Display type closes up further than --tracking-tight: the larger the size,
     the more air sits between letters at the same tracking. */
  --tracking-display: -0.045em;
```

- [ ] **Step 2: Extend `lib/type-scale.test.ts`** — add `"display"` and `"lead"` to the `FLUID` array so every existing assertion (clamp, rem at both ends, rem-leading preferred value) covers them too. Run it and watch it fail before writing the CSS if you prefer; either order, but the test must cover the new steps.

- [ ] **Step 3: Rewrite `data/experience.ts` with the verified history**

```ts
/**
 * Kenny's role history, read from linkedin.com/in/kenny-olajide-b5476216a on
 * 2026-09-14 through the owner's own logged-in session.
 *
 * This file was a marked placeholder until that read. It no longer is — every
 * row below is his, in his own profile's wording. The vanity URL in the
 * original brief (/in/kennyolajide) returns LinkedIn's 404; this one is the
 * real profile.
 *
 * The order is what the ladder shows, and the ladder is the argument: five
 * years teaching chess, then editing chess courses, then chess e-books, and
 * only then designing a chess product. He did not arrive at the domain as a
 * designer looking for one.
 */
export const IS_PLACEHOLDER = false;

export type Role = {
  role: string;
  company: string;
  from: string;
  to: string;
  /** His own description, not a rewrite. Absent where the profile gave none. */
  note?: string;
};

export const roles: Role[] = [
  {
    role: "Product Designer",
    company: "ChessEver",
    from: "Apr 2025",
    to: "Mar 2026",
    note: "User research and competitive analysis to find the product's fit; low-to-high fidelity concepts; interfaces built for usability, accessibility and aesthetics.",
  },
  {
    role: "Content Editor",
    company: "Forward Chess",
    from: "Mar 2024",
    to: "Apr 2024",
    note: "Chess e-book conversions and imports, edited to publication standard.",
  },
  {
    role: "Content Editor",
    company: "Telebu Communications",
    from: "Nov 2022",
    to: "May 2023",
    note: "Owned the editing lifecycle from substantive edit to proofread, against the brand's voice.",
  },
  {
    role: "Technical Content Editor",
    company: "Chessable",
    from: "Feb 2021",
    to: "Jun 2022",
    note: "Imported and improved chess courses, coordinated beta tests, implemented quality control.",
  },
  {
    role: "Chess & Scrabble Instructor",
    company: "Grand Cortex Centre",
    from: "May 2017",
    to: "2022",
  },
];
```

- [ ] **Step 4: Update `data/placeholders.test.ts`.** `IS_PLACEHOLDER` for experience is now `false`, and `roles` no longer carry a `placeholder` flag — change those assertions. **Keep** the test asserting the four unverified ZoomInfo employers never appear: three of them (Forward Chess, Telebu, Chessable) are now verified and appear legitimately, so narrow that assertion to `SmallChess` only, which is still uncorroborated. Writing stays a placeholder; all its assertions stand. Add an assertion that every role has non-empty `role`, `company`, `from`, `to`.

- [ ] **Step 5: In `data/work.ts`**, remove the `role` value for `endgame-ai` and replace with:

```ts
    /* TODO(owner): Kenny's title and dates on Endgame AI are not corroborated
       by his LinkedIn, which carries no Endgame role. The owner has undertaken
       to confirm them. Until then the case page omits the Role row entirely
       rather than printing a claim — see the Record in app/work/[slug]/page.tsx.
       The App Store listing is real; the employment is what is unverified. */
    role: undefined,
```
Change `WorkItem.role` to `role?: string`. ChessEver keeps `"0–1 Product Experience"`.

- [ ] **Step 6: In `data/site.ts`** add `headline: "Product Designer, Content Editor, Writer, Chess lover"`, `education: "University of Ibadan"`, `location: "Nigeria"`.

- [ ] **Step 7: Verify and commit**

Run: `pnpm test && pnpm lint && pnpm exec tsc --noEmit && pnpm build`
```bash
git commit -m "feat: extend the type scale and land Kenny's verified history"
```

---

### Task 2: Navigation system

**Files:** `components/nav.tsx`, `components/site-header.tsx`, `components/breadcrumb.tsx`, `components/pagination.tsx`, `components/skip-link.tsx`, `app/layout.tsx`, tests for each.

**Produces:** `<SiteHeader />` (condensing), `<Breadcrumb trail={{label,href}[]} />`, `<Pagination prev next />`, `<SkipLink />`.

- [ ] **Step 1: `components/skip-link.tsx`** — first focusable element in `<body>`, visually hidden until focused, jumps to `#main`. Add `id="main"` to the `<main>` of every route. Test: it is the first element in tab order and its href is `#main`.

- [ ] **Step 2: `components/site-header.tsx`** — wraps the existing `<Nav />`. Condenses on scroll: full padding at scroll 0, reduced past a threshold, with the wordmark swapping to initials. Read scroll through a `useSyncExternalStore` subscription to `scroll` (this repo does not use mounted-flag effects) or `useMotionValueEvent` from `motion`. Guard with `useReducedMotion()` — under reduced motion it renders the condensed state statically with no transition. Test: renders the full state at scroll 0 and the condensed state past the threshold; both states contain the nav links.

- [ ] **Step 3: `components/breadcrumb.tsx`** — an ordered list, `aria-label="Breadcrumb"`, last item `aria-current="page"` and not a link. Test: the trail renders in order and only the last carries `aria-current`.

- [ ] **Step 4: `components/pagination.tsx`** — previous and next, each a link with the piece's title, wrapping at both ends. Takes `prev` and `next` as `{title, href}`. Test: given a middle item both links render; given the first item, `prev` wraps to the last.

- [ ] **Step 5: Mount** `<SkipLink />` first in `<body>`, `<SiteHeader />` replacing the bare `<Nav />`.

- [ ] **Step 6: Verify and commit** — all four commands, then `git commit -m "feat: a real navigation system"`.

---

### Task 3: Theme control and footer

**Files:** `components/theme-control.tsx` (replaces `theme-toggle.tsx`), `components/site-footer.tsx`, `app/layout.tsx`, tests.

- [ ] **Step 1: `components/theme-control.tsx`** — a three-state segmented control.

```tsx
"use client";

import { useTheme } from "next-themes";
import { motion } from "motion/react";
import { DUR, EASE_OUT, useReducedMotion } from "@/lib/motion";
import { useMounted } from "@/lib/use-mounted";

/* System is a real state, not the absence of a choice. A visitor who has never
   picked should be able to see that the site is following their OS rather than
   guess from which half of the toggle looks active. */
const MODES = [
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
  { value: "dark", label: "Dark" },
] as const;

export function ThemeControl() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const reduced = useReducedMotion();
  // Before hydration the stored choice is unknown; "system" is the default and
  // the honest thing to show rather than flickering to another segment.
  const active = mounted ? (theme ?? "system") : "system";

  return (
    <div role="radiogroup" aria-label="Colour theme" className="bg-chip relative flex rounded-full p-0.5">
      {MODES.map((m) => {
        const on = active === m.value;
        return (
          <button
            key={m.value}
            role="radio"
            aria-checked={on}
            onClick={() => setTheme(m.value)}
            className={`relative z-10 rounded-full px-2.5 py-1 text-[length:var(--text-2xs)] uppercase tracking-[var(--tracking-label)] transition-colors ${
              on ? "text-text-1" : "text-text-3 hover:text-text-2"
            }`}
          >
            {on && (
              <motion.span
                /* Withheld under reduced motion for the same reason every
                   layoutId on this site is: the id IS the animation. */
                layoutId={reduced ? undefined : "theme-thumb"}
                className="bg-surface absolute inset-0 -z-10 rounded-full"
                transition={{ duration: DUR.base, ease: EASE_OUT }}
              />
            )}
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
```

Keep the circular View Transitions reveal from `theme-toggle.tsx` — move that logic here, firing on a change of resolved theme, and keep its `reduced ||` guard. Delete `theme-toggle.tsx` and its test once nothing imports them.

Test: three radios render; the active one carries `aria-checked="true"`; clicking calls `setTheme` with that value; under reduced motion no `data-layout-id` is emitted (stub `motion` as `work-card.test.tsx` does).

- [ ] **Step 2: `components/site-footer.tsx`** — email as a real `mailto:`, the `elsewhere` links, a colophon line naming Inter and the palette provenance (dejiajetomobi.com light, jakub.kr dark), and the commit sha from `process.env.VERCEL_GIT_COMMIT_SHA?.slice(0,7) ?? "dev"`. Mount on every route via `app/layout.tsx`. Test: the mailto matches `site.email`, and every `elsewhere` entry renders a link.

- [ ] **Step 3: Verify and commit** — `git commit -m "feat: three-state theme control and a site footer"`.

---

### Task 4: The home, rebuilt

**Files:** `app/page.tsx`, `components/work-card.tsx`, `components/ladder.tsx`, `app/globals.css`, tests.

- [ ] **Step 1: `components/ladder.tsx`** — the five roles as a dense labelled index. Years left in `--text-2xs` uppercase with `--tracking-label`; role and company right at `--text-sm`; one hairline between rows using `--border`. Staggered with `Reveal` and `STAGGER`. Test: all five roles render, in order, with their dates.

- [ ] **Step 2: Rebuild `app/page.tsx`** to the five sections in spec §2, in order: hero, selected work, ladder, writing, (footer comes from layout). It stays a SERVER component — it awaits `readAppStore()`. Do not add `"use client"`.

The layered grid, on a 12-column base:
```tsx
<div className="grid grid-cols-12 gap-6">
  <div className="col-span-12 lg:col-span-7">{/* Endgame, sits high */}</div>
  <div className="col-span-12 lg:col-span-5 lg:col-start-8 lg:mt-24">{/* ChessEver, lower */}</div>
</div>
```
The `lg:mt-24` is what makes the two overlap vertically rather than sitting as a symmetric pair. Below `lg` both go full width and the offset is dropped — an asymmetry that survives into one column is just a misalignment.

- [ ] **Step 3: Let the shots bleed.** In `work-card.tsx`, the shot row gains `-mr-6 lg:-mr-10` and the card `overflow-hidden` is removed so the strip runs past the card's right edge. Keep the `.fan` hover and its reduced-motion suppression exactly as they are.

- [ ] **Step 4: Hero** — name at `--text-display` with `--tracking-display`, via `RevealLines`. Headline beneath at `--text-lead`. A record row under that: location, status, copy-email (the control arrives in Task 7; until then a plain `mailto:`).

- [ ] **Step 5: Verify and commit.** Confirm the build still marks `/` as static (`○`) with the six-hour revalidate. `git commit -m "feat: rebuild the home as a layered editorial composition"`.

---

### Task 5: Case layout, carousel keyboard path, and the missing h1s

**Files:** `app/work/[slug]/page.tsx`, `app/work/page.tsx`, `app/writing/page.tsx`, `app/writing/[slug]/page.tsx`, `components/shot-carousel.tsx`, `components/reveal.tsx`, tests.

- [ ] **Step 1: Give `/work` and `/writing` a real `<h1>`.** Both currently head their content with a `<span class="label">` and use `<h2>` below. Every other route has exactly one `<h1>`. Add one to each, keeping the label as a kicker above it. Add a test asserting exactly one `<h1>` per index page.

- [ ] **Step 2: The carousel's keyboard path.** This is the important one — today screens 2..N are unreachable without a pointer, while the reduced-motion branch is a plain scroller and therefore fine.

In `components/shot-carousel.tsx`, the drag track gains:
```tsx
  tabIndex={0}
  role="group"
  aria-label={`${card.name} screenshots, ${card.shots.length} of them. Use the left and right arrow keys.`}
  onKeyDown={(e) => {
    const points = snapPoints(card.shots.length, ITEM, GAP);
    const here = points.indexOf(nearestSnap(x.get(), points));
    const to =
      e.key === "ArrowRight" ? Math.min(here + 1, points.length - 1)
      : e.key === "ArrowLeft" ? Math.max(here - 1, 0)
      : e.key === "Home" ? 0
      : e.key === "End" ? points.length - 1
      : null;
    if (to === null) return;
    e.preventDefault();
    animate(x, Math.max(bounds.left, Math.min(bounds.right, points[to])), {
      duration: DUR.base, ease: EASE_OUT,
    });
  }}
```
Every decision still comes from `lib/carousel.ts` — this is the same arithmetic the drag uses, reached a second way. Also add visible previous/next buttons for pointer users who do not think to drag; they call the same handler logic. Under reduced motion the branch is already a plain scroller — leave it, and make sure the buttons are not rendered there since the scroller needs none.

Test: arrow keys move the track through `snapPoints`; Home and End jump to the ends; the track is focusable.

- [ ] **Step 3: Frames scale 0.96 → 1 on entry.** Add a `scale` variant to `Reveal` (a prop, defaulting off, so existing callers are unchanged) and use it on the case page's media. This was in the v1 spec and never built.

- [ ] **Step 4: Rebuild the case page** per spec §6: breadcrumb, title lockup (keeping the shared-element pair intact), lead at `--text-lead`, full-bleed carousel band, body plus a `sticky top-24` Record rail, pagination at the foot. **The Record omits the Role row when `item.role` is undefined** — that is the Endgame honesty requirement, and a test must assert it.

- [ ] **Step 5: Mirror the shape on `app/writing/[slug]/page.tsx`** — breadcrumb and pagination; no carousel or record rail.

- [ ] **Step 6: Verify and commit** — including that `/work/nope` still 404s. `git commit -m "feat: layered case layout, carousel keyboard path, index h1s"`.

---

### Task 6: About

**Files:** `app/about/page.tsx`, test.

- [ ] **Step 1: Rebuild** per spec §5 — portrait at `public/portrait/kenny.png` beside the name and headline, two short paragraphs carrying the chess-to-design narrative, the full five-role ladder with notes, education and location as record rows.

Use `next/image` with explicit `width={320} height={320}`, `priority`, and `alt="Kenny Olajide"`. The file is 800px so 320 is comfortably within it. Add a caption noting it is a placeholder pending a real photograph — the portrait is a stand-in even though the roles are not, and the page should not imply otherwise.

- [ ] **Step 2:** The visible `IS_PLACEHOLDER` notice for experience **goes away** — that data is real now. The writing surfaces keep theirs. Test: `/about` renders all five companies and no placeholder notice.

- [ ] **Step 3: Verify and commit** — `git commit -m "feat: about page with portrait and the real ladder"`.

---

### Task 7: Micro-interactions

**Files:** `components/magnetic.tsx`, `components/copy-email.tsx`, `components/count-up.tsx`, `app/globals.css`, tests.

- [ ] **Step 1: `components/magnetic.tsx`** — wraps a child and translates it a few pixels toward the pointer, releasing on `EASE_INOUT` (the curve v1 defined and never used; anything that returns to where it started uses it). `@media (hover: hover) and (pointer: fine)` only, via `useMediaQuery`. Returns the child untouched under reduced motion. Apply to nav items and the theme control.

- [ ] **Step 2: `components/copy-email.tsx`** — copies `site.email` to the clipboard, swaps its label to a confirmation, reverts after `HOLD * 4` seconds on `EASE_INOUT`. Falls back to a plain `mailto:` link when `navigator.clipboard` is absent — never a dead button. Test: clicking calls `writeText` with the address and the label changes; with clipboard absent it renders an anchor.

- [ ] **Step 3: `components/count-up.tsx`** — animates a figure from 0 to its value when it enters view, on `tnum` so nothing reflows. Renders the final value immediately under reduced motion. Use on the App Store rating count.

- [ ] **Step 4: Link underline draws from the left.** In `globals.css`, inside `@layer utilities`, a `.link` class using a `background-image` linear-gradient sized `0% 1px` growing to `100% 1px` on hover, transitioning on the default (token-bound) duration. Suppress under reduced motion.

- [ ] **Step 5: Verify and commit** — `git commit -m "feat: micro-interactions"`.

---

### Task 8: The easter egg

**Files:** `lib/chess.ts`, `lib/chess.test.ts`, `components/easter-egg.tsx`, `components/easter-egg.test.tsx`, `app/layout.tsx`

**This is not a chess engine.** One position, one correct move, scripted. Scope is in spec §9 and the out-of-scope list forbids a move generator.

- [ ] **Step 1: `lib/chess.ts`** — pure, no DOM:

```ts
/**
 * One position, and the single move that solves it.
 *
 * White Kg6, Qb2. Black Kh8. White to move and mate in one, with `Qb8#`.
 *
 * The mate was verified by brute force before it was written down, not by
 * analysis: the queen's path up the b-file is clear, the check runs along the
 * eighth rank, and every king escape is covered — g7 and h7 by the white king
 * on g6, g8 by the queen itself. Zero escape squares.
 *
 * It is attributed to nobody because it is nobody's study. It was chosen
 * because it is small enough to verify rather than trust, which on a chess
 * person's portfolio is the only acceptable standard.
 */
export type Square = string; // "a1".."h8"
export type Piece = { colour: "w" | "b"; kind: "K" | "Q"; at: Square };

export const START: Piece[] = [
  { colour: "w", kind: "K", at: "g6" },
  { colour: "w", kind: "Q", at: "b2" },
  { colour: "b", kind: "K", at: "h8" },
];

export const SOLUTION: { from: Square; to: Square } = { from: "b2", to: "b8" };

export function file(s: Square) { return s.charCodeAt(0) - 96; }
export function rank(s: Square) { return Number(s[1]); }

/** Whether a queen could move from one square to another on an empty board. */
export function queenCanReach(from: Square, to: Square): boolean {
  if (from === to) return false;
  const df = file(to) - file(from);
  const dr = rank(to) - rank(from);
  return df === 0 || dr === 0 || Math.abs(df) === Math.abs(dr);
}

export function isSolution(from: Square, to: Square): boolean {
  return from === SOLUTION.from && to === SOLUTION.to;
}
```

Test: `queenCanReach` accepts rank, file and diagonal and rejects a knight's move; `isSolution` accepts only `b2→b8`; `START` has exactly three pieces and the kings are not adjacent.

- [ ] **Step 2: `components/easter-egg.tsx`** — listens for the typed sequence `e4` on `window`, ignoring events whose target is an input, textarea, or `isContentEditable`. Opens a board overlay drawn in the site's tokens: light squares `--surface`, dark `--surface-2`, pieces as Unicode chess glyphs in `--text-1`, files and ranks labelled. Clicking the queen then a destination attempts a move: `isSolution` plays it and states `mate`; anything else shakes and returns the piece. Escape or an outside click closes. Takes focus on open, `aria-hidden` when closed, arrow keys move a square cursor. The shake is an instant state under reduced motion, not a faster shake.

Test: the overlay is absent until `e4` is typed; typing `e4` into an input does NOT open it; the correct move reports mate; a wrong move does not.

- [ ] **Step 3: Mount** in `app/layout.tsx`.

- [ ] **Step 4: Verify and commit** — `git commit -m "feat: a playable chess puzzle, hidden behind e4"`.

---

### Task 9: Verify and deploy

- [ ] **Step 1:** `pnpm test && pnpm lint && pnpm exec tsc --noEmit && pnpm build`, then `pnpm start` and curl every route for its status, including `/work/nope` → 404.
- [ ] **Step 2:** Update `README.md` — the new sections, the real roles, the easter egg (say it exists and what triggers it; a hidden thing nobody can find is just dead code), and the portrait's placeholder status.
- [ ] **Step 3:** Commit, push, `vercel deploy --prod`.
- [ ] **Step 4:** Verify live: both skins, the three-state control, the condensing header, the layered home at desktop AND at 390px, a case page's sticky rail, carousel by keyboard, the easter egg, and `data-source="live"`.

## Self-Review

**Spec coverage.** §1 facts → Task 1. §2 home → Task 4. §3 navigation → Task 2 (and the h1s and carousel path in Task 5). §4 theme → Task 3. §5 about → Task 6. §6 case layout → Task 5. §7 typography → Task 1. §8 micro-interactions → Task 7. §9 easter egg → Task 8. §10 out-of-scope: nothing here builds any of it.

**Known gaps, stated.** Endgame's role stays unknown until the owner confirms; Task 1 encodes the omission rather than a guess. The footer's commit sha reads a Vercel env var and shows `dev` locally. `--rule` is still unused after this plan — if Task 4's ladder does not adopt it for its hairlines, delete it in Task 9.

**Type consistency.** `Role` gains `note?` and loses `placeholder` in Task 1, consumed by Tasks 4 and 6. `WorkItem.role` becomes optional in Task 1, consumed by Task 5. `Square`, `Piece`, `START`, `SOLUTION`, `queenCanReach`, `isSolution` are defined in Task 8 and used only there.
