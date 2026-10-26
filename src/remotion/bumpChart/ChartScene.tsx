import React from "react";
import {
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { AvatarMap } from "../../data/leaderboard/avatars";
import type { ThemeTokens } from "../../data/themes";
import { AvatarNode } from "./AvatarNode";
import { getBumpGeometry, getBumpPalette, LINE_WIDTH } from "./constants";
import type { BumpReelConfig } from "./config";
import {
  cumulativeAt,
  dayProgress,
  dayX,
  linePoints,
  positionAt,
  rowY,
  type LineShape,
} from "./layout";
import type { BumpChartModel } from "./model";
import type { BumpTimeline } from "./timing";

interface ChartSceneProps {
  model: BumpChartModel;
  config: BumpReelConfig;
  theme: ThemeTokens;
  timeline: BumpTimeline;
  avatars?: AvatarMap;
}

/**
 * The bump chart itself, plus the persistent header/footer. Mounted in a
 * <Sequence> right after the intro and kept alive through the outro, which
 * overlays it — during the outro everyone outside `config.focus` dims down.
 */
export const ChartScene: React.FC<ChartSceneProps> = ({
  model,
  config,
  theme,
  timeline: tl,
  avatars,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { dayCount, rowCount, people } = model;
  const g = getBumpGeometry(config);
  const colors = getBumpPalette(config.palette);
  const shape: LineShape = {
    geometry: g,
    rowCount,
    dayCount,
    curved: config.lineStyle === "curved",
  };
  const strokeWidth = LINE_WIDTH[config.lineWeight];

  const p = dayProgress(frame, dayCount, tl);
  const completedDays = Math.floor(p);
  const activeDay = Math.round(p);

  // 1 during the chart, easing to 0 as the outro takes over.
  const outroFade = config.showOutro
    ? interpolate(frame, [tl.holdEnd, tl.holdEnd + 20], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  // Axes and gutters fade too, just never below 30%.
  const axisDim = Math.max(outroFade, 0.3);
  // "all" keeps every line lit under the outro.
  const lineDim = config.focus === "all" ? 1 : outroFade;

  const personOpacity = (personIndex: number): number => {
    const person = people[personIndex];
    const inFocus =
      config.focus === "podium" ? person.finalRank <= 3 : person === model.winner;
    if (inFocus) return 1;
    const isClimber = config.showClimber && person === model.biggestClimber;
    const dimmed = isClimber ? 0.5 : 0.12;
    return dimmed + (1 - dimmed) * lineDim;
  };

  const headerIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const axisIn = (index: number) =>
    interpolate(frame, [index * 2, index * 2 + 14], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    });

  const logoSize = (g.titleSize + 22) * config.logoScale;

  return (
    // zIndex 0 = own stacking context, so the riders' zIndex can't climb
    // above the outro card that overlays this scene.
    <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
      {/* Header */}
      <div
        style={{
          position: "absolute",
          left: 64,
          top: g.headerTop,
          right: 64 + logoSize + 24,
          opacity: headerIn,
        }}
      >
        <div
          style={{
            fontSize: Math.round(g.subSize * 0.76),
            letterSpacing: "0.18em",
            fontWeight: 600,
            color: theme.accent,
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: Math.round(g.subSize * 0.5),
          }}
        >
          WEEKLY LEADERBOARD · TOP {rowCount}
        </div>
        <div
          style={{
            fontSize: g.titleSize,
            fontWeight: 800,
            lineHeight: 1.05,
            color: theme.textHeadline,
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {config.title}
        </div>
        <div
          style={{
            fontSize: g.subSize,
            fontWeight: 500,
            marginTop: Math.round(g.subSize * 0.4),
            color: theme.text,
            opacity: theme.textSub,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {model.weekLabel}
        </div>
      </div>
      <img
        src={staticFile("LOGO.png")}
        alt="Heda"
        style={{
          position: "absolute",
          top: g.headerTop - 8,
          right: 64,
          width: logoSize,
          height: logoSize,
          objectFit: "contain",
          opacity: 0.9 * headerIn,
        }}
      />

      {/* Axes: rank gutter, row guides, day columns + labels */}
      {Array.from({ length: rowCount }, (_, i) => {
        const y = rowY(i + 1, rowCount, g);
        const reveal = axisIn(i);
        return (
          <React.Fragment key={`row-${i}`}>
            <span
              style={{
                position: "absolute",
                left: 0,
                top: y - 16,
                width: g.plotLeft - 34,
                textAlign: "right",
                fontSize: 26,
                fontWeight: 600,
                color: theme.accentLight,
                fontFamily: "'JetBrains Mono', monospace",
                opacity: 0.7 * reveal * axisDim,
              }}
            >
              {i + 1}
            </span>
            <div
              style={{
                position: "absolute",
                left: g.plotLeft - 16,
                top: y,
                width: g.plotRight - g.plotLeft + 32,
                height: 1.5,
                background: "rgba(112,91,207,0.12)",
                opacity: reveal * axisDim,
              }}
            />
          </React.Fragment>
        );
      })}
      {model.dayLabels.map((label, d) => {
        const x = dayX(d, dayCount, g);
        const isActive = d === activeDay && frame >= tl.placeStart;
        const reveal = axisIn(d + 3);
        return (
          <React.Fragment key={`day-${d}`}>
            <div
              style={{
                position: "absolute",
                left: x,
                top: g.plotTop - 12,
                width: 1,
                height: g.plotBottom - g.plotTop + 24,
                background: "rgba(232,230,240,0.05)",
                opacity: reveal * axisDim,
              }}
            />
            <span
              style={{
                position: "absolute",
                left: x - 60,
                top: g.plotTop - 60,
                width: 120,
                textAlign: "center",
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: isActive ? theme.accentLight : theme.text,
                opacity: (isActive ? 1 : 0.45) * reveal * axisDim,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {label}
            </span>
          </React.Fragment>
        );
      })}

      {/* Lines */}
      <svg
        viewBox={`0 0 ${g.width} ${g.height}`}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        {people.map((person, i) => {
          const points = linePoints(person, p, shape);
          const color = colors[person.colorIndex];
          const opacity = personOpacity(i);
          if (!points.includes(" ")) return null;
          return (
            <g key={person.key}>
              {config.glow && (
                <polyline
                  points={points}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth * 2.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity={0.16 * opacity}
                />
              )}
              <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={opacity}
              />
              {Array.from({ length: completedDays + 1 }, (_, d) => (
                <circle
                  key={d}
                  cx={dayX(d, dayCount, g)}
                  cy={rowY(person.days[d].rank, rowCount, g)}
                  r={Math.max(strokeWidth * 0.95, 4)}
                  fill={color}
                  opacity={opacity}
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Riders */}
      {people.map((person, i) => {
        const placeFrame = frame - (tl.placeStart + i * 2);
        const placeScale = spring({
          frame: Math.max(placeFrame, 0),
          fps,
          config: { damping: 14, stiffness: 130, mass: 0.8 },
        });
        if (placeFrame < 0) return null;

        // Brief pop while this segment changes the person's rank.
        const frac = p - Math.floor(p);
        const rankChanging =
          frac > 0 &&
          person.days[Math.floor(p)].rank !==
            person.days[Math.min(Math.floor(p) + 1, dayCount - 1)].rank;
        const pop = rankChanging ? Math.sin(frac * Math.PI) * 0.12 : 0;

        const pos = positionAt(person, p, shape);
        const countIn = interpolate(
          frame,
          [tl.placeStart + i * 2, tl.segmentsStart],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          }
        );
        const stepValue =
          p === 0
            ? Math.round(person.days[0].cumulative * countIn)
            : Math.round(cumulativeAt(person, p));

        return (
          <AvatarNode
            key={person.key}
            name={person.name}
            imageUrl={person.imageUrl}
            avatars={avatars}
            color={colors[person.colorIndex]}
            x={pos.x}
            y={pos.y}
            size={g.avatarSize}
            labels={config.labels}
            stepValue={stepValue}
            scale={placeScale * (1 + pop)}
            opacity={personOpacity(i)}
            theme={theme}
          />
        );
      })}

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          left: 64,
          bottom: g.footerBottom,
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: "0.05em",
          fontFamily: "'JetBrains Mono', monospace",
          color: theme.text,
          opacity: 0.5 * headerIn,
        }}
      >
        @joinheda
      </div>
    </div>
  );
};
