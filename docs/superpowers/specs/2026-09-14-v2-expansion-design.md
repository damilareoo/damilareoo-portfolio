# Kenny Olajide — v2 Expansion Design Spec

Date: 2026-09-14
Status: approved for planning
Supersedes nothing. Extends `2026-09-14-kenny-olajide-portfolio-design.md`, which
remains binding for colour, type, motion and content honesty.

## 0. What changed, and why there is a v2

v1 shipped and is live. The owner's verdict: the design language is right, the
execution is flat. Specifically — the home is a symmetric two-up grid with no
depth, navigation is a single row of links with no sense of place, the theme
control is a bare text label, there is no footer, and there is nothing in the
experience that rewards attention.

Separately, the v1 final review found four things worth fixing here rather than
filing: no `<h1>` on `/work` or `/writing`, a drag-only carousel with no
keyboard path, three of the five home sections the v1 spec named were never
built, and `EASE_INOUT` and `--rule` are defined and used by nothing.

And Kenny's real history is now known. It was not, when v1 was written.

## 1. Facts that were placeholders and are now real

Read from `linkedin.com/in/kenny-olajide-b5476216a` through the owner's logged-in
session on 2026-09-14. The URL in the original brief, `/in/kennyolajide`,
returns LinkedIn's 404.

| Role | Company | From | To |
| --- | --- | --- | --- |
| Product Designer | ChessEver | Apr 2025 | Mar 2026 |
| Content Editor | Forward Chess | Mar 2024 | Apr 2024 |
| Content Editor | Telebu Communications | Nov 2022 | May 2023 |
| Technical Content Editor | Chessable | Feb 2021 | Jun 2022 |
| Chess & Scrabble Instructor | Grand Cortex Centre | May 2017 | 2022 |

Headline: "Product Designer | Content Editor | Writer | Chess lover".
Location: Nigeria. Education: University of Ibadan.

**The narrative this unlocks, and which v1 missed entirely.** Kenny did not
arrive at chess software as a designer looking for a domain. He taught chess for
five years, then edited chess courses at Chessable, then chess e-books at
Forward Chess, and only then designed a chess product. The site should say that,
because it is the most interesting true thing about him and it is the reason he
is credible on this work.

**Still unknown, and not to be invented.** There is no Endgame AI role on his
profile. v1 ships Endgame as a selected piece with "2026 / Product Design" in
its Record. The owner has undertaken to confirm the real title and dates. Until
then:

- Endgame stays as a selected piece — the App Store listing is real and the
  work exists.
- Its Record prints the year and platform, which come from the listing, and
  **omits the role row** rather than asserting one.
- `data/experience.ts` lists the five verified roles and nothing else.
- A single `TODO(owner)` comment in `data/work.ts` names exactly what is
  missing. No placeholder string that could be mistaken for a fact.

**The portrait** at `public/portrait/kenny.png` was captured from his LinkedIn
photo and is a **placeholder pending a real photograph**. It is already
black-and-white, so it needs no treatment to sit in the monochrome system. It is
circle-masked with transparent corners so it works on either skin. It is 800px,
which is enough at the size §5 uses it and not enough to go larger.

## 2. The home, rebuilt

The brief is "editorial, asymmetric, layered". Concretely, and in order:

**Hero.** The name at a new display step, set to the measure rather than to a
column, with the headline beneath it as a line the reader finishes rather than a
tagline. Under that, a record row: location, current status, and a copy-email
control. Not centred. Nothing is centred on this site.

**Selected work — the layered part.** Not a symmetric two-up grid. Endgame takes
roughly seven of twelve columns and sits high; ChessEver takes six, sits lower,
and starts past the midpoint so the two overlap vertically without colliding.
Each card's phone shots bleed past the card's right edge rather than sitting
inside it, so the grid reads as layered rather than boxed. At `lg` and below the
two stack and the bleed is dropped — an asymmetry that survives into a single
column is just a misalignment.

**The ladder.** The five verified roles as a dense labelled index: years left,
role and company right, one hairline between rows. This is where the chess
narrative lands, with one line of prose above it saying what the ladder shows.

**Writing.** Two most recent posts, titles at reading size, dates in tabular
figures. Carries the placeholder notice while `IS_PLACEHOLDER` holds.

**Footer.** The site has none today, which means a visitor who reaches the
bottom of any page is offered nothing. The footer carries: email as a real
`mailto:`, the elsewhere links, the colophon line (typeface, palette
provenance), and the build's commit. It appears on every route.

## 3. Navigation

Four changes, each solving a specific "where am I / where can I go" failure.

1. **A header that condenses.** Full height at the top of a page; on scroll it
   collapses to a shorter bar with the name reduced to its initials. Cheap in
   motion terms, and it keeps the nav reachable without occupying a sixth of a
   short screen.
2. **Breadcrumbs on the two dynamic routes.** `Work / ChessEver` and
   `Writing / <post>`. A case page currently gives no indication of what it sits
   inside.
3. **Previous and next at the foot of every case and post.** The single biggest
   intuitiveness win available: today the only way from one case to another is
   back, then click. Wraps at both ends.
4. **A skip link.** First focusable element, visible on focus, jumps to `<main>`.
   The site is keyboard-navigable except that every visitor tabs through the
   whole header first.

Plus the two accessibility defects the v1 review found:

