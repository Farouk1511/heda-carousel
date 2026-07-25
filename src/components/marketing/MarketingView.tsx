import React, { useEffect, useState } from "react";
import type { MarketingState } from "../../hooks/useMarketingState";
import { resolveElement } from "../../data/marketing/resolve";
import { CanvasStage } from "./CanvasStage";
import { InspectorPanel } from "./InspectorPanel";
import { MarketingSidebar } from "./MarketingSidebar";
import { TemplatePickerModal } from "./TemplatePickerModal";

interface MarketingViewProps {
  state: MarketingState;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export const MarketingView: React.FC<MarketingViewProps> = ({ state }) => {
  const { activeDesign, activeSize, brand } = state;
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);

  // Keyboard: nudge selected element with arrows, delete with Del/Backspace.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = state.selectedElement;
      if (!el || !activeSize) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const r = resolveElement(el, activeSize.id);
      const step = e.shiftKey ? 0.02 : 0.004;
      if (e.key === "ArrowLeft") {
        state.patchElementLayout(el.id, { fx: clamp01(r.fx - step) });
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        state.patchElementLayout(el.id, { fx: clamp01(r.fx + step) });
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        state.patchElementLayout(el.id, { fy: clamp01(r.fy - step) });
        e.preventDefault();
      } else if (e.key === "ArrowDown") {
        state.patchElementLayout(el.id, { fy: clamp01(r.fy + step) });
        e.preventDefault();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        state.removeElement(el.id);
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, activeSize]);

  if (!activeDesign || !activeSize) {
    return (
      <div className="center">
        <div className="card-area">
          <div style={{ color: "var(--text-40)" }}>No design selected.</div>
        </div>
      </div>
    );
  }

  const interactive = {
    selectedId: state.selectedElementId,
    onSelect: state.setSelectedElementId,
    onMoveElement: (id: string, fx: number, fy: number) =>
      state.patchElementLayout(id, { fx, fy }),
    onResizeElement: (id: string, patch: { w?: number; h?: number; fontSize?: number }) => {
      if (patch.fontSize !== undefined)
        state.patchElementLayout(id, { fontSize: patch.fontSize });
      if (patch.w !== undefined) state.patchElementLayout(id, { w: patch.w });
      if (patch.h !== undefined) state.patchElementBase(id, { h: patch.h });
    },
  };

  return (
    <>
      <MarketingSidebar state={state} onNewDesign={() => setTemplatePickerOpen(true)} />

      <div className="center">
        <div className="topbar">
          <div className="topbar-left">
            <input
              className="mk-title-input"
              value={activeDesign.name}
              onChange={(e) => state.renameDesign(e.target.value)}
            />
          </div>
          <div className="mk-size-tabs">
            {activeDesign.sizes.map((size) => {
              const hasOverride = activeDesign.elements.some(
                (el) => el.overrides[size.id]
              );
              return (
                <button
                  key={size.id}
                  className={`ratio-btn${size.id === activeSize.id ? " active" : ""}${
                    hasOverride ? " has-override" : ""
                  }`}
                  onClick={() => state.setActiveSizeId(size.id)}
                  title={`${size.w}×${size.h}`}
                >
                  {size.label}
                </button>
              );
            })}
          </div>
        </div>

        <CanvasStage
          design={activeDesign}
          size={activeSize}
          brand={brand}
          assets={state.assets}
          interactive={interactive}
        />

        <div className="mk-size-caption">
          {activeSize.label} — {activeSize.w} × {activeSize.h}
          {state.isOverrideSize && <span className="mk-override-flag"> · override size</span>}
        </div>
      </div>

      <InspectorPanel state={state} />

      {templatePickerOpen && (
        <TemplatePickerModal state={state} onClose={() => setTemplatePickerOpen(false)} />
      )}
    </>
  );
};
