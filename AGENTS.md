<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Runtime

Deployed on Cloudflare Workers through OpenNext. No filesystem, and none of the
`VERCEL_*` variables exist.

- Never read `node:fs` from a page, layout, route handler or metadata export.
  `existsSync` returns false and `readFileSync` throws for everything under
  `public/`, so a render path that filters on a disk check blanks the page
  instead of failing. Prove assets exist in a test, which runs in Node, and let
  Next serve icons and the share card as static files in `app/`. The one
  exception is `lib/steps.ts`, whose file fallback is wrapped in try/catch and
  exists for local development only.
- The variables the live widgets need are listed under README → Environment.
  They live in the Cloudflare dashboard, not the repo, so a host migration
  silently unsets all eight.
- The steps store is Cloudflare KV reached over its REST API with three
  variables, deliberately not a Worker binding: a binding would need dashboard
  build settings that nothing in this repo records, and going over REST keeps
  the store reachable from `next dev` and `vitest` too. Every KV read must
  carry `cache: "no-store"` — with the default, Next replays the first, empty
  read forever while writes keep landing.
