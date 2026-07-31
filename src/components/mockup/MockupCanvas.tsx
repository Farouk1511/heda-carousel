import React, { useRef } from "react";
import type {
  DeviceFramePreset,
  FrameGeometry,
  MockupItem,
  MockupScene,
  ScreenTransform,
} from "../../data/mockup/types";
import {
  clampPan,
  frameDrawRect,
  round4,
  screenRectPx,
} from "../../data/mockup/geometry";
import { backgroundCss } from "../../utils/mockupRender";
import { PhoneFrame } from "./PhoneFrame";

export interface MockupCanvasProps {
  frame: DeviceFramePreset;
  geom: FrameGeometry;
  scene: MockupScene;
  item: MockupItem | null;
  mediaUrl?: string;
  w: number;
  h: number;
  overlay?: boolean;
  onFrameError?: () => void;
  /** Injected by MockupStage; compensates pointer deltas for the CSS scale. */
  previewScale?: number;
  onPanChange?: (id: string, patch: Partial<ScreenTransform>) => void;
  onResetTransform?: (id: string) => void;
}

/**
 * Renders at the FULL output size and is scaled down by MockupStage, so the
 * preview's coordinate space is literally the export's coordinate space.
 */
export const MockupCanvas: React.FC<MockupCanvasProps> = ({
  frame,
  geom,
  scene,
  item,
  mediaUrl,
  w,
  h,
  overlay,
  onFrameError,
  previewScale = 1,
  onPanChange,
  onResetTransform,
}) => {
  const dragRef = useRef<{
    px: number;
    py: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const fr = frameDrawRect(scene, frame, w, h);
  const sr = screenRectPx(geom, fr, frame);
  const canPan = Boolean(item && mediaUrl && onPanChange);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!canPan || !item) return;
    e.preventDefault();
    dragRef.current = {
      px: e.clientX,
      py: e.clientY,
      offsetX: item.transform.offsetX,
      offsetY: item.transform.offsetY,
    };
    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    } catch {
      /* no-op */
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || !canPan || !item || !onPanChange) return;
    // Divide by previewScale: pointer deltas arrive in screen px but offsets
    // live in the canvas's own (full-size) coordinate space.
    const dxs = (e.clientX - drag.px) / previewScale;
    const dys = (e.clientY - drag.py) / previewScale;
    const next: ScreenTransform = {
      ...item.transform,
      offsetX: drag.offsetX + dxs / sr.w,
      offsetY: drag.offsetY + dys / sr.h,
    };
    const clamped = clampPan(
      item.media.naturalW,
      item.media.naturalH,
      sr,
      next
    );
    onPanChange(item.id, {
      offsetX: round4(clamped.offsetX),
      offsetY: round4(clamped.offsetY),
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current = null;
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {
      /* no-op */
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    if (!canPan || !item || !onPanChange || !e.ctrlKey) return;
    e.preventDefault();
    const scale = Math.max(
      0.5,
      Math.min(3, item.transform.scale * (e.deltaY < 0 ? 1.05 : 1 / 1.05))
    );
    const next = { ...item.transform, scale };
    const clamped = clampPan(item.media.naturalW, item.media.naturalH, sr, next);
    onPanChange(item.id, {
      scale: round4(scale),
      offsetX: round4(clamped.offsetX),
      offsetY: round4(clamped.offsetY),
    });
  };

  return (
    <div
      style={{
        position: "relative",
        width: w,
        height: h,
        overflow: "hidden",
        background: backgroundCss(scene.background),
      }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
      onDoubleClick={() => item && onResetTransform?.(item.id)}
    >
      <PhoneFrame
        frame={frame}
        geom={geom}
        scene={scene}
        frameRect={fr}
        item={item}
        mediaUrl={mediaUrl}
        overlay={overlay}
        onFrameError={onFrameError}
        draggable={canPan}
        onScreenPointerDown={onPointerDown}
      />
    </div>
  );
};
