import React from "react";
import type { MockupState } from "../../hooks/useMockupState";
import { DEVICE_FRAMES } from "../../data/mockup/frames";
import { SIZE_GROUP_LABELS, SIZE_PRESETS } from "../../data/marketing/sizes";
import type { SizeGroup } from "../../data/marketing/sizes";
import type { MockupBackground } from "../../data/mockup/types";

const BG_PRESETS: { label: string; bg: MockupBackground }[] = [
  { label: "Deep", bg: { type: "gradient", from: "#2a2340", to: "#0f0d17", angle: 160 } },
  { label: "Violet", bg: { type: "gradient", from: "#705bcf", to: "#2b2350", angle: 145 } },
  { label: "Dawn", bg: { type: "gradient", from: "#ffb88c", to: "#de6262", angle: 160 } },
  { label: "Mint", bg: { type: "gradient", from: "#a8edea", to: "#5b8fcf", angle: 150 } },
  { label: "Ink", bg: { type: "color", color: "#0a0a12" } },
  { label: "Paper", bg: { type: "color", color: "#f3f1ec" } },
  { label: "None", bg: { type: "none" } },
];

const GROUPS: SizeGroup[] = ["social", "landscape", "banner"];

interface Props {
  state: MockupState;
}

export const MockupSidebar: React.FC<Props> = ({ state }) => {
  const doc = state.doc;
  const scene = doc.scene;
  const bg = scene.background;

  return (
    <div className="sidebar-left">
      <div className="sidebar-inner">
        <div className="logo">HEDA</div>
        <div className="logo-sub">MOCKUP CREATOR</div>

        <div className="section-label">DOCUMENT</div>
        <input
          className="mo-text-input"
          value={doc.name}
          onChange={(e) => state.renameDoc(e.target.value)}
        />
        <div className="mo-doc-list">
          {state.docs.map((d) => (
            <button
              key={d.id}
              type="button"
              className={`mo-doc-btn${d.id === doc.id ? " active" : ""}`}
              onClick={() => state.selectDoc(d.id)}
            >
              <span>{d.name}</span>
              <span className="mo-doc-count">{d.items.length}</span>
            </button>
          ))}
        </div>
        <button type="button" className="mk-add-btn" onClick={state.newDoc}>
          + New document
        </button>

        <div className="section-label" style={{ marginTop: 24 }}>
          DEVICE
        </div>
        <div className="ratio-btns">
          {DEVICE_FRAMES.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`ratio-btn${f.id === doc.frameId ? " active" : ""}`}
              onClick={() => state.setFrameId(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="section-label" style={{ marginTop: 24 }}>
          OUTPUT SIZE
        </div>
        {GROUPS.map((g) => (
          <div key={g} className="mo-size-group">
            <span className="edit-label">{SIZE_GROUP_LABELS[g]}</span>
            <div className="mo-size-grid">
              {SIZE_PRESETS.filter((s) => s.group === g).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`mo-size-btn${s.id === doc.sizeId ? " active" : ""}`}
                  onClick={() => state.setSizeId(s.id)}
                  title={`${s.w} × ${s.h}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="section-label" style={{ marginTop: 24 }}>
          BACKGROUND
        </div>
        <div className="mo-bg-grid">
          {BG_PRESETS.map((p) => {
            const active =
              p.bg.type === bg.type &&
              (p.bg.type !== "gradient" ||
                (bg.type === "gradient" && p.bg.from === bg.from)) &&
              (p.bg.type !== "color" ||
                (bg.type === "color" && p.bg.color === bg.color));
            return (
              <button
                key={p.label}
                type="button"
                className={`mo-bg-swatch${active ? " active" : ""}`}
                title={p.label}
                onClick={() => state.patchScene({ background: p.bg })}
                style={{
                  background:
                    p.bg.type === "gradient"
                      ? `linear-gradient(${p.bg.angle}deg, ${p.bg.from}, ${p.bg.to})`
                      : p.bg.type === "color"
                        ? p.bg.color
                        : "repeating-conic-gradient(#3a3a48 0% 25%, #23232e 0% 50%) 50%/12px 12px",
                }}
              />
            );
          })}
        </div>
        {bg.type === "gradient" && (
          <div className="edit-field" style={{ marginTop: 12 }}>
            <span className="edit-label">GRADIENT ANGLE — {bg.angle}°</span>
            <input
              type="range"
              className="mk-range"
              min={0}
              max={360}
              step={1}
              value={bg.angle}
              onChange={(e) =>
                state.patchScene({
                  background: { ...bg, angle: Number(e.target.value) },
                })
              }
            />
          </div>
        )}
        {bg.type === "color" && (
          <div className="edit-field" style={{ marginTop: 12 }}>
            <span className="edit-label">COLOUR</span>
            <input
              type="color"
              className="mo-color"
              value={bg.color}
              onChange={(e) =>
                state.patchScene({
                  background: { type: "color", color: e.target.value },
                })
              }
            />
          </div>
        )}

        <div className="section-label" style={{ marginTop: 24 }}>
          SCENE
        </div>
        <div className="edit-field">
          <span className="edit-label">
            DEVICE SIZE — {Math.round(scene.phoneHeight * 100)}%
          </span>
          <input
            type="range"
            className="mk-range"
            min={0.3}
            max={1.15}
            step={0.01}
            value={scene.phoneHeight}
            onChange={(e) =>
              state.patchScene({ phoneHeight: Number(e.target.value) })
            }
          />
        </div>
        <div className="edit-field">
          <span className="edit-label">
            OFFSET X — {scene.phoneOffsetX.toFixed(2)}
          </span>
          <input
            type="range"
            className="mk-range"
            min={-0.5}
            max={0.5}
            step={0.005}
            value={scene.phoneOffsetX}
            onChange={(e) =>
              state.patchScene({ phoneOffsetX: Number(e.target.value) })
            }
          />
        </div>
        <div className="edit-field">
          <span className="edit-label">
            OFFSET Y — {scene.phoneOffsetY.toFixed(2)}
          </span>
          <input
            type="range"
            className="mk-range"
            min={-0.5}
            max={0.5}
            step={0.005}
            value={scene.phoneOffsetY}
            onChange={(e) =>
              state.patchScene({ phoneOffsetY: Number(e.target.value) })
            }
          />
        </div>
        <div className="edit-field">
          <span className="edit-label">
            ROTATION — {scene.phoneRotation}°
          </span>
          <input
            type="range"
            className="mk-range"
            min={-25}
            max={25}
            step={0.5}
            value={scene.phoneRotation}
            onChange={(e) =>
              state.patchScene({ phoneRotation: Number(e.target.value) })
            }
          />
        </div>
        <div className="mo-toggle-row">
          <label className="mo-toggle">
            <input
              type="checkbox"
              checked={scene.shadow}
              onChange={(e) => state.patchScene({ shadow: e.target.checked })}
            />
            Shadow
          </label>
          <label className="mo-toggle">
            <input
              type="checkbox"
              checked={scene.glare}
              onChange={(e) => state.patchScene({ glare: e.target.checked })}
            />
            Glare
          </label>
        </div>
      </div>
    </div>
  );
};
