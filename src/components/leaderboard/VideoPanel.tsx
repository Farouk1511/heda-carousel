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
import { BUMP_FPS, getBumpFrameSize } from "../../remotion/bumpChart/constants";
import type {
  BumpFocus,
  BumpFormat,
  BumpHold,
  BumpLabels,
  BumpLineStyle,
  BumpLineWeight,
  BumpOutroStyle,
  BumpPacing,
  BumpPalette,
  BumpReelConfig,
} from "../../remotion/bumpChart/config";
import { FieldLabel, PanelSection, Segmented, Stepper, ToggleRow } from "../panel/PanelUI";

const PACINGS: BumpPacing[] = ["fast", "normal", "slow"];

const FORMATS: { value: BumpFormat; label: string }[] = [
  { value: "9:16", label: "9:16 Story" },
  { value: "4:5", label: "4:5 Feed" },
  { value: "1:1", label: "1:1 Square" },
];

/** Max preview width per format, so every format previews at a similar height. */
const PREVIEW_WIDTH: Record<BumpFormat, number> = {
  "9:16": 400,
  "4:5": 480,
  "1:1": 520,
};

type LookPatch = Pick<
  BumpReelConfig,
  "palette" | "lineStyle" | "lineWeight" | "glow" | "labels" | "focus" | "outroStyle"
>;

/** One-click looks. They only touch the visual knobs, never format, timing or text. */
const LOOK_PRESETS: { value: string; label: string; patch: LookPatch }[] = [
  {
    value: "classic",
    label: "Classic",
    patch: {
      palette: "vivid",
      lineStyle: "straight",
      lineWeight: "regular",
      glow: true,
      labels: "full",
      focus: "winner",
      outroStyle: "champion",
    },
  },
  {
    value: "smooth",
    label: "Smooth",
    patch: {
      palette: "vivid",
      lineStyle: "curved",
      lineWeight: "thin",
      glow: true,
      labels: "name",
      focus: "winner",
      outroStyle: "champion",
    },
  },
  {
    value: "podium",
    label: "Podium",
    patch: {
      palette: "podium",
      lineStyle: "curved",
      lineWeight: "regular",
      glow: true,
      labels: "full",
      focus: "podium",
      outroStyle: "podium",
    },
  },
  {
    value: "brand",
    label: "Brand",
    patch: {
      palette: "brand",
      lineStyle: "curved",
      lineWeight: "bold",
      glow: false,
      labels: "avatar",
      focus: "all",
      outroStyle: "champion",
    },
  },
];

function activePreset(config: BumpReelConfig): string {
  const hit = LOOK_PRESETS.find((p) =>
    (Object.keys(p.patch) as (keyof LookPatch)[]).every((k) => p.patch[k] === config[k])
  );
  return hit?.value ?? "custom";
}

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
  const { width, height } = getBumpFrameSize(config.format);
  const maxWidth = PREVIEW_WIDTH[config.format];

  if (!validation.ok) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth,
          aspectRatio: `${width} / ${height}`,
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
    <div style={{ width: "100%", maxWidth }}>
      <Player
        // Remount on format change: the Player sizes its canvas once.
        key={config.format}
        component={
          BumpChartComposition as unknown as React.ComponentType<Record<string, unknown>>
        }
        inputProps={{ data, config, avatars }}
        durationInFrames={durationInFrames}
        fps={BUMP_FPS}
        compositionWidth={width}
        compositionHeight={height}
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
        {durationInFrames} frames · {seconds}s · {width}×{height} @ {BUMP_FPS}fps
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
  onReset: () => void;
}

