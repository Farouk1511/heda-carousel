import { ArrayBufferTarget, Muxer } from "mp4-muxer";
import type {
  DeviceFramePreset,
  FrameGeometry,
  MockupScene,
  ScreenTransform,
  VideoQuality,
  VideoTrim,
} from "../data/mockup/types";
import { compositeMockup, makeCanvas } from "./mockupRender";
import {
  openVideoForExtraction,
  planFrameTimes,
  scaleToMaxEdge,
  seekAndSettle,
} from "./videoFrames";

/**
 * Video -> H.264 MP4, entirely in the browser, via WebCodecs + mp4-muxer.
 *
 * Deliberately NOT MediaRecorder. MediaRecorder timestamps frames by the wall
 * clock at the moment each one is captured, so a composite that runs slower
 * than real time stretches playback — measured at ~15% drift (4.0s of content
 * recording as 4.61s) while building this feature's test fixture. VideoEncoder
 * takes an explicit per-frame timestamp instead, so the output is frame-exact
 * the way the GIF's centisecond delay already is.
 *
 * Reuses the same seek-driven extraction and the same compositeMockup() as the
 * GIF and PNG paths, so all three agree frame for frame.
 *
 * Audio is not carried over: the source is a screen recording and muxing audio
 * would mean decoding, resampling and encoding a second track. The screen
 * content is the payload.
 */

export const VIDEO_FPS_OPTIONS = [24, 30, 60] as const;
export const VIDEO_MAX_EDGE_OPTIONS = [720, 1080, 1440] as const;
export const VIDEO_MAX_FRAMES = 1800;
export const VIDEO_MAX_DURATION_SEC = 60;

/** Bits per pixel per frame. H.264 on flat UI content is very compressible, so
 *  even "high" sits well below what camera footage would need. */
const QUALITY_BPP: Record<VideoQuality, number> = {
  small: 0.045,
  balanced: 0.08,
  high: 0.14,
};

/** Seconds between keyframes. Short enough that scrubbing stays responsive. */
const KEYFRAME_INTERVAL_SEC = 2;
/** Let the encoder buffer this many frames before we wait on it. */
const MAX_QUEUE = 8;

export interface VideoProgress {
  phase: "preparing" | "encoding" | "finalizing";
  frame: number;
  totalFrames: number;
}

export interface Mp4RenderRequest {
  /** blob: object URL. A data: URL seeks badly in Chrome — don't pass one. */
  videoUrl: string;
  frameImg: CanvasImageSource;
  frame: DeviceFramePreset;
  geom: FrameGeometry;
  scene: MockupScene;
  transform: ScreenTransform;
  outW: number;
  outH: number;
  maxEdge: number;
  trim: VideoTrim;
  fps: number;
  quality: VideoQuality;
  /** Solid colour used when the scene background is transparent. */
  flattenColor?: string;
}

export function isVideoExportSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.VideoEncoder === "function" &&
    typeof window.VideoFrame === "function"
  );
}

export function mp4OutputSize(
  canvasW: number,
  canvasH: number,
  maxEdge: number
): { w: number; h: number } {
  return scaleToMaxEdge(canvasW, canvasH, maxEdge);
}

export function planMp4Frames(trim: VideoTrim, fps: number, duration: number) {
  return planFrameTimes(
    trim,
    fps,
    duration,
    VIDEO_MAX_DURATION_SEC,
    VIDEO_MAX_FRAMES
  );
}

export function estimateBitrate(
  w: number,
  h: number,
  fps: number,
  quality: VideoQuality
): number {
  return Math.round(w * h * fps * QUALITY_BPP[quality]);
}

/** H.264 profiles from best to most compatible. Support varies by platform, so
 *  each is probed rather than assumed. */
const H264_CODECS = [
  "avc1.640028", // High 4.0
  "avc1.4d0028", // Main 4.0
  "avc1.42e01e", // Baseline 3.0 — the universal fallback
];

