import React from "react";
import type { Post, SlideMockup, SlideTextTransform } from "../data/posts";
import type { ThemeName } from "../data/themes";
import type { AspectRatio } from "../hooks/useCarouselState";
import type { PostStyleEntry } from "../data/design/types";
import { resolveDesign } from "../data/design/resolve";
import { Card } from "./Card";

interface PreviewProps {
  post: Post;
  currentSlide: number;
  theme: ThemeName;
  sidebarCollapsed: boolean;
  onPrev: () => void;
  onNext: () => void;
  onGoSlide: (i: number) => void;
  onToggleSidebar: () => void;
  selectedPostIndex: number;
  exportRatio: AspectRatio;
  logoScale: number;
  postStyle?: PostStyleEntry;
  safeArea?: boolean;
  onPatchMockup: (slideIdx: number, patch: Partial<SlideMockup>) => void;
  onPatchTextTransform: (slideIdx: number, patch: Partial<SlideTextTransform>) => void;
}

/** IG UI overlap guides per ratio, as percentages of the card box. */
function safeAreaInsets(ratio: AspectRatio) {
  switch (ratio) {
    case "9:16":
      return { top: 14, bottom: 20, side: 10 };
    case "1:1":
      return { top: 6, bottom: 8, side: 5 };
    case "4:5":
    default:
      return { top: 8, bottom: 10, side: 6 };
  }
}

export const Preview: React.FC<PreviewProps> = ({
  post,
  currentSlide,
  theme,
  sidebarCollapsed,
  onPrev,
  onNext,
  onGoSlide,
  onToggleSidebar,
  selectedPostIndex,
  exportRatio,
  logoScale,
  postStyle,
  safeArea = false,
  onPatchMockup,
  onPatchTextTransform,
}) => {
  const slides = post.slides;
  const design = resolveDesign(theme, postStyle, currentSlide);
  const insets = safeAreaInsets(exportRatio);

  return (
    <div className="center">
      <div className="topbar">
        <div className="topbar-left">
          <button className="btn-toggle" onClick={onToggleSidebar}>
            {sidebarCollapsed ? "☰" : "✕"}
          </button>
          <div className="post-title-bar">
            Post {selectedPostIndex + 1} — "{post.title}"
          </div>
        </div>
        <div className="tags">
          {post.tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="slide-nav">
        <button
          className="nav-btn"
          onClick={onPrev}
          disabled={currentSlide === 0}
        >
          ‹
        </button>
        <span className="slide-counter">
          {currentSlide + 1} / {slides.length}
        </span>
        <button
          className="nav-btn"
          onClick={onNext}
          disabled={currentSlide === slides.length - 1}
        >
          ›
        </button>
      </div>

      <div className="card-area">
        <div style={{ width: "100%", maxWidth: 400, position: "relative" }}>
          <Card
            post={post}
            slideIndex={currentSlide}
            theme={theme}
            className="card-export-target"
            aspectRatio={exportRatio}
            logoScale={logoScale}
            design={design}
            onMockupTransformChange={onPatchMockup}
            onTextTransformChange={onPatchTextTransform}
          />
          {safeArea && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                zIndex: 10,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: `${insets.top}%`,
                  bottom: `${insets.bottom}%`,
                  left: `${insets.side}%`,
                  right: `${insets.side}%`,
                  border: "1px dashed rgba(112,91,207,0.7)",
                  borderRadius: 8,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 4,
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "rgba(112,91,207,0.9)",
                  background: "rgba(10,10,18,0.7)",
                  padding: "2px 8px",
                  borderRadius: 999,
                }}
              >
                IG SAFE AREA
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="preview-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`preview-dot${i === currentSlide ? " preview-dot--active" : " preview-dot--inactive"}`}
            onClick={() => onGoSlide(i)}
          />
        ))}
      </div>
    </div>
  );
};
