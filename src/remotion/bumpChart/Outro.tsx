import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { AvatarMap } from "../../data/leaderboard/avatars";
import { formatSteps } from "../../data/leaderboard/parse";
import type { ThemeTokens } from "../../data/themes";
import { AvatarCircle } from "./AvatarNode";
import { BUMP_COLORS } from "./constants";
import type { BumpReelConfig } from "./config";
import type { BumpChartModel } from "./model";

interface BumpOutroProps {
  model: BumpChartModel;
  config: BumpReelConfig;
  theme: ThemeTokens;
  avatars?: AvatarMap;
}

/**
 * Winner card over the dimmed chart: champion, biggest climber (when someone
 * climbed), and the CTA. The winner's own line stays bright underneath.
 */
export const BumpOutro: React.FC<BumpOutroProps> = ({
  model,
  config,
  theme,
  avatars,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { winner, biggestClimber } = model;
  const winnerColor = BUMP_COLORS[winner.colorIndex];

  const enter = (delay: number, baseOpacity = 1) => {
    const s = spring({
      frame: Math.max(frame - delay, 0),
      fps,
      config: { damping: 15, stiffness: 120, mass: 0.9 },
    });
    return {
      opacity: (frame < delay ? 0 : s) * baseOpacity,
      transform: `translateY(${(1 - s) * 60}px)`,
    };
  };

  const ctaPulse = 1 + 0.03 * Math.sin((frame / fps) * Math.PI * 2);
  const fadeIn = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: fadeIn }}>
      <div
        style={{
          width: 860,
          borderRadius: 32,
          padding: "56px 64px",
          background: "rgba(12,10,18,0.9)",
          border: "1.5px solid rgba(112,91,207,0.35)",
          boxShadow: "0 40px 90px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
          textAlign: "center",
          ...enter(0),
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: "0.2em",
            fontWeight: 600,
            color: theme.accent,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          👑 CHAMPION OF THE WEEK
        </div>
        <div style={{ ...enter(6) }}>
          <AvatarCircle
            name={winner.name}
            imageUrl={winner.imageUrl}
            avatars={avatars}
            size={150}
            ringColor={winnerColor}
            ringWidth={5}
            theme={theme}
          />
        </div>
        <div style={{ ...enter(10) }}>
          <div
            style={{
              fontSize: 62,
              fontWeight: 800,
              lineHeight: 1.05,
              color: theme.textHeadline,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {winner.name}
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 42,
              fontWeight: 600,
              color: winnerColor,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {formatSteps(winner.totalSteps)}{" "}
            <span style={{ fontSize: 24, letterSpacing: "0.14em", color: theme.text, opacity: 0.7 }}>
              STEPS
            </span>
          </div>
        </div>
        {biggestClimber && (
          <div
            style={{
              fontSize: 29,
              fontWeight: 500,
              color: theme.text,
              fontFamily: "'DM Sans', sans-serif",
              ...enter(16, theme.textSub),
            }}
          >
            📈 Biggest climber:{" "}
            <span style={{ fontWeight: 700, color: BUMP_COLORS[biggestClimber.colorIndex] }}>
              {biggestClimber.name}
            </span>{" "}
            +{biggestClimber.startRank - biggestClimber.finalRank} places
          </div>
        )}
        {config.cta.trim() && (
          <div style={{ ...enter(22), marginTop: 8 }}>
            <div
              style={{
                display: "inline-block",
                background: theme.bgCardCta,
                color: theme.ctaText,
                borderRadius: 999,
                padding: "18px 46px",
                fontSize: 31,
                fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
                transform: `scale(${ctaPulse})`,
              }}
            >
              {config.cta}
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
