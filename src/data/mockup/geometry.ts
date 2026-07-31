import type {
  DeviceFramePreset,
  FrameGeometry,
  MockupScene,
  ScreenTransform,
} from "./types";

/**
 * The single source of geometric truth for the mockup creator.
 *
 * Both renderers consume these functions and neither does its own arithmetic:
 *  - MockupCanvas (DOM preview) renders at the FULL output size and is scaled
 *    down by MockupStage via `transform: scale()`, so its coordinate space *is*
 *    the export's coordinate space.
 *  - compositeMockup (canvas export) multiplies the same numbers into ctx ops.
 *
 * In particular the media inside the screen is positioned with `fitRect()` in
 * both, never with CSS `object-fit`/`object-position` — those have different
 * percentage semantics once the image overflows its box, which is exactly how
 * preview and export drift apart.
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RoundRect extends Rect {
  radius: number;
}

/** The device body box on the canvas. Frame aspect is always preserved. */
export function frameDrawRect(
  scene: MockupScene,
  frame: Pick<DeviceFramePreset, "naturalW" | "naturalH">,
  canvasW: number,
  canvasH: number
): Rect {
  const h = canvasH * scene.phoneHeight;
  const w = h * (frame.naturalW / frame.naturalH);
  return {
    x: canvasW / 2 - w / 2 + scene.phoneOffsetX * canvasW,
    y: canvasH / 2 - h / 2 + scene.phoneOffsetY * canvasH,
    w,
    h,
  };
}

/** The screen aperture in canvas px, including the bleed and corner radius. */
export function screenRectPx(
  geom: FrameGeometry,
  fr: Rect,
  frame: Pick<DeviceFramePreset, "naturalW">
): RoundRect {
  // frame-native px -> canvas px
  const k = frame.naturalW > 0 ? fr.w / frame.naturalW : 0;
  const bleed = geom.screenInset * k;
  return {
    x: fr.x + geom.screen.x * fr.w - bleed,
    y: fr.y + geom.screen.y * fr.h - bleed,
    w: geom.screen.w * fr.w + bleed * 2,
    h: geom.screen.h * fr.h + bleed * 2,
    radius: geom.screenRadius * fr.w,
  };
}

/** The Dynamic Island pill in canvas px. */
export function islandRectPx(geom: FrameGeometry, fr: Rect): RoundRect {
  const w = geom.island.w * fr.w;
  const h = geom.island.h * fr.h;
  return {
    x: fr.x + geom.island.x * fr.w,
    y: fr.y + geom.island.y * fr.h,
    w,
    h,
    radius: h / 2,
  };
}

/**
 * Where to draw a source image/video so it fills (cover) or fits (contain) the
 * destination rect, then zoomed by `scale` and panned by `offsetX/offsetY`.
 *
 *   s     = (cover ? max(dw/sw, dh/sh) : min(dw/sw, dh/sh)) * scale
 *   drawW = sw * s ;  drawH = sh * s
 *   drawX = dx + (dw - drawW)/2 + offsetX * dw
 *   drawY = dy + (dh - drawH)/2 + offsetY * dh
 */
export function fitRect(
  srcW: number,
  srcH: number,
  dest: Rect,
  t: ScreenTransform
): Rect {
  if (srcW <= 0 || srcH <= 0) return { ...dest };
  const base =
    t.fit === "cover"
      ? Math.max(dest.w / srcW, dest.h / srcH)
      : Math.min(dest.w / srcW, dest.h / srcH);
  const s = base * t.scale;
  const w = srcW * s;
  const h = srcH * s;
  return {
    x: dest.x + (dest.w - w) / 2 + t.offsetX * dest.w,
    y: dest.y + (dest.h - h) / 2 + t.offsetY * dest.h,
    w,
    h,
  };
}

/**
 * Clamp the pan so a `cover` fit can never expose a gap at the screen edge.
 * `contain` pans freely (letterboxing is the point).
 */
export function clampPan(
  srcW: number,
  srcH: number,
  dest: Rect,
  t: ScreenTransform
): { offsetX: number; offsetY: number } {
  if (t.fit === "contain") return { offsetX: t.offsetX, offsetY: t.offsetY };
  const r = fitRect(
    srcW,
    srcH,
    { ...dest, x: 0, y: 0 },
    { ...t, offsetX: 0, offsetY: 0 }
  );
  const maxX = dest.w > 0 ? Math.max(0, (r.w - dest.w) / (2 * dest.w)) : 0;
  const maxY = dest.h > 0 ? Math.max(0, (r.h - dest.h) / (2 * dest.h)) : 0;
  return {
    offsetX: Math.max(-maxX, Math.min(maxX, t.offsetX)),
    offsetY: Math.max(-maxY, Math.min(maxY, t.offsetY)),
  };
}

/**
 * Rounded-rect path with the radius clamped to min(w,h)/2.
 *
 * CSS shrinks an over-large border-radius proportionally, but canvas
 * `roundRect` THROWS on radius > min(w,h)/2 — so a mis-calibrated radius would
 * crash the export while looking merely odd in the preview. Clamping makes both
 * degrade the same way.
 */
export function pathRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
): void {
  const r = Math.max(0, Math.min(radius, Math.min(w, h) / 2));
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  // Fallback for engines without CanvasPath.roundRect.
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Same clamp as pathRoundRect, for the DOM preview's border-radius. */
export function clampRadius(radius: number, w: number, h: number): number {
  return Math.max(0, Math.min(radius, Math.min(w, h) / 2));
}

export const round4 = (n: number): number => Math.round(n * 10000) / 10000;
