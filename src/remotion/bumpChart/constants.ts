import type { BumpFormat, BumpLineWeight, BumpPalette, BumpReelConfig } from "./config";

export const BUMP_FPS = 30;
/** Default (9:16) frame, used where no config is at hand (Studio defaults). */
export const BUMP_WIDTH = 1080;
export const BUMP_HEIGHT = 1920;

/**
 * Everything positional about one output format. The plot box's left gutter
 * holds the rank numbers; the right gutter holds each rider's name/steps pill
 * at the final day so nothing falls off-canvas.
 */
export interface BumpGeometry {
  width: number;
  height: number;
  plotLeft: number;
  plotRight: number;
  plotTop: number;
  plotBottom: number;
  avatarSize: number;
  headerTop: number;
  titleSize: number;
  subSize: number;
  footerBottom: number;
}

type FormatGeometry = Omit<BumpGeometry, "plotLeft" | "plotRight">;

const FORMAT_GEOMETRY: Record<BumpFormat, FormatGeometry> = {
  "9:16": {
    width: 1080,
    height: 1920,
    plotTop: 500,
    plotBottom: 1500,
    avatarSize: 64,
    headerTop: 96,
    titleSize: 66,
    subSize: 34,
    footerBottom: 56,
  },
  "4:5": {
    width: 1080,
    height: 1350,
    plotTop: 400,
    plotBottom: 1190,
    avatarSize: 60,
    headerTop: 72,
    titleSize: 58,
    subSize: 30,
    footerBottom: 44,
  },
  "1:1": {
    width: 1080,
    height: 1080,
    plotTop: 330,
    plotBottom: 950,
    avatarSize: 52,
    headerTop: 60,
    titleSize: 50,
    subSize: 28,
    footerBottom: 34,
  },
};

/** Without the name/steps pill the lines can run almost to the right edge. */
const PLOT_RIGHT_BY_LABELS: Record<BumpReelConfig["labels"], number> = {
  full: 790,
  name: 800,
  avatar: 980,
};

export function getBumpGeometry(config: Pick<BumpReelConfig, "format" | "labels">): BumpGeometry {
  return {
    ...FORMAT_GEOMETRY[config.format],
    plotLeft: 150,
    plotRight: PLOT_RIGHT_BY_LABELS[config.labels],
  };
}

export function getBumpFrameSize(format: BumpFormat): { width: number; height: number } {
  const { width, height } = FORMAT_GEOMETRY[format];
  return { width, height };
}

/**
 * One color per final rank, tuned for the dark card background. All values
 * are 6-digit hex so callers can append an alpha byte.
 */
const PALETTES: Record<BumpPalette, string[]> = {
  // Rank 1 is anchored on the brand violet; the rest are spread for
  // distinguishability when lines cross.
  vivid: [
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
  ],
  // Monochrome violet ramp: brightest at the top of the table.
  brand: [
    "#d8d0ff",
    "#b8a9f5",
    "#a08fe8",
    "#8b7ad8",
    "#7a67cf",
    "#705bcf",
    "#6450b8",
    "#5a45b0",
    "#4e3d99",
    "#433585",
  ],
  // Medals for the top three, muted slate for everyone else.
  podium: [
    "#ffc94d",
    "#d7dde8",
    "#e0915a",
    "#8a84a3",
    "#7f7998",
    "#76708f",
    "#6d6886",
    "#65607d",
    "#5d5874",
    "#56516c",
  ],
};

export const BUMP_COLORS = PALETTES.vivid;

export function getBumpPalette(palette: BumpPalette): string[] {
  return PALETTES[palette];
}

export const LINE_WIDTH: Record<BumpLineWeight, number> = {
  thin: 4,
  regular: 6.5,
  bold: 10,
};
