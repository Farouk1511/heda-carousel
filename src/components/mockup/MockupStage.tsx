import React, { useEffect, useRef, useState } from "react";
import { MockupCanvas, type MockupCanvasProps } from "./MockupCanvas";

type StageProps = Omit<MockupCanvasProps, "previewScale">;

/**
 * Measures its available area and renders the full-size MockupCanvas scaled to
 * fit — strict WYSIWYG with the canvas export, same approach as CanvasStage.
 */
export const MockupStage: React.FC<StageProps> = (props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [avail, setAvail] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () =>
      setAvail({ w: node.clientWidth, h: node.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const scale =
    avail.w && avail.h
      ? Math.min(avail.w / props.w, avail.h / props.h, 1)
      : 0.1;

  return (
    <div ref={ref} className="mo-stage">
      <div
        className="mo-stage-frame"
        style={{ width: props.w * scale, height: props.h * scale }}
      >
        <div
          style={{
            width: props.w,
            height: props.h,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <MockupCanvas {...props} previewScale={scale} />
        </div>
      </div>
    </div>
  );
};
