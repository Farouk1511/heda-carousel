import React from "react";
import type {
  DeviceFramePreset,
  FrameGeometry,
  MockupItem,
  MockupScene,
} from "../../data/mockup/types";
import {
  clampRadius,
  fitRect,
  islandRectPx,
  screenRectPx,
  type Rect,
} from "../../data/mockup/geometry";

interface PhoneFrameProps {
  frame: DeviceFramePreset;
  geom: FrameGeometry;
  scene: MockupScene;
  /** Device box in canvas px, from frameDrawRect(). */
  frameRect: Rect;
  item: MockupItem | null;
  mediaUrl?: string;
  overlay?: boolean;
  onFrameError?: () => void;
  onScreenPointerDown?: (e: React.PointerEvent) => void;
  draggable?: boolean;
}

/**
 * DOM twin of compositeMockup(). Same normalized geometry, same fitRect() —
 * the media is positioned in px rather than with CSS object-fit, because
 * object-position's percentage semantics are a different function once the
 * image overflows its box, and that mismatch is exactly how a preview drifts
 * away from its export.
 */
export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  frame,
  geom,
  scene,
  frameRect: fr,
  item,
  mediaUrl,
  overlay,
  onFrameError,
  onScreenPointerDown,
  draggable,
}) => {
  // Rects come back in canvas coordinates; the wrapper is positioned at fr, so
  // subtract its origin to get frame-local coordinates.
  const sr = screenRectPx(geom, fr, frame);
  const ir = islandRectPx(geom, fr);
  const local = { x: sr.x - fr.x, y: sr.y - fr.y };

  const drawable = item && mediaUrl ? item : null;
  const media = drawable?.media ?? null;
  const mediaRect =
    drawable && media
      ? fitRect(
          media.naturalW,
          media.naturalH,
          { x: 0, y: 0, w: sr.w, h: sr.h },
          drawable.transform
        )
      : null;

  return (
    <div
      style={{
        position: "absolute",
        left: fr.x,
        top: fr.y,
        width: fr.w,
        height: fr.h,
        transform: scene.phoneRotation
          ? `rotate(${scene.phoneRotation}deg)`
          : undefined,
        filter: scene.shadow
          ? `drop-shadow(0 ${fr.w * 0.045}px ${fr.w * 0.1}px rgba(0,0,0,0.45))`
          : undefined,
      }}
    >
      <img
        src={frame.src}
        alt=""
        draggable={false}
        onError={onFrameError}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />

      {/* Screen sits ON TOP of the bezel: the render's screen area is opaque,
          so there is no cutout to fill from behind. */}
      <div
        onPointerDown={onScreenPointerDown}
        style={{
          position: "absolute",
          left: local.x,
          top: local.y,
          width: sr.w,
          height: sr.h,
          borderRadius: clampRadius(sr.radius, sr.w, sr.h),
          overflow: "hidden",
          cursor: draggable ? "grab" : "default",
          touchAction: "none",
        }}
      >
        {media && mediaRect && mediaUrl ? (
          media.kind === "video" ? (
            <video
              src={mediaUrl}
              muted
              loop
              autoPlay
              playsInline
              style={{
                position: "absolute",
                left: mediaRect.x,
                top: mediaRect.y,
                width: mediaRect.w,
                height: mediaRect.h,
                pointerEvents: "none",
              }}
            />
          ) : (
            <img
              src={mediaUrl}
              alt=""
              draggable={false}
              style={{
                position: "absolute",
                left: mediaRect.x,
                top: mediaRect.y,
                width: mediaRect.w,
                height: mediaRect.h,
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
          )
        ) : null}

        {scene.glare && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 42%)",
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      {geom.islandEnabled && (
        <div
          style={{
            position: "absolute",
            left: ir.x - fr.x,
            top: ir.y - fr.y,
            width: ir.w,
            height: ir.h,
            borderRadius: ir.h / 2,
            background: "#000",
            pointerEvents: "none",
          }}
        />
      )}

      {overlay && (
        <>
          <div
            style={{
              position: "absolute",
              left: local.x,
              top: local.y,
              width: sr.w,
              height: sr.h,
              borderRadius: clampRadius(sr.radius, sr.w, sr.h),
              outline: `${Math.max(2, fr.w / 200)}px solid rgba(255,0,255,0.75)`,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: ir.x - fr.x,
              top: ir.y - fr.y,
              width: ir.w,
              height: ir.h,
              borderRadius: ir.h / 2,
              outline: `${Math.max(2, fr.w / 260)}px solid rgba(255,0,255,0.75)`,
              pointerEvents: "none",
            }}
          />
        </>
      )}
    </div>
  );
};
