import type { ImageElement, ShapeElement, TextElement } from "./types";
import { newId } from "./defaults";

export function makeTextElement(overrides: Partial<TextElement> = {}): TextElement {
  return {
    id: newId("el"),
    type: "text",
    fx: 0.5,
    fy: 0.5,
    rotation: 0,
    opacity: 1,
    overrides: {},
    text: "New text",
    fontSize: 56,
    fontFamily: "display",
    fontWeight: 700,
    color: "brand:text",
    align: "center",
    lineHeight: 1.2,
    letterSpacing: 0,
    maxWidth: 800,
    ...overrides,
  };
}

export function makeImageElement(
  assetId: string,
  naturalRatio: number,
  overrides: Partial<ImageElement> = {}
): ImageElement {
  return {
    id: newId("el"),
    type: "image",
    fx: 0.5,
    fy: 0.5,
    rotation: 0,
    opacity: 1,
    overrides: {},
    assetId,
    w: 480,
    naturalRatio,
    fit: "contain",
    borderRadius: 0,
    shadow: false,
    ...overrides,
  };
}

export function makeShapeElement(overrides: Partial<ShapeElement> = {}): ShapeElement {
  return {
    id: newId("el"),
    type: "shape",
    fx: 0.5,
    fy: 0.5,
    rotation: 0,
    opacity: 1,
    overrides: {},
    shape: "rect",
    w: 400,
    h: 160,
    fill: "brand:accent",
    borderRadius: 24,
    ...overrides,
  };
}
