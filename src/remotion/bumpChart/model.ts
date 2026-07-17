import type { LeaderboardData } from "../../data/leaderboard/types";
import {
  dayLabelsForWeek,
  validateDailySteps,
} from "../../data/leaderboard/daily";
import type { BumpReelConfig } from "./config";

export interface BumpPersonDay {
  /** Steps accumulated from week.start through this day. */
  cumulative: number;
  /** 1-based rank within the charted cohort on this day. */
  rank: number;
}

export interface BumpPerson {
  /** Stable identity: name + input index. */
  key: string;
  name: string;
  imageUrl?: string;
  /** Index into BUMP_COLORS, assigned by final rank. */
  colorIndex: number;
  days: BumpPersonDay[];
  startRank: number;
  finalRank: number;
  /** Recomputed from dailySteps (the video's source of truth). */
  totalSteps: number;
}

export interface BumpChartModel {
  weekLabel: string;
  dayLabels: string[];
  dayCount: number;
  /** Sorted by finalRank ascending; at most config.topN people. */
  people: BumpPerson[];
  rowCount: number;
  winner: BumpPerson;
  /** Largest positive startRank - finalRank, or null if nobody climbed. */
  biggestClimber: BumpPerson | null;
  warnings: string[];
}

/**
 * Pure, deterministic derivation of everything the composition animates.
 * Throws with a friendly message when the data can't drive a bump chart
 * (missing/mismatched dailySteps) — callers surface it in the CLI or as an
 * in-frame error panel.
 *
 * With more entries than config.topN, the top N by recomputed weekly total
 * are charted and daily ranks are computed within that cohort only — someone
 * who dipped below the true top N mid-week still shows, which is fine for
 * this reel.
 */
export function buildBumpChartModel(
  data: LeaderboardData,
  config: BumpReelConfig
): BumpChartModel {
  const validation = validateDailySteps(data);
  if (!validation.ok) throw new Error(validation.error);
  const { dayCount, warnings } = validation;

  const candidates = data.leaderboard.map((entry, inputIndex) => {
    const cumulative: number[] = [];
    let acc = 0;
    for (let d = 0; d < dayCount; d++) {
      acc += entry.dailySteps![d];
      cumulative.push(acc);
    }
    return { entry, inputIndex, cumulative, total: acc };
  });
  candidates.sort((a, b) => b.total - a.total || a.inputIndex - b.inputIndex);
  const cohort = candidates.slice(0, Math.min(config.topN, candidates.length));

  // Per-day ranks. Each day re-sorts the previous day's order by cumulative
  // total; the sort is stable, so exact ties keep the previous day's order
  // and never cause a gratuitous line crossing. Day 0 ties fall back to
  // input order.
  const rankByDay: number[][] = [];
  let order = cohort
    .map((_, i) => i)
    .sort((a, b) => cohort[a].inputIndex - cohort[b].inputIndex);
  for (let d = 0; d < dayCount; d++) {
    order = [...order].sort(
      (a, b) => cohort[b].cumulative[d] - cohort[a].cumulative[d]
    );
    const ranks = new Array<number>(cohort.length);
    order.forEach((cohortIdx, pos) => {
      ranks[cohortIdx] = pos + 1;
    });
    rankByDay.push(ranks);
  }

  const people: BumpPerson[] = cohort
    .map((c, i) => ({
      key: `${c.entry.name}-${c.inputIndex}`,
      name: c.entry.name,
      imageUrl: c.entry.imageUrl,
      colorIndex: 0,
      days: c.cumulative.map((cumulative, d) => ({
        cumulative,
        rank: rankByDay[d][i],
      })),
      startRank: rankByDay[0][i],
      finalRank: rankByDay[dayCount - 1][i],
      totalSteps: c.total,
    }))
    .sort((a, b) => a.finalRank - b.finalRank);
  people.forEach((p, i) => {
    p.colorIndex = i;
  });

  let biggestClimber: BumpPerson | null = null;
  let bestClimb = 0;
  for (const p of people) {
    const climb = p.startRank - p.finalRank;
    // Strict > keeps the earlier (better final rank) person on climb ties.
    if (climb > bestClimb) {
      bestClimb = climb;
      biggestClimber = p;
    }
  }

  return {
    weekLabel: data.week.label,
    dayLabels: dayLabelsForWeek(data.week, dayCount),
    dayCount,
    people,
    rowCount: people.length,
    winner: people[0],
    biggestClimber,
    warnings,
  };
}
