import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { ReelBackground } from "./textReel/Background";
import { TextReelScene } from "./textReel/Scene";
import { DEFAULT_BRANDING, TEXT_REEL_FPS, TRANSITION_FRAMES } from "./textReel/constants";
import { getReelById } from "./textReel/examples";
import type { DurationPreset, TextReel } from "./textReel/model";
import { resolveScenes } from "./textReel/timing";

export interface TextReelProps {
  reelId?: string;
  reel?: TextReel;
  durationPresetOverride?: DurationPreset;
}

const resolveTimeline = (scenes: ReturnType<typeof resolveScenes>, frame: number) => {
  let activeSceneIndex = 0;
  let frameInScene = frame;

  for (let i = 0; i < scenes.length; i++) {
    if (frameInScene < scenes[i].durationInFrames) {
      activeSceneIndex = i;
      break;
    }
    frameInScene -= scenes[i].durationInFrames;
  }

  return {
    activeSceneIndex,
    frameInScene,
  };
};

export const getTextReelDuration = (reel: TextReel, override?: DurationPreset): number => {
  const resolved = resolveScenes(reel.scenes, override ?? reel.durationPreset);
  return resolved.reduce((sum, scene) => sum + scene.durationInFrames, 0);
};

export const TextReelComposition: React.FC<TextReelProps> = ({
  reelId,
  reel,
  durationPresetOverride,
}) => {
  const frame = useCurrentFrame();

  const source = reel ?? getReelById(reelId);
  const branding = { ...DEFAULT_BRANDING, ...source.branding };
  const scenes = resolveScenes(source.scenes, durationPresetOverride ?? source.durationPreset);
  const totalFrames = scenes.reduce((sum, s) => sum + s.durationInFrames, 0);

  const { activeSceneIndex, frameInScene } = resolveTimeline(scenes, frame);
  const currentScene = scenes[activeSceneIndex];
  const isLastScene = activeSceneIndex === scenes.length - 1;
  const transitionStart = Math.max(1, currentScene.durationInFrames - TRANSITION_FRAMES);
  const softInOpacity = interpolate(frameInScene, [0, 6], [0.2, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const softOutOpacity = !isLastScene
    ? interpolate(frameInScene, [transitionStart, currentScene.durationInFrames], [0, 0.2], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.in(Easing.quad),
      })
    : 0;
  const transitionOverlayOpacity = Math.max(softInOpacity, softOutOpacity);

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: 1,
        }}
      >
        <ReelBackground
          variant={currentScene.backgroundVariant}
          frame={frame}
          accent={branding.accent}
          background={branding.background}
          totalFrames={totalFrames}
        />
        <TextReelScene
          scene={currentScene}
          sceneIndex={activeSceneIndex}
          totalScenes={scenes.length}
          frameInScene={frameInScene}
          fps={TEXT_REEL_FPS}
          branding={branding}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          backgroundColor: branding.background,
          opacity: transitionOverlayOpacity,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
