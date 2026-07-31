import React from "react";
import { createRoot } from "react-dom/client";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import type { Post } from "../data/posts";
import type { ThemeName } from "../data/themes";
import type { AspectRatio } from "../hooks/useCarouselState";
import { buildCaption } from "../data/posts";
import { Card } from "../components/Card";
import { LeaderboardCard } from "../components/LeaderboardCard";
import type { LeaderboardData } from "../data/leaderboard/types";
import { weekSlug } from "../data/leaderboard/parse";
import { paginateLeaderboard } from "../data/leaderboard/pagination";
import type { AvatarMap } from "../data/leaderboard/avatars";
import type { BumpReelConfig } from "../remotion/bumpChart/config";
import type { PostStyleEntry, StyleMap } from "../data/design/types";
import { resolveDesign, type CardDesign } from "../data/design/resolve";

export function getExportDimensions(ratio: AspectRatio) {
  switch (ratio) {
    case "1:1":
      return { w: 1080, h: 1080 };
    case "9:16":
      return { w: 1080, h: 1920 };
    case "4:5":
    default:
      return { w: 1080, h: 1350 };
  }
}

export interface CaptureOptions {
  /** Milliseconds to settle after mount/waitFor (default 300 — carousel legacy). */
  settleMs?: number;
  /** Optional readiness hook (e.g. await fonts + image decode) before capture. */
  waitFor?: (root: HTMLElement) => Promise<void>;
}

/**
 * Render an arbitrary React element offscreen at the given pixel size and
 * capture it to a PNG blob. Shared by the carousel Card and the LeaderboardCard.
 */
export async function captureNodeOffscreen(
  element: React.ReactElement,
  w: number,
  h: number,
  opts?: CaptureOptions
): Promise<Blob> {
  // Create an offscreen container at full export size (same as legacy approach)
  const offscreen = document.createElement("div");
  offscreen.style.cssText = `
    position: fixed; left: -9999px; top: 0; z-index: -1;
    width: ${w}px; height: ${h}px; overflow: hidden;
  `;
  document.body.appendChild(offscreen);

  const cardContainer = document.createElement("div");
  cardContainer.style.cssText = `width: ${w}px; height: ${h}px;`;
  offscreen.appendChild(cardContainer);

  const root = createRoot(cardContainer);
  root.render(element);

  // Wait for React render + fonts/images to load
  if (opts?.waitFor) {
    try {
      await opts.waitFor(cardContainer);
    } catch {
      /* best-effort readiness */
    }
  }
  try {
    await document.fonts.ready;
  } catch {
    /* best-effort font readiness */
  }
  await new Promise((r) => setTimeout(r, opts?.settleMs ?? 300));

  const cardEl = cardContainer.firstElementChild as HTMLElement;
  if (!cardEl) {
    root.unmount();
    document.body.removeChild(offscreen);
    throw new Error("Card element not found in offscreen container");
  }

  // pixelRatio 2 -> 2160-wide output; IG compression punishes thin type at 1080
  const dataUrl = await toPng(cardEl, {
    width: w,
    height: h,
    pixelRatio: 2,
  });

  // Clean up
  root.unmount();
  document.body.removeChild(offscreen);

  const res = await fetch(dataUrl);
  return res.blob();
}

async function captureCardOffscreen(
  post: Post,
  slideIndex: number,
  theme: ThemeName,
  ratio: AspectRatio,
  logoScale: number,
  design?: CardDesign
): Promise<Blob> {
  const { w, h } = getExportDimensions(ratio);
  return captureNodeOffscreen(
    React.createElement(Card, {
      post,
      slideIndex,
      theme,
      width: w,
      height: h,
      logoSrc: "/LOGO.png",
      logoScale,
      design,
    }),
    w,
    h
  );
}

async function captureLeaderboardOffscreen(
  data: LeaderboardData,
  theme: ThemeName,
  ratio: AspectRatio,
  logoScale: number,
  cta: string,
  avatars: AvatarMap,
  pageIndex: number
): Promise<Blob> {
  const { w, h } = getExportDimensions(ratio);
  return captureNodeOffscreen(
    React.createElement(LeaderboardCard, {
      data,
      theme,
      width: w,
      height: h,
      aspectRatio: ratio,
      logoSrc: "/LOGO.png",
      logoScale,
      cta,
      avatars,
      pageIndex,
    }),
    w,
    h
  );
}

function pageSuffix(pageIndex: number, pageCount: number): string {
  return pageCount > 1 ? `_p${pageIndex + 1}` : "";
}

