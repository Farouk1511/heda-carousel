import type { BumpPacing, BumpReelConfig } from "./config";

export const INTRO_FRAMES = 75;
export const AXES_FRAMES = 30;
export const PLACE_FRAMES = 30;
export const HOLD_FRAMES = 45;
export const OUTRO_FRAMES = 105;

export const SEGMENT_FRAMES: Record<BumpPacing, number> = {
  fast: 30,
  normal: 45,
  slow: 60,
};

/**
 * The single source of truth for the reel's schedule. "Chart-local" frames
 * are relative to the chart <Sequence>, which starts after the intro and
 * stays mounted through the outro (the outro overlays the dimmed chart).
 */
export interface BumpTimeline {
  introFrames: number;
  /** Composition frame where the chart sequence starts (= introFrames). */
  chartStart: number;
  segmentFrames: number;
  /** Chart-local frame where day-0 avatar placement starts. */
  placeStart: number;
  /** Chart-local frame where day-to-day segments start. */
  segmentsStart: number;
  /** Chart-local frame where the last segment ends. */
  segmentsEnd: number;
  /** Chart-local frame where the post-chart hold ends (outro starts). */
  holdEnd: number;
  outroFrames: number;
  /** Total chart-sequence duration (axes -> hold -> outro). */
  chartFrames: number;
  totalFrames: number;
}

export function getBumpTimeline(dayCount: number, config: BumpReelConfig): BumpTimeline {
  const introFrames = config.showIntro ? INTRO_FRAMES : 0;
  const segmentFrames = SEGMENT_FRAMES[config.pacing];
  const segmentsStart = AXES_FRAMES + PLACE_FRAMES;
  const segmentsEnd = segmentsStart + segmentFrames * Math.max(dayCount - 1, 0);
  const holdEnd = segmentsEnd + HOLD_FRAMES;
  const outroFrames = config.showOutro ? OUTRO_FRAMES : 0;
  const chartFrames = holdEnd + outroFrames;
  return {
    introFrames,
    chartStart: introFrames,
    segmentFrames,
    placeStart: AXES_FRAMES,
    segmentsStart,
    segmentsEnd,
    holdEnd,
    outroFrames,
    chartFrames,
    totalFrames: introFrames + chartFrames,
  };
}

export function getBumpChartDuration(dayCount: number, config: BumpReelConfig): number {
  return getBumpTimeline(dayCount, config).totalFrames;
}
