import React, { useState } from "react";
import type { FrameGeometry, NormRect } from "../../data/mockup/types";
import { detectFrameGeometry } from "../../utils/frameCalibration";
import { loadFrameImage } from "../../utils/mockupRender";

interface Props {
  geom: FrameGeometry;
  frameSrc: string;
  overlay: boolean;
  onOverlayChange: (v: boolean) => void;
  onChange: (geom: FrameGeometry) => void;
  onReset: () => void;
}

const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  decimals?: number;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step, decimals = 4, onChange }) => (
  <div className="edit-field">
    <span className="edit-label">
      {label} — <span className="mo-num">{value.toFixed(decimals)}</span>
    </span>
    <input
      type="range"
      className="mk-range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  </div>
);

export const CalibrationPanel: React.FC<Props> = ({
  geom,
  frameSrc,
  overlay,
  onOverlayChange,
  onChange,
  onReset,
}) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const patchScreen = (patch: Partial<NormRect>) =>
    onChange({ ...geom, screen: { ...geom.screen, ...patch } });
  const patchIsland = (patch: Partial<NormRect>) =>
    onChange({ ...geom, island: { ...geom.island, ...patch } });

  const autoDetect = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const img = await loadFrameImage(frameSrc);
      const result = detectFrameGeometry(img);
      if (!result.ok) {
        setStatus(result.message ?? "Couldn't detect the screen.");
      } else {
        onChange({ ...geom, ...result.geometry });
        setStatus("Detected — fine-tune below if needed.");
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Detection failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mo-calib">
      <button
        type="button"
        className="mo-calib-toggle"
        onClick={() => setOpen((o) => !o)}
      >
        FRAME CALIBRATION
        <span className={`mo-caret${open ? " open" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="mo-calib-body">
          <p className="mo-hint">
            Aligns the screen area to the frame render. Turn the overlay on to
            see the computed rect.
          </p>
          <div className="mo-btn-row">
            <button
              type="button"
              className="export-btn-secondary"
              onClick={autoDetect}
              disabled={busy}
            >
              {busy ? "Detecting…" : "Auto-detect"}
            </button>
            <button
              type="button"
              className="export-btn-secondary"
              onClick={onReset}
            >
              Reset
            </button>
          </div>
          <label className="mo-toggle" style={{ margin: "10px 0 4px" }}>
            <input
              type="checkbox"
              checked={overlay}
              onChange={(e) => onOverlayChange(e.target.checked)}
            />
            Show overlay
          </label>
          {status && <p className="mo-hint mo-hint-status">{status}</p>}

          <Slider
            label="SCREEN X"
            value={geom.screen.x}
            min={0}
            max={0.5}
            step={0.0005}
            onChange={(x) => patchScreen({ x })}
          />
          <Slider
            label="SCREEN Y"
            value={geom.screen.y}
            min={0}
            max={0.5}
            step={0.0005}
            onChange={(y) => patchScreen({ y })}
          />
          <Slider
            label="SCREEN W"
            value={geom.screen.w}
            min={0.2}
            max={1}
            step={0.0005}
            onChange={(w) => patchScreen({ w })}
          />
          <Slider
            label="SCREEN H"
            value={geom.screen.h}
            min={0.2}
            max={1}
            step={0.0005}
            onChange={(h) => patchScreen({ h })}
          />
          <Slider
            label="CORNER RADIUS"
            value={geom.screenRadius}
            min={0}
            max={0.3}
            step={0.001}
            decimals={3}
            onChange={(screenRadius) => onChange({ ...geom, screenRadius })}
          />
          <Slider
            label="SCREEN BLEED (px)"
            value={geom.screenInset}
            min={-6}
            max={6}
            step={0.5}
            decimals={1}
            onChange={(screenInset) => onChange({ ...geom, screenInset })}
          />

          <label className="mo-toggle" style={{ margin: "10px 0" }}>
            <input
              type="checkbox"
              checked={geom.islandEnabled}
              onChange={(e) =>
                onChange({ ...geom, islandEnabled: e.target.checked })
              }
            />
            Dynamic Island
          </label>

          {geom.islandEnabled && (
            <>
              <Slider
                label="ISLAND X"
                value={geom.island.x}
                min={0}
                max={1}
                step={0.0005}
                onChange={(x) => patchIsland({ x })}
              />
              <Slider
                label="ISLAND Y"
                value={geom.island.y}
                min={0}
                max={0.3}
                step={0.0005}
                onChange={(y) => patchIsland({ y })}
              />
              <Slider
                label="ISLAND W"
                value={geom.island.w}
                min={0}
                max={0.6}
                step={0.0005}
                onChange={(w) => patchIsland({ w })}
              />
              <Slider
                label="ISLAND H"
                value={geom.island.h}
                min={0}
                max={0.15}
                step={0.0005}
                onChange={(h) => patchIsland({ h })}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};
