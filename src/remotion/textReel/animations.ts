import { Easing, interpolate, spring } from "remotion";
import type { AnimationPreset, ExitPreset } from "./model";

export interface TextEntranceResult {
  opacity: number;
  y: number;
  scale: number;
  mask: number;
  visibleWords: number;
  lineDelay: number;
}

export const getTextEntrance = (
  preset: AnimationPreset,
  frame: number,
  fps: number
): TextEntranceResult => {
  const baseOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const fadeUpY = interpolate(frame, [0, 22], [30, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const driftScale = interpolate(frame, [0, 30], [1.03, 1], {
    extrapolateRight: "clamp",
  });

  const mask = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  if (preset === "mask-reveal") {
    return {
      opacity: baseOpacity,
      y: 0,
      scale: 1,
      mask,
      visibleWords: 999,
      lineDelay: 0,
    };
  }

  if (preset === "word-reveal") {
    const progress = spring({
      frame,
      fps,
      durationInFrames: 30,
      config: { damping: 18, stiffness: 180, mass: 0.6 },
    });
    return {
      opacity: 1,
      y: 0,
      scale: 1,
      mask: 1,
      visibleWords: Math.max(1, Math.round(progress * 22)),
      lineDelay: 0,
    };
  }

  if (preset === "drift-in") {
    return {
      opacity: baseOpacity,
      y: fadeUpY * 0.6,
      scale: driftScale,
      mask: 1,
      visibleWords: 999,
      lineDelay: 0,
    };
  }

  if (preset === "stagger-lines") {
    return {
      opacity: baseOpacity,
      y: fadeUpY,
      scale: 1,
      mask: 1,
      visibleWords: 999,
      lineDelay: 5,
    };
  }

  if (preset === "scale-bounce") {
    const bounceProgress = spring({
      frame,
      fps,
      durationInFrames: 28,
      config: { damping: 12, stiffness: 200, mass: 0.5 },
    });
    const bounceScale = interpolate(bounceProgress, [0, 1], [0.92, 1]);
    const bounceOpacity = interpolate(frame, [0, 16], [0, 1], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    });
    return {
      opacity: bounceOpacity,
      y: 0,
      scale: bounceScale,
      mask: 1,
      visibleWords: 999,
      lineDelay: 0,
    };
  }

  // Default: fade-up
  return {
    opacity: baseOpacity,
    y: fadeUpY,
    scale: 1,
    mask: 1,
    visibleWords: 999,
    lineDelay: 0,
  };
};

export const getTextExit = (
  preset: ExitPreset,
  frameFromExit: number,
): { exitOpacity: number; exitScale: number } => {
  if (preset === "none") return { exitOpacity: 1, exitScale: 1 };

  const progress = interpolate(frameFromExit, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });

  if (preset === "scale-down") {
    return {
      exitOpacity: 1 - progress * 0.4,
      exitScale: 1 - progress * 0.05,
    };
  }

  // "fade-out"
  return {
    exitOpacity: 1 - progress,
    exitScale: 1,
  };
};
