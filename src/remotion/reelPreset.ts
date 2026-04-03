export const REEL_PRESET = {
  fps: 30,
  width: 1080,
  height: 1920,
  transitionFrames: 22,
  introHeadlineFrames: 26,
  introSubtitleDelayFrames: 14,
  introSubtitleFrames: 26,
  loopTailFrames: 45,
  fiveSlideDurations: [78, 80, 90, 96, 151],
} as const;

export const getSceneDurations = (slideCount: number): number[] => {
  if (slideCount <= 0) {
    return [];
  }

  if (slideCount === 5) {
    return [...REEL_PRESET.fiveSlideDurations];
  }

  if (slideCount === 1) {
    return [REEL_PRESET.fiveSlideDurations[4]];
  }

  const hook = Number(REEL_PRESET.fiveSlideDurations[0]);
  const cta = Number(REEL_PRESET.fiveSlideDurations[4]);
  const middleCount = slideCount - 2;
  const middleTotal = 495 - hook - cta;
  const perMiddle = Math.floor(middleTotal / middleCount);
  const durations: number[] = [hook];

  for (let i = 0; i < middleCount; i++) {
    durations.push(perMiddle);
  }

  const used = hook + cta + perMiddle * middleCount;
  durations[durations.length - 1] += 495 - used;
  durations.push(cta);
  return durations;
};

export const getReelDuration = (slideCount: number): number => {
  const sceneDurations = getSceneDurations(slideCount);
  const main = sceneDurations.reduce((sum, item) => sum + item, 0);
  return main + REEL_PRESET.loopTailFrames;
};
