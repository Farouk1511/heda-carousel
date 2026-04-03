import {
  TRANSITION_FRAMES,
  EXIT_FRAMES,
  MIN_SCENE_FRAMES,
  DEFAULT_ANIMATION_BY_KIND,
  DEFAULT_BG_BY_KIND,
} from "./constants";
import type { DurationPreset, ReelScene, ResolvedScene } from "./model";

const TOTAL_FRAMES_BY_PRESET: Record<DurationPreset, number> = {
  "8s": 240,
  "12s": 360,
  "15s": 450,
  "20s": 600,
};

const DEFAULT_WEIGHT_BY_KIND: Record<ReelScene["kind"], number> = {
  hook: 1.6,
  statement: 1,
  insight: 1.1,
  "product-reveal": 1.2,
  cta: 1.4,
};

export const resolveScenes = (
  scenes: ReelScene[],
  preset: DurationPreset
): ResolvedScene[] => {
  const totalFrames = TOTAL_FRAMES_BY_PRESET[preset];
  const explicitTotal = scenes.reduce((sum, scene) => sum + (scene.durationInFrames ?? 0), 0);
  const autoScenes = scenes.filter((scene) => scene.durationInFrames == null);
  const autoBudget = Math.max(totalFrames - explicitTotal, MIN_SCENE_FRAMES * autoScenes.length);

  const totalWeight = autoScenes.reduce(
    (sum, scene) => sum + (scene.durationWeight ?? DEFAULT_WEIGHT_BY_KIND[scene.kind]),
    0
  );

  let assignedAuto = 0;

  return scenes.map((scene, index) => {
    const animationPreset = scene.animationPreset ?? DEFAULT_ANIMATION_BY_KIND[scene.kind];
    const backgroundVariant = scene.backgroundVariant ?? DEFAULT_BG_BY_KIND[scene.kind];

    if (scene.durationInFrames != null) {
      return {
        ...scene,
        animationPreset,
        backgroundVariant,
        durationInFrames: scene.durationInFrames,
      };
    }

    const weight = scene.durationWeight ?? DEFAULT_WEIGHT_BY_KIND[scene.kind];
    let durationInFrames = Math.max(
      MIN_SCENE_FRAMES,
      Math.round((autoBudget * weight) / Math.max(totalWeight, 0.01))
    );

    assignedAuto += durationInFrames;
    const isLastAuto = index === scenes.length - 1 || scenes.slice(index + 1).every((s) => s.durationInFrames != null);
    if (isLastAuto) {
      const correction = autoBudget - assignedAuto;
      durationInFrames += correction;
    }

    return {
      ...scene,
      animationPreset,
      backgroundVariant,
      durationInFrames,
    };
  });
};

export const getDurationByPreset = (preset: DurationPreset): number => TOTAL_FRAMES_BY_PRESET[preset];

export const getTransitionStart = (sceneDuration: number): number =>
  Math.max(1, sceneDuration - TRANSITION_FRAMES);

export const getExitStart = (sceneDuration: number): number =>
  Math.max(1, sceneDuration - TRANSITION_FRAMES - EXIT_FRAMES);
