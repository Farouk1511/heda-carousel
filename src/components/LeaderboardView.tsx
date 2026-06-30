import React, { useRef, useState } from "react";
import type { ThemeName } from "../data/themes";
import type { AspectRatio } from "../hooks/useCarouselState";
import { useLeaderboardState } from "../hooks/useLeaderboardState";
import { paginateLeaderboard } from "../data/leaderboard/pagination";
import { LeaderboardCard } from "./LeaderboardCard";
import {
  exportLeaderboardImage,
  exportLeaderboardRatios,
} from "../utils/export";

const ALL_RATIOS: AspectRatio[] = ["1:1", "4:5", "9:16"];

export const LeaderboardView: React.FC = () => {
  const lb = useLeaderboardState();
  const [previewPage, setPreviewPage] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  const setProgress = (msg: string) => {
    if (progressRef.current) progressRef.current.textContent = msg;
  };

  const pages = paginateLeaderboard(lb.data.leaderboard, lb.exportRatio);
  const pageCount = pages.length;
  const safePage = Math.min(previewPage, pageCount - 1);

  const handleExportPng = async () => {
    const avatars = await lb.ensureAvatars();
    void exportLeaderboardImage(
      lb.data,
      lb.theme,
      lb.exportRatio,
      lb.logoScale,
      lb.cta,
      avatars,
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
      setProgress
    );
  };

  return (
    <>
      <div className="center">
        <div className="topbar">
          <div className="topbar-left">
            <div className="post-title-bar">Weekly Leaderboard</div>
          </div>
          <div className="tags">
            <span className="tag">{lb.exportRatio}</span>
            <span className="tag">{lb.theme}</span>
            {pageCount > 1 && <span className="tag">{pageCount} imgs</span>}
          </div>
        </div>

        {pageCount > 1 && (
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

        <div className="card-area" style={{ paddingTop: pageCount > 1 ? 8 : 24 }}>
          <div style={{ width: "100%", maxWidth: 400 }}>
            <LeaderboardCard
              data={lb.data}
              theme={lb.theme}
              aspectRatio={lb.exportRatio}
              logoScale={lb.logoScale}
              cta={lb.cta}
              pageIndex={safePage}
              avatars={lb.avatars}
            />
          </div>
        </div>
      </div>

      <div className="sidebar-right lb-wide">
        <div className="section-label">THEME</div>
        <div className="theme-btns">
          {(["standard", "deep"] as ThemeName[]).map((th) => (
            <button
              key={th}
              className={`theme-btn${lb.theme === th ? " active" : ""}`}
              onClick={() => lb.setTheme(th)}
            >
              {th}
            </button>
          ))}
        </div>

        <div className="section-label">ASPECT RATIO</div>
        <div className="ratio-btns">
          {ALL_RATIOS.map((r) => {
            const n = paginateLeaderboard(lb.data.leaderboard, r).length;
            return (
              <button
                key={r}
                className={`ratio-btn${lb.exportRatio === r ? " active" : ""}`}
                onClick={() => {
                  lb.setExportRatio(r);
                  setPreviewPage(0);
                }}
              >
                {r}
                {n > 1 ? ` ·${n}` : ""}
              </button>
            );
          })}
        </div>

        <div className="section-label">LOGO SIZE</div>
        <div className="size-control">
          <button
            className="size-btn"
            onClick={() =>
              lb.setLogoScale(Math.max(0.75, Number((lb.logoScale - 0.1).toFixed(2))))
            }
          >
            -
          </button>
          <div className="size-value">{Math.round(lb.logoScale * 100)}%</div>
          <button
            className="size-btn"
            onClick={() =>
              lb.setLogoScale(Math.min(2.5, Number((lb.logoScale + 0.1).toFixed(2))))
            }
          >
            +
          </button>
        </div>

        <div className="section-label" style={{ marginTop: 24 }}>
          CONTENT
        </div>
        <div className="edit-field">
          <label className="edit-label">WEEK LABEL</label>
          <input
            className="edit-textarea"
            value={lb.data.week.label}
            onChange={(e) => lb.updateWeekLabel(e.target.value)}
          />
        </div>
        <div className="edit-field">
          <label className="edit-label">CTA LINE</label>
          <input
            className="edit-textarea"
            value={lb.cta}
            placeholder="e.g. Join the challenge ↓"
            onChange={(e) => lb.setCta(e.target.value)}
          />
        </div>

        <div className="section-label" style={{ marginTop: 20 }}>
          LEADERBOARD ({lb.data.leaderboard.length})
        </div>
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

        <div className="section-label" style={{ marginTop: 24 }}>
          IMPORT JSON
        </div>
        <textarea
          className="edit-textarea"
          style={{ fontFamily: "var(--font-mono)", fontSize: 11, minHeight: 150 }}
          rows={8}
          value={lb.jsonDraft}
          onChange={(e) => lb.setJsonDraft(e.target.value)}
        />
        {lb.parseError && <div className="bulk-modal-error">{lb.parseError}</div>}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button className="export-btn-primary" style={{ marginBottom: 0, flex: 2 }} onClick={lb.applyJson}>
            Apply JSON
          </button>
          <button className="export-btn-secondary" style={{ flex: 1 }} onClick={lb.resetToSample}>
            Reset
          </button>
        </div>

        <div className="section-label" style={{ marginTop: 28 }}>
          EXPORT
        </div>
        <button className="export-btn-primary" onClick={handleExportZip}>
          ↓ ZIP — All Ratios
        </button>
        <button className="export-btn-secondary" onClick={handleExportPng}>
          {pageCount > 1
            ? `↓ ZIP — ${lb.exportRatio} (${pageCount} imgs)`
            : `↓ PNG — ${lb.exportRatio} Only`}
        </button>
        <div className="export-progress" ref={progressRef} />
      </div>
    </>
  );
};
