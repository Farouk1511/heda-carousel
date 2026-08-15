import { GIFEncoder, applyPalette, quantize } from "gifenc";
import type {
  DeviceFramePreset,
  FrameGeometry,
  MockupScene,
  PaletteMode,
  ScreenTransform,
  VideoTrim,
} from "../data/mockup/types";
import { compositeMockup, makeCanvas } from "./mockupRender";
import {
  openVideoForExtraction,
  planFrameTimes,
  scaleToMaxEdge,
  seekAndSettle,
} from "./videoFrames";

// Re-exported so existing callers keep importing frame helpers from here.
export { openVideoForExtraction, seekAndSettle } from "./videoFrames";

/**
 * Video -> GIF, entirely in the browser.
 *
 * GIF stores its inter-frame delay as a 16-bit integer in CENTISECONDS, and
 * gifenc's writeFrame takes `delay` in ms and does Math.round(delay / 10)
 * (verified in node_modules/gifenc/src/index.js:100). So only fps values where
 * 100/fps is a whole number play back at true speed.
 *
 * 15fps is deliberately absent: 100/15 = 6.67 -> rounds to 7cs -> the GIF plays
 * at 14.3fps, a 4.7% drift. And delays below 2cs get clamped up to 10cs by
 * several renderers, which makes 25fps the practical ceiling.
 */
export const GIF_FPS_OPTIONS = [10, 12.5, 20, 25] as const;
export const GIF_MAX_EDGE_OPTIONS = [360, 480, 640, 800] as const;
export const GIF_MAX_FRAMES = 160;
export const GIF_MAX_DURATION_SEC = 12;
/** Frames sampled to build the shared palette. */
export const GIF_PALETTE_SAMPLES = 12;
/** Warn the user above this output size. */
export const GIF_LARGE_BYTES = 15 * 1024 * 1024;

export const gifDelayCs = (fps: number): number => Math.round(100 / fps);
export const gifDelayMs = (fps: number): number => gifDelayCs(fps) * 10;

export interface GifProgress {
  phase: "preparing" | "sampling" | "encoding" | "finalizing";
  frame: number;
  totalFrames: number;
}

export interface GifRenderRequest {
  /** blob: object URL. A data: URL seeks badly in Chrome — don't pass one. */
  videoUrl: string;
  frameImg: CanvasImageSource;
  frame: DeviceFramePreset;
  geom: FrameGeometry;
  scene: MockupScene;
  transform: ScreenTransform;
  /** Canvas size the scene is composed against; capped by maxEdge for output. */
  outW: number;
  outH: number;
  maxEdge: number;
  trim: VideoTrim;
  fps: number;
  palette: PaletteMode;
  loop: boolean;
  /** Solid colour used when the scene background is transparent. */
  flattenColor?: string;
}

function aborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
}

export function gifOutputSize(
  canvasW: number,
  canvasH: number,
  maxEdge: number
): { w: number; h: number } {
  return scaleToMaxEdge(canvasW, canvasH, maxEdge);
}

/** Frame timestamps plus the GIF-specific delay, using the shared planner. */
export function planGifFrames(
  trim: VideoTrim,
  fps: number,
  videoDuration: number
): { times: number[]; delayCs: number; delayMs: number; clamped: boolean } {
  const plan = planFrameTimes(
    trim,
    fps,
    videoDuration,
    GIF_MAX_DURATION_SEC,
    GIF_MAX_FRAMES
  );
  return {
    times: plan.times,
    delayCs: gifDelayCs(fps),
    delayMs: gifDelayMs(fps),
    clamped: plan.clamped,
  };
}

const yieldToUi = () => new Promise((r) => setTimeout(r, 0));

