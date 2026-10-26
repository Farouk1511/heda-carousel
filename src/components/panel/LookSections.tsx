// Theme / background / accent / highlight / pattern / effects controls.
// Shared by the carousel inspector and the leaderboard panel so both surfaces
// stay in step as presets are added.
import React from "react";
import type { ThemeName } from "../../data/themes";
import type { HighlightStyle, PatternId, TextureOptions } from "../../data/design/types";
import type { LookStyle } from "../../data/design/lookState";
import { resolvePatternId } from "../../data/design/lookState";
import {
  BACKGROUNDS,
  BACKGROUND_GROUPS,
  getBackground,
  themeDefaultBackground,
} from "../../data/design/backgrounds";
import { ACCENTS, getAccent, hexToRgb } from "../../data/design/accents";
import { HIGHLIGHT_STYLES } from "../../data/design/highlights";
import { PATTERNS } from "../../data/design/patterns";
import { PatternLayer } from "../card/PatternLayer";
import { PanelSection, Segmented, ToggleRow } from "./PanelUI";

export const EFFECTS: [keyof TextureOptions, string, string][] = [
  ["grain", "Grain", "Film noise over everything"],
  ["vignette", "Vignette", "Darkens the edges"],
  ["secondOrb", "Second orb", "Extra glow, bottom left"],
  ["hueJourney", "Hue journey", "Colour shifts slide to slide"],
];

interface LookSectionsProps {
  theme: ThemeName;
  onSetTheme: (t: ThemeName) => void;
  style: LookStyle | undefined;
  onPatch: (patch: LookStyle) => void;
  /** Highlight styles only apply where **bold** markup is rendered */
  showHighlight?: boolean;
  /** Hue journey only means something across a multi-slide set */
  showHueJourney?: boolean;
  /** Prefix for remembered section open/closed state */
  idPrefix?: string;
}

export const LookSections: React.FC<LookSectionsProps> = ({
  theme,
  onSetTheme,
  style,
  onPatch,
  showHighlight = true,
  showHueJourney = true,
  idPrefix = "",
}) => {
  const sid = (id: string) => `${idPrefix}${id}`;
  const textureOn = (key: keyof TextureOptions) => style?.texture?.[key] ?? false;
  const toggleTexture = (key: keyof TextureOptions) =>
    onPatch({ texture: { ...style?.texture, [key]: !textureOn(key) } });

  const pattern = resolvePatternId(style);
  const setPattern = (id: PatternId) =>
    onPatch({
      pattern: id === "none" ? undefined : id,
      // Clear the legacy flag so it can't win over the new field
      texture: { ...style?.texture, dotGrid: false },
    });

  // Pattern tiles preview against the background and accent actually in use.
  const bg = getBackground(style?.backgroundId) ?? themeDefaultBackground(theme);
  const accent = getAccent(style?.accent);
  const light = bg.mode === "light";
  const patternRgb = bg.whiteAccents
    ? "255,255,255"
    : hexToRgb(light ? accent.deep : accent.base);

  const effects = EFFECTS.filter(([key]) => showHueJourney || key !== "hueJourney");

  return (
    <>
      <PanelSection id={sid("theme")} title="Theme">
        <Segmented
          options={[
            { value: "standard", label: "Standard" },
            { value: "deep", label: "Deep" },
          ]}
          value={theme === "deep" ? "deep" : "standard"}
          onChange={(t) => onSetTheme(t as ThemeName)}
        />
      </PanelSection>

      <PanelSection
        id={sid("background")}
        title="Background"
        aside={
          style?.backgroundId ? (
            <button
              type="button"
              className="ps-link"
              onClick={() => onPatch({ backgroundId: undefined })}
            >
              Use theme default
            </button>
          ) : (
            <span className="ps-note">Theme default</span>
          )
        }
      >
        {BACKGROUND_GROUPS.map((group) => (
          <div key={group.id} className="bg-group">
            <div className="bg-group-label">{group.label}</div>
            <div className="bg-swatch-grid">
              {BACKGROUNDS.filter((b) => b.group === group.id).map((b) => (
                <button
                  key={b.id}
                  type="button"
                  title={b.label}
                  className={`bg-swatch${style?.backgroundId === b.id ? " active" : ""}`}
                  style={{ background: b.swatch }}
                  onClick={() =>
                    onPatch({
                      backgroundId: style?.backgroundId === b.id ? undefined : b.id,
                    })
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </PanelSection>

      <PanelSection
        id={sid("accent")}
        title="Accent"
        aside={<span className="ps-note">{accent.label}</span>}
      >
        <div className="accent-row">
          {ACCENTS.map((a) => (
            <button
              key={a.id}
              type="button"
              title={a.label}
              aria-label={a.label}
              className={`accent-dot${accent.id === a.id ? " active" : ""}`}
              style={{ background: `linear-gradient(135deg, ${a.light}, ${a.base} 55%, ${a.deep})` }}
              onClick={() => onPatch({ accent: a.id === "violet" ? undefined : a.id })}
            />
          ))}
        </div>
        {bg.whiteAccents && (
          <div className="pf-hint">
            This background highlights in white, so the accent won't show on it.
          </div>
        )}
      </PanelSection>

      {showHighlight && (
        <PanelSection id={sid("highlight")} title="Highlight">
          <Segmented
            wrap
            options={HIGHLIGHT_STYLES.map((h) => ({ value: h.id, label: h.label }))}
            value={style?.highlightStyle ?? "color"}
            onChange={(id) =>
              onPatch({
                highlightStyle: id === "color" ? undefined : (id as HighlightStyle),
              })
            }
          />
        </PanelSection>
      )}

      <PanelSection id={sid("pattern")} title="Pattern">
        <div className="pat-grid">
          {PATTERNS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`pat-tile${pattern === p.id ? " active" : ""}`}
              onClick={() => setPattern(p.id)}
            >
              <span className="pat-prev" style={{ background: bg.css }}>
                <PatternLayer pattern={p.id} rgb={patternRgb} light={light} s={0.5} />
              </span>
              <span className="pat-label">{p.label}</span>
            </button>
          ))}
        </div>
      </PanelSection>

      <PanelSection id={sid("effects")} title="Effects">
        {effects.map(([key, label, hint]) => (
          <ToggleRow
            key={key}
            label={label}
            hint={hint}
            on={textureOn(key)}
            onChange={() => toggleTexture(key)}
          />
        ))}
      </PanelSection>
    </>
  );
};
