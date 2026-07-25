import type {
  BrandColorRef,
  BrandKit,
  CanvasElement,
  DesignBackground,
  DesignSize,
  FontSlot,
} from "./types";

const BRAND_PREFIX = "brand:";

/** Resolve a color reference ("brand:accent" | hex) against a brand kit. */
export function resolveColor(ref: BrandColorRef, brand: BrandKit): string {
  if (ref.startsWith(BRAND_PREFIX)) {
    const slot = ref.slice(BRAND_PREFIX.length) as keyof BrandKit["colors"];
    const val = brand.colors[slot];
    if (typeof val === "string") return val;
  }
  return ref;
}

export function resolveFont(slot: FontSlot, brand: BrandKit): string {
  return brand.fonts[slot];
}

export function resolveBackground(bg: DesignBackground, brand: BrandKit): string {
  if (bg.type === "gradient") return bg.gradient;
  return resolveColor(bg.color, brand);
}

/** Merge an element's per-size override (except `hidden`) onto its base fields. */
export function resolveElement<T extends CanvasElement>(el: T, sizeId: string): T {
  const ov = el.overrides[sizeId];
  if (!ov) return el;
  const { hidden: _hidden, ...rest } = ov;
  return { ...el, ...rest } as T;
}

export function isHidden(el: CanvasElement, sizeId: string): boolean {
  return Boolean(el.overrides[sizeId]?.hidden);
}

/** Scale factor from base units to output pixels for a given size. */
export function sizeScale(size: DesignSize): number {
  return Math.min(size.w, size.h) / 1080;
}

export function makeDesignSize(preset: {
  id: string;
  label: string;
  w: number;
  h: number;
}): DesignSize {
  return {
    id: preset.id,
    label: preset.label,
    w: preset.w,
    h: preset.h,
    preset: preset.id,
  };
}
