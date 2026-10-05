# Damilare Osofisan — Portfolio

Personal portfolio for product designer Damilare Osofisan: case files for
Hitman's Library, Endgame, ChessEver and Sylvan, a design-shots wall, an
about page with a wipe-to-reveal harbour film, and a live footer (clock,
weather, music, steps).

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript
- **Tailwind CSS v4**, `next-themes` (light/dark/system), `motion`
- **pnpm** — the local dev server runs on **port 3002** (`:3000` belongs to
  another project on this machine)

## Run it

```bash
pnpm install
pnpm dev --port 3002     # http://localhost:3002
```

| Command          | What it does                                  |
| ---------------- | --------------------------------------------- |
| `pnpm dev`       | dev server (add `--port 3002` locally)        |
| `pnpm build`     | production build                              |
| `pnpm start`     | serve the production build                    |
| `pnpm lint`      | eslint                                        |
| `pnpm test`      | vitest, single run (`test:watch` to iterate)  |
| `pnpm manifest`  | regenerate `node scripts/manifest.mjs` output |

Typecheck: `pnpm exec tsc --noEmit`.

## Structure

```
app/
  page.tsx            home — nav, work cards, Exploration 01 tile, footer
  about/page.tsx      photo deck, bio, harbour wipe, footer widgets
  shots/page.tsx      full-bleed shots wall (masonry + dealing deck + viewer)
  work/[slug]/        case-file pages with desktop rail + mobile pill
  api/now-playing/    Spotify currently-playing proxy (needs env, below)
  api/steps/          step-count proxy
  icon.tsx            generated tab icon (face crop, static fallback)
components/
  coin.tsx            header coin — cap front, him back, tap to whip it
  coin-favicon.tsx    tab coin — the header flip at favicon scale (~12fps)
  shots-wall.tsx      sticky icon toolbar, shuffle, captionless viewer
  warp-shot.tsx       pointer-tracked 2D tilt for wall tiles
  harbour-reveal.tsx  canvas frost you drag to wipe; video underneath
  case-rail.tsx       desktop progress rail + mobile bottom pill
  dfooter.tsx         sign-off, socials, live widget strip
  floor-controls.tsx  speaker + theme controls
data/
  dossier-work.ts         the four case files + galleries
  dossier-explorations.ts exploration data (route removed; kept for later)
  dossier.ts              shots, photos, socials, likes/dislikes
  site.ts               name, role, live URL — one edit moves domains
public/dossier/       all artwork, films, case frames, og-image.png
```

## Signature interactions

- **Coin + tab coin** — the header coin spins cap↔him endlessly and whips
  on tap (with sound, mutable). The tab icon replays the same flip on
  canvas. Reduced motion rests both on him.
- **Shots wall** — three-icon sticky pill (wall / deck / shuffle), click for
  a captionless viewer (arrows + Esc work, no hint text), drag-to-deal deck.
- **Harbour wipe** — procedural canvas frost (speckle, beaded drops, drip
  trails) over a looping ship film. Strokes interpolate so fast drags wipe
  solid; a 24×24 thumbnail estimates 60% clearance, then the frost fades
  with a haptic tick and offers a re-frost.
- **Case rail** — BDO-voiced desktop rail; a bottom pill (counter +
  progress + steppers) on mobile.

## Environment

`.env.local` (gitignored, never committed) holds the two app credentials:

```
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REFRESH_TOKEN=      # mint once via the authorize flow, reuse everywhere
STEPS_WEBHOOK_SECRET=       # any long random string; must match the macro header
STEPS_STRIDE_M=0.762        # metres per step; tunes steps → km
```

Without Spotify values the music tile renders its idle state — the build
does not need them. To wire live playback: create an app at
`developer.spotify.com/dashboard`, whitelist
`http://localhost:3002/spotify-callback` (plus
`https://<domain>/spotify-callback` in production), complete the
authorization-code flow once, and store the resulting refresh token.
The same token serves every environment.

### Daily steps (Health Connect → macro → webhook)

The footer steps tile shows real kilometres from the owner's phone:

1. On Android: Health Connect shares step data with a macro app
   (MacroDroid). The macro fires once a day: HTTP POST to
   `https://<domain>/api/steps` with header
   `Authorization: Bearer <STEPS_WEBHOOK_SECRET>` and JSON body
   `{"steps": <count>}` (`step_count`, `value`, `count`, or `km` /
   `distance_km` are accepted too; an optional `"date": "YYYY-MM-DD"`
   backfills another day).
2. The route verifies the bearer, converts with `STEPS_STRIDE_M`,
   and stores the day.
3. The tile polls every 5 minutes (and on tab focus) and morphs to the
   new reading in dot-matrix. Tap flips between today and today+average.

Storage is Vercel KV when `KV_REST_API_URL` + `KV_REST_API_TOKEN` are
set (dashboard → Storage → Create KV → connect to the project — no code
changes), otherwise a small JSON file (`data/steps.local.json` locally,
`/tmp` on serverless). The file backend keeps the macro's Test button
green end to end; KV makes readings survive restarts and redeploys.

## Deployment

Vercel. `app/layout.tsx` prefers `VERCEL_URL` for absolute metadata (so
previews emit share cards that resolve where they are served) and falls
back to `site.url` (`https://damilareoo.xyz`) — point that at the custom
domain when it lands, and whitelist the production Spotify redirect URI
alongside localhost.

## Conventions

- Links rest grey everywhere and take brand/detail delight on hover;
  non-links are plain text (no `link-sheen` on static copy).
- Reduced motion is first-class: drifts, spins, tilts and the frost hint
  all hold still; functionality (keys, taps) never depends on animation.
- Bodies stay lowercase-dossier in voice; periods are scarce on purpose.
