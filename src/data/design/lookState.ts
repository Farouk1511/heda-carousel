// Helpers shared by every surface that exposes the look controls
// (carousel post styles, leaderboard cards).
import type { PatternId, PostStyleEntry } from "./types";

/** Post/card look with no per-slide overrides */
export type LookStyle = Omit<PostStyleEntry, "slides">;

/** Pattern in effect, honouring the legacy `texture.dotGrid` flag. */
export function resolvePatternId(style: LookStyle | undefined): PatternId {
  return style?.pattern ?? (style?.texture?.dotGrid ? "dots" : "none");
}

/** True when anything in the look differs from the theme defaults. */
export function hasCustomLook(style: LookStyle | undefined): boolean {
  if (!style) return false;
  const t = style.texture;
  return Boolean(
    style.backgroundId ||
      style.highlightStyle ||
      style.accent ||
      resolvePatternId(style) !== "none" ||
      t?.grain ||
      t?.secondOrb ||
      t?.hueJourney ||
      t?.vignette
  );
}

/** Patch that clears every look field (chrome/cover live with the carousel). */
export const RESET_LOOK: LookStyle = {
  backgroundId: undefined,
  highlightStyle: undefined,
  accent: undefined,
  pattern: undefined,
  texture: undefined,
};
