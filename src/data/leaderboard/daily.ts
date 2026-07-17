/**
 * Day-span helpers + validation for per-day leaderboard data (`dailySteps`).
 *
 * Shared by the app UI, the Remotion bump-chart composition, and render.ts,
 * so it must stay free of Remotion and browser-only imports. All date math is
 * pinned to UTC so day labels don't shift on local timezones.
 */
import type { LeaderboardData, LeaderboardWeek } from "./types";

export const MIN_DAY_COUNT = 2;
export const MAX_DAY_COUNT = 14;

const DAY_MS = 24 * 60 * 60 * 1000;

function parseUtcDate(value: string | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Inclusive day span of week.start..week.end, or null when dates are unusable. */
export function rawDaySpan(week: LeaderboardWeek): number | null {
  const start = parseUtcDate(week.start);
  const end = parseUtcDate(week.end);
  if (!start || !end) return null;
  const diff = Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;
  return diff >= 1 ? diff : null;
}

/** Day count used everywhere (labels, timing, geometry). Falls back to 7. */
export function dayCountForWeek(week: LeaderboardWeek): number {
  const span = rawDaySpan(week);
  if (span === null) return 7;
  return Math.min(Math.max(span, MIN_DAY_COUNT), MAX_DAY_COUNT);
}

const LABEL_FORMAT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  day: "numeric",
  timeZone: "UTC",
});

/** Short label per day, e.g. ["Mon 22", "Tue 23", …]; ["Day 1", …] fallback. */
export function dayLabelsForWeek(week: LeaderboardWeek, dayCount: number): string[] {
  const start = parseUtcDate(week.start);
  return Array.from({ length: dayCount }, (_, i) => {
    if (!start) return `Day ${i + 1}`;
    const parts = LABEL_FORMAT.formatToParts(new Date(start.getTime() + i * DAY_MS));
    const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
    const day = parts.find((p) => p.type === "day")?.value ?? "";
    return `${weekday} ${day}`.trim() || `Day ${i + 1}`;
  });
}

export type DailyValidation =
  | { ok: true; dayCount: number; warnings: string[] }
  | { ok: false; error: string };

/**
 * Hard gate for the bump-chart video: every entry needs a `dailySteps` array
 * matching the week's day span. `steps` totals are NOT enforced — the video
 * trusts `dailySteps` and recomputes cumulatives — but a noticeable mismatch
 * is surfaced as a warning so bad pastes don't go unseen.
 */
export function validateDailySteps(data: LeaderboardData): DailyValidation {
  const span = rawDaySpan(data.week);
  if (span !== null && (span < MIN_DAY_COUNT || span > MAX_DAY_COUNT)) {
    return {
      ok: false,
      error: `week.start..week.end spans ${span} days; the bump reel supports ${MIN_DAY_COUNT}-${MAX_DAY_COUNT}.`,
    };
  }
  const dayCount = span ?? 7;

  const warnings: string[] = [];
  for (const entry of data.leaderboard) {
    const daily = entry.dailySteps;
    if (!daily || daily.length === 0) {
      return {
        ok: false,
        error: `"${entry.name}" has no dailySteps — the bump reel needs per-day data for every entry.`,
      };
    }
    if (daily.length !== dayCount) {
      return {
        ok: false,
        error: `"${entry.name}" has ${daily.length} dailySteps values but the week spans ${dayCount} days.`,
      };
    }
    if (daily.some((v) => typeof v !== "number" || !Number.isFinite(v) || v < 0)) {
      return {
        ok: false,
        error: `"${entry.name}" has invalid dailySteps — every value must be a non-negative number.`,
      };
    }
    const sum = daily.reduce((a, b) => a + b, 0);
    const tolerance = Math.max(entry.steps * 0.01, 250);
    if (Math.abs(sum - entry.steps) > tolerance) {
      warnings.push(
        `"${entry.name}": dailySteps sum to ${Math.round(sum)} but steps is ${entry.steps} — the video will use the dailySteps total.`
      );
    }
  }

  return { ok: true, dayCount, warnings };
}
