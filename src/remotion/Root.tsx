import type { ComponentType } from "react";
import { Composition } from "remotion";
import { ReelComposition, getReelDuration, type ReelProps } from "./ReelComposition";
import { POSTS } from "../data/posts";
import { REEL_PRESET } from "./reelPreset";
import {
  TextReelComposition,
  getTextReelDuration,
  type TextReelProps,
} from "./TextReelComposition";
import { getReelById, hedaCommunityReel } from "./textReel/examples";
import { TEXT_REEL_FPS, TEXT_REEL_HEIGHT, TEXT_REEL_WIDTH } from "./textReel/constants";
import {
  BumpChartComposition,
  getBumpChartDurationFromProps,
  type BumpChartProps,
} from "./BumpChartComposition";
import { BUMP_FPS, BUMP_HEIGHT, BUMP_WIDTH } from "./bumpChart/constants";
import { DEFAULT_BUMP_CONFIG } from "./bumpChart/config";
import { SAMPLE_LEADERBOARD } from "../data/leaderboard/sample";

export const RemotionRoot: React.FC = () => {
  const defaultPost = 0;
  const defaultSlideCount = POSTS[defaultPost].slides.length;

  return (
    <>
      <Composition
        id="ReelVideo"
        component={ReelComposition as unknown as ComponentType<Record<string, unknown>>}
        durationInFrames={getReelDuration(defaultSlideCount)}
        fps={REEL_PRESET.fps}
        width={REEL_PRESET.width}
        height={REEL_PRESET.height}
        defaultProps={{
          postIndex: defaultPost,
          theme: "standard" as const,
          logoScale: 1,
        }}
        calculateMetadata={({ props }) => {
          const castProps = props as unknown as ReelProps;
          const safePostIndex = Math.min(
            Math.max(Number(castProps.postIndex) || 0, 0),
            POSTS.length - 1
          );
          const post = POSTS[safePostIndex];
          return {
            durationInFrames: getReelDuration(post.slides.length),
          };
        }}
      />

      <Composition
        id="TextReelVideo"
        component={TextReelComposition as unknown as ComponentType<Record<string, unknown>>}
        durationInFrames={getTextReelDuration(hedaCommunityReel)}
        fps={TEXT_REEL_FPS}
        width={TEXT_REEL_WIDTH}
        height={TEXT_REEL_HEIGHT}
        defaultProps={{
          reelId: hedaCommunityReel.id,
        }}
        calculateMetadata={({ props }) => {
          const castProps = props as unknown as TextReelProps;
          const reel = castProps.reel ?? getReelById(castProps.reelId);
          return {
            durationInFrames: getTextReelDuration(reel, castProps.durationPresetOverride),
          };
        }}
      />

      <Composition
        id="BumpChartVideo"
        component={BumpChartComposition as unknown as ComponentType<Record<string, unknown>>}
        durationInFrames={getBumpChartDurationFromProps({ data: SAMPLE_LEADERBOARD })}
        fps={BUMP_FPS}
        width={BUMP_WIDTH}
        height={BUMP_HEIGHT}
        defaultProps={{
          data: SAMPLE_LEADERBOARD,
          config: DEFAULT_BUMP_CONFIG,
        }}
        calculateMetadata={({ props }) => ({
          durationInFrames: getBumpChartDurationFromProps(props as unknown as BumpChartProps),
        })}
      />
    </>
  );
};
