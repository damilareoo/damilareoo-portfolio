import type { WorkCase } from "./dossier-work";

/**
 * Explorations — interaction concepts and studies, in the same case-file
 * format as work, labelled apart. Only shipped concepts land here; the
 * home page lists them under their own heading.
 */
export const explorations: WorkCase[] = [
  {
    slug: "nothing-pedometer",
    exhibit: "EXPLORATION 01",
    name: "Nothing Pedometer",
    year: "2026",
    status: "CONCEPT",
    role: "Design + build",
    site: { label: "nothing-pedometer.vercel.app", href: "https://nothing-pedometer.vercel.app/" },
    extraLinks: [
      { label: "GitHub", href: "https://github.com/damilareoo/nothing-pedometer" },
    ],
    oneLiner:
      "A pedometer that finishes the Nothing story — one tap takes the widget to the run to a shareable poster, all in the system's own language.",
    credits: "Damilare Osofisan",
    quote: "Nothing new to learn; the story just continues.",
    summary: [
      "Nothing OS gives runners a daily count and a weekly view, and a monthly view too dense to read at a glance. The morning run — distance, splits, heart rate, elevation, route — has no home in the system's visual language. Strava answers the data question and abandons the aesthetic: the dot-matrix numerals, the restraint, the single red.",
      "The concept extends the existing widget instead of replacing it. It keeps the device's exact wording, then one tap morphs it into detail, detail into the run, and the run into shareable posters. Nothing new to learn — the story just continues.",
      "Every screen earns its place the honest way: brightness carries meaning so the one red stays rare, every chart states its takeaway in plain words, and the privacy mask shows on the shared artifact itself — not just the screen. What couldn't be real was cut instead of faked: no weather, no invented counts.",
    ],
    sections: [
      {
        k: "Role & Contribution",
        v: "Solo concept. Interaction, motion, visual system, code.",
      },
      {
        k: "What Was Done",
        v: "Widget, detail, run, and share. Tap the widget and it expands into the day, the run replays as a travelling dot with a privacy zone over home, and the run ends as posters in five canvases with real share intents behind every target.",
      },
      {
        k: "How",
        v: "Built from device truth — the wording, the forecast-bar red, the share-sheet anatomy — then held to platform rules: contrast floors, touch targets, reduced-motion fallbacks, and a screen-reader summary for every chart.",
      },
      {
        k: "Proof",
        v: "No formal testing yet, so the bar is structural: comprehension never depends on decoding dots.",
      },
      {
        k: "Note",
        v: "A personal exploration, not a shipped product — Nothing's language is reference only, no affiliation.",
      },
    ],
    gallery: [
      {
        src: "/dossier/explorations/nothing-pedometer/nothing-pedometer-concept.mp4",
        alt: "Nothing pedometer interaction concept film",
        caption: "Concept film",
        note: "Widget to run to poster — the whole story in one tap.",
        kind: "video",
        poster: "/dossier/explorations/nothing-pedometer/nothing-pedometer-poster.png",
      },
      {
        src: "/dossier/explorations/nothing-pedometer/comp-widgets.jpg",
        alt: "Pedometer widget in dark and light",
        caption: "Widgets, both skins",
        note: "The widget in dark and light — same wording, same story.",
      },
      {
        src: "/dossier/explorations/nothing-pedometer/comp-detail.jpg",
        alt: "Detail day, week, and light screens",
        caption: "Detail, day and week",
        note: "One tap expands it — day columns, week columns, light included.",
      },
      {
        src: "/dossier/explorations/nothing-pedometer/comp-run.jpg",
        alt: "Morning run in dark and light",
        caption: "The run, both skins",
        note: "Trace, privacy zone, elevation — dark and light.",
      },
      {
        src: "/dossier/explorations/nothing-pedometer/comp-share.jpg",
        alt: "Share sheet and X post draft",
        caption: "Share",
        note: "The system sheet and the draft — real targets, real intents.",
      },
      {
        src: "/dossier/explorations/nothing-pedometer/comp-canvases.jpg",
        alt: "All five share canvases",
        caption: "Canvases",
        note: "Onyx, bone, signal, volt, dusk run — five canvases, home hidden throughout.",
      },
      {
        src: "/dossier/explorations/nothing-pedometer/comp-targets.jpg",
        alt: "Story and WhatsApp posters",
        caption: "Targets",
        note: "Story and WhatsApp — the poster travels, the caption follows.",
      },
    ],
  },
];

export function findExploration(slug: string) {
  return explorations.find((e) => e.slug === slug);
}
