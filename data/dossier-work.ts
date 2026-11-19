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
  /** The story, told beside the work. Each chapter is a claim, a line or
      two behind it, and the gallery frames (by index) that show it. The
      lead frame (index 0) sits above the chapters and belongs to none. */
  chapters?: { title: string; body: string; frames: number[] }[];
  /** Where it landed, said plainly. Closes the story. */
  outcome?: string;
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
      "A visual library of 347 well-designed websites, each with its colours and fonts pulled out.",
    credits: [
      { name: "Damilare Osofisan" },
      { name: "Florence Eze", href: "https://florenceeze.com" },
    ],
    quote:
      "Collect the experiences worth stealing from.",
    summary: [],
    sections: [
      {
        k: "Problem",
        v: "Florence and I kept the sites we liked in a spreadsheet. Links and notes, and no way to see any of them.",
      },
      {
        k: "What I did",
        v: "Designed and built it with Florence Eze, from structure to interface to code. Search, filters by colour and font, saved sets, a weekly digest and a Pro membership.",
      },
      {
        k: "Decisions",
        v: "Every entry leads with a picture of the site, not a link. The deeper detail, its colours, fonts and phone view, opens one click away, so the grid stays easy to scan. Light and dark, and a real phone layout, from the start.",
      },
      {
        k: "Outcome",
        v: "Live at hitmanslibrary.xyz with 347 sites, and still growing.",
      },
    ],
    chapters: [
      {
        title: "It started as a spreadsheet.",
        body: "Florence and I kept the sites we loved in Excel. Links down one column, notes like “the image hover thing” beside them, and no way to see any of it. So we built what we wanted: a library you can look at.",
        frames: [2, 1],
      },
      {
        title: "Every site, taken apart.",
        body: "Each one is photographed, with its colours and fonts pulled out. A card shows just enough to scan: the picture, the address, the main colours and what kind of site it is.",
        frames: [3, 4],
      },
      {
        title: "Find it by what you remember.",
        body: "You rarely remember a site's name. You remember its colour or its type. So search is one key away, and filters work by colour, by font and by how readable the text is.",
        frames: [5, 8],
      },
      {
        title: "Open a site and study it.",
        body: "Every site opens into its live page, its phone view, its colours and its fonts. Tap a colour to copy it.",
        frames: [6, 7],
      },
      {
        title: "Make it yours.",
        body: "Heart what you like and file it into sets. Leave an email and every Monday brings new sites like the ones you've hearted. Pro members get a numbered card with everything they keep.",
        frames: [9, 10, 11, 12],
      },
      {
        title: "Built to work anywhere.",
        body: "Light and dark from the start, and a phone layout designed as its own thing, not a shrunken desktop. Even the 404 page puts search one key away.",
        frames: [13, 14, 15],
      },
      {
        title: "The details around it.",
        body: "A shelf of four books for a mark, a short about page, and a changelog where every fix is dated and signed by whoever made it.",
        frames: [18, 16, 17],
      },
    ],
    outcome: "Live at hitmanslibrary.xyz with 347 sites, and still growing.",
    gallery: [
      {
        src: "/dossier/work/hitman/hitmans-library-tour-v2.mp4",
        alt: "A tour of Hitman's Library: browsing, opening a site, its colours and fonts, search, and dark mode",
        caption: "Tour",
        note: "Browse the shelf, open a site, see its colours and fonts, search, then switch to dark.",
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
      "Brand identity and website for Sylvan, a revenue intelligence platform.",
    credits: [
      { name: "Damilare Osofisan" },
      { name: "Mario Prasetyo" },
      { name: "HEX" },
    ],
    quote:
      "Sylvan turns noise into signal.",
    summary: [],
    sections: [
      {
        k: "Problem",
        v: "Sylvan turns messy customer data into clear revenue signals. But its category all looks the same: busy dashboards and cold, technical brands, the clutter Sylvan promises to remove.",
      },
      {
        k: "What I did",
        v: "Brand, logo, website and visual system, made at HEX. Mario Prasetyo built the site, hand-drew the illustrations and contributed designs.",
      },
      {
        k: "Decisions",
        v: "One idea runs through everything: the signal mark, customer actions drawn as patterns over time. Simple forms, but never cold. ASCII trees carry the idea into illustration, data and nature in the same characters.",
      },
      {
        k: "Outcome",
        v: "Shipped across the logo, sylvanlabs.com, hero visuals and supporting artwork.",
      },
    ],
    chapters: [
      {
        title: "Every rival looked like the problem.",
        body: "Sylvan turns messy customer data into clear revenue signals. But the category all looks alike: dense dashboards and cold, technical brands. So the identity starts from one idea, noise becoming signal. The signal mark draws customer actions as patterns over time.",
        frames: [1, 2, 13],
      },
      {
        title: "Clear, but never cold.",
        body: "Untitled Sans from Klim carries the display type, Inter the interface and Geist Mono the small labels. One type system, H1 to P3, tracked and leaded.",
        frames: [3, 4, 5, 6],
      },
      {
        title: "A quiet palette.",
        body: "Primary is a deep green, #1C3B37, with mint and butter as accents and four neutrals underneath. Calm, so the signals stand out.",
        frames: [7, 8],
      },
      {
        title: "Data, drawn like nature.",
        body: "The illustrations are ASCII trees: data and nature in the same characters, growing from small signals the way the product grows revenue. Mario Prasetyo hand-drew them.",
        frames: [9, 10, 11],
      },
      {
        title: "Words to match.",
        body: "Foundations of Growth. Built above the Noise. The voice says the idea plainly.",
        frames: [12],
      },
    ],
    outcome: "Shipped across the logo, sylvanlabs.com, hero visuals and supporting artwork.",
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
        note: "Signal mark and wordmark on Primary.",
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
        caption: "ASCII tree",
        note: "A full tree drawn in code characters, grown from small signals.",
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
      "An app for following professional chess live. 1,000+ weekly users and 5.0 on the App Store.",
    credits: [
      { name: "Damilare Osofisan" },
      { name: "Kenny Olajide" },
      { name: "Vasif Durarbayli" },
    ],
    quote:
      "Everything works exactly how you'd expect it to. No learning curve.",
    summary: [],
    sections: [
      {
        k: "Problem",
        v: "Following a live tournament was awkward. The tools were clunky, slow or already shut down, and fans watch on their phone, desktop and the web.",
      },
      {
        k: "What I did",
        v: "Founding designer, from first sketches to launch, across iOS, Android, desktop and web. Kenny Olajide gave UX direction. Vasif Durarbayli is the founder.",
      },
      {
        k: "Decisions",
        v: "Simple was the brief: a live game should not need a tutorial. I designed the phone first as the reference, then built desktop and web from the same parts. Swiping between live boards became the core interaction.",
      },
      {
        k: "Outcome",
        v: "5.0 on the App Store from 45 ratings and 4.8 on Google Play from 193 reviews. 1,000+ weekly active users. Pitched at TWiST Gamma.",
      },
    ],
    chapters: [
      {
        title: "Following live chess was broken.",
        body: "The tools fans had were clunky, slow or already shut down, and people watch on phones, desktops and the web. I was the founding designer, from the first sketches to launch. Getting in takes two steps, then you're straight into chess.",
        frames: [1, 2],
      },
      {
        title: "Swipe is the whole product.",
        body: "A live game should not need a tutorial. So the board is the navigation: swipe to move between live games, and pin the ones that matter to you.",
        frames: [3, 6, 4],
      },
      {
        title: "Depth, only when you want it.",
        body: "Engine reads, openings, standings and form sit one step from the board. The database goes deep, with TWIC lists, search and filters that stay out of the way. Alerts arrive before rounds and move by move.",
        frames: [5, 7, 8, 9, 10, 11],
      },
      {
        title: "A brand that lives off the board.",
        body: "Four squares, one piece. The mark carries onto merch, with a voice that says it simply: follow chess better.",
        frames: [12, 13, 14],
      },
    ],
    outcome: "5.0 on the App Store and 4.8 on Google Play, with 1,000+ people using it every week. Pitched at TWiST Gamma.",
    gallery: [
      {
        src: "/dossier/work/chessever/13-mark.jpg",
        alt: "ChessEver mark on black",
        caption: "Mark",
        note: "In motion: four squares, one piece.",
        motion: "chessever",
      },
      {
        src: "/dossier/work/chessever/01-onboarding.jpg",
        alt: "ChessEver onboarding, welcome and locale",
        caption: "Onboarding",
        note: "Two steps, then straight to chess.",
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
        note: "The core interaction: swipe the board to move between live games.",
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
        note: "Your saved games and folders, with the full TWIC database a tap away.",
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
        note: "Wordmark and mark, front and back.",
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
      "Product design for Endgame.ai, an online chess platform. 4,000+ people have played Puzzle Run, a feature I designed.",
    credits: [
      { name: "Damilare Osofisan" },
      { name: "Kenny Olajide" },
      { name: "Hans Niemann" },
    ],
    summary: [],
    sections: [
      {
        k: "Problem",
        v: "Endgame.ai was already live, but the mobile app had fallen behind the web. Anyone on a phone got less of the product.",
      },
      {
        k: "What I did",
        v: "Designed across web and mobile: UX, interaction, UI and new features. First, brought mobile up to the web. Then Puzzle Run, Clubs, Watch, Coach, Learn, gamification, piece sets and avatars. Kenny Olajide gave UX direction. Hans Niemann is the founder.",
      },
      {
        k: "Decisions",
        v: "People were already using it, so every change had to earn its place. I chose small, likely-right moves over redesigns that only look considered. One product language across web and mobile made each new feature cheaper to add.",
      },
      {
        k: "Outcome",
        v: "4,000+ people have played Puzzle Run. 200+ players are in a game across web and mobile at any moment.",
      },
    ],
    chapters: [
      {
        title: "The phone was a step behind.",
        body: "I joined Endgame.ai after launch. The web had the full product and the app had less of it, so the first job was bringing mobile up to the bar the web set.",
        frames: [3, 2, 7],
      },
      {
        title: "Puzzle Run: three lives, one clock.",
        body: "Pick a time, set a target, and solve until the strikes run out. It works the same on the web, the mobile web and the app. 4,000+ people have played it.",
        frames: [4, 5, 6],
      },
      {
        title: "Every change had to earn its place.",
        body: "People were already playing, so I chose small, likely-right moves over redesigns. The Netflix spotlight is one: a single trailer slot for new fans, easy to hide, never in the way of Play Online.",
        frames: [1],
      },
      {
        title: "Watch it, learn it, review it.",
        body: "Tournament coverage with live boards, standings and chat, team events included. Lessons in chapters, with checkpoints along the way. Coach review that grades every move.",
        frames: [8, 9, 10, 11, 12, 13, 14, 15, 16],
      },
      {
        title: "A reason to come back.",
        body: "XP, streaks and achievements turn the profile into a game board. Two piece sets, CZAR and Hopea, were drawn from scratch.",
        frames: [17, 18, 19, 20],
      },
      {
        title: "One language, two skins.",
        body: "Holding one product language across web and mobile made each new feature cheaper to add. The whole product flips between light and dark.",
        frames: [21],
      },
    ],
    outcome: "4,000+ people have played Puzzle Run, and 200+ players are in a game at any moment.",
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
        caption: "Puzzle Run, in play",
        note: "The clock and strikes while you solve, then the result: solved, accuracy and average time.",
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
        caption: "Learn, on desktop",
        note: "Course outline, board and the checkpoint question, side by side.",
      },
      {
        src: "/dossier/work/endgame/endgame-learn-2.jpg",
        alt: "Learn lesson frame",
        caption: "Learn, on the phone",
        note: "Lessons, checkpoints and the course outline, sized for the phone.",
      },
      {
        src: "/dossier/work/endgame/endgame-learn-3.jpg",
        alt: "Learn lesson frame",
        caption: "Lesson complete",
        note: "Finish a lesson, earn XP and move on to the next chapter.",
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
        caption: "Achievements",
        note: "Badges to unlock as you play, with XP toward your next rank.",
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