export async function exportCurrentSlide(
  post: Post,
  currentSlide: number,
  theme: ThemeName,
  styleEntry: PostStyleEntry | undefined,
  ratio: AspectRatio,
  logoScale: number,
  setProgress: (msg: string) => void
) {
  setProgress("Rendering...");
  try {
    const design = resolveDesign(theme, styleEntry, currentSlide);
    const blob = await captureCardOffscreen(post, currentSlide, theme, ratio, logoScale, design);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `heda_post${post.id}_day${post.day}_slide${currentSlide + 1}.png`;
    a.click();
    URL.revokeObjectURL(url);
    setProgress("Downloaded \u2713");
  } catch (e) {
    setProgress("Error: " + (e as Error).message);
  }
  setTimeout(() => setProgress(""), 2500);
}

export async function exportAllSlides(
  post: Post,
  theme: ThemeName,
  styleEntry: PostStyleEntry | undefined,
  ratio: AspectRatio,
  logoScale: number,
  setProgress: (msg: string) => void,
  setCurrentSlide: (i: number) => void,
  originalSlide: number
) {
  const slides = post.slides;
  const zip = new JSZip();
  const folder = zip.folder(`heda_post${post.id}_day${post.day}`)!;

  try {
    for (let i = 0; i < slides.length; i++) {
      setProgress(`Rendering slide ${i + 1} / ${slides.length}...`);
      setCurrentSlide(i);
      const design = resolveDesign(theme, styleEntry, i);
      const blob = await captureCardOffscreen(post, i, theme, ratio, logoScale, design);
      const typeName = slides[i].type.toLowerCase().replace(/\s+/g, "_");
      folder.file(`slide_${i + 1}_${typeName}.png`, blob);
    }

    folder.file("caption.txt", buildCaption(post));

    setProgress("Zipping...");
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `heda_post${post.id}_day${post.day}_carousel.zip`;
    a.click();
    URL.revokeObjectURL(url);
    setProgress(`${slides.length} slides + caption downloaded \u2713`);
  } catch (e) {
    setProgress("Error: " + (e as Error).message);
  }

  setCurrentSlide(originalSlide);
  setTimeout(() => setProgress(""), 3000);
}

export interface BulkExportProgress {
  current: number;
  total: number;
  label: string;
}

export async function exportAllPosts(
  posts: Post[],
  theme: ThemeName,
  styles: StyleMap,
  ratios: AspectRatio[],
  logoScale: number,
  onProgress: (p: BulkExportProgress) => void,
  signal?: AbortSignal
): Promise<void> {
  const zip = new JSZip();
  const totalSlides = posts.reduce((n, p) => n + p.slides.length, 0) * ratios.length;
  let rendered = 0;

  for (const post of posts) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    const postFolder = zip.folder(
      `post${post.id}_day${post.day}_${post.title.replace(/[^a-zA-Z0-9]+/g, "_").toLowerCase()}`
    )!;

    for (const ratio of ratios) {
      const ratioFolder = ratios.length > 1 ? postFolder.folder(ratio.replace(":", "x"))! : postFolder;

      for (let i = 0; i < post.slides.length; i++) {
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

        rendered++;
        onProgress({
          current: rendered,
          total: totalSlides,
          label: `Day ${post.day} — slide ${i + 1}/${post.slides.length}${ratios.length > 1 ? ` (${ratio})` : ""}`,
        });

        const design = resolveDesign(theme, styles[post.id], i);
        const blob = await captureCardOffscreen(post, i, theme, ratio, logoScale, design);
        const typeName = post.slides[i].type.toLowerCase().replace(/\s+/g, "_");
        ratioFolder.file(`slide_${i + 1}_${typeName}.png`, blob);
      }
    }

    postFolder.file("caption.txt", buildCaption(post));
  }

  onProgress({ current: totalSlides, total: totalSlides, label: "Zipping..." });
  const zipBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `heda_all_posts_carousel.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportLeaderboardImage(
  data: LeaderboardData,
  theme: ThemeName,
  ratio: AspectRatio,
  logoScale: number,
  cta: string,
  avatars: AvatarMap,
  setProgress: (msg: string) => void
) {
  const slug = weekSlug(data);
  const ratioTag = ratio.replace(":", "x");
  const pages = paginateLeaderboard(data.leaderboard, ratio);
  setProgress("Rendering...");
  try {
    if (pages.length === 1) {
      const blob = await captureLeaderboardOffscreen(data, theme, ratio, logoScale, cta, avatars, 0);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `heda_leaderboard_${slug}_${ratioTag}.png`;
      a.click();
      URL.revokeObjectURL(url);
      setProgress("Downloaded ✓");
    } else {
      // Multiple pages for this ratio -> bundle the carousel into a ZIP.
      const zip = new JSZip();
      for (let i = 0; i < pages.length; i++) {
        setProgress(`Rendering part ${i + 1}/${pages.length}...`);
        const blob = await captureLeaderboardOffscreen(data, theme, ratio, logoScale, cta, avatars, i);
        zip.file(`heda_leaderboard_${slug}_${ratioTag}${pageSuffix(i, pages.length)}.png`, blob);
      }
      setProgress("Zipping...");
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `heda_leaderboard_${slug}_${ratioTag}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setProgress(`${pages.length} images downloaded ✓`);
    }
  } catch (e) {
    setProgress("Error: " + (e as Error).message);
  }
  setTimeout(() => setProgress(""), 2500);
}

