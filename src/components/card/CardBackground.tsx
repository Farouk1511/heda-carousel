import React from "react";
import type { CardDesign } from "../../data/design/resolve";
import { GRAIN_DATA_URI } from "../../data/design/textures";
import { PatternLayer } from "./PatternLayer";

interface CardBackgroundProps {
  design: CardDesign;
  isCTA: boolean;
  s: number;
  showOrb: boolean;
  /** Cover slides get a larger, stronger orb */
  boostOrb?: boolean;
}

const layerBase: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
};

/**
 * All background paint for a card: base fill, dot grid, orbs, grain.
 * Rendered as the first child so every positioned/stacking sibling paints above it.
 * Static text containers in Card must carry zIndex >= 1 to stay on top.
 */
export const CardBackground: React.FC<CardBackgroundProps> = ({
  design: d,
  isCTA,
  s,
  showOrb,
  boostOrb = false,
}) => {
  const orbSize = (boostOrb ? 190 : 120) * s;
  const orbOffset = (boostOrb ? -56 : -40) * s;
  const light = d.mode === "light";
  return (
    <div style={{ ...layerBase, zIndex: 0, overflow: "hidden" }}>
      <div
        style={{
          ...layerBase,
          background: isCTA ? d.backgroundCTA : d.background,
          filter: d.hueShiftDeg ? `hue-rotate(${d.hueShiftDeg}deg)` : undefined,
        }}
      />
      {!isCTA && (
        <PatternLayer
          pattern={d.pattern}
          rgb={d.whiteAccents ? "255,255,255" : d.accentRgb}
          light={light}
          s={s}
        />
      )}
      {showOrb && (
        <div
          style={{
            position: "absolute",
            top: orbOffset,
            right: orbOffset,
            width: orbSize,
            height: orbSize,
            borderRadius: "50%",
            pointerEvents: "none",
            background: d.orb,
          }}
        />
      )}
      {d.texture.secondOrb && !isCTA && (
        <div
          style={{
            position: "absolute",
            bottom: -60 * s,
            left: -60 * s,
            width: 160 * s,
            height: 160 * s,
            borderRadius: "50%",
            pointerEvents: "none",
            background: d.orbSecondary,
          }}
        />
      )}
      {d.texture.vignette && (
        <div
          style={{
            ...layerBase,
            background: light
              ? `radial-gradient(ellipse at center, transparent 50%, rgba(${d.accentRgb},0.16) 100%)`
              : "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.42) 100%)",
          }}
        />
      )}
      {d.texture.grain && (
        <div
          style={{
            ...layerBase,
            backgroundImage: `url(${GRAIN_DATA_URI})`,
            backgroundRepeat: "repeat",
            opacity: d.mode === "light" ? 0.06 : 0.05,
          }}
        />
      )}
    </div>
  );
};
