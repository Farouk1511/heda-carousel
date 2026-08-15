import React, { useRef, useState } from "react";
import type { MockupState } from "../../hooks/useMockupState";
import { getFrame } from "../../data/mockup/frames";
import { loadFrameImage } from "../../utils/mockupRender";
import {
  exportAllMockupsZip,
  exportMockupPng,
  downloadBlob,
  slugify,
} from "../../utils/mockupExport";
import {
  GIF_FPS_OPTIONS,
  GIF_LARGE_BYTES,
  GIF_MAX_DURATION_SEC,
  GIF_MAX_EDGE_OPTIONS,
  exportMockupGif,
  gifOutputSize,
  planGifFrames,
  type GifProgress,
} from "../../utils/gifExport";
import {
  VIDEO_FPS_OPTIONS,
  VIDEO_MAX_DURATION_SEC,
  VIDEO_MAX_EDGE_OPTIONS,
  estimateBitrate,
  exportMockupMp4,
  isVideoExportSupported,
  mp4OutputSize,
  planMp4Frames,
  type VideoProgress,
} from "../../utils/videoExport";
import type { VideoQuality } from "../../data/mockup/types";
import { CalibrationPanel } from "./CalibrationPanel";

interface Props {
  state: MockupState;
  overlay: boolean;
  onOverlayChange: (v: boolean) => void;
}

const fmt = (s: number) => `${s.toFixed(1)}s`;

