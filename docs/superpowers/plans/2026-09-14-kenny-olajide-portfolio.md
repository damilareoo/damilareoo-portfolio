# Kenny Olajide Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a single-person animated portfolio for Kenny Olajide, featuring Endgame.ai and ChessEver with their live App Store listings.

**Architecture:** A fresh Next.js 16 App Router application with a two-skin
neutral token system, Inter as the only typeface, and one governed motion token
set that every animation resolves to. Four modules are ported verbatim from
`/Users/v/portfolio-v2` (App Store client, contrast harness, and two
`useSyncExternalStore` hooks); nothing else crosses over.

**Tech Stack:** Next.js 16.3.0, React 19.2.8, TypeScript 5, Tailwind 4, `motion` v13, `next-themes` 0.4.6, vitest 3, pnpm 10.

**Spec:** `docs/superpowers/specs/2026-09-14-kenny-olajide-portfolio-design.md`

## Global Constraints

Every task's requirements implicitly include this section.

- **Repository:** `/Users/v/kenny-olajide-portfolio`. Already `git init`ed with the spec committed.
- **Package manager:** `pnpm`. Never `npm` or `yarn`.
- **Typeface:** Inter only, via `next/font/google`. No second family anywhere.
- **Colour:** neutrals only. No accent hue. No element earns an exception.
- **Ink placement rules (enforced by the harness, not merely documented):**
  1. `--text-1` on any ground.
  2. `--text-2` body copy on `--bg` and `--surface`; on `--surface-2` large text only (4.39).
  3. `--text-3` body copy on `--bg` only (3.99 on `--surface`).
  4. `--text-4` is **never type** — decorative marks and disabled states only.
- **Motion:** every duration and curve comes from `lib/motion.ts`. No component hand-rolls a timing. That includes Tailwind's *implicit* timings: a bare `transition-colors` resolves to Tailwind's built-in 150ms, which is not one of the four. `@theme inline` therefore rebinds `--default-transition-duration` to `var(--dur-micro)` and `--default-transition-timing-function` to `var(--ease-out)`, so the plain utilities land on the token set without every component naming a duration.
- **Reduced motion and JS animation:** the `globals.css` reduced-motion block reaches CSS-declared animations and transitions only. Any Web Animations API call or `motion` animation needs its own `useReducedMotion()` guard in the component — a bare `*` selector matches neither a script-created animation nor a `::view-transition-*` pseudo-element.
- **Reduced motion:** `prefers-reduced-motion: reduce` renders the *final frame instantly*. Not a shortened animation.
- **Excluded by instruction:** the ruler / tick-strip / gauge / measuring motif, in any form, anywhere. Hairline separators are ordinary typographic rules and must not be developed into a measuring device.
- **Content honesty:** nothing about Kenny's career is invented. `data/experience.ts` and `data/writing.ts` ship as placeholders with a file-level comment saying so.
- **Never commit** a secret, key, or token. The iTunes Lookup API needs none.
- **Commit trailer** on every commit:
  ```
  Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01DtiZwK9xL4Nz8oyfhfvihh
  ```

## File Structure

```
app/
  layout.tsx              root shell, font, theme provider
  page.tsx                home
  globals.css             tokens: colour, type scale, motion
  loading.tsx             route loading state
  not-found.tsx
  opengraph-image.tsx     home OG
  icon.tsx  apple-icon.tsx  manifest.ts  robots.ts  sitemap.ts
  work/[slug]/page.tsx    + opengraph-image.tsx
  writing/page.tsx  writing/[slug]/page.tsx
  about/page.tsx
  api/app-store/art/[...src]/route.ts    Apple artwork proxy
components/
  nav.tsx                 morphing active pill
  boot-screen.tsx         session-scoped entrance
  reveal.tsx              staged line/block reveal primitive
  work-card.tsx           a selected piece on the home
  shot-carousel.tsx       draggable App Store screens
  app-store-meta.tsx      rating / seller / genre row
  theme-toggle.tsx
  ui.tsx                  Chip, Label, RecordRow, Rule
lib/
  contrast.ts             PORTED
  use-media-query.ts      PORTED
  use-mounted.ts          PORTED
  app-store.ts            PORTED
  motion.ts               easing + duration tokens, reduced-motion hook
  carousel.ts             pure snap/inertia arithmetic
data/
  site.ts  work.ts  experience.ts  writing.ts  app-store.ts
public/apps/{endgame-ai,chessever}/   PORTED assets
```

---

### Task 1: Scaffold, tooling, and a passing test run

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Test: `lib/smoke.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: a working `pnpm test`, `pnpm build`, `pnpm lint`.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "kenny-olajide-portfolio",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "motion": "^13.0.0",
    "next": "16.3.0",
    "next-themes": "^0.4.6",
    "react": "19.2.8",
    "react-dom": "19.2.8"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.3.0",
    "jsdom": "^29.1.1",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vitest": "^3.2.7"
  },
  "packageManager": "pnpm@10.31.0"
}
```

- [ ] **Step 2: Create the config files**

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`next.config.ts` — note the deliberately empty image config, which is what keeps
Apple's CDN behind the proxy route rather than the optimiser's allowlist:
```ts
import type { NextConfig } from "next";

/* No `remotePatterns`, on purpose. Nothing external is optimised directly;
   Apple's artwork comes through /api/app-store/art instead. Widening this
   would hand every future component permission to load from mzstatic.com. */
const nextConfig: NextConfig = {};

export default nextConfig;
```

`postcss.config.mjs`:
```js
export default { plugins: { "@tailwindcss/postcss": {} } };
```

`vitest.setup.ts` — registers the DOM matchers every component test uses:
```ts
import "@testing-library/jest-dom/vitest";
```

`eslint.config.mjs` — import the flat configs directly. **Do not use
`FlatCompat`.** `eslint-config-next` 16 ships native flat config arrays at
`eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`;
routing them through the eslintrc compatibility bridge makes the validator
`JSON.stringify` a config whose `plugins.react` closes a cycle, and lint dies
with `TypeError: Converting circular structure to JSON` before running a single
rule. The bridge exists for configs that have no flat build. This one does.

```js
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

export default [
  ...coreWebVitals,
  ...typescript,
  { ignores: [".next/**", "node_modules/**", "*.tsbuildinfo"] },
];
```

This also means `@eslint/eslintrc` is **not** a dependency of this project.

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: { environment: "jsdom", globals: true, setupFiles: ["./vitest.setup.ts"] },
  resolve: { alias: { "@": resolve(__dirname, ".") } },
});
```

- [ ] **Step 3: Write the failing smoke test**

`lib/smoke.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";

describe("project scaffold", () => {
  it("pins the exact React and Next versions the plan names", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    expect(pkg.dependencies.next).toBe("16.3.0");
    expect(pkg.dependencies.react).toBe("19.2.8");
  });

  it("declares no dependency that pulls in a second typeface", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    const names = Object.keys(pkg.dependencies).join(" ");
    expect(names).not.toMatch(/font|typeface/i);
  });
});
```

- [ ] **Step 4: Run the test and watch it fail**

Run: `pnpm install && pnpm test`
Expected: FAIL — `package.json` has not been written yet, or vitest cannot resolve. Once Step 1–2 files exist it passes; if it passes immediately, confirm the file really was read rather than the test silently skipping.

- [ ] **Step 5: Create the minimal app shell**

`app/globals.css` (tokens arrive in Task 2; this is only enough to build):
```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

`app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Kenny Olajide" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

`app/page.tsx`:
```tsx
export default function Home() {
  return <main>Kenny Olajide</main>;
}
```

- [ ] **Step 6: Verify the whole toolchain**

Run: `pnpm test && pnpm exec tsc --noEmit && pnpm lint && pnpm build`
Expected: all four PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next 16 app with vitest and Tailwind 4"
```

---

### Task 2: Colour tokens and the contrast harness

**Files:**
- Create: `lib/contrast.ts` (ported), `lib/contrast.test.ts`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: nothing.
- Produces: `relativeLuminance(hex: string): number`, `contrastRatio(a: string, b: string): number`, `readSkins(css: string): { light: Record<string,string>; dark: Record<string,string> }`. CSS custom properties `--bg`, `--surface`, `--surface-2`, `--border`, `--rule`, `--text-1`…`--text-4`, `--chip` on `:root` and `.dark`.

- [ ] **Step 1: Port `lib/contrast.ts` verbatim from portfolio-v2**

```bash
cp /Users/v/portfolio-v2/lib/contrast.ts lib/contrast.ts
```

Read the copied file and confirm it exports exactly `relativeLuminance`,
`contrastRatio`, and `readSkins`. `readSkins` parses `:root` and `.dark` blocks
for `--name: #hex;` pairs and matches only 3–6 digit hex, which is why `--chip`
below is written in `rgb()` — it is translucent, so a ratio measured against the
token itself would be meaningless.

- [ ] **Step 2: Write the failing contrast test**

`lib/contrast.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { contrastRatio, readSkins } from "./contrast";

const css = readFileSync("app/globals.css", "utf8");
const { light, dark } = readSkins(css);

const AA = 4.5;
const LARGE = 3;

describe("the light skin", () => {
  it("sets every token the site reads", () => {
    for (const t of ["--bg","--surface","--surface-2","--border","--rule","--text-1","--text-2","--text-3","--text-4"]) {
      expect(light[t], `light is missing ${t}`).toBeDefined();
    }
  });

  it("carries body copy at AA on --bg for ink 1 through 3", () => {
    for (const t of ["--text-1", "--text-2", "--text-3"]) {
      expect(contrastRatio(light[t], light["--bg"])).toBeGreaterThanOrEqual(AA);
    }
  });

  it("carries body copy at AA on --surface for ink 1 and 2 only", () => {
    expect(contrastRatio(light["--text-1"], light["--surface"])).toBeGreaterThanOrEqual(AA);
    expect(contrastRatio(light["--text-2"], light["--surface"])).toBeGreaterThanOrEqual(AA);
    // Rule 3: --text-3 is below AA here. Held as a fact, so moving the token trips this.
    expect(contrastRatio(light["--text-3"], light["--surface"])).toBeLessThan(AA);
  });

  it("keeps --text-4 out of every text role", () => {
    // Rule 4: it fails even the large-text floor on all three light grounds.
    for (const g of ["--bg", "--surface", "--surface-2"]) {
      expect(contrastRatio(light["--text-4"], light[g])).toBeLessThan(LARGE);
    }
  });
});

describe("the dark skin", () => {
  it("carries body copy at AA on --bg and --surface for ink 1 through 3", () => {
    for (const t of ["--text-1", "--text-2", "--text-3"]) {
      for (const g of ["--bg", "--surface"]) {
        expect(contrastRatio(dark[t], dark[g])).toBeGreaterThanOrEqual(AA);
      }
    }
  });

  it("keeps --text-4 to decoration in dark too, for one rule across both skins", () => {
    expect(contrastRatio(dark["--text-4"], dark["--surface"])).toBeLessThan(AA);
  });
});

describe("both skins", () => {
  it("holds the exact measured figures, so a nudge has to state its cost", () => {
    expect(contrastRatio(light["--text-2"], light["--bg"])).toBeCloseTo(5.37, 1);
    expect(contrastRatio(light["--text-3"], light["--bg"])).toBeCloseTo(4.54, 1);
    expect(contrastRatio(dark["--text-1"], dark["--bg"])).toBeCloseTo(16.40, 1);
    expect(contrastRatio(dark["--text-4"], dark["--bg"])).toBeCloseTo(4.50, 1);
  });
});
```

