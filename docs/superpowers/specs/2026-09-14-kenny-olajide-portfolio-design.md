# Kenny Olajide — Portfolio Design Spec

Date: 2026-09-14
Status: approved for planning

## 1. What this is

A single-person portfolio for Kenny Olajide, product designer. It is a new
project with its own repository and its own deployment URL. It is not a fork of
`portfolio-v2` and not an edit of the joint Kenny-and-Damilare page at
`v0-kenny-dammy-portfolio.vercel.app`.

The voice is Kenny's, first person singular. Endgame.ai and ChessEver are the two
selected pieces. Where a piece was genuinely collaborative, collaborators are
named on the case page; the home does not hedge the authorship.

Two things drive every decision below: the work must be shown the way the App
Store shows it, and the experience must feel authored — animated, staged, and
deliberate — without any single motion being improvised.

## 2. Approach

Three were considered.

**A — Fork `portfolio-v2` and re-skin.** Rejected. That repository carries the
glyph-matrix easter egg, a Spotify now-playing instrument, a steps pedometer, a
weather face, colophon instruments, a shots feed, and `/system` + `/changelog`
chrome, none of which belong to Kenny. More decisively, its design language is
codified as *"nothing moves unless touched, arriving, or reporting"*. Delivering
an expressive experience inside that repository means fighting its central law
on every surface.

**B — New repository, port the load-bearing pieces.** Chosen. A fresh
application with its own motion language, taking from `portfolio-v2` only what
is both hard-won and on-brief.

**C — Ground-up, no ports.** Rejected. It discards the App Store integration,
which is the specific thing the brief asks to feature.

### What gets ported, and why each earns it

| From `portfolio-v2` | Why |
| --- | --- |
| `lib/app-store.ts` | The iTunes Lookup client, its six-hour revalidation reasoning, and the live/recorded merge. Rebuilding it would rediscover the same constraints. |
| `data/app-store.ts` | The committed snapshot floor for both listings, with measured per-app shot ratios (Endgame `626/1360`, ChessEver `626/1354`). |
| `public/apps/endgame-ai/*`, `public/apps/chessever/*` | Real icons and screens already downloaded from the live payload. |
| `lib/contrast.ts` + its tests | The harness that holds every token pair to a measured ratio. |
| The fluid type-scale reasoning in `app/globals.css` | rem at both clamp ends, ramp stops at the measure. The conclusion is portable even though the values are not. |
| `lib/use-media-query.ts`, `lib/use-mounted.ts` | `useSyncExternalStore` patterns that avoid mounted-flag effects. |

Nothing else is copied. In particular no component, no token value, and no
typeface crosses over.

### Known trap carried forward

`portfolio-v2` shipped a soft-404: a case page behind a root `app/loading.tsx`
serves a prerendered shell and commits HTTP 200 before the body streams, so a
`notFound()` reached during render can never set the status. The fix is
`export const dynamicParams = false` on the dynamic route, moving the decision to
the router. Both `/work/[slug]` and `/writing/[slug]` here sit behind a loading
state and therefore both carry it.

## 3. Stack

Next.js 16 (App Router), React 19, Tailwind 4, TypeScript, `motion` v13,
`next-themes`, vitest. pnpm.

- Directory: `/Users/v/kenny-olajide-portfolio`
- New GitHub repository
- New Vercel project, one deployment URL

The existing `/Users/v/kenny-dami-portfolio` is an empty April scaffold named for
the two-person version. It is left untouched.

## 4. Colour

Two skins. Light is taken from `dejiajetomobi.com`, dark from `jakub.kr`. Both
sets were read out of the shipped stylesheets, not sampled from screenshots or
guessed.

A four-step ink ramp is used rather than three, because that is the number of
rungs both references actually occupy; collapsing to three would have forced one
of them to be approximated.

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `--bg` | `#ffffff` | `#101010` | The page ground |
| `--surface` | `#f0f0f0` | `#191919` | A raised card |
| `--surface-2` | `#e8e8e8` | `#222222` | A pill, an active state |
| `--border` | `#e6e6e6` | `#313131` | A hairline between things |
| `--rule` | `#d4d4d4` | `#3a3a3a` | A separator that is meant to be seen |
| `--text-1` | `#000000` | `#eeeeee` | Names, headings |
| `--text-2` | `#6c6a6a` | `#dbdbdb` | Body and paragraphs |
| `--text-3` | `#767676` | `#b5b5b5` | Inactive nav, captions, counts — on `--bg` only |
| `--text-4` | `#9a9a9a` | `#7b7b7b` | Decorative marks and disabled states. Never type. |
| `--chip` | `rgb(165 165 165 / 0.2)` | `rgb(255 255 255 / 0.06)` | Translucent label fill |

