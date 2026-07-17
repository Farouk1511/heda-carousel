import React, { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";
import type { AvatarMap } from "../data/leaderboard/avatars";
import { dayCountForWeek } from "../data/leaderboard/daily";
import type { LeaderboardData } from "../data/leaderboard/types";
import { THEMES } from "../data/themes";
import { ChartScene } from "./bumpChart/ChartScene";
import { resolveBumpConfig, type BumpReelConfig } from "./bumpChart/config";
import { BumpIntro } from "./bumpChart/Intro";
import { buildBumpChartModel, type BumpChartModel } from "./bumpChart/model";
import { BumpOutro } from "./bumpChart/Outro";
import { getBumpChartDuration, getBumpTimeline } from "./bumpChart/timing";

loadSpaceGrotesk("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
loadDMSans("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
loadJetBrainsMono("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export interface BumpChartProps {
  data: LeaderboardData;
  config?: Partial<BumpReelConfig>;
  /** Pre-fetched data URLs keyed by imageUrl (render.ts supplies these). */
  avatars?: AvatarMap;
}

export const getBumpChartDurationFromProps = (props: BumpChartProps): number =>
  getBumpChartDuration(dayCountForWeek(props.data.week), resolveBumpConfig(props.config));

export const BumpChartComposition: React.FC<BumpChartProps> = ({
  data,
  config: partialConfig,
  avatars,
}) => {
  const config = useMemo(() => resolveBumpConfig(partialConfig), [partialConfig]);

  // Bad data (e.g. missing dailySteps) renders an in-frame error panel
  // instead of crashing Studio or the in-app Player.
  const { model, error } = useMemo((): { model?: BumpChartModel; error?: string } => {
    try {
      return { model: buildBumpChartModel(data, config) };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [data, config]);

  const theme = THEMES[config.theme];

  if (error || !model) {
    return (
      <AbsoluteFill
        style={{
          background: theme.bgCard,
          alignItems: "center",
          justifyContent: "center",
          padding: 100,
        }}
      >
        <div
          style={{
            fontSize: 34,
            lineHeight: 1.5,
            color: "#ff7a6b",
            fontFamily: "'JetBrains Mono', monospace",
            textAlign: "center",
          }}
        >
          Bump reel needs daily data
          <br />
          <span style={{ fontSize: 26, color: THEMES[config.theme].text, opacity: 0.8 }}>
            {error}
          </span>
        </div>
      </AbsoluteFill>
    );
  }

  const timeline = getBumpTimeline(model.dayCount, config);

  return (
    <AbsoluteFill style={{ background: theme.bgCard, fontFamily: "'DM Sans', sans-serif" }}>
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -120,
          width: 460,
          height: 460,
          borderRadius: "50%",
          background: theme.orbGradient,
        }}
      />
      <Sequence from={timeline.chartStart} durationInFrames={timeline.chartFrames}>
        <ChartScene
          model={model}
          config={config}
          theme={theme}
          timeline={timeline}
          avatars={avatars}
        />
      </Sequence>
      {config.showIntro && (
        <Sequence from={0} durationInFrames={timeline.introFrames}>
          <BumpIntro model={model} config={config} theme={theme} />
        </Sequence>
      )}
      {config.showOutro && (
        <Sequence
          from={timeline.totalFrames - timeline.outroFrames}
          durationInFrames={timeline.outroFrames}
        >
          <BumpOutro model={model} config={config} theme={theme} avatars={avatars} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
