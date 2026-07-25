import type { ThemeName } from "../themes";
import type {
  BackgroundMode,
  ChromeOptions,
  HighlightStyle,
  MockupFrame,
  PostStyleEntry,
  SlideVariant,
  TextureOptions,
} from "./types";
import { BRAND_CTA, getBackground, themeDefaultBackground } from "./backgrounds";

export interface CardDesign {
  mode: BackgroundMode;
  background: string;
  backgroundCTA: string;
  border: string;
  borderCTA: string;
  accent: string;
  accentLight: string;
  /** Color for **bold** runs; differs from accent on light / saturated-purple backgrounds */
  hlColor: string;
  headlineColor: string;
  textColor: string;
  ctaHeadlineColor: string;
  ctaTextColor: string;
  dots: {
    active: string;
    inactive: string;
    ctaActive: string;
    ctaInactive: string;
  };
  chip: { bg: string; border: string; text: string };
  /** Light mode: render a dark chip behind the (light-on-dark) logo */
  logoChip: boolean;
  mockupShadow: string;
  orb: string;
  orbSecondary: string;
  highlightStyle: HighlightStyle;
  texture: Required<TextureOptions>;
  chrome: Required<ChromeOptions>;
  cover: { treatment: boolean; watermark: boolean; chip: boolean };
  variant: SlideVariant;
  mockupFrame?: MockupFrame;
  hueShiftDeg: number;
}

const ACCENT = "#705bcf";
const ACCENT_LIGHT = "#8b7ad8";
const ACCENT_DEEP = "#5a45b0";

const NO_TEXTURE: Required<TextureOptions> = {
  grain: false,
  secondOrb: false,
  dotGrid: false,
  hueJourney: false,
};

const NO_CHROME: Required<ChromeOptions> = {
  swipePill: false,
  progressBar: false,
  ctaButton: false,
  profileRow: false,
};

/**
 * Reproduces the pre-design-system Card/CardDots literals exactly.
 * Remotion reels and any call site that doesn't pass `design` land here.
 */
export function legacyDesign(theme: ThemeName): CardDesign {
  const deep = theme === "deep";
  return {
    mode: "dark",
    background: deep
      ? "#1a1a2e"
      : "linear-gradient(145deg, #13111a 0%, #1c1826 100%)",
    backgroundCTA: deep ? "#705bcf" : BRAND_CTA,
    border: deep
      ? "1px solid rgba(112,91,207,0.2)"
      : "1px solid rgba(112,91,207,0.15)",
    borderCTA: "none",
    accent: ACCENT,
    accentLight: ACCENT_LIGHT,
    hlColor: ACCENT,
    headlineColor: "#f0eef5",
    textColor: "#e8e6f0",
    ctaHeadlineColor: "#fff",
    ctaTextColor: "#fff",
    dots: {
      active: "#705bcf",
      inactive: "rgba(112,91,207,0.25)",
      ctaActive: "#fff",
      ctaInactive: "rgba(255,255,255,0.3)",
    },
    chip: {
      bg: "rgba(112,91,207,0.12)",
      border: "1px solid rgba(112,91,207,0.35)",
      text: "#b3a5ec",
    },
    logoChip: false,
    mockupShadow: deep
      ? "drop-shadow(0 18px 32px rgba(0,0,0,0.35))"
      : "drop-shadow(0 16px 26px rgba(0,0,0,0.24))",
    orb: deep
      ? "radial-gradient(circle, rgba(112,91,207,0.3) 0%, transparent 70%)"
      : "radial-gradient(circle, rgba(112,91,207,0.12) 0%, transparent 70%)",
    orbSecondary: "radial-gradient(circle, rgba(112,91,207,0.18) 0%, transparent 70%)",
    highlightStyle: "color",
    texture: NO_TEXTURE,
    chrome: NO_CHROME,
    cover: { treatment: false, watermark: false, chip: false },
    variant: "default",
    hueShiftDeg: 0,
  };
}

