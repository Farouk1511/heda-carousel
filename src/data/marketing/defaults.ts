import type { BrandKit, Campaign, Design, DesignSize, TextElement } from "./types";
import { SIZE_PRESETS } from "./sizes";
import { makeDesignSize } from "./resolve";

/** Default brand kit derived from the existing Heda identity (App.css tokens). */
export const LOGO_ASSET_ID = "asset-logo";

export const DEFAULT_BRAND_KIT: BrandKit = {
  id: "brand-default",
  name: "Heda",
  colors: {
    accent: "#705bcf",
    accentLight: "#8b7ad8",
    bg: "#13111a",
    text: "#e8e6f0",
    highlight: "#705bcf",
    palette: ["#705bcf", "#8b7ad8", "#13111a", "#e8e6f0", "#0a0a12"],
  },
  fonts: {
    display: "'Space Grotesk', sans-serif",
    body: "'DM Sans', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  logoAssetId: LOGO_ASSET_ID,
};

function presetSize(id: string): DesignSize {
  const p = SIZE_PRESETS.find((s) => s.id === id);
  if (!p) throw new Error(`Unknown size preset: ${id}`);
  return makeDesignSize(p);
}

/** Fresh default sizes for a new design (the three core social ratios). */
export function defaultSizes(): DesignSize[] {
  return [presetSize("ig-square"), presetSize("ig-portrait"), presetSize("story")];
}

let seedCounter = 0;
export function newId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  seedCounter += 1;
  return `${prefix}-${Date.now()}-${seedCounter}`;
}

export function makeSeedDesign(): Design {
  const headline: TextElement = {
    id: "el-headline",
    type: "text",
    fx: 0.5,
    fy: 0.42,
    rotation: 0,
    opacity: 1,
    overrides: {},
    text: "Your **campaign** headline",
    fontSize: 96,
    fontFamily: "display",
    fontWeight: 800,
    color: "brand:text",
    align: "center",
    lineHeight: 1.05,
    letterSpacing: -0.02,
    maxWidth: 900,
  };
  const sub: TextElement = {
    id: "el-sub",
    type: "text",
    fx: 0.5,
    fy: 0.6,
    rotation: 0,
    opacity: 1,
    overrides: {},
    text: "Design once, export every size.",
    fontSize: 40,
    fontFamily: "body",
    fontWeight: 500,
    color: "brand:accentLight",
    align: "center",
    lineHeight: 1.3,
    letterSpacing: 0,
    maxWidth: 820,
  };
  return {
    id: "design-seed",
    name: "Untitled Design",
    background: { type: "color", color: "brand:bg" },
    sizes: [
      presetSize("ig-square"),
      presetSize("ig-portrait"),
      presetSize("story"),
    ],
    elements: [headline, sub],
  };
}

export function makeSeedCampaign(designId: string): Campaign {
  const now = new Date().toISOString();
  return {
    id: "campaign-seed",
    name: "My First Campaign",
    brandKitId: DEFAULT_BRAND_KIT.id,
    designIds: [designId],
    createdAt: now,
    updatedAt: now,
  };
}
