import React from "react";
import type { HighlightStyle } from "../data/design/types";

interface BoldTextProps {
  text: string;
  hlColor?: string;
  highlight?: HighlightStyle;
  accentLight?: string;
}

function withAlpha(hex: string, alpha: number): string {
  const raw = hex.replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function highlightStyleFor(
  style: HighlightStyle,
  hlColor: string | undefined,
  accentLight: string | undefined
): React.CSSProperties {
  const base = hlColor ?? "#705bcf";
  switch (style) {
    case "marker": {
      const marker = withAlpha(base, 0.35);
      return {
        fontWeight: 700,
        background: `linear-gradient(transparent 45%, ${marker} 45%, ${marker} 92%, transparent 92%)`,
        padding: "0 0.12em",
        WebkitBoxDecorationBreak: "clone",
        boxDecorationBreak: "clone",
      };
    }
    case "gradient":
      return {
        fontWeight: 700,
        backgroundImage: `linear-gradient(100deg, ${base}, ${accentLight ?? "#8b7ad8"})`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
      };
    case "underline":
      return {
        fontWeight: 700,
        backgroundImage: `linear-gradient(${base}, ${base})`,
        backgroundSize: "100% 0.09em",
        backgroundPosition: "0 96%",
        backgroundRepeat: "no-repeat",
        paddingBottom: "0.05em",
      };
    case "color":
    default:
      return { color: hlColor, fontWeight: 700 };
  }
}

export const BoldText: React.FC<BoldTextProps> = ({
  text,
  hlColor,
  highlight = "color",
  accentLight,
}) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  const style = highlightStyleFor(highlight, hlColor, accentLight);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <span key={i} style={style}>
              {part.slice(2, -2)}
            </span>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
};
