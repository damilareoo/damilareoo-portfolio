/**
 * A word that drops its vinyl. Hover (fine pointers only) pops a sleeve
 * above the word; the disc — the album art clipped round with a spindle
 * hole — slides out and spins while you stay. Pure CSS: touch and no-JS
 * readers keep plain sheened text, reduced motion keeps it parked.
 */
export function Vinyl({ word, cover, sheen }: { word: string; cover: string; sheen: string }) {
  return (
    <span className="group/vinyl relative inline-block">
      <span className={`link-sheen ${sheen} cursor-pointer`}>{word}</span>
      <span aria-hidden className="vinyl-pop">
        <span className="vinyl-sleeve" style={{ backgroundImage: `url(${cover})` }} />
        <span className="vinyl-disc" style={{ backgroundImage: `url(${cover})` }} />
      </span>
    </span>
  );
}

/**
 * A word that badges its club. Same hover popover choreography as vinyl,
 * but the crest sits still on a white card — no disc, no spin. Chelsea
 * for football.
 */
export function Badge({ word, cover }: { word: string; cover: string }) {
  return (
    <span className="group/vinyl relative inline-block">
      <span className="link-sheen sheen-chelsea cursor-pointer">{word}</span>
      <span aria-hidden className="vinyl-pop">
        <span className="badge-crest" style={{ backgroundImage: `url(${cover})` }} />
      </span>
    </span>
  );
}
