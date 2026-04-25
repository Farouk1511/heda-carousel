import React from "react";
import { createRoot } from "react-dom/client";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import type { Post } from "../data/posts";
import type { ThemeName } from "../data/themes";
import type { AspectRatio } from "../hooks/useCarouselState";
import { HASHTAGS } from "../data/posts";
import { Card } from "../components/Card";

function getExportDimensions(ratio: AspectRatio) {
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

async function captureCardOffscreen(
  post: Post,
  slideIndex: number,
  theme: ThemeName,
  ratio: AspectRatio,
  logoScale: number
): Promise<Blob> {
  const { w, h } = getExportDimensions(ratio);

  // Create an offscreen container at full export size (same as legacy approach)
  const offscreen = document.createElement("div");
  offscreen.style.cssText = `
    position: fixed; left: -9999px; top: 0; z-index: -1;
    width: ${w}px; height: ${h}px; overflow: hidden;
  `;
  document.body.appendChild(offscreen);

  // Mount a full-size Card via React at export dimensions
  const cardContainer = document.createElement("div");
  cardContainer.style.cssText = `width: ${w}px; height: ${h}px;`;
  offscreen.appendChild(cardContainer);

  const root = createRoot(cardContainer);
  root.render(
    React.createElement(Card, {
      post,
      slideIndex,
      theme,
      width: w,
      height: h,
      logoSrc: "/LOGO.png",
      logoScale,
    })
  );

  // Wait for React render + fonts/images to load
  await new Promise((r) => setTimeout(r, 300));

  const cardEl = cardContainer.firstElementChild as HTMLElement;
  if (!cardEl) {
    root.unmount();
    document.body.removeChild(offscreen);
    throw new Error("Card element not found in offscreen container");
  }

  const dataUrl = await toPng(cardEl, {
    width: w,
    height: h,
    pixelRatio: 1,
  });

  // Clean up
  root.unmount();
  document.body.removeChild(offscreen);

  const res = await fetch(dataUrl);
  return res.blob();
}

export async function exportCurrentSlide(
  post: Post,
  currentSlide: number,
  theme: ThemeName,
  ratio: AspectRatio,
  logoScale: number,
  setProgress: (msg: string) => void
) {
  setProgress("Rendering...");
  try {
    const blob = await captureCardOffscreen(post, currentSlide, theme, ratio, logoScale);
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
      const blob = await captureCardOffscreen(post, i, theme, ratio, logoScale);
      const typeName = slides[i].type.toLowerCase().replace(/\s+/g, "_");
      folder.file(`slide_${i + 1}_${typeName}.png`, blob);
    }

    const cleanHL = post.slides[0].headline.replace(/\*\*/g, "");
    const caption = `${cleanHL}\n\n${post.slides[0].sub}\n\nSwipe through for the full truth. \u27A1\uFE0F\n\n${HASHTAGS}`;
    folder.file("caption.txt", caption);

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

        const blob = await captureCardOffscreen(post, i, theme, ratio, logoScale);
        const typeName = post.slides[i].type.toLowerCase().replace(/\s+/g, "_");
        ratioFolder.file(`slide_${i + 1}_${typeName}.png`, blob);
      }
    }

    // Add caption per post
    const cleanHL = post.slides[0].headline.replace(/\*\*/g, "");
    const caption = `${cleanHL}\n\n${post.slides[0].sub}\n\nSwipe through for the full truth. \u27A1\uFE0F\n\n${HASHTAGS}`;
    postFolder.file("caption.txt", caption);
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
