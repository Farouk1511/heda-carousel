export type SizeGroup = "social" | "landscape" | "banner";

export interface SizePreset {
  id: string;
  label: string;
  w: number;
  h: number;
  group: SizeGroup;
}

/** Curated output-size catalog. Users may also add custom W×H sizes. */
export const SIZE_PRESETS: SizePreset[] = [
  { id: "ig-square", label: "Square 1:1", w: 1080, h: 1080, group: "social" },
  { id: "ig-portrait", label: "Portrait 4:5", w: 1080, h: 1350, group: "social" },
  { id: "story", label: "Story 9:16", w: 1080, h: 1920, group: "social" },
  { id: "fb-landscape", label: "FB / LinkedIn Link", w: 1200, h: 628, group: "landscape" },
  { id: "x-16-9", label: "X 16:9", w: 1600, h: 900, group: "landscape" },
  { id: "yt-thumb", label: "YouTube Thumbnail", w: 1280, h: 720, group: "landscape" },
  { id: "li-banner", label: "LinkedIn Banner", w: 1584, h: 396, group: "banner" },
  { id: "x-header", label: "X Header", w: 1500, h: 500, group: "banner" },
];

export const SIZE_GROUP_LABELS: Record<SizeGroup, string> = {
  social: "Social",
  landscape: "Landscape",
  banner: "Banner",
};

export const CUSTOM_SIZE_MIN = 200;
export const CUSTOM_SIZE_MAX = 4000;