export const MockupInspector: React.FC<Props> = ({
  state,
  overlay,
  onOverlayChange,
}) => {
  const { doc, activeItem, geometry, size, videoSettings } = state;
  const mp4Supported = isVideoExportSupported();
  const frame = getFrame(doc.frameId);
  const [busy, setBusy] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const mediaUrl = activeItem
    ? state.mediaUrls[activeItem.media.mediaId]
    : undefined;
  const isVideo = activeItem?.media.kind === "video";
  const duration = activeItem?.media.durationSec ?? 0;
  const trim = activeItem?.trim ?? { startSec: 0, endSec: duration };

  const common = {
    frame,
    geom: geometry,
    scene: doc.scene,
    w: size.w,
    h: size.h,
  };

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label);
    setExportError(null);
    setProgress(null);
    try {
      await fn();
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        setExportError(err instanceof Error ? err.message : "Export failed.");
      }
    } finally {
      setBusy(null);
      setProgress(null);
      abortRef.current = null;
    }
  };

  const doPng = () =>
    run("png", async () => {
      if (!activeItem) return;
      await exportMockupPng({ ...common, item: activeItem, mediaUrl });
    });

  const doZip = () =>
    run("zip", async () => {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      await exportAllMockupsZip(
        doc.items,
        common,
        state.mediaUrls,
        doc.name,
        (p) => setProgress(`${p.label} — ${p.done}/${p.total}`),
        ctrl.signal
      );
    });

  const doGif = () =>
    run("gif", async () => {
      if (!activeItem || !mediaUrl) return;
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      const frameImg = await loadFrameImage(frame.src);
      const blob = await exportMockupGif(
        {
          videoUrl: mediaUrl,
          frameImg,
          frame,
          geom: geometry,
          scene: doc.scene,
          transform: activeItem.transform,
          outW: size.w,
          outH: size.h,
          maxEdge: doc.gif.maxEdge,
          trim,
          fps: doc.gif.fps,
          palette: doc.gif.palette,
          loop: doc.gif.loop,
        },
        (p: GifProgress) => {
          if (p.phase === "encoding") {
            setProgress(`Encoding frame ${p.frame}/${p.totalFrames}`);
          } else if (p.phase === "sampling") {
            setProgress(`Building palette ${p.frame}/${p.totalFrames}`);
          } else {
            setProgress(p.phase === "finalizing" ? "Finalizing…" : "Preparing…");
          }
        },
        ctrl.signal
      );
      if (blob.size > GIF_LARGE_BYTES) {
        setExportError(
          `That GIF is ${(blob.size / 1024 / 1024).toFixed(1)}MB — trim it or drop the size.`
        );
      }
      downloadBlob(blob, `${slugify(activeItem.name)}.gif`);
    });

  const doMp4 = () =>
    run("mp4", async () => {
      if (!activeItem || !mediaUrl) return;
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      const frameImg = await loadFrameImage(frame.src);
      const blob = await exportMockupMp4(
        {
          videoUrl: mediaUrl,
          frameImg,
          frame,
          geom: geometry,
          scene: doc.scene,
          transform: activeItem.transform,
          outW: size.w,
          outH: size.h,
          maxEdge: videoSettings.maxEdge,
          trim,
          fps: videoSettings.fps,
          quality: videoSettings.quality,
        },
        (p: VideoProgress) => {
          if (p.phase === "encoding") {
            setProgress(`Encoding frame ${p.frame}/${p.totalFrames}`);
          } else {
            setProgress(p.phase === "finalizing" ? "Finalizing…" : "Preparing…");
          }
        },
        ctrl.signal
      );
      downloadBlob(blob, `${slugify(activeItem.name)}.mp4`);
    });

  const plan =
    isVideo && duration
      ? planGifFrames(trim, doc.gif.fps, duration)
      : null;
  const gifSize = gifOutputSize(size.w, size.h, doc.gif.maxEdge);
  const mp4Plan =
    isVideo && duration
      ? planMp4Frames(trim, videoSettings.fps, duration)
      : null;
  const mp4Size = mp4OutputSize(size.w, size.h, videoSettings.maxEdge);
  const mp4Estimate =
    mp4Plan && mp4Plan.times.length
      ? (estimateBitrate(
          mp4Size.w,
          mp4Size.h,
          videoSettings.fps,
          videoSettings.quality
        ) *
          (mp4Plan.times.length / videoSettings.fps)) /
        8 /
        1024 /
        1024
      : 0;

  return (
    <div className="sidebar-right">
      <div className="section-label">FRAMING</div>
      {!activeItem ? (
        <p className="mo-hint">Drop an image or video to start.</p>
      ) : (
        <>
          <div className="ratio-btns">
            {(["cover", "contain"] as const).map((f) => (
              <button
                key={f}
                type="button"
                className={`ratio-btn${activeItem.transform.fit === f ? " active" : ""}`}
                onClick={() => state.patchTransform(activeItem.id, { fit: f })}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="edit-field">
            <span className="edit-label">
              ZOOM — {activeItem.transform.scale.toFixed(2)}×
            </span>
            <input
              type="range"
              className="mk-range"
              min={0.5}
              max={3}
              step={0.01}
              value={activeItem.transform.scale}
              onChange={(e) =>
                state.patchTransform(activeItem.id, {
                  scale: Number(e.target.value),
                })
              }
            />
          </div>
          <p className="mo-hint">
            Drag inside the screen to pan · Ctrl+scroll to zoom · double-click to
            reset.
          </p>
          <button
            type="button"
            className="export-btn-secondary"
            onClick={() => state.resetTransform(activeItem.id)}
          >
            Reset framing
          </button>
        </>
      )}

      {isVideo && activeItem && (
        <>
          <div className="section-label" style={{ marginTop: 24 }}>
            TRIM
          </div>
          <div className="edit-field">
            <span className="edit-label">START — {fmt(trim.startSec)}</span>
            <input
              type="range"
              className="mk-range"
              min={0}
              max={Math.max(0.1, duration)}
              step={0.05}
              value={trim.startSec}
              onChange={(e) =>
                state.patchTrim(activeItem.id, {
                  startSec: Number(e.target.value),
                })
              }
            />
          </div>
          <div className="edit-field">
            <span className="edit-label">END — {fmt(trim.endSec)}</span>
            <input
              type="range"
              className="mk-range"
              min={0}
              max={Math.max(0.1, duration)}
              step={0.05}
              value={trim.endSec}
              onChange={(e) =>
                state.patchTrim(activeItem.id, {
                  endSec: Number(e.target.value),
                })
              }
            />
          </div>
          {trim.endSec - trim.startSec > GIF_MAX_DURATION_SEC && (
            <p className="mo-warn">
              GIFs are capped at {GIF_MAX_DURATION_SEC}s — only the first{" "}
              {GIF_MAX_DURATION_SEC}s will be used.
            </p>
          )}

          <div className="section-label" style={{ marginTop: 24 }}>
            GIF
          </div>
          <div className="edit-field">
            <span className="edit-label">FRAME RATE</span>
            <div className="ratio-btns">
              {GIF_FPS_OPTIONS.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`ratio-btn${doc.gif.fps === f ? " active" : ""}`}
                  onClick={() => state.patchGif({ fps: f })}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="edit-field">
            <span className="edit-label">MAX SIZE</span>
            <div className="ratio-btns">
              {GIF_MAX_EDGE_OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`ratio-btn${doc.gif.maxEdge === m ? " active" : ""}`}
                  onClick={() => state.patchGif({ maxEdge: m })}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="edit-field">
            <span className="edit-label">PALETTE</span>
            <div className="ratio-btns">
              {(["shared", "per-frame"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`ratio-btn${doc.gif.palette === p ? " active" : ""}`}
                  onClick={() => state.patchGif({ palette: p })}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <label className="mo-toggle">
            <input
              type="checkbox"
              checked={doc.gif.loop}
              onChange={(e) => state.patchGif({ loop: e.target.checked })}
            />
            Loop forever
          </label>
          {plan && (
            <p className="mo-hint mo-mono">
              {plan.times.length} frames · {gifSize.w}×{gifSize.h} ·{" "}
              {plan.delayCs}cs/frame
            </p>
          )}
          {doc.scene.background.type === "none" && (
            <p className="mo-warn">
              Neither GIF nor MP4 carries soft transparency, so those exports
              flatten onto white. PNG keeps real transparency.
            </p>
          )}

          <div className="section-label" style={{ marginTop: 24 }}>
            MP4
          </div>
          {!mp4Supported ? (
            <p className="mo-warn">
              This browser doesn't support WebCodecs, so MP4 export is
              unavailable. Chrome, Edge, or Safari 16.4+ will work.
            </p>
          ) : (
            <>
              <div className="edit-field">
                <span className="edit-label">FRAME RATE</span>
                <div className="ratio-btns">
                  {VIDEO_FPS_OPTIONS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      className={`ratio-btn${videoSettings.fps === f ? " active" : ""}`}
                      onClick={() => state.patchVideo({ fps: f })}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="edit-field">
                <span className="edit-label">MAX SIZE</span>
                <div className="ratio-btns">
                  {VIDEO_MAX_EDGE_OPTIONS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`ratio-btn${videoSettings.maxEdge === m ? " active" : ""}`}
                      onClick={() => state.patchVideo({ maxEdge: m })}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="edit-field">
                <span className="edit-label">QUALITY</span>
                <div className="ratio-btns">
                  {(["small", "balanced", "high"] as VideoQuality[]).map((q) => (
                    <button
                      key={q}
                      type="button"
                      className={`ratio-btn${videoSettings.quality === q ? " active" : ""}`}
                      onClick={() => state.patchVideo({ quality: q })}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
              {mp4Plan && (
                <p className="mo-hint mo-mono">
                  {mp4Plan.times.length} frames · {mp4Size.w}×{mp4Size.h} · ~
                  {mp4Estimate < 1
                    ? `${Math.round(mp4Estimate * 1024)}KB`
                    : `${mp4Estimate.toFixed(1)}MB`}
                </p>
              )}
              <p className="mo-hint">
                H.264 · no audio track · Instagram accepts MP4, not GIF.
              </p>
              {trim.endSec - trim.startSec > VIDEO_MAX_DURATION_SEC && (
                <p className="mo-warn">
                  MP4 is capped at {VIDEO_MAX_DURATION_SEC}s — only the first{" "}
                  {VIDEO_MAX_DURATION_SEC}s will be used.
                </p>
              )}
            </>
          )}
        </>
      )}

      <div className="section-label" style={{ marginTop: 24 }}>
        EXPORT
      </div>
      <button
        type="button"
        className="export-btn-primary"
        onClick={doPng}
        disabled={!activeItem || busy !== null}
      >
        {busy === "png" ? "Rendering…" : "↓ PNG"}
      </button>
      {isVideo && mp4Supported && (
        <button
          type="button"
          className="export-btn-primary"
          onClick={doMp4}
          disabled={!mediaUrl || busy !== null}
        >
          {busy === "mp4" ? "Encoding…" : "↓ MP4"}
        </button>
      )}
      {isVideo && (
        <button
          type="button"
          className="export-btn-secondary"
          onClick={doGif}
          disabled={!mediaUrl || busy !== null}
        >
          {busy === "gif" ? "Encoding…" : "↓ GIF"}
        </button>
      )}
      <button
        type="button"
        className="export-btn-secondary"
        onClick={doZip}
        disabled={doc.items.length === 0 || busy !== null}
      >
        {busy === "zip"
          ? "Zipping…"
          : `↓ ZIP — all ${doc.items.length} PNG${doc.items.length === 1 ? "" : "s"}`}
      </button>

      {progress && <div className="export-progress">{progress}</div>}
      {busy && abortRef.current && (
        <button
          type="button"
          className="export-btn-secondary"
          onClick={() => abortRef.current?.abort()}
        >
          Cancel
        </button>
      )}
      {exportError && <p className="mo-warn">{exportError}</p>}

      <CalibrationPanel
        geom={geometry}
        frameSrc={frame.src}
        overlay={overlay}
        onOverlayChange={onOverlayChange}
        onChange={state.setGeometry}
        onReset={state.resetGeometry}
      />
    </div>
  );
};
