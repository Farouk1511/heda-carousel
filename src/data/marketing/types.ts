// ---------------------------------------------------------------------------
// Coordinate system
//   - Element POSITION is stored as a fractional center (fx, fy) in [0..1] of
//     the canvas width/height, so a design adapts across aspect ratios.
//   - Element SIZE / typography is stored in "base units" rendered at
//     s = min(w, h) / 1080, generalizing the carousel Card's s = width/400 and
//     keeping type proportionate to the shorter edge on wide banners.
// ---------------------------------------------------------------------------

export type FontSlot = "display" | "body" | "mono";
export type ColorSlot = "accent" | "accentLight" | "bg" | "text" | "highlight";

/** Either a brand-kit token reference ("brand:accent") or a raw hex string. */
export type BrandColorRef = string;

export interface DesignSize {
  id: string; // preset id, or "custom-<uuid>"
  label: string;
  w: number;
  h: number;
  preset?: string; // originating preset id, if any
}

/** Per-size overrides layered on top of an element's base fields. */
export interface ElementOverride {
  fx?: number;
  fy?: number;
  w?: number;
  fontSize?: number;
  rotation?: number;
  hidden?: boolean;
}

export type ElementType = "text" | "image" | "shape";

export interface BaseElement {
  id: string;
  type: ElementType;
  fx: number; // fractional center x [0..1]
  fy: number; // fractional center y [0..1]
  rotation: number; // degrees
  opacity: number; // 0..1
  locked?: boolean;
  overrides: Record<string, ElementOverride>; // keyed by DesignSize.id
}

export interface TextElement extends BaseElement {
  type: "text";
  text: string; // markup string (storage format)
  fontSize: number; // base units
  fontFamily: FontSlot;
  fontWeight: number;
  color: BrandColorRef;
  align: "left" | "center" | "right";
  lineHeight: number; // unitless
  letterSpacing: number; // em
  maxWidth: number; // base units — text wraps within this width
}

export interface ImageElement extends BaseElement {
  type: "image";
  assetId: string;
  w: number; // base units
  naturalRatio?: number; // h / w, for auto height
  fit: "contain" | "cover";
  borderRadius: number; // base units
  shadow: boolean;
}

export interface ShapeElement extends BaseElement {
  type: "shape";
  shape: "rect" | "ellipse" | "line";
  w: number; // base units
  h: number; // base units
  fill: BrandColorRef;
  borderRadius: number; // base units
}

export type CanvasElement = TextElement | ImageElement | ShapeElement;

export interface BrandKit {
  id: string;
  name: string;
  colors: {
    accent: string;
    accentLight: string;
    bg: string;
    text: string;
    highlight: string;
    palette: string[];
  };
  fonts: {
    display: string;
    body: string;
    mono: string;
  };
  logoAssetId?: string;
}

export type DesignBackground =
  | { type: "color"; color: BrandColorRef }
  | { type: "gradient"; gradient: string };

export interface Design {
  id: string;
  name: string;
  templateId?: string;
  background: DesignBackground;
  elements: CanvasElement[]; // array order = z-order (index 0 = back)
  sizes: DesignSize[]; // sizes[0] = primary/base size
}

export interface Campaign {
  id: string;
  name: string;
  brandKitId: string;
  designIds: string[];
  createdAt: string;
  updatedAt: string;
}
