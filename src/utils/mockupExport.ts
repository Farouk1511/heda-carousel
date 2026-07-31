import JSZip from "jszip";
import type {
  DeviceFramePreset,
  FrameGeometry,
  MockupItem,
  MockupScene,
} from "../data/mockup/types";
import {
  compositeMockup,
  loadFrameImage,
  makeCanvas,
  type CompositeSource,
} from "./mockupRender";
import { openVideoForExtraction, seekAndSettle } from "./gifExport";

export interface RenderItemOptions {
  item: MockupItem;
  mediaUrl: string | undefined;
  frame: DeviceFramePreset;
  geom: FrameGeometry;
  scene: MockupScene;
  w: number;
  h: number;
  /** Supersample factor. 2 matches the carousel exporter's pixelRatio. */
  pixelRatio?: number;
}

/** Resolve an item's media into something drawable, plus its natural size. */
async function openSource(
  item: MockupItem,
  mediaUrl: string | undefined
): Promise<{ source: CompositeSource | null; release: () => void }> {
  if (!mediaUrl) return { source: null, release: () => {} };

  if (item.media.kind === "image") {
    const img = new Image();
    img.src = mediaUrl;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Couldn't decode ${item.name}.`));
    });
    try {
      await img.decode();
    } catch {
      /* already loaded */
    }
    return {
      source: {
        el: img,
        naturalW: img.naturalWidth,
        naturalH: img.naturalHeight,
      },
      release: () => {},
    };
  }

  // Video: render the poster frame at the trim start.
  const video = await openVideoForExtraction(mediaUrl);
  await seekAndSettle(video, item.trim?.startSec ?? 0);
  return {
    source: {
      el: video,
      naturalW: video.videoWidth,
      naturalH: video.videoHeight,
    },
    release: () => {
      video.removeAttribute("src");
      video.load();
    },
  };
}

export async function renderMockupToBlob(
  opts: RenderItemOptions
): Promise<Blob> {
  const ratio = opts.pixelRatio ?? 2;
  const frameImg = await loadFrameImage(opts.frame.src);
  const { canvas, ctx } = makeCanvas(opts.w * ratio, opts.h * ratio);
  const { source, release } = await openSource(opts.item, opts.mediaUrl);
  try {
    // Scale the whole scene rather than the geometry: every rect is normalized,
    // so one transform keeps preview and export identical at any pixelRatio.
    ctx.scale(ratio, ratio);
    compositeMockup(ctx, opts.w, opts.h, {
      frameImg,
      frame: opts.frame,
      geom: opts.geom,
      scene: opts.scene,
      transform: opts.item.transform,
      source,
    });
  } finally {
    release();
  }
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );
  canvas.width = 0;
  canvas.height = 0;
  if (!blob) throw new Error("Couldn't encode the PNG.");
  return blob;
}

export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "mockup"
  );
}

/** URL.createObjectURL -> synthetic anchor -> revoke, as used across export.ts. */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportMockupPng(opts: RenderItemOptions): Promise<void> {
  const blob = await renderMockupToBlob(opts);
  downloadBlob(blob, `${slugify(opts.item.name)}.png`);
}

export interface BatchProgress {
  done: number;
  total: number;
  label: string;
}

export async function exportAllMockupsZip(
  items: MockupItem[],
  common: Omit<RenderItemOptions, "item" | "mediaUrl">,
  mediaUrls: Record<string, string>,
  docName: string,
  onProgress: (p: BatchProgress) => void,
  signal?: AbortSignal
): Promise<void> {
  const zip = new JSZip();
  const used = new Map<string, number>();

  for (let i = 0; i < items.length; i++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const item = items[i];
    onProgress({ done: i, total: items.length, label: item.name });

    let base = slugify(item.name);
    const seen = used.get(base) ?? 0;
    used.set(base, seen + 1);
    if (seen > 0) base = `${base}-${seen + 1}`;

    const blob = await renderMockupToBlob({
      ...common,
      item,
      mediaUrl: mediaUrls[item.media.mediaId],
    });
    zip.file(`${String(i + 1).padStart(2, "0")}_${base}.png`, blob);
  }

  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  onProgress({ done: items.length, total: items.length, label: "Zipping" });
  const out = await zip.generateAsync({ type: "blob" });
  downloadBlob(out, `${slugify(docName)}.zip`);
}
