import type { VideoTrim } from "../data/mockup/types";

/**
 * Shared frame-extraction primitives for every animated export (GIF, MP4).
 *
 * Seek-driven rather than playback-driven: exact reproducible timestamps, any
 * target fps, faster than real time, and it works where requestVideoFrameCallback
 * doesn't exist (Firefox ships none).
 */

/** Hard backstop, ms. rAF and rVFC are both suspended in a hidden or
 *  backgrounded tab, so neither can be the only way out of this wait —
 *  without a timer the whole export deadlocks the moment the tab loses
 *  visibility. `seeked` has already fired by this point, so proceeding on the
 *  timer is safe; at worst we draw the frame a beat early. */
const PRESENT_TIMEOUT_MS = 80;

const DECODE_ERROR =
  "Your browser can't decode this video — re-export it as an H.264 MP4.";

export function openVideoForExtraction(url: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const v = document.createElement("video");
    v.preload = "auto";
    v.muted = true;
    v.playsInline = true;
    v.crossOrigin = "anonymous";
    const cleanup = () => {
      v.onloadeddata = null;
      v.onerror = null;
      clearTimeout(timer);
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Video took too long to load."));
    }, 20000);
    v.onloadeddata = () => {
      cleanup();
      // A codec the browser can't decode often still fires loadeddata but
      // reports zero dimensions. Catch it here rather than as a blank export.
      if (!v.videoWidth || !v.videoHeight) {
        reject(new Error(DECODE_ERROR));
        return;
      }
      resolve(v);
    };
    v.onerror = () => {
      cleanup();
      reject(new Error(DECODE_ERROR));
    };
    v.src = url;
  });
}

/**
 * Seek, then wait until the decoded frame is actually presented.
 *
 * Chrome can fire `seeked` before the new frame is composited into the
 * element, so a drawImage right after it paints the PREVIOUS frame — an
 * off-by-one export with a duplicated first frame. requestVideoFrameCallback
 * fires only on real presentation, so it's used as a confirmation signal,
 * raced against a few rAFs and a hard timer so nothing can deadlock.
 */
export async function seekAndSettle(
  video: HTMLVideoElement,
  t: number
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      clearTimeout(timer);
    };
    const onSeeked = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("Seeking failed while reading the video."));
    };
    // Never let a stalled decoder hang the whole export.
    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, 4000);
    video.addEventListener("seeked", onSeeked, { once: true });
    video.addEventListener("error", onError, { once: true });
    try {
      video.currentTime = t;
    } catch {
      cleanup();
      resolve();
    }
  });
  await presentedFrame(video);
}

function presentedFrame(video: HTMLVideoElement): Promise<void> {
  return new Promise<void>((resolve) => {
    let done = false;
    let rvfcId: number | undefined;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (rvfcId !== undefined) video.cancelVideoFrameCallback?.(rvfcId);
      resolve();
    };
    const timer = setTimeout(finish, PRESENT_TIMEOUT_MS);

    if (typeof video.requestVideoFrameCallback === "function") {
      rvfcId = video.requestVideoFrameCallback(() => finish());
    }
    let ticks = 0;
    const tick = () => {
      if (done) return;
      ticks += 1;
      if (ticks >= 2) finish();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

export interface FramePlan {
  times: number[];
  clamped: boolean;
}

/**
 * The timestamps to sample. Each is nudged half a frame forward so we never
 * land exactly on a presentation-timestamp boundary, where the decoder may
 * legitimately return either the preceding or the following frame.
 */
export function planFrameTimes(
  trim: VideoTrim,
  fps: number,
  videoDuration: number,
  maxDurationSec: number,
  maxFrames: number
): FramePlan {
  const start = Math.max(0, trim.startSec);
  const end = Math.min(
    videoDuration || trim.endSec,
    Math.max(start + 0.1, trim.endSec)
  );
  const span = Math.min(end - start, maxDurationSec);
  const step = 1 / fps;
  const raw = Math.floor(span / step);
  const count = Math.max(1, Math.min(raw, maxFrames));
  const times: number[] = [];
  for (let i = 0; i < count; i++) {
    times.push(Math.min(start + i * step + step / 2, Math.max(0, end - 1e-3)));
  }
  return { times, clamped: raw > count || end - start > maxDurationSec };
}

/** Longest-edge cap with the aspect preserved. Both dims are forced even —
 *  H.264's 4:2:0 chroma subsampling requires it, and GIF is indifferent. */
export function scaleToMaxEdge(
  w: number,
  h: number,
  maxEdge: number
): { w: number; h: number } {
  const k = Math.min(1, maxEdge / Math.max(w, h));
  const even = (n: number) => Math.max(2, Math.round((n * k) / 2) * 2);
  return { w: even(w), h: even(h) };
}
