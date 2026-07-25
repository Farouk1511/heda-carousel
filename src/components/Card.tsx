import React, { useRef, useState } from "react";
import type { MockupLayout, Post, SlideMockup, SlideTextTransform } from "../data/posts";
import type { ThemeName } from "../data/themes";
import type { AspectRatio } from "../hooks/useCarouselState";
import { legacyDesign, type CardDesign } from "../data/design/resolve";
import { BoldText } from "./BoldText";
import { CardDots } from "./CardDots";
import { CardBackground } from "./card/CardBackground";
import { CoverSeriesChip, CoverWatermark } from "./card/CardCover";
import { CardVariantBody } from "./card/CardVariantBody";
import { DeviceFrame } from "./card/DeviceFrame";

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
  /** Resolved design tokens; omitted -> legacy visuals for the given theme */
  design?: CardDesign;
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
  design,
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

  const d = design ?? legacyDesign(theme);
  const isCover = slideIndex === 0 && !isCTA && !mockup && d.cover.treatment;

  let headlineBaseSize = isCTA ? 32 : 28;
  if (mockup && SIDE_LAYOUTS.includes(mockup.layout)) headlineBaseSize = 22;
  if (headlineLength > 140) headlineBaseSize = isCTA ? 24 : mockup ? 18 : 20;
  else if (headlineLength > 110) headlineBaseSize = isCTA ? 26 : mockup ? 19 : 22;
  else if (headlineLength > 80) headlineBaseSize = isCTA ? 28 : mockup ? 20 : 24;
  else if (headlineLength > 60) headlineBaseSize = isCTA ? 30 : mockup ? 21 : 26;
  if (isCover) {
    // cover slides get the display type scale
    if (headlineLength > 140) headlineBaseSize = 26;
    else if (headlineLength > 110) headlineBaseSize = 28;
    else if (headlineLength > 80) headlineBaseSize = 30;
    else if (headlineLength > 60) headlineBaseSize = 32;
    else headlineBaseSize = 34;
  }

  const headlineOpacity = Math.min(Math.max(animationProgress / 0.35, 0), 1);
  const headlineTranslateY = (1 - headlineOpacity) * 20 * s;
  const subOpacity = Math.min(Math.max((animationProgress - 0.1) / 0.35, 0), 1);
  const subTranslateY = (1 - subOpacity) * 14 * s;

  const border = isCTA ? d.borderCTA : d.border;
  const hlColor = isCTA ? undefined : d.hlColor;
  const headlineColor = isCTA ? d.ctaHeadlineColor : d.headlineColor;
  const textColor = isCTA ? d.ctaTextColor : d.textColor;
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
    border,
    color: textColor,
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box",
  };

  const chrome = (
    <>
      <CardBackground
        design={d}
        isCTA={isCTA}
        s={s}
        showOrb={!isCTA && !mockup}
        boostOrb={isCover}
      />
      {d.logoChip ? (
        <div
          style={{
            position: "absolute",
            top: 12 * s,
            right: 12 * s,
            zIndex: 3,
            background: "#14121c",
            borderRadius: 10 * s,
            padding: 5 * s,
            display: "flex",
            pointerEvents: "none",
          }}
        >
          <img
            src={logoSrc}
            alt="Heda"
            style={{
              width: 26 * s * logoScale,
              height: 26 * s * logoScale,
              objectFit: "contain",
              display: "block",
              opacity: 0.95,
            }}
          />
        </div>
      ) : (
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
      )}

      <div style={{ position: "relative", zIndex: 1 }}>
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
        position: "relative",
        zIndex: 1,
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
      {isCTA &&
        slide.cta &&
        (d.chrome.ctaButton ? (
          <div
            style={{
              display: "inline-block",
              background: "#fff",
              color: "#5a45b0",
              fontSize: 14 * s,
              fontWeight: 800,
              padding: `${10 * s}px ${22 * s}px`,
              borderRadius: 999,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {slide.cta}
          </div>
        ) : (
          <div
            style={{
              fontSize: 14 * s,
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {slide.cta}
          </div>
        ))}
      {!isCTA &&
        slideIndex < total - 1 &&
        (d.chrome.swipePill ? (
          <div
            style={{
              marginLeft: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: 5 * s,
              padding: `${5 * s}px ${12 * s}px`,
              borderRadius: 999,
              background: d.chip.bg,
              border: d.chip.border,
              color: d.chip.text,
              fontSize: 10 * s,
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.1em",
            }}
          >
            SWIPE →
          </div>
        ) : (
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
        ))}
    </div>
  );

  const profileRow =
    isCTA && d.chrome.profileRow ? (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10 * s,
          marginBottom: 14 * s,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 30 * s,
            height: 30 * s,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <img
            src={logoSrc}
            alt="Heda"
            style={{ width: 20 * s, height: 20 * s, objectFit: "contain" }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12.5 * s,
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            @joinheda
          </div>
          <div style={{ fontSize: 10 * s, opacity: 0.7 }}>Find your people</div>
        </div>
        <div
          style={{
            padding: `${5 * s}px ${14 * s}px`,
            borderRadius: 999,
            border: "1.5px solid rgba(255,255,255,0.7)",
            fontSize: 11 * s,
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Follow
        </div>
      </div>
    ) : null;

  const pagination = d.chrome.progressBar ? (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 3.5 * s,
        background: isCTA
          ? "rgba(255,255,255,0.2)"
          : d.mode === "light"
            ? "rgba(90,69,176,0.15)"
            : "rgba(112,91,207,0.18)",
        zIndex: 2,
      }}
    >
      <div
        style={{
          width: `${((slideIndex + 1) / total) * 100}%`,
          height: "100%",
          background: isCTA ? "#fff" : d.dots.active,
        }}
      />
    </div>
  ) : (
    <CardDots
      total={total}
      active={slideIndex}
      isCTA={isCTA}
      scale={s}
      activeProgress={dotAnimationProgress}
      colors={d.dots}
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
        <BoldText
          text={slide.headline}
          hlColor={hlColor}
          highlight={d.highlightStyle}
          accentLight={d.accentLight}
        />
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

  // Variant layouts only apply to the plain body; parser failure falls back to default.
  const variantContent =
    !isCTA && !mockup && d.variant !== "default"
      ? CardVariantBody({
          slide,
          design: d,
          s,
          headlineBaseSize,
          headlineOpacity,
          headlineTranslateY,
          subOpacity,
          subTranslateY,
        })
      : null;

  const frameTilt = d.mockupFrame?.tilt
    ? " perspective(900px) rotateY(-6deg) rotateZ(-2deg)"
    : "";

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
        {d.mockupFrame ? (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: d.mockupFrame.kind === "phone" ? "54%" : "76%",
              transform: `translate(-50%, -50%) translate(${mockup.offsetX * s}px, ${mockup.offsetY * s}px) scale(${clampScale(mockup.scale)})${frameTilt}`,
              transformOrigin: "center",
              zIndex: 1,
            }}
          >
            <DeviceFrame frame={d.mockupFrame} s={s} design={d}>
              <img
                src={mockup.src}
                alt={mockup.name ? `${mockup.name} mockup` : "Uploaded mockup"}
                draggable={false}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerEnd}
                onPointerCancel={handlePointerEnd}
                style={{
                  width: "100%",
                  display: "block",
                  cursor: canDragMockup ? (dragging ? "grabbing" : "grab") : "default",
                  touchAction: "none",
                  userSelect: "none",
                }}
              />
            </DeviceFrame>
          </div>
        ) : (
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
              filter: d.mockupShadow,
            }}
          />
        )}

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
        {pagination}
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
        {d.mockupFrame ? (
          <div
            style={{
              width: d.mockupFrame.kind === "phone" ? "62%" : "92%",
              transform: `translate(${mockup.offsetX * s}px, ${mockup.offsetY * s}px) scale(${clampScale(mockup.scale)})${frameTilt}`,
              transformOrigin: "center",
            }}
          >
            <DeviceFrame frame={d.mockupFrame} s={s} design={d}>
              <img
                src={mockup.src}
                alt={mockup.name ? `${mockup.name} mockup` : "Uploaded mockup"}
                draggable={false}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerEnd}
                onPointerCancel={handlePointerEnd}
                style={{
                  width: "100%",
                  display: "block",
                  cursor: canDragMockup ? (dragging ? "grabbing" : "grab") : "default",
                  touchAction: "none",
                  userSelect: "none",
                }}
              />
            </DeviceFrame>
          </div>
        ) : (
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
              filter: d.mockupShadow,
            }}
          />
        )}
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
            position: "relative",
            zIndex: 1,
          }}
        >
          {isImageFirst ? imageElement : textElement}
          {isImageFirst ? textElement : imageElement}
        </div>
        {footer}
        {pagination}
      </div>
    );
  }

  return (
    <div style={cardStyle} className={className}>
      {chrome}

      {isCover && d.cover.watermark && (
        <CoverWatermark post={post} design={d} s={s} />
      )}

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {isCover && d.cover.chip && <CoverSeriesChip post={post} design={d} s={s} />}
        {variantContent ?? (
          <>
            {headlineText}
            {subText}
          </>
        )}
      </div>

      {profileRow}
      {footer}
      {pagination}
    </div>
  );
};
