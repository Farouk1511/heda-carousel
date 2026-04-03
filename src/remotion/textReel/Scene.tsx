import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import { SAFE_AREA, TRANSITION_FRAMES, EXIT_FRAMES } from "./constants";
import type { ReelBranding, ResolvedScene } from "./model";
import { getTextEntrance, getTextExit } from "./animations";
import { highlightLine, revealWords, splitBalancedLines } from "./text";

interface SceneProps {
  scene: ResolvedScene;
  sceneIndex: number;
  totalScenes: number;
  frameInScene: number;
  fps: number;
  branding: ReelBranding;
}

export const TextReelScene: React.FC<SceneProps> = ({
  scene,
  sceneIndex,
  totalScenes,
  frameInScene,
  fps,
  branding,
}) => {
  const primaryLines = splitBalancedLines(scene.primaryText, 27, 4);
  const secondaryLines = scene.secondaryText
    ? splitBalancedLines(scene.secondaryText, 38, 3)
    : [];

  const entrance = getTextEntrance(scene.animationPreset, frameInScene, fps);

  const subtitleOpacity = interpolate(frameInScene, [8, 26], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Exit animation
  const exitStart = scene.durationInFrames - TRANSITION_FRAMES - EXIT_FRAMES;
  const isExiting = frameInScene >= exitStart;
  const exitFrameOffset = isExiting ? frameInScene - exitStart : 0;
  const exitPreset = scene.exitPreset ?? "fade-out";
  const exit = getTextExit(exitPreset, exitFrameOffset);

  const progress = (sceneIndex + 1) / Math.max(1, totalScenes);

  // Progress bar animation
  const progressBarOpacity = interpolate(frameInScene, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  const shownPrimaryText =
    scene.animationPreset === "word-reveal"
      ? revealWords(scene.primaryText, entrance.visibleWords)
      : scene.primaryText;

  const shownPrimaryLines = splitBalancedLines(shownPrimaryText, 27, 4);
  const linesToRender = scene.animationPreset === "word-reveal" ? shownPrimaryLines : primaryLines;

  return (
    <AbsoluteFill
      style={{
        paddingTop: SAFE_AREA.top,
        paddingRight: SAFE_AREA.right,
        paddingBottom: SAFE_AREA.bottom,
        paddingLeft: SAFE_AREA.left,
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          height: 6,
          width: "100%",
          borderRadius: 999,
          background: "rgba(243, 244, 250, 0.12)",
          overflow: "hidden",
          opacity: progressBarOpacity,
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            borderRadius: 999,
            background: branding.accent,
          }}
        />
      </div>

      {/* Scene counter */}
      <div style={{ marginTop: 28, marginBottom: 34 }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 18,
            letterSpacing: "0.1em",
            color: "rgba(243, 244, 250, 0.48)",
            textTransform: "uppercase",
          }}
        >
          {String(sceneIndex + 1).padStart(2, "0")} / {String(totalScenes).padStart(2, "0")}
        </div>
      </div>

      {/* Primary text - per-line stagger */}
      <div
        style={{
          marginTop: 18,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {linesToRender.map((line, idx) => {
          const lineOffset = entrance.lineDelay * idx;
          const lineFrame = Math.max(0, frameInScene - lineOffset);
          const lineEntrance = entrance.lineDelay > 0
            ? getTextEntrance(scene.animationPreset, lineFrame, fps)
            : entrance;

          return (
            <div
              key={`${line}-${idx}`}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 86,
                lineHeight: 1.06,
                letterSpacing: "-0.018em",
                color: branding.textPrimary,
                transform: `translateY(${lineEntrance.y}px) scale(${lineEntrance.scale * exit.exitScale})`,
                opacity: lineEntrance.opacity * exit.exitOpacity,
                clipPath: `inset(${(1 - lineEntrance.mask) * 100}% 0 0 0)`,
              }}
            >
              {highlightLine(line, scene.emphasisWords ?? [], branding.accent)}
            </div>
          );
        })}
      </div>

      {/* Secondary text */}
      {secondaryLines.length > 0 ? (
        <div
          style={{
            marginTop: 38,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            opacity: subtitleOpacity * exit.exitOpacity,
            transform: `translateY(${(1 - subtitleOpacity) * 14}px) scale(${exit.exitScale})`,
          }}
        >
          {secondaryLines.map((line, idx) => (
            <div
              key={`${line}-${idx}`}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                fontSize: 38,
                lineHeight: 1.28,
                color: branding.textSecondary,
                maxWidth: 880,
              }}
            >
              {line}
            </div>
          ))}
        </div>
      ) : null}

      {/* Footer branding */}
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 500,
            fontSize: 24,
            color: "rgba(243, 244, 250, 0.58)",
            letterSpacing: "0.05em",
          }}
        >
          {scene.promptText ?? "@joinheda"}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <Img
            src={staticFile(branding.logoPath)}
            style={{ width: 44, height: 44, objectFit: "contain", opacity: 0.94 }}
          />
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: 24,
              letterSpacing: "0.14em",
              color: branding.textPrimary,
            }}
          >
            {branding.brandName}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