- [ ] **Step 3: Run it and watch it fail**

Run: `pnpm test lib/contrast.test.ts`
Expected: FAIL — `readSkins` throws `no :root block in the stylesheet`.

- [ ] **Step 4: Write the tokens into `app/globals.css`**

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

/* Light is read out of dejiajetomobi.com's shipped stylesheet; dark out of
   jakub.kr's. Four ink rungs rather than three because that is the number both
   references actually occupy — collapsing to three would approximate one.

   --text-4 is not a text token. It fails AA on all three light grounds and
   fails even the 3:1 large-text floor on all three. On Deji's site #9a9a9a
   draws the measuring ticks, which this site does not have, so the rung
   arrived here with no legitimate text job. It is kept for decorative marks
   and disabled states, and lib/contrast.test.ts holds it out of type. */
:root {
  --bg: #ffffff;
  --surface: #f0f0f0;
  --surface-2: #e8e8e8;
  --border: #e6e6e6;
  --rule: #d4d4d4;
  --text-1: #000000;
  --text-2: #6c6a6a;
  --text-3: #767676;
  --text-4: #9a9a9a;
  /* rgb() rather than #a5a5a533 so the harness's hex parser skips it: a
     translucent fill's real contrast depends on what is behind it. */
  --chip: rgb(165 165 165 / 0.2);
}

.dark {
  --bg: #101010;
  --surface: #191919;
  --surface-2: #222222;
  --border: #313131;
  --rule: #3a3a3a;
  --text-1: #eeeeee;
  --text-2: #dbdbdb;
  --text-3: #b5b5b5;
  --text-4: #7b7b7b;
  --chip: rgb(255 255 255 / 0.06);
}

@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-border: var(--border);
  --color-rule: var(--rule);
  --color-text-1: var(--text-1);
  --color-text-2: var(--text-2);
  --color-text-3: var(--text-3);
  --color-text-4: var(--text-4);
  --color-chip: var(--chip);
}

body {
  background: var(--bg);
  color: var(--text-2);
}
```

- [ ] **Step 5: Run the tests and verify they pass**

Run: `pnpm test lib/contrast.test.ts`
Expected: PASS, all 7 tests.

- [ ] **Step 6: Commit**

```bash
git add lib/contrast.ts lib/contrast.test.ts app/globals.css
git commit -m "feat: two-skin neutral tokens with a measured contrast harness"
```

---

### Task 3: Inter and the type scale

**Files:**
- Modify: `app/layout.tsx`, `app/globals.css`
- Test: `lib/type-scale.test.ts`

**Interfaces:**
- Consumes: `app/globals.css` from Task 2.
- Produces: CSS custom properties `--text-2xs` … `--text-xl`, `--tracking-tight`, `--tracking-label`; the `.label` utility class; `--font-inter` bound on `<html>`.

- [ ] **Step 1: Write the failing type-scale test**

`lib/type-scale.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";

const css = readFileSync("app/globals.css", "utf8");
const root = css.match(/:root\s*\{([^}]*)\}/)![1];
const step = (name: string) => root.match(new RegExp(`--text-${name}:\\s*([^;]+);`))![1].trim();

const FIXED = ["2xs", "xs", "sm"];
const FLUID = ["base", "lg", "xl"];

describe("the type scale", () => {
  it("sets all six steps", () => {
    for (const s of [...FIXED, ...FLUID]) expect(step(s)).toBeTruthy();
  });

  it("keeps the three small steps fixed", () => {
    // Captions, labels, years and counts are already at their floor. Growing
    // them with the window makes them worse, not more readable.
    for (const s of FIXED) expect(step(s)).not.toMatch(/clamp|vw/);
  });

  it("makes the three large steps fluid", () => {
    for (const s of FLUID) expect(step(s)).toMatch(/^clamp\(/);
  });

  it("anchors both clamp ends in rem so browser zoom still reaches them", () => {
    for (const s of FLUID) {
      const [min, , max] = step(s).replace(/^clamp\(|\)$/g, "").split(/,(?![^()]*\))/);
      expect(min.trim(), `${s} min`).toMatch(/rem$/);
      expect(max.trim(), `${s} max`).toMatch(/rem$/);
    }
  });

  it("leads every preferred value with a rem term, never pure vw", () => {
    // A preferred value of pure vw pins size to the window and ignores the
    // visitor's text-size setting entirely.
    for (const s of FLUID) {
      const pref = step(s).replace(/^clamp\(|\)$/g, "").split(/,(?![^()]*\))/)[1];
      expect(pref.trim(), `${s} preferred`).toMatch(/^[\d.]+rem/);
    }
  });

  it("enables tabular figures and Inter's disambiguation set, and not cv05", () => {
    // ss02 is Inter's "Disambiguation (with zero)" and already covers the
    // I/l/1 collision and the slashed zero. cv05 would duplicate that work.
    expect(css).toMatch(/font-feature-settings:[^;]*"tnum"/);
    expect(css).toMatch(/font-feature-settings:[^;]*"ss02"/);
    expect(css).not.toMatch(/"cv05"/);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm test lib/type-scale.test.ts`
Expected: FAIL — cannot read property of null, because no `--text-*` step exists.

- [ ] **Step 3: Bind Inter in `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

/* next/font self-hosts this at build time — no request to Google at runtime,
   and no layout shift from a swap. `variable` rather than `className` so the
   family is reachable as a token from CSS alongside the colour tokens. */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = { title: "Kenny Olajide" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Add the scale to `app/globals.css`**

Append inside the existing `:root` block, before its closing brace:

```css
  /* Six steps. The three small ones are fixed: they carry captions, labels,
     years and counts — type already at its floor, which gets worse rather than
     better when it grows with the window. The three large ones are fluid,
     ramping 320px to 1280px and then stopping, because the page measure stops
     growing at roughly there and type that keeps growing past the measure is
     only bigger, not more readable.

     Both clamp ends are rem, and so is the leading term of every preferred
     value, so browser text-size and zoom still reach them. A preferred value
     of pure vw would pin the size to the window and ignore the visitor. */
  --text-2xs: 0.6875rem;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: clamp(1rem, 0.9792rem + 0.104vw, 1.0625rem);
  --text-lg: clamp(1.375rem, 1.2917rem + 0.42vw, 1.625rem);
  --text-xl: clamp(2.25rem, 1.8333rem + 2.08vw, 3.5rem);

  /* Optical, not uniform. Large display type closes up; body sits at zero;
     the one place letter-spacing opens is the uppercase micro-label. */
  --tracking-tight: -0.03em;
  --tracking-label: 0.08em;
```

And after the `@theme inline` block:

```css
html {
  font-family: var(--font-inter), system-ui, sans-serif;
  font-optical-sizing: auto;
  /* tnum so figures do not jitter when a rating or a count changes; ss02 is
     Inter's "Disambiguation (with zero)"; case fixes punctuation set beside
     capitals. calt is on by default and is left alone. */
  font-feature-settings: "tnum" 1, "ss02" 1, "case" 1;
}

/* The only micro-label on the site. There is no second typeface, so a label
   and a heading are the same font doing two different jobs. */
@layer utilities {
  .label {
    font-size: var(--text-2xs);
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    font-weight: 500;
    color: var(--text-3);
  }
}
```

- [ ] **Step 5: Run the tests and verify they pass**

Run: `pnpm test`
Expected: PASS — contrast and type-scale suites both green.

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx app/globals.css lib/type-scale.test.ts
git commit -m "feat: Inter and a six-step fluid type scale"
```

---

### Task 4: The motion token set

**Files:**
- Create: `lib/motion.ts`, `lib/motion.test.ts`, `lib/use-media-query.ts` (ported), `lib/use-mounted.ts` (ported)
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `app/globals.css`.
- Produces:
  - `EASE_OUT: [number, number, number, number]` = `[0.22, 0.61, 0.36, 1]`
  - `EASE_INOUT: [number, number, number, number]` = `[0.65, 0, 0.35, 1]`
  - `DUR: { micro: 0.18; base: 0.42; staged: 0.72; entrance: 1.2 }` (seconds, for `motion`)
  - `useReducedMotion(): boolean`
  - `useMediaQuery(query: string, serverSnapshot?: boolean): boolean`
  - `useMounted(): boolean`

- [ ] **Step 1: Port the two hooks**

```bash
cp /Users/v/portfolio-v2/lib/use-media-query.ts lib/use-media-query.ts
cp /Users/v/portfolio-v2/lib/use-mounted.ts lib/use-mounted.ts
```

Both read their value through `useSyncExternalStore`. Do not replace either with
a `useState` + `useEffect` mounted flag — that is a state write after paint and
this repo's lint config rejects it.

- [ ] **Step 2: Write the failing motion test**

`lib/motion.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { DUR, EASE_OUT, EASE_INOUT } from "./motion";

const css = readFileSync("app/globals.css", "utf8");

describe("the motion token set", () => {
  it("uses Deji's nav curve verbatim as the primary ease", () => {
    // dejiajetomobi.com: .active-container{transition:width .42s cubic-bezier(.22,.61,.36,1)}
    expect(EASE_OUT).toEqual([0.22, 0.61, 0.36, 1]);
    expect(DUR.base).toBe(0.42);
  });

  it("offers exactly four durations", () => {
    expect(Object.keys(DUR).sort()).toEqual(["base", "entrance", "micro", "staged"]);
  });

  it("mirrors every token into CSS so both languages animate identically", () => {
    expect(css).toContain("--ease-out: cubic-bezier(0.22, 0.61, 0.36, 1)");
    expect(css).toContain("--ease-inout: cubic-bezier(0.65, 0, 0.35, 1)");
    expect(css).toContain("--dur-base: 420ms");
  });

  it("agrees between the JS seconds and the CSS milliseconds", () => {
    for (const [name, seconds] of Object.entries(DUR)) {
      expect(css, `--dur-${name}`).toContain(`--dur-${name}: ${Math.round(seconds * 1000)}ms`);
    }
  });

  it("collapses to the final frame under reduced motion, not to a faster one", () => {
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
    const block = css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/)![1];
    expect(block).toMatch(/animation-duration:\s*0\.01ms/);
    expect(block).toMatch(/transition-duration:\s*0\.01ms/);
    expect(block).toMatch(/animation-iteration-count:\s*1/);
  });

  it("keeps the ruler motif out of the stylesheet entirely", () => {
    expect(css).not.toMatch(/ruler|tick-strip|gauge/i);
  });

  it("holds EASE_INOUT for symmetric moves", () => {
    expect(EASE_INOUT).toEqual([0.65, 0, 0.35, 1]);
  });
});
```

- [ ] **Step 3: Run it and watch it fail**

Run: `pnpm test lib/motion.test.ts`
Expected: FAIL — `Cannot find module './motion'`.

- [ ] **Step 4: Write `lib/motion.ts`**

Note there is deliberately **no `"use client"`** on this module. It is four
constants plus one hook, and the directive would turn a constants module into a
client boundary — any server component that later reads `DUR` would drag one
along silently. The hook is only ever called from modules that declare
`"use client"` themselves, and `use-media-query.ts` keeps its own directive, so
nothing loses its client marking.

```ts
import { useMediaQuery } from "./use-media-query";

/**
 * Every duration and curve on this site.
 *
 * The primary curve is not invented. dejiajetomobi.com transitions its nav
 * pill with `width .42s cubic-bezier(.22,.61,.36,1)`, and that number is
 * borrowed intact rather than eyeballed into something close. Everything else
 * is spaced around it.
 *
 * Seconds here because `motion` takes seconds; the same four are mirrored into
 * CSS as milliseconds in app/globals.css, and lib/motion.test.ts holds the two
 * in agreement. A component that needs a timing reaches for one of these —
 * there is no fifth duration and no second curve.
 */
export const EASE_OUT = [0.22, 0.61, 0.36, 1] as const satisfies readonly [number, number, number, number];
export const EASE_INOUT = [0.65, 0, 0.35, 1] as const satisfies readonly [number, number, number, number];

export const DUR = {
  /** Hover, press, focus. Fast enough to read as feedback rather than motion. */
  micro: 0.18,
  /** The default. Deji's nav figure. */
  base: 0.42,
  /** A staged reveal, where the stagger needs room to be legible. */
  staged: 0.72,
  /** Entrance and the boot screen. The only budget this long. */
  entrance: 1.2,
} as const;

/**
 * The gap between one staged item arriving and the next.
 *
 * Not a member of DUR, because it is not a duration — nothing lasts 60ms here.
 * It is the offset between two things that each last `DUR.staged`, and giving
 * it a name keeps it out of the components: a bare `i * 0.06` in a reveal is a
 * component hand-rolling a timing, which is the one thing the token set exists
 * to stop. Long enough to read as sequence, short enough that the last line is
 * not still arriving after the eye has moved on.
 */
export const STAGGER = 0.06;

/**
 * How long a finished thing rests before it leaves.
 *
 * The boot counter reaches 100 and the screen does not go at once — a beat of
 * stillness is what stops the exit reading as a cut. Named for the same reason
 * STAGGER is: `DUR.entrance * 1000 + 200` buries a timing decision in a
 * component, and the token set exists so that every such decision is visible
 * in one file.
 */
export const HOLD = 0.2;

/**
 * Whether this visitor has asked for less motion.
 *
 * `false` on the server so the prerendered shell matches the common case, and
 * corrected on hydration before anything has had time to animate. Read through
 * matchMedia rather than an effect, like everything else here.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)", false);
}
```

- [ ] **Step 5: Mirror the tokens into `app/globals.css`**

Append inside `:root`:
```css
  --ease-out: cubic-bezier(0.22, 0.61, 0.36, 1);
  --ease-inout: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-micro: 180ms;
  --dur-base: 420ms;
  --dur-staged: 720ms;
  --dur-entrance: 1200ms;
```

And at the end of the file:
```css
/* Reduced motion renders the final frame. It is deliberately not a shortened
   animation and not a cheaper transition — a visitor who asked for less motion
   asked for the end state, not for the same move played faster. 0.01ms rather
   than 0 so that animationend and transitionend still fire and any listener
   waiting on them is not stranded. */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 6: Run the tests and verify they pass**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/motion.ts lib/motion.test.ts lib/use-media-query.ts lib/use-mounted.ts app/globals.css
git commit -m "feat: one governed motion token set, mirrored in CSS and JS"
```

---

### Task 5: Theme provider and the View Transitions toggle

**Files:**
- Create: `components/theme-toggle.tsx`
- Modify: `app/layout.tsx`
- Test: `components/theme-toggle.test.tsx`

**Interfaces:**
- Consumes: `useMounted` (Task 4), `DUR`/`EASE_OUT` (Task 4).
- Produces: `<ThemeToggle />`.

- [ ] **Step 1: Write the failing test**

`components/theme-toggle.test.tsx`:
```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeToggle } from "./theme-toggle";

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: vi.fn() }),
}));

