import React, { useRef } from "react";
import type {
  BrandKit,
  CanvasElement,
  Design,
  DesignSize,
  ImageElement,
  ShapeElement,
  TextElement,
} from "../../data/marketing/types";
import {
  isHidden,
  resolveBackground,
  resolveColor,
  resolveElement,
  resolveFont,
  sizeScale,
} from "../../data/marketing/resolve";
import { RichText } from "../RichText";

/** Callbacks + view state that turn the canvas into an interactive editor. */
export interface CanvasInteractive {
  previewScale: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMoveElement: (id: string, fx: number, fy: number) => void;
  onResizeElement: (id: string, patch: { w?: number; h?: number; fontSize?: number }) => void;
}

export interface MarketingCanvasProps {
  design: Design;
  size: DesignSize;
  brand: BrandKit;
  assets?: Record<string, string>;
  interactive?: CanvasInteractive;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const round4 = (n: number) => Math.round(n * 1e4) / 1e4;

export const MarketingCanvas: React.FC<MarketingCanvasProps> = ({
  design,
  size,
  brand,
  assets = {},
  interactive,
}) => {
  const s = sizeScale(size);
  return (
    <div
      style={{
        position: "relative",
        width: size.w,
        height: size.h,
        overflow: "hidden",
        background: resolveBackground(design.background, brand),
        cursor: interactive ? "default" : undefined,
      }}
      onPointerDown={
        interactive
          ? (e) => {
              if (e.target === e.currentTarget) interactive.onSelect(null);
            }
          : undefined
      }
    >
      {design.elements.map((el) => {
        if (isHidden(el, size.id)) return null;
        const r = resolveElement(el, size.id);
        return (
          <ElementView
            key={el.id}
            el={r}
            s={s}
            w={size.w}
            h={size.h}
            brand={brand}
            assets={assets}
            interactive={interactive}
          />
        );
      })}
    </div>
  );
};

interface ElementViewProps {
  el: CanvasElement;
  s: number;
  w: number;
  h: number;
  brand: BrandKit;
  assets: Record<string, string>;
  interactive?: CanvasInteractive;
}

const ElementView: React.FC<ElementViewProps> = ({
  el,
  s,
  w,
  h,
  brand,
  assets,
  interactive,
}) => {
  const dragRef = useRef<{ px: number; py: number; fx: number; fy: number } | null>(null);
  const resizeRef = useRef<{ px: number; base: number; startW: number } | null>(null);

  const selected = interactive?.selectedId === el.id;
  const previewScale = interactive?.previewScale ?? 1;

  const wrapperStyle: React.CSSProperties = {
    position: "absolute",
    left: el.fx * w,
    top: el.fy * h,
    transform: `translate(-50%, -50%) rotate(${el.rotation}deg)`,
    opacity: el.opacity,
    cursor: interactive ? "move" : undefined,
    outline: selected ? `${1.5 / previewScale}px solid #705bcf` : undefined,
    outlineOffset: `${4 / previewScale}px`,
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    interactive.onSelect(el.id);
    if (el.locked) return;
    dragRef.current = { px: e.clientX, py: e.clientY, fx: el.fx, fy: el.fy };
    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    } catch {
      /* no-op */
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !interactive) return;
    const dxs = (e.clientX - dragRef.current.px) / previewScale;
    const dys = (e.clientY - dragRef.current.py) / previewScale;
    interactive.onMoveElement(
      el.id,
      round4(clamp01(dragRef.current.fx + dxs / w)),
      round4(clamp01(dragRef.current.fy + dys / h))
    );
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current = null;
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {
      /* no-op */
    }
  };

