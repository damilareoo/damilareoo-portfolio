/**
 * Full case files for each dossier exhibit — only work that is the owner's.
 *
 * Prose is expanded from https://damilareoo.xyz (scraped 2026-09-24). Gallery
 * art is the project's own published imagery (`public/dossier/…`). Years:
 * Hitman's Library 2026, ongoing; Sylvan 2025 per the owner's Framer archive.
 */

export type WorkCase = {
  slug: string;
  exhibit: string;
  name: string;
  year?: string;
  logo?: string;
  status: string;
  role: string;
  site: { label: string; href: string };
  extraLinks?: { label: string; href: string }[];
  oneLiner: string;
  quote?: string;
  credits: string;
  summary: string[];
  sections: { k: string; v: string }[];
  gallery: { src: string; alt: string; caption: string; note?: string; kind?: "video"; poster?: string; tall?: boolean; motion?: "rainbow" | "chessever" | "hitman" | "sylvan" }[];
};

export const workCases: WorkCase[] = [
  {
    slug: "hitmans-library",
    exhibit: "EXHIBIT A",
    name: "Hitman's Library",
    year: "2026",
    logo: "/dossier/hitman-logo.png",
    status: "IN PROGRESS",
    role: "Design + build",
    site: { label: "hitmanslibrary.xyz", href: "https://hitmanslibrary.xyz/" },
    oneLiner:
      "A collection of cool experiences across the web. Currently building, so the case file stays open.",
    credits:
      "Damilare Osofisan, Florence Eze",
    quote:
      "Collect the experiences worth stealing from.",
    summary: [
      "Hitman's Library collects the web's best experiences in one place — a shelf of sites worth studying, each filed with its own screenshot.",
      "The file is open because the work is open: entries land as they are collected, and the full case notes land here on launch.",
    ],
    sections: [
      {
        k: "Role & Contribution",
        v: "Solo. Product, design and code.",
      },
      {
        k: "What Was Done",
        v: "Built a visual library for collecting and studying web experiences. Each entry has its own screenshot, link and place in the library.",
      },
      {
        k: "How",
        v: "I wanted somewhere to keep the things I find interesting instead of letting them disappear into bookmarks. I designed and built the whole thing myself, from the product structure to the interface and code.",
      }
    ],
    gallery: [
      {
        src: "/dossier/work/hitman/hitmans-library-showcase.mp4",
        alt: "Hitman's Library showcase video",
        caption: "Showcase",
        note: "The library in motion — every entry photographed, paletted, and filed.",
        kind: "video",
        poster: "/dossier/work/hitman/hitman-title.jpg",
      },
      {
        src: "/dossier/work/hitman/hitman-title.jpg",
        alt: "Hitman's Library title card",
        caption: "Title card",
        note: "The identity — a shelf mark and a wordmark, nothing else.",
      },
      {
        src: "/dossier/work/hitman/hitman-origin-sheet.jpg",
        alt: "The spreadsheet the library started as",
        caption: "Origin — the spreadsheet",
        note: "Links with notes like “the image hover thing” — a collection with no way to look at any of it.",
      },
      {
        src: "/dossier/work/hitman/hitman-library-today.jpg",
        alt: "The library today",
        caption: "The library today",
        note: "248 sites filed by category and sorted new to old, each with a live preview.",
      },
      {
        src: "/dossier/work/hitman/hitman-cards.jpg",
        alt: "Library cards up close",
        caption: "Up close",
        note: "Screenshot, title, palette dots, filing tag — every card carries the whole system.",
      },
      {
        src: "/dossier/work/hitman/hitman-entry-preview.jpg",
        alt: "Selected entry with its live preview",
        caption: "Entry — live preview",
        note: "Select any site and it opens beside the grid — the real page, proxied in live.",
      },
      {
        src: "/dossier/work/hitman/hitman-entry-mobile.jpg",
        alt: "Entry mobile view",
        caption: "Entry — mobile",
        note: "Every entry carries its phone view.",
      },
      {
        src: "/dossier/work/hitman/hitman-entry-colors.jpg",
        alt: "Entry color palette",
        caption: "Entry — colors",
        note: "Each entry comes back with its palette read — hex, OKLCH, or Tailwind, ready to copy.",
      },
      {
        src: "/dossier/work/hitman/hitman-entry-type.jpg",
        alt: "Entry type specimen",
        caption: "Entry — type",
        note: "And its type — display and text faces, specimen and CSS.",
      },
      {
        src: "/dossier/work/hitman/hitman-category.jpg",
        alt: "Library filtered by category",
        caption: "Filed by category",
        note: "Product, Studio, Editorial and the rest — 131 in Product alone.",
      },
      {
        src: "/dossier/work/hitman/hitman-request.jpg",
        alt: "Request a site dialog",
        caption: "Request a site",
        note: "Paste any address. The library checks it isn't already here.",
      },
      {
        src: "/dossier/work/hitman/hitman-library-dark.jpg",
        alt: "The library in dark mode",
        caption: "Both skins",
        note: "The whole shelf in dark — nothing lost in translation.",
      },
      {
        src: "/dossier/work/hitman/hitman-about.jpg",
        alt: "About page",
        caption: "About",
        note: "The story in three paragraphs — a link is not a design.",
      },
      {
        src: "/dossier/work/hitman/hitman-changelog.jpg",
        alt: "Changelog page",
        caption: "Changelog",
        note: "A monthly rail of fixes and improvements, latest September 14, 2026.",
      },
      {
        src: "/dossier/work/hitman/hitman-mark.jpg",
        alt: "Hitman's Library mark",
        caption: "Mark",
        note: "The shelf — four books, one leaning.",
      },
    ],
  },
  {
    slug: "sylvan",
    exhibit: "EXHIBIT B",
    name: "Sylvan",
    year: "2025",
    logo: "/dossier/sylvan-logo.png",
    status: "SHIPPED",
    role: "Brand design, logo design, web design, visual system",
    site: { label: "sylvanlabs.com", href: "https://sylvanlabs.com" },
    oneLiner:
      "Sylvan helps revenue teams understand what actually drives customer behaviour by turning messy data into useful signals. I worked across the brand, web and visual system.",
    credits:
      "Damilare Osofisan, Mario Prasetyo, HEX",
    quote:
      "Sylvan turns noise into signal.",
    summary: [
      "Sylvan is a revenue intelligence platform with a readability problem to solve before a single dashboard loads: every analytics tool it competes with looks like the clutter it promises to remove.",
      "The answer was an identity built around the signal mark — a visual system that shows how customer actions create patterns over time. It shifts and adapts, the way real opportunities appear inside customer journeys, and it became the core of the whole brand.",
      "The rule throughout: simple, but never cold. Every piece of the system reinforces one idea — Sylvan turns noise into signal.",
    ],
    sections: [
      {
        k: "Role & Contribution",
        v: "Brand design, logo design, web design and visual direction.",
      },
      {
        k: "What Was Done",
        v: "Built the identity around the idea of signals and patterns, then carried it across the logo, website, hero visuals and supporting artwork.",
      },
      {
        k: "How",
        v: "The product deals with a lot of information, so the identity needed to communicate clarity without feeling like another analytics tool. The system uses simple forms and movement to make the idea of signals feel more tangible.",
      }
    ],
    gallery: [
      {
        src: "/dossier/work/sylvan/sylvan-cover.mp4",
        alt: "Sylvan cover video",
        caption: "Cover",
        kind: "video",
        poster: "/dossier/work/sylvan/sylvan-cover-poster.jpg",
      },
      {
        src: "/dossier/work/sylvan/sylvan-logo-full.jpg",
        alt: "Sylvan logo lockup",
        caption: "Logo",
        note: "The lockup — signal mark and wordmark on Primary.",
      },
      {
        src: "/dossier/work/sylvan/sylvan-mark-variants.jpg",
        alt: "Signal mark in three colorways",
        caption: "Mark, three ways",
        note: "Favicon variants across the palette.",
      },
      {
        src: "/dossier/work/sylvan/sylvan-typeface.jpg",
        alt: "Primary typeface Untitled Sans",
        caption: "Primary typeface",
        note: "Untitled Sans, from Klim — alternates included.",
      },
      {
        src: "/dossier/work/sylvan/sylvan-char-set.jpg",
        alt: "Untitled Sans character set",
        caption: "Character set",
        note: "The full inventory, uppercase to fractions.",
      },
      {
        src: "/dossier/work/sylvan/sylvan-type-use.jpg",
        alt: "Typeface roles across the product",
        caption: "Type in use",
        note: "Untitled Sans for display, Inter for UI, Geist Mono for subtitles.",
      },
      {
        src: "/dossier/work/sylvan/sylvan-type-system.jpg",
        alt: "Type system from H1 to P3",
        caption: "Type system",
        note: "H1 to P3 — tracked and leaded.",
      },
      {
        src: "/dossier/work/sylvan/sylvan-neutrals.jpg",
        alt: "Neutral colors",
        caption: "Neutrals",
        note: "Black, Neutral Gray, Baby Powder, White.",
      },
      {
        src: "/dossier/work/sylvan/sylvan-brand-colors.jpg",
        alt: "Brand colors with hex values",
        caption: "Brand colors",
        note: "Primary #1C3B37, with mint and butter accents.",
      },
      {
        src: "/dossier/work/sylvan/sylvan-visual-system.jpg",
        alt: "Visual system rationale",
        caption: "Visual system",
        note: "ASCII trees — data and nature in code characters.",
      },
      {
        src: "/dossier/work/sylvan/sylvan-ascii-growth.jpg",
        alt: "ASCII signal trees growing",
        caption: "Growth, in ASCII",
        note: "Signal trees that grow like the product.",
      },
      {
        src: "/dossier/work/sylvan/sylvan-ascii-tree.jpg",
        alt: "Full ASCII signal tree",
        caption: "The full tree",
        note: "The mark's world, drawn in characters.",
      },
      {
        src: "/dossier/work/sylvan/sylvan-voice.jpg",
        alt: "Sylvan social post",
        caption: "Voice",
        note: "Foundations of Growth, Built above the Noise.",
      },
      {
        src: "/dossier/sylvan-featured.gif",
        alt: "Sylvan identity in motion",
        caption: "Signal in motion",
        note: "The mark, alive — sylvanlabs.com.",
      },
    ],
  },
  {
    slug: "chessever",
    exhibit: "EXHIBIT C",
    name: "ChessEver",
    year: "2025",
    logo: "/dossier/work/chessever/chessever-icon.jpg",
    status: "SHIPPED",
    role: "Founding Designer",
    site: { label: "chessever.com", href: "https://chessever.com" },
    extraLinks: [
      { label: "iOS", href: "https://apps.apple.com/us/app/chessever/id6752567269" },
      { label: "ANDROID", href: "https://play.google.com/store/apps/details?id=com.chessEver.app" },
    ],
    oneLiner:
      "Following professional chess in real time — on the phone, the desktop, and the web. I was the founding designer, from first concepts to launch.",
    credits:
      "Damilare Osofisan, Kenny Olajide, Vasif Durarbayli",
    quote:
      "Everything works exactly how you'd expect it to — no learning curve.",
    summary: [
      "Chess fans had no intuitive way to follow live tournaments. Existing platforms were clunky, outdated, or shut down entirely — serious players and fans needed something that felt natural.",
      "ChessEver lives in three places. The phone app is the heart of it: live games with engine evaluation, full player stats and head-to-head records, and favorites you curate yourself. The desktop client takes the same tournaments to a big screen, with the depth of a database and the full live broadcast. The website is the way in — the broadcast essentials, a creator directory, a memorial page, and news.",
    ],
    sections: [
      {
        k: "Role & Contribution",
        v: "Founding designer. Research, product design and interface across iOS, Android, desktop, and web.",
      },
      {
        k: "What Was Done",
        v: "One product in three places, each with its own job. Phone: live games, standings, player stats, tournament coverage — follow, save, find. Desktop: the round on a big screen, database-deep and broadcast live. Web: the essentials plus directory, memorial, and news.",
      },
      {
        k: "How",
        v: "Simple was the whole brief — following live chess should feel obvious. I designed the phone experience first, then gave desktop and web their own shapes from the same language.",
      },
      {
        k: "Proof",
        v: "4.9 stars on both stores — 120 reviews on Apple, 165 on Google Play, best in its segment. 200+ sign-ups daily since launch. Top 10 finalist in the TWIST Gamma pitch competition.",
      }
    ],
    gallery: [
      {
        src: "/dossier/work/chessever/13-mark.jpg",
        alt: "ChessEver mark on black",
        caption: "Mark",
        note: "The mark in motion — four squares, one piece.",
        motion: "chessever",
      },
      {
        src: "/dossier/work/chessever/01-onboarding.jpg",
        alt: "ChessEver onboarding — welcome and locale",
        caption: "Onboarding",
        note: "The entry — two steps, then straight to chess.",
      },
      {
        src: "/dossier/work/chessever/02-follow-players.jpg",
        alt: "Following players during onboarding",
        caption: "Follow players",
        note: "Follow at least three players to get started — the feed builds itself from there.",
      },
      {
        src: "/dossier/work/chessever/04-swipe-between-games.jpg",
        alt: "Swiping the board between live games",
        caption: "Swipe between games",
        note: "The core interaction — swipe the board to move between live games.",
      },
      {
        src: "/dossier/work/chessever/05-game-review.jpg",
        alt: "Game review with engine evaluation",
        caption: "Game review",
        note: "Every game carries its engine read — no learning curve to find it.",
      },
      {
        src: "/dossier/work/chessever/06-opening-explorer.jpg",
        alt: "Opening explorer with board and lines",
        caption: "Opening explorer",
        note: "Depth when you want it — openings and plans off the same board.",
      },
      {
        src: "/dossier/work/chessever/07-pin-games.jpg",
        alt: "Pinning games to the top of the list",
        caption: "Pin games",
        note: "Pin the games that matter — your round, your order.",
      },
      {
        src: "/dossier/work/chessever/09-standings.jpg",
        alt: "Tournament standings and player score card",
        caption: "Standings",
        note: "Standings plus the player card — form at a glance.",
      },
      {
        src: "/dossier/work/chessever/10-library.jpg",
        alt: "Database library lists",
        caption: "Library",
        note: "The library — every list in one quiet place.",
      },
      {
        src: "/dossier/work/chessever/15-database.jpg",
        alt: "TWIC database search and book builder",
        caption: "Database",
        note: "The database goes deep — TWIC lists, search, and a book builder.",
      },
      {
        src: "/dossier/work/chessever/11-filter-database.jpg",
        alt: "Filtering options in the database",
        caption: "Filter the database",
        note: "Search any player or event instantly — filters that stay out of the way.",
      },
      {
        src: "/dossier/work/chessever/14-notifications.jpg",
        alt: "Notification settings",
        caption: "Notifications",
        note: "Heads-up before rounds, live move by move — never miss your game.",
      },
      {
        src: "/dossier/work/chessever/12-brand.jpg",
        alt: "ChessEver brand posters",
        caption: "Brand",
        note: "The voice off the board — follow chess better.",
      },
      {
        src: "/dossier/work/chessever/16-merch.jpg",
        alt: "ChessEver hoodie front and back",
        caption: "Merch",
        note: "Off the screen — the mark on cloth.",
      },
      {
        src: "/dossier/work/chessever/17-lockup.jpg",
        alt: "ChessEver full lockup",
        caption: "Lockup",
        note: "The lockup — wordmark and mark, front and back.",
      },
    ],
  },
  {
    slug: "endgame",
    exhibit: "EXHIBIT D",
    name: "Endgame",
    logo: "/dossier/endgame-logo.png",
    status: "SHIPPED",
    role: "Product Designer",
    site: { label: "endgame.ai", href: "https://endgame.ai" },
    oneLiner:
      "I joined Endgame.ai after launch to help restructure the product and bring the web experience closer to mobile.",
    credits:
      "Damilare Osofisan, Kenny Olajide, Hans Neimann",
    summary: [],
    sections: [
      {
        k: "Role & Contribution",
        v: "Product design across web and mobile. UX, interaction design, UI and feature development.",
      },
      {
        k: "What Was Done",
        v: "Restructured existing experiences, brought web closer to mobile parity, and helped design new features including Puzzle Run, Endgame Club and Endgame Watch.",
      },
      {
        k: "How",
        v: "The product was already live, so the job was less about starting over and more about figuring out what needed to change. I worked through existing flows, tightened the experience and carried the product language across web and mobile while designing new features along the way.",
      },
    ],
    gallery: [
      {
        src: "/dossier/work/endgame/endgame-web.jpg",
        alt: "Play Online lobby on web",
        caption: "Web, closer to mobile",
        note: "Lobby, time controls, and live games — web at mobile parity.",
      },
      {
        src: "/dossier/work/endgame/endgame-netflix.jpg",
        alt: "Netflix partnership feature on the homepage",
        caption: "Netflix Exclusive",
        note: "The partnership slot — new users only, with a quick hide, so it never fights Play Online.",
      },
      {
        src: "/dossier/work/endgame/endgame-404.jpg",
        alt: "404 page with a playable board",
        caption: "404",
        note: "A dead end that deals you back in — Black to move.",
      },
      {
        src: "/dossier/work/endgame/endgame-clubs.jpg",
        alt: "Endgame Clubs on mobile in light and dark",
        caption: "Clubs on the app",
        note: "The community surface on mobile, in both skins.",
      },
      {
        src: "/dossier/work/endgame/endgame-gameplay-mobile.jpg",
        alt: "Gameplay screen on mobile",
        caption: "Gameplay, mobile",
        note: "The gameplay screen, tightened for the phone.",
      },
      {
        src: "/dossier/work/endgame/endgame-puzzle-countdown.jpg",
        alt: "Puzzle Run countdown",
        caption: "Puzzle Run",
        note: "Three lives, one countdown — the run starts here.",
      },
      {
        src: "/dossier/work/endgame/endgame-puzzle-trio.jpg",
        alt: "Puzzle Run setup across three screens",
        caption: "Puzzle Run, three screens",
        note: "Pick a time, set a target, start the run — web, web-mobile, and app.",
      },
      {
        src: "/dossier/work/endgame/endgame-puzzle-3.jpg",
        alt: "Puzzle Run frame",
        caption: "Puzzle Run III",
        note: "The run, continued.",
      },
      {
        src: "/dossier/work/endgame/endgame-puzzle-mobile.jpg",
        alt: "Puzzle flow on mobile",
        caption: "Puzzles, mobile",
        note: "The puzzle flow rebuilt for the phone.",
      },
      {
        src: "/dossier/work/endgame/endgame-watch.jpg",
        alt: "Watch experience with live tournaments and boards",
        caption: "Watch",
        note: "Tournament cards, live boards, standings, chat — the event in your pocket.",
      },
      {
        src: "/dossier/work/endgame/endgame-watch-teams.jpg",
        alt: "Watch coverage of team events",
        caption: "Watch, team events",
        note: "Team events on Watch — coverage few platforms attempt.",
      },
      {
        src: "/dossier/work/endgame/endgame-learn.jpg",
        alt: "Learn chapter checkpoint on discovered attacks",
        caption: "Learn",
        note: "Chapter checkpoints — Discovered Attacks, taught with a Nimzowitsch quote.",
      },
      {
        src: "/dossier/work/endgame/endgame-learn-1.jpg",
        alt: "Learn lesson frame",
        caption: "Learn I",
        note: "The lesson system, another pass.",
      },
      {
        src: "/dossier/work/endgame/endgame-learn-2.jpg",
        alt: "Learn lesson frame",
        caption: "Learn II",
        note: "Board and lesson side by side.",
      },
      {
        src: "/dossier/work/endgame/endgame-learn-3.jpg",
        alt: "Learn lesson frame",
        caption: "Learn III",
        note: "Checkpoints that read like chapters.",
      },
      {
        src: "/dossier/work/endgame/endgame-coach.jpg",
        alt: "Coach review with accuracy breakdown",
        caption: "Coach review",
        note: "Review with Coach — accuracy by phase, every move classified.",
      },
      {
        src: "/dossier/work/endgame/endgame-standings.jpg",
        alt: "Team event standings",
        caption: "Team standings",
        note: "Standings stripped to signal — MP, GP, nothing else.",
      },
      {
        src: "/dossier/work/endgame/endgame-team-card.jpg",
        alt: "Team card with match history and lineup",
        caption: "Team card",
        note: "Match history and lineup in one overlay, on every platform.",
      },
      {
        src: "/dossier/work/endgame/endgame-gamification.jpg",
        alt: "Player profile with XP and achievements",
        caption: "Gamification",
        note: "XP, streaks, achievements — the profile as a game board.",
      },
      {
        src: "/dossier/work/endgame/endgame-gamification-1.jpg",
        alt: "Gamification frame",
        caption: "Gamification II",
        note: "Avatars, piece sets, and the full reward loop.",
      },
      {
        src: "/dossier/work/endgame/endgame-pieces.jpg",
        alt: "CZAR piece set in two colorways",
        caption: "Piece sets",
        note: "CZAR — a set drawn from scratch, in two colorways.",
      },
      {
        src: "/dossier/work/endgame/endgame-pieces-1.jpg",
        alt: "Hopea piece set",
        caption: "Hopea",
        note: "Hopea — the second colorway of the set.",
      },
      {
        src: "/dossier/work/endgame/endgame-theme.mov",
        alt: "Theme switching video",
        caption: "Theme switching",
        note: "One system, two skins — the whole product flips.",
        kind: "video",
        poster: "/dossier/work/endgame/endgame-theme-poster.jpg",
      },
    ],
  },
];

export function findCase(slug: string) {
  return workCases.find((c) => c.slug === slug);
}
