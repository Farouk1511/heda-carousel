import React from "react";
import type { Post } from "../data/posts";
import type { ThemeName } from "../data/themes";
import type { AspectRatio } from "../hooks/useCarouselState";
import { BoldText } from "./BoldText";
import { CardDots } from "./CardDots";

function getAspectRatioCSS(ratio: AspectRatio): string {
  switch (ratio) {
    case "1:1":
      return "1 / 1";
    case "9:16":
      return "9 / 16";
    case "4:5":
    default:
      return "4 / 5";
  }
}

interface CardProps {
  post: Post;
  slideIndex: number;
  theme: ThemeName;
  width?: number;
  height?: number;
  className?: string;
  logoSrc?: string;
  animationProgress?: number;
  dotAnimationProgress?: number;
  aspectRatio?: AspectRatio;
}

export const Card: React.FC<CardProps> = ({
  post,
  slideIndex,
  theme,
  width,
  height,
  className,
  logoSrc = "/LOGO.png",
  animationProgress = 1,
  dotAnimationProgress = 1,
  aspectRatio = "4:5",
}) => {
  const slide = post.slides[slideIndex];
  const total = post.slides.length;
  const isCTA = !!slide.cta;
  const s = width ? width / 400 : 1; // scale factor relative to 400px preview

  const cleanHeadline = slide.headline.replace(/\*\*/g, "");
  const headlineLength = cleanHeadline.length;

  let headlineBaseSize = isCTA ? 32 : 28;
  if (headlineLength > 140) headlineBaseSize = isCTA ? 24 : 20;
  else if (headlineLength > 110) headlineBaseSize = isCTA ? 26 : 22;
  else if (headlineLength > 80) headlineBaseSize = isCTA ? 28 : 24;
  else if (headlineLength > 60) headlineBaseSize = isCTA ? 30 : 26;

  const headlineOpacity = Math.min(Math.max(animationProgress / 0.35, 0), 1);
  const headlineTranslateY = (1 - headlineOpacity) * 20 * s;
  const subOpacity = Math.min(Math.max((animationProgress - 0.1) / 0.35, 0), 1);
  const subTranslateY = (1 - subOpacity) * 14 * s;

  const bgCard =
    theme === "deep"
      ? "#1a1a2e"
      : "linear-gradient(145deg, #13111a 0%, #1c1826 100%)";
  const bgCTA =
    theme === "deep"
      ? "#705bcf"
      : "linear-gradient(135deg, #705bcf 0%, #5a45b0 100%)";
  const border = isCTA
    ? "none"
    : theme === "deep"
      ? "1px solid rgba(112,91,207,0.2)"
      : "1px solid rgba(112,91,207,0.15)";

  const hlColor = isCTA ? undefined : "#705bcf";
  const headlineColor = isCTA ? "#fff" : "#f0eef5";
  const textColor = isCTA ? "#fff" : "#e8e6f0";

  const cardStyle: React.CSSProperties = {
    width: width ?? "100%",
    maxWidth: width ? undefined : 400,
    height: height ?? undefined,
    aspectRatio: width ? undefined : getAspectRatioCSS(aspectRatio),
    borderRadius: width ? 0 : 16,
    padding: `${32 * s}px ${28 * s}px`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
    background: isCTA ? bgCTA : bgCard,
    border,
    color: textColor,
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box",
  };

  const orbStyle: React.CSSProperties = {
    position: "absolute",
    top: -40 * s,
    right: -40 * s,
    width: 120 * s,
    height: 120 * s,
    borderRadius: "50%",
    pointerEvents: "none",
    background:
      theme === "deep"
        ? "radial-gradient(circle, rgba(112,91,207,0.3) 0%, transparent 70%)"
        : "radial-gradient(circle, rgba(112,91,207,0.12) 0%, transparent 70%)",
  };

  return (
    <div style={cardStyle} className={className}>
      {/* Logo */}
      <img
        src={logoSrc}
        alt="Heda"
        style={{
          position: "absolute",
          top: 16 * s,
          right: 16 * s,
          width: 32 * s,
          height: 32 * s,
          objectFit: "contain",
          pointerEvents: "none",
          zIndex: 2,
          opacity: 0.9,
        }}
      />

      {/* Decorative orb (non-CTA only) */}
      {!isCTA && <div style={orbStyle} />}

      {/* Header counter */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8 * s,
            fontSize: 11 * s,
            letterSpacing: "0.08em",
            opacity: 0.6,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <span>
            {String(slideIndex + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: headlineBaseSize * s,
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: 16 * s,
            fontFamily: "'Space Grotesk', sans-serif",
            color: headlineColor,
            opacity: headlineOpacity,
            transform: `translateY(${headlineTranslateY}px)`,
          }}
        >
          {isCTA ? (
            slide.headline.replace(/\*\*/g, "")
          ) : (
            <BoldText text={slide.headline} hlColor={hlColor} />
          )}
        </div>
        <div
          style={{
            fontSize: 14 * s,
            lineHeight: 1.5,
            opacity: subOpacity * 0.75,
            fontFamily: "'DM Sans', sans-serif",
            transform: `translateY(${subTranslateY}px)`,
          }}
        >
          {slide.sub}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 16 * s,
        }}
      >
        {slideIndex === 0 && (
          <div
            style={{
              fontSize: 12 * s,
              fontWeight: 600,
              letterSpacing: "0.05em",
              fontFamily: "'JetBrains Mono', monospace",
              opacity: 0.5,
            }}
          >
            @joinheda
          </div>
        )}
        {isCTA && slide.cta && (
          <div
            style={{
              fontSize: 14 * s,
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {slide.cta}
          </div>
        )}
        {!isCTA && slideIndex < total - 1 && (
          <div
            style={{
              marginLeft: "auto",
              fontSize: 11 * s,
              opacity: 0.4,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.1em",
            }}
          >
            SWIPE →
          </div>
        )}
      </div>

      {/* Dots */}
      <CardDots
        total={total}
        active={slideIndex}
        isCTA={isCTA}
        scale={s}
        activeProgress={dotAnimationProgress}
      />
    </div>
  );
};
