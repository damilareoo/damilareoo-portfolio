import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
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

/* site.url (data/site.ts) is the live deployment, and it is read from there
   rather than hardcoded here so one edit moves every absolute URL the site
   emits when a custom domain arrives. It must be a host that answers: an
   og:image resolved against a domain with no DNS is a share card no scraper
   can fetch, which is what shipped until 2026-09-17.
   On Vercel the deployment's own URL wins, so preview and production
   deploys emit cards that resolve where they are served. */
const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : site.url;
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          {/* Inside ThemeProvider so the board is drawn in whichever theme is
              on. Last in the tree because it is the last thing that should
              ever take focus, and it takes none until someone types e4. */}
          <EasterEgg />
          <StrayCap />
          <SoundBind />
          <CoinFavicon />
        </ThemeProvider>
      </body>
    </html>
  );
}
