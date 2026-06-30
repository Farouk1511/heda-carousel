import type { AspectRatio } from "../../hooks/useCarouselState";
import type { LeaderboardEntry } from "./types";

export interface LeaderboardPage {
  entries: LeaderboardEntry[];
  isPrimary: boolean;
  pageIndex: number;
  pageCount: number;
}

/**
 * How many entries fit on each card per aspect ratio.
 * `primary` includes the winner spotlight entry; `cont` is rows-only.
 * 9:16 is tall enough for a top-10 on one image; the squarer 1:1 / 4:5 split
 * into a 2-image carousel.
 */
const CAPACITY: Record<AspectRatio, { primary: number; cont: number }> = {
  "9:16": { primary: 11, cont: 10 },
  "4:5": { primary: 6, cont: 7 },
  "1:1": { primary: 5, cont: 6 },
};

/**
 * Split a ranked list into one or more pages for the given ratio. The first
 * page is the "primary" card (winner spotlight + rows); any overflow goes onto
 * continuation pages (rows only).
 */
export function paginateLeaderboard(
  entries: LeaderboardEntry[],
  ratio: AspectRatio
): LeaderboardPage[] {
  const cap = CAPACITY[ratio];
  const chunks: { entries: LeaderboardEntry[]; isPrimary: boolean }[] = [];

  if (entries.length === 0 || entries.length <= cap.primary) {
    chunks.push({ entries, isPrimary: true });
  } else {
    chunks.push({ entries: entries.slice(0, cap.primary), isPrimary: true });
    let rest = entries.slice(cap.primary);
    while (rest.length) {
      chunks.push({ entries: rest.slice(0, cap.cont), isPrimary: false });
      rest = rest.slice(cap.cont);
    }
  }

  const pageCount = chunks.length;
  return chunks.map((c, i) => ({ ...c, pageIndex: i, pageCount }));
}
