import type { AccentId } from "./types";

export interface AccentPreset {
  id: AccentId;
  label: string;
  /** Highlight colour on dark backgrounds */
  base: string;
  /** Darker tone for light backgrounds (keeps highlight contrast) */
  deep: string;
  /** Softer tone for gradients and chip text on dark backgrounds */
  light: string;
}

export const ACCENTS: AccentPreset[] = [
  { id: "violet", label: "Violet", base: "#705bcf", deep: "#5a45b0", light: "#8b7ad8" },
  { id: "coral", label: "Coral", base: "#ff6b5b", deep: "#d23f2c", light: "#ff9a8c" },
  { id: "mint", label: "Mint", base: "#2ec4a0", deep: "#0f8367", light: "#74e0c5" },
  { id: "sky", label: "Sky", base: "#3fa7ff", deep: "#1769bd", light: "#8ccaff" },
  { id: "sunshine", label: "Sunshine", base: "#ffc233", deep: "#a36c00", light: "#ffdb80" },
  { id: "pink", label: "Pink", base: "#ff5fae", deep: "#c42a78", light: "#ff9fcd" },
];

export function getAccent(id: AccentId | undefined): AccentPreset {
  return ACCENTS.find((a) => a.id === id) ?? ACCENTS[0];
}

/** "#705bcf" -> "112,91,207" for building rgba() strings */
export function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)).join(",");
}
