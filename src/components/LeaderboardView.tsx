import React, { useEffect, useMemo, useRef, useState } from "react";
import type { AspectRatio } from "../hooks/useCarouselState";
import { useLeaderboardState } from "../hooks/useLeaderboardState";
import { paginateLeaderboard } from "../data/leaderboard/pagination";
import { validateDailySteps } from "../data/leaderboard/daily";
import { hasCustomLook, RESET_LOOK } from "../data/design/lookState";
import { LeaderboardCard } from "./LeaderboardCard";
import { VideoPreview, VideoSettings } from "./leaderboard/VideoPanel";
import { LookSections } from "./panel/LookSections";
import { FieldLabel, PanelSection, Segmented, Stepper } from "./panel/PanelUI";
import {
  DEFAULT_BUMP_CONFIG,
  resolveBumpConfig,
  type BumpReelConfig,
} from "../remotion/bumpChart/config";
import { loadBumpVideoConfig, saveBumpVideoConfig } from "../utils/stylePersistence";
import {
  exportBumpReelFile,
  exportLeaderboardImage,
  exportLeaderboardRatios,
  renderBumpReelServer,
} from "../utils/export";

const ALL_RATIOS: AspectRatio[] = ["1:1", "4:5", "9:16"];

type LeaderboardTab = "images" | "video";
type PanelTab = "style" | "content" | "export";

const PANEL_TABS: { value: PanelTab; label: string }[] = [
  { value: "style", label: "Style" },
  { value: "content", label: "Content" },
  { value: "export", label: "Export" },
];

