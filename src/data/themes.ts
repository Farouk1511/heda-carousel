export type ThemeName = "standard" | "deep";

export interface ThemeTokens {
  accent: string;
  accentLight: string;
  accentGlow: string;
  bgCard: string;
  bgCardCta: string;
  text: string;
  textHeadline: string;
  textSub: number; // opacity
  hlColor: string;
  ctaText: string;
  ctaDotInactive: string;
  ctaDotActive: string;
  dotInactive: string;
  dotActive: string;
  orbGradient: string;
}

export const THEMES: Record<ThemeName, ThemeTokens> = {
  standard: {
    accent: "#705bcf",
    accentLight: "#8b7ad8",
    accentGlow: "rgba(112, 91, 207, 0.3)",
    bgCard: "linear-gradient(145deg, #13111a 0%, #1c1826 100%)",
    bgCardCta: "linear-gradient(135deg, #705bcf 0%, #5a45b0 100%)",
    text: "#e8e6f0",
    textHeadline: "#f0eef5",
    textSub: 0.75,
    hlColor: "#705bcf",
    ctaText: "#fff",
    ctaDotInactive: "rgba(255,255,255,0.3)",
    ctaDotActive: "#fff",
    dotInactive: "rgba(112,91,207,0.25)",
    dotActive: "#705bcf",
    orbGradient: "radial-gradient(circle, rgba(112,91,207,0.12) 0%, transparent 70%)",
  },
  deep: {
    accent: "#705bcf",
    accentLight: "#8b7ad8",
    accentGlow: "rgba(112, 91, 207, 0.3)",
    bgCard: "#1a1a2e",
    bgCardCta: "#705bcf",
    text: "#e8e6f0",
    textHeadline: "#f0eef5",
    textSub: 0.75,
    hlColor: "#705bcf",
    ctaText: "#fff",
    ctaDotInactive: "rgba(255,255,255,0.3)",
    ctaDotActive: "#fff",
    dotInactive: "rgba(112,91,207,0.25)",
    dotActive: "#705bcf",
    orbGradient: "radial-gradient(circle, rgba(112,91,207,0.3) 0%, transparent 70%)",
  },
};