describe("ThemeToggle", () => {
  it("names the theme it will switch TO, which is what the visitor is choosing", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button")).toHaveAccessibleName(/dark/i);
  });

  it("is a real button so it is reachable by keyboard", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button").tagName).toBe("BUTTON");
  });
});
```

`@testing-library/jest-dom` and the `vitest.setup.ts` that registers it were both
created in Task 1. Nothing extra to install here.

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm test components/theme-toggle.test.tsx`
Expected: FAIL — `Cannot find module './theme-toggle'`.

- [ ] **Step 3: Write the toggle**

`components/theme-toggle.tsx`:
```tsx
"use client";

import { useTheme } from "next-themes";
import { DUR, EASE_OUT, useReducedMotion } from "@/lib/motion";
import { useMounted } from "@/lib/use-mounted";

/**
 * A circular reveal from the toggle itself, where the browser supports it.
 *
 * View Transitions animate the whole document between two paints, which is the
 * only way to cross-fade a theme without every element animating its own
 * colour and half of them arriving out of step. Where the API is missing the
 * theme simply changes — an un-animated correct result, never a JS fallback
 * reimplementing the same effect worse.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const reduced = useReducedMotion();
  const next = resolvedTheme === "dark" ? "light" : "dark";

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    const run = () => setTheme(next);

    /* Two ways out, and both end at the finished theme.
   
       The reduced-motion check has to live HERE rather than in CSS. The
       globals.css block collapses CSS-declared animations, and this is a
       script-created Element.animate() on a ::view-transition pseudo-element —
       a bare `*` selector reaches neither. A visitor who asked for less motion
       would have got the full circle-expand anyway, which is the exact failure
       that block was written to prevent. */
    if (reduced || !document.startViewTransition) return run();

    const { top, left, width, height } = event.currentTarget.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    document.startViewTransition(run).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        {
          /* DUR.base and EASE_OUT, converted into the units the Web Animations
             API wants — milliseconds and a cubic-bezier() string. Writing the
             literals here would be a component hand-rolling a timing, which is
             exactly what the token set exists to prevent. */
          duration: DUR.base * 1000,
          easing: `cubic-bezier(${EASE_OUT.join(",")})`,
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="label cursor-pointer transition-colors hover:text-text-1"
      /* Before hydration the resolved theme is unknown, so the label names the
         dark switch rather than flickering to the other word a frame later. */
      aria-label={mounted ? `Switch to ${next} theme` : "Switch to dark theme"}
    >
      {mounted ? next : "dark"}
    </button>
  );
}
```

- [ ] **Step 4: Add the provider to `app/layout.tsx`**

Wrap `{children}` in `<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>` imported from `next-themes`, and keep
`suppressHydrationWarning` on `<html>` (next-themes writes the class before React hydrates).

Add to `app/globals.css`:
```css
/* The circular reveal is the whole transition. Let the two snapshots sit still
   underneath it rather than cross-fading as well, which would double the move. */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
```

- [ ] **Step 5: Run the tests and verify they pass**

Run: `pnpm test && pnpm build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: theme provider and a View Transitions toggle"
```

---

### Task 6: The data layer

**Files:**
- Create: `data/site.ts`, `data/work.ts`, `data/experience.ts`, `data/writing.ts`
- Test: `data/placeholders.test.ts`

**Interfaces:**
- Produces: `site`, `elsewhere`, `work: WorkItem[]`, `findWork(slug)`, `roles: Role[]`, `posts: Post[]`, and `IS_PLACEHOLDER` exported `true` from both placeholder files.

- [ ] **Step 1: Write the failing honesty test**

`data/placeholders.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { IS_PLACEHOLDER as experienceIsPlaceholder, roles } from "./experience";
import { IS_PLACEHOLDER as writingIsPlaceholder, posts } from "./writing";
import { work, findWork } from "./work";

describe("content honesty", () => {
  it("flags both career files as placeholder in code, not only in a comment", () => {
    expect(experienceIsPlaceholder).toBe(true);
    expect(writingIsPlaceholder).toBe(true);
  });

  it("says so at the top of each file for whoever edits it next", () => {
    for (const f of ["data/experience.ts", "data/writing.ts"]) {
      expect(readFileSync(f, "utf8").slice(0, 600)).toMatch(/PLACEHOLDER/);
    }
  });

  it("never files the unverified ZoomInfo employers as fact", () => {
    // Search surfaced SmallChess, Forward Chess, Chessable and Telebu from a
    // scrape. None of it is confirmed, so none of it ships.
    const text = readFileSync("data/experience.ts", "utf8");
    for (const name of ["SmallChess", "Forward Chess", "Chessable", "Telebu"]) {
      expect(text, `${name} must not appear`).not.toContain(name);
    }
  });

  it("marks every placeholder role and post visibly", () => {
    for (const r of roles) expect(r.placeholder).toBe(true);
    for (const p of posts) expect(p.placeholder).toBe(true);
  });
});

describe("the work", () => {
  it("selects exactly the two pieces the brief names", () => {
    expect(work.map((w) => w.slug)).toEqual(["endgame-ai", "chessever"]);
  });

  it("finds a piece by slug and returns undefined for anything else", () => {
    expect(findWork("chessever")?.title).toBe("ChessEver");
    expect(findWork("nope")).toBeUndefined();
  });

  it("gives every piece the fields a case page renders", () => {
    for (const w of work) {
      expect(w.title).toBeTruthy();
      expect(w.year).toMatch(/^\d{4}$/);
      expect(w.role).toBeTruthy();
      expect(w.summary.length).toBeGreaterThan(40);
    }
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm test data/placeholders.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write `data/site.ts`**

```ts
export const site = {
  name: "Kenny Olajide",
  role: "Product Designer",
  url: "https://kennyolajide.com",
  email: "hello@kennyolajide.com",
  linkedin: "https://linkedin.com/in/kennyolajide",
};

/* Only links that are known to exist. A portfolio that lists an empty profile
   is worse than one that lists none. */
export const elsewhere = [
  { label: "LinkedIn", handle: "kennyolajide", href: site.linkedin },
  { label: "Email", handle: site.email, href: `mailto:${site.email}` },
];
```

> **Note for the implementer:** `url` and `email` are assumptions. Flag both to
> the owner at review rather than treating them as settled.

- [ ] **Step 4: Write `data/work.ts`**

```ts
export type WorkItem = {
  slug: string;
  title: string;
  year: string;
  role: string;
  /** One sentence for the home card. */
  summary: string;
  /** The case page's opening paragraphs. */
  body: string[];
  collaborators?: { name: string; role: string; href?: string }[];
};