async function pickCodec(
  w: number,
  h: number,
  fps: number,
  bitrate: number
): Promise<string> {
  for (const codec of H264_CODECS) {
    try {
      const support = await window.VideoEncoder.isConfigSupported({
        codec,
        width: w,
        height: h,
        framerate: fps,
        bitrate,
      });
      if (support.supported) return codec;
    } catch {
      /* probe the next one */
    }
  }
  throw new Error("This browser can't encode H.264 video.");
}

function aborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
}

const yieldToUi = () => new Promise((r) => setTimeout(r, 0));

export async function exportMockupMp4(
  req: Mp4RenderRequest,
  onProgress: (p: VideoProgress) => void,
  signal?: AbortSignal
): Promise<Blob> {
  if (!isVideoExportSupported()) {
    throw new Error(
      "This browser doesn't support WebCodecs — try Chrome, Edge, or Safari 16.4+."
    );
  }
  aborted(signal);
  onProgress({ phase: "preparing", frame: 0, totalFrames: 0 });

  const video = await openVideoForExtraction(req.videoUrl);
  const duration = Number.isFinite(video.duration) ? video.duration : 0;
  const { times } = planMp4Frames(req.trim, req.fps, duration);
  const total = times.length;

  const { w: outW, h: outH } = mp4OutputSize(req.outW, req.outH, req.maxEdge);
  const bitrate = estimateBitrate(outW, outH, req.fps, req.quality);
  const codec = await pickCodec(outW, outH, req.fps, bitrate);

  const { canvas, ctx } = makeCanvas(outW, outH);
  const source = {
    el: video as CanvasImageSource,
    naturalW: video.videoWidth,
    naturalH: video.videoHeight,
  };

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: "avc", width: outW, height: outH, frameRate: req.fps },
    fastStart: "in-memory", // metadata up front so it streams/previews properly
  });

  let encodeError: Error | null = null;
  const encoder = new window.VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e: DOMException) => {
      encodeError = new Error(`Video encoding failed: ${e.message}`);
    },
  });
  encoder.configure({
    codec,
    width: outW,
    height: outH,
    framerate: req.fps,
    bitrate,
    // 'avc' gives the avcC description mp4-muxer needs for the sample entry.
    avc: { format: "avc" },
  });

  const frameDurationUs = Math.round(1e6 / req.fps);
  const keyEvery = Math.max(1, Math.round(req.fps * KEYFRAME_INTERVAL_SEC));

  try {
    for (let i = 0; i < total; i++) {
      aborted(signal);
      if (encodeError) throw encodeError;

      await seekAndSettle(video, times[i]);
      compositeMockup(ctx, outW, outH, {
        frameImg: req.frameImg,
        frame: req.frame,
        geom: req.geom,
        scene: req.scene,
        transform: req.transform,
        source,
        // MP4 has no alpha channel — flatten rather than emit black fringes.
        forceBackground: req.flattenColor ?? "#ffffff",
      });

      // Derive each timestamp from its index so rounding can't accumulate.
      const frame = new window.VideoFrame(canvas, {
        timestamp: Math.round((i * 1e6) / req.fps),
        duration: frameDurationUs,
      });
      encoder.encode(frame, { keyFrame: i % keyEvery === 0 });
      frame.close();

      // Backpressure: the encoder holds raw frames until it drains, so letting
      // the queue grow unbounded is how a long export runs out of memory.
      while (encoder.encodeQueueSize > MAX_QUEUE) {
        aborted(signal);
        await yieldToUi();
      }

      onProgress({ phase: "encoding", frame: i + 1, totalFrames: total });
      await yieldToUi();
    }

    onProgress({ phase: "finalizing", frame: total, totalFrames: total });
    await encoder.flush();
    if (encodeError) throw encodeError;
    muxer.finalize();
  } finally {
    if (encoder.state !== "closed") encoder.close();
    video.removeAttribute("src");
    video.load();
    canvas.width = 0;
    canvas.height = 0;
  }

  const { buffer } = muxer.target as ArrayBufferTarget;
  return new Blob([buffer], { type: "video/mp4" });
}
