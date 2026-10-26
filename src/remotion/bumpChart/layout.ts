import { Easing } from "remotion";
import type { BumpGeometry } from "./constants";
import type { BumpPerson } from "./model";
import type { BumpTimeline } from "./timing";

/** Y coordinate of a rank row (rank 1 at the top of the plot). */
export function rowY(rank: number, rowCount: number, g: BumpGeometry): number {
  if (rowCount <= 1) return (g.plotTop + g.plotBottom) / 2;
  return g.plotTop + ((rank - 1) * (g.plotBottom - g.plotTop)) / (rowCount - 1);
}

/** X coordinate of a day column (day 0 at the left edge of the plot). */
export function dayX(dayIndex: number, dayCount: number, g: BumpGeometry): number {
  if (dayCount <= 1) return (g.plotLeft + g.plotRight) / 2;
  return g.plotLeft + (dayIndex * (g.plotRight - g.plotLeft)) / (dayCount - 1);
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

/** Shared line options: where to draw and whether segments are S-curves. */
export interface LineShape {
  geometry: BumpGeometry;
  rowCount: number;
  dayCount: number;
  curved: boolean;
}

const smoothstep = (u: number) => u * u * (3 - 2 * u);

/** Point `frac` of the way along segment d0 -> d0+1 (x linear, y eased when curved). */
function segmentPoint(person: BumpPerson, d0: number, frac: number, s: LineShape): TipPosition {
  const d1 = Math.min(d0 + 1, s.dayCount - 1);
  const x0 = dayX(d0, s.dayCount, s.geometry);
  const x1 = dayX(d1, s.dayCount, s.geometry);
  const y0 = rowY(person.days[d0].rank, s.rowCount, s.geometry);
  const y1 = rowY(person.days[d1].rank, s.rowCount, s.geometry);
  const yFrac = s.curved ? smoothstep(frac) : frac;
  return { x: x0 + (x1 - x0) * frac, y: y0 + (y1 - y0) * yFrac };
}

/** Position of a person's line tip at continuous day position `p`. */
export function positionAt(person: BumpPerson, p: number, s: LineShape): TipPosition {
  const d0 = Math.floor(p);
  return segmentPoint(person, d0, p - d0, s);
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

/** Samples per segment when curved; plenty for a smooth S at 1080px. */
const CURVE_SAMPLES = 16;

/** SVG polyline points for the drawn part of a person's line, tip included. */
export function linePoints(person: BumpPerson, p: number, s: LineShape): string {
  const pts: string[] = [];
  const push = (pt: TipPosition) => pts.push(`${pt.x.toFixed(1)},${pt.y.toFixed(1)}`);
  const whole = Math.floor(p);
  const frac = p - whole;

  push(segmentPoint(person, 0, 0, s));
  for (let d = 0; d <= whole; d++) {
    // Segment d -> d+1 is fully drawn for d < whole, partially for d === whole.
    const end = d < whole ? 1 : frac;
    if (end <= 0) break;
    if (s.curved) {
      const steps = Math.max(1, Math.ceil(CURVE_SAMPLES * end));
      for (let k = 1; k <= steps; k++) push(segmentPoint(person, d, (end * k) / steps, s));
    } else {
      push(segmentPoint(person, d, end, s));
    }
  }
  return pts.join(" ");
}
