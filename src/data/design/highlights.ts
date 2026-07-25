import type { HighlightStyle } from "./types";

export const HIGHLIGHT_STYLES: { id: HighlightStyle; label: string }[] = [
  { id: "color", label: "Color" },
  { id: "marker", label: "Marker" },
  { id: "gradient", label: "Gradient" },
  { id: "underline", label: "Underline" },
];