export const work: WorkItem[] = [
  {
    slug: "endgame-ai",
    title: "Endgame AI",
    year: "2026",
    role: "Product Design",
    summary:
      "An iOS chess app that turns post-game analysis into something a club player can actually read.",
    body: [
      "Endgame AI ships on the App Store as a games app from Endgame Chess Inc. The product's problem is not analysis — engines have been superhuman for thirty years — it is that engine output is written for engines.",
      "The design work is the translation layer: what a blunder cost, in a sentence, at the moment it happened.",
    ],
    collaborators: [
      { name: "Damilare Osofisan", role: "Product Design", href: "https://www.damilareoo.xyz" },
    ],
  },
  {
    slug: "chessever",
    title: "ChessEver",
    year: "2025",
    role: "0–1 Product Experience",
    summary:
      "Follow professional chess tournaments live, across web and iOS, built from nothing.",
    body: [
      "ChessEver follows professional tournaments in real time — live commentary, player analytics, tournament tracking — across web and mobile.",
      "It was designed from scratch on both platforms, which meant settling what a board, a clock and a move list are on this product before any screen could be drawn.",
    ],
    collaborators: [
      { name: "Damilare Osofisan", role: "Product Design", href: "https://www.damilareoo.xyz" },
    ],
  },
];

export function findWork(slug: string) {
  return work.find((w) => w.slug === slug);
}
```

- [ ] **Step 5: Write the two placeholder files**

`data/experience.ts`:
```ts
/**
 * PLACEHOLDER — Kenny's role history is not yet known to this repository.
 *
 * LinkedIn answers HTTP 999 to every automated fetch, so the profile at
 * linkedin.com/in/kennyolajide could not be read. A web search surfaced
 * fragments from a ZoomInfo scrape which are NOT treated as fact and do not
 * appear here.
 *
 * These records are shaped exactly like the real thing, so replacing them is a
 * content edit and never a structural one. Delete IS_PLACEHOLDER and the
 * `placeholder` flags in the same change that supplies real rows.
 */
export const IS_PLACEHOLDER = true;

export type Role = {
  role: string;
  company: string;
  from: string;
  to: string;
  placeholder: boolean;
};

export const roles: Role[] = [
  { role: "Product Designer", company: "Company", from: "2024", to: "Present", placeholder: true },
  { role: "Product Designer", company: "Company", from: "2022", to: "2024", placeholder: true },
  { role: "Designer", company: "Company", from: "2021", to: "2022", placeholder: true },
];
```

`data/writing.ts`:
```ts
/**
 * PLACEHOLDER — no real posts have been supplied.
 *
 * The routes, metadata, OG images and loading states around these are real and
 * finished; only the records are stand-ins. Replace the array and drop
 * IS_PLACEHOLDER in one change.
 */
export const IS_PLACEHOLDER = true;

export type Post = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  body: string[];
  placeholder: boolean;
};

export const posts: Post[] = [
  {
    slug: "on-constraint",
    title: "On constraint",
    date: "2026-01-01",
    excerpt: "Placeholder excerpt. Replace with a real post.",
    body: ["Placeholder body. Replace with a real post."],
    placeholder: true,
  },
  {
    slug: "designing-for-live",
    title: "Designing for live",
    date: "2026-01-01",
    excerpt: "Placeholder excerpt. Replace with a real post.",
    body: ["Placeholder body. Replace with a real post."],
    placeholder: true,
  },
];

export function findPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}
```

- [ ] **Step 6: Run the tests and verify they pass**

Run: `pnpm test data/placeholders.test.ts`
Expected: PASS, all 7 tests.

- [ ] **Step 7: Commit**

```bash
git add data/
git commit -m "feat: data layer, with career records flagged placeholder in code"
```

---

### Task 7: Port the App Store client and its assets

**Files:**
- Create: `data/app-store.ts`, `lib/app-store.ts`, `lib/app-store.test.ts`, `app/api/app-store/art/[...src]/route.ts`
- Create: `public/apps/endgame-ai/*`, `public/apps/chessever/*`

**Interfaces:**
- Consumes: nothing.
- Produces: `appSnapshots: AppSnapshot[]`, `AppCard`, `LookupRow`, `proxied(url)`, `atShotWidth(url)`, `recordedCard(s)`, `liveCard(s, row)`, `cardsFrom(rows)`, `recordedCards()`, `readAppStore(): Promise<Record<string, AppCard>>`, and the constants `LOOKUP_URL`, `REVALIDATE_SECONDS` (21600), `SHOT_WIDTH` (626), `ART_ROUTE`.

- [ ] **Step 1: Copy the four sources and the assets**

```bash
mkdir -p app/api/app-store/art/\[...src\] public/apps
cp /Users/v/portfolio-v2/data/app-store.ts data/app-store.ts
cp /Users/v/portfolio-v2/lib/app-store.ts lib/app-store.ts
cp /Users/v/portfolio-v2/app/api/app-store/art/\[...src\]/route.ts app/api/app-store/art/\[...src\]/route.ts
cp -R /Users/v/portfolio-v2/public/apps/endgame-ai public/apps/endgame-ai
cp -R /Users/v/portfolio-v2/public/apps/chessever public/apps/chessever
```

- [ ] **Step 2: Verify what arrived, and change nothing else**

Run: `ls public/apps/*/ && node -e "console.log(require('fs').readFileSync('data/app-store.ts','utf8').match(/slug: \"[a-z-]+\"/g))"`
Expected: five files per app (`01.jpg`–`04.jpg`, `icon.jpg`), and both slugs.

The only edit permitted in this task is removing the sentence in
`data/app-store.ts`'s header comment that refers to `data/work.ts` being "the
site's voice" if it no longer parses — the shot ratios, trackIds, ratings and
`recorded` date are measured facts and must not be touched.

- [ ] **Step 3: Write the failing merge test**

`lib/app-store.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { appSnapshots } from "@/data/app-store";
import {
  ART_ROUTE, SHOT_WIDTH, atShotWidth, cardsFrom, liveCard, proxied,
  recordedCard, recordedCards,
} from "./app-store";

const endgame = appSnapshots.find((a) => a.slug === "endgame-ai")!;

describe("the recorded floor", () => {
  it("serves every asset from public/, never from Apple", () => {
    const card = recordedCard(endgame);
    expect(card.icon.startsWith("/apps/")).toBe(true);
    for (const s of card.shots) expect(s.startsWith("/apps/")).toBe(true);
    expect(card.source).toBe("recorded");
  });

  it("drops trackId and recorded, which have no business reaching a component", () => {
    const card = recordedCard(endgame) as Record<string, unknown>;
    expect(card.trackId).toBeUndefined();
    expect(card.recorded).toBeUndefined();
  });

  it("keys every card by its work slug", () => {
    expect(Object.keys(recordedCards()).sort()).toEqual(["chessever", "endgame-ai"]);
  });
});

describe("rewriting Apple's URLs", () => {
  it("asks for the screen at reading width, not the 320x480 thumb", () => {
    expect(atShotWidth("https://is1-ssl.mzstatic.com/image/thumb/a/b/320x480bb.jpg"))
      .toBe(`https://is1-ssl.mzstatic.com/image/thumb/a/b/${SHOT_WIDTH}x0w.jpg`);
  });

  it("hands back a URL it does not recognise rather than mangling it", () => {
    expect(atShotWidth("https://example.com/thing")).toBe("https://example.com/thing");
  });

  it("routes artwork through the same-origin proxy, host first", () => {
    expect(proxied("https://is1-ssl.mzstatic.com/image/a.jpg"))
      .toBe(`${ART_ROUTE}/is1-ssl.mzstatic.com/image/a.jpg`);
  });
});

describe("the live merge", () => {
  it("takes the live figures when the payload carries them", () => {
    const card = liveCard(endgame, {
      trackId: Number(endgame.trackId), averageUserRating: 4.9,
      userRatingCount: 99, sellerName: "New Seller",
    });
    expect(card.rating).toBe(4.9);
    expect(card.ratingCount).toBe(99);
    expect(card.seller).toBe("New Seller");
    expect(card.source).toBe("live");
  });

  it("keeps the committed screens when a listing between builds returns none", () => {
    // Swapping four real screens for zero would empty a third of the card,
    // which is the one thing the floor exists to prevent.
    const card = liveCard(endgame, { trackId: Number(endgame.trackId), screenshotUrls: [] });
    expect(card.shots).toEqual(endgame.shots);
  });

  it("matches rows to snapshots by trackId, never by position", () => {
    // Two ids in and one row back is a normal answer. A positional match would
    // print one app's rating under the other's name.
    const only = appSnapshots.find((a) => a.slug === "chessever")!;
    /* Both figures, not just the average: `liveCard` takes a live rating only
       when `userRatingCount` and `averageUserRating` are BOTH numbers, so a row
       carrying the average alone falls to the floor and this assertion would
       fail against correct code. */
    const cards = cardsFrom([
      { trackId: Number(only.trackId), averageUserRating: 4.1, userRatingCount: 12 },
    ]);
    expect(cards["chessever"].source).toBe("live");
    expect(cards["chessever"].rating).toBe(4.1);
    expect(cards["endgame-ai"].source).toBe("recorded");
  });

  it("falls to the floor when the payload is empty", () => {
    const cards = cardsFrom([]);
    for (const c of Object.values(cards)) expect(c.source).toBe("recorded");
  });
});
```

- [ ] **Step 4: Run it and verify it passes without the network**

Run: `pnpm test lib/app-store.test.ts`
Expected: PASS. Every one of these exercises the merge as a pure function —
none of them makes a request. That separation is the point: a merge that can
only be exercised through the network is a merge nobody tests.

- [ ] **Step 5: Commit**

```bash
git add data/app-store.ts lib/app-store.ts lib/app-store.test.ts "app/api/app-store/art/[...src]/route.ts" public/apps lib/app-store.test.ts
git commit -m "feat: port the App Store client, its proxy route and both listings"
```

---

### Task 8: Shared UI primitives

**Files:**
- Create: `components/ui.tsx`, `components/ui.test.tsx`

**Interfaces:**
- Consumes: tokens from Tasks 2–3.
- Produces: `<Label>`, `<Chip>`, `<RecordRow label value href?>`.

There is deliberately no `<Rule />` separator component. `RecordRow` draws its
own `border-b`, so nothing on the site needs one, and a component that is built
and tested but never rendered is dead code however tidy it looks.

- [ ] **Step 1: Write the failing test**

`components/ui.test.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Chip, Label, RecordRow } from "./ui";

