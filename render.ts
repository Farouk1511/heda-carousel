import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import fs from "fs";
import path from "path";
import { POSTS } from "./src/data/posts";
import { createReelFromPost, getReelById } from "./src/remotion/textReel/examples";

type CompositionId = "ReelVideo" | "TextReelVideo";

function parsePropsArg(args: string[]) {
  const propsArg = args.find((a) => a.startsWith("--props="));
  if (!propsArg) {
    return null;
  }
  const raw = propsArg.slice("--props=".length);
  try {
    return JSON.parse(raw) as {
      postIndex?: number;
      theme?: "standard" | "deep";
      logoScale?: number;
    };
  } catch {
    const loose =
      /^\{\s*postIndex\s*:\s*(\d+)\s*,\s*theme\s*:\s*(standard|deep)(?:\s*,\s*logoScale\s*:\s*([\d.]+))?\s*\}$/i.exec(
      raw
      );
    if (loose) {
      return {
        postIndex: Number(loose[1]),
        theme: loose[2].toLowerCase() as "standard" | "deep",
        logoScale: loose[3] ? Number(loose[3]) : undefined,
      };
    }
    throw new Error(
      "Invalid --props format. Use --props='{" +
        '\"postIndex\":0,\"theme\":\"standard\"' +
        "}'"
    );
  }
}

function getArg(args: string[], key: string): string | undefined {
  const hit = args.find((a) => a.startsWith(`${key}=`));
  if (!hit) return undefined;
  return hit.slice(key.length + 1);
}

async function main() {
  const args = process.argv.slice(2);
  const isAll = args.includes("--all");
  const parsedProps = parsePropsArg(args);
  const compositionId = (getArg(args, "--composition") as CompositionId) ?? "ReelVideo";

  let postIndex = parsedProps?.postIndex ?? 0;
  let theme: "standard" | "deep" = parsedProps?.theme ?? "standard";
  let logoScale = parsedProps?.logoScale ?? 1;
  const reelId = getArg(args, "--reel-id") ?? "heda-community-reel";
  const durationPresetOverride = getArg(args, "--duration-preset") as
    | "8s"
    | "12s"
    | "15s"
    | "20s"
    | undefined;
  const textReelPostIndexArg = getArg(args, "--post-index") ?? getArg(args, "--post");

  const postArg = args.find((a) => a.startsWith("--post="));
  if (postArg) postIndex = parseInt(postArg.split("=")[1], 10);

  const themeArg = args.find((a) => a.startsWith("--theme="));
  if (themeArg) theme = themeArg.split("=")[1] as "standard" | "deep";

  const logoScaleArg = args.find((a) => a.startsWith("--logo-scale="));
  if (logoScaleArg) logoScale = Number(logoScaleArg.split("=")[1]) || 1;

  console.log("Bundling Remotion project...");
  const bundleLocation = await bundle({
    entryPoint: path.resolve("./src/remotion/index.ts"),
    webpackOverride: (config) => config,
  });

  if (compositionId === "TextReelVideo") {
    const parsedTextReelPostIndex = textReelPostIndexArg ? Number(textReelPostIndexArg) : null;
    const hasValidPostIndex =
      parsedTextReelPostIndex != null && !Number.isNaN(parsedTextReelPostIndex);

    const reel = hasValidPostIndex
      ? createReelFromPost(
          POSTS[Math.min(Math.max(parsedTextReelPostIndex ?? 0, 0), POSTS.length - 1)],
          {
            durationPreset: durationPresetOverride,
            slug: `heda-day${
              POSTS[Math.min(Math.max(parsedTextReelPostIndex ?? 0, 0), POSTS.length - 1)].day
            }-text-reel`,
          }
        )
      : getReelById(reelId);

    const inputProps = hasValidPostIndex
      ? {
          reel,
          durationPresetOverride,
        }
      : {
          reelId,
          durationPresetOverride,
        };

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compositionId,
      inputProps,
    });

    const outDir = path.resolve("./out");
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    const outputLocation = path.join(outDir, `${reel.slug}_text-reel.mp4`);

    console.log(`\nRendering text reel: \"${reel.title}\" (${reel.id})...`);

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation,
      inputProps,
      onProgress: ({ progress }) => {
        process.stdout.write(`\r  Progress: ${Math.round(progress * 100)}%`);
      },
    });

    console.log(`\n  Saved: ${outputLocation}`);
    console.log("\nDone!");
    return;
  }

  const indices = isAll ? Array.from({ length: POSTS.length }, (_, i) => i) : [postIndex];

  for (const idx of indices) {
    const post = POSTS[idx];
    console.log(`\nRendering Post ${idx + 1}: "${post.title}" (Day ${post.day})...`);

    const inputProps = { postIndex: idx, theme, logoScale };

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compositionId,
      inputProps,
    });

    const outDir = path.resolve("./out");
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    const outputLocation = path.join(
      outDir,
      `heda_post${post.id}_day${post.day}_reel_${theme}.mp4`
    );

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation,
      inputProps,
      onProgress: ({ progress }) => {
        process.stdout.write(`\r  Progress: ${Math.round(progress * 100)}%`);
      },
    });

    console.log(`\n  Saved: ${outputLocation}`);
  }

  console.log("\nDone!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
