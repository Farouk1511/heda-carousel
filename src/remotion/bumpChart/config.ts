import type { ThemeName } from "../../data/themes";
import { DEFAULT_LEADERBOARD_CTA } from "../../data/leaderboard/sample";

export type BumpPacing = "fast" | "normal" | "slow";

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
};

/** Merge a partial config over the defaults and clamp the numeric knobs. */
export function resolveBumpConfig(partial?: Partial<BumpReelConfig>): BumpReelConfig {
  const merged = { ...DEFAULT_BUMP_CONFIG, ...partial };
  merged.topN = Math.min(Math.max(Math.round(merged.topN) || 10, 3), 10);
  merged.logoScale = Math.min(Math.max(merged.logoScale || 1, 0.5), 2.5);
  if (!["fast", "normal", "slow"].includes(merged.pacing)) merged.pacing = "normal";
  return merged;
}
