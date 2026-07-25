import React from "react";
import type { Slide } from "../../data/posts";
import type { CardDesign } from "../../data/design/resolve";
import { parseComparison, parseList, parseStat } from "../../data/design/variants";
import { BoldText } from "../BoldText";

interface CardVariantBodyProps {
  slide: Slide;
  design: CardDesign;
  s: number;
  headlineBaseSize: number;
  headlineOpacity: number;
  headlineTranslateY: number;
  subOpacity: number;
  subTranslateY: number;
}

/**
 * Variant layouts for the plain (no-mockup, non-CTA) card body.
 * Returns null when the variant's parser can't shape the content —
 * the caller falls back to the default headline/sub body.
 */
export const CardVariantBody: React.FC<CardVariantBodyProps> = ({
  slide,
  design: d,
  s,
  headlineBaseSize,
  headlineOpacity,
  headlineTranslateY,
  subOpacity,
  subTranslateY,
}) => {
  const headlineAnim: React.CSSProperties = {
    opacity: headlineOpacity,
    transform: `translateY(${headlineTranslateY}px)`,
  };
  const subAnim: React.CSSProperties = {
    opacity: subOpacity * 0.75,
    transform: `translateY(${subTranslateY}px)`,
  };

  const subText = (
    <div
      style={{
        fontSize: 14 * s,
        lineHeight: 1.5,
        fontFamily: "'DM Sans', sans-serif",
        ...subAnim,
      }}
    >
      {slide.sub}
    </div>
  );

  const headlineText = (overrides?: React.CSSProperties) => (
    <div
      style={{
        fontSize: headlineBaseSize * s,
        fontWeight: 800,
        lineHeight: 1.15,
        marginBottom: 16 * s,
        fontFamily: "'Space Grotesk', sans-serif",
        color: d.headlineColor,
        ...headlineAnim,
        ...overrides,
      }}
    >
      <BoldText
        text={slide.headline}
        hlColor={d.hlColor}
        highlight={d.highlightStyle}
        accentLight={d.accentLight}
      />
    </div>
  );

  if (d.variant === "stat") {
    const stat = parseStat(slide.headline);
    if (!stat) return null;
    const figureSize = stat.figure.length <= 3 ? 88 : stat.figure.length <= 6 ? 72 : 54;
    const gradientFigure = d.highlightStyle === "gradient";
    return (
      <>
        <div
          style={{
            fontSize: figureSize * s,
            fontWeight: 800,
            lineHeight: 1,
            fontFamily: "'Space Grotesk', sans-serif",
            marginBottom: 10 * s,
            letterSpacing: "-0.02em",
            ...(gradientFigure
              ? {
                  backgroundImage: `linear-gradient(100deg, ${d.hlColor}, ${d.accentLight})`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                }
              : { color: d.hlColor }),
            ...headlineAnim,
          }}
        >
          {stat.figure}
        </div>
        <div
          style={{
            fontSize: 24 * s,
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: 16 * s,
            fontFamily: "'Space Grotesk', sans-serif",
            color: d.headlineColor,
            ...headlineAnim,
          }}
        >
          {stat.rest}
        </div>
        {subText}
      </>
    );
  }

  if (d.variant === "quote") {
    return (
      <>
        <div
          style={{
            fontSize: 90 * s,
            lineHeight: 0.6,
            height: 44 * s,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800,
            color: d.hlColor,
            opacity: 0.25 * headlineOpacity,
            userSelect: "none",
          }}
        >
          "
        </div>
        {headlineText({ fontStyle: "italic" })}
        {subText}
      </>
    );
  }

  if (d.variant === "list") {
    const items = parseList(slide.sub);
    if (!items) return null;
    return (
      <>
        {headlineText()}
        <div
          style={{
            borderLeft: `${3 * s}px solid ${d.hlColor}`,
            paddingLeft: 14 * s,
            ...subAnim,
            opacity: subOpacity,
          }}
        >
          {items.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 10 * s,
                padding: `${8 * s}px 0`,
                borderBottom:
                  idx < items.length - 1
                    ? `1px solid ${d.mode === "light" ? "rgba(90,69,176,0.15)" : "rgba(112,91,207,0.18)"}`
                    : "none",
              }}
            >
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11 * s,
                  fontWeight: 700,
                  color: d.hlColor,
                  flexShrink: 0,
                }}
              >
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span
                style={{
                  fontSize: 13.5 * s,
                  lineHeight: 1.45,
                  fontFamily: "'DM Sans', sans-serif",
                  color: d.textColor,
                }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (d.variant === "comparison") {
    const parts = parseComparison(slide.sub);
    if (!parts) return null;
    const panelBase: React.CSSProperties = {
      borderRadius: 10 * s,
      padding: `${12 * s}px ${12 * s}px`,
      display: "flex",
      flexDirection: "column",
      gap: 6 * s,
    };
    const labelBase: React.CSSProperties = {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 9.5 * s,
      fontWeight: 700,
      letterSpacing: "0.14em",
    };
    return (
      <>
        {headlineText()}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12 * s,
            ...subAnim,
            opacity: subOpacity,
          }}
        >
          <div
            style={{
              ...panelBase,
              background:
                d.mode === "light" ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)",
              border: "1px solid rgba(217,141,141,0.35)",
            }}
          >
            <span style={{ ...labelBase, color: "#d98d8d" }}>✗ MYTH</span>
            <span
              style={{
                fontSize: 13 * s,
                lineHeight: 1.45,
                fontFamily: "'DM Sans', sans-serif",
                color: d.textColor,
                opacity: 0.7,
              }}
            >
              {parts.myth}
            </span>
          </div>
          <div
            style={{
              ...panelBase,
              background:
                d.mode === "light" ? "rgba(90,69,176,0.07)" : "rgba(112,91,207,0.1)",
              border: `1px solid ${d.mode === "light" ? "rgba(90,69,176,0.35)" : "rgba(112,91,207,0.4)"}`,
            }}
          >
            <span style={{ ...labelBase, color: d.hlColor }}>✓ TRUTH</span>
            <span
              style={{
                fontSize: 13 * s,
                lineHeight: 1.45,
                fontFamily: "'DM Sans', sans-serif",
                color: d.textColor,
              }}
            >
              {parts.truth}
            </span>
          </div>
        </div>
      </>
    );
  }

  return null;
};
