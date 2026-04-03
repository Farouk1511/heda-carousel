export type SceneKind =
  | "hook"
  | "statement"
  | "insight"
  | "product-reveal"
  | "cta";

export type AnimationPreset =
  | "fade-up"
  | "word-reveal"
  | "mask-reveal"
  | "drift-in"
  | "stagger-lines"
  | "scale-bounce";

export type ExitPreset = "fade-out" | "scale-down" | "none";

export type BackgroundVariant =
  | "midnight"
  | "violet-haze"
  | "orbital"
  | "grid-fade";

export type DurationPreset = "8s" | "12s" | "15s" | "20s";

export type ReelTemplate =
  | "hook-insight-cta"
  | "problem-truth-solution-cta"
  | "provocative-reframe-product-cta";

export interface ReelBranding {
  brandName: string;
  logoPath: string;
  accent: string;
  background: string;
  textPrimary: string;
  textSecondary: string;
}

export interface ReelAudioConfig {
  musicTrack?: string;
  voiceoverTrack?: string;
  beatMarkers?: number[];
  startOffsetFrames?: number;
}

export interface ReelScene {
  id: string;
  kind: SceneKind;
  primaryText: string;
  secondaryText?: string;
  emphasisWords?: string[];
  backgroundVariant?: BackgroundVariant;
  animationPreset?: AnimationPreset;
  exitPreset?: ExitPreset;
  durationInFrames?: number;
  durationWeight?: number;
  promptText?: string;
}

export interface TextReel {
  id: string;
  slug: string;
  title: string;
  topic: string;
  template: ReelTemplate;
  durationPreset: DurationPreset;
  scenes: ReelScene[];
  endingCta?: ReelScene;
  branding?: Partial<ReelBranding>;
  audio?: ReelAudioConfig;
}

export interface ResolvedScene extends ReelScene {
  durationInFrames: number;
  backgroundVariant: BackgroundVariant;
  animationPreset: AnimationPreset;
}
