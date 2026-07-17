import { Easing } from "remotion";
import { PLOT_BOTTOM, PLOT_LEFT, PLOT_RIGHT, PLOT_TOP } from "./constants";
import type { BumpPerson } from "./model";
import type { BumpTimeline } from "./timing";

/** Y coordinate of a rank row (rank 1 at the top of the plot). */
export function rowY(rank: number, rowCount: number): number {
  if (rowCount <= 1) return (PLOT_TOP + PLOT_BOTTOM) / 2;
  return PLOT_TOP + ((rank - 1) * (PLOT_BOTTOM - PLOT_TOP)) / (rowCount - 1);
}

/** X coordinate of a day column (day 0 at the left edge of the plot). */
export function dayX(dayIndex: number, dayCount: number): number {
  if (dayCount <= 1) return (PLOT_LEFT + PLOT_RIGHT) / 2;
  return PLOT_LEFT + (dayIndex * (PLOT_RIGHT - PLOT_LEFT)) / (dayCount - 1);
}

const segmentEase = Easing.inOut(Easing.cubic);

/**
 * Continuous "day position" for a chart-local frame: 0 through placement,
 * eased d-1 -> d across segment d, and dayCount-1 from the last segment on.
 * Both the polyline tip and the avatar consume this, so they always agree.
 */
export function dayProgress(
  chartFrame: number,
  dayCount: number,
  t: BumpTimeline
): number {
  if (dayCount <= 1) return 0;
  const raw = (chartFrame - t.segmentsStart) / t.segmentFrames;
  const clamped = Math.min(Math.max(raw, 0), dayCount - 1);
  const base = Math.floor(clamped);
  if (base >= dayCount - 1) return dayCount - 1;
  return base + segmentEase(clamped - base);
}

export interface TipPosition {
  x: number;
  y: number;
}

/** Position of a person's line tip at continuous day position `p`. */
export function positionAt(
  person: BumpPerson,
  p: number,
  rowCount: number,
  dayCount: number
): TipPosition {
  const d0 = Math.floor(p);
  const d1 = Math.min(d0 + 1, dayCount - 1);
  const frac = p - d0;
  const x0 = dayX(d0, dayCount);
  const x1 = dayX(d1, dayCount);
  const y0 = rowY(person.days[d0].rank, rowCount);
  const y1 = rowY(person.days[d1].rank, rowCount);
  return { x: x0 + (x1 - x0) * frac, y: y0 + (y1 - y0) * frac };
}

/** Cumulative step count of a person at continuous day position `p`. */
export function cumulativeAt(person: BumpPerson, p: number): number {
  const d0 = Math.floor(p);
  const d1 = Math.min(d0 + 1, person.days.length - 1);
  const frac = p - d0;
  const c0 = person.days[d0].cumulative;
  const c1 = person.days[d1].cumulative;
  return c0 + (c1 - c0) * frac;
}

/** SVG polyline points for the drawn part of a person's line, tip included. */
export function linePoints(
  person: BumpPerson,
  p: number,
  rowCount: number,
  dayCount: number
): string {
  const pts: string[] = [];
  for (let d = 0; d <= Math.floor(p); d++) {
    pts.push(`${dayX(d, dayCount)},${rowY(person.days[d].rank, rowCount)}`);
  }
  if (p > Math.floor(p)) {
    const tip = positionAt(person, p, rowCount, dayCount);
    pts.push(`${tip.x},${tip.y}`);
  }
  return pts.join(" ");
}
