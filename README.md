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
  icon.png            static tab icon (cap, frame zero of the loop)
  apple-icon.png      static home-screen icon, same crop at 180
  opengraph-image.png static share card, with .alt.txt beside it
components/
  coin.tsx            header coin — cap front, him back, tap to whip it
  coin-favicon.tsx    tab coin — the header flip at favicon scale (~30fps)
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
public/dossier/       all artwork, films, case frames
```

## Signature interactions

- **Coin + tab coin** — the header coin spins cap↔him endlessly and whips
  on tap (with sound, mutable). The tab icon runs the same linear flip on
  canvas at the same speed. Reduced motion freezes both — header on him,
  tab on the static cap.
- **Shots wall** — three-icon sticky pill (wall / deck / shuffle), click for
  a captionless viewer (arrows + Esc work, no hint text), drag-to-deal deck.
- **Harbour wipe** — procedural canvas frost (speckle, beaded drops, drip
  trails) over a looping ship film. Strokes interpolate so fast drags wipe
  solid; a 24×24 thumbnail estimates 60% clearance, then the frost fades
  with a haptic tick and offers a re-frost.
- **Case rail** — BDO-voiced desktop rail; a bottom pill (counter +
  progress + steppers) on mobile.

## Environment

`.env.local` (gitignored, never committed) holds the credentials. It is local
only: a deployed Worker gets its copy from the platform's own variables, and
nothing here travels with a `git push` — migrating hosts means re-entering all
eight, which is how both live widgets went quiet in October 2026.

```
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REFRESH_TOKEN=      # mint once via the authorize flow, reuse everywhere
STEPS_WEBHOOK_SECRET=       # any long random string; must match the macro header
STEPS_STRIDE_M=0.762        # metres per step; tunes steps → km
CLOUDFLARE_ACCOUNT_ID=      # the steps store — required wherever the site is read
CLOUDFLARE_KV_NAMESPACE_ID=
CLOUDFLARE_KV_API_TOKEN=
```

Without Spotify values the music tile renders its idle state — the build
does not need them. To wire live playback: create an app at
`developer.spotify.com/dashboard`, register a redirect URI of the exact form
`http://127.0.0.1:3000/callback`, request
`user-read-currently-playing user-read-recently-played`, complete the
authorization-code flow once, and store the resulting refresh token.
The exact string matters — to Spotify, `localhost` and `127.0.0.1` are two
different registrations, and a mismatch fails before your code ever sees a
code. The refresh token is what lasts; the authorization code is single-use
and expires in minutes, so each attempt mints a fresh one.

Apps still in Spotify's Development Mode are refused
`user-read-currently-playing`, so the tile falls back to the last finished
track. `{"isPlaying":false,"lastPlayed":true}` is that fallback working, not
a failure — it updates when a track ends rather than the instant it starts.

### Daily steps (Health Connect → webhook)

The footer steps tile shows real kilometres from the owner's phone. A relay
app on Android reads Health Connect and POSTs to
`https://<domain>/api/steps` with header
`Authorization: Bearer <STEPS_WEBHOOK_SECRET>`. Two payload shapes are
accepted, and `lib/steps.ts` folds both into step intervals bucketed by
Lagos day:

