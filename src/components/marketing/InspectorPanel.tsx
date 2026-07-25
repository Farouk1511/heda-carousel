import React, { useRef, useState } from "react";
import type { MarketingState } from "../../hooks/useMarketingState";
import {
  exportCampaign,
  exportDesignAllSizes,
  exportDesignSize,
} from "../../utils/marketingExport";
import type {
  BrandColorRef,
  CanvasElement,
  ImageElement,
  ShapeElement,
  TextElement,
} from "../../data/marketing/types";
import { newId } from "../../data/marketing/defaults";
import {
  makeImageElement,
  makeShapeElement,
  makeTextElement,
} from "../../data/marketing/elements";
import { MarkupToolbar } from "./MarkupToolbar";
import { SizePicker } from "./SizePicker";

interface InspectorPanelProps {
  state: MarketingState;
}

const FONT_SLOTS: { id: TextElement["fontFamily"]; label: string }[] = [
  { id: "display", label: "Display" },
  { id: "body", label: "Body" },
  { id: "mono", label: "Mono" },
];

const COLOR_TOKENS: { ref: BrandColorRef; label: string }[] = [
  { ref: "brand:text", label: "Text" },
  { ref: "brand:accent", label: "Accent" },
  { ref: "brand:accentLight", label: "Light" },
  { ref: "brand:highlight", label: "Highlight" },
];

function readImageFile(file: File): Promise<{ url: string; ratio: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const img = new Image();
      img.onload = () => resolve({ url, ratio: img.naturalHeight / img.naturalWidth });
      img.onerror = reject;
      img.src = url;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({ state }) => {
  const { activeDesign, selectedElement, brand } = state;
  const fileRef = useRef<HTMLInputElement>(null);

  if (!activeDesign) return null;

  const addImageFromFile = async (file: File) => {
    if (file.size > 4 * 1024 * 1024) {
      // eslint-disable-next-line no-alert
      console.warn("Large image (>4MB) — exports may be slow.");
    }
    const { url, ratio } = await readImageFile(file);
    const assetId = newId("asset");
    state.registerAsset(assetId, url);
    state.addElement(makeImageElement(assetId, ratio, { w: 520 }));
  };

  const onFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void addImageFromFile(file);
    e.target.value = "";
  };

  return (
    <div className="sidebar-right mk-inspector">
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ display: "none" }}
        onChange={onFilePick}
      />

      {/* SIZES */}
      <div className="section-label">SIZES</div>
      <SizePicker state={state} />

      {/* ELEMENTS */}
      <div className="section-label" style={{ marginTop: 22 }}>
        ELEMENTS
      </div>
      <div className="mk-add-row">
        <button className="mk-add-btn" onClick={() => state.addElement(makeTextElement())}>
          + Text
        </button>
        <button className="mk-add-btn" onClick={() => state.addElement(makeShapeElement())}>
          + Shape
        </button>
        <button className="mk-add-btn" onClick={() => fileRef.current?.click()}>
          + Image
        </button>
      </div>
      <div className="mk-el-list">
        {[...activeDesign.elements]
          .map((el, idx) => ({ el, idx }))
          .reverse()
          .map(({ el, idx }) => (
            <div
              key={el.id}
              className={`mk-el-item${el.id === state.selectedElementId ? " active" : ""}`}
              onClick={() => state.setSelectedElementId(el.id)}
            >
              <span className="mk-el-name">{elementLabel(el)}</span>
              <span className="mk-el-actions">
                <button
                  title="Bring forward"
                  disabled={idx === activeDesign.elements.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    state.moveElementZ(el.id, 1);
                  }}
                >
                  ↑
                </button>
                <button
                  title="Send backward"
                  disabled={idx === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    state.moveElementZ(el.id, -1);
                  }}
                >
                  ↓
                </button>
                <button
                  title="Delete"
                  className="mk-el-del"
                  onClick={(e) => {
                    e.stopPropagation();
                    state.removeElement(el.id);
                  }}
                >
                  ✕
                </button>
              </span>
            </div>
          ))}
        {activeDesign.elements.length === 0 && (
          <div className="mk-empty">No elements yet. Add one above.</div>
        )}
      </div>

      {/* SELECTED ELEMENT */}
      {selectedElement && (
        <>
          <div className="section-label" style={{ marginTop: 22 }}>
            {elementLabel(selectedElement).toUpperCase()}
          </div>
          {state.isOverrideSize && (
            <div className="mk-override-banner">
              Editing overrides for <b>{state.activeSize?.label}</b>. Position/size
              changes apply only to this size.
              {state.hasOverrideForActiveSize(selectedElement.id) && (
                <button
                  className="mk-reset-btn"
                  onClick={() => state.resetOverride(selectedElement.id)}
                >
                  Reset to base
                </button>
              )}
            </div>
          )}
          {selectedElement.type === "text" && (
            <TextInspector state={state} el={selectedElement} />
          )}
          {selectedElement.type === "image" && (
            <ImageInspector state={state} el={selectedElement} />
          )}
          {selectedElement.type === "shape" && (
            <ShapeInspector state={state} el={selectedElement} />
          )}
          <CommonInspector state={state} el={selectedElement} />
        </>
      )}

      {/* BACKGROUND */}
      <div className="section-label" style={{ marginTop: 22 }}>
        BACKGROUND
      </div>
      <ColorRow
        value={
          activeDesign.background.type === "color"
            ? activeDesign.background.color
            : "#000000"
        }
        brandPalette={brand.colors.palette}
        onPick={(color) => state.setDesignBackground({ type: "color", color })}
      />

      {/* EXPORT */}
      <div className="section-label" style={{ marginTop: 22 }}>
        EXPORT
      </div>
      <ExportSection state={state} />
    </div>
  );
};

