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
];

export const BACKGROUND_GROUPS: { id: BackgroundPreset["group"]; label: string }[] = [
  { id: "dark", label: "Dark" },
  { id: "brand", label: "Brand" },
  { id: "light", label: "Light" },
  { id: "gradient", label: "Gradient" },
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
