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
import { getBumpPalette } from "./constants";
import type { BumpReelConfig } from "./config";
import type { BumpChartModel, BumpPerson } from "./model";

interface BumpOutroProps {
  model: BumpChartModel;
  config: BumpReelConfig;
  theme: ThemeTokens;
  avatars?: AvatarMap;
}

type Enter = (delay: number, baseOpacity?: number) => React.CSSProperties;

/**
 * Closing card over the dimmed chart: either the champion alone or a top-3
 * podium, then the biggest climber (optional) and the CTA. The focused lines
 * stay bright underneath.
 */
export const BumpOutro: React.FC<BumpOutroProps> = ({
  model,
  config,
  theme,
  avatars,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { biggestClimber } = model;
  const colors = getBumpPalette(config.palette);
  const podium = config.outroStyle === "podium" && model.people.length >= 3;
  // Square frames are short; shrink the card so it never touches the edges.
  const compact = config.format === "1:1";

  const enter: Enter = (delay, baseOpacity = 1) => {
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
          width: podium ? 940 : 860,
          borderRadius: 32,
          padding: compact ? "40px 48px" : "56px 64px",
          background: "rgba(12,10,18,0.9)",
          border: "1.5px solid rgba(112,91,207,0.35)",
          boxShadow: "0 40px 90px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: compact ? 20 : 26,
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
          {podium ? "🏆 THIS WEEK'S PODIUM" : "👑 CHAMPION OF THE WEEK"}
        </div>

        {podium ? (
          <Podium
            people={model.people.slice(0, 3)}
            colors={colors}
            theme={theme}
            avatars={avatars}
            frame={frame}
            fps={fps}
            compact={compact}
          />
        ) : (
          <Champion
            winner={model.winner}
            color={colors[model.winner.colorIndex]}
            theme={theme}
            avatars={avatars}
            enter={enter}
          />
        )}

        {config.showClimber && biggestClimber && (
          <div
            style={{
              fontSize: 29,
              fontWeight: 500,
              color: theme.text,
              fontFamily: "'DM Sans', sans-serif",
              ...enter(podium ? 26 : 16, theme.textSub),
            }}
          >
            📈 Biggest climber:{" "}
            <span style={{ fontWeight: 700, color: colors[biggestClimber.colorIndex] }}>
              {biggestClimber.name}
            </span>{" "}
            +{biggestClimber.startRank - biggestClimber.finalRank} places
          </div>
        )}
        {config.cta.trim() && (
          <div style={{ ...enter(podium ? 30 : 22), marginTop: 8 }}>
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

const Champion: React.FC<{
  winner: BumpPerson;
  color: string;
  theme: ThemeTokens;
  avatars?: AvatarMap;
  enter: Enter;
}> = ({ winner, color, theme, avatars, enter }) => (
  <>
    <div style={{ ...enter(6) }}>
      <AvatarCircle
        name={winner.name}
        imageUrl={winner.imageUrl}
        avatars={avatars}
        size={150}
        ringColor={color}
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
          color,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {formatSteps(winner.totalSteps)}{" "}
        <span style={{ fontSize: 24, letterSpacing: "0.14em", color: theme.text, opacity: 0.7 }}>
          STEPS
        </span>
      </div>
    </div>
  </>
);

/** Display order left-to-right (2nd, 1st, 3rd) and each pedestal's height. */
const PODIUM_SLOTS = [
  { index: 1, pedestal: 120, avatar: 104, delay: 10 },
  { index: 0, pedestal: 170, avatar: 132, delay: 16 },
  { index: 2, pedestal: 84, avatar: 96, delay: 4 },
];

/** Top three on rising pedestals; 3rd lands first, the champion last. */
const Podium: React.FC<{
  people: BumpPerson[];
  colors: string[];
  theme: ThemeTokens;
  avatars?: AvatarMap;
  frame: number;
  fps: number;
  compact: boolean;
}> = ({ people, colors, theme, avatars, frame, fps, compact }) => {
  const k = compact ? 0.8 : 1;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 18, width: "100%" }}>
      {PODIUM_SLOTS.map(({ index, pedestal, avatar, delay }) => {
        const person = people[index];
        const color = colors[person.colorIndex];
        const rise = spring({
          frame: Math.max(frame - delay, 0),
          fps,
          config: { damping: 14, stiffness: 110, mass: 0.9 },
        });
        const shown = frame < delay ? 0 : rise;
        return (
          <div
            key={person.key}
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10 * k,
              opacity: shown,
            }}
          >
            <div style={{ transform: `translateY(${(1 - shown) * 40}px)` }}>
              <AvatarCircle
                name={person.name}
                imageUrl={person.imageUrl}
                avatars={avatars}
                size={avatar * k}
                ringColor={color}
                ringWidth={index === 0 ? 5 : 4}
                theme={theme}
              />
            </div>
            <div
              style={{
                maxWidth: "100%",
                fontSize: (index === 0 ? 36 : 30) * k,
                fontWeight: 700,
                lineHeight: 1.1,
                color: theme.textHeadline,
                fontFamily: "'Space Grotesk', sans-serif",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {person.name}
            </div>
            <div
              style={{
                fontSize: (index === 0 ? 30 : 25) * k,
                fontWeight: 600,
                color,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {formatSteps(person.totalSteps)}
            </div>
            <div
              style={{
                width: "100%",
                height: pedestal * k * shown,
                borderRadius: "14px 14px 4px 4px",
                background: `linear-gradient(180deg, ${color}55 0%, ${color}14 100%)`,
                borderTop: `3px solid ${color}`,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                paddingTop: 12 * k,
                boxSizing: "border-box",
                overflow: "hidden",
                fontSize: 44 * k,
                fontWeight: 800,
                color,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {index + 1}
            </div>
          </div>
        );
      })}
    </div>
  );
};
