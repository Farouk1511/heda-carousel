import type {
  DeviceFramePreset,
  FrameGeometry,
  MockupScene,
  ScreenTransform,
} from "../data/mockup/types";
import {
  fitRect,
  frameDrawRect,
  islandRectPx,
  pathRoundRect,
  screenRectPx,
} from "../data/mockup/geometry";

/**
 * The single canvas renderer, shared by PNG export and every GIF frame.
 *
 * Deliberately NOT built on html-to-image: that library rasterizes through an
 * SVG <foreignObject>, a genuinely different rasterizer from canvas 2D, so
 * snapshotting the bezel with one and compositing the screen with the other
 * guarantees visible seams. The chrome needs nothing from the DOM anyway —
 * background is fillRect/createLinearGradient, bezel is one drawImage, island
 * is one roundRect, shadow is ctx.shadowBlur (which respects the PNG's alpha).
 *
 * One decoded <img> (~15ms, reused across all N frames) also replaces a
 * 200-600ms toPng per export and sidesteps toPng's silent-blank-output failure
 * mode when a font or nested image isn't ready.
 */

export interface CompositeSource {
  el: CanvasImageSource;
  naturalW: number;
  naturalH: number;
}

export interface CompositeOptions {
  frameImg: CanvasImageSource;
  frame: DeviceFramePreset;
  geom: FrameGeometry;
  scene: MockupScene;
  transform: ScreenTransform;
  source: CompositeSource | null;
  /** Forces a solid backdrop even when scene.background is "none" (GIF). */
  forceBackground?: string;
  /** Debug: outline the computed screen rect and island. */
  overlay?: boolean;
}

const frameImageCache = new Map<string, Promise<HTMLImageElement>>();

/**
 * Decode a frame render once and cache it. Same-origin (/mockups/*.png) so it
 * never taints the canvas — if the asset ever moves to a CDN, toBlob() will
 * start throwing SecurityError and this needs crossOrigin="anonymous" plus CORS
 * headers on the host.
 */
export function loadFrameImage(src: string): Promise<HTMLImageElement> {
  const cached = frameImageCache.get(src);
  if (cached) return cached;
  const p = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error(`Frame asset not found: ${src}`));
    img.src = src;
  }).then(async (img) => {
    try {
      await img.decode();
    } catch {
      /* already loaded; decode() is belt-and-braces */
    }
    return img;
  });
  frameImageCache.set(src, p);
  return p;
}

export function compositeMockup(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  o: CompositeOptions
): void {
  ctx.clearRect(0, 0, w, h);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // 1. Background
  const bg = o.scene.background;
  if (o.forceBackground && bg.type === "none") {
    ctx.fillStyle = o.forceBackground;
    ctx.fillRect(0, 0, w, h);
  } else if (bg.type === "color") {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, w, h);
  } else if (bg.type === "gradient") {
    ctx.fillStyle = linearGradient(ctx, w, h, bg.from, bg.to, bg.angle);
    ctx.fillRect(0, 0, w, h);
  }
  // "none" without forceBackground -> stays transparent

  const fr = frameDrawRect(o.scene, o.frame, w, h);

  ctx.save();
  if (o.scene.phoneRotation) {
    const cx = fr.x + fr.w / 2;
    const cy = fr.y + fr.h / 2;
    ctx.translate(cx, cy);
    ctx.rotate((o.scene.phoneRotation * Math.PI) / 180);
    ctx.translate(-cx, -cy);
  }

  // 2. Bezel PNG (shadow first — it respects the PNG's alpha, so the shadow
  //    takes the phone's silhouette rather than a rectangle).
  if (o.scene.shadow) {
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = fr.w * 0.1;
    ctx.shadowOffsetY = fr.w * 0.045;
  }
  ctx.drawImage(o.frameImg, fr.x, fr.y, fr.w, fr.h);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  const sr = screenRectPx(o.geom, fr, o.frame);

  // 3. Media, clipped to the screen aperture. Drawn ON TOP of the bezel: the
  //    frame render's screen area is opaque, so there is no cutout to fill.
  if (o.source) {
    ctx.save();
    ctx.beginPath();
    pathRoundRect(ctx, sr.x, sr.y, sr.w, sr.h, sr.radius);
    ctx.clip();
    const d = fitRect(o.source.naturalW, o.source.naturalH, sr, o.transform);
    ctx.drawImage(o.source.el, d.x, d.y, d.w, d.h);
    ctx.restore();
  }

  // 4. Dynamic Island — redrawn over the screenshot, which just covered it.
  if (o.geom.islandEnabled) {
    const ir = islandRectPx(o.geom, fr);
    ctx.beginPath();
    pathRoundRect(ctx, ir.x, ir.y, ir.w, ir.h, ir.radius);
    ctx.fillStyle = "#000";
    ctx.fill();
  }

  // 5. Optional glare, clipped to the same aperture.
  if (o.scene.glare) {
    ctx.save();
    ctx.beginPath();
    pathRoundRect(ctx, sr.x, sr.y, sr.w, sr.h, sr.radius);
    ctx.clip();
    const g = ctx.createLinearGradient(sr.x, sr.y, sr.x + sr.w, sr.y + sr.h);
    g.addColorStop(0, "rgba(255,255,255,0.14)");
    g.addColorStop(0.42, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(sr.x, sr.y, sr.w, sr.h);
    ctx.restore();
  }

  if (o.overlay) {
    ctx.strokeStyle = "rgba(255,0,255,0.7)";
    ctx.lineWidth = Math.max(1, w / 400);
    ctx.beginPath();
    pathRoundRect(ctx, sr.x, sr.y, sr.w, sr.h, sr.radius);
    ctx.stroke();
  }

  ctx.restore();
}

function linearGradient(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  from: string,
  to: string,
  angleDeg: number
): CanvasGradient {
  // CSS convention: 0deg points up, angles run clockwise.
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.hypot(w, h) / 2;
  const g = ctx.createLinearGradient(
    cx - Math.cos(rad) * r,
    cy - Math.sin(rad) * r,
    cx + Math.cos(rad) * r,
    cy + Math.sin(rad) * r
  );
  g.addColorStop(0, from);
  g.addColorStop(1, to);
  return g;
}

/** CSS equivalent of `linearGradient`, so the DOM preview matches the canvas. */
export function backgroundCss(
  bg: MockupScene["background"]
): string | undefined {
  if (bg.type === "color") return bg.color;
  if (bg.type === "gradient")
    return `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})`;
  return undefined;
}

/** Create a 2D context configured for the per-frame getImageData readbacks the
 *  GIF encoder does. Without willReadFrequently Chrome keeps the canvas
 *  GPU-backed and every readback is a synchronous GPU->CPU stall. */
export function makeCanvas(
  w: number,
  h: number,
  readFrequently = false
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  const ctx = canvas.getContext("2d", {
    willReadFrequently: readFrequently,
  }) as CanvasRenderingContext2D | null;
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  return { canvas, ctx };
}
