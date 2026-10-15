import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import { StrayCap } from "@/components/stray-cap";
import { EasterEgg } from "@/components/easter-egg";
import { SoundBind } from "@/components/sound";
import { CoinFavicon } from "@/components/coin-favicon";
import { site } from "@/data/site";
import "./globals.css";

/**
 * The site is set in BDO Grotesk throughout — the owner's own files, served
 * locally from `public/fonts` so nothing is fetched at runtime. Regular (400)
 * carries body and display, Medium (500) the headlines, Suisse Mono the
 * instrument numerals. The CSS variable names are unchanged, so nothing
 * downstream knows or cares which files back them.
 */
const sans = localFont({
  src: [
    { path: "../public/fonts/BDOGrotesk-Regular.otf", weight: "400" },
    { path: "../public/fonts/BDOGrotesk-Medium.otf", weight: "500" },
  ],
  variable: "--font-bdo",
  display: "swap",
});

const mono = localFont({
  src: "../public/fonts/SuisseIntl-Mono.ttf",
  variable: "--font-suisse-mono",
  display: "swap",
});

/* site.url (data/site.ts) is the production origin, and it is read from
   there rather than hardcoded here so one edit moves every absolute URL
   the site emits when a custom domain arrives. It must be a host that
   answers: an og:image resolved against a domain with no DNS is a share
   card no scraper can fetch, which is what shipped until 2026-09-17.
   Preview deployments must not feed metadataBase: VERCEL_URL names a
   per-deployment host that dies when the build is cleaned up, so every
   share would carry a link with an expiry date (B2). Cards always resolve
   against the production host, wherever they are served. */
const base = site.url;
export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: { default: `${site.name} — ${site.role}`, template: `%s — ${site.name}` },
  description: "Product designer working on chess software.",
  openGraph: {
    type: "website",
    siteName: site.name,
    url: base,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: [
    /* --bg on each skin, or the browser chrome sits a shade off the page it
       is framing. Held to app/globals.css by hand: a retune that moves --bg
       moves these two. */
    { media: "(prefers-color-scheme: light)", color: "#fcfcfc" },
    { media: "(prefers-color-scheme: dark)", color: "#090909" },
  ],
};

/* Structured identity for search engines and LLM crawlers: who this
 is, what they do, and where the proof lives. Plain JSON-LD, no deps. */
const personSchema = {
 "@context": "https://schema.org",
 "@type": "Person",
 name: site.name,
 url: site.url,
 jobTitle: "Software Designer",
 address: { "@type": "PostalAddress", addressLocality: "Lagos", addressCountry: "NG" },
 email: `mailto:${site.email}`,
 sameAs: [
 "https://x.com/damilareoo",
 "https://github.com/damilareoo",
 "https://layers.to/damilareoo",
 site.linkedin,
 "https://www.are.na/damilare-osofisan",
 ],
 knowsAbout: [
 "Product Design",
 "Software Design",
 "UX Design",
 "Interaction Design",
 "Design Systems",
 "Brand Design",
 "Design Engineering",
 ],
 worksFor: [
 { "@type": "Organization", name: "Endgame.ai", jobTitle: "Product Designer" },
 { "@type": "Organization", name: "ChessEver", jobTitle: "Founding Designer" },
 { "@type": "Organization", name: "HEX", jobTitle: "Design Partner" },
 ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        {/* Light is the default on every visit, whatever the OS says —
            dark is a deliberate switch, never an assumption. */}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          {/* Inside ThemeProvider so the board is drawn in whichever theme is
              on. Last in the tree because it is the last thing that should
              ever take focus, and it takes none until someone types e4. */}
          <EasterEgg />
          <StrayCap />
          <SoundBind />
          <CoinFavicon />
        </ThemeProvider>
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </body>
    </html>
  );
}