const ExportSection: React.FC<{ state: MarketingState }> = ({ state }) => {
  const [progress, setProgress] = useState("");
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const { activeDesign, activeSize, brand, assets, activeCampaign, designs } = state;
  if (!activeDesign || !activeSize) return null;
  const campaignName = activeCampaign?.name ?? "campaign";

  const runCampaign = async () => {
    if (!activeCampaign || busy) return;
    setBusy(true);
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      await exportCampaign(
        activeCampaign,
        designs,
        brand,
        assets,
        (p) => setProgress(`${p.current}/${p.total} — ${p.label}`),
        ac.signal
      );
      setProgress("Campaign exported ✓");
    } catch (e) {
      setProgress(
        (e as Error).name === "AbortError"
          ? "Cancelled"
          : "Error: " + (e as Error).message
      );
    }
    setBusy(false);
    setTimeout(() => setProgress(""), 3000);
  };

  return (
    <>
      <button
        className="export-btn-primary"
        disabled={busy}
        onClick={() =>
          exportDesignSize(activeDesign, activeSize, brand, assets, campaignName, setProgress)
        }
      >
        ↓ PNG — {activeSize.label}
      </button>
      <button
        className="export-btn-secondary"
        disabled={busy}
        onClick={() =>
          exportDesignAllSizes(activeDesign, brand, assets, campaignName, setProgress)
        }
      >
        ↓ ZIP — All {activeDesign.sizes.length} sizes
      </button>
      <button
        className="export-btn-secondary"
        style={{ marginTop: 8 }}
        disabled={busy}
        onClick={runCampaign}
      >
        ↓ ZIP — Whole campaign
      </button>
      {busy && (
        <button
          className="export-btn-secondary"
          style={{ marginTop: 8 }}
          onClick={() => abortRef.current?.abort()}
        >
          Cancel
        </button>
      )}
      <div className="export-progress">{progress}</div>
    </>
  );
};

function elementLabel(el: CanvasElement): string {
  if (el.type === "text") return "Text";
  if (el.type === "image") return "Image";
  return `Shape (${el.shape})`;
}

// --------------------------------------------------------------------------

