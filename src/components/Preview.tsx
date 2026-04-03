import React from "react";
import type { Post } from "../data/posts";
import type { ThemeName } from "../data/themes";
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
}) => {
  const slides = post.slides;

  return (
    <div className="center">
      <div className="topbar">
        <div className="topbar-left">
          <button className="btn-toggle" onClick={onToggleSidebar}>
            {sidebarCollapsed ? "\u2630" : "\u2715"}
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
        <div style={{ width: "100%", maxWidth: 400 }}>
          <Card
            post={post}
            slideIndex={currentSlide}
            theme={theme}
            className="card-export-target"
          />
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
