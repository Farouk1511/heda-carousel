import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { ThemeTokens } from "../../data/themes";
import type { BumpReelConfig } from "./config";
import type { BumpChartModel } from "./model";
import { INTRO_FRAMES } from "./timing";

interface BumpIntroProps {
  model: BumpChartModel;
  config: BumpReelConfig;
  theme: ThemeTokens;
}

/** Opaque title card that fades out to reveal the chart drawing in. */
export const BumpIntro: React.FC<BumpIntroProps> = ({ model, config, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeOut = interpolate(frame, [INTRO_FRAMES - 12, INTRO_FRAMES], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });

  const enter = (delay: number, baseOpacity = 1) => {
    const s = spring({
      frame: Math.max(frame - delay, 0),
      fps,
      config: { damping: 16, stiffness: 110, mass: 0.9 },
    });
    return {
      opacity: (frame < delay ? 0 : s) * baseOpacity,
      transform: `translateY(${(1 - s) * 40}px)`,
    };
  };

  return (
    <AbsoluteFill
      style={{
        background: theme.bgCard,
        opacity: fadeOut,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -140,
          right: -140,
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: theme.orbGradient,
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 34,
          padding: "0 90px",
          textAlign: "center",
        }}
      >
        <img
          src={staticFile("LOGO.png")}
          alt="Heda"
          style={{
            width: 132 * config.logoScale,
            height: 132 * config.logoScale,
            objectFit: "contain",
            ...enter(0),
          }}
        />
        <div
          style={{
            fontSize: 28,
            letterSpacing: "0.2em",
            fontWeight: 600,
            color: theme.accent,
            fontFamily: "'JetBrains Mono', monospace",
            ...enter(8),
          }}
        >
          WEEKLY LEADERBOARD · TOP {model.rowCount}
        </div>
        <div
          style={{
            fontSize: 92,
            fontWeight: 800,
            lineHeight: 1.05,
            color: theme.textHeadline,
            fontFamily: "'Space Grotesk', sans-serif",
            ...enter(14),
          }}
        >
          {config.title}
        </div>
        <div
          style={{
            fontSize: 40,
            fontWeight: 500,
            color: theme.text,
            fontFamily: "'DM Sans', sans-serif",
            ...enter(20, theme.textSub),
          }}
        >
          {model.weekLabel}
        </div>
      </div>
    </AbsoluteFill>
  );
};
