/**
 * How the wall is dealt. Kept out of the React component so the default order
 * can be scored as data — the seed is a design decision, not a render detail.
 */

export function projectOf(s: { alt: string; caption?: string }): string {
  return (s.caption ?? s.alt).split("—")[0].trim().toLowerCase();
}

/** The wall's shuffle. Each project keeps its studies in order, but the
 *  projects are dealt out against each other rather than run end to end, so
 *  the grid mixes studios instead of showing seven Vienna tiles in a row and
 *  then seven Intempus ones.
 *
 *  Two rules, both of them about evenness rather than taste:
 *
 *    Deterministic. Random at render would split server from client, so the
 *    seed is written down — same wall for everyone, every visit.
 *
 *    Deal the biggest remaining pile that is not the project you just used.
 *    Largest-first spreads the long groups evenly instead of letting them
 *    clump, and the no-repeat rule is what stops two studies from the same
 *    project landing side by side. It only gives in when the same project is
 *    genuinely the only one left, which is what a group larger than half the
 *    wall would force.
 */
/* 18746 is the seed whose opening reads best. Multicol fills column by column,
   so the top edge is the four column heads rather than the first four tiles
   dealt. Here those heads are the dark Pintours plate, the Mederva portrait,
   the Sylvan library page and the Intempus wordmark: four studios, four
   palettes. The row under them adds the sylvan cover and the TrieuthCapital
   gradient, so the fold keeps moving instead of settling into one tone. The
   seed matters because this edge is the only part of the wall every visitor
   sees. */
export const WALL_SEED = 18746;

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function orderGroups<T extends { alt: string; caption?: string }>(shots: T[], seed = WALL_SEED): T[] {
  const groups = new Map<string, T[]>();
  for (const s of shots) {
    const p = projectOf(s);
    if (!groups.has(p)) groups.set(p, []);
    groups.get(p)!.push(s);
  }

  const piles = [...groups.values()];
  const rand = mulberry32(seed);
  for (let i = piles.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [piles[i], piles[j]] = [piles[j], piles[i]];
  }

  const cursor = new Array<number>(piles.length).fill(0);
  const out: T[] = [];
  let last = -1;

  while (out.length < shots.length) {
    /* Candidates are every project with studies left, minus the one we have
       just used — that exclusion is what stops two studies from the same
       project landing side by side. It is dropped only when the same project
       is genuinely all that remains, which a group of more than half the wall
       would force. */
    let candidates = piles.map((_, i) => i).filter((i) => piles[i].length - cursor[i] > 0 && i !== last);
    if (candidates.length === 0) {
      candidates = piles.map((_, i) => i).filter((i) => piles[i].length - cursor[i] > 0);
    }
    if (candidates.length === 0) break;

    /* Weighted by what each project still has left, so a long group appears
       more often across the wall but never twice in a row. Picking the
       outright biggest every time would be even but mechanical: it opens
       sylvan, intempus, sylvan, intempus... */
    const total = candidates.reduce((n, i) => n + (piles[i].length - cursor[i]), 0);
    let roll = rand() * total;
    let pick = candidates[candidates.length - 1];
    for (const i of candidates) {
      roll -= piles[i].length - cursor[i];
      if (roll <= 0) {
        pick = i;
        break;
      }
    }

    out.push(piles[pick][cursor[pick]++]);
    last = pick;
  }

  return out;
}