describe("primitives", () => {
  it("sets a label in the one micro-label style", () => {
    render(<Label>Selected work</Label>);
    expect(screen.getByText("Selected work")).toHaveClass("label");
  });

  it("renders a record row as a term and its definition", () => {
    render(<dl><RecordRow label="Year" value="2026" /></dl>);
    expect(screen.getByText("Year").tagName).toBe("DT");
    expect(screen.getByText("2026").tagName).toBe("DD");
  });

  it("links a record row's value out when given an href", () => {
    render(<dl><RecordRow label="Store" value="App Store" href="https://apps.apple.com" /></dl>);
    expect(screen.getByRole("link", { name: "App Store" })).toHaveAttribute("href", "https://apps.apple.com");
  });

  it("puts a chip on the translucent fill", () => {
    render(<Chip>Games</Chip>);
    expect(screen.getByText("Games").className).toMatch(/bg-chip/);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm test components/ui.test.tsx`
Expected: FAIL — `Cannot find module './ui'`.

- [ ] **Step 3: Write `components/ui.tsx`**

```tsx
import type { ReactNode } from "react";

/** The site's one micro-label. See the .label utility in globals.css. */
export function Label({ children }: { children: ReactNode }) {
  return <span className="label">{children}</span>;
}

/** A small translucent pill. Deji's .social-link, in this site's tokens. */
export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="bg-chip rounded text-text-2 px-2 py-1 text-[length:var(--text-xs)]">
      {children}
    </span>
  );
}

/**
 * One row of a record: label left, value right.
 *
 * A <dt>/<dd> pair rather than two divs, because that is what this is — the
 * row must sit inside a <dl>. One component for every such row on the site, so
 * three surfaces cannot drift into three slightly different rows.
 */
export function RecordRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="border-border flex items-baseline justify-between gap-4 border-b py-3">
      <dt className="label">{label}</dt>
      <dd className="text-text-1 text-[length:var(--text-sm)]">
        {href ? (
          <a href={href} className="hover:text-text-2 transition-colors underline-offset-4 hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

/* No separator component lives here. RecordRow draws its own border-b, which
   is the only separator the site uses. If one is ever needed standalone, it is
   a plain typographic rule and nothing more — it is not to be developed into
   ticks, a gauge, or any measuring device. */
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `pnpm test components/ui.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add components/ui.tsx components/ui.test.tsx
git commit -m "feat: shared UI primitives"
```

---

### Task 9: Nav with the morphing active pill

**Files:**
- Create: `components/nav.tsx`, `components/nav.test.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `EASE_OUT`, `DUR` (Task 4), `ThemeToggle` (Task 5).
- Produces: `<Nav />`.

- [ ] **Step 1: Write the failing test**

`components/nav.test.tsx`:
```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Nav } from "./nav";

vi.mock("next/navigation", () => ({ usePathname: () => "/work/chessever" }));
vi.mock("next-themes", () => ({ useTheme: () => ({ resolvedTheme: "light", setTheme: vi.fn() }) }));

describe("Nav", () => {
  it("links to every top-level surface", () => {
    render(<Nav />);
    for (const name of ["Work", "Writing", "About"]) {
      expect(screen.getByRole("link", { name })).toBeInTheDocument();
    }
  });

  it("marks the section containing the current page as current", () => {
    render(<Nav />);
    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "About" })).not.toHaveAttribute("aria-current");
  });

  it("carries no measuring device", () => {
    const { container } = render(<Nav />);
    expect(container.innerHTML).not.toMatch(/ruler|tick/i);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm test components/nav.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `components/nav.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { DUR, EASE_OUT } from "@/lib/motion";
import { ThemeToggle } from "./theme-toggle";
import { site } from "@/data/site";

const SECTIONS = [
  { href: "/work", label: "Work" },
  { href: "/writing", label: "Writing" },
  { href: "/about", label: "About" },
];

/**
 * The active pill morphs between items rather than fading in under each.
 *
 * `layoutId` is what makes it one object moving: motion measures the pill in
 * its old position and its new one and interpolates, so the width animates
 * along with the position. That is the behaviour borrowed from Deji's nav, on
 * the same curve and the same 420ms.
 *
 * Section match is by prefix, so /work/chessever lights "Work". Home matches
 * nothing, which is correct — there is no "Home" item to light.
 */
export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-6 py-5">
      <Link href="/" className="text-text-1 text-[length:var(--text-sm)] font-medium">
        {site.name}
      </Link>

      <ul className="flex items-center gap-1">
        {SECTIONS.map(({ href, label }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href} className="relative">
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="bg-surface-2 absolute inset-0 rounded-full"
                  transition={{ duration: DUR.base, ease: EASE_OUT }}
                />
              )}
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative block rounded-full px-3 py-1.5 text-[length:var(--text-sm)] transition-colors ${
                  active ? "text-text-1" : "text-text-3 hover:text-text-1"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
        <li className="pl-3">
          <ThemeToggle />
        </li>
      </ul>
    </nav>
  );
}
```

- [ ] **Step 4: Mount it in `app/layout.tsx`**

Render `<Nav />` above `{children}` inside the theme provider.

- [ ] **Step 5: Run the tests and verify they pass**

Run: `pnpm test && pnpm build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/nav.tsx components/nav.test.tsx app/layout.tsx
git commit -m "feat: nav with a morphing active pill"
```

---

### Task 10: The reveal primitive

**Files:**
- Create: `components/reveal.tsx`, `components/reveal.test.tsx`

**Interfaces:**
- Consumes: `DUR`, `EASE_OUT`, `useReducedMotion` (Task 4).
- Produces: `<Reveal delay?: number>`, `<RevealLines lines: string[]>`.

- [ ] **Step 1: Write the failing test**

`components/reveal.test.tsx`:
```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Reveal, RevealLines } from "./reveal";

const reduced = vi.hoisted(() => ({ value: false }));
vi.mock("@/lib/motion", async (orig) => ({
  ...(await orig<typeof import("@/lib/motion")>()),
  useReducedMotion: () => reduced.value,
}));

describe("Reveal", () => {
  it("renders its children as real text, animated or not", () => {
    render(<Reveal>Kenny Olajide</Reveal>);
    expect(screen.getByText("Kenny Olajide")).toBeInTheDocument();
  });

  it("puts each line in its own clipping frame so the mask reads per line", () => {
    const { container } = render(<RevealLines lines={["one", "two"]} />);
    expect(container.querySelectorAll(".overflow-hidden")).toHaveLength(2);
  });

  /* These two are a pair, and the second is what makes the first mean
     anything. Asserting only that the text is present would pass even if the
     reduced branch were deleted outright — motion.span renders its children as
     real text too. The observable difference is the inline transform that
     `initial={{ y: "110%" }}` writes: the animated branch has one, the plain
     span does not. */
  it("renders plain, untransformed spans when motion is reduced", () => {
    reduced.value = true;
    render(<RevealLines lines={["alpha", "beta"]} />);
    for (const word of ["alpha", "beta"]) {
      const el = screen.getByText(word);
      expect(el).toBeInTheDocument();
      expect(el.getAttribute("style") ?? "").not.toMatch(/transform|translate/);
    }
    reduced.value = false;
  });

  it("does write a transform when motion is not reduced", () => {
    reduced.value = false;
    render(<RevealLines lines={["gamma"]} />);
    expect(screen.getByText("gamma").getAttribute("style") ?? "").toMatch(
      /transform|translate/,
    );
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm test components/reveal.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `components/reveal.tsx`**

```tsx
"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { DUR, EASE_OUT, STAGGER, useReducedMotion } from "@/lib/motion";

/**
 * One block arriving.
 *
 * Under reduced motion this returns the final frame with no transition at all,
 * rather than the same move played quickly — someone who asked for less motion
 * asked for the end state.
 */
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduced = useReducedMotion();
  if (reduced) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: DUR.staged, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Type arriving line by line from behind its own edge.
 *
 * Each line needs its own `overflow-hidden` frame — one frame around the whole
 * block would clip the stack rather than each line, and the lines would slide
 * as one object instead of arriving in sequence. 60ms of stagger is enough to
 * read as sequence and short enough that the last line is not still waiting
 * when the eye has moved on.
 */
export function RevealLines({ lines, className = "" }: { lines: string[]; className?: string }) {
  const reduced = useReducedMotion();

  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={line} className="block overflow-hidden">
          {reduced ? (
            <span className="block">{line}</span>
          ) : (
            <motion.span
              className="block"
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: DUR.staged, ease: EASE_OUT, delay: i * STAGGER }}
            >
              {line}
            </motion.span>
          )}
        </span>
      ))}
    </span>
  );
}
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `pnpm test components/reveal.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add components/reveal.tsx components/reveal.test.tsx
git commit -m "feat: staged reveal primitive with a real reduced-motion path"
```

---

### Task 11: The boot screen

**Files:**
- Create: `components/boot-screen.tsx`, `components/boot-screen.test.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `DUR`, `EASE_OUT`, `useReducedMotion`, `useMounted`.
- Produces: `<BootScreen />`, `BOOT_KEY = "ko:booted"` (exported so the component and its test cannot drift onto two spellings).

- [ ] **Step 1: Write the failing test**

`components/boot-screen.test.tsx`:
```tsx
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BootScreen, BOOT_KEY } from "./boot-screen";

vi.mock("@/lib/use-mounted", () => ({ useMounted: () => true }));

