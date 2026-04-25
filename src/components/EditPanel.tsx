import React, { useRef } from "react";
import type { Post } from "../data/posts";
import type { ThemeName } from "../data/themes";
import type { AspectRatio } from "../hooks/useCarouselState";
import { HASHTAGS } from "../data/posts";
import {
  exportCurrentSlide,
  exportAllSlides,
  exportReelCommand,
} from "../utils/export";

interface EditPanelProps {
  post: Post;
  currentSlide: number;
  theme: ThemeName;
  editingSlide: number | null;
  exportRatio: AspectRatio;
  logoScale: number;
  onSetTheme: (t: ThemeName) => void;
  onToggleEdit: (i: number) => void;
  onUpdateField: (slideIdx: number, field: "headline" | "sub", value: string) => void;
  onSetExportRatio: (r: AspectRatio) => void;
  onSetLogoScale: (value: number) => void;
  onSetCurrentSlide: (i: number) => void;
  postIndex: number;
  onOpenBulkExport: () => void;
}

export const EditPanel: React.FC<EditPanelProps> = ({
  post,
  currentSlide,
  theme,
  editingSlide,
  exportRatio,
  logoScale,
  onSetTheme,
  onToggleEdit,
  onUpdateField,
  onSetExportRatio,
  onSetLogoScale,
  onSetCurrentSlide,
  postIndex,
  onOpenBulkExport,
}) => {
  const progressRef = useRef<HTMLDivElement>(null);

  const setProgress = (msg: string) => {
    if (progressRef.current) progressRef.current.textContent = msg;
  };

  const cleanHL = post.slides[0].headline.replace(/\*\*/g, "");
  const captionHTML = `${cleanHL} \u{1F4AA}\n\n${post.slides[0].sub}\n\nSwipe through for the full truth. \u27A1\uFE0F\n\n${HASHTAGS}`;

  const handleExportCurrent = async () => {
    await exportCurrentSlide(post, currentSlide, theme, exportRatio, logoScale, setProgress);
  };

  const handleExportAll = async () => {
    await exportAllSlides(
      post,
      theme,
      exportRatio,
      logoScale,
      setProgress,
      onSetCurrentSlide,
      currentSlide
    );
  };

  const handleExportReel = async () => {
    await exportReelCommand(postIndex, post.day, theme, logoScale, setProgress);
  };

  return (
    <div className="sidebar-right">
      <div className="section-label">THEME</div>
      <div className="theme-btns">
        <button
          className={`theme-btn${theme === "standard" ? " active" : ""}`}
          onClick={() => onSetTheme("standard")}
        >
          Standard
        </button>
        <button
          className={`theme-btn${theme === "deep" ? " active" : ""}`}
          onClick={() => onSetTheme("deep")}
        >
          Deep
        </button>
      </div>

      <div className="section-label">EDIT SLIDES</div>
      {post.slides.map((sl, i) => {
        const isEd = editingSlide === i;
        return (
          <div className="slide-edit-item" key={i}>
            <div
              className={`slide-edit-header${isEd ? " active" : ""}`}
              onClick={() => onToggleEdit(i)}
            >
              <div className="slide-edit-label">
                <span className="slide-edit-num">Slide {i + 1}</span>
                <span className="slide-edit-type">{sl.type}</span>
              </div>
              <span className="slide-edit-arrow">{"\u25BE"}</span>
            </div>
            <div className={`slide-edit-body${isEd ? " open" : ""}`}>
              <div className="edit-field">
                <label className="edit-label">HEADLINE</label>
                <textarea
                  className="edit-textarea"
                  rows={2}
                  value={sl.headline}
                  onChange={(e) => onUpdateField(i, "headline", e.target.value)}
                />
              </div>
              <div className="edit-field">
                <label className="edit-label">SUBTEXT</label>
                <textarea
                  className="edit-textarea"
                  rows={2}
                  value={sl.sub}
                  onChange={(e) => onUpdateField(i, "sub", e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      })}

      <div className="section-label" style={{ marginTop: 28 }}>
        EXPORT
      </div>
      <div
        className="section-label"
        style={{ marginTop: 0, marginBottom: 6, fontSize: 10, opacity: 0.5 }}
      >
        ASPECT RATIO
      </div>
      <div className="ratio-btns">
        {(["1:1", "4:5", "9:16"] as AspectRatio[]).map((r) => (
          <button
            key={r}
            className={`ratio-btn${exportRatio === r ? " active" : ""}`}
            onClick={() => onSetExportRatio(r)}
          >
            {r}
          </button>
        ))}
      </div>
      <div
        className="section-label"
        style={{ marginTop: 0, marginBottom: 6, fontSize: 10, opacity: 0.5 }}
      >
        LOGO SIZE
      </div>
      <div className="size-control">
        <button
          className="size-btn"
          onClick={() => onSetLogoScale(Math.max(0.75, Number((logoScale - 0.1).toFixed(2))))}
        >
          -
        </button>
        <div className="size-value">{Math.round(logoScale * 100)}%</div>
        <button
          className="size-btn"
          onClick={() => onSetLogoScale(Math.min(2.5, Number((logoScale + 0.1).toFixed(2))))}
        >
          +
        </button>
      </div>
      <button className="export-btn-primary" onClick={handleExportAll}>
        ↓ ZIP — All Slides + Caption
      </button>
      <button className="export-btn-secondary" onClick={handleExportCurrent}>
        ↓ PNG — This Slide Only
      </button>
      <button className="export-btn-secondary" onClick={handleExportReel}>
        ↓ Reel MP4 — Copy Render Command
      </button>
      <button
        className="export-btn-primary"
        style={{ marginTop: 12 }}
        onClick={onOpenBulkExport}
      >
        ↓ Export All Posts
      </button>
      <div className="export-progress" ref={progressRef} />

      <div className="section-label" style={{ marginTop: 28 }}>
        CAPTION PREVIEW
      </div>
      <div
        className="caption-preview"
        style={{ whiteSpace: "pre-wrap" }}
      >
        {captionHTML}
      </div>
    </div>
  );
};
