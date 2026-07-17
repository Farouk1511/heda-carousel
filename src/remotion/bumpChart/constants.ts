export const BUMP_FPS = 30;
export const BUMP_WIDTH = 1080;
export const BUMP_HEIGHT = 1920;

/**
 * Plot box inside the 1080x1920 frame. The left gutter holds the rank
 * numbers; the right gutter holds each rider's name/steps pill at the final
 * day so nothing falls off-canvas.
 */
export const PLOT_LEFT = 150;
export const PLOT_RIGHT = 790;
export const PLOT_TOP = 500;
export const PLOT_BOTTOM = 1500;

export const AVATAR_SIZE = 64;

/**
 * One color per final rank, tuned for the dark card background. Rank 1 is
 * anchored on the brand violet (THEMES accentLight); the rest are spread for
 * distinguishability when lines cross.
 */
export const BUMP_COLORS = [
  "#8b7ad8", // brand violet
  "#4cc9f0", // cyan
  "#40d9a4", // mint
  "#ffc94d", // amber
  "#ff7a6b", // coral
  "#f472b6", // pink
  "#a3e635", // lime
  "#fb923c", // orange
  "#93c5fd", // periwinkle
  "#e2e8f0", // silver
];
