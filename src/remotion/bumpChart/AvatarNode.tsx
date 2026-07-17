import React, { useState } from "react";
import { Img } from "remotion";
import { initials, type AvatarMap } from "../../data/leaderboard/avatars";
import { formatSteps } from "../../data/leaderboard/parse";
import type { ThemeTokens } from "../../data/themes";
import { AVATAR_SIZE } from "./constants";

/**
 * Pick the image source: a pre-fetched data URL when render.ts supplied one,
 * the raw URL otherwise, and undefined (-> initials chip) when there is no
 * URL or the pre-fetch already failed ("" marks attempted-but-failed).
 */
function resolveAvatarSrc(
  imageUrl: string | undefined,
  avatars: AvatarMap | undefined
): string | undefined {
  if (!imageUrl) return undefined;
  if (avatars && imageUrl in avatars) return avatars[imageUrl] || undefined;
  return imageUrl;
}

interface AvatarCircleProps {
  name: string;
  imageUrl?: string;
  avatars?: AvatarMap;
  size: number;
  ringColor: string;
  ringWidth?: number;
  theme: ThemeTokens;
}

/** Circular avatar with a colored ring; falls back to an initials chip. */
export const AvatarCircle: React.FC<AvatarCircleProps> = ({
  name,
  imageUrl,
  avatars,
  size,
  ringColor,
  ringWidth = 3,
  theme,
}) => {
  const [failed, setFailed] = useState(false);
  const src = failed ? undefined : resolveAvatarSrc(imageUrl, avatars);

  const shell: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    border: `${ringWidth}px solid ${ringColor}`,
    boxSizing: "border-box",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(112,91,207,0.18)",
    flexShrink: 0,
  };

  if (!src) {
    return (
      <div style={shell}>
        <span
          style={{
            color: theme.accentLight,
            fontSize: size * 0.34,
            fontWeight: 700,
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: "0.02em",
          }}
        >
          {initials(name)}
        </span>
      </div>
    );
  }

  return (
    <div style={shell}>
      <Img
        src={src}
        onError={() => setFailed(true)}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  );
};

interface AvatarNodeProps {
  name: string;
  imageUrl?: string;
  avatars?: AvatarMap;
  color: string;
  x: number;
  y: number;
  /** Current (ticking) cumulative step count. */
  stepValue: number;
  scale: number;
  opacity: number;
  theme: ThemeTokens;
}

/** The rider at a line tip: avatar circle plus a name/steps pill. */
export const AvatarNode: React.FC<AvatarNodeProps> = ({
  name,
  imageUrl,
  avatars,
  color,
  x,
  y,
  stepValue,
  scale,
  opacity,
  theme,
}) => {
  if (scale <= 0.001 || opacity <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - AVATAR_SIZE / 2,
        top: y - AVATAR_SIZE / 2,
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: `${AVATAR_SIZE / 2}px ${AVATAR_SIZE / 2}px`,
        zIndex: Math.round(2000 - y),
      }}
    >
      <AvatarCircle
        name={name}
        imageUrl={imageUrl}
        avatars={avatars}
        size={AVATAR_SIZE}
        ringColor={color}
        theme={theme}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          background: "rgba(10,9,16,0.62)",
          borderRadius: 12,
          padding: "6px 14px",
          maxWidth: 220,
        }}
      >
        <span
          style={{
            fontSize: 25,
            fontWeight: 600,
            color: theme.textHeadline,
            fontFamily: "'Space Grotesk', sans-serif",
            lineHeight: 1.15,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </span>
        <span
          style={{
            fontSize: 21,
            fontWeight: 600,
            color,
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 1.1,
          }}
        >
          {formatSteps(stepValue)}
        </span>
      </div>
    </div>
  );
};
