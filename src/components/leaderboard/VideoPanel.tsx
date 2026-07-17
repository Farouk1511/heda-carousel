import React, { useMemo } from "react";
import { Player } from "@remotion/player";
import type { ThemeName } from "../../data/themes";
import type { LeaderboardData } from "../../data/leaderboard/types";
import type { AvatarMap } from "../../data/leaderboard/avatars";
import { validateDailySteps } from "../../data/leaderboard/daily";
import {
  BumpChartComposition,
  getBumpChartDurationFromProps,
} from "../../remotion/BumpChartComposition";
import { BUMP_FPS, BUMP_HEIGHT, BUMP_WIDTH } from "../../remotion/bumpChart/constants";
import type { BumpPacing, BumpReelConfig } from "../../remotion/bumpChart/config";

const PACINGS: BumpPacing[] = ["fast", "normal", "slow"];

interface VideoPreviewProps {
  data: LeaderboardData;
  config: BumpReelConfig;
  avatars: AvatarMap;
}

/** Center pane of the Video tab: live Remotion Player (or a hint when the data lacks dailySteps). */
export const VideoPreview: React.FC<VideoPreviewProps> = ({ data, config, avatars }) => {
  const validation = useMemo(() => validateDailySteps(data), [data]);
  const durationInFrames = getBumpChartDurationFromProps({ data, config });
  const seconds = (durationInFrames / BUMP_FPS).toFixed(1);

  if (!validation.ok) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          aspectRatio: "9 / 16",
          borderRadius: 16,
          border: "1px dashed rgba(112,91,207,0.4)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          padding: 32,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 28 }}>📈</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent-light)" }}>
          Bump reel needs daily data
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.6, opacity: 0.7, fontFamily: "var(--font-mono)" }}>
          {validation.error}
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.6, opacity: 0.55 }}>
          Add a <code>dailySteps</code> array (one number per day of the week) to every
          entry in the JSON, then re-apply it.
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      <Player
        component={
          BumpChartComposition as unknown as React.ComponentType<Record<string, unknown>>
        }
        inputProps={{ data, config, avatars }}
        durationInFrames={durationInFrames}
        fps={BUMP_FPS}
        compositionWidth={BUMP_WIDTH}
        compositionHeight={BUMP_HEIGHT}
        controls
        loop
        style={{
          width: "100%",
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(112,91,207,0.2)",
        }}
      />
      <div
        style={{
          marginTop: 10,
          textAlign: "center",
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          opacity: 0.5,
        }}
      >
        {durationInFrames} frames · {seconds}s · 1080×1920 @ {BUMP_FPS}fps
      </div>
      {validation.warnings.map((w) => (
        <div
          key={w}
          style={{
            marginTop: 6,
            fontSize: 11,
            lineHeight: 1.5,
            color: "#ffc94d",
            fontFamily: "var(--font-mono)",
          }}
        >
          ⚠ {w}
        </div>
      ))}
    </div>
  );
};

interface VideoSettingsProps {
  config: BumpReelConfig;
  onChange: (patch: Partial<BumpReelConfig>) => void;
}

/** Right-panel controls of the Video tab, mirroring the carousel generator's knobs. */
export const VideoSettings: React.FC<VideoSettingsProps> = ({ config, onChange }) => {
  return (
    <>
      <div className="section-label">VIDEO THEME</div>
      <div className="theme-btns">
        {(["standard", "deep"] as ThemeName[]).map((th) => (
          <button
            key={th}
            className={`theme-btn${config.theme === th ? " active" : ""}`}
            onClick={() => onChange({ theme: th })}
          >
            {th}
          </button>
        ))}
      </div>

      <div className="section-label">TITLE</div>
      <div className="edit-field">
        <input
          className="edit-textarea"
          value={config.title}
          placeholder="How the week moved"
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>

      <div className="section-label" style={{ marginTop: 16 }}>
        PACING
      </div>
      <div className="ratio-btns">
        {PACINGS.map((pace) => (
          <button
            key={pace}
            className={`ratio-btn${config.pacing === pace ? " active" : ""}`}
            onClick={() => onChange({ pacing: pace })}
          >
            {pace}
          </button>
        ))}
      </div>

      <div className="section-label">TOP N</div>
      <div className="size-control">
        <button
          className="size-btn"
          onClick={() => onChange({ topN: Math.max(3, config.topN - 1) })}
        >
          -
        </button>
        <div className="size-value">{config.topN}</div>
        <button
          className="size-btn"
          onClick={() => onChange({ topN: Math.min(10, config.topN + 1) })}
        >
          +
        </button>
      </div>

      <div className="section-label" style={{ marginTop: 16 }}>
        SCENES
      </div>
      <div className="theme-btns" style={{ marginBottom: 12 }}>
        <button
          className={`theme-btn${config.showIntro ? " active" : ""}`}
          onClick={() => onChange({ showIntro: !config.showIntro })}
        >
          intro
        </button>
        <button
          className={`theme-btn${config.showOutro ? " active" : ""}`}
          onClick={() => onChange({ showOutro: !config.showOutro })}
        >
          outro
        </button>
      </div>

      <div className="section-label">LOGO SIZE</div>
      <div className="size-control">
        <button
          className="size-btn"
          onClick={() =>
            onChange({ logoScale: Math.max(0.5, Number((config.logoScale - 0.1).toFixed(2))) })
          }
        >
          -
        </button>
        <div className="size-value">{Math.round(config.logoScale * 100)}%</div>
        <button
          className="size-btn"
          onClick={() =>
            onChange({ logoScale: Math.min(2.5, Number((config.logoScale + 0.1).toFixed(2))) })
          }
        >
          +
        </button>
      </div>
    </>
  );
};
