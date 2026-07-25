import React from "react";
import type { MarketingState } from "../../hooks/useMarketingState";
import type { Design, DesignSize } from "../../data/marketing/types";
import { TEMPLATES, type MarketingTemplate } from "../../data/marketing/templates";
import { MarketingCanvas } from "./MarketingCanvas";

interface TemplatePickerModalProps {
  state: MarketingState;
  onClose: () => void;
}

const THUMB = 150;
const PREVIEW_SIZE: DesignSize = { id: "prev", label: "", w: 1080, h: 1080 };

export const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({
  state,
  onClose,
}) => {
  const { brand, assets } = state;

  const pick = (tpl: MarketingTemplate) => {
    state.addDesignFromTemplate(tpl);
    onClose();
  };

  return (
    <div className="mk-modal-overlay" onClick={onClose}>
      <div className="mk-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mk-modal-head">
          <span className="mk-modal-title">Choose a template</span>
          <button className="mk-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="mk-template-grid">
          {TEMPLATES.map((tpl) => {
            const { background, elements } = tpl.build({
              logoAssetId: brand?.logoAssetId,
            });
            const preview: Design = {
              id: `prev-${tpl.id}`,
              name: tpl.name,
              background,
              elements,
              sizes: [PREVIEW_SIZE],
            };
            const scale = THUMB / PREVIEW_SIZE.w;
            return (
              <button key={tpl.id} className="mk-template-card" onClick={() => pick(tpl)}>
                <div className="mk-template-thumb" style={{ width: THUMB, height: THUMB }}>
                  <div
                    style={{
                      width: PREVIEW_SIZE.w,
                      height: PREVIEW_SIZE.h,
                      transform: `scale(${scale})`,
                      transformOrigin: "top left",
                    }}
                  >
                    <MarketingCanvas
                      design={preview}
                      size={PREVIEW_SIZE}
                      brand={brand}
                      assets={assets}
                    />
                  </div>
                </div>
                <div className="mk-template-name">{tpl.name}</div>
                <div className="mk-template-desc">{tpl.description}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