/**
 * Resolve a full CardDesign from theme + persisted post/slide style.
 * Pure — no React, no DOM (safe inside the Remotion bundle).
 * Precedence: slide backgroundId > post backgroundId > theme default.
 */
export function resolveDesign(
  theme: ThemeName,
  style: PostStyleEntry | undefined,
  slideIndex: number
): CardDesign {
  const slideStyle = style?.slides?.[slideIndex];
  const preset =
    getBackground(slideStyle?.backgroundId) ??
    getBackground(style?.backgroundId) ??
    themeDefaultBackground(theme);
  const light = preset.mode === "light";
  const white = !!preset.whiteAccents;

  const hlColor = white ? "#fff" : light ? ACCENT_DEEP : ACCENT;
  const dotBase = white ? "255,255,255" : light ? "90,69,176" : "112,91,207";

  return {
    mode: preset.mode,
    background: preset.css,
    backgroundCTA: preset.ctaCss ?? BRAND_CTA,
    border: white
      ? "1px solid rgba(255,255,255,0.18)"
      : light
        ? "1px solid rgba(90,69,176,0.18)"
        : "1px solid rgba(112,91,207,0.2)",
    borderCTA: "none",
    accent: ACCENT,
    accentLight: ACCENT_LIGHT,
    hlColor,
    headlineColor: white ? "#fff" : light ? "#191622" : "#f0eef5",
    textColor: white ? "#f4f1ff" : light ? "#2a2438" : "#e8e6f0",
    ctaHeadlineColor: "#fff",
    ctaTextColor: "#fff",
    dots: {
      active: white ? "#fff" : light ? ACCENT_DEEP : ACCENT,
      inactive: `rgba(${dotBase},${white ? 0.35 : 0.25})`,
      ctaActive: "#fff",
      ctaInactive: "rgba(255,255,255,0.3)",
    },
    chip: white
      ? {
          bg: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.35)",
          text: "#fff",
        }
      : light
        ? {
            bg: "rgba(90,69,176,0.08)",
            border: "1px solid rgba(90,69,176,0.3)",
            text: ACCENT_DEEP,
          }
        : {
            bg: "rgba(112,91,207,0.12)",
            border: "1px solid rgba(112,91,207,0.35)",
            text: "#b3a5ec",
          },
    logoChip: light,
    mockupShadow: light
      ? "drop-shadow(0 14px 24px rgba(38,28,80,0.18))"
      : "drop-shadow(0 18px 32px rgba(0,0,0,0.35))",
    orb: white
      ? "radial-gradient(circle, rgba(255,255,255,0.16) 0%, transparent 70%)"
      : light
        ? "radial-gradient(circle, rgba(112,91,207,0.18) 0%, transparent 70%)"
        : "radial-gradient(circle, rgba(112,91,207,0.3) 0%, transparent 70%)",
    orbSecondary: white
      ? "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)"
      : light
        ? "radial-gradient(circle, rgba(112,91,207,0.12) 0%, transparent 70%)"
        : "radial-gradient(circle, rgba(112,91,207,0.18) 0%, transparent 70%)",
    highlightStyle: style?.highlightStyle ?? "color",
    texture: { ...NO_TEXTURE, ...style?.texture },
    chrome: {
      swipePill: style?.chrome?.swipePill ?? true,
      progressBar: style?.chrome?.progressBar ?? false,
      ctaButton: style?.chrome?.ctaButton ?? true,
      profileRow: style?.chrome?.profileRow ?? true,
    },
    cover: {
      treatment: true,
      watermark: style?.coverWatermark ?? true,
      chip: style?.coverChip ?? false,
    },
    variant: slideStyle?.variant ?? "default",
    mockupFrame: slideStyle?.mockupFrame,
    hueShiftDeg: style?.texture?.hueJourney ? slideIndex * 6 : 0,
  };
}
