import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";
import { POSTS } from "../data/posts";
import type { ThemeName } from "../data/themes";
import { Card } from "../components/Card";
import { REEL_PRESET, getSceneDurations } from "./reelPreset";

loadSpaceGrotesk("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
loadDMSans("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
loadJetBrainsMono("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export interface ReelProps {
  postIndex: number;
  theme: ThemeName;
  logoScale?: number;
}

const cleanHeadline = (value: string): string => value.replace(/\*\*/g, "");

export const ReelComposition: React.FC<ReelProps> = ({ postIndex, theme, logoScale = 1 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const safePostIndex = Math.min(Math.max(postIndex, 0), POSTS.length - 1);
  const post = POSTS[safePostIndex];
  const sceneDurations = getSceneDurations(post.slides.length);
  const mainFrames = sceneDurations.reduce((sum, item) => sum + item, 0);
  const inLoopTail = frame >= mainFrames;

  if (inLoopTail) {
    const tailFrame = frame - mainFrames;
    const fadeIn = interpolate(tailFrame, [0, 12], [0, 1], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    });

    const hookText = cleanHeadline(post.slides[0]?.headline ?? "");
    const compactHook =
      hookText.length > 64 ? `${hookText.slice(0, 61).trimEnd()}...` : hookText;

    return (
      <AbsoluteFill style={{ backgroundColor: "#0a0a12" }}>
        <Card
          post={post}
          slideIndex={post.slides.length - 1}
          theme={theme}
          width={width}
          height={height}
          logoSrc={staticFile("LOGO.png")}
          logoScale={logoScale}
          animationProgress={1}
          dotAnimationProgress={1}
        />
        <AbsoluteFill
          style={{
            justifyContent: "flex-start",
            alignItems: "center",
            paddingTop: 96,
            opacity: fadeIn,
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 26,
              letterSpacing: "0.05em",
              color: "rgba(232, 230, 240, 0.88)",
              background: "rgba(10, 10, 18, 0.6)",
              border: "1px solid rgba(112,91,207,0.3)",
              borderRadius: 999,
              padding: "14px 28px",
              backdropFilter: "blur(3px)",
              maxWidth: 920,
              textAlign: "center",
            }}
          >
            {compactHook}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  let currentSlideIndex = 0;
  let frameInScene = frame;
  for (let i = 0; i < sceneDurations.length; i++) {
    if (frameInScene < sceneDurations[i]) {
      currentSlideIndex = i;
      break;
    }
    frameInScene -= sceneDurations[i];
  }

  const currentSceneFrames = sceneDurations[currentSlideIndex];
  const isLastSlide = currentSlideIndex === post.slides.length - 1;
  const transitionStart = Math.max(
    1,
    currentSceneFrames - REEL_PRESET.transitionFrames
  );
  const softInOpacity = interpolate(frameInScene, [0, 6], [0.2, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const softOutOpacity = !isLastSlide
    ? interpolate(frameInScene, [transitionStart, currentSceneFrames], [0, 0.2], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.in(Easing.quad),
      })
    : 0;
  const transitionOverlayOpacity = Math.max(softInOpacity, softOutOpacity);

  const headlineProgress = interpolate(
    frameInScene,
    [0, REEL_PRESET.introHeadlineFrames],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  const subtitleProgress = interpolate(
    frameInScene,
    [
      REEL_PRESET.introSubtitleDelayFrames,
      REEL_PRESET.introSubtitleDelayFrames + REEL_PRESET.introSubtitleFrames,
    ],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  const textProgress = Math.min(headlineProgress, subtitleProgress + 0.15);
  const dotProgress = interpolate(frameInScene, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a12" }}>
      <AbsoluteFill
        style={{
          opacity: 1,
        }}
      >
        <Card
          post={post}
          slideIndex={currentSlideIndex}
          theme={theme}
          width={width}
          height={height}
          logoSrc={staticFile("LOGO.png")}
          logoScale={logoScale}
          animationProgress={textProgress}
          dotAnimationProgress={dotProgress}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          backgroundColor: "#0a0a12",
          opacity: transitionOverlayOpacity,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

export const getReelDuration = (slideCount: number): number => {
  const sceneDurations = getSceneDurations(slideCount);
  return sceneDurations.reduce((sum, item) => sum + item, 0) + REEL_PRESET.loopTailFrames;
};