`--chip` is written in `rgb()` rather than as the equivalent `#a5a5a533` /
`#ffffff0f` so that the contrast harness's hex parser skips it. It is a
translucent fill whose effective contrast depends on what sits behind it, so a
figure measured against the token itself would be meaningless.

Provenance: light `--text-2` is Deji's `.body-text` colour, `--text-3` is the
inactive `.nav-brand`, `--chip` is the `.social-link` background. Dark is
`jakub.kr`'s `--color-gray-background`, `--color-gray-100/200`,
`--color-gray-500/600`, `--color-gray-1200`, `--color-text-paragraph`,
`--color-gray-1100`, and `--color-gray-1000` in that order.

### Where each ink rung may be used

Every pair was measured before any of it was built. The light skin is the
binding constraint; jakub's dark ramp clears AA almost everywhere.

| | on `--bg` | on `--surface` | on `--surface-2` |
| --- | --- | --- | --- |
| light `--text-1` | 21.00 | 18.43 | 17.14 |
| light `--text-2` | 5.37 | 4.72 | 4.39 |
| light `--text-3` | 4.54 | 3.99 | 3.71 |
| light `--text-4` | 2.81 | 2.47 | 2.30 |
| dark `--text-1` | 16.40 | 15.15 | 13.71 |
| dark `--text-2` | 13.74 | 12.70 | 11.49 |
| dark `--text-3` | 9.28 | 8.57 | 7.76 |
| dark `--text-4` | 4.50 | 4.15 | 3.76 |

That produces four placement rules, which the harness enforces rather than
merely recording:

1. `--text-1` may be used on any ground.
2. `--text-2` carries body copy on `--bg` and `--surface`. On `--surface-2` it
   measures 4.39 and is permitted only at large-text sizes.
3. `--text-3` carries body copy on `--bg` only. On either raised surface it
   falls below AA.
4. `--text-4` is **not a text token**. It fails AA on all three light grounds
   and fails even the 3:1 large-text floor on all three. It exists for
   decorative marks and disabled states, and no type on this site is set in it.

Rule 4 is a direct consequence of dropping the ruler motif. On
`dejiajetomobi.com` `#9a9a9a` draws the measuring ticks — decoration, never
type — so inheriting it as an ink rung would have inherited a colour with no
legitimate text job on this site.

A token cannot be nudged later without a test stating what the nudge cost.

No accent hue. There is no colour on this site that is not a neutral, and no
element earns an exception.

## 5. Typography

Inter only, self-hosted variable woff2, weights 100–900, with `font-optical-sizing: auto`.

There is no second typeface. Differentiation comes from weight, size, case and
tracking. A label and a heading are the same font doing two different jobs,
which is the harder and better version of the problem.

**Scale.** Six steps. The three small steps are fixed, because they carry
captions, labels, years and counts — type already at its floor that gets worse
when it grows with the window. The three large steps are `clamp()`, ramping
320px to 1280px and then stopping, because the page measure stops growing at
roughly that point and type that keeps growing past the measure is only bigger,
not more readable. Both ends of every clamp are rem so browser text-size and
zoom still reach them.

**Tracking.** Optical, not uniform. The largest display step sits at `-0.03em`
and the ramp eases to `0` by body size. Micro-labels are uppercase at 11px with
`+0.08em`, which is the one place letter-spacing opens rather than closes.

**OpenType.** `tnum` on every figure — ratings, years, counts — so numbers do
not jitter when they change. `ss02` for disambiguation, which is Inter's
"Disambiguation (with zero)" set and already covers the I/l/1 collision and the
slashed zero; `cv05` is deliberately *not* also enabled, because it duplicates
work `ss02` has done. `case` for punctuation set beside capitals. `calt` is on
by default and is left alone.

## 6. Motion

### The token set

Every animation on the site resolves to these. Nothing hand-rolls a duration or
a curve.

```
--ease-out:   cubic-bezier(0.22, 0.61, 0.36, 1)
--ease-inout: cubic-bezier(0.65, 0, 0.35, 1)
--dur-1: 180ms    micro-feedback
--dur-2: 420ms    the default
--dur-3: 720ms    staged reveals
--dur-4: 1200ms   entrance and loading
```

