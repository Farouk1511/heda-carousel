// gifenc ships no type declarations. Only the surface we use is declared here;
// see node_modules/gifenc/src/index.js and palettize.js for the full API.
declare module "gifenc" {
  export interface WriteFrameOptions {
    /** Milliseconds. gifenc converts to GIF's centiseconds via delay / 10. */
    delay?: number;
    /** Omit on non-first frames to reuse the global colour table. */
    palette?: number[][];
    /** -1 = play once, 0 = loop forever, >0 = count. First frame only. */
    repeat?: number;
    transparent?: boolean;
    transparentIndex?: number;
    colorDepth?: number;
    dispose?: number;
    first?: boolean;
  }

  export interface Encoder {
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      opts?: WriteFrameOptions
    ): void;
    writeHeader(): void;
    finish(): void;
    reset(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
    readonly buffer: ArrayBuffer;
  }

  export type PaletteFormat = "rgb565" | "rgb444" | "rgba4444";

  export function GIFEncoder(opts?: {
    initialCapacity?: number;
    auto?: boolean;
  }): Encoder;

  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    opts?: { format?: PaletteFormat; oneBitAlpha?: boolean; clearAlpha?: boolean }
  ): number[][];

  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray,
    palette: number[][],
    format?: PaletteFormat
  ): Uint8Array;

  export function prequantize(
    rgba: Uint8Array | Uint8ClampedArray,
    opts?: { roundRGB?: number; roundAlpha?: number; oneBitAlpha?: boolean }
  ): void;

  export function nearestColorIndex(
    palette: number[][],
    pixel: number[]
  ): number;

  const _default: typeof GIFEncoder;
  export default _default;
}
