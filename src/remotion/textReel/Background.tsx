import React from "react";
import { AbsoluteFill } from "remotion";
import type { BackgroundVariant } from "./model";

interface BackgroundProps {
  variant: BackgroundVariant;
  frame: number;
  accent: string;
  background: string;
  totalFrames?: number;
}

export const ReelBackground: React.FC<BackgroundProps> = ({
  variant,
  frame,
  accent,
  background,
  totalFrames = 450,
}) => {
  // Sinusoidal drift (organic figure-8 with phase offset)
  const driftX = Math.sin((frame / 180) * Math.PI * 2) * 24;
  const driftY = Math.sin((frame / 240) * Math.PI * 2 + 0.7) * 16;

  // Ken Burns subtle zoom
  const sceneProgress = frame / totalFrames;
  const kenBurnsScale = 1 + sceneProgress * 0.02;

  // Glow breathing (3-second cycle)
  const breathe = 1 + Math.sin((frame / 90) * Math.PI * 2) * 0.15;

  const violetGlowOpacity =
    variant === "violet-haze" ? 0.3 : variant === "orbital" ? 0.24 : 0.15;
  const pulsedGlowOpacity = violetGlowOpacity * breathe;

  return (
    <AbsoluteFill style={{ backgroundColor: background }}>
      {/* Base gradient */}
      <AbsoluteFill
        style={{
          transform: `scale(${kenBurnsScale})`,
          background:
            "linear-gradient(160deg, rgba(12, 13, 24, 1) 0%, rgba(9, 10, 19, 1) 60%, rgba(8, 9, 16, 1) 100%)",
        }}
      />

      {/* Grid overlay */}
      <AbsoluteFill
        style={{
          transform: `scale(${kenBurnsScale})`,
          background:
            variant === "grid-fade"
              ? "linear-gradient(rgba(138,108,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(138,108,255,0.08) 1px, transparent 1px)"
              : "none",
          backgroundSize: "72px 72px",
          opacity: variant === "grid-fade" ? 0.35 : 0,
        }}
      />

      {/* Primary glow */}
      <AbsoluteFill
        style={{
          transform: `translate(${driftX}px, ${driftY}px) scale(${kenBurnsScale})`,
          background: `radial-gradient(circle at 82% 18%, ${accent}${Math.round(pulsedGlowOpacity * 255)
            .toString(16)
            .padStart(2, "0")} 0%, rgba(0,0,0,0) 48%)`,
        }}
      />

      {/* Secondary glow with parallax */}
      <AbsoluteFill
        style={{
          transform: `translate(${-driftX * 0.6}px, ${-driftY * 0.6}px) scale(${kenBurnsScale})`,
          background:
            variant === "orbital"
              ? "radial-gradient(circle at 20% 78%, rgba(138,108,255,0.28) 0%, rgba(0,0,0,0) 38%)"
              : "radial-gradient(circle at 14% 78%, rgba(138,108,255,0.16) 0%, rgba(0,0,0,0) 42%)",
        }}
      />

      {/* Film grain overlay */}
      <AbsoluteFill
        style={{
          opacity: 0.035,
          mixBlendMode: "overlay",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
          transform: `translate(${(frame * 7) % 256}px, ${(frame * 11) % 256}px)`,
        }}
      />
    </AbsoluteFill>
  );
};
