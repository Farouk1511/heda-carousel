import { toPng } from "html-to-image";
import JSZip from "jszip";
import type { Post } from "../data/posts";
import type { ThemeName } from "../data/themes";
import type { AspectRatio } from "../hooks/useCarouselState";
import { HASHTAGS } from "../data/posts";

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

async function captureCardElement(ratio: AspectRatio): Promise<Blob> {
  const { w, h } = getExportDimensions(ratio);
  const cardEl = document.querySelector(".card-area .card-export-target") as HTMLElement;
  if (!cardEl) throw new Error("Card element not found");

  const dataUrl = await toPng(cardEl, {
    width: w,
    height: h,
    style: {
      width: `${w}px`,
      height: `${h}px`,
      maxWidth: "none",
      aspectRatio: "auto",
      borderRadius: "0",
      transform: "none",
    },
    pixelRatio: 1,
  });

  const res = await fetch(dataUrl);
  return res.blob();
}

export async function exportCurrentSlide(
  post: Post,
  currentSlide: number,
  _theme: ThemeName,
  ratio: AspectRatio,
  setProgress: (msg: string) => void
) {
  setProgress("Rendering...");
  try {
    const blob = await captureCardElement(ratio);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `heda_day${post.day}_slide${currentSlide + 1}.png`;
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
  _theme: ThemeName,
  ratio: AspectRatio,
  setProgress: (msg: string) => void,
  setCurrentSlide: (i: number) => void,
  originalSlide: number
) {
  const slides = post.slides;
  const zip = new JSZip();
  const folder = zip.folder(`heda_day${post.day}`)!;

  try {
    for (let i = 0; i < slides.length; i++) {
      setProgress(`Rendering slide ${i + 1} / ${slides.length}...`);
      setCurrentSlide(i);
      await new Promise((r) => setTimeout(r, 200));
      const blob = await captureCardElement(ratio);
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
    a.download = `heda_day${post.day}_carousel.zip`;
    a.click();
    URL.revokeObjectURL(url);
    setProgress(`${slides.length} slides + caption downloaded \u2713`);
  } catch (e) {
    setProgress("Error: " + (e as Error).message);
  }

  setCurrentSlide(originalSlide);
  setTimeout(() => setProgress(""), 3000);
}

export async function exportReelCommand(
  postIndex: number,
  postDay: number,
  theme: ThemeName,
  setProgress: (msg: string) => void
) {
  const command = `npm run render:reel -- --props='{"postIndex":${postIndex},"theme":"${theme}"}'`;
  try {
    await navigator.clipboard.writeText(command);
    setProgress(`Render command copied for day ${postDay}`);
  } catch {
    setProgress(`Run in terminal: ${command}`);
  }
  setTimeout(() => setProgress(""), 5000);
}
