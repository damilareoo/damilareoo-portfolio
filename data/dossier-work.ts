/**
 * Full case files for each dossier exhibit: only work that is the owner's.
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
  /** Where the case file sends you: the live site, or the store listings for
      the apps. */
  links: { label: string; href: string; sheen?: string }[];
  oneLiner: string;
  quote?: string;
  credits: { name: string; href?: string }[];
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
    links: [{ label: "hitmanslibrary.xyz", href: "https://hitmanslibrary.xyz/" }],
    oneLiner:
      "A collection of cool experiences across the web. Currently building, so the case file stays open.",
    credits: [
      { name: "Damilare Osofisan" },
      { name: "Florence Eze", href: "https://florenceeze.com" },
    ],
    quote:
      "Collect the experiences worth stealing from.",
    summary: [
      "Florence and I were keeping sites in Excel sheets. Links down one column, notes beside them, and no way to actually look at any of it.",
      "Now every entry gets a screenshot, its own link, and a preview that loads the real page beside it.",
    ],
    sections: [
      {
        k: "Role & Contribution",
        v: "I designed and built it. Florence Eze contributed to the design and the build.",
      },
      {
        k: "What Was Done",
        v: "A visual library for collecting and studying web experiences. Every entry gets a screenshot, a link, and a place.",
      },
      {
        k: "How",
        v: "We wanted somewhere to keep the things we find interesting. Designed and built it together, structure to interface to code.",
      }
    ],
    gallery: [
      {
        src: "/dossier/work/hitman/hitmans-library-tour-v2.mp4",
        alt: "A tour of Hitman's Library: browsing, opening a site, its colours and fonts, search, and dark mode",
        caption: "Showcase",
        note: "A quick tour. Browse the shelf, open a site, see its colours and fonts, search, then switch to dark.",
        kind: "video",
        poster: "/dossier/work/hitman/hitman-tour-poster.jpg",
      },
      {
        src: "/dossier/work/hitman/hitman-title.jpg",
        alt: "Hitman's Library title card",
        caption: "Title card",
        note: "The identity: a shelf mark and a wordmark, nothing else.",
      },
      {
        src: "/dossier/work/hitman/hitman-origin-sheet.jpg",
        alt: "The spreadsheet the library started as",
        caption: "Origin: the spreadsheet",
        note: "Links with notes like “the image hover thing”. A collection with no way to look at any of it.",
      },
      {
        src: "/dossier/work/hitman/hitman-library-347.jpg",
        alt: "The library's home page: a grid of website cards, newest first",
        caption: "The library today",
        note: "347 well-designed websites in one place. Every one photographed, with its colours and fonts pulled out.",
      },
      {
        src: "/dossier/work/hitman/hitman-k-card.jpg",
        alt: "A single library card for Studio K95",
        caption: "Up close",
        note: "One card per site: a picture of it, its address, its main colours and what kind of site it is.",
      },
      {
        src: "/dossier/work/hitman/hitman-k-search.jpg",
        alt: "The search window listing studios as you type",
        caption: "Search",
        note: "Press ⌘K and start typing. Results appear as you go, and the arrow keys move through them.",
      },
      {
        src: "/dossier/work/hitman/hitman-k-panel.mp4",
        alt: "The site panel moving through its Preview, Mobile, Colors and Type tabs",
        caption: "Inside a site",
        note: "Open any site and step through it: the live page, its phone view, its colours and its fonts.",
        kind: "video",
        poster: "/dossier/work/hitman/hitman-k-panel-poster.jpg",
      },
      {
        src: "/dossier/work/hitman/hitman-k-colors.jpg",
        alt: "A site's colours listed as swatches with their codes",
        caption: "Entry: colors",
        note: "Every colour the site uses, pulled out for you. Tap one to copy its code.",
      },
      {
        src: "/dossier/work/hitman/hitman-refine-open.jpg",
        alt: "The library with the Refine panel open: palette, font and readable-text filters",
        caption: "Refine",
        note: "Narrow the library by colour, by font, or by how readable the text is.",
      },
      {
        src: "/dossier/work/hitman/hitman-k-saved.jpg",
        alt: "The Saved menu with hearts and named sets",
        caption: "Saved",
        note: "Heart the sites you like and file them into your own sets.",
      },
      {
        src: "/dossier/work/hitman/hitman-k-digest.jpg",
        alt: "The weekly digest sign-up",
        caption: "Weekly digest",
        note: "Leave an email and get new sites like the ones you've hearted, every Monday.",
      },
      {
        src: "/dossier/work/hitman/hitman-k-pro.mp4",
        alt: "The Pro card: the word Pro gathers from dots, then a lens passes over it",
        caption: "Pro",
        note: "The membership card. The word Pro gathers itself from dots; move over it and a lens follows.",
        kind: "video",
        poster: "/dossier/work/hitman/hitman-k-pro-poster.jpg",
      },
      {
        src: "/dossier/work/hitman/hitman-k-member.jpg",
        alt: "A member's card with their number, hearts, sets and watched sites",
        caption: "Member card",
        note: "Every member gets a numbered card with their hearts, sets and the sites they watch.",
      },
      {
        src: "/dossier/work/hitman/hitman-k-phones.jpg",
        alt: "Three phones showing the library, a member card and Pro",
        caption: "On the phone",
        note: "The whole library works on a phone, not just a smaller copy of the desktop.",
      },
      {
        src: "/dossier/work/hitman/hitman-library-dark-347.jpg",
        alt: "The library's home page in dark mode",
        caption: "Both skins",
        note: "Every screen comes in light and dark, and everything still reads clearly.",
      },
      {
        src: "/dossier/work/hitman/hitman-k-404.jpg",
        alt: "The 404 page with a large dotted 404",
        caption: "Not found",
        note: "Even a broken link lands somewhere friendly, with search one key away.",
      },
      {
        src: "/dossier/work/hitman/hitman-about.jpg",
        alt: "The About page, with the story and who made it",
        caption: "About",
        note: "How it started, in a few short paragraphs, and who made it.",
      },
      {
        src: "/dossier/work/hitman/hitman-changelog.jpg",
        alt: "The Changelog page, with dated updates and a month-by-month rail",
        caption: "Changelog",
        note: "A running list of every fix and new feature, dated and signed by whoever made it.",
      },
      {
        src: "/dossier/work/hitman/hitman-mark.jpg",
        alt: "Hitman's Library mark",
        caption: "Mark",
        note: "The shelf: four books, one leaning.",
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
    links: [{ label: "sylvanlabs.com", href: "https://sylvanlabs.com" }],
    oneLiner:
      "Revenue intelligence that turns messy customer data into useful signals. I did brand, web and visual system.",
    credits: [
      { name: "Damilare Osofisan" },
      { name: "Mario Prasetyo" },
      { name: "HEX" },
    ],
    quote:
      "Sylvan turns noise into signal.",
    summary: [
      "Sylvan is a revenue intelligence platform with a readability problem: every rival looks like the clutter it promises to remove.",
      "The answer was an identity built around the signal mark: customer actions drawn as patterns over time. It shifts and adapts like real opportunity, and became the core of the brand.",
      "The rule throughout: simple, but never cold. Every piece of the system reinforces one idea: Sylvan turns noise into signal.",
    ],
    sections: [
      {
        k: "Role & Contribution",
        v: "I designed the brand, logo, website and visual system. Mario Prasetyo built the site, hand-drew the illustrations and contributed designs. Made at HEX, the studio.",
      },
      {
        k: "What Was Done",
        v: "Built the identity around the idea of signals and patterns, then carried it across the logo, website, hero visuals and supporting artwork.",
      },
      {
        k: "How",
        v: "The product is dense, so the identity had to read clear without feeling like another analytics tool. Simple forms and movement make signals tangible.",
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
        note: "The lockup: signal mark and wordmark on Primary.",
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
        note: "Untitled Sans, from Klim, alternates included.",
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
        note: "H1 to P3, tracked and leaded.",
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
        note: "ASCII trees: data and nature in code characters.",
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
        note: "The mark, alive on sylvanlabs.com.",
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
    links: [
      {
        label: "App Store",
        href: "https://apps.apple.com/us/app/chessever-follow-live-chess/id6752567269",
        sheen: "sheen-chessever",
      },
      {
        label: "Google Play",
        href: "https://play.google.com/store/apps/details?id=com.chessEver.app",
        sheen: "sheen-chessever",
      },
    ],
    oneLiner:
      "Following professional chess as it actually happens, across phone, desktop and web. I was the founding designer, from first sketches to launch.",
    credits: [
      { name: "Damilare Osofisan" },
      { name: "Kenny Olajide" },
      { name: "Vasif Durarbayli" },
    ],
    quote:
      "Everything works exactly how you'd expect it to. No learning curve.",
    summary: [
      "Following live chess was genuinely awkward. The platforms that existed were clunky, slow, or already shut down, so anyone who cared about a tournament had to learn a new tool every round.",
      "It also had to live in three places, because that is where people actually watch chess. The tournaments are the same in all of them.",
    ],
    sections: [
      {
        k: "Role & Contribution",
        v: "I designed the product and interface across iOS, Android, desktop and web. Kenny Olajide gave UX direction. Vasif Durarbayli is the founder.",
      },
      {
        k: "What Was Done",
        v: "On the phone, live games with engine evaluation, full stats and head-to-heads, plus the games you follow and save. On desktop, the round goes big-screen and deep into the database. On the web, I worked on the first version of the experience: the essentials, a creator directory, memorial pages and news.",
      },
      {
        k: "How",
        v: "Simple was the whole brief, because following a live game should not need a tutorial. I designed the phone first and treated it as the reference, then let desktop and web stretch from the same parts rather than inventing their own. Three platforms, one set of rules.",
      },
      {
        k: "Proof",
        v: "5.0 on the App Store with 45 ratings. 4.8 on Google Play with 193 reviews. 1,000+ weekly active users. Pitched at TWiST Gamma.",
      }
    ],
    gallery: [
      {
        src: "/dossier/work/chessever/13-mark.jpg",
        alt: "ChessEver mark on black",
        caption: "Mark",
        note: "The mark in motion. Four squares, one piece.",
        motion: "chessever",
      },
      {
        src: "/dossier/work/chessever/01-onboarding.jpg",
        alt: "ChessEver onboarding, welcome and locale",
        caption: "Onboarding",
        note: "The entry. Two steps, then straight to chess.",
      },
      {
        src: "/dossier/work/chessever/02-follow-players.jpg",
        alt: "Following players during onboarding",
        caption: "Follow players",
        note: "Follow at least three players to get started. The feed builds itself from there.",
      },
      {
        src: "/dossier/work/chessever/04-swipe-between-games.jpg",
        alt: "Swiping the board between live games",
        caption: "Swipe between games",
        note: "The core interaction. Swipe the board to move between live games.",
      },
      {
        src: "/dossier/work/chessever/05-game-review.jpg",
        alt: "Game review with engine evaluation",
        caption: "Game review",
        note: "Every game carries its engine read. No learning curve to find it.",
      },
      {
        src: "/dossier/work/chessever/06-opening-explorer.jpg",
        alt: "Opening explorer with board and lines",
        caption: "Opening explorer",
        note: "Depth when you want it. Openings and plans off the same board.",
      },
      {
        src: "/dossier/work/chessever/07-pin-games.jpg",
        alt: "Pinning games to the top of the list",
        caption: "Pin games",
        note: "Pin the games that matter. Your round, your order.",
      },
      {
        src: "/dossier/work/chessever/09-standings.jpg",
        alt: "Tournament standings and player score card",
        caption: "Standings",
        note: "Standings plus the player card, form at a glance.",
      },
      {
        src: "/dossier/work/chessever/10-library.jpg",
        alt: "Database library lists",
        caption: "Library",
        note: "Every list in one quiet place.",
      },
      {
        src: "/dossier/work/chessever/15-database.jpg",
        alt: "TWIC database search and book builder",
        caption: "Database",
        note: "The database goes deep. TWIC lists, search and a book builder.",
      },
      {
        src: "/dossier/work/chessever/11-filter-database.jpg",
        alt: "Filtering options in the database",
        caption: "Filter the database",
        note: "Search any player or event instantly. Filters that stay out of the way.",
      },
      {
        src: "/dossier/work/chessever/14-notifications.jpg",
        alt: "Notification settings",
        caption: "Notifications",
        note: "Heads-up before rounds, live move by move. Never miss your game.",
      },
      {
        src: "/dossier/work/chessever/12-brand.jpg",
        alt: "ChessEver brand posters",
        caption: "Brand",
        note: "The voice off the board. Follow chess better.",
      },
      {
        src: "/dossier/work/chessever/16-merch.jpg",
        alt: "ChessEver hoodie front and back",
        caption: "Merch",
        note: "Off the screen, the mark on cloth.",
      },
      {
        src: "/dossier/work/chessever/17-lockup.jpg",
        alt: "ChessEver full lockup",
        caption: "Lockup",
        note: "The lockup. Wordmark and mark, front and back.",
      },
    ],
  },
  {
    slug: "endgame",
    exhibit: "EXHIBIT D",
    name: "Endgame",
    year: "2026",
    logo: "/dossier/endgame-logo.png",
    status: "SHIPPED",
    role: "Product Designer",
    links: [
      {
        label: "App Store",
        href: "https://apps.apple.com/us/app/endgame-ai/id6755304651",
        sheen: "sheen-endgame",
      },
      {
        label: "Google Play",
        href: "https://play.google.com/store/apps/details?id=com.endgame.mobile",
        sheen: "sheen-endgame",
      },
    ],
    oneLiner:
      "I joined after Endgame.ai had already launched, to help restructure a live product and bring the mobile app up to the web.",
    credits: [
      { name: "Damilare Osofisan" },
      { name: "Kenny Olajide" },
      { name: "Hans Niemann" },
    ],
    summary: [
      "The two sides had drifted apart, and the phone was the one behind. Anyone on a phone got less of the product than anyone on a laptop, which is a strange thing to have shipped. Bringing mobile up to the web was the first real block of work.",
      "I joined after launch, so none of this started from a blank page. Once the two sides matched, the design work opened up into whatever came next.",
    ],
    sections: [
      {
        k: "Role & Contribution",
        v: "I designed across web and mobile: UX, interaction, UI and new features. Kenny Olajide gave UX direction. Hans Niemann is the founder.",
      },
      {
        k: "What Was Done",
        v: "Restructured the live product, then designed what came after. Puzzle Run, Club, Watch, Coach, Learn, gamification, custom piece sets and avatars.",
      },
      {
        k: "How",
        v: "The product was live with people already using it, so every change had to earn itself. I would rather move something small and probably right than redesign it to look considered. Holding one product language across both sides is what made the later features cheap to add.",
      },
      {
        k: "Proof",
        v: "4,000+ people have played Puzzle Run, a feature I designed. 200+ players are in a game across web and mobile at any moment.",
      },
    ],
    gallery: [
      {
        src: "/dossier/work/endgame/endgame-web.jpg",
        alt: "Play Online lobby on web",
        caption: "The bar to match",
        note: "The web lobby with its time controls and live games. This is the depth the phone had to reach.",
      },
      {
        src: "/dossier/work/endgame/endgame-netflix.jpg",
        alt: "Netflix partnership feature on the homepage",
        caption: "Netflix Exclusive",
        note: "The Hans vs Magnus spotlight. One trailer slot for new fans, quick to hide, never fighting Play Online.",
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
        note: "Three lives, one countdown. The run starts here.",
      },
      {
        src: "/dossier/work/endgame/endgame-puzzle-trio.jpg",
        alt: "Puzzle Run setup across three screens",
        caption: "Puzzle Run, three screens",
        note: "Pick a time, set a target, start the run. Web, web-mobile and app.",
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
        note: "Tournament cards, live boards, standings, chat. The event in your pocket.",
      },
      {
        src: "/dossier/work/endgame/endgame-watch-teams.jpg",
        alt: "Watch coverage of team events",
        caption: "Watch, team events",
        note: "Team events on Watch. Coverage few platforms attempt.",
      },
      {
        src: "/dossier/work/endgame/endgame-learn.jpg",
        alt: "Learn chapter checkpoint on discovered attacks",
        caption: "Learn",
        note: "Chapter checkpoints. Discovered Attacks, taught with a Nimzowitsch quote.",
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
        note: "Review with Coach. Accuracy by phase, every move classified.",
      },
      {
        src: "/dossier/work/endgame/endgame-standings.jpg",
        alt: "Team event standings",
        caption: "Team standings",
        note: "Standings stripped to signal. MP, GP, nothing else.",
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
        note: "XP, streaks and achievements. The profile as a game board.",
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
        note: "CZAR. The geometric set, drawn from scratch in two colorways.",
      },
      {
        src: "/dossier/work/endgame/endgame-pieces-1.jpg",
        alt: "Hopea piece set",
        caption: "Hopea",
        note: "Hopea, an Indian wood type. Soft, rounded pieces on modern, playful boards.",
      },
      {
        src: "/dossier/work/endgame/endgame-theme.mov",
        alt: "Theme switching video",
        caption: "Theme switching",
        note: "One system, two skins. The whole product flips.",
        kind: "video",
        poster: "/dossier/work/endgame/endgame-theme-poster.jpg",
      },
    ],
  },
];

export function findCase(slug: string) {
  return workCases.find((c) => c.slug === slug);
}
