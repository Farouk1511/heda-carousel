import React, { useRef } from "react";
import type { MockupLayout, Post, SlideMockup, SlideTextTransform } from "../data/posts";
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
  onUpdateMockup: (slideIdx: number, mockup: SlideMockup) => void;
  onPatchMockup: (slideIdx: number, patch: Partial<SlideMockup>) => void;
  onSetMockupLayout: (slideIdx: number, layout: MockupLayout) => void;
  onPatchTextTransform: (slideIdx: number, patch: Partial<SlideTextTransform>) => void;
  onRemoveMockup: (slideIdx: number) => void;
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
  onUpdateMockup,
  onPatchMockup,
  onSetMockupLayout,
  onPatchTextTransform,
  onRemoveMockup,
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

  const handleMockupFile = (slideIdx: number, file?: File | null) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setProgress("Use a PNG, JPG, or WebP mockup image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const existing = post.slides[slideIdx].mockup;
      onUpdateMockup(slideIdx, {
        src: String(reader.result),
        name: file.name,
        layout: existing?.layout ?? "free",
        offsetX: existing?.offsetX ?? 0,
        offsetY: existing?.offsetY ?? 0,
        scale: existing?.scale ?? 1,
        fit: "contain",
      });
    };
    reader.onerror = () => setProgress("Could not read that image.");
    reader.readAsDataURL(file);
  };

  const layoutOptions: { value: MockupLayout; label: string }[] = [
    { value: "free", label: "Free" },
    { value: "text-top", label: "Text top" },
    { value: "text-bottom", label: "Text bottom" },
    { value: "text-left", label: "Text left" },
    { value: "text-right", label: "Text right" },
  ];

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
              <div className="edit-field">
                <label className="edit-label">MOCKUP IMAGE</label>
                <div className="mockup-upload-row">
                  <label className="mockup-upload-btn">
                    {sl.mockup ? "Replace image" : "Upload mockup"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => {
                        handleMockupFile(i, e.target.files?.[0]);
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                  {sl.mockup && (
                    <button
                      type="button"
                      className="mockup-remove-btn"
                      onClick={() => onRemoveMockup(i)}
                    >
                      Remove
                    </button>
                  )}
                </div>
                {sl.mockup && (
                  <div className="mockup-controls">
                    <div className="mockup-file-name">{sl.mockup.name ?? "Uploaded mockup"}</div>
                    <div className="mockup-layout-grid">
                      {layoutOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={`mockup-layout-btn${sl.mockup?.layout === option.value ? " active" : ""}`}
                          onClick={() => onSetMockupLayout(i, option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <div className="mockup-control-label">IMAGE SCALE</div>
                    <div className="mockup-transform-row">
                      <button
                        type="button"
                        className="size-btn"
                        onClick={() =>
                          onPatchMockup(i, {
                            scale: Math.max(0.5, Number((sl.mockup!.scale - 0.1).toFixed(2))),
                          })
                        }
                      >
                        -
                      </button>
                      <div className="size-value">{Math.round(sl.mockup.scale * 100)}%</div>
                      <button
                        type="button"
                        className="size-btn"
                        onClick={() =>
                          onPatchMockup(i, {
                            scale: Math.min(2.5, Number((sl.mockup!.scale + 0.1).toFixed(2))),
                          })
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="mockup-reset-btn"
                      onClick={() => onPatchMockup(i, { offsetX: 0, offsetY: 0, scale: 1 })}
                    >
                      Reset image
                    </button>
                    <div className="mockup-control-label">TEXT BLOCK</div>
                    <div className="mockup-transform-row">
                      <button
                        type="button"
                        className="size-btn"
                        onClick={() =>
                          onPatchTextTransform(i, {
                            scale: Math.max(
                              0.6,
                              Number(((sl.textTransform?.scale ?? 1) - 0.1).toFixed(2))
                            ),
                          })
                        }
                      >
                        -
                      </button>
                      <div className="size-value">
                        {Math.round((sl.textTransform?.scale ?? 1) * 100)}%
                      </div>
                      <button
                        type="button"
                        className="size-btn"
                        onClick={() =>
                          onPatchTextTransform(i, {
                            scale: Math.min(
                              1.8,
                              Number(((sl.textTransform?.scale ?? 1) + 0.1).toFixed(2))
                            ),
                          })
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="mockup-reset-btn"
                      onClick={() => onPatchTextTransform(i, { offsetX: 0, offsetY: 0, scale: 1 })}
                    >
                      Reset text
                    </button>
                  </div>
                )}
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
