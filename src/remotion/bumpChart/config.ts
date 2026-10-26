import type { ThemeName } from "../../data/themes";
import { DEFAULT_LEADERBOARD_CTA } from "../../data/leaderboard/sample";

export type BumpPacing = "fast" | "normal" | "slow";
/** Output frame: Stories/Reels, feed portrait, or square. */
export type BumpFormat = "9:16" | "4:5" | "1:1";
/** Line colors: rainbow for readability, violet brand shades, or gold/silver/bronze + muted rest. */
export type BumpPalette = "vivid" | "brand" | "podium";
export type BumpLineStyle = "curved" | "straight";
export type BumpLineWeight = "thin" | "regular" | "bold";
/** What rides next to each avatar: name + running steps, name only, or nothing. */
export type BumpLabels = "full" | "name" | "avatar";
/** Who stays bright when the chart dims for the outro. */
export type BumpFocus = "winner" | "podium" | "all";
export type BumpOutroStyle = "champion" | "podium";
/** How long the finished chart holds before the outro. */
export type BumpHold = "short" | "normal" | "long";

/**
 * Everything about the bump-chart video the user can tweak. Flows one way:
 * UI state -> <Player> inputProps -> downloaded render file -> render.ts ->
 * composition. Keep it JSON-serializable.
 */
export interface BumpReelConfig {
  theme: ThemeName;
  /** Intro headline. */
  title: string;
  /** Outro call-to-action line. */
  cta: string;
  /** Per-day segment speed: 30 / 45 / 60 frames. */
  pacing: BumpPacing;
  /** How many people to chart (3-10). */
  topN: number;
  showIntro: boolean;
  showOutro: boolean;
  logoScale: number;
  format: BumpFormat;
  palette: BumpPalette;
  lineStyle: BumpLineStyle;
  lineWeight: BumpLineWeight;
  /** Soft wide stroke under each line. */
  glow: boolean;
  labels: BumpLabels;
  focus: BumpFocus;
  outroStyle: BumpOutroStyle;
  /** Call out the biggest climber in the outro (and keep their line half-lit). */
  showClimber: boolean;
  hold: BumpHold;
}

export const DEFAULT_BUMP_CONFIG: BumpReelConfig = {
  theme: "standard",
  title: "How the week moved",
  cta: DEFAULT_LEADERBOARD_CTA,
  pacing: "normal",
  topN: 10,
  showIntro: true,
  showOutro: true,
  logoScale: 1,
  format: "9:16",
  palette: "vivid",
  lineStyle: "straight",
  lineWeight: "regular",
  glow: true,
  labels: "full",
  focus: "winner",
  outroStyle: "champion",
  showClimber: true,
  hold: "normal",
};

/** Output name shared by the CLI and the dev-server render, e.g. heda_bumpchart_w12_standard_9x16.mp4. */
export function bumpReelFileName(weekSlug: string, config: BumpReelConfig): string {
  return `heda_bumpchart_${weekSlug}_${config.theme}_${config.format.replace(":", "x")}.mp4`;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/** Merge a partial config over the defaults and clamp/validate every knob. */
export function resolveBumpConfig(partial?: Partial<BumpReelConfig>): BumpReelConfig {
  const d = DEFAULT_BUMP_CONFIG;
  const merged = { ...d, ...partial };
  merged.topN = Math.min(Math.max(Math.round(merged.topN) || 10, 3), 10);
  merged.logoScale = Math.min(Math.max(merged.logoScale || 1, 0.5), 2.5);
  merged.pacing = oneOf(merged.pacing, ["fast", "normal", "slow"], d.pacing);
  merged.format = oneOf(merged.format, ["9:16", "4:5", "1:1"], d.format);
  merged.palette = oneOf(merged.palette, ["vivid", "brand", "podium"], d.palette);
  merged.lineStyle = oneOf(merged.lineStyle, ["curved", "straight"], d.lineStyle);
  merged.lineWeight = oneOf(merged.lineWeight, ["thin", "regular", "bold"], d.lineWeight);
  merged.labels = oneOf(merged.labels, ["full", "name", "avatar"], d.labels);
  merged.focus = oneOf(merged.focus, ["winner", "podium", "all"], d.focus);
  merged.outroStyle = oneOf(merged.outroStyle, ["champion", "podium"], d.outroStyle);
  merged.hold = oneOf(merged.hold, ["short", "normal", "long"], d.hold);
  merged.glow = merged.glow !== false;
  merged.showClimber = merged.showClimber !== false;
  return merged;
}
