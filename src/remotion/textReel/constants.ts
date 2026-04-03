import type {
  AnimationPreset,
  BackgroundVariant,
  ReelBranding,
  SceneKind,
} from "./model";

export const TEXT_REEL_FPS = 30;
export const TEXT_REEL_WIDTH = 1080;
export const TEXT_REEL_HEIGHT = 1920;

export const SAFE_AREA = {
  top: 168,
  right: 92,
  bottom: 210,
  left: 92,
} as const;

export const TRANSITION_FRAMES = 22;
export const EXIT_FRAMES = 10;
export const MIN_SCENE_FRAMES = 48;

export const DEFAULT_BRANDING: ReelBranding = {
  brandName: "HEDA",
  logoPath: "LOGO.png",
  accent: "#8A6CFF",
  background: "#090A13",
  textPrimary: "#F3F4FA",
  textSecondary: "#A7ADBE",
};

export const DEFAULT_BG_BY_KIND: Record<SceneKind, BackgroundVariant> = {
  hook: "violet-haze",
  statement: "midnight",
  insight: "grid-fade",
  "product-reveal": "orbital",
  cta: "violet-haze",
};

export const DEFAULT_ANIMATION_BY_KIND: Record<SceneKind, AnimationPreset> = {
  hook: "stagger-lines",
  statement: "fade-up",
  insight: "word-reveal",
  "product-reveal": "drift-in",
  cta: "mask-reveal",
};
