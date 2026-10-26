export type BackgroundMode = "dark" | "light";
export type BackgroundGroup = "dark" | "brand" | "light" | "gradient" | "vivid";

export interface BackgroundPreset {
  id: string;
  label: string;
  group: BackgroundGroup;
  mode: BackgroundMode;
  /** CSS background for content slides */
  css: string;
  /** CSS background for CTA slides; falls back to the brand gradient */
  ctaCss?: string;
  /** CSS background for the picker chip */
  swatch: string;
  /** Background is saturated purple — accents/dots/highlights switch to white */
  whiteAccents?: boolean;
}

export type SlideVariant = "default" | "stat" | "quote" | "list" | "comparison";

export type HighlightStyle = "color" | "marker" | "gradient" | "underline";

export interface TextureOptions {
  grain?: boolean;
  secondOrb?: boolean;
  /** Legacy: superseded by PostStyleEntry.pattern = "dots"; still honoured when pattern is unset */
  dotGrid?: boolean;
  hueJourney?: boolean;
  vignette?: boolean;
}

/** One repeating/decorative layer painted over the background */
export type PatternId =
  | "none"
  | "dots"
  | "grid"
  | "lines"
  | "rings"
  | "halftone"
  | "sparkle"
  | "confetti";

export type AccentId = "violet" | "coral" | "mint" | "sky" | "sunshine" | "pink";

export interface ChromeOptions {
  swipePill?: boolean;
  progressBar?: boolean;
  ctaButton?: boolean;
  profileRow?: boolean;
}

export interface MockupFrame {
  kind: "phone" | "browser";
  tilt?: boolean;
  glow?: boolean;
}

export interface SlideStyle {
  backgroundId?: string;
  variant?: SlideVariant;
  mockupFrame?: MockupFrame;
}

export interface PostStyleEntry {
  backgroundId?: string;
  highlightStyle?: HighlightStyle;
  /** Highlight / dots / glow colour; default violet */
  accent?: AccentId;
  pattern?: PatternId;
  texture?: TextureOptions;
  chrome?: ChromeOptions;
  coverWatermark?: boolean;
  /** Show the cover series chip (default false — week/day numbering is internal) */
  coverChip?: boolean;
  /** Keyed by slide index; stale indices after content regeneration are ignored */
  slides?: Record<number, SlideStyle>;
}

/** Keyed by post.id */
export type StyleMap = Record<number, PostStyleEntry>;