- `/work` and `/writing` get a real `<h1>`. Every other route has exactly one.
- **The carousel gets a keyboard path.** Today it is `overflow-hidden` with
  `drag="x"` and nothing else, so screens 2..N are unreachable without a
  pointer — while the *reduced-motion* branch is a plain scroller and therefore
  fine. The fix: the track is focusable, Left/Right arrows move it by one snap
  point through the same `lib/carousel.ts` arithmetic the drag uses, and
  Home/End jump to either end. Buttons are added for pointer users who do not
  drag. One code path, three ways in.

## 4. Theme switching

A three-state segmented control — Light / System / Dark — replacing the text
toggle. System is a real state, not an absence: a visitor who has never chosen
should see that the site is following their OS, not guess.

- The thumb slides between the three on `layoutId`, the same mechanism as the
  nav pill, at `DUR.base` on `EASE_OUT`.
- The circular View Transitions reveal stays, and keeps its reduced-motion
  withhold.
- Each state carries a small geometric glyph drawn in `currentColor` — these are
  SVG shapes, not a font, so the Inter-only rule is untouched.
- `aria-pressed` on each of the three; the group is a `radiogroup`.

## 5. About

The page exists and is a two-column record. It becomes the page that carries the
narrative §1 describes.

- The portrait at a size 800px can actually hold, on the left, with the name and
  headline set against it. Not a hero banner — a portrait beside type.
- Two short paragraphs: the chess-to-design path, and what he works on now.
- The full five-role ladder, with company, dates, and the one-line description
  of each taken from his own profile wording rather than rewritten.
- Education and location as record rows.
- `IS_PLACEHOLDER` is now **false** for experience. The visible placeholder
  notice disappears from this page because the data is real. It stays on the
  writing surfaces.

## 6. Case study layout

- Breadcrumb, then the title lockup (which keeps the shared-element pair).
- A lead paragraph at the large body step, distinct from the body.
- The carousel as a full-bleed band, escaping the measure, with the keyboard
  path from §3.
- Body and a sticky Record rail, the rail staying in view while the prose
  scrolls.
- Frames scale 0.96 → 1 on entry. This was in the v1 spec and was never built;
  `Reveal` does opacity and translate only.
- Prev/next pagination at the foot.

## 7. Typography

- One new display step above `--text-xl` for the hero name. Fluid, rem at both
  clamp ends, same rules as the existing six.
- A lead step between `--text-lg` and `--text-base` for case-page leads.
- Tracking tightens further at the new display size; the existing ramp is
  extended, not replaced.
- Every figure that is a number stays on `tnum`.

## 8. Micro-interactions

Each of these is small, and each has a reason to exist. None is decoration for
its own sake.

- **Magnetic hover** on nav items and controls — pointer-fine only, disabled
  under reduced motion. This was in the v1 spec and deferred.
- **Link underline draws from the left** rather than fading in.
- **Copy-email** reports success in place, reverting after a beat.
- **Work card** shots fan on hover (exists) and the card lifts by one step.
- **Figures count up** when they enter, on `tnum` so nothing reflows.

All resolve to `lib/motion.ts`. `EASE_INOUT`, which v1 defined and never used,
is the curve for anything that returns to where it started — the magnetic hover
release and the copy-email revert. If it ends up unused again, it is deleted.

## 9. The easter egg

A real chess puzzle, playable, hidden.

**Trigger.** Typing `e4` anywhere on the site that is not a text field. The most
played first move in chess, on a chess designer's portfolio.

**The position.** White Ka6, Qa1. Black Ka8. White to move and mate in one.

**The solution is `Qh8#`, and it is the only one.**

The first position this spec carried was Kg6/Qb2 vs Kh8 with `Qb8#`. That mate
was real — but the Task 8 implementer re-ran the search independently and found
that `Qg7#` mates as well. My original check had verified the wrong claim:
"Qb8 is mate" and "Qb8 is the only mate" are different statements, and a
problem advertised as *mate in one* needs the second. A chess player would
very likely have tried `Qg7` first and been told they were wrong.

This position was found by enumerating every white move in every legal
King-and-Queen versus King arrangement and keeping only those with exactly one
mating move — 1,456 of them exist, and this is one. Verified: the kings are not
adjacent, Black is not already in check, the a1–h8 diagonal is clear, and after
`Qh8` the three escape squares are all covered — a7 and b7 by the king on a6,
b8 by the queen itself.

It is attributed to nobody because it is nobody's study. It was chosen because
it can be verified rather than trusted, and because the key move crosses the
whole board corner to corner, which is the most that can be asked of one move.

**What it does.** A board overlays the page, drawn in the site's own tokens —
the light squares are `--surface`, the dark `--surface-2`, the pieces are
glyphs in `--text-1`. The player moves the white queen. Any move that is not
`Qb8` is refused with a shake and the piece returns. `Qb8` plays, the black king
is marked, and the board states `mate`. Escape or a click outside closes it.

**Scope discipline.** This is not a chess engine. Legality is checked for the
queen's own movement so the piece cannot be dragged through the board's edge or
onto its own king, and the single correct move is scripted. A full move
generator is not needed to make one position work, and building one would be the
tail wagging the dog.

**Accessibility.** The board is reachable by keyboard once open, the squares are
labelled in algebraic notation, and the whole thing respects reduced motion —
the shake becomes an instant state, not a faster shake. It is `aria-hidden`
until triggered and takes focus when it opens.

## 10. Out of scope, still

Unchanged from v1 §11, minus the items this spec builds. Not built: a changelog,
a `/system` surface, live personal instruments, an accent colour, a second
typeface, a CMS, analytics, a contact form. Email remains a `mailto:`.

Added to the out-of-scope list: a chess engine, move generation, or any position
other than the one in §9.
