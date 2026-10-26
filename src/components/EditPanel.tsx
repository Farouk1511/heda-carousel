import React, { useRef, useState } from "react";
import type { MockupLayout, Post, SlideMockup, SlideTextTransform } from "../data/posts";
import type { ThemeName } from "../data/themes";
import type { AspectRatio } from "../hooks/useCarouselState";
import { buildCaption } from "../data/posts";
import type {
  ChromeOptions,
  MockupFrame,
  PostStyleEntry,
  SlideStyle,
  SlideVariant,
} from "../data/design/types";
import { BACKGROUNDS } from "../data/design/backgrounds";
import { hasCustomLook, RESET_LOOK } from "../data/design/lookState";
import { VARIANTS, suggestVariant } from "../data/design/variants";
import {
  exportCurrentSlide,
  exportAllSlides,
  exportReelCommand,
} from "../utils/export";
import { LibraryPicker } from "./LibraryPicker";
import type { LibraryAsset } from "../data/library";
import { FieldLabel, PanelSection, Segmented, Stepper, ToggleRow } from "./panel/PanelUI";
import { LookSections } from "./panel/LookSections";

interface EditPanelProps {
  post: Post;
  currentSlide: number;
  theme: ThemeName;
  exportRatio: AspectRatio;
  logoScale: number;
  onSetTheme: (t: ThemeName) => void;
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

type PanelTab = "style" | "slide" | "export";
const TAB_KEY = "heda.panel.tab";

const TABS: { value: PanelTab; label: string }[] = [
  { value: "style", label: "Style" },
  { value: "slide", label: "Slide" },
  { value: "export", label: "Export" },
];

const CHROME: [keyof ChromeOptions, string, boolean][] = [
  ["swipePill", "Swipe pill", true],
  ["progressBar", "Progress bar", false],
  ["ctaButton", "CTA button", true],
  ["profileRow", "Profile row", true],
];

const LAYOUTS: { value: MockupLayout; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "text-top", label: "Text top" },
  { value: "text-bottom", label: "Text bottom" },
  { value: "text-left", label: "Text left" },
  { value: "text-right", label: "Text right" },
];

type FrameKind = "none" | "phone" | "browser";

function readTab(): PanelTab {
  try {
    const t = localStorage.getItem(TAB_KEY);
    return t === "slide" || t === "export" ? t : "style";
  } catch {
    return "style";
  }
}

