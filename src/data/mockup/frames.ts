import type { DeviceFramePreset, FrameGeometry } from "./types";

/**
 * SEED geometry for the iPhone 15 Pro render, derived from the real device
 * (screen 393x852pt, corner radius 55pt, Dynamic Island 125x36.7pt sitting
 * 11pt below the screen top) assuming a body-tight crop with no shadow margin.
 *
 * These are seeds, NOT truth: if the render carries padding, every number
 * shifts. Auto-detect (utils/frameCalibration.ts) corrects them and the
 * calibration sliders are the guarantee.
 */
export const DEFAULT_IPHONE15PRO_GEOMETRY: FrameGeometry = {
  screen: { x: 0.072, y: 0.033, w: 0.856, h: 0.934 },
  screenRadius: 0.12, // 55/393 * 0.856
  screenInset: 0,
  island: { x: 0.364, y: 0.045, w: 0.272, h: 0.04 },
  islandEnabled: true,
};

export const IPHONE_15_PRO: DeviceFramePreset = {
  id: "iphone-15-pro",
  label: "iPhone 15 Pro",
  src: "/mockups/iphone-15-pro.png",
  // Overwritten with the real intrinsic size once the image decodes; only the
  // ratio naturalW/naturalH and the screenInset px conversion depend on it.
  naturalW: 1013,
  naturalH: 1974,
  geometry: DEFAULT_IPHONE15PRO_GEOMETRY,
};

export const DEVICE_FRAMES: DeviceFramePreset[] = [IPHONE_15_PRO];

export const DEFAULT_FRAME_ID = IPHONE_15_PRO.id;

export function getFrame(id: string): DeviceFramePreset {
  return DEVICE_FRAMES.find((f) => f.id === id) ?? IPHONE_15_PRO;
}