`--ease-out` at `--dur-2` is lifted verbatim from Deji's nav pill, which
transitions `width .42s cubic-bezier(.22,.61,.36,1)`. The curve is borrowed with
its number intact rather than eyeballed into something close.

### Signature moments

1. **Loading screen.** A figure counting 00 to 100 in Inter with `tnum`, the
   name mask-revealing beneath it, exiting on an upward wipe. Scoped to the
   session so it does not replay on every navigation.
2. **Hero.** Per-line mask reveal under `overflow: hidden`, 60ms stagger.
3. **Nav.** A morphing active pill whose width transitions on `--ease-out` at
   `--dur-2`.
4. **Selected work.** Endgame.ai and ChessEver as two large cards. The App Store
   screens fan on hover. On navigation the icon and title carry into the case
   header as a shared element via `motion`'s `layoutId`.
5. **App Store showcase.** A drag carousel with inertia and snap. Rating, seller
   and genre come live from the iTunes Lookup API and fall back to the committed
   snapshot. Screens are requested at 626px wide through Apple's resize path
   rather than accepting the 320x480 thumbnail.
6. **Case pages.** Sticky section labels; frames scaling 0.96 to 1 on entry; a
   scroll-position indicator.
7. **Theme toggle.** A circular View Transitions reveal originating at the
   toggle, where the API is supported, and a cross-fade where it is not.

### Constraints

`prefers-reduced-motion: reduce` collapses every one of the above to its end
state instantly. It does not play a shortened version and it does not fall back
to a CSS transition that happens to be cheaper — the reduced path renders the
final frame and nothing else.

Magnetic hover is `@media (hover: hover) and (pointer: fine)` only.

**Excluded, by instruction:** the ruler and tick-strip motif. Deji's
`.ruler-lines` measuring strip is not borrowed, and no measuring, tick, gauge or
ruler device appears anywhere on this site. Hairline separators remain available
as ordinary typographic rules; they are not to be developed into a measuring
language.

## 7. Routes

| Route | Contents |
| --- | --- |
| `/` | Hero, selected work (two), experience ladder, writing teaser, footer |
| `/work/[slug]` | `endgame-ai`, `chessever`. `dynamicParams = false` |
| `/writing` | Index of posts |
| `/writing/[slug]` | A post. `dynamicParams = false` |
| `/about` | Bio and the full role record |

Each route has its own loading state in the site's motion language, and its own
OG image generated with `next/og` in the site's own type and tokens.

Also shipped: favicon, apple-icon, web manifest, `robots.txt`, `sitemap.xml`.

## 8. Data and content honesty

All content lives in `data/`, typed, with the case studies and the App Store
snapshot carrying real material and everything about Kenny's career carrying
marked placeholders.

- `data/site.ts` — name, handle, email, location, social links
- `data/work.ts` — the two case studies, built from real material
- `data/app-store.ts` — ported, real, live-backed
- `data/experience.ts` — **placeholder records, marked as such in the file**
- `data/writing.ts` — **placeholder records, marked as such in the file**

LinkedIn answers HTTP 999 to any automated fetch, so Kenny's profile could not
be read. A web search surfaced fragments — Product Designer at SmallChess, and
earlier Forward Chess, Chessable, Telebu Communications — which are **not**
treated as fact and do **not** appear in the shipped data. The placeholder
records are shaped exactly like the real thing so that replacing them is a
content edit and never a structural one. Nothing about Kenny's career is
invented.

## 9. Testing

vitest, following the ported patterns.

- Contrast: every token pair that occurs in the built site, both skins
- Type scale: clamp ends are rem; no step is smaller than its fixed floor
- Motion tokens: no component references a duration or curve that is not in the set
- App Store: the live/recorded merge, exercised without the network
- Carousel: snap-point and inertia arithmetic, as a pure function
- Routing: both dynamic routes reject an unknown slug with a real 404 status

## 10. Deployment discipline

One Vercel project, one URL. Every deploy updates `README.md` in the same change
and pushes to GitHub — the README is not allowed to describe a version that is
no longer live. No secret, key or token appears in the repository or the README;
the iTunes Lookup API needs none, which is part of why it was chosen.

## 11. Out of scope

Not built, and not to be added without a new decision: a changelog or `/system`
surface, a shots or photo feed, any live personal instrument (now-playing, steps,
weather), an accent colour, a second typeface, a CMS, analytics, and a contact
form. Email is a `mailto:` link.
