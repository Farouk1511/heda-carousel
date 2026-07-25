import React, { useEffect, useRef, useState } from "react";
import type { BrandKit, Design, DesignSize } from "../../data/marketing/types";
import { MarketingCanvas, type CanvasInteractive } from "./MarketingCanvas";

interface CanvasStageProps {
  design: Design;
  size: DesignSize;
  brand: BrandKit;
  assets?: Record<string, string>;
  /** Interactive editing props, minus previewScale (injected here). */
  interactive?: Omit<CanvasInteractive, "previewScale">;
}

/**
 * Measures its available area and renders the full-size MarketingCanvas scaled
 * to fit (transform: scale) — strict WYSIWYG with the offscreen export render.
 */
export const CanvasStage: React.FC<CanvasStageProps> = ({
  design,
  size,
  brand,
  assets,
  interactive,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [avail, setAvail] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () => setAvail({ w: node.clientWidth, h: node.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const scale =
    avail.w && avail.h ? Math.min(avail.w / size.w, avail.h / size.h, 1) : 0.1;

  return (
    <div ref={ref} className="mk-stage">
      <div
        className="mk-stage-frame"
        style={{ width: size.w * scale, height: size.h * scale }}
      >
        <div
          style={{
            width: size.w,
            height: size.h,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <MarketingCanvas
            design={design}
            size={size}
            brand={brand}
            assets={assets}
            interactive={
              interactive ? { ...interactive, previewScale: scale } : undefined
            }
          />
        </div>
      </div>
    </div>
  );
};
