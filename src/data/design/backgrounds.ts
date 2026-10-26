import type { BackgroundPreset } from "./types";
import type { ThemeName } from "../themes";

const BRAND_CTA = "linear-gradient(135deg, #705bcf 0%, #5a45b0 100%)";

export const BACKGROUNDS: BackgroundPreset[] = [
  // ── dark solids ──────────────────────────────────────────────
  {
    id: "ink",
    label: "Ink",
    group: "dark",
    mode: "dark",
    css: "#0e0d14",
    swatch: "#0e0d14",
  },
  {
    id: "midnight",
    label: "Midnight",
    group: "dark",
    mode: "dark",
    css: "#1a1a2e",
    swatch: "#1a1a2e",
  },
  {
    id: "plum",
    label: "Plum",
    group: "dark",
    mode: "dark",
    css: "#191622",
    swatch: "#191622",
  },
  {
    id: "indigo",
    label: "Indigo",
    group: "dark",
    mode: "dark",
    css: "#161430",
    swatch: "#161430",
  },
  {
    id: "aubergine",
    label: "Aubergine",
    group: "dark",
    mode: "dark",
    css: "#1f1330",
    swatch: "#1f1330",
  },
  {
    id: "deep-sea",
    label: "Deep sea",
    group: "dark",
    mode: "dark",
    css: "#0d1526",
    swatch: "#0d1526",
  },
  // ── brand solids ─────────────────────────────────────────────
  {
    id: "violet-core",
    label: "Violet core",
    group: "brand",
    mode: "dark",
    css: "#705bcf",
    // CTA must still read against a full-purple carousel
    ctaCss: "linear-gradient(135deg, #3d2f7a 0%, #2a2150 100%)",
    swatch: "#705bcf",
    whiteAccents: true,
  },
  {
    id: "royal",
    label: "Royal",
    group: "brand",
    mode: "dark",
    css: "#2a2150",
    swatch: "#2a2150",
  },
  {
    id: "pulse",
    label: "Pulse",
    group: "brand",
    mode: "dark",
    css: "#241a3f",
    swatch: "#241a3f",
  },
  // ── light ────────────────────────────────────────────────────
  {
    id: "lavender-paper",
    label: "Lavender paper",
    group: "light",
    mode: "light",
    css: "#f4f2fb",
    swatch: "#f4f2fb",
  },
  {
    id: "lilac",
    label: "Lilac",
    group: "light",
    mode: "light",
    css: "#e9e4f8",
    swatch: "#e9e4f8",
  },
  {
    id: "cloud",
    label: "Cloud",
    group: "light",
    mode: "light",
    css: "#fbfaff",
    swatch: "#fbfaff",
  },
  {
    id: "peach",
    label: "Peach",
    group: "light",
    mode: "light",
    css: "#fdeee6",
    swatch: "#fdeee6",
  },
  {
    id: "mint-cream",
    label: "Mint cream",
    group: "light",
    mode: "light",
    css: "#e7f6f0",
    swatch: "#e7f6f0",
  },
  {
    id: "periwinkle",
    label: "Periwinkle",
    group: "light",
    mode: "light",
    css: "#e1e3fb",
    swatch: "#e1e3fb",
  },
  {
    id: "butter",
    label: "Butter",
    group: "light",
    mode: "light",
    css: "#fcf6df",
    swatch: "#fcf6df",
  },
  // ── gradients & glows ────────────────────────────────────────
  {
    id: "standard-gradient",
    label: "Standard",
    group: "gradient",
    mode: "dark",
    css: "linear-gradient(145deg, #13111a 0%, #1c1826 100%)",
    swatch: "linear-gradient(145deg, #13111a 0%, #1c1826 100%)",
  },
  {
    id: "violet-drift",
    label: "Violet drift",
    group: "gradient",
    mode: "dark",
    css: "linear-gradient(160deg, #0f0d17 0%, #241d38 100%)",
    swatch: "linear-gradient(160deg, #0f0d17 0%, #241d38 100%)",
  },
  {
    id: "brand-fade",
    label: "Brand fade",
    group: "gradient",
    mode: "dark",
    css: "linear-gradient(135deg, #705bcf 0%, #4a3795 100%)",
    ctaCss: "linear-gradient(135deg, #3d2f7a 0%, #2a2150 100%)",
    swatch: "linear-gradient(135deg, #705bcf 0%, #4a3795 100%)",
    whiteAccents: true,
  },
  {
    id: "duotone-rise",
    label: "Duotone rise",
    group: "gradient",
    mode: "dark",
    css: "linear-gradient(135deg, #2a2150 0%, #705bcf 100%)",
    ctaCss: "linear-gradient(135deg, #3d2f7a 0%, #2a2150 100%)",
    swatch: "linear-gradient(135deg, #2a2150 0%, #705bcf 100%)",
    whiteAccents: true,
  },
  {
    id: "corner-bloom",
    label: "Corner bloom",
    group: "gradient",
    mode: "dark",
    css: "radial-gradient(circle at 85% 12%, rgba(112,91,207,0.45) 0%, transparent 55%), #12101a",
    swatch:
      "radial-gradient(circle at 85% 12%, rgba(112,91,207,0.6) 0%, transparent 60%), #12101a",
  },
  {
    id: "mesh-glow",
    label: "Mesh glow",
    group: "gradient",
    mode: "dark",
    css: "radial-gradient(circle at 20% 25%, rgba(112,91,207,0.42) 0%, transparent 52%), radial-gradient(circle at 80% 78%, rgba(64,52,150,0.55) 0%, transparent 55%), radial-gradient(circle at 78% 18%, rgba(190,120,220,0.16) 0%, transparent 45%), #100e18",
    swatch:
      "radial-gradient(circle at 25% 25%, rgba(112,91,207,0.6) 0%, transparent 55%), radial-gradient(circle at 75% 75%, rgba(64,52,150,0.7) 0%, transparent 55%), #100e18",
  },
  // ── vivid: louder, more playful fills ───────────────────────
  {
    id: "aurora",
    label: "Aurora",
    group: "vivid",
    mode: "dark",
    css: "radial-gradient(circle at 18% 18%, rgba(46,196,160,0.32) 0%, transparent 48%), radial-gradient(circle at 85% 28%, rgba(255,95,174,0.26) 0%, transparent 46%), radial-gradient(circle at 55% 95%, rgba(112,91,207,0.55) 0%, transparent 55%), #0c0b14",
    swatch:
      "radial-gradient(circle at 20% 20%, rgba(46,196,160,0.6) 0%, transparent 55%), radial-gradient(circle at 85% 30%, rgba(255,95,174,0.5) 0%, transparent 50%), radial-gradient(circle at 55% 95%, rgba(112,91,207,0.8) 0%, transparent 60%), #0c0b14",
  },
  {
    id: "spotlight",
    label: "Spotlight",
    group: "vivid",
    mode: "dark",
    css: "radial-gradient(ellipse 85% 55% at 50% 0%, rgba(139,122,216,0.5) 0%, transparent 70%), #0b0a12",
    swatch: "radial-gradient(ellipse 90% 60% at 50% 0%, rgba(139,122,216,0.7) 0%, transparent 72%), #0b0a12",
  },
  {
    id: "twilight",
    label: "Twilight",
    group: "vivid",
    mode: "dark",
    css: "linear-gradient(180deg, #140f2e 0%, #35257a 58%, #7b5bd6 100%)",
    ctaCss: "linear-gradient(135deg, #3d2f7a 0%, #2a2150 100%)",
    swatch: "linear-gradient(180deg, #140f2e 0%, #35257a 58%, #7b5bd6 100%)",
    whiteAccents: true,
  },
  {
    id: "sunset",
    label: "Sunset",
    group: "vivid",
    mode: "dark",
    css: "linear-gradient(160deg, #241543 0%, #6d2f7e 55%, #e0706b 100%)",
    ctaCss: "linear-gradient(135deg, #6d2f7e 0%, #241543 100%)",
    swatch: "linear-gradient(160deg, #241543 0%, #6d2f7e 55%, #e0706b 100%)",
    whiteAccents: true,
  },
  {
    id: "split",
    label: "Split",
    group: "vivid",
    mode: "dark",
    css: "linear-gradient(160deg, #705bcf 0%, #705bcf 52%, #2a2150 52%, #2a2150 100%)",
    ctaCss: "linear-gradient(135deg, #3d2f7a 0%, #2a2150 100%)",
    swatch: "linear-gradient(160deg, #705bcf 0%, #705bcf 52%, #2a2150 52%, #2a2150 100%)",
    whiteAccents: true,
  },
  {
    id: "candy",
    label: "Candy",
    group: "vivid",
    mode: "light",
    css: "linear-gradient(135deg, #fde4f1 0%, #e6defc 100%)",
    swatch: "linear-gradient(135deg, #fbcfe5 0%, #d9ccfb 100%)",
  },
  {
    id: "sky-wash",
    label: "Sky wash",
    group: "vivid",
    mode: "light",
    css: "linear-gradient(165deg, #e1ecff 0%, #f1eaff 100%)",
    swatch: "linear-gradient(165deg, #cfe0ff 0%, #e6dcff 100%)",
  },
  {
    id: "holo",
    label: "Holo",
    group: "vivid",
    mode: "light",
    css: "radial-gradient(circle at 12% 18%, rgba(255,156,203,0.45) 0%, transparent 45%), radial-gradient(circle at 88% 22%, rgba(133,199,255,0.45) 0%, transparent 45%), radial-gradient(circle at 60% 92%, rgba(111,224,196,0.4) 0%, transparent 50%), #f6f4ff",
    swatch:
      "radial-gradient(circle at 15% 20%, rgba(255,156,203,0.8) 0%, transparent 50%), radial-gradient(circle at 85% 25%, rgba(133,199,255,0.8) 0%, transparent 50%), radial-gradient(circle at 60% 90%, rgba(111,224,196,0.7) 0%, transparent 55%), #f6f4ff",
  },
];

export const BACKGROUND_GROUPS: { id: BackgroundPreset["group"]; label: string }[] = [
  { id: "dark", label: "Dark" },
  { id: "brand", label: "Brand" },
  { id: "light", label: "Light" },
  { id: "gradient", label: "Gradient" },
  { id: "vivid", label: "Vivid" },
];

export function getBackground(id: string | undefined): BackgroundPreset | undefined {
  if (!id) return undefined;
  return BACKGROUNDS.find((b) => b.id === id);
}

/** Preset that reproduces the pre-preset visuals for a theme */
export function themeDefaultBackground(theme: ThemeName): BackgroundPreset {
  const id = theme === "deep" ? "midnight" : "standard-gradient";
  return BACKGROUNDS.find((b) => b.id === id)!;
}

export { BRAND_CTA };
