/**
 * Dossier content for damilareoo.xyz — a criminal-record portfolio file.
 *
 * Identity, roles, likes, and projects supplied by the owner. Case prose is
 * condensed from https://damilareoo.xyz (scraped 2026-09-24). No employers,
 * dates, or metrics beyond what those sources state. Logos and featured
 * visuals are each project's own published artwork, stored in
 * `public/dossier/`.
 */

export const dossier = {
  cases: [
    {
      exhibit: "EXHIBIT A",
      slug: "hitmans-library",
      year: "2026",
      name: "HITMAN'S LIBRARY",
      logo: "/dossier/hitman-logo.png",
      status: "IN PROGRESS",
      role: "DESIGN + BUILD",
      link: { label: "hitmanslibrary.xyz", href: "https://hitmanslibrary.xyz/" },
      visual: "/dossier/work/hitman/hitman-og.png",
      visualAlt: "Hitman's Library — collection of web experiences",
      video: "/dossier/work/hitman/hitmans-library-showcase.mp4",
      oneLiner:
        "A collection of cool experiences across the web. Currently building — the case file stays open until it ships.",
      rows: [
        {
          k: "BRIEF",
          v: "Collect the web's best experiences in one place. Filed as in-progress: full case notes land here on launch.",
        },
      ],
    },
    {
      exhibit: "EXHIBIT B",
      slug: "sylvan",
      year: "2025",
      name: "SYLVAN",
      logo: "/dossier/sylvan-logo.png",
      status: "SHIPPED",
      role: "BRAND DESIGN, LOGO DESIGN, WEB DESIGN, VISUAL SYSTEM",
      link: { label: "sylvanlabs.com", href: "https://sylvanlabs.com" },
      visual: "/dossier/sylvan-featured.gif",
      visualAlt: "Sylvan — revenue intelligence platform",
      oneLiner:
        "Helps teams understand what actually drives revenue by making customer data simple to read. Most analytics tools bury you in reports and slow dashboards — Sylvan cuts through that.",
      rows: [
        {
          k: "CHALLENGE",
          v: "Revenue teams need to spot the small changes in customer behavior that matter. Most platforms make this harder, not easier — the identity had to feel like the opposite of a cluttered analytics tool.",
        },
        {
          k: "BUILT",
          v: "The signal mark — a visual system showing how customer actions create patterns over time. It shifts and adapts, like real opportunities appearing in customer journeys, and became the core of the identity.",
        },
        {
          k: "APPROACH",
          v: "Simple but meaningful. Clarity without feeling cold or technical — every piece of the system reinforces one idea: Sylvan turns noise into signal.",
        },
      ],
    },
    {
      exhibit: "EXHIBIT C",
      slug: "chessever",
      year: "2025",
      name: "CHESSEVER",
      logo: "/dossier/work/chessever/chessever-icon.jpg",
      status: "SHIPPED",
      role: "FOUNDING DESIGNER",
      link: { label: "chessever.com", href: "https://chessever.com" },
      links: [
        { label: "iOS", href: "https://apps.apple.com/us/app/chessever/id6752567269" },
        { label: "ANDROID", href: "https://play.google.com/store/apps/details?id=com.chessEver.app" },
      ],
      visual: "/dossier/chessever-featured.jpg",
      visualAlt: "ChessEver — live chess tournaments app",
      oneLiner:
        "Following professional chess in real time — on the phone, the desktop, and the web. With FollowChess gone, there was no simple way to track live games, standings, and player stats in one place — ChessEver brings that back.",
      rows: [
        {
          k: "BUILT",
          v: "The entire product from zero. Clean interface, real-time game tracking, engine evaluation, complete player stats and head-to-head records. No learning curve.",
        },
        {
          k: "PROOF",
          v: "4.9 stars on iOS and Android — 120 reviews on Apple, 165 on Google Play. 200+ sign-ups daily since launch. Top 10 finalist, TWIST Gamma pitch competition.",
        },
      ],
    },
  ],
  service: [
    {
      org: "ENDGAME.AI",
      role: "Product Designer — most recent, just left.",
      logo: "/dossier/endgame-logo.png",
    },
    {
      org: "CHESSEVER",
      role: "Founding Designer.",
      logo: "/dossier/work/chessever/chessever-icon.jpg",
    },
    {
      org: "HEX",
      role: "Design Partner — web, brand, and product design.",
      logo: "/dossier/hex-logo.svg",
      tone: "dark",
    },
  ],
  explorations: [
    {
      name: "WORKBENCH",
      tag: "TOOL",
      text: "An infinite canvas for organizing and sharing mockup images — live below, fully interactive.",
      href: "https://nacre-quake-50137672.figma.site",
      embed: "https://nacre-quake-50137672.figma.site",
    },
    {
      name: "PIXEL SOCCER",
      tag: "GAME",
      text: "Classic pixelated soccer — playable right here, right now.",
      href: "https://pixel-soccer.vercel.app",
      embed: "https://pixel-soccer.vercel.app",
    },
  ],
  aboutPhotos: [
    { src: "/dossier/about/about-1.jpg", alt: "Mirror fit check", caption: "fit check." },
    { src: "/dossier/about/about-2.jpg", alt: "Night out in Lagos", caption: "night out — lagos." },
    { src: "/dossier/about/about-3.jpg", alt: "Mirror selfie at the decks", caption: "at the decks." },
    { src: "/dossier/about/about-4.jpg", alt: "DJ controllers close-up", caption: "controllers close-up." },
    { src: "/dossier/about/about-5.jpg", alt: "Basketball pickup run", caption: "pickup run — basketball." },
  ] as { src: string; alt: string; caption: string }[],
  watchfaces: [
    { src: "/dossier/watchfaces/watchfaces-sheet.jpg", alt: "Dot-matrix watch faces", caption: "watch faces — time, weather, portrait, stats." },
  ] as { src: string; alt: string; caption: string }[],
  shots: [    { src: "/dossier/shots/glint1.png", alt: "Glint study 1", caption: "glint — study 01." },
    { src: "/dossier/shots/glint2.png", alt: "Glint study 2", caption: "glint — study 02." },
    { src: "/dossier/shots/glint3.png", alt: "Glint study 3", caption: "glint — study 03." },
    { src: "/dossier/shots/glint4.png", alt: "Glint study 4", caption: "glint — study 04." },
    { src: "/dossier/shots/vienna.png", alt: "Vienna study 1", caption: "vienna — study 01." },
    { src: "/dossier/shots/vienna-1.png", alt: "Vienna study 2", caption: "vienna — study 02." },
    { src: "/dossier/shots/vienna-2.png", alt: "Vienna study 3", caption: "vienna — study 03." },
    { src: "/dossier/shots/mederva.png", alt: "Mederva study 1", caption: "mederva — study 01." },
    { src: "/dossier/shots/mederva2.png", alt: "Mederva study 2", caption: "mederva — study 02." },
    { src: "/dossier/shots/SMALLGPT.png", alt: "SmallGPT study", caption: "smallgpt — study." },
    { src: "/dossier/shots/superr.png", alt: "Superr study 1", caption: "superr — study 01." },
    { src: "/dossier/shots/superr-1.png", alt: "Superr study 2", caption: "superr — study 02." },
    { src: "/dossier/shots/2007.png", alt: "2007 study", caption: "2007 — study." },
    { src: "/dossier/shots/2008.png", alt: "2008 study", caption: "2008 — study." },
    { src: "/dossier/shots/3.png", alt: "Study 3", caption: "study — 03." },
    { src: "/dossier/shots/frame-2147237418.png", alt: "Chronicle Mirror trace replay", caption: "chronicle mirror — agent trace replay." },
  ] as { src: string; alt: string; caption: string }[],
  elsewhere: [
    { label: "EMAIL", mark: "@", handle: "dosofisan7@gmail.com", href: "mailto:dosofisan7@gmail.com" },
    { label: "X", mark: "X", handle: "@damilareoo", href: "https://x.com/damilareoo" },
    { label: "GITHUB", mark: "GH", handle: "damilareoo", href: "https://github.com/damilareoo" },
    { label: "LINKEDIN", mark: "IN", handle: "damilareoo", href: "https://www.linkedin.com/in/damilareoo" },
    { label: "V0", mark: "V0", handle: "@damilareoo", href: "https://v0.app/@damilareoo" },
    { label: "LAYERS", mark: "LA", handle: "damilareoo", href: "https://layers.to/damilareoo" },
    { label: "SUBSTACK", mark: "SU", handle: "@damilareoo", href: "https://substack.com/@damilareoo" },
    { label: "CONTRA", mark: "CO", handle: "damilareoo", href: "https://contra.com/damilareoo" },
  ],
  likes: "basketball, football, chess, music.",
  dislikes: "dishonesty, lies.",
  footer: "( Built with Next.js )",
};