1. **Records** — the shape a relay like [HC Webhook](https://github.com/mcnaveen/health-connect-webhook)
   streams: `{"steps": [{"count", "start_time", "end_time"}, ...]}`.
   Such an app sends only what changed since its last successful sync,
   across a rolling 48-hour window, so each payload is an **increment**, not
   a day total, and one payload can straddle midnight. Intervals therefore
   *accumulate*, keyed by their own bounds — which also means a retried or
   re-delivered interval replaces itself instead of double-counting, so a
   2xx can never inflate the day.
2. **A single figure** — a macro template such as MacroDroid's
   `{"steps": <count>}`. This cannot be decomposed into intervals, so it
   *replaces* the day outright, in both directions: a total arriving after
   intervals and a relay sync arriving after a total each supersede rather
   than add. `step_count`, `stepcount`, `value`, `count`, `total`, `km`,
   `kilometres` and `distance_km` are accepted as aliases; an optional
   `"date": "YYYY-MM-DD"` backfills another day.

The route verifies the bearer, converts with `STEPS_STRIDE_M`, and stores the
day. Each rejection returns a status the sender's log can act on — 401 bad
bearer, 400 body not JSON, 422 no count in either shape — so nothing that
will never succeed is retried.

The tile polls every 60 seconds while its tab is visible and focused, and
refetches at once on focus or tab return, so a reading lands on screen within
a minute of the phone posting it. It morphs to the new reading in dot-matrix.
Tap flips between today and today+average.

The poll is not the limiting factor on freshness — the relay's own sync
interval is. Whatever the phone posts, the tile shows within a minute of it
arriving.

Storage is the Cloudflare KV namespace named by `CLOUDFLARE_ACCOUNT_ID` +
`CLOUDFLARE_KV_NAMESPACE_ID`, written with `CLOUDFLARE_KV_API_TOKEN`.
`lib/steps.ts` speaks KV's REST API over plain `fetch` rather than a Worker
binding, so the same three variables make the store work from a Worker, from
`next dev`, and from `vitest` — no binding to configure, and the token can be
scoped to KV read-and-write instead of whatever a binding's account allows.
One key per Lagos day (`steps:YYYY-MM-DD`), holding that day's intervals as
JSON: KV has no hash type, and a day on its own key is a day that can be
read, corrected or forgotten without touching the rest of the history. There
is no bulk read on this API, so a summary asks for the newest ten days one
request at a time rather than pricing the whole history into every poll. And
a day is read-then-rewritten whole: two payloads that land inside KV's
consistency window (Cloudflare documents up to 60 seconds) merge onto a stale
copy, and the first one's intervals are lost. The way back is `DELETE
/api/steps/recover` for that day, then a re-read of the range in HC Webhook —
only the phone can rebuild a day it has already counted as delivered.
Without them the routes fall back to
`data/steps.local.json` (`STEPS_FILE` overrides the path), which is a local-dev
convenience and nothing else: a Worker has no writable disk, so every write
fails and every read comes back empty.

Both routes now say which store answered. `GET /api/steps` carries
`backend: "kv" | "file"`, and a POST carries it beside `persisted`, because a
lone `{"configured": false}` is indistinguishable from a day with no walking.

## Deployment

Cloudflare Workers, built through OpenNext (responses carry `x-opennext: 1`).
The build itself is configured in the Cloudflare dashboard; nothing in this
repo records it, which is the first thing to fix if this site moves again.
`app/layout.tsx` resolves absolute metadata against `site.url`
(`https://damilare.works`) — never `VERCEL_URL`, whose
per-deployment host dies with the build and takes every share card with
it. Whitelist the production Spotify redirect URI alongside localhost.

Two consequences of the runtime are worth stating, because both were learned
the hard way:

- **Nothing reads the filesystem at request time.** A Worker is served from an
  asset bundle, not a directory tree, so `existsSync` is false and `readFileSync`
  throws for every one of `public/`'s 2,000 files. Case-study frames are proved
  present at build time by `data/dossier-work.test.ts`, and the tab icon, home
  icon and share card are static files in `app/` that Next hashes and serves.
- **A missing variable fails quietly.** Re-enter the seven in the dashboard
  after any move. What they look like when absent: `/api/now-playing` answers
  `{"isPlaying": false, "reason": "no-credentials"}`, `/api/steps` answers
  `{"configured": false, "backend": "file"}`, and a case-study page answers with
  its prose intact and no frames at all.

## Conventions

- Links rest grey everywhere and take brand/detail delight on hover;
  non-links are plain text (no `link-sheen` on static copy).
- Reduced motion is first-class: drifts, spins, tilts and the frost hint
  all hold still; functionality (keys, taps) never depends on animation.
- Bodies stay lowercase-dossier in voice; periods are scarce on purpose.
