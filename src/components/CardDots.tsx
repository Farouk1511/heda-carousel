import React from "react";

export interface DotColors {
  active: string;
  inactive: string;
  ctaActive: string;
  ctaInactive: string;
}

const LEGACY_COLORS: DotColors = {
  active: "#705bcf",
  inactive: "rgba(112,91,207,0.25)",
  ctaActive: "#fff",
  ctaInactive: "rgba(255,255,255,0.3)",
};

interface CardDotsProps {
  total: number;
  active: number;
  isCTA: boolean;
  scale?: number;
  activeProgress?: number;
  colors?: DotColors;
}

export const CardDots: React.FC<CardDotsProps> = ({
  total,
  active,
  isCTA,
  scale = 1,
  activeProgress = 1,
  colors = LEGACY_COLORS,
}) => {
  const s = scale;
  const clampedProgress = Math.min(Math.max(activeProgress, 0), 1);
  return (
    <div
      style={{
        display: "flex",
        gap: 6 * s,
        position: "absolute",
        bottom: 16 * s,
        left: 28 * s,
      }}
    >
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            height: 6 * s,
              borderRadius: 3 * s,
              width: i === active ? (6 + 12 * clampedProgress) * s : 6 * s,
              background:
              i === active
                ? isCTA
                  ? colors.ctaActive
                  : colors.active
                : isCTA
                  ? colors.ctaInactive
                  : colors.inactive,
            transition: "all 0.3s ease",
          }}
        />
      ))}
    </div>
  );
};