/** Right-panel controls of the Video tab, mirroring the carousel generator's knobs. */
export const VideoSettings: React.FC<VideoSettingsProps> = ({ config, onChange, onReset }) => {
  const preset = activePreset(config);
  return (
    <>
      <PanelSection
        id="vid-look"
        title="Look"
        aside={preset === "custom" ? <span className="ps-note">custom</span> : undefined}
      >
        <Segmented
          options={LOOK_PRESETS.map((p) => ({ value: p.value, label: p.label }))}
          value={preset}
          onChange={(v) => {
            const hit = LOOK_PRESETS.find((p) => p.value === v);
            if (hit) onChange(hit.patch);
          }}
        />
        <div className="pf-hint">
          Presets set the lines, labels and outro below; tweak any of them after.
        </div>
      </PanelSection>

      <PanelSection id="vid-format" title="Format">
        <Segmented
          options={FORMATS}
          value={config.format}
          onChange={(format) => onChange({ format })}
        />
        <FieldLabel>Theme</FieldLabel>
        <Segmented
          options={[
            { value: "standard", label: "Standard" },
            { value: "deep", label: "Deep" },
          ]}
          value={config.theme === "deep" ? "deep" : "standard"}
          onChange={(t) => onChange({ theme: t as ThemeName })}
        />
        <div className="pf-hint">
          The reel is rendered by Remotion, so it keeps the two base themes rather than the
          card backgrounds.
        </div>
      </PanelSection>

      <PanelSection id="vid-title" title="Title">
        <input
          className="edit-textarea"
          value={config.title}
          placeholder="How the week moved"
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </PanelSection>

      <PanelSection id="vid-lines" title="Lines">
        <FieldLabel>Colors</FieldLabel>
        <Segmented
          options={[
            { value: "vivid", label: "Vivid" },
            { value: "brand", label: "Brand" },
            { value: "podium", label: "Medals" },
          ]}
          value={config.palette}
          onChange={(palette: BumpPalette) => onChange({ palette })}
        />
        <FieldLabel>Shape</FieldLabel>
        <Segmented
          options={[
            { value: "straight", label: "Straight" },
            { value: "curved", label: "Curved" },
          ]}
          value={config.lineStyle}
          onChange={(lineStyle: BumpLineStyle) => onChange({ lineStyle })}
        />
        <FieldLabel>Weight</FieldLabel>
        <Segmented
          options={[
            { value: "thin", label: "Thin" },
            { value: "regular", label: "Regular" },
            { value: "bold", label: "Bold" },
          ]}
          value={config.lineWeight}
          onChange={(lineWeight: BumpLineWeight) => onChange({ lineWeight })}
        />
        <ToggleRow
          label="Glow"
          hint="Soft halo under each line"
          on={config.glow}
          onChange={() => onChange({ glow: !config.glow })}
        />
      </PanelSection>

      <PanelSection id="vid-riders" title="Athletes">
        <FieldLabel>Labels</FieldLabel>
        <Segmented
          options={[
            { value: "full", label: "Name + steps" },
            { value: "name", label: "Name" },
            { value: "avatar", label: "Avatar only" },
          ]}
          value={config.labels}
          onChange={(labels: BumpLabels) => onChange({ labels })}
        />
        <div className="st-row">
          <span className="st-label">Athletes shown</span>
          <div className="st-ctrl">
            <button
              type="button"
              className="st-btn"
              disabled={config.topN <= 3}
              onClick={() => onChange({ topN: Math.max(3, config.topN - 1) })}
            >
              −
            </button>
            <span className="st-value">{config.topN}</span>
            <button
              type="button"
              className="st-btn"
              disabled={config.topN >= 10}
              onClick={() => onChange({ topN: Math.min(10, config.topN + 1) })}
            >
              +
            </button>
          </div>
        </div>
      </PanelSection>

      <PanelSection id="vid-timing" title="Timing">
        <FieldLabel>Pacing</FieldLabel>
        <Segmented
          options={PACINGS.map((p) => ({ value: p, label: p }))}
          value={config.pacing}
          onChange={(p) => onChange({ pacing: p })}
        />
        <FieldLabel>Final hold</FieldLabel>
        <Segmented
          options={[
            { value: "short", label: "Short" },
            { value: "normal", label: "Normal" },
            { value: "long", label: "Long" },
          ]}
          value={config.hold}
          onChange={(hold: BumpHold) => onChange({ hold })}
        />
        <div className="pf-hint">How long the finished chart stays up before the outro.</div>
      </PanelSection>

      <PanelSection id="vid-scenes" title="Scenes">
        <ToggleRow
          label="Intro"
          hint="Title card before the chart"
          on={config.showIntro}
          onChange={() => onChange({ showIntro: !config.showIntro })}
        />
        <ToggleRow
          label="Outro"
          hint="Winner + CTA at the end"
          on={config.showOutro}
          onChange={() => onChange({ showOutro: !config.showOutro })}
        />
        {config.showOutro && (
          <>
            <FieldLabel>Outro card</FieldLabel>
            <Segmented
              options={[
                { value: "champion", label: "Champion" },
                { value: "podium", label: "Top 3 podium" },
              ]}
              value={config.outroStyle}
              onChange={(outroStyle: BumpOutroStyle) => onChange({ outroStyle })}
            />
            <FieldLabel>Keep lit under the outro</FieldLabel>
            <Segmented
              options={[
                { value: "winner", label: "Winner" },
                { value: "podium", label: "Top 3" },
                { value: "all", label: "Everyone" },
              ]}
              value={config.focus}
              onChange={(focus: BumpFocus) => onChange({ focus })}
            />
            <ToggleRow
              label="Biggest climber"
              hint="Call out who gained the most places"
              on={config.showClimber}
              onChange={() => onChange({ showClimber: !config.showClimber })}
            />
          </>
        )}
        <Stepper
          label="Logo size"
          value={config.logoScale}
          min={0.5}
          max={2.5}
          onChange={(logoScale) => onChange({ logoScale })}
          onReset={config.logoScale !== 1 ? () => onChange({ logoScale: 1 }) : undefined}
        />
      </PanelSection>

      <button type="button" className="panel-reset" onClick={onReset}>
        Reset video settings
      </button>
    </>
  );
};