const TextInspector: React.FC<{ state: MarketingState; el: TextElement }> = ({
  state,
  el,
}) => {
  const textRef = useRef<HTMLTextAreaElement>(null);
  return (
    <div className="mk-props">
      <label className="edit-label">CONTENT</label>
      <MarkupToolbar
        textareaRef={textRef}
        palette={state.brand.colors.palette}
        onChange={(text) => state.patchElementBase(el.id, { text })}
      />
      <textarea
        ref={textRef}
        className="edit-textarea"
        rows={3}
        value={el.text}
        onChange={(e) => state.patchElementBase(el.id, { text: e.target.value })}
      />

      <Stepper
        label="FONT SIZE"
        value={el.fontSize}
        step={4}
        min={8}
        max={400}
        onChange={(v) => state.patchElementLayout(el.id, { fontSize: v })}
      />

      <label className="edit-label">FONT</label>
      <div className="ratio-btns">
        {FONT_SLOTS.map((f) => (
          <button
            key={f.id}
            className={`ratio-btn${el.fontFamily === f.id ? " active" : ""}`}
            onClick={() => state.patchElementBase(el.id, { fontFamily: f.id })}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Stepper
        label="WEIGHT"
        value={el.fontWeight}
        step={100}
        min={400}
        max={800}
        onChange={(v) => state.patchElementBase(el.id, { fontWeight: v })}
      />

      <label className="edit-label">ALIGN</label>
      <div className="ratio-btns">
        {(["left", "center", "right"] as const).map((a) => (
          <button
            key={a}
            className={`ratio-btn${el.align === a ? " active" : ""}`}
            onClick={() => state.patchElementBase(el.id, { align: a })}
          >
            {a[0].toUpperCase()}
          </button>
        ))}
      </div>

      <Stepper
        label="MAX WIDTH"
        value={el.maxWidth}
        step={20}
        min={80}
        max={2000}
        onChange={(v) => state.patchElementBase(el.id, { maxWidth: v })}
      />

      <label className="edit-label">COLOR</label>
      <ColorRow
        value={el.color}
        brandPalette={state.brand.colors.palette}
        onPick={(color) => state.patchElementBase(el.id, { color })}
      />
    </div>
  );
};

const ImageInspector: React.FC<{ state: MarketingState; el: ImageElement }> = ({
  state,
  el,
}) => (
  <div className="mk-props">
    <Stepper
      label="WIDTH"
      value={el.w}
      step={20}
      min={20}
      max={4000}
      onChange={(v) => state.patchElementLayout(el.id, { w: v })}
    />
    <label className="edit-label">FIT</label>
    <div className="ratio-btns">
      {(["contain", "cover"] as const).map((f) => (
        <button
          key={f}
          className={`ratio-btn${el.fit === f ? " active" : ""}`}
          onClick={() => state.patchElementBase(el.id, { fit: f })}
        >
          {f}
        </button>
      ))}
    </div>
    <Stepper
      label="CORNER RADIUS"
      value={el.borderRadius}
      step={8}
      min={0}
      max={600}
      onChange={(v) => state.patchElementBase(el.id, { borderRadius: v })}
    />
    <label className="mk-check">
      <input
        type="checkbox"
        checked={el.shadow}
        onChange={(e) => state.patchElementBase(el.id, { shadow: e.target.checked })}
      />
      Drop shadow
    </label>
  </div>
);

const ShapeInspector: React.FC<{ state: MarketingState; el: ShapeElement }> = ({
  state,
  el,
}) => (
  <div className="mk-props">
    <label className="edit-label">SHAPE</label>
    <div className="ratio-btns">
      {(["rect", "ellipse", "line"] as const).map((sh) => (
        <button
          key={sh}
          className={`ratio-btn${el.shape === sh ? " active" : ""}`}
          onClick={() => state.patchElementBase(el.id, { shape: sh })}
        >
          {sh}
        </button>
      ))}
    </div>
    <Stepper
      label="WIDTH"
      value={el.w}
      step={20}
      min={8}
      max={4000}
      onChange={(v) => state.patchElementLayout(el.id, { w: v })}
    />
    <Stepper
      label="HEIGHT"
      value={el.h}
      step={20}
      min={2}
      max={4000}
      onChange={(v) => state.patchElementBase(el.id, { h: v })}
    />
    <Stepper
      label="CORNER RADIUS"
      value={el.borderRadius}
      step={8}
      min={0}
      max={600}
      onChange={(v) => state.patchElementBase(el.id, { borderRadius: v })}
    />
    <label className="edit-label">FILL</label>
    <ColorRow
      value={el.fill}
      brandPalette={state.brand.colors.palette}
      onPick={(fill) => state.patchElementBase(el.id, { fill })}
    />
  </div>
);

const CommonInspector: React.FC<{ state: MarketingState; el: CanvasElement }> = ({
  state,
  el,
}) => (
  <div className="mk-props">
    <label className="edit-label">ROTATION ({el.rotation}°)</label>
    <input
      type="range"
      min={-45}
      max={45}
      value={el.rotation}
      className="mk-range"
      onChange={(e) => {
        let v = Number(e.target.value);
        if (Math.abs(v) <= 2) v = 0;
        state.patchElementLayout(el.id, { rotation: v });
      }}
    />
    <label className="edit-label">OPACITY ({Math.round(el.opacity * 100)}%)</label>
    <input
      type="range"
      min={0}
      max={100}
      value={Math.round(el.opacity * 100)}
      className="mk-range"
      onChange={(e) => state.patchElementBase(el.id, { opacity: Number(e.target.value) / 100 })}
    />
    {state.activeSize && (
      <label className="mk-check">
        <input
          type="checkbox"
          checked={Boolean(el.overrides[state.activeSize.id]?.hidden)}
          onChange={(e) => state.setHiddenOnSize(el.id, e.target.checked)}
        />
        Hide on {state.activeSize.label}
      </label>
    )}
  </div>
);

// --------------------------------------------------------------------------

const Stepper: React.FC<{
  label: string;
  value: number;
  step: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}> = ({ label, value, step, min, max, onChange }) => (
  <>
    <label className="edit-label">{label}</label>
    <div className="size-control">
      <button
        className="size-btn"
        onClick={() => onChange(Math.max(min, value - step))}
      >
        −
      </button>
      <span className="size-value">{Math.round(value)}</span>
      <button
        className="size-btn"
        onClick={() => onChange(Math.min(max, value + step))}
      >
        +
      </button>
    </div>
  </>
);

const ColorRow: React.FC<{
  value: string;
  brandPalette: string[];
  onPick: (color: string) => void;
}> = ({ value, brandPalette, onPick }) => (
  <div className="mk-color-row">
    {COLOR_TOKENS.map((c) => (
      <button
        key={c.ref}
        className={`mk-token-btn${value === c.ref ? " active" : ""}`}
        onClick={() => onPick(c.ref)}
        title={c.label}
      >
        {c.label}
      </button>
    ))}
    <input
      type="color"
      className="mk-color-input"
      value={value.startsWith("#") ? value : "#705bcf"}
      onChange={(e) => onPick(e.target.value)}
      title="Custom color"
    />
  </div>
);
