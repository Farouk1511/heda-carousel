/** A rect normalized against the frame PNG's intrinsic pixels: x/w are
 *  fractions of frame width, y/h fractions of frame height. */
export interface NormRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FrameGeometry {
  /** The screen aperture inside the frame render. */
  screen: NormRect;
  /** Corner radius as a fraction of frame WIDTH only — one axis, so uniform
   *  scaling keeps the corners circular in both the DOM and the canvas. */
  screenRadius: number;
  /** Outward bleed of the screen clip, in FRAME-NATIVE px. Kills the hairline
   *  halo where the screenshot's antialiased corner meets the opaque bezel.
   *  Negative pulls the screenshot in. */
  screenInset: number;
  /** Dynamic Island pill, same normalized space as `screen`. Radius = h/2. */
  island: NormRect;
  islandEnabled: boolean;
}

export interface DeviceFramePreset {
  id: string;
  label: string;
  /** Public-path URL of the frame render. */
  src: string;
  /** Intrinsic pixel size — converts `screenInset` px into normalized units. */
  naturalW: number;
  naturalH: number;
  /** Seed geometry; user calibration overrides it per frame id. */
  geometry: FrameGeometry;
}

export type MediaKind = "image" | "video";
export type FitMode = "cover" | "contain";

export interface MockupMedia {
  /** Key into the IndexedDB blob store (see utils/mediaStore.ts). */
  mediaId: string;
  kind: MediaKind;
  fileName: string;
  mimeType: string;
  naturalW: number;
  naturalH: number;
  /** Videos only. */
  durationSec?: number;
}

export interface ScreenTransform {
  fit: FitMode;
  /** Extra zoom over the fit baseline; 1 = none. */
  scale: number;
  /** Pan, as a fraction of the SCREEN RECT width/height — resolution
   *  independent, so the same value pans identically at any export size. */
  offsetX: number;
  offsetY: number;
}

export type MockupBackground =
  | { type: "none" }
  | { type: "color"; color: string }
  | { type: "gradient"; from: string; to: string; angle: number };

export interface MockupScene {
  background: MockupBackground;
  /** Device height as a fraction of canvas height. */
  phoneHeight: number;
  /** Centre offset, as a fraction of canvas width/height. */
  phoneOffsetX: number;
  phoneOffsetY: number;
  /** Degrees. */
  phoneRotation: number;
  shadow: boolean;
  glare: boolean;
}

export interface VideoTrim {
  startSec: number;
  endSec: number;
}

export interface MockupItem {
  id: string;
  name: string;
  media: MockupMedia;
  transform: ScreenTransform;
  /** Videos only. */
  trim?: VideoTrim;
}

export type PaletteMode = "shared" | "per-frame";

export interface GifSettings {
  /** Must come from GIF_FPS_OPTIONS — see utils/gifExport.ts. */
  fps: number;
  /** Longest output edge, px. */
  maxEdge: number;
  palette: PaletteMode;
  loop: boolean;
}

export interface MockupDoc {
  id: string;
  name: string;
  frameId: string;
  /** SizePreset id from data/marketing/sizes.ts, or "custom". */
  sizeId: string;
  customW?: number;
  customH?: number;
  scene: MockupScene;
  /** Batch model: each item is an independent mockup sharing the scene. */
  items: MockupItem[];
  activeItemId: string | null;
  gif: GifSettings;
}
