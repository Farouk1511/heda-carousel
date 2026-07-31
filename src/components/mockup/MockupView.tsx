import React, { useState } from "react";
import type { MockupState } from "../../hooks/useMockupState";
import { getFrame } from "../../data/mockup/frames";
import { MockupSidebar } from "./MockupSidebar";
import { MockupStage } from "./MockupStage";
import { MockupInspector } from "./MockupInspector";
import { MockupFilmstrip } from "./MockupFilmstrip";
import { DropZone } from "./DropZone";

interface Props {
  state: MockupState;
}

export const MockupView: React.FC<Props> = ({ state }) => {
  const [overlay, setOverlay] = useState(false);
  const [frameMissing, setFrameMissing] = useState(false);
  const { doc, activeItem, geometry, size } = state;
  const frame = getFrame(doc.frameId);
  const mediaUrl = activeItem
    ? state.mediaUrls[activeItem.media.mediaId]
    : undefined;

  return (
    <>
      <MockupSidebar state={state} />

      <div className="center">
        <DropZone onFiles={state.addFiles}>
          {frameMissing ? (
            <div className="mo-missing">
              <h3>Frame asset missing</h3>
              <p>
                Save the iPhone render to <code>public{frame.src}</code> and
                reload. Everything else is wired up and waiting for it.
              </p>
            </div>
          ) : (
            <MockupStage
              frame={frame}
              geom={geometry}
              scene={doc.scene}
              item={activeItem}
              mediaUrl={mediaUrl}
              w={size.w}
              h={size.h}
              overlay={overlay}
              onFrameError={() => setFrameMissing(true)}
              onPanChange={state.patchTransform}
              onResetTransform={state.resetTransform}
            />
          )}

          {doc.items.length === 0 && !frameMissing && (
            <div className="mo-empty-hint">
              Drag images or a video anywhere here
            </div>
          )}
        </DropZone>

        {state.error && (
          <div className="mo-error-bar">
            <span>{state.error}</span>
            <button type="button" onClick={state.clearError}>
              ×
            </button>
          </div>
        )}

        <MockupFilmstrip
          items={doc.items}
          activeId={activeItem?.id ?? null}
          mediaUrls={state.mediaUrls}
          onSelect={state.selectItem}
          onRemove={state.removeItem}
          onReorder={state.reorderItem}
          onFiles={state.addFiles}
          importing={state.importing}
        />
      </div>

      <MockupInspector
        state={state}
        overlay={overlay}
        onOverlayChange={setOverlay}
      />
    </>
  );
};
