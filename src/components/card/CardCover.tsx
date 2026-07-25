import React from "react";
import type { Post } from "../../data/posts";
import type { CardDesign } from "../../data/design/resolve";

interface CoverSeriesChipProps {
  post: Post;
  design: CardDesign;
  s: number;
}

/**
 * "DAY 03" pill shown above the cover headline. Off by default — week
 * numbering and week titles are internal calendar naming, not for followers.
 */
export const CoverSeriesChip: React.FC<CoverSeriesChipProps> = ({
  post,
  design: d,
  s,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignSelf: "flex-start",
      alignItems: "center",
      gap: 6 * s,
      marginBottom: 14 * s,
      padding: `${5 * s}px ${12 * s}px`,
      borderRadius: 999,
      background: d.chip.bg,
      border: d.chip.border,
      color: d.chip.text,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 9.5 * s,
      fontWeight: 700,
      letterSpacing: "0.12em",
      whiteSpace: "nowrap",
      maxWidth: "100%",
      overflow: "hidden",
    }}
  >
    <span>DAY {String(post.day).padStart(2, "0")}</span>
  </div>
);

interface CoverWatermarkProps {
  post: Post;
  design: CardDesign;
  s: number;
}

/** Giant outlined day number behind the cover content, bottom-right. */
export const CoverWatermark: React.FC<CoverWatermarkProps> = ({
  post,
  design: d,
  s,
}) => (
  <div
    style={{
      position: "absolute",
      right: -14 * s,
      bottom: 4 * s,
      zIndex: 0,
      pointerEvents: "none",
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 800,
      fontSize: 190 * s,
      lineHeight: 0.85,
      letterSpacing: "-0.04em",
      opacity: 0.14,
      WebkitTextStroke: `${1.5 * s}px ${d.hlColor}`,
      WebkitTextFillColor: "transparent",
      color: "transparent",
      userSelect: "none",
    }}
  >
    {String(post.day).padStart(2, "0")}
  </div>
);