export async function exportMockupGif(
  req: GifRenderRequest,
  onProgress: (p: GifProgress) => void,
  signal?: AbortSignal
): Promise<Blob> {
  aborted(signal);
  onProgress({ phase: "preparing", frame: 0, totalFrames: 0 });

  const video = await openVideoForExtraction(req.videoUrl);
  const duration = Number.isFinite(video.duration) ? video.duration : 0;
  const { times, delayMs } = planGifFrames(req.trim, req.fps, duration);
  const total = times.length;

  const { w: outW, h: outH } = gifOutputSize(req.outW, req.outH, req.maxEdge);
  const { canvas, ctx } = makeCanvas(outW, outH, true);

  const source = {
    el: video as CanvasImageSource,
    naturalW: video.videoWidth,
    naturalH: video.videoHeight,
  };
  // The composite runs at GIF resolution, not export resolution — every rect
  // comes from normalized geometry, so it scales exactly.
  const scene = { ...req.scene };
  const draw = () =>
    compositeMockup(ctx, outW, outH, {
      frameImg: req.frameImg,
      frame: req.frame,
      geom: req.geom,
      scene,
      transform: req.transform,
      source,
      forceBackground: req.flattenColor ?? "#ffffff",
    });

  const enc = GIFEncoder();
  let sharedPalette: number[][] | null = null;

  if (req.palette === "shared") {
    // Build one palette from a strided sample rather than a single frame, so a
    // clip that changes colour mid-way doesn't band. Sampling at half linear
    // scale keeps the concatenated buffer to a quarter of the area per frame.
    onProgress({ phase: "sampling", frame: 0, totalFrames: total });
    const step = Math.max(1, Math.floor(total / GIF_PALETTE_SAMPLES));
    const sampleIdx: number[] = [];
    for (let i = 0; i < total; i += step) sampleIdx.push(i);

    const sw = Math.max(2, Math.round(outW / 2));
    const sh = Math.max(2, Math.round(outH / 2));
    const { canvas: sCanvas, ctx: sCtx } = makeCanvas(sw, sh, true);
    const chunks: Uint8ClampedArray[] = [];
    for (let n = 0; n < sampleIdx.length; n++) {
      aborted(signal);
      await seekAndSettle(video, times[sampleIdx[n]]);
      compositeMockup(sCtx, sw, sh, {
        frameImg: req.frameImg,
        frame: req.frame,
        geom: req.geom,
        scene,
        transform: req.transform,
        source,
        forceBackground: req.flattenColor ?? "#ffffff",
      });
      chunks.push(sCtx.getImageData(0, 0, sw, sh).data);
      onProgress({
        phase: "sampling",
        frame: n + 1,
        totalFrames: sampleIdx.length,
      });
      await yieldToUi();
    }
    sCanvas.width = 0;
    sCanvas.height = 0;

    const totalLen = chunks.reduce((a, c) => a + c.length, 0);
    const concat = new Uint8Array(totalLen);
    let off = 0;
    for (const c of chunks) {
      concat.set(c, off);
      off += c.length;
    }
    chunks.length = 0;
    sharedPalette = quantize(concat, 256, { format: "rgb565" });
  }

  // Stream: extract -> composite -> read -> encode -> drop. Peak RGBA residency
  // is exactly one frame, so a 90-frame export never holds 840MB.
  for (let i = 0; i < total; i++) {
    aborted(signal);
    await seekAndSettle(video, times[i]);
    draw();
    const rgba = ctx.getImageData(0, 0, outW, outH).data;

    const pal = sharedPalette ?? quantize(rgba, 256, { format: "rgb565" });
    const index = applyPalette(rgba, pal, "rgb565");

    // In auto mode gifenc writes the global colour table from the FIRST frame's
    // palette, and uses a local table on any later frame that passes one. With
    // a shared palette that local table would be a byte-identical duplicate, so
    // omit it after frame 0 and save 768 bytes a frame.
    const isFirst = i === 0;
    enc.writeFrame(index, outW, outH, {
      palette: isFirst || !sharedPalette ? pal : undefined,
      delay: delayMs,
      repeat: req.loop ? 0 : -1, // only honoured on the first frame
    });

    onProgress({ phase: "encoding", frame: i + 1, totalFrames: total });
    await yieldToUi();
  }

  onProgress({ phase: "finalizing", frame: total, totalFrames: total });
  enc.finish();
  const bytes = enc.bytes();

  // Release the decoder and the canvas backing store.
  video.removeAttribute("src");
  video.load();
  canvas.width = 0;
  canvas.height = 0;

  return new Blob([bytes], { type: "image/gif" });
}