export const LeaderboardView: React.FC = () => {
  const lb = useLeaderboardState();
  const [tab, setTab] = useState<LeaderboardTab>("images");
  const [panelTab, setPanelTab] = useState<PanelTab>("style");
  const [previewPage, setPreviewPage] = useState(0);
  const [videoConfig, setVideoConfig] = useState<BumpReelConfig>(() =>
    resolveBumpConfig(loadBumpVideoConfig())
  );
  useEffect(() => saveBumpVideoConfig(videoConfig), [videoConfig]);
  const [rendering, setRendering] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const setProgress = (msg: string) => {
    if (progressRef.current) progressRef.current.textContent = msg;
  };

  const pages = paginateLeaderboard(lb.data.leaderboard, lb.exportRatio);
  const pageCount = pages.length;
  const safePage = Math.min(previewPage, pageCount - 1);

  // The CTA is shared content: the cards' footer and the video's outro use
  // the same line, edited once in the CONTENT tab.
  const effectiveVideoConfig = useMemo(
    () => ({ ...videoConfig, cta: lb.cta }),
    [videoConfig, lb.cta]
  );
  const dailyValidation = useMemo(() => validateDailySteps(lb.data), [lb.data]);

  const patchVideoConfig = (patch: Partial<BumpReelConfig>) =>
    setVideoConfig((c) => ({ ...c, ...patch }));

  const handleExportPng = async () => {
    const avatars = await lb.ensureAvatars();
    void exportLeaderboardImage(
      lb.data,
      lb.theme,
      lb.exportRatio,
      lb.logoScale,
      lb.cta,
      avatars,
      lb.design,
      setProgress
    );
  };

  const handleExportZip = async () => {
    const avatars = await lb.ensureAvatars();
    void exportLeaderboardRatios(
      lb.data,
      lb.theme,
      ALL_RATIOS,
      lb.logoScale,
      lb.cta,
      avatars,
      lb.design,
      setProgress
    );
  };

  const handleExportBumpReel = () => {
    void exportBumpReelFile(lb.data, effectiveVideoConfig, setProgress);
  };

  const handleRenderBumpReel = async () => {
    setRendering(true);
    try {
      await renderBumpReelServer(lb.data, effectiveVideoConfig, setProgress);
    } finally {
      setRendering(false);
    }
  };

  const renderStyleTab = () =>
    tab === "video" ? (
      <VideoSettings
        config={videoConfig}
        onChange={patchVideoConfig}
        onReset={() => setVideoConfig({ ...DEFAULT_BUMP_CONFIG })}
      />
    ) : (
      <>
        <LookSections
          theme={lb.theme}
          onSetTheme={lb.setTheme}
          style={lb.style}
          onPatch={lb.patchStyle}
          showHighlight={false}
          showHueJourney={false}
          idPrefix="lb-"
        />

        <PanelSection id="lb-card" title="Card">
          <FieldLabel>Aspect ratio</FieldLabel>
          <Segmented
            options={ALL_RATIOS.map((r) => {
              const n = paginateLeaderboard(lb.data.leaderboard, r).length;
              return { value: r, label: n > 1 ? `${r} ·${n}` : r };
            })}
            value={lb.exportRatio}
            onChange={(r) => {
              lb.setExportRatio(r);
              setPreviewPage(0);
            }}
          />
          <Stepper
            label="Logo size"
            value={lb.logoScale}
            min={0.75}
            max={2.5}
            onChange={lb.setLogoScale}
            onReset={lb.logoScale !== 1 ? () => lb.setLogoScale(1) : undefined}
          />
          {pageCount > 1 && (
            <div className="pf-hint">
              {lb.data.leaderboard.length} athletes don't fit one {lb.exportRatio} card, so
              this exports as {pageCount} images.
            </div>
          )}
        </PanelSection>

        {hasCustomLook(lb.style) && (
          <button
            type="button"
            className="panel-reset"
            onClick={() => lb.patchStyle(RESET_LOOK)}
          >
            Reset card look
          </button>
        )}
      </>
    );

  const renderContentTab = () => (
    <>
      <PanelSection id="lb-text" title="Text">
        <FieldLabel>Week label</FieldLabel>
        <input
          className="edit-textarea"
          value={lb.data.week.label}
          onChange={(e) => lb.updateWeekLabel(e.target.value)}
        />
        <FieldLabel>CTA line</FieldLabel>
        <input
          className="edit-textarea"
          value={lb.cta}
          placeholder="e.g. Join the challenge ↓"
          onChange={(e) => lb.setCta(e.target.value)}
        />
        <div className="pf-hint">The CTA shows on the cards and the video outro.</div>
      </PanelSection>

      <PanelSection
        id="lb-roster"
        title="Athletes"
        aside={<span className="ps-note">{lb.data.leaderboard.length} rows</span>}
      >
        {lb.data.leaderboard.map((entry, i) => (
          <div className="lb-row" key={i}>
            <span className="lb-row-rank">{String(entry.rank).padStart(2, "0")}</span>
            <input
              className="edit-textarea lb-row-name"
              value={entry.name}
              onChange={(e) => lb.updateEntry(i, { name: e.target.value })}
            />
            <input
              className="edit-textarea lb-row-steps"
              type="number"
              value={entry.steps}
              onChange={(e) => lb.updateEntry(i, { steps: Number(e.target.value) || 0 })}
            />
            <div className="lb-row-actions">
              <button
                className="lb-mini-btn"
                title="Move up"
                disabled={i === 0}
                onClick={() => lb.moveEntry(i, -1)}
              >
                ↑
              </button>
              <button
                className="lb-mini-btn"
                title="Move down"
                disabled={i === lb.data.leaderboard.length - 1}
                onClick={() => lb.moveEntry(i, 1)}
              >
                ↓
              </button>
              <button
                className="lb-mini-btn lb-mini-danger"
                title="Remove"
                onClick={() => lb.removeEntry(i)}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        <button className="export-btn-secondary" style={{ marginTop: 4 }} onClick={lb.addEntry}>
          + Add row
        </button>
      </PanelSection>

      <PanelSection id="lb-json" title="Import JSON" defaultOpen={false}>
        <textarea
          className="edit-textarea"
          style={{ fontFamily: "var(--font-mono)", fontSize: 11, minHeight: 150 }}
          rows={8}
          value={lb.jsonDraft}
          onChange={(e) => lb.setJsonDraft(e.target.value)}
        />
        {lb.parseError && <div className="bulk-modal-error">{lb.parseError}</div>}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            className="export-btn-primary"
            style={{ marginBottom: 0, flex: 2 }}
            onClick={lb.applyJson}
          >
            Apply JSON
          </button>
          <button className="export-btn-secondary" style={{ flex: 1 }} onClick={lb.resetToSample}>
            Reset
          </button>
        </div>
      </PanelSection>
    </>
  );

  const renderExportTab = () => (
    <>
      {tab === "images" ? (
        <PanelSection id="lb-export-images" title="Images">
          <button className="export-btn-primary" onClick={handleExportZip}>
            ↓ ZIP: every ratio
          </button>
          <button className="export-btn-secondary" onClick={handleExportPng}>
            {pageCount > 1
              ? `↓ ZIP: ${lb.exportRatio} (${pageCount} images)`
              : `↓ PNG: ${lb.exportRatio} only`}
          </button>
        </PanelSection>
      ) : (
        <PanelSection id="lb-export-video" title="Video">
          <button
            className="export-btn-primary"
            disabled={!dailyValidation.ok || rendering}
            onClick={handleRenderBumpReel}
          >
            {rendering ? "⏳ Rendering..." : "↓ Render + download MP4"}
          </button>
          <button
            className="export-btn-secondary"
            disabled={!dailyValidation.ok}
            onClick={handleExportBumpReel}
          >
            ⏵ JSON + terminal command
          </button>
          {!dailyValidation.ok && (
            <div className="bulk-modal-error" style={{ marginTop: 4 }}>
              Add dailySteps to every entry to enable the bump reel.
            </div>
          )}
          <div className="pf-hint" style={{ lineHeight: 1.6, marginTop: 8 }}>
            Render + download runs on the dev server (a minute or two) and saves the MP4 to
            your downloads and <code>./out</code>. The JSON export is the fallback for
            rendering from a terminal.
          </div>
        </PanelSection>
      )}
      <div className="export-progress" ref={progressRef} />
    </>
  );

  return (
    <>
      <div className="center">
        <div className="topbar">
          <div className="topbar-left" style={{ display: "flex", alignItems: "center" }}>
            <div className="post-title-bar">Weekly Leaderboard</div>
            <div className="lb-tabs">
              {(["images", "video"] as LeaderboardTab[]).map((t) => (
                <button
                  key={t}
                  className={`mode-switch-btn${tab === t ? " active" : ""}`}
                  onClick={() => setTab(t)}
                >
                  {t === "images" ? "Images" : "Video"}
                </button>
              ))}
            </div>
          </div>
          <div className="tags">
            {tab === "images" ? (
              <>
                <span className="tag">{lb.exportRatio}</span>
                <span className="tag">{lb.theme}</span>
                {pageCount > 1 && <span className="tag">{pageCount} imgs</span>}
              </>
            ) : (
              <>
                <span className="tag">{videoConfig.format}</span>
                <span className="tag">{videoConfig.theme}</span>
                <span className="tag">{videoConfig.pacing}</span>
              </>
            )}
          </div>
        </div>

        {tab === "images" && pageCount > 1 && (
          <div className="slide-nav">
            <button
              className="nav-btn"
              onClick={() => setPreviewPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
            >
              ‹
            </button>
            <span className="slide-counter">
              Part {safePage + 1} / {pageCount}
            </span>
            <button
              className="nav-btn"
              onClick={() => setPreviewPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={safePage === pageCount - 1}
            >
              ›
            </button>
          </div>
        )}

        <div
          className="card-area"
          style={{ paddingTop: tab === "images" && pageCount > 1 ? 8 : 24 }}
        >
          {tab === "images" ? (
            <div style={{ width: "100%", maxWidth: 400 }}>
              <LeaderboardCard
                data={lb.data}
                theme={lb.theme}
                aspectRatio={lb.exportRatio}
                logoScale={lb.logoScale}
                cta={lb.cta}
                pageIndex={safePage}
                avatars={lb.avatars}
                design={lb.design}
              />
            </div>
          ) : (
            <VideoPreview
              data={lb.data}
              config={effectiveVideoConfig}
              avatars={lb.avatars}
            />
          )}
        </div>
      </div>

      <div className="sidebar-right cp-panel lb-panel">
        <div className="cp-tabs" role="tablist">
          {PANEL_TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={panelTab === t.value}
              className={`cp-tab${panelTab === t.value ? " active" : ""}`}
              onClick={() => setPanelTab(t.value)}
            >
              {t.value === "style" && tab === "video" ? "Video" : t.label}
            </button>
          ))}
        </div>
        <div className="cp-body">
          {panelTab === "style" && renderStyleTab()}
          {panelTab === "content" && renderContentTab()}
          {panelTab === "export" && renderExportTab()}
        </div>
      </div>
    </>
  );
};
