type Exploration =
  | {
      slug: string;
      exhibit: string;
      title: string;
      video: { src: string; poster: string };
      embed?: undefined;
    }
  | {
      slug: string;
      exhibit: string;
      title: string;
      embed: string;
      video?: undefined;
    };

const EXPLORATIONS: Exploration[] = [
  {
    slug: "nothing-pedometer",
    exhibit: "Exploration 01",
    title: "Nothing Pedometer",
    video: {
      src: "/dossier/explorations/nothing-pedometer/nothing-pedometer-concept.mp4",
      poster: "/dossier/explorations/nothing-pedometer/nothing-pedometer-poster.png",
    },
  },
];

/**
 * Explorations rail — one card for now, so no arrows: the transport
 * returns when a second exploration lands. Native swipe still works.
 */
export function ExplorationsRail() {
  return (
    <section aria-label="Explorations" className="mt-12">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-sm font-medium">[Explorations]</h2>
      </div>
      <div className="mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {EXPLORATIONS.map((e, i) => (
          <article
            key={e.slug}
            className="w-[85%] shrink-0 snap-start bg-[#e8e8e6] p-4 ring-1 ring-[#e0e0de]"
          >
            <div className="flex items-baseline justify-between font-mono text-xs uppercase tracking-widest text-[#55534f]">
              <span>{e.exhibit}</span>
              <span aria-hidden>[{String(i + 1).padStart(2, "0")}]</span>
            </div>
            <div className="mt-3 h-64 overflow-hidden sm:h-80">
              {e.video ? (
                <video
                  src={e.video.src}
                  poster={e.video.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={`${e.title} interaction concept film`}
                  className="mx-auto h-full w-full object-cover"
                />
              ) : (
                <iframe
                  src={e.embed}
                  title={`${e.title} — live canvas`}
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  className="h-full w-full border-0 bg-white"
                />
              )}
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-2 font-mono text-xs uppercase tracking-widest text-[#55534f]">
              <span className="truncate">{e.title}</span>
              {e.embed ? (
                <a
                  href={e.embed}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 underline decoration-[#b9b9b6] underline-offset-2"
                >
                  Open live ↗
                </a>
              ) : (
                <span aria-hidden className="shrink-0">
                  Interaction concept
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
