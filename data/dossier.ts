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
        "A collection of cool experiences across the web. Currently building, so the case file stays open until it ships.",
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
        "Helps teams understand what actually drives revenue by making customer data simple to read. Most analytics tools bury you in reports and slow dashboards. Sylvan cuts through that.",
      rows: [
        {
          k: "CHALLENGE",
          v: "Revenue teams need to spot the small changes in customer behavior that matter. Most platforms make this harder, not easier. The identity had to feel like the opposite of a cluttered analytics tool.",
        },
        {
          k: "BUILT",
          v: "The signal mark is a visual system showing how customer actions create patterns over time. It shifts and adapts, like real opportunities appearing in customer journeys, and became the core of the identity.",
        },
        {
          k: "APPROACH",
          v: "Simple but meaningful. Clarity without feeling cold or technical. Every piece of the system reinforces one idea: Sylvan turns noise into signal.",
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
        "Following professional chess in real time: on the phone, the desktop, and the web. With FollowChess gone, there was no simple way to track live games, standings, and player stats in one place. ChessEver brings that back.",
      rows: [
        {
          k: "BUILT",
          v: "The entire product from zero. Clean interface, real-time game tracking, engine evaluation, complete player stats and head-to-head records. No learning curve.",
        },
        {
          k: "PROOF",
          v: "5.0 on the App Store with 45 ratings. 4.8 on Google Play with 193 reviews. 1,000+ weekly active users. Pitched at TWiST Gamma.",
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
      text: "An infinite canvas for organizing and sharing mockup images. Live below, fully interactive.",
      href: "https://nacre-quake-50137672.figma.site",
      embed: "https://nacre-quake-50137672.figma.site",
    },
    {
      name: "PIXEL SOCCER",
      tag: "GAME",
      text: "Classic pixelated soccer. Playable right here, right now.",
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
  shots: [
    /* sylvan */
    { src: "/dossier/shots/sylvan.jpg", alt: "Sylvan study 1", caption: "sylvan \u2014 study 01." },
    { src: "/dossier/shots/sylvan-1.jpg", alt: "Sylvan study 2", caption: "sylvan \u2014 study 02." },
    { src: "/dossier/shots/sylvan-2.jpg", alt: "Sylvan study 3", caption: "sylvan \u2014 study 03." },
    { src: "/dossier/shots/sylvan-3.jpg", alt: "Sylvan study 4", caption: "sylvan \u2014 study 04." },
    { src: "/dossier/shots/sylvan-4.jpg", alt: "Sylvan study 5", caption: "sylvan \u2014 study 05." },
    { src: "/dossier/shots/sylvan-5.jpg", alt: "Sylvan study 6", caption: "sylvan \u2014 study 06." },
    { src: "/dossier/shots/sylvan-6.jpg", alt: "Sylvan study 7", caption: "sylvan \u2014 study 07." },
    { src: "/dossier/shots/sylvan-7.jpg", alt: "Sylvan study 8", caption: "sylvan \u2014 study 08." },
    /* vienna */
    { src: "/dossier/shots/vienna.jpg", alt: "Vienna study 1", caption: "vienna \u2014 study 01." },
    { src: "/dossier/shots/vienna-1.jpg", alt: "Vienna study 2", caption: "vienna \u2014 study 02." },
    { src: "/dossier/shots/vienna-2.jpg", alt: "Vienna study 3", caption: "vienna \u2014 study 03." },
    { src: "/dossier/shots/vienna-3.jpg", alt: "Vienna study 4", caption: "vienna \u2014 study 04." },
    { src: "/dossier/shots/vienna-4.jpg", alt: "Vienna study 5", caption: "vienna \u2014 study 05." },
    { src: "/dossier/shots/vienna-5.jpg", alt: "Vienna study 6", caption: "vienna \u2014 study 06." },
    /* remi was pulled: two of its plates rendered wrong in the viewer and the
       project has no other study to stand behind them. */
    /* intempus */
    { src: "/dossier/shots/intempus.jpg", alt: "Intempus study 1", caption: "intempus \u2014 study 01." },
    { src: "/dossier/shots/intempus-1.jpg", alt: "Intempus study 2", caption: "intempus \u2014 study 02." },
    { src: "/dossier/shots/intempus-2.jpg", alt: "Intempus study 3", caption: "intempus \u2014 study 03." },
    { src: "/dossier/shots/intempus-emotions.jpg", alt: "Intempus study 4", caption: "intempus \u2014 study 04." },
    /* pintours */
    { src: "/dossier/shots/pintours.jpg", alt: "Pintours study 1", caption: "pintours \u2014 study 01." },
    { src: "/dossier/shots/pintours-1.jpg", alt: "Pintours study 2", caption: "pintours \u2014 study 02." },
    { src: "/dossier/shots/pintours-2.jpg", alt: "Pintours study 3", caption: "pintours \u2014 study 03." },
    { src: "/dossier/shots/pintours-3.jpg", alt: "Pintours study 4", caption: "pintours \u2014 study 04." },
    /* chessever */
    { src: "/dossier/shots/chessever.jpg", alt: "Chessever study 1", caption: "chessever \u2014 study 01." },
    { src: "/dossier/shots/chessever-1.jpg", alt: "Chessever study 2", caption: "chessever \u2014 study 02." },
    { src: "/dossier/shots/chessever-2.jpg", alt: "Chessever study 3", caption: "chessever \u2014 study 03." },
    /* hitman's library */
    { src: "/dossier/shots/hitmans-library.jpg", alt: "Hitman's Library study 1", caption: "hitman's library \u2014 study 01." },
    { src: "/dossier/shots/hitmans-library-1.jpg", alt: "Hitman's Library study 2", caption: "hitman's library \u2014 study 02." },
    /* inunity */
    { src: "/dossier/shots/inunity.jpg", alt: "Inunity study 1", caption: "inunity \u2014 study 01." },
    { src: "/dossier/shots/inunity-1.jpg", alt: "Inunity study 2", caption: "inunity \u2014 study 02." },
    { src: "/dossier/shots/inunity-2.jpg", alt: "Inunity study 3", caption: "inunity \u2014 study 03." },
    /* glint */
    { src: "/dossier/shots/glint.jpg", alt: "Glint study 1", caption: "glint \u2014 study 01." },
    { src: "/dossier/shots/glint-1.jpg", alt: "Glint study 2", caption: "glint \u2014 study 02." },
    { src: "/dossier/shots/glint-2.jpg", alt: "Glint study 3", caption: "glint \u2014 study 03." },
    /* seal2 — the wordmark on the plates is "Seal2"; the masters are filed
       as sea12, which read as a second project and doubled the group. */
    { src: "/dossier/shots/sea12.jpg", alt: "Seal2 study 1", caption: "seal2 \u2014 study 01." },
    { src: "/dossier/shots/sea12-1.jpg", alt: "Seal2 study 2", caption: "seal2 \u2014 study 02." },
    { src: "/dossier/shots/sea12-2.jpg", alt: "Seal2 study 3", caption: "seal2 \u2014 study 03." },
    /* superr */
    { src: "/dossier/shots/superr.jpg", alt: "Superr study 1", caption: "superr \u2014 study 01." },
    { src: "/dossier/shots/superr-1.jpg", alt: "Superr study 2", caption: "superr \u2014 study 02." },
    { src: "/dossier/shots/superr-2.jpg", alt: "Superr study 3", caption: "superr \u2014 study 03." },
    /* sequence */
    { src: "/dossier/shots/sequence.jpg", alt: "Sequence study 1", caption: "sequence \u2014 study 01." },
    { src: "/dossier/shots/sequence-1.jpg", alt: "Sequence study 2", caption: "sequence \u2014 study 02." },
    /* chronicle labs */
    { src: "/dossier/shots/chronicle-labs.jpg", alt: "Chronicle Labs study 1", caption: "chronicle labs \u2014 study 01." },
    { src: "/dossier/shots/chronicle-labs-1.jpg", alt: "Chronicle Labs study 2", caption: "chronicle labs \u2014 study 02." },
    { src: "/dossier/shots/chronicle-labs-trace.jpg", alt: "Chronicle Labs study 3", caption: "chronicle labs \u2014 study 03." },
    /* mederva */
    { src: "/dossier/shots/mederva.jpg", alt: "Mederva study 1", caption: "mederva \u2014 study 01." },
    { src: "/dossier/shots/mederva-2.jpg", alt: "Mederva study 2", caption: "mederva \u2014 study 02." },
    /* nothing pedometer */
    { src: "/dossier/shots/nothing-pedometer.jpg", alt: "Nothing Pedometer study 1", caption: "nothing pedometer \u2014 study 01." },
    { src: "/dossier/shots/nothing-pedometer-1.jpg", alt: "Nothing Pedometer study 2", caption: "nothing pedometer \u2014 study 02." },
    /* textedly */
    { src: "/dossier/shots/textedly.jpg", alt: "Textedly study 1", caption: "textedly \u2014 study 01." },
    /* SMALLGPT */
    { src: "/dossier/shots/smallgpt.jpg", alt: "SMALLGPT study 1", caption: "SMALLGPT \u2014 study 01." },
    /* strix */
    { src: "/dossier/shots/strix.jpg", alt: "Strix study 1", caption: "strix \u2014 study 01." },
    /* axion */
    { src: "/dossier/shots/axion.jpg", alt: "Axion study 1", caption: "axion \u2014 study 01." },
    /* zlink */
    { src: "/dossier/shots/zlink.jpg", alt: "Zlink study 1", caption: "zlink \u2014 study 01." },
    /* whosampled */
    { src: "/dossier/shots/whosampled.jpg", alt: "WhoSampled study 1", caption: "whosampled \u2014 study 01." },
    /* prayerpause */
    { src: "/dossier/shots/prayerpause.jpg", alt: "Prayer Pause study 1", caption: "prayer pause \u2014 study 01." },
    /* arpelos */
    { src: "/dossier/shots/arpelos.jpg", alt: "Arpelos study 1", caption: "arpelos \u2014 study 01." },
    /* ciego */
    { src: "/dossier/shots/ciego.jpg", alt: "Ciego study 1", caption: "ciego \u2014 study 01." },
    /* volvo */
    { src: "/dossier/shots/volvo.jpg", alt: "Volvo study 1", caption: "volvo \u2014 study 01." },
    /* Studies with no re-export yet - kept so nothing disappears.
       1537.png, 2085.png and wb1.png were dropped from this list: they are
       the same three Seal2 plates as the sea12 masters above, at lower
       resolution, and the wall showed each study twice. */
    { src: "/dossier/shots/2124.png", alt: "Car climate app concept", caption: "car climate — app concept." },
    { src: "/dossier/shots/2087.png", alt: "friend.com metro campaign photo grid", caption: "friend.com \u2014 metro exploration." },
    { src: "/dossier/shots/gander.jpg", alt: "Gander verified news claim screen", caption: "gander — verdict." },
    { src: "/dossier/shots/abstract.jpg", alt: "Abstract title cover on a dark technical grid", caption: "abstract — cover." },
    { src: "/dossier/shots/trieuth-capital.jpg", alt: "TrieuthCapital gradient brand cover", caption: "trieuth capital — cover." },
  ] as { src: string; alt: string; caption: string; fit?: "contain" }[],
  /* The four animated covers the home page leads with. They live here rather
     than inside app/page.tsx so the playground can show the same plates as the
     studies — one list, one place to change a cover. `width`/`height` are the
     GIF's own pixels, so a wall tile can reserve its box before it decodes. */
  workCovers: [
    {
      slug: "hitmans-library",
      title: "Hitman's Library",
      sub: "A growing collection of web experiences",
      img: "/dossier/work/hitman/hitman-cover.gif",
      poster: "/dossier/work/hitman/hitman-cover-poster.jpg",
      alt: "Hitman's Library shelf mark and wordmark",
      still: true,
      fit: "contain",
      bg: "#ececec",
      width: 1600,
      height: 1000,
    },
    {
      slug: "sylvan",
      title: "Sylvan",
      sub: "Revenue intelligence for modern teams",
      img: "/dossier/work/sylvan/sylvan-cover.gif",
      poster: "/dossier/work/sylvan/sylvan-cover-poster.jpg",
      alt: "Sylvan signal marks",
      still: true,
      width: 1600,
      height: 1000,
    },
    {
      slug: "endgame",
      title: "Endgame",
      sub: "Product design",
      img: "/dossier/work/endgame/endgame-cover.gif",
      poster: "/dossier/work/endgame/endgame-cover-poster.jpg",
      alt: "Endgame E mark in stars and stripes",
      still: true,
      width: 1600,
      height: 1000,
    },
    {
      slug: "chessever",
      title: "ChessEver",
      sub: "Live tournaments, players & standings",
      img: "/dossier/work/chessever/chessever-cover.gif",
      poster: "/dossier/work/chessever/chessever-cover-poster.jpg",
      alt: "ChessEver rookie rook mark",
      still: true,
      width: 1920,
      height: 1200,
    },
  ] as {
    slug: string;
    title: string;
    sub: string;
    img: string;
    poster: string;
    alt: string;
    still: boolean;
    fit?: "contain";
    bg?: string;
    width: number;
    height: number;
  }[],
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
