import React from "react";
import JSZip from "jszip";
import { captureNodeOffscreen, type BulkExportProgress } from "./export";
import { MarketingCanvas } from "../components/marketing/MarketingCanvas";
import type { BrandKit, Campaign, Design, DesignSize } from "../data/marketing/types";

/** Marketing readiness: wait for web fonts and image decode before capture.
 *  Needed because banner/story sizes are large and logos are fresh data URLs. */
async function marketingWaitFor(root: HTMLElement): Promise<void> {
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  if (fonts?.ready) await fonts.ready;
  const imgs = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    imgs.map((img) => (img.decode ? img.decode().catch(() => undefined) : Promise.resolve()))
  );
}

function slug(s: string): string {
  return (
    s
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .toLowerCase() || "untitled"
  );
}

function captureDesignSize(
  design: Design,
  size: DesignSize,
  brand: BrandKit,
  assets: Record<string, string>
): Promise<Blob> {
  const el = React.createElement(MarketingCanvas, { design, size, brand, assets });
  return captureNodeOffscreen(el, size.w, size.h, {
    settleMs: 80,
    waitFor: marketingWaitFor,
  });
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

type ProgressFn = (msg: string) => void;

export async function exportDesignSize(
  design: Design,
  size: DesignSize,
  brand: BrandKit,
  assets: Record<string, string>,
  campaignName: string,
  setProgress: ProgressFn
): Promise<void> {
  setProgress("Rendering...");
  try {
    const blob = await captureDesignSize(design, size, brand, assets);
    triggerDownload(
      blob,
      `${slug(campaignName)}_${slug(design.name)}_${slug(size.label)}_${size.w}x${size.h}.png`
    );
    setProgress("Downloaded ✓");
  } catch (e) {
    setProgress("Error: " + (e as Error).message);
  }
  setTimeout(() => setProgress(""), 2500);
}

export async function exportDesignAllSizes(
  design: Design,
  brand: BrandKit,
  assets: Record<string, string>,
  campaignName: string,
  setProgress: ProgressFn
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder(slug(design.name))!;
  try {
    for (let i = 0; i < design.sizes.length; i++) {
      const size = design.sizes[i];
      setProgress(`Rendering ${size.label} (${i + 1}/${design.sizes.length})...`);
      const blob = await captureDesignSize(design, size, brand, assets);
      folder.file(`${slug(size.label)}_${size.w}x${size.h}.png`, blob);
    }
    setProgress("Zipping...");
    const zipBlob = await zip.generateAsync({ type: "blob" });
    triggerDownload(zipBlob, `${slug(campaignName)}_${slug(design.name)}.zip`);
    setProgress(`${design.sizes.length} sizes downloaded ✓`);
  } catch (e) {
    setProgress("Error: " + (e as Error).message);
  }
  setTimeout(() => setProgress(""), 3000);
}

export async function exportCampaign(
  campaign: Campaign,
  designs: Design[],
  brand: BrandKit,
  assets: Record<string, string>,
  onProgress: (p: BulkExportProgress) => void,
  signal?: AbortSignal
): Promise<void> {
  const zip = new JSZip();
  const root = zip.folder(slug(campaign.name))!;
  const campaignDesigns = designs.filter((d) => campaign.designIds.includes(d.id));
  const total = campaignDesigns.reduce((n, d) => n + d.sizes.length, 0);
  let rendered = 0;

  for (const design of campaignDesigns) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const folder = root.folder(slug(design.name))!;
    for (const size of design.sizes) {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      rendered++;
      onProgress({ current: rendered, total, label: `${design.name} — ${size.label}` });
      const blob = await captureDesignSize(design, size, brand, assets);
      folder.file(`${slug(size.label)}_${size.w}x${size.h}.png`, blob);
    }
  }

  onProgress({ current: total, total, label: "Zipping..." });
  const zipBlob = await zip.generateAsync({ type: "blob" });
  triggerDownload(zipBlob, `${slug(campaign.name)}_campaign.zip`);
}
