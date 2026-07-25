import React, { useState } from "react";
import type { MarketingState } from "../../hooks/useMarketingState";
import {
  CUSTOM_SIZE_MAX,
  CUSTOM_SIZE_MIN,
  SIZE_GROUP_LABELS,
  SIZE_PRESETS,
  type SizeGroup,
} from "../../data/marketing/sizes";
import { makeDesignSize } from "../../data/marketing/resolve";
import { newId } from "../../data/marketing/defaults";

interface SizePickerProps {
  state: MarketingState;
}

const GROUP_ORDER: SizeGroup[] = ["social", "landscape", "banner"];

export const SizePicker: React.FC<SizePickerProps> = ({ state }) => {
  const { activeDesign } = state;
  const [cw, setCw] = useState("1080");
  const [ch, setCh] = useState("1080");

  if (!activeDesign) return null;

  const selectedIds = new Set(activeDesign.sizes.map((s) => s.id));

  const toggle = (presetId: string) => {
    const preset = SIZE_PRESETS.find((p) => p.id === presetId)!;
    if (selectedIds.has(preset.id)) state.removeSizeFromDesign(preset.id);
    else state.addSizeToDesign(makeDesignSize(preset));
  };

  const addCustom = () => {
    const w = Math.round(Number(cw));
    const h = Math.round(Number(ch));
    if (!Number.isFinite(w) || !Number.isFinite(h)) return;
    const cwc = Math.max(CUSTOM_SIZE_MIN, Math.min(CUSTOM_SIZE_MAX, w));
    const chc = Math.max(CUSTOM_SIZE_MIN, Math.min(CUSTOM_SIZE_MAX, h));
    state.addSizeToDesign({
      id: newId("custom"),
      label: `Custom ${cwc}×${chc}`,
      w: cwc,
      h: chc,
    });
  };

  return (
    <div className="mk-sizepicker">
      {GROUP_ORDER.map((group) => (
        <div key={group} className="mk-size-group">
          <div className="mk-size-group-label">{SIZE_GROUP_LABELS[group]}</div>
          {SIZE_PRESETS.filter((p) => p.group === group).map((p) => (
            <label key={p.id} className="mk-size-check">
              <input
                type="checkbox"
                checked={selectedIds.has(p.id)}
                onChange={() => toggle(p.id)}
              />
              <span className="mk-size-check-label">{p.label}</span>
              <span className="mk-size-check-dim">
                {p.w}×{p.h}
              </span>
            </label>
          ))}
        </div>
      ))}

      <div className="mk-size-group-label" style={{ marginTop: 6 }}>
        Custom
      </div>
      <div className="mk-custom-size">
        <input
          className="mk-hex mk-custom-input"
          value={cw}
          onChange={(e) => setCw(e.target.value)}
          inputMode="numeric"
        />
        <span className="mk-custom-x">×</span>
        <input
          className="mk-hex mk-custom-input"
          value={ch}
          onChange={(e) => setCh(e.target.value)}
          inputMode="numeric"
        />
        <button className="mk-add-btn mk-custom-add" onClick={addCustom}>
          Add
        </button>
      </div>

      {/* Selected sizes (removable) */}
      <div className="mk-selected-sizes">
        {activeDesign.sizes.map((s, i) => (
          <span key={s.id} className="mk-size-chip">
            {s.label}
            {i === 0 && <span className="mk-size-chip-primary"> · base</span>}
            {activeDesign.sizes.length > 1 && (
              <button
                className="mk-size-chip-del"
                title="Remove size"
                onClick={() => state.removeSizeFromDesign(s.id)}
              >
                ✕
              </button>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};
