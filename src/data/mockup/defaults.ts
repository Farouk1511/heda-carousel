import { DEFAULT_FRAME_ID } from "./frames";
import type {
  GifSettings,
  MockupDoc,
  MockupItem,
  MockupMedia,
  MockupScene,
  ScreenTransform,
} from "./types";

let seq = 0;

/** Mirrors newId() in data/marketing/defaults.ts. */
export function newId(prefix: string): string {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}-${seq.toString(36)}`;
}

export const DEFAULT_TRANSFORM: ScreenTransform = {
  fit: "cover",
  scale: 1,
  offsetX: 0,
  offsetY: 0,
};

export const DEFAULT_SCENE: MockupScene = {
  background: { type: "gradient", from: "#2a2340", to: "#0f0d17", angle: 160 },
  phoneHeight: 0.82,
  phoneOffsetX: 0,
  phoneOffsetY: 0,
  phoneRotation: 0,
  shadow: true,
  glare: false,
};

export const DEFAULT_GIF_SETTINGS: GifSettings = {
  fps: 12.5,
  maxEdge: 640,
  palette: "shared",
  loop: true,
};

export function makeMockupItem(media: MockupMedia, name: string): MockupItem {
  return {
    id: newId("mi"),
    name,
    media,
    transform: { ...DEFAULT_TRANSFORM },
    trim:
      media.kind === "video"
        ? { startSec: 0, endSec: media.durationSec ?? 0 }
        : undefined,
  };
}

export function makeMockupDoc(name = "Untitled mockups"): MockupDoc {
  return {
    id: newId("md"),
    name,
    frameId: DEFAULT_FRAME_ID,
    sizeId: "ig-portrait",
    scene: { ...DEFAULT_SCENE, background: { ...DEFAULT_SCENE.background } },
    items: [],
    activeItemId: null,
    gif: { ...DEFAULT_GIF_SETTINGS },
  };
}