export async function exportLeaderboardRatios(
  data: LeaderboardData,
  theme: ThemeName,
  ratios: AspectRatio[],
  logoScale: number,
  cta: string,
  avatars: AvatarMap,
  setProgress: (msg: string) => void
) {
  const zip = new JSZip();
  const slug = weekSlug(data);
  let count = 0;
  try {
    for (const ratio of ratios) {
      const ratioTag = ratio.replace(":", "x");
      const pages = paginateLeaderboard(data.leaderboard, ratio);
      for (let i = 0; i < pages.length; i++) {
        setProgress(`Rendering ${ratio}${pages.length > 1 ? ` part ${i + 1}/${pages.length}` : ""}...`);
        const blob = await captureLeaderboardOffscreen(data, theme, ratio, logoScale, cta, avatars, i);
        zip.file(`heda_leaderboard_${slug}_${ratioTag}${pageSuffix(i, pages.length)}.png`, blob);
        count++;
      }
    }

    setProgress("Zipping...");
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `heda_leaderboard_${slug}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    setProgress(`${count} images downloaded ✓`);
  } catch (e) {
    setProgress("Error: " + (e as Error).message);
  }
  setTimeout(() => setProgress(""), 3000);
}

/**
 * Bridge from browser state to the CLI bump-chart render: downloads the
 * current leaderboard + video settings as a { data, video } JSON file and
 * copies the matching `npm run render:bump-chart` command to the clipboard.
 */
export async function exportBumpReelFile(
  data: LeaderboardData,
  video: BumpReelConfig,
  setProgress: (msg: string) => void
) {
  const fileName = `heda_bumpreel_${weekSlug(data)}.json`;
  const blob = new Blob([JSON.stringify({ data, video }, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);

  const command = `npm run render:bump-chart -- --input=./${fileName}`;
  try {
    await navigator.clipboard.writeText(command);
    setProgress("JSON downloaded — render command copied ✓");
  } catch {
    setProgress(`JSON downloaded — run: ${command}`);
  }
  setTimeout(() => setProgress(""), 6000);
}

/**
 * One-click bump-reel render: POSTs the leaderboard + settings to the Vite
 * dev server's render endpoint, polls progress, then downloads the MP4.
 * Falls back with a hint when the endpoint isn't there (static build).
 */
export async function renderBumpReelServer(
  data: LeaderboardData,
  video: BumpReelConfig,
  setProgress: (msg: string) => void
): Promise<void> {
  let jobId: string;
  try {
    const post = await fetch("/api/bump-render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, video }),
    });
    const payload = (await post.json()) as { jobId?: string; error?: string };
    if (!post.ok || !payload.jobId) {
      setProgress(`Error: ${payload.error ?? "render endpoint unavailable"}`);
      setTimeout(() => setProgress(""), 5000);
      return;
    }
    jobId = payload.jobId;
  } catch {
    setProgress("Render server unavailable — use the JSON + command export instead.");
    setTimeout(() => setProgress(""), 5000);
    return;
  }

  setProgress("Bundling composition...");
  for (;;) {
    await new Promise((r) => setTimeout(r, 1000));
    let status: { state: string; progress: number; error?: string; fileName?: string };
    try {
      status = await (await fetch(`/api/bump-render/status?id=${jobId}`)).json();
    } catch {
      continue; // dev server hiccup (e.g. HMR restart) — keep polling
    }
    if (status.state === "bundling") {
      setProgress("Bundling composition...");
    } else if (status.state === "rendering") {
      setProgress(`Rendering... ${Math.round(status.progress * 100)}%`);
    } else if (status.state === "error") {
      setProgress(`Error: ${status.error}`);
      setTimeout(() => setProgress(""), 6000);
      return;
    } else if (status.state === "done") {
      const a = document.createElement("a");
      a.href = `/api/bump-render/file?id=${jobId}`;
      a.download = status.fileName ?? "bump-reel.mp4";
      a.click();
      setProgress("MP4 downloaded ✓ (also saved to ./out)");
      setTimeout(() => setProgress(""), 6000);
      return;
    }
  }
}

export async function exportReelCommand(
  postIndex: number,
  postDay: number,
  theme: ThemeName,
  logoScale: number,
  setProgress: (msg: string) => void
) {
  const command = `npm run render:reel -- --props='{"postIndex":${postIndex},"theme":"${theme}","logoScale":${logoScale}}'`;
  try {
    await navigator.clipboard.writeText(command);
    setProgress(`Render command copied for day ${postDay}`);
  } catch {
    setProgress(`Run in terminal: ${command}`);
  }
  setTimeout(() => setProgress(""), 5000);
}
