import type { PatternId } from "./types";

export const PATTERNS: { id: PatternId; label: string }[] = [
  { id: "none", label: "None" },
  { id: "dots", label: "Dots" },
  { id: "grid", label: "Grid" },
  { id: "lines", label: "Lines" },
  { id: "rings", label: "Rings" },
  { id: "halftone", label: "Halftone" },
  { id: "sparkle", label: "Sparkle" },
  { id: "confetti", label: "Confetti" },
];

/**
 * Scattered decorations, positioned in % so they hold up at 1:1, 4:5 and 9:16.
 * Kept to the edges and the right side, away from the headline block.
 */
export interface Scatter {
  x: number;
  y: number;
  size: number;
  rot: number;
  /** Index into the colour list the renderer passes in */
  c: number;
  shape: "star" | "rect" | "dot" | "tri" | "squiggle";
}

export const SPARKLES: Scatter[] = [
  { x: 84, y: 14, size: 22, rot: 0, c: 0, shape: "star" },
  { x: 74, y: 8, size: 10, rot: 0, c: 1, shape: "star" },
  { x: 90, y: 30, size: 8, rot: 0, c: 1, shape: "star" },
  { x: 8, y: 7, size: 9, rot: 0, c: 1, shape: "star" },
  { x: 88, y: 62, size: 14, rot: 0, c: 0, shape: "star" },
  { x: 80, y: 74, size: 7, rot: 0, c: 1, shape: "star" },
  { x: 60, y: 90, size: 10, rot: 0, c: 0, shape: "star" },
  { x: 6, y: 90, size: 7, rot: 0, c: 1, shape: "star" },
];

export const CONFETTI: Scatter[] = [
  { x: 78, y: 10, size: 12, rot: 20, c: 0, shape: "rect" },
  { x: 90, y: 20, size: 8, rot: 0, c: 1, shape: "dot" },
  { x: 70, y: 5, size: 10, rot: -15, c: 2, shape: "tri" },
  { x: 92, y: 42, size: 16, rot: 10, c: 3, shape: "squiggle" },
  { x: 84, y: 55, size: 9, rot: 45, c: 4, shape: "rect" },
  { x: 6, y: 6, size: 8, rot: 0, c: 3, shape: "dot" },
  { x: 16, y: 4, size: 10, rot: 30, c: 1, shape: "rect" },
  { x: 88, y: 78, size: 11, rot: -20, c: 2, shape: "tri" },
  { x: 72, y: 88, size: 9, rot: 0, c: 0, shape: "dot" },
  { x: 50, y: 94, size: 14, rot: -8, c: 4, shape: "squiggle" },
  { x: 8, y: 94, size: 9, rot: 15, c: 2, shape: "rect" },
];