describe("BootScreen", () => {
  beforeEach(() => sessionStorage.clear());

  it("uses one session key, spelled the same everywhere", () => {
    expect(BOOT_KEY).toBe("ko:booted");
  });

  it("plays on a fresh session", () => {
    render(<BootScreen />);
    expect(screen.getByTestId("boot")).toBeInTheDocument();
  });

  it("does not play again once the session has seen it", () => {
    sessionStorage.setItem(BOOT_KEY, "1");
    render(<BootScreen />);
    expect(screen.queryByTestId("boot")).toBeNull();
  });

  it("is hidden from assistive tech — it carries no information", () => {
    render(<BootScreen />);
    expect(screen.getByTestId("boot")).toHaveAttribute("aria-hidden", "true");
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm test components/boot-screen.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `components/boot-screen.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from "motion/react";
import { DUR, EASE_OUT, HOLD, useReducedMotion } from "@/lib/motion";
import { useMounted } from "@/lib/use-mounted";
import { site } from "@/data/site";

/** One spelling, exported so the test and the component cannot drift. */
export const BOOT_KEY = "ko:booted";

/**
 * The entrance, once per session.
 *
 * Once per *session* rather than once per load: replaying a 1.2s screen on
 * every internal navigation would turn the site's best moment into its most
 * annoying one. sessionStorage rather than localStorage so a visitor returning
 * tomorrow sees it again.
 *
 * It carries no information — the name behind it is already in the DOM — so it
 * is aria-hidden and never traps focus.
 */
export function BootScreen() {
  const mounted = useMounted();
  const reduced = useReducedMotion();
  const [done, setDone] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(BOOT_KEY) === "1";
  });

  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => String(Math.round(v)).padStart(2, "0"));

  useEffect(() => {
    if (done || reduced) {
      sessionStorage.setItem(BOOT_KEY, "1");
      setDone(true);
      return;
    }
    const controls = animate(count, 100, { duration: DUR.entrance, ease: EASE_OUT });
    const timer = setTimeout(() => {
      sessionStorage.setItem(BOOT_KEY, "1");
      setDone(true);
    }, (DUR.entrance + HOLD) * 1000);
    return () => {
      controls.stop();
      clearTimeout(timer);
    };
  }, [count, done, reduced]);

  /* Only the `mounted` gate may return null. `AnimatePresence` has to OUTLIVE
     the thing it animates away: it works by holding a removed child in the
     tree long enough for `exit` to play, so if the component returns null on
     `done` the whole wrapper unmounts in the same commit as its child and no
     exit frame ever runs — the screen pops instead of wiping. The child is
     conditional INSIDE the wrapper for exactly that reason. Nothing in jsdom
     can catch this; it is only visible in a browser. */
  if (!mounted) return null;

  return (
    <AnimatePresence>
      {!done && (
      <motion.div
        data-testid="boot"
        aria-hidden="true"
        className="bg-bg fixed inset-0 z-50 flex items-end justify-between px-6 py-5"
        exit={{ y: "-100%" }}
        transition={{ duration: DUR.base, ease: EASE_OUT }}
      >
        <span className="text-text-1 text-[length:var(--text-xl)] font-medium tracking-[var(--tracking-tight)]">
          {site.name}
        </span>
        {/* tnum is already on at html level, so this figure does not reflow as
            it counts. */}
        <motion.span className="text-text-3 text-[length:var(--text-sm)]">{rounded}</motion.span>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Mount it in `app/layout.tsx`**

Render `<BootScreen />` as the first child inside `<body>`.

- [ ] **Step 5: Run the tests and verify they pass**

Run: `pnpm test components/boot-screen.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 6: Commit**

```bash
git add components/boot-screen.tsx components/boot-screen.test.tsx app/layout.tsx
git commit -m "feat: session-scoped boot screen"
```

---

### Task 12: Carousel arithmetic, as a pure function

**Files:**
- Create: `lib/carousel.ts`, `lib/carousel.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `snapPoints(count: number, itemWidth: number, gap: number): number[]`
  - `nearestSnap(offset: number, points: number[]): number`
  - `projectedOffset(offset: number, velocity: number, decay?: number): number`
  - `dragBounds(count: number, itemWidth: number, gap: number, viewport: number): { left: number; right: number }`

- [ ] **Step 1: Write the failing test**

`lib/carousel.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { dragBounds, nearestSnap, projectedOffset, snapPoints } from "./carousel";

describe("snapPoints", () => {
  it("puts one point per item, counting leftward from zero", () => {
    expect(snapPoints(4, 300, 20)).toEqual([-0, -320, -640, -960]);
  });

  it("returns a single resting point for a single item", () => {
    expect(snapPoints(1, 300, 20)).toEqual([-0]);
  });

  it("returns nothing to snap to when there is nothing to show", () => {
    expect(snapPoints(0, 300, 20)).toEqual([]);
  });
});

describe("nearestSnap", () => {
  const points = snapPoints(4, 300, 20);

  it("lands on the closest point", () => {
    expect(nearestSnap(-330, points)).toBe(-320);
    expect(nearestSnap(-500, points)).toBe(-640);
  });

  it("breaks an exact tie toward the earlier point, so a half-drag does not advance", () => {
    expect(nearestSnap(-160, points)).toBe(-0);
  });

  it("clamps past either end rather than running off", () => {
    expect(nearestSnap(400, points)).toBe(-0);
    expect(nearestSnap(-5000, points)).toBe(-960);
  });
});

describe("projectedOffset", () => {
  it("carries a flick onward in its own direction", () => {
    expect(projectedOffset(-100, -800)).toBeLessThan(-100);
    expect(projectedOffset(-100, 800)).toBeGreaterThan(-100);
  });

  it("stays put when the finger was not moving", () => {
    expect(projectedOffset(-320, 0)).toBe(-320);
  });

  it("scales the throw with the decay constant", () => {
    expect(projectedOffset(0, -1000, 0.2)).toBeCloseTo(-200, 5);
  });
});

describe("dragBounds", () => {
  it("allows exactly the overflow and no more", () => {
    // 4 x 300 + 3 x 20 = 1260 of content in an 800 viewport: 460 of travel.
    expect(dragBounds(4, 300, 20, 800)).toEqual({ left: -460, right: 0 });
  });

  it("refuses to drag when everything already fits", () => {
    expect(dragBounds(2, 300, 20, 900)).toEqual({ left: 0, right: 0 });
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm test lib/carousel.test.ts`
Expected: FAIL — `Cannot find module './carousel'`.

- [ ] **Step 3: Write `lib/carousel.ts`**

```ts
/**
 * The arithmetic behind the screenshot carousel, with no DOM in it.
 *
 * All of it is separated from the component on purpose. Snap selection and
 * inertia projection are exactly the parts that are wrong in subtle ways — a
 * tie that advances a frame it should not, a throw that overshoots the last
 * item — and those are unreadable in a browser and obvious in a test.
 *
 * Offsets are negative-leftward, matching a translateX on the track.
 */

/** One resting offset per item. */
export function snapPoints(count: number, itemWidth: number, gap: number): number[] {
  return Array.from({ length: count }, (_, i) => -(i * (itemWidth + gap)));
}

/**
 * The point an offset should settle on.
 *
 * A strict `<` on the comparison is what breaks an exact tie toward the
 * earlier point: a drag stopped precisely halfway has not committed to the
 * next item, so it returns to the one it came from.
 */
export function nearestSnap(offset: number, points: number[]): number {
  if (points.length === 0) return 0;
  return points.reduce((best, p) =>
    Math.abs(p - offset) < Math.abs(best - offset) ? p : best,
  );
}

/**
 * Where a flick would come to rest if nothing stopped it.
 *
 * A one-term exponential projection: the throw is proportional to the release
 * velocity. `decay` is in seconds and 0.2 matches the feel of the platform
 * scrollers this sits beside.
 */
export function projectedOffset(offset: number, velocity: number, decay = 0.2): number {
  return offset + velocity * decay;
}

/** How far the track may travel: exactly its overflow, and zero if it fits. */
export function dragBounds(count: number, itemWidth: number, gap: number, viewport: number) {
  const content = count * itemWidth + Math.max(0, count - 1) * gap;
  return { left: Math.min(0, viewport - content), right: 0 };
}
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `pnpm test lib/carousel.test.ts`
Expected: PASS, 11 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/carousel.ts lib/carousel.test.ts
git commit -m "feat: pure snap and inertia arithmetic for the shot carousel"
```

---

### Task 13: The shot carousel and App Store meta row

**Files:**
- Create: `components/shot-carousel.tsx`, `components/app-store-meta.tsx`, `components/app-store-meta.test.tsx`

**Interfaces:**
- Consumes: `AppCard` (Task 7), `lib/carousel.ts` (Task 12), motion tokens (Task 4).
- Produces: `<ShotCarousel card={AppCard} />`, `<AppStoreMeta card={AppCard} />`.

- [ ] **Step 1: Write the failing meta test**

`components/app-store-meta.test.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppStoreMeta } from "./app-store-meta";
import { recordedCards } from "@/lib/app-store";

const card = recordedCards()["endgame-ai"];

describe("AppStoreMeta", () => {
  it("rounds the rating to one place, because two is false precision on 30 votes", () => {
    render(<AppStoreMeta card={card} />);
    expect(screen.getByText("4.7")).toBeInTheDocument();
  });

  it("says how many ratings the average is over", () => {
    render(<AppStoreMeta card={card} />);
    expect(screen.getByText(/30 ratings/)).toBeInTheDocument();
  });

  it("links out to the listing", () => {
    render(<AppStoreMeta card={card} />);
    expect(screen.getByRole("link", { name: /App Store/i })).toHaveAttribute("href", card.storeUrl);
  });

  it("rides its provenance on the element so the degraded path can be verified", () => {
    const { container } = render(<AppStoreMeta card={card} />);
    expect(container.firstChild).toHaveAttribute("data-source", "recorded");
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm test components/app-store-meta.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `components/app-store-meta.tsx`**

```tsx
import type { AppCard } from "@/lib/app-store";
import { Chip } from "./ui";

/**
 * Rating, seller, genre, and the one control.
 *
 * `data-source` is not printed. It rides on the root so the recorded fallback
 * can be *verified* rather than reasoned about: point the lookup at a host that
 * will not answer, load the page, read the attribute.
 */
export function AppStoreMeta({ card }: { card: AppCard }) {
  return (
    <div data-source={card.source} className="flex flex-wrap items-center gap-3">
      {/* One decimal. The live figure arrives as 4.73332, and printing that
          would claim a precision thirty votes cannot support. */}
      <span className="text-text-1 text-[length:var(--text-sm)] font-medium">
        {card.rating.toFixed(1)}
      </span>
      <span className="text-text-3 text-[length:var(--text-xs)]">
        {card.ratingCount} ratings
      </span>
      <Chip>{card.genre}</Chip>
      <span className="text-text-3 text-[length:var(--text-xs)]">{card.seller}</span>
      <a
        href={card.storeUrl}
        target="_blank"
        rel="noreferrer"
        className="text-text-1 text-[length:var(--text-xs)] underline underline-offset-4"
      >
        View on the App Store
      </a>
    </div>
  );
}
```

- [ ] **Step 4: Write `components/shot-carousel.tsx`**

```tsx
"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, animate } from "motion/react";
import type { AppCard } from "@/lib/app-store";
import { DUR, EASE_OUT, useReducedMotion } from "@/lib/motion";
import { dragBounds, nearestSnap, projectedOffset, snapPoints } from "@/lib/carousel";

const ITEM = 240;
const GAP = 16;

/**
 * The App Store screens, dragged.
 *
 * Every number this makes a decision with comes from lib/carousel.ts, which is
 * tested without a DOM. What is left here is only the wiring: measure the
 * viewport, hand the release velocity to the projection, animate to whatever
 * comes back.
 *
 * Under reduced motion this becomes a plain overflow-x list — still fully
 * usable with a trackpad or a scrollbar, with no drag and no inertia.
 */
export function ShotCarousel({ card }: { card: AppCard }) {
  const viewport = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);

  /* The viewport width is measured, not assumed, and re-measured when it
     changes — the drag bound is a function of it, and a bound computed once at
     mount is wrong the moment the window is resized or the phone is turned.
     A ResizeObserver rather than a window resize listener because this element
     also changes width when the case page's grid reflows at the lg breakpoint,
     which no window event reports. */
  useEffect(() => {
    const node = viewport.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const points = snapPoints(card.shots.length, ITEM, GAP);
  const bounds = dragBounds(card.shots.length, ITEM, GAP, width);

  const shots = card.shots.map((src, i) => (
    <div
      key={src}
      className="bg-surface border-border relative shrink-0 overflow-hidden rounded-xl border"
      style={{ width: ITEM, aspectRatio: card.shotRatio }}
    >
      <Image
        src={src}
        alt={`${card.name}, screen ${i + 1}`}
        fill
        sizes="240px"
        className="object-cover"
        /* The first screen of the first card is the largest thing above the
           fold on a case page. */
        priority={i === 0}
      />
    </div>
  ));

  if (reduced) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2" style={{ gap: GAP }}>
        {shots}
      </div>
    );
  }

  return (
    <div ref={viewport} className="overflow-hidden">
      <motion.div
        drag="x"
        style={{ x, gap: GAP }}
        className="flex cursor-grab active:cursor-grabbing"
        dragConstraints={bounds}
        dragElastic={0.08}
        onDragEnd={(_, info) => {
          const target = nearestSnap(projectedOffset(x.get(), info.velocity.x), points);
          animate(x, Math.max(bounds.left, Math.min(bounds.right, target)), {
            duration: DUR.base,
            ease: EASE_OUT,
          });
        }}
      >
        {shots}
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 5: Run the tests and verify they pass**

Run: `pnpm test && pnpm build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/shot-carousel.tsx components/app-store-meta.tsx components/app-store-meta.test.tsx
git commit -m "feat: draggable App Store shot carousel and live meta row"
```

---

### Task 14: The home page

**Files:**
- Create: `components/work-card.tsx`
- Modify: `app/page.tsx`
- Test: `components/work-card.test.tsx`

**Interfaces:**
- Consumes: `work` (Task 6), `readAppStore` (Task 7), `Reveal`/`RevealLines` (Task 10), `ShotCarousel`/`AppStoreMeta` (Task 13).
- Produces: `<WorkCard item={WorkItem} card={AppCard} />`.

- [ ] **Step 1: Write the failing test**

`components/work-card.test.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorkCard } from "./work-card";
import { findWork } from "@/data/work";
import { recordedCards } from "@/lib/app-store";

const item = findWork("chessever")!;
const card = recordedCards()["chessever"];

describe("WorkCard", () => {
  it("titles the piece with the site's name for it, not Apple's listing name", () => {
    // data/work.ts calls it "ChessEver"; the listing files it as
    // "ChessEver: Follow Live Chess". Both are right; the site uses its own.
    render(<WorkCard item={item} card={card} />);
    expect(screen.getByRole("heading", { name: "ChessEver" })).toBeInTheDocument();
  });

  it("links the whole piece to its case page", () => {
    render(<WorkCard item={item} card={card} />);
    expect(screen.getByRole("link", { name: /ChessEver/ })).toHaveAttribute("href", "/work/chessever");
  });

  it("prints the year and the role", () => {
    render(<WorkCard item={item} card={card} />);
    expect(screen.getByText("2025")).toBeInTheDocument();
    expect(screen.getByText(item.role)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm test components/work-card.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `components/work-card.tsx`**

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import type { AppCard } from "@/lib/app-store";
import type { WorkItem } from "@/data/work";
import { DUR, EASE_OUT, useReducedMotion } from "@/lib/motion";
import { Label } from "./ui";

/**
 * A selected piece on the home.
 *
 * The icon and the title carry `layoutId`s that the case page reuses, so
 * navigation moves these two elements into the case header rather than
 * cross-fading two pages that happen to contain similar things.
 */
export function WorkCard({ item, card }: { item: WorkItem; card: AppCard }) {
  /* Withholding the layoutId is how this honours reduced motion. A `layoutId`
     IS the animation — motion measures the element here and again on the case
     page and interpolates between them — so there is no duration to shorten
     and nothing for the globals.css block to reach. Handing it `undefined`
     means the case page simply renders its header, which is the final frame.
     The case page must withhold its matching id on the same condition, or one
     half of the pair animates alone. */
  const reduced = useReducedMotion();
  const layout = (name: string) => (reduced ? undefined : `${name}-${item.slug}`);

  return (
    <Link href={`/work/${item.slug}`} className="group block">
      <article className="border-border bg-surface rounded-2xl border p-6 transition-colors duration-[var(--dur-micro)] hover:border-text-4">
        <header className="flex items-center gap-4">
          <motion.div layoutId={layout("icon")} transition={{ duration: DUR.base, ease: EASE_OUT }}>
            <Image
              src={card.icon}
              alt=""
              width={56}
              height={56}
              className="border-border rounded-xl border"
            />
          </motion.div>
          <div>
            <motion.h2
              layoutId={layout("title")}
              transition={{ duration: DUR.base, ease: EASE_OUT }}
              className="text-text-1 text-[length:var(--text-lg)] font-medium tracking-[var(--tracking-tight)]"
            >
              {item.title}
            </motion.h2>
            <div className="mt-1 flex gap-3">
              <Label>{item.year}</Label>
              <Label>{item.role}</Label>
            </div>
          </div>
        </header>

        <p className="text-text-2 mt-4 text-[length:var(--text-base)]">{item.summary}</p>

        {/* The screens fan on hover: each leans a little more than the last,
            which reads as a stack being spread rather than four things
            twitching in place.

            Done in CSS off the group's hover rather than with four motion
            components. Four independent springs reacting to the same pointer
            event can desynchronise by a frame or two, which is exactly the
            wobble this effect must not have; one transition on one custom
            property cannot. It also costs no JS on a card that is already
            rendering eight images. */}
        <div className="fan mt-6 flex gap-3">
          {card.shots.slice(0, 4).map((src, i) => (
            <div
              key={src}
              className="border-border relative w-1/4 overflow-hidden rounded-lg border"
              style={{ aspectRatio: card.shotRatio, "--i": i } as React.CSSProperties}
            >
              <Image src={src} alt="" fill sizes="120px" className="object-cover" />
            </div>
          ))}
        </div>
      </article>
    </Link>
  );
}
```

Add the fan's CSS to `app/globals.css`. It must sit inside `@layer utilities`:
anything meant to be overridable by a Tailwind utility has to be in that layer,
or unlayered author styles beat it regardless of specificity.

```css
@layer utilities {
  /* The stack spreads from the bottom edge, so the tops splay and the bases
     stay put — a hand of cards, not four rectangles rotating about their
     middles. `--i` is set per child in work-card.tsx; the -2.25deg centres the
     fan so the group leans evenly rather than drifting right. */
  .fan > * {
    transform-origin: bottom center;
    transition: transform var(--dur-base) var(--ease-out);
  }

  .group:hover .fan > * {
    transform: rotate(calc(var(--i) * 1.5deg - 2.25deg))
               translateY(calc(var(--i) * -2px));
  }

  /* The hover fan is decoration on a card whose content is already complete,
     so under reduced motion it does not happen at all. */
  @media (prefers-reduced-motion: reduce) {
    .group:hover .fan > * { transform: none; }
  }
}
```

- [ ] **Step 4: Write `app/page.tsx`**

```tsx
import { readAppStore } from "@/lib/app-store";
import { work } from "@/data/work";
import { site } from "@/data/site";
import { WorkCard } from "@/components/work-card";
import { Reveal, RevealLines } from "@/components/reveal";
import { Label } from "@/components/ui";

export default async function Home() {
  /* Cached for six hours by readAppStore, so this stays a static prerender
     between reads rather than putting an Apple request on every visit. */
  const cards = await readAppStore();

  return (
    <main className="mx-auto w-full max-w-[1240px] px-6 pb-32">
      <section className="py-24 sm:py-32">
        <h1 className="text-text-1 text-[length:var(--text-xl)] font-medium tracking-[var(--tracking-tight)]">
          <RevealLines
            lines={["Kenny Olajide is a product", "designer working on chess", "software for people who play it."]}
          />
        </h1>
      </section>

      <section>
        <Label>Selected work</Label>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {work.map((item, i) => (
            <Reveal key={item.slug} delay={i * 0.08}>
              <WorkCard item={item} card={cards[item.slug]} />
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
```

> The hero lines are copy the owner has not approved. Flag them at review.

- [ ] **Step 5: Run the tests and the build**

Run: `pnpm test && pnpm build`
Expected: PASS. Confirm the home prerendered (the build output marks it `○` static or `ƒ` — it should be static).

- [ ] **Step 6: Commit**

```bash
git add components/work-card.tsx components/work-card.test.tsx app/page.tsx app/globals.css
git commit -m "feat: home with selected work and shared-element work cards"
```

---

### Task 15: Case pages, with a real 404

**Files:**
- Create: `app/work/[slug]/page.tsx`, `app/work/page.tsx`, `app/loading.tsx`, `app/not-found.tsx`
- Test: `app/work/work-route.test.ts`

**Interfaces:**
- Consumes: `findWork`, `work`, `readAppStore`, `ShotCarousel`, `AppStoreMeta`.
- Produces: the two case routes.

- [ ] **Step 1: Write the failing routing test**

`app/work/work-route.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { generateStaticParams } from "./[slug]/page";

describe("the case route", () => {
  it("declares every slug it will serve", async () => {
    expect((await generateStaticParams()).map((p) => p.slug).sort())
      .toEqual(["chessever", "endgame-ai"]);
  });

  it("sets dynamicParams=false so an unknown slug is a real 404", () => {
    /* The case page sits behind app/loading.tsx, so Next serves a prerendered
       shell and commits HTTP 200 before the body streams — a notFound()
       reached during render can never set the status, and the page soft-404s.
       Moving the decision to the router is the fix. portfolio-v2 shipped this
       bug and fixed it exactly here; do not remove this line. */
    const src = readFileSync("app/work/[slug]/page.tsx", "utf8");
    expect(src).toMatch(/export const dynamicParams = false/);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm test app/work/work-route.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `app/work/[slug]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import { motion } from "motion/react";
import { findWork, work } from "@/data/work";
import { readAppStore } from "@/lib/app-store";
import { ShotCarousel } from "@/components/shot-carousel";
import { AppStoreMeta } from "@/components/app-store-meta";
import { Label, RecordRow, Rule } from "@/components/ui";
import { Reveal } from "@/components/reveal";

/* See app/work/work-route.test.ts. This is load-bearing, not tidiness. */
export const dynamicParams = false;

export async function generateStaticParams() {
  return work.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = findWork(slug);
  return item ? { title: `${item.title} — Kenny Olajide`, description: item.summary } : {};
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = findWork(slug);
  if (!item) notFound();

  const card = (await readAppStore())[slug];

  return (
    <main className="mx-auto w-full max-w-[1240px] px-6 pb-32">
      <header className="flex items-center gap-5 py-16">
        <Image src={card.icon} alt="" width={72} height={72} className="border-border rounded-2xl border" />
        <div>
          <h1 className="text-text-1 text-[length:var(--text-xl)] font-medium tracking-[var(--tracking-tight)]">
            {item.title}
          </h1>
          <p className="text-text-2 mt-2 text-[length:var(--text-base)]">{item.summary}</p>
        </div>
      </header>

      <Reveal>
        <ShotCarousel card={card} />
      </Reveal>

      <div className="mt-16 grid gap-12 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          {item.body.map((p) => (
            <p key={p} className="text-text-2 text-[length:var(--text-base)]">{p}</p>
          ))}
        </div>

        <aside>
          <Label>Record</Label>
          <dl className="mt-4">
            <RecordRow label="Year" value={item.year} />
            <RecordRow label="Role" value={item.role} />
            <RecordRow label="Platform" value={card.genre} />
            {item.collaborators?.map((c) => (
              <RecordRow key={c.name} label={c.role} value={c.name} href={c.href} />
            ))}
          </dl>
          <div className="mt-8">
            <AppStoreMeta card={card} />
          </div>
        </aside>
      </div>
    </main>
  );
}
```

This is a server component: it awaits `params` and `readAppStore()`, and every
animated piece it renders (`ShotCarousel`, `Reveal`) carries its own
`"use client"`. Do not add `"use client"` here — it would drag the Apple fetch
into the browser and lose the six-hour cache.

- [ ] **Step 4: Write the index, loading and 404 pages**

`app/work/page.tsx` lists both pieces with `<WorkCard>`.

`app/loading.tsx`:
```tsx
/* Deliberately quiet. The boot screen is the site's entrance; a second
   animated screen on every route change would compete with it. */
export default function Loading() {
  return <div className="min-h-[60svh]" aria-busy="true" />;
}
```

`app/not-found.tsx` renders a real 404 with a link home.

- [ ] **Step 5: Run the tests and the build**

Run: `pnpm test && pnpm build`
Expected: PASS. In the build output both case routes appear as `●` (SSG).

- [ ] **Step 6: Verify the 404 really is a 404**

Run: `pnpm build && pnpm start &` then `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/work/nope`
Expected: `404`, not `200`.

- [ ] **Step 7: Commit**

```bash
git add app/work app/loading.tsx app/not-found.tsx
git commit -m "feat: case pages with dynamicParams=false for a real 404"
```

---

### Task 16: Writing and About

**Files:**
- Create: `app/writing/page.tsx`, `app/writing/[slug]/page.tsx`, `app/about/page.tsx`
- Test: `app/writing/writing-route.test.ts`

**Interfaces:**
- Consumes: `posts`, `findPost` (Task 6), `roles` (Task 6), `RecordRow` (Task 8).

- [ ] **Step 1: Write the failing test**

`app/writing/writing-route.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { generateStaticParams } from "./[slug]/page";

describe("the writing route", () => {
  it("declares every post slug", async () => {
    expect((await generateStaticParams()).map((p) => p.slug).sort())
      .toEqual(["designing-for-live", "on-constraint"]);
  });

  it("carries the same dynamicParams fix as the case route", () => {
    // Same trap: it sits behind app/loading.tsx.
    expect(readFileSync("app/writing/[slug]/page.tsx", "utf8"))
      .toMatch(/export const dynamicParams = false/);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm test app/writing/writing-route.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the three pages**

`app/writing/[slug]/page.tsx` mirrors the case page's shape: `export const
dynamicParams = false`, `generateStaticParams` from `posts`, `generateMetadata`
from the post, `notFound()` when `findPost` returns undefined, body paragraphs
set at `--text-base` in `--text-2`.

`app/writing/page.tsx` lists posts newest first with title, date and excerpt.

`app/about/page.tsx` renders the bio and the role ladder:
```tsx
import { IS_PLACEHOLDER, roles } from "@/data/experience";
import { elsewhere, site } from "@/data/site";
import { Label, RecordRow } from "@/components/ui";

export const metadata = { title: "About — Kenny Olajide" };

export default function About() {
  return (
    <main className="mx-auto w-full max-w-[1240px] px-6 pb-32 pt-16">
      <h1 className="text-text-1 text-[length:var(--text-xl)] font-medium tracking-[var(--tracking-tight)]">
        {site.name}
      </h1>

      <section className="mt-16 grid gap-12 lg:grid-cols-2">
        <div>
          <Label>Experience</Label>
          {/* Visible in the page, not only in the source, so nobody reviews
              this surface believing the ladder is real. */}
          {IS_PLACEHOLDER && (
            <p className="text-text-3 mt-3 text-[length:var(--text-xs)]">
              Placeholder records — real history to be supplied.
            </p>
          )}
          <dl className="mt-4">
            {roles.map((r) => (
              <RecordRow key={`${r.company}-${r.from}`} label={`${r.from}–${r.to}`} value={`${r.role}, ${r.company}`} />
            ))}
          </dl>
        </div>

        <div>
          <Label>Elsewhere</Label>
          <dl className="mt-4">
            {elsewhere.map((e) => (
              <RecordRow key={e.label} label={e.label} value={e.handle} href={e.href} />
            ))}
          </dl>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Run the tests and the build**

Run: `pnpm test && pnpm build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/writing app/about
git commit -m "feat: writing and about surfaces"
```

---

### Task 17: Metadata, OG images and icons

**Files:**
- Create: `app/opengraph-image.tsx`, `app/work/[slug]/opengraph-image.tsx`, `app/icon.tsx`, `app/apple-icon.tsx`, `app/manifest.ts`, `app/robots.ts`, `app/sitemap.ts`
- Modify: `app/layout.tsx`
- Test: `app/metadata.test.ts`

**Interfaces:**
- Consumes: `site`, `work`, `posts`.

- [ ] **Step 1: Write the failing test**

`app/metadata.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";
import robots from "./robots";
import manifest from "./manifest";

describe("metadata", () => {
  it("lists every real route in the sitemap", () => {
    const urls = sitemap().map((e) => new URL(e.url).pathname).sort();
    expect(urls).toEqual([
      "/", "/about", "/work", "/work/chessever", "/work/endgame-ai",
      "/writing", "/writing/designing-for-live", "/writing/on-constraint",
    ]);
  });

  it("keeps the artwork proxy out of the crawl — it is plumbing", () => {
    expect(robots().rules).toMatchObject({ userAgent: "*", disallow: "/api/" });
  });

  it("names the app and takes its colours from the two grounds", () => {
    expect(manifest().name).toBe("Kenny Olajide");
    expect(manifest().background_color).toBe("#ffffff");
    expect(manifest().theme_color).toBe("#101010");
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm test app/metadata.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write the metadata routes**

`app/sitemap.ts` returns `/`, `/about`, `/work`, `/writing`, one entry per `work`
slug and one per `posts` slug, each absolute against `site.url`. `/work` is in
the list because Task 15 creates that index and Task 9's nav links to it — a
linked, indexable route the sitemap denied would be a contradiction the crawler
resolves against us.

`app/robots.ts`:
```ts
import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
```

`app/manifest.ts` returns `{ name: "Kenny Olajide", short_name: "Kenny", start_url: "/", display: "standalone", background_color: "#ffffff", theme_color: "#101010" }`.

- [ ] **Step 4: Write the OG images**

`app/opengraph-image.tsx`:
```tsx
import { ImageResponse } from "next/og";
import { site } from "@/data/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Kenny Olajide, product designer";

/* Drawn in the site's own tokens rather than a screenshot: an OG image is the
   one surface that is only ever seen out of context, so it has to carry the
   identity without any of the page around it.

   next/og does not run next/font, so the family here is the system stack. The
   figure that matters is the composition, not the exact face. */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "flex-end", background: "#101010", color: "#eeeeee",
          padding: 72, fontSize: 76, letterSpacing: "-0.03em",
        }}
      >
        <div>{site.name}</div>
        <div style={{ fontSize: 30, color: "#b5b5b5", letterSpacing: 0, marginTop: 12 }}>
          {site.role}
        </div>
      </div>
    ),
    size,
  );
}
```

`app/work/[slug]/opengraph-image.tsx` does the same, taking the title and
summary from `findWork(slug)`, and exports `generateImageMetadata` or relies on
the route's own params.

`app/icon.tsx` and `app/apple-icon.tsx` render a "K" on `#101010` at 32px and
180px respectively, via the same `ImageResponse`.

- [ ] **Step 5: Complete `app/layout.tsx` metadata**

```tsx
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.role}`, template: `%s — ${site.name}` },
  description: "Product designer working on chess software.",
  openGraph: { type: "website", siteName: site.name, url: site.url },
  twitter: { card: "summary_large_image" },
};
```

- [ ] **Step 6: Run the tests and the build**

Run: `pnpm test && pnpm build`
Expected: PASS. The build output lists `/opengraph-image`, `/icon`, `/apple-icon`.

- [ ] **Step 7: Commit**

```bash
git add app/opengraph-image.tsx app/icon.tsx app/apple-icon.tsx app/manifest.ts app/robots.ts app/sitemap.ts app/metadata.test.ts app/layout.tsx "app/work/[slug]/opengraph-image.tsx"
git commit -m "feat: per-route OG images, icons and crawl metadata"
```

---

### Task 18: README, repository and deploy

**Files:**
- Create: `README.md`
- Modify: none

**Interfaces:**
- Consumes: everything.

- [ ] **Step 1: Write `README.md`**

No emojis. State what the site is, the two-skin token table with its measured
contrast figures, the four ink placement rules, the motion token set and where
its primary curve came from, the ported modules and why, the placeholder
boundary in `data/experience.ts` and `data/writing.ts`, and the commands
(`pnpm dev`, `pnpm test`, `pnpm build`). Record the live URL once it exists.

- [ ] **Step 2: Run the full check**

Run: `pnpm lint && pnpm exec tsc --noEmit && pnpm test && pnpm build`
Expected: all four PASS.

- [ ] **Step 3: Create the GitHub repository and push**

```bash
gh repo create kenny-olajide-portfolio --private --source=. --remote=origin
git push -u origin main
```

- [ ] **Step 4: Deploy**

```bash
vercel link --yes
vercel deploy --prod
```

Record the resulting URL in `README.md`, commit, and push. The README is not
allowed to describe a version that is no longer live.

- [ ] **Step 5: Verify the deployed site**

Against the deployed URL, not localhost — the Bash sandbox's localhost is not
reachable from the browser tooling, and a hidden tab throttles rAF to the point
of reporting zero frames. Check in a visible tab:

1. Both skins render; the toggle reveals circularly.
2. The boot screen plays once, then not again on internal navigation.
3. Both case pages load and the shot carousel drags and snaps.
4. `/work/nope` returns 404, not a styled 200.
5. `curl -s <url> | grep -o 'data-source="[a-z]*"'` reports `live`.
6. With "Reduce motion" on in System Settings, nothing animates and everything is present.

- [ ] **Step 6: Commit and push the README's URL**

```bash
git add README.md
git commit -m "docs: record the live deployment URL"
git push
```

---

## Self-Review

**Spec coverage.** Section 2 approach → Tasks 2, 4, 7 (the ports). Section 4
colour → Task 2. Section 5 typography → Task 3. Section 6 motion → Tasks 4, 10,
11, 13, 14. Section 7 routes → Tasks 15, 16, 17. Section 8 data honesty →
Task 6. Section 9 testing → every task. Section 10 deployment → Task 18.
Section 11 out-of-scope → nothing in the plan builds any of it.

**Known gaps, stated rather than hidden:**
- The spec's "sticky section labels" and "frames scaling 0.96→1" for case pages
  are covered only by the generic `<Reveal>` in Task 15. If the owner wants the
  sticky label specifically, it is a follow-up task.
- The spec's magnetic hover is not implemented. It was listed under constraints
  rather than signature moments, and the `.fan` hover in Task 14 plus the pill
  in Task 9 already carry the hover character. Add it only if asked.
- `site.url` and `site.email` in Task 6 are assumptions flagged for review.
- The hero copy in Task 14 is unapproved.

**Type consistency.** `AppCard`, `LookupRow`, `WorkItem`, `Role`, `Post`,
`BOOT_KEY`, `DUR`, `EASE_OUT`, `EASE_INOUT` are each defined in exactly one task
and referenced by the same name everywhere after. `snapPoints`/`nearestSnap`/
`projectedOffset`/`dragBounds` are defined in Task 12 and consumed in Task 13
with matching signatures. `IS_PLACEHOLDER` is exported from both placeholder
files and imported under aliases in the Task 6 test.
