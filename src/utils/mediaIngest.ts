import type { MediaKind, MockupMedia } from "../data/mockup/types";
import { newId } from "../data/mockup/defaults";

export const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
];

/** Types the file input advertises. Actual decodability is probed, not assumed. */
export const ACCEPT_ATTR = "image/*,video/*";

/** Warn (don't block) above this — the browser holds the whole blob. */
export const LARGE_FILE_BYTES = 80 * 1024 * 1024;

export class MediaIngestError extends Error {}

export function kindForFile(file: File): MediaKind | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  // Some browsers report an empty type for .mov / .heic — fall back to ext.
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  if (["png", "jpg", "jpeg", "webp", "gif", "avif"].includes(ext)) return "image";
  if (["mp4", "webm", "mov", "m4v", "ogv"].includes(ext)) return "video";
  return null;
}

function probeImage(url: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () =>
      reject(new MediaIngestError("That image couldn't be decoded."));
    img.src = url;
  });
}

function probeVideo(
  url: string
): Promise<{ w: number; h: number; duration: number }> {
  return new Promise((resolve, reject) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    const cleanup = () => {
      v.onloadedmetadata = null;
      v.onerror = null;
      clearTimeout(timer);
    };
    const fail = () => {
      cleanup();
      // The common real-world case: an iPhone screen recording exported as
      // HEVC .mov, which Chrome on Windows cannot decode.
      reject(
        new MediaIngestError(
          "Your browser can't decode this video — re-export it as an H.264 MP4."
        )
      );
    };
    const timer = setTimeout(fail, 15000);
    v.onloadedmetadata = () => {
      // A codec the browser can't decode often still fires loadedmetadata but
      // reports zero dimensions. Catch it here rather than as a blank GIF.
      if (!v.videoWidth || !v.videoHeight) {
        fail();
        return;
      }
      const duration = Number.isFinite(v.duration) ? v.duration : 0;
      cleanup();
      resolve({ w: v.videoWidth, h: v.videoHeight, duration });
    };
    v.onerror = fail;
    v.src = url;
  });
}

export interface IngestedMedia {
  media: MockupMedia;
  blob: Blob;
  /** Object URL created during the probe — reused by the caller, not revoked. */
  url: string;
}

/**
 * Probe a dropped/picked file for its natural size (and duration, for video)
 * and mint a MockupMedia record. Throws MediaIngestError with a message that is
 * safe to show the user.
 */
export async function ingestFile(file: File): Promise<IngestedMedia> {
  const kind = kindForFile(file);
  if (!kind) {
    throw new MediaIngestError(`"${file.name}" isn't an image or a video.`);
  }
  const url = URL.createObjectURL(file);
  try {
    if (kind === "image") {
      const { w, h } = await probeImage(url);
      return {
        url,
        blob: file,
        media: {
          mediaId: newId("med"),
          kind,
          fileName: file.name,
          mimeType: file.type || "image/png",
          naturalW: w,
          naturalH: h,
        },
      };
    }
    const { w, h, duration } = await probeVideo(url);
    return {
      url,
      blob: file,
      media: {
        mediaId: newId("med"),
        kind,
        fileName: file.name,
        mimeType: file.type || "video/mp4",
        naturalW: w,
        naturalH: h,
        durationSec: duration,
      },
    };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}

/** Strip the extension for a nicer default item name. */
export function baseName(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "") || fileName;
}
