import type {
  LeaderboardData,
  LeaderboardEntry,
  LeaderboardWinner,
} from "./types";

export interface ParseResult {
  data?: LeaderboardData;
  error?: string;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Thousands separators, e.g. 153140 -> "153,140". */
export function formatSteps(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

/**
 * Parse + validate a raw JSON string into LeaderboardData.
 * Returns a friendly error message instead of throwing so the UI can show it.
 */
export function parseLeaderboard(json: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch (e) {
    return { error: `Invalid JSON: ${(e as Error).message}` };
  }

  if (!isObject(raw)) {
    return { error: "Top-level value must be an object." };
  }

  const week = raw.week;
  if (!isObject(week) || typeof week.label !== "string" || !week.label.trim()) {
    return { error: 'Missing "week.label" (a non-empty string).' };
  }

  if (!Array.isArray(raw.leaderboard) || raw.leaderboard.length === 0) {
    return { error: '"leaderboard" must be a non-empty array.' };
  }

  const entries: LeaderboardEntry[] = [];
  for (let i = 0; i < raw.leaderboard.length; i++) {
    const row = raw.leaderboard[i];
    if (!isObject(row)) {
      return { error: `leaderboard[${i}] must be an object.` };
    }
    if (typeof row.name !== "string" || !row.name.trim()) {
      return { error: `leaderboard[${i}].name must be a non-empty string.` };
    }
    if (typeof row.steps !== "number" || !Number.isFinite(row.steps)) {
      return { error: `leaderboard[${i}].steps must be a number.` };
    }
    const rank =
      typeof row.rank === "number" && Number.isFinite(row.rank)
        ? row.rank
        : i + 1;
    const imageUrl =
      typeof row.imageUrl === "string" && row.imageUrl.trim()
        ? row.imageUrl
        : undefined;
    entries.push({ rank, name: row.name, steps: row.steps, imageUrl });
  }

  // Sort by rank ascending (1 first) for a stable render order.
  entries.sort((a, b) => a.rank - b.rank);

  // Use the provided winner, otherwise derive it from the top entry.
  let winner: LeaderboardWinner;
  if (
    isObject(raw.winner) &&
    typeof raw.winner.name === "string" &&
    raw.winner.name.trim() &&
    typeof raw.winner.steps === "number" &&
    Number.isFinite(raw.winner.steps)
  ) {
    winner = { name: raw.winner.name, steps: raw.winner.steps };
  } else {
    winner = { name: entries[0].name, steps: entries[0].steps };
  }

  return {
    data: {
      week: {
        start: typeof week.start === "string" ? week.start : "",
        end: typeof week.end === "string" ? week.end : "",
        label: week.label,
      },
      leaderboard: entries,
      winner,
    },
  };
}

/** Build a filesystem-safe slug from the week (start date or label). */
export function weekSlug(data: LeaderboardData): string {
  const base = data.week.start || data.week.label || "week";
  return base
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
