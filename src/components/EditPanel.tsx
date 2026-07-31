import React, { useRef } from "react";
import type { MockupLayout, Post, SlideMockup, SlideTextTransform } from "../data/posts";
import type { ThemeName } from "../data/themes";
import type { AspectRatio } from "../hooks/useCarouselState";
import { buildCaption } from "../data/posts";
import type {
  ChromeOptions,
  HighlightStyle,
  MockupFrame,
  PostStyleEntry,
  SlideStyle,
  TextureOptions,
} from "../data/design/types";
import { BACKGROUNDS, BACKGROUND_GROUPS } from "../data/design/backgrounds";
import { HIGHLIGHT_STYLES } from "../data/design/highlights";
import { VARIANTS, suggestVariant } from "../data/design/variants";
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
  postStyle?: PostStyleEntry;
  onPatchPostStyle: (patch: Partial<Omit<PostStyleEntry, "slides">>) => void;
  onPatchSlideStyle: (slideIdx: number, patch: Partial<SlideStyle>) => void;
  safeArea: boolean;
  onToggleSafeArea: () => void;
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
  postStyle,
  onPatchPostStyle,
  onPatchSlideStyle,
  safeArea,
  onToggleSafeArea,
}) => {
  const progressRef = useRef<HTMLDivElement>(null);

  const chromeOn = (key: keyof ChromeOptions, fallback: boolean) =>
    postStyle?.chrome?.[key] ?? fallback;
  const textureOn = (key: keyof TextureOptions) =>
    postStyle?.texture?.[key] ?? false;
  const toggleChrome = (key: keyof ChromeOptions, fallback: boolean) =>
    onPatchPostStyle({
      chrome: { ...postStyle?.chrome, [key]: !chromeOn(key, fallback) },
    });
  const toggleTexture = (key: keyof TextureOptions) =>
    onPatchPostStyle({
      texture: { ...postStyle?.texture, [key]: !textureOn(key) },
    });

  const setProgress = (msg: string) => {
    if (progressRef.current) progressRef.current.textContent = msg;
  };

  const captionHTML = buildCaption(post);

  const handleExportCurrent = async () => {
    await exportCurrentSlide(
      post,
      currentSlide,
      theme,
      postStyle,
      exportRatio,
      logoScale,
      setProgress
    );
  };

  const handleExportAll = async () => {
    await exportAllSlides(
      post,
      theme,
      postStyle,
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

      <div className="section-label" style={{ marginTop: 28 }}>
        BACKGROUND
      </div>
      {BACKGROUND_GROUPS.map((group) => (
        <div key={group.id} className="bg-group">
          <div className="bg-group-label">{group.label}</div>
          <div className="bg-swatch-grid">
            {BACKGROUNDS.filter((b) => b.group === group.id).map((b) => (
              <button
                key={b.id}
                type="button"
                title={b.label}
                className={`bg-swatch${postStyle?.backgroundId === b.id ? " active" : ""}`}
                style={{ background: b.swatch }}
                onClick={() =>
                  onPatchPostStyle({
                    backgroundId:
                      postStyle?.backgroundId === b.id ? undefined : b.id,
                  })
                }
              />
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        className={`mockup-reset-btn${postStyle?.backgroundId ? "" : " active"}`}
        onClick={() => onPatchPostStyle({ backgroundId: undefined })}
      >
        Theme default
      </button>

      <div className="section-label" style={{ marginTop: 20 }}>
        HIGHLIGHT
      </div>
      <div className="mockup-layout-grid">
        {HIGHLIGHT_STYLES.map((h) => (
          <button
            key={h.id}
            type="button"
            className={`mockup-layout-btn${(postStyle?.highlightStyle ?? "color") === h.id ? " active" : ""}`}
            onClick={() =>
              onPatchPostStyle({
                highlightStyle: h.id === "color" ? undefined : (h.id as HighlightStyle),
              })
            }
          >
            {h.label}
          </button>
        ))}
      </div>

      <div className="section-label" style={{ marginTop: 20 }}>
        TEXTURE
      </div>
      <div className="mockup-layout-grid">
        {(
          [
            ["grain", "Grain"],
            ["secondOrb", "Second orb"],
            ["dotGrid", "Dot grid"],
            ["hueJourney", "Hue journey"],
          ] as [keyof TextureOptions, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`mockup-layout-btn${textureOn(key) ? " active" : ""}`}
            onClick={() => toggleTexture(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="section-label" style={{ marginTop: 20 }}>
        CHROME
      </div>
      <div className="mockup-layout-grid">
        {(
          [
            ["swipePill", "Swipe pill", true],
            ["progressBar", "Progress bar", false],
            ["ctaButton", "CTA button", true],
            ["profileRow", "Profile row", true],
          ] as [keyof ChromeOptions, string, boolean][]
        ).map(([key, label, fallback]) => (
          <button
            key={key}
            type="button"
            className={`mockup-layout-btn${chromeOn(key, fallback) ? " active" : ""}`}
            onClick={() => toggleChrome(key, fallback)}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className={`mockup-layout-btn${(postStyle?.coverWatermark ?? true) ? " active" : ""}`}
          onClick={() =>
            onPatchPostStyle({
              coverWatermark: !(postStyle?.coverWatermark ?? true),
            })
          }
        >
          Cover watermark
        </button>
        <button
          type="button"
          className={`mockup-layout-btn${postStyle?.coverChip ? " active" : ""}`}
          onClick={() => onPatchPostStyle({ coverChip: !postStyle?.coverChip })}
        >
          Day chip
        </button>
        <button
          type="button"
          className={`mockup-layout-btn${safeArea ? " active" : ""}`}
          onClick={onToggleSafeArea}
        >
          Safe area (preview)
        </button>
      </div>

      <div className="section-label" style={{ marginTop: 28 }}>EDIT SLIDES</div>
      {post.slides.map((sl, i) => {
        const isEd = editingSlide === i;
        const slideStyle = postStyle?.slides?.[i];
        const currentVariant = slideStyle?.variant ?? "default";
        const suggestion = suggestVariant(sl);
        const frame: MockupFrame | undefined = slideStyle?.mockupFrame;
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
                    <div className="mockup-control-label">FRAME</div>
                    <div className="mockup-layout-grid">
                      <button
                        type="button"
                        className={`mockup-layout-btn${!frame ? " active" : ""}`}
                        onClick={() => onPatchSlideStyle(i, { mockupFrame: undefined })}
                      >
                        None
                      </button>
                      <button
                        type="button"
                        className={`mockup-layout-btn${frame?.kind === "phone" ? " active" : ""}`}
                        onClick={() =>
                          onPatchSlideStyle(i, {
                            mockupFrame: { ...frame, kind: "phone" },
                          })
                        }
                      >
                        Phone
                      </button>
                      <button
                        type="button"
                        className={`mockup-layout-btn${frame?.kind === "browser" ? " active" : ""}`}
                        onClick={() =>
                          onPatchSlideStyle(i, {
                            mockupFrame: { ...frame, kind: "browser" },
                          })
                        }
                      >
                        Browser
                      </button>
                    </div>
                    {frame && (
                      <div className="mockup-layout-grid">
                        <button
                          type="button"
                          className={`mockup-layout-btn${frame.tilt ? " active" : ""}`}
                          onClick={() =>
                            onPatchSlideStyle(i, {
                              mockupFrame: { ...frame, tilt: !frame.tilt },
                            })
                          }
                        >
                          Tilt
                        </button>
                        <button
                          type="button"
                          className={`mockup-layout-btn${frame.glow ? " active" : ""}`}
                          onClick={() =>
                            onPatchSlideStyle(i, {
                              mockupFrame: { ...frame, glow: !frame.glow },
                            })
                          }
                        >
                          Glow
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="edit-field">
                <label className="edit-label">VARIANT</label>
                <div className="mockup-layout-grid">
                  {VARIANTS.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      className={`mockup-layout-btn${currentVariant === v.id ? " active" : ""}`}
                      onClick={() =>
                        onPatchSlideStyle(i, {
                          variant: v.id === "default" ? undefined : v.id,
                        })
                      }
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
                {suggestion && currentVariant === "default" && (
                  <div className="variant-hint">
                    Looks like a {suggestion} — try it
                  </div>
                )}
              </div>
              <div className="edit-field">
                <label className="edit-label">BACKGROUND OVERRIDE</label>
                <div className="bg-swatch-grid">
                  {BACKGROUNDS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      title={b.label}
                      className={`bg-swatch bg-swatch--sm${slideStyle?.backgroundId === b.id ? " active" : ""}`}
                      style={{ background: b.swatch }}
                      onClick={() =>
                        onPatchSlideStyle(i, {
                          backgroundId:
                            slideStyle?.backgroundId === b.id ? undefined : b.id,
                        })
                      }
                    />
                  ))}
                </div>
                {slideStyle?.backgroundId && (
                  <button
                    type="button"
                    className="mockup-reset-btn"
                    onClick={() => onPatchSlideStyle(i, { backgroundId: undefined })}
                  >
                    Use post default
                  </button>
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
