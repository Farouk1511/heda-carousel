import React, { useRef, useState } from "react";
import type { MockupLayout, Post, SlideMockup, SlideTextTransform } from "../data/posts";
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

const SIDE_LAYOUTS: MockupLayout[] = ["text-left", "text-right"];

function clampScale(value: number) {
  return Math.min(2.5, Math.max(0.5, value));
}

function clampTextScale(value: number) {
  return Math.min(1.8, Math.max(0.6, value));
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
  logoScale?: number;
  onMockupTransformChange?: (slideIdx: number, patch: Partial<SlideMockup>) => void;
  onTextTransformChange?: (slideIdx: number, patch: Partial<SlideTextTransform>) => void;
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
  logoScale = 1,
  onMockupTransformChange,
  onTextTransformChange,
}) => {
  const slide = post.slides[slideIndex];
  const total = post.slides.length;
  const isCTA = !!slide.cta;
  const mockup = slide.mockup;
  const s = width ? width / 400 : 1;
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);
  const textDragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [textDragging, setTextDragging] = useState(false);
  const textTransform = slide.textTransform ?? { offsetX: 0, offsetY: 0, scale: 1 };

  const cleanHeadline = slide.headline.replace(/\*\*/g, "");
  const headlineLength = cleanHeadline.length;

  let headlineBaseSize = isCTA ? 32 : 28;
  if (mockup && SIDE_LAYOUTS.includes(mockup.layout)) headlineBaseSize = 22;
  if (headlineLength > 140) headlineBaseSize = isCTA ? 24 : mockup ? 18 : 20;
  else if (headlineLength > 110) headlineBaseSize = isCTA ? 26 : mockup ? 19 : 22;
  else if (headlineLength > 80) headlineBaseSize = isCTA ? 28 : mockup ? 20 : 24;
  else if (headlineLength > 60) headlineBaseSize = isCTA ? 30 : mockup ? 21 : 26;

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
  const canDragMockup = Boolean(mockup && onMockupTransformChange && !width);
  const canDragText = Boolean(mockup && onTextTransformChange && !width);

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

  const chrome = (
    <>
      <img
        src={logoSrc}
        alt="Heda"
        style={{
          position: "absolute",
          top: 16 * s,
          right: 16 * s,
          width: 32 * s * logoScale,
          height: 32 * s * logoScale,
          objectFit: "contain",
          pointerEvents: "none",
          zIndex: 3,
          opacity: 0.9,
        }}
      />

      {!isCTA && !mockup && <div style={orbStyle} />}

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
    </>
  );

  const footer = (
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
          SWIPE -&gt;
        </div>
      )}
    </div>
  );

  const dots = (
    <CardDots
      total={total}
      active={slideIndex}
      isCTA={isCTA}
      scale={s}
      activeProgress={dotAnimationProgress}
    />
  );

  const headlineText = (
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
  );

  const subText = (
    <div
      style={{
        fontSize: (mockup ? 13 : 14) * s,
        lineHeight: mockup ? 1.42 : 1.5,
        opacity: subOpacity * 0.75,
        fontFamily: "'DM Sans', sans-serif",
        transform: `translateY(${subTranslateY}px)`,
      }}
    >
      {slide.sub}
    </div>
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLImageElement>) => {
    if (!mockup || !canDragMockup) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: mockup.offsetX,
      offsetY: mockup.offsetY,
    };
    setDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLImageElement>) => {
    if (!mockup || !dragRef.current || dragRef.current.pointerId !== event.pointerId) return;
    const nextOffsetX = dragRef.current.offsetX + (event.clientX - dragRef.current.startX) / s;
    const nextOffsetY = dragRef.current.offsetY + (event.clientY - dragRef.current.startY) / s;
    onMockupTransformChange?.(slideIndex, {
      offsetX: Number(nextOffsetX.toFixed(2)),
      offsetY: Number(nextOffsetY.toFixed(2)),
    });
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLImageElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
      setDragging(false);
    }
  };

  const handleTextPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!canDragText) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    textDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: textTransform.offsetX,
      offsetY: textTransform.offsetY,
    };
    setTextDragging(true);
  };

  const handleTextPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!textDragRef.current || textDragRef.current.pointerId !== event.pointerId) return;
    const nextOffsetX = textDragRef.current.offsetX + (event.clientX - textDragRef.current.startX) / s;
    const nextOffsetY = textDragRef.current.offsetY + (event.clientY - textDragRef.current.startY) / s;
    onTextTransformChange?.(slideIndex, {
      offsetX: Number(nextOffsetX.toFixed(2)),
      offsetY: Number(nextOffsetY.toFixed(2)),
    });
  };

  const handleTextPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (textDragRef.current?.pointerId === event.pointerId) {
      textDragRef.current = null;
      setTextDragging(false);
    }
  };

  if (mockup?.layout === "free") {
    return (
      <div style={cardStyle} className={className}>
        {chrome}
        <img
          src={mockup.src}
          alt={mockup.name ? `${mockup.name} mockup` : "Uploaded mockup"}
          draggable={false}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "68%",
            height: "68%",
            objectFit: mockup.fit,
            transform: `translate(-50%, -50%) translate(${mockup.offsetX * s}px, ${mockup.offsetY * s}px) scale(${clampScale(mockup.scale)})`,
            transformOrigin: "center",
            cursor: canDragMockup ? (dragging ? "grabbing" : "grab") : "default",
            touchAction: "none",
            userSelect: "none",
            zIndex: 1,
            filter:
              theme === "deep"
                ? "drop-shadow(0 18px 32px rgba(0,0,0,0.35))"
                : "drop-shadow(0 16px 26px rgba(0,0,0,0.24))",
          }}
        />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <div
            onPointerDown={handleTextPointerDown}
            onPointerMove={handleTextPointerMove}
            onPointerUp={handleTextPointerEnd}
            onPointerCancel={handleTextPointerEnd}
            style={{
              cursor: canDragText ? (textDragging ? "grabbing" : "grab") : "default",
              pointerEvents: "auto",
              touchAction: "none",
              transform: `translate(${textTransform.offsetX * s}px, ${textTransform.offsetY * s}px) scale(${clampTextScale(textTransform.scale)})`,
              transformOrigin: "center",
            }}
          >
            {headlineText}
            {subText}
          </div>
        </div>

        {footer}
        {dots}
      </div>
    );
  }

  if (mockup) {
    const isSideLayout = SIDE_LAYOUTS.includes(mockup.layout);
    const isImageFirst = mockup.layout === "text-bottom" || mockup.layout === "text-right";
    const imageElement = (
      <div
        style={{
          flex: isSideLayout ? "1 1 48%" : "1 1 auto",
          minWidth: 0,
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "visible",
          position: "relative",
        }}
      >
        <img
          src={mockup.src}
          alt={mockup.name ? `${mockup.name} mockup` : "Uploaded mockup"}
          draggable={false}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            width: "100%",
            height: "100%",
            objectFit: mockup.fit,
            transform: `translate(${mockup.offsetX * s}px, ${mockup.offsetY * s}px) scale(${clampScale(mockup.scale)})`,
            transformOrigin: "center",
            cursor: canDragMockup ? (dragging ? "grabbing" : "grab") : "default",
            touchAction: "none",
            userSelect: "none",
            filter:
              theme === "deep"
                ? "drop-shadow(0 18px 32px rgba(0,0,0,0.35))"
                : "drop-shadow(0 16px 26px rgba(0,0,0,0.24))",
          }}
        />
      </div>
    );
    const textElement = (
      <div
        onPointerDown={handleTextPointerDown}
        onPointerMove={handleTextPointerMove}
        onPointerUp={handleTextPointerEnd}
        onPointerCancel={handleTextPointerEnd}
        style={{
          flex: isSideLayout ? "1 1 52%" : "0 0 auto",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          textAlign: isSideLayout ? "left" : "center",
          cursor: canDragText ? (textDragging ? "grabbing" : "grab") : "default",
          touchAction: "none",
          transform: `translate(${textTransform.offsetX * s}px, ${textTransform.offsetY * s}px) scale(${clampTextScale(textTransform.scale)})`,
          transformOrigin: isSideLayout ? "left center" : "center",
        }}
      >
        {headlineText}
        {subText}
      </div>
    );

    return (
      <div style={cardStyle} className={className}>
        {chrome}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: isSideLayout ? "row" : "column",
            gap: 22 * s,
            alignItems: "stretch",
            justifyContent: "center",
            paddingTop: 10 * s,
            paddingBottom: 8 * s,
            minHeight: 0,
          }}
        >
          {isImageFirst ? imageElement : textElement}
          {isImageFirst ? textElement : imageElement}
        </div>
        {footer}
        {dots}
      </div>
    );
  }

  return (
    <div style={cardStyle} className={className}>
      {chrome}

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {headlineText}
        {subText}
      </div>

      {footer}
      {dots}
    </div>
  );
};
