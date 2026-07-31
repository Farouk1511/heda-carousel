import type { FrameGeometry, NormRect } from "../data/mockup/types";

/**
 * Auto-calibrate a device frame render by finding its screen aperture.
 *
 * The aperture in these product renders is a large, near-white, fully opaque
 * region, which makes it separable by threshold. Tuned for a clean render — if
 * a different asset misbehaves, these constants are the knobs, and the manual
 * sliders remain the guarantee.
 */
const MAX_SAMPLE_WIDTH = 512;
const SCREEN_MIN_LUMA = 235; // r,g,b all above this
const SCREEN_MIN_ALPHA = 200;
/** A row/column counts as "inside the screen" above this share of the peak
 *  count. Deliberately not a flood fill: a specular highlight running down the
 *  titanium rail touches the aperture and a flood fill would swallow it, while
 *  a projection threshold ignores it because the highlight is only a few px
 *  wide against a peak of hundreds. */
const BAND_THRESHOLD = 0.5;
/** Rows (in the downsampled image) sampled to solve for the corner radius.
 *  Skipping the first few avoids the antialiased top edge. */
const CORNER_PROBE_FIRST = 3;
const CORNER_PROBE_LAST = 18;
/** The island search only looks at the top slice of the aperture. */
const ISLAND_BAND = 0.12;
const ISLAND_MIN_W = 0.15;
const ISLAND_MAX_W = 0.5;

export interface DetectionResult {
  geometry: Partial<FrameGeometry>;
  ok: boolean;
  message?: string;
}

export function detectFrameGeometry(
  img: HTMLImageElement
): DetectionResult {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (!iw || !ih) return { geometry: {}, ok: false, message: "Frame not loaded." };

  const scale = Math.min(1, MAX_SAMPLE_WIDTH / iw);
  const w = Math.max(1, Math.round(iw * scale));
  const h = Math.max(1, Math.round(ih * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { geometry: {}, ok: false, message: "Canvas unavailable." };
  ctx.drawImage(img, 0, 0, w, h);

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, w, h).data;
  } catch {
    return { geometry: {}, ok: false, message: "Frame image is cross-origin." };
  }

  const isScreen = (x: number, y: number): boolean => {
    const i = (y * w + x) * 4;
    return (
      data[i + 3] > SCREEN_MIN_ALPHA &&
      data[i] > SCREEN_MIN_LUMA &&
      data[i + 1] > SCREEN_MIN_LUMA &&
      data[i + 2] > SCREEN_MIN_LUMA
    );
  };

  const rowCounts = new Array<number>(h).fill(0);
  const colCounts = new Array<number>(w).fill(0);
  // Leftmost/rightmost screen pixel per row. The corner-radius solver needs the
  // row's EXTENT, not its pixel count: the Dynamic Island is a black hole in
  // the middle of the top rows, so counting pixels there under-reports the run
  // and the solver reads it as an enormous corner.
  const rowMinX = new Array<number>(h).fill(-1);
  const rowMaxX = new Array<number>(h).fill(-1);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (isScreen(x, y)) {
        rowCounts[y]++;
        colCounts[x]++;
        if (rowMinX[y] < 0) rowMinX[y] = x;
        rowMaxX[y] = x;
      }
    }
  }

  const rowBand = contiguousBand(rowCounts);
  const colBand = contiguousBand(colCounts);
  if (!rowBand || !colBand) {
    return {
      geometry: {},
      ok: false,
      message: "Couldn't find a screen area — calibrate manually.",
    };
  }

  const screen: NormRect = {
    x: colBand.start / w,
    y: rowBand.start / h,
    w: (colBand.end - colBand.start + 1) / w,
    h: (rowBand.end - rowBand.start + 1) / h,
  };

  const boxW = colBand.end - colBand.start + 1;
  const radiusPx = solveCornerRadius(rowMinX, rowMaxX, rowBand.start, boxW);
  const screenRadius = radiusPx / w;

  // Island: the bounding box of non-white opaque pixels in the top slice of
  // the aperture.
  const islandBottom = Math.min(
    rowBand.end,
    Math.round(rowBand.start + (rowBand.end - rowBand.start) * ISLAND_BAND)
  );
  let minX = w;
  let maxX = -1;
  let minY = h;
  let maxY = -1;
  for (let y = rowBand.start; y <= islandBottom; y++) {
    for (let x = colBand.start; x <= colBand.end; x++) {
      const i = (y * w + x) * 4;
      const opaque = data[i + 3] > SCREEN_MIN_ALPHA;
      const dark =
        data[i] < SCREEN_MIN_LUMA ||
        data[i + 1] < SCREEN_MIN_LUMA ||
        data[i + 2] < SCREEN_MIN_LUMA;
      // Ignore the rounded corners, which are also dark-and-opaque.
      const nearCorner =
        x < colBand.start + radiusPx || x > colBand.end - radiusPx;
      if (opaque && dark && !nearCorner) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const geometry: Partial<FrameGeometry> = { screen, screenRadius };
  if (maxX > minX && maxY > minY) {
    const islandW = (maxX - minX + 1) / boxW;
    if (islandW > ISLAND_MIN_W && islandW < ISLAND_MAX_W) {
      geometry.island = {
        x: minX / w,
        y: minY / h,
        w: (maxX - minX + 1) / w,
        h: (maxY - minY + 1) / h,
      };
      geometry.islandEnabled = true;
    }
  }

  return { geometry, ok: true };
}

/**
 * Solve for the corner radius from how the screen run widens near the top.
 *
 * At depth `d` below the box top, each corner arc is still missing `m` px from
 * the full box width, and the two are related by the circle:
 *
 *   r^2 - (r - d)^2 = (r - m)^2   =>   r = m + d + sqrt(2*m*d)
 *
 * Counting rows until the run "looks full" instead — the obvious approach —
 * stops short by r - sqrt(2*r*eps), which measured ~16% low on a 120px radius.
 * Several probe rows are solved independently and the median taken, so one
 * noisy scanline can't skew the answer.
 */
function solveCornerRadius(
  rowMinX: number[],
  rowMaxX: number[],
  top: number,
  boxW: number
): number {
  const est: number[] = [];
  for (let d = CORNER_PROBE_FIRST; d <= CORNER_PROBE_LAST; d++) {
    const lo = rowMinX[top + d];
    const hi = rowMaxX[top + d];
    if (lo === undefined || lo < 0 || hi < 0) break;
    const run = hi - lo + 1;
    const m = (boxW - run) / 2;
    if (m <= 0) break; // already at full width — no corner left to measure
    est.push(m + d + Math.sqrt(2 * m * d));
  }
  if (!est.length) return 0;
  est.sort((a, b) => a - b);
  const mid = Math.floor(est.length / 2);
  const median =
    est.length % 2 ? est[mid] : (est[mid - 1] + est[mid]) / 2;
  return Math.min(median, boxW / 2);
}

/** Longest contiguous run of entries above BAND_THRESHOLD * max. */
function contiguousBand(
  counts: number[]
): { start: number; end: number } | null {
  const max = Math.max(...counts);
  if (max <= 0) return null;
  const cutoff = max * BAND_THRESHOLD;
  let best: { start: number; end: number } | null = null;
  let start = -1;
  for (let i = 0; i <= counts.length; i++) {
    const inside = i < counts.length && counts[i] > cutoff;
    if (inside && start < 0) start = i;
    if (!inside && start >= 0) {
      const run = { start, end: i - 1 };
      if (!best || run.end - run.start > best.end - best.start) best = run;
      start = -1;
    }
  }
  return best;
}