  // Resize (bottom-right handle) — X-axis delta in base units.
  const onResizeDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    const base =
      el.type === "text" ? el.fontSize : (el as ImageElement | ShapeElement).w;
    resizeRef.current = { px: e.clientX, base, startW: base };
    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    } catch {
      /* no-op */
    }
  };
  const onResizeMove = (e: React.PointerEvent) => {
    if (!resizeRef.current || !interactive) return;
    const dBase = (e.clientX - resizeRef.current.px) / previewScale / s;
    const next = resizeRef.current.base + dBase;
    if (el.type === "text") {
      interactive.onResizeElement(el.id, {
        fontSize: Math.max(8, Math.min(400, Math.round(next))),
      });
    } else if (el.type === "image") {
      interactive.onResizeElement(el.id, {
        w: Math.max(20, Math.min(4000, Math.round(next))),
      });
    } else {
      const shape = el as ShapeElement;
      const newW = Math.max(8, Math.min(4000, Math.round(next)));
      const ratio = shape.h / (resizeRef.current.startW || 1);
      interactive.onResizeElement(el.id, { w: newW, h: Math.round(newW * ratio) });
    }
  };
  const onResizeUp = (e: React.PointerEvent) => {
    resizeRef.current = null;
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {
      /* no-op */
    }
  };

  const handle = selected && interactive && (
    <div
      onPointerDown={onResizeDown}
      onPointerMove={onResizeMove}
      onPointerUp={onResizeUp}
      style={{
        position: "absolute",
        right: 0,
        bottom: 0,
        width: 12 / previewScale,
        height: 12 / previewScale,
        transform: "translate(50%, 50%)",
        background: "#705bcf",
        border: `${1.5 / previewScale}px solid #fff`,
        borderRadius: "50%",
        cursor: "nwse-resize",
        zIndex: 2,
      }}
    />
  );

  const commonProps = interactive
    ? { onPointerDown, onPointerMove, onPointerUp }
    : {};

  let content: React.ReactNode;
  if (el.type === "text") content = renderText(el, s, brand);
  else if (el.type === "image") content = renderImage(el, s, assets);
  else content = renderShape(el, s, brand);

  return (
    <div style={wrapperStyle} {...commonProps}>
      {content}
      {handle}
    </div>
  );
};

function renderText(el: TextElement, s: number, brand: BrandKit) {
  const style: React.CSSProperties = {
    width: el.maxWidth * s,
    fontFamily: resolveFont(el.fontFamily, brand),
    fontSize: el.fontSize * s,
    fontWeight: el.fontWeight,
    color: resolveColor(el.color, brand),
    textAlign: el.align,
    lineHeight: el.lineHeight,
    letterSpacing: `${el.letterSpacing}em`,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };
  return (
    <div style={style}>
      <RichText
        text={el.text}
        tokens={{
          accent: brand.colors.accent,
          highlightBg: brand.colors.highlight,
          highlightText: "#ffffff",
        }}
      />
    </div>
  );
}

function renderImage(el: ImageElement, s: number, assets: Record<string, string>) {
  const src = assets[el.assetId];
  const width = el.w * s;
  const height = el.naturalRatio ? el.w * el.naturalRatio * s : undefined;
  const style: React.CSSProperties = {
    width,
    height,
    objectFit: el.fit,
    borderRadius: el.borderRadius * s,
    filter: el.shadow ? `drop-shadow(0 ${12 * s}px ${32 * s}px rgba(0,0,0,0.35))` : undefined,
    display: "block",
    pointerEvents: "none",
  };
  if (!src) {
    return (
      <div
        style={{
          width,
          height: height ?? width * 0.6,
          borderRadius: el.borderRadius * s,
          border: `${2 * s}px dashed rgba(255,255,255,0.3)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.4)",
          fontSize: 24 * s,
          fontFamily: "monospace",
        }}
      >
        image
      </div>
    );
  }
  return <img src={src} alt="" style={style} draggable={false} />;
}

function renderShape(el: ShapeElement, s: number, brand: BrandKit) {
  const fill = resolveColor(el.fill, brand);
  if (el.shape === "line") {
    return <div style={{ width: el.w * s, height: Math.max(1, el.h * s), background: fill }} />;
  }
  return (
    <div
      style={{
        width: el.w * s,
        height: el.h * s,
        background: fill,
        borderRadius: el.shape === "ellipse" ? "50%" : el.borderRadius * s,
      }}
    />
  );
}
