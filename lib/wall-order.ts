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
/* 17162 is the seed whose opening reads best. Multicol fills column by column,
   so the top edge is the four column heads rather than the first four tiles
   dealt. Here those heads are the Intempus wordmarks, the Prayer Pause phone,
   the Hitman's Library 404 and the TrieuthCapital gradient: four studios,
   four palettes, no dense UI. On a two-column phone the same seed opens on
   Intempus beside the 404. It was chosen by emulating the browser's column
   balance over 200,000 seeds, keeping only openings where no project repeats
   in the first screen and every column head is a bold plate, then picking
   by eye. Adding or removing a plate moves the column breaks, so the search
   has to be run again whenever the wall changes. The seed matters because
   this edge is the only part of the wall every visitor sees. */
export const WALL_SEED = 17162;

/** How many of the latest picks a project must sit out before it is dealt
    again. Three keeps any two studies of one project at least four tiles
    apart down a column. */
export const RECENT_GAP = 3;

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
  const recent: number[] = [];

  while (out.length < shots.length) {
    /* Candidates are every project with studies left, minus the ones used in
       the last RECENT_GAP picks. The wall is CSS multicol, which fills each
       column top to bottom, so consecutive picks stack vertically. Excluding
       only the previous pick let a nine-plate project land every other tile
       and own a whole column. The window is relaxed from the oldest end when
       nothing else is left, so a group larger than the wall can spread still
       deals rather than stalls. */
    const left = (i: number) => piles[i].length - cursor[i] > 0;
    /* The gap is capped by what the biggest remaining pile can afford: it
       needs `gap` other studies between each of its own, so a wider window
       than that would spend the small projects early and then force the big
       one into a run at the end. */
    const remaining = shots.length - out.length;
    const biggest = Math.max(...piles.map((p, i) => p.length - cursor[i]));
    const affordable = biggest > 1 ? Math.floor((remaining - biggest) / (biggest - 1)) : RECENT_GAP;
    const gap = Math.max(1, Math.min(RECENT_GAP, affordable));
    let candidates: number[] = [];
    for (let w = Math.min(gap, recent.length); w >= 0 && candidates.length === 0; w--) {
      const blocked = recent.slice(recent.length - w);
      candidates = piles.map((_, i) => i).filter((i) => left(i) && !blocked.includes(i));
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
    recent.push(pick);
  }

  return out;
}
