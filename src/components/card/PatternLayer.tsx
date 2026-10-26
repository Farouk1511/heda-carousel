import React from "react";
import type { PatternId } from "../../data/design/types";
import { CONFETTI, SPARKLES, type Scatter } from "../../data/design/patterns";
import { DOT_GRID_SIZE, dotGridBackground } from "../../data/design/textures";
import { ACCENTS } from "../../data/design/accents";

interface PatternLayerProps {
  pattern: PatternId;
  /** "r,g,b" to paint lines/dots with */
  rgb: string;
  /** Background is light: slightly lower alpha reads the same */
  light: boolean;
  s: number;
}

const layer: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
};

/** Confetti is deliberately multicolour: every accent preset's base tone */
const CONFETTI_COLORS = ACCENTS.map((a) => a.base);

const ScatterShape: React.FC<{ item: Scatter; color: string; s: number }> = ({ item, color, s }) => {
  const size = item.size * s;
  const box: React.CSSProperties = {
    position: "absolute",
    left: `${item.x}%`,
    top: `${item.y}%`,
    width: size,
    height: size,
    transform: `translate(-50%, -50%) rotate(${item.rot}deg)`,
    overflow: "visible",
  };
  switch (item.shape) {
    case "star":
      return (
        <svg viewBox="0 0 24 24" style={box}>
          <path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" fill={color} />
        </svg>
      );
    case "rect":
      return (
        <svg viewBox="0 0 24 24" style={box}>
          <rect x="4" y="8" width="16" height="8" rx="2" fill={color} />
        </svg>
      );
    case "dot":
      return (
        <svg viewBox="0 0 24 24" style={box}>
          <circle cx="12" cy="12" r="8" fill={color} />
        </svg>
      );
    case "tri":
      return (
        <svg viewBox="0 0 24 24" style={box}>
          <path d="M12 3L21 20H3Z" fill={color} />
        </svg>
      );
    case "squiggle":
      return (
        <svg viewBox="0 0 32 16" style={{ ...box, height: size / 2 }}>
          <path
            d="M2 8C6 2 10 2 14 8S22 14 26 8"
            fill="none"
            stroke={color}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      );
  }
};

/** Decorative pattern over the card background. Pure CSS/inline SVG, so exports match. */
export const PatternLayer: React.FC<PatternLayerProps> = ({ pattern, rgb, light, s }) => {
  const a = (dark: number) => `rgba(${rgb},${light ? dark * 0.85 : dark})`;

  switch (pattern) {
    case "none":
      return null;
    case "dots":
      return (
        <div
          style={{
            ...layer,
            backgroundImage: dotGridBackground(a(0.14)),
            backgroundSize: DOT_GRID_SIZE,
          }}
        />
      );
    case "grid": {
      const line = a(0.1);
      const step = 26 * s;
      return (
        <div
          style={{
            ...layer,
            backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
            backgroundSize: `${step}px ${step}px`,
          }}
        />
      );
    }
    case "lines":
      return (
        <div
          style={{
            ...layer,
            backgroundImage: `repeating-linear-gradient(135deg, ${a(0.12)} 0 ${1.2 * s}px, transparent ${1.2 * s}px ${11 * s}px)`,
          }}
        />
      );
    case "rings": {
      const gap = 20 * s;
      return (
        <div
          style={{
            ...layer,
            backgroundImage: `repeating-radial-gradient(circle at 100% 0%, transparent 0 ${gap - 1.2 * s}px, ${a(0.16)} ${gap - 1.2 * s}px ${gap}px)`,
          }}
        />
      );
    }
    case "halftone": {
      const mask = "radial-gradient(circle at 100% 100%, #000 0%, transparent 62%)";
      return (
        <div
          style={{
            ...layer,
            backgroundImage: `radial-gradient(${a(0.32)} 32%, transparent 36%)`,
            backgroundSize: `${9 * s}px ${9 * s}px`,
            WebkitMaskImage: mask,
            maskImage: mask,
          }}
        />
      );
    }
    case "sparkle": {
      const colors = [`rgba(${rgb},${light ? 0.55 : 0.7})`, light ? `rgba(${rgb},0.3)` : "rgba(255,255,255,0.55)"];
      return (
        <div style={layer}>
          {SPARKLES.map((it, i) => (
            <ScatterShape key={i} item={it} color={colors[it.c]} s={s} />
          ))}
        </div>
      );
    }
    case "confetti":
      return (
        <div style={{ ...layer, opacity: light ? 0.75 : 0.85 }}>
          {CONFETTI.map((it, i) => (
            <ScatterShape key={i} item={it} color={CONFETTI_COLORS[it.c % CONFETTI_COLORS.length]} s={s} />
          ))}
        </div>
      );
  }
};