export const EditPanel: React.FC<EditPanelProps> = ({
  post,
  currentSlide,
  theme,
  exportRatio,
  logoScale,
  onSetTheme,
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
  const [tab, setTabState] = useState<PanelTab>(readTab);
  /** Slide index the library picker is choosing an image for. */
  const [libraryFor, setLibraryFor] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const setTab = (t: PanelTab) => {
    setTabState(t);
    try {
      localStorage.setItem(TAB_KEY, t);
    } catch {
      /* per-viewer convenience only */
    }
  };

  const chromeOn = (key: keyof ChromeOptions, fallback: boolean) =>
    postStyle?.chrome?.[key] ?? fallback;
  const toggleChrome = (key: keyof ChromeOptions, fallback: boolean) =>
    onPatchPostStyle({
      chrome: { ...postStyle?.chrome, [key]: !chromeOn(key, fallback) },
    });

  // Only offer a reset when something actually differs from the defaults.
  const hasPostLook = Boolean(
    hasCustomLook(postStyle) ||
      (postStyle &&
        (CHROME.some(([key, , fallback]) => chromeOn(key, fallback) !== fallback) ||
          (postStyle.coverWatermark ?? true) !== true ||
          postStyle.coverChip))
  );
  const resetPostLook = () =>
    onPatchPostStyle({
      ...RESET_LOOK,
      chrome: undefined,
      coverWatermark: undefined,
      coverChip: undefined,
    });

  const setProgress = (msg: string) => {
    if (progressRef.current) progressRef.current.textContent = msg;
  };

  const captionText = buildCaption(post);

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(captionText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setProgress("Couldn't copy — select the caption and copy it manually.");
    }
  };

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

  const handleLibraryPick = (slideIdx: number, asset: LibraryAsset) => {
    const existing = post.slides[slideIdx].mockup;
    onUpdateMockup(slideIdx, {
      src: asset.src,
      name: asset.name,
      layout: existing?.layout ?? "free",
      offsetX: existing?.offsetX ?? 0,
      offsetY: existing?.offsetY ?? 0,
      scale: existing?.scale ?? 1,
      fit: "contain",
    });
    setLibraryFor(null);
  };

  // ---- Style tab: the look of the whole post -------------------------------
  const renderStyle = () => (
    <>
      <LookSections
        theme={theme}
        onSetTheme={onSetTheme}
        style={postStyle}
        onPatch={onPatchPostStyle}
      />

      <PanelSection id="chrome" title="Card chrome">
        {CHROME.map(([key, label, fallback]) => (
          <ToggleRow
            key={key}
            label={label}
            on={chromeOn(key, fallback)}
            onChange={() => toggleChrome(key, fallback)}
          />
        ))}
        <ToggleRow
          label="Cover watermark"
          on={postStyle?.coverWatermark ?? true}
          onChange={() =>
            onPatchPostStyle({ coverWatermark: !(postStyle?.coverWatermark ?? true) })
          }
        />
        <ToggleRow
          label="Day chip"
          hint="Series number on the cover"
          on={Boolean(postStyle?.coverChip)}
          onChange={() => onPatchPostStyle({ coverChip: !postStyle?.coverChip })}
        />
        <Stepper
          label="Logo size"
          value={logoScale}
          min={0.75}
          max={2.5}
          onChange={onSetLogoScale}
          onReset={logoScale !== 1 ? () => onSetLogoScale(1) : undefined}
        />
      </PanelSection>

      <PanelSection id="preview" title="Preview">
        <ToggleRow
          label="Safe area"
          hint="Shows Instagram's crop zones; not exported"
          on={safeArea}
          onChange={onToggleSafeArea}
        />
      </PanelSection>

      {hasPostLook && (
        <button type="button" className="panel-reset" onClick={resetPostLook}>
          Reset post look
        </button>
      )}
    </>
  );

  // ---- Slide tab: whatever slide the preview is showing --------------------
  const renderSlide = () => {
    const i = Math.min(currentSlide, post.slides.length - 1);
    const sl = post.slides[i];
    if (!sl) return null;
    const slideStyle = postStyle?.slides?.[i];
    const currentVariant = slideStyle?.variant ?? "default";
    const suggestion = suggestVariant(sl);
    const frame: MockupFrame | undefined = slideStyle?.mockupFrame;
    const frameKind: FrameKind = frame?.kind ?? "none";

    return (
      <>
        <div className="slide-strip">
          {post.slides.map((s, idx) => (
            <button
              key={idx}
              type="button"
              title={s.headline}
              className={`slide-chip${idx === i ? " active" : ""}${s.mockup ? " has-img" : ""}`}
              onClick={() => onSetCurrentSlide(idx)}
            >
              <span className="slide-chip-num">{idx + 1}</span>
              <span className="slide-chip-type">{s.type}</span>
            </button>
          ))}
        </div>

        <PanelSection id="slide-text" title="Text">
          <FieldLabel>Headline</FieldLabel>
          <textarea
            className="edit-textarea"
            rows={3}
            value={sl.headline}
            onChange={(e) => onUpdateField(i, "headline", e.target.value)}
          />
          <FieldLabel>Subtext</FieldLabel>
          <textarea
            className="edit-textarea"
            rows={2}
            value={sl.sub}
            onChange={(e) => onUpdateField(i, "sub", e.target.value)}
          />
        </PanelSection>

        <PanelSection
          id="slide-image"
          title="Image"
          aside={
            sl.mockup ? (
              <button type="button" className="ps-link ps-link--danger" onClick={() => onRemoveMockup(i)}>
                Remove
              </button>
            ) : undefined
          }
        >
          {sl.mockup && (
            <div className="img-card">
              <img src={sl.mockup.src} alt="" className="img-card-thumb" />
              <span className="img-card-name">{sl.mockup.name ?? "Uploaded image"}</span>
            </div>
          )}
          <div className="img-actions">
            <button type="button" className="img-action img-action--primary" onClick={() => setLibraryFor(i)}>
              From library
            </button>
            <label className="img-action">
              {sl.mockup ? "Replace…" : "Upload…"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  handleMockupFile(i, e.target.files?.[0]);
                  e.currentTarget.value = "";
                }}
              />
            </label>
          </div>

          {sl.mockup && (
            <>
              <FieldLabel>Layout</FieldLabel>
              <Segmented
                wrap
                options={LAYOUTS}
                value={sl.mockup.layout}
                onChange={(l) => onSetMockupLayout(i, l)}
              />
              <Stepper
                label="Image size"
                value={sl.mockup.scale}
                min={0.5}
                max={2.5}
                onChange={(scale) => onPatchMockup(i, { scale })}
                onReset={() => onPatchMockup(i, { offsetX: 0, offsetY: 0, scale: 1 })}
              />
              <Stepper
                label="Text size"
                value={sl.textTransform?.scale ?? 1}
                min={0.6}
                max={1.8}
                onChange={(scale) => onPatchTextTransform(i, { scale })}
                onReset={() => onPatchTextTransform(i, { offsetX: 0, offsetY: 0, scale: 1 })}
              />
              <div className="pf-hint">Drag the image or text on the preview to move it.</div>

              <FieldLabel>Frame</FieldLabel>
              <Segmented
                options={[
                  { value: "none", label: "None" },
                  { value: "phone", label: "Phone" },
                  { value: "browser", label: "Browser" },
                ]}
                value={frameKind}
                onChange={(k) =>
                  onPatchSlideStyle(i, {
                    mockupFrame: k === "none" ? undefined : { ...frame, kind: k },
                  })
                }
              />
              {frame && (
                <>
                  <ToggleRow
                    label="Tilt"
                    on={Boolean(frame.tilt)}
                    onChange={() => onPatchSlideStyle(i, { mockupFrame: { ...frame, tilt: !frame.tilt } })}
                  />
                  <ToggleRow
                    label="Glow"
                    on={Boolean(frame.glow)}
                    onChange={() => onPatchSlideStyle(i, { mockupFrame: { ...frame, glow: !frame.glow } })}
                  />
                </>
              )}
            </>
          )}
        </PanelSection>

        <PanelSection id="slide-variant" title="Layout variant">
          <Segmented
            wrap
            options={VARIANTS.map((v) => ({ value: v.id, label: v.label }))}
            value={currentVariant}
            onChange={(id) =>
              onPatchSlideStyle(i, {
                variant: id === "default" ? undefined : (id as SlideVariant),
              })
            }
          />
          {suggestion && currentVariant === "default" && (
            <button
              type="button"
              className="variant-hint"
              onClick={() => onPatchSlideStyle(i, { variant: suggestion })}
            >
              Looks like a {suggestion}. Try it →
            </button>
          )}
        </PanelSection>

        <PanelSection
          id="slide-bg"
          title="Background"
          defaultOpen={false}
          aside={
            slideStyle?.backgroundId ? (
              <button
                type="button"
                className="ps-link"
                onClick={() => onPatchSlideStyle(i, { backgroundId: undefined })}
              >
                Use post default
              </button>
            ) : (
              <span className="ps-note">Post default</span>
            )
          }
        >
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
                    backgroundId: slideStyle?.backgroundId === b.id ? undefined : b.id,
                  })
                }
              />
            ))}
          </div>
        </PanelSection>
      </>
    );
  };

  // ---- Export tab ----------------------------------------------------------
  const renderExport = () => (
    <>
      <PanelSection id="export-format" title="Format">
        <Segmented
          options={(["1:1", "4:5", "9:16"] as AspectRatio[]).map((r) => ({ value: r, label: r }))}
          value={exportRatio}
          onChange={onSetExportRatio}
        />
      </PanelSection>

      <PanelSection id="export-actions" title="Download">
        <button className="export-btn-primary" onClick={handleExportAll}>
          ↓ ZIP: all slides + caption
        </button>
        <button className="export-btn-secondary" onClick={handleExportCurrent}>
          ↓ PNG: slide {currentSlide + 1} only
        </button>
        <button className="export-btn-secondary" onClick={handleExportReel}>
          Copy reel render command
        </button>
        <div className="export-progress" ref={progressRef} />
        <div className="panel-divider" />
        <button className="export-btn-secondary" onClick={onOpenBulkExport}>
          ↓ Export all posts…
        </button>
      </PanelSection>

      <PanelSection
        id="export-caption"
        title="Caption"
        aside={
          <button type="button" className="ps-link" onClick={copyCaption}>
            {copied ? "Copied ✓" : "Copy"}
          </button>
        }
      >
        <div className="caption-preview" style={{ whiteSpace: "pre-wrap" }}>
          {captionText}
        </div>
      </PanelSection>
    </>
  );

  return (
    <div className="sidebar-right cp-panel">
      <div className="cp-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={tab === t.value}
            className={`cp-tab${tab === t.value ? " active" : ""}`}
            onClick={() => setTab(t.value)}
          >
            {t.label}
            {t.value === "slide" && (
              <span className="cp-tab-badge">
                {currentSlide + 1}/{post.slides.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="cp-body">
        {tab === "style" && renderStyle()}
        {tab === "slide" && renderSlide()}
        {tab === "export" && renderExport()}
      </div>

      {libraryFor !== null && (
        <LibraryPicker
          title={`Image for slide ${libraryFor + 1}`}
          onPick={(asset) => handleLibraryPick(libraryFor, asset)}
          onClose={() => setLibraryFor(null)}
        />
      )}
    </div>
  );
};
