import React from "react";
import type { ThemeName } from "../data/themes";
import { THEMES } from "../data/themes";
import type { AspectRatio } from "../hooks/useCarouselState";
import type { LeaderboardData, LeaderboardEntry } from "../data/leaderboard/types";
import { formatSteps } from "../data/leaderboard/parse";
import { paginateLeaderboard } from "../data/leaderboard/pagination";
import { initials, type AvatarMap } from "../data/leaderboard/avatars";

function getAspectRatioCSS(ratio: AspectRatio): string {
  switch (ratio) {
    case "1:1":
      return "1 / 1";
    case "9:16":
      return "9 / 16";
    case "4:5":
    default:
      return "4 / 5";
  }
}

interface LeaderboardCardProps {
  data: LeaderboardData;
  theme: ThemeName;
  width?: number;
  height?: number;
  className?: string;
  logoSrc?: string;
  logoScale?: number;
  aspectRatio?: AspectRatio;
  cta?: string;
  pageIndex?: number;
  avatars?: AvatarMap;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  data,
  theme,
  width,
  height,
  className,
  logoSrc = "/LOGO.png",
  logoScale = 1,
  aspectRatio = "4:5",
  cta,
  pageIndex = 0,
  avatars = {},
}) => {
  const t = THEMES[theme];
  // Same scale factor as Card.tsx so on-screen (max 400px) and export (1080px)
  // render identically.
  const s = width ? width / 400 : 1;

  // The 1:1 square is the shortest card, so compact the spotlight + spacing so
  // the rows never collide with the footer.
  const tight = aspectRatio === "1:1";
  const cardPad = (tight ? 24 : 32) * s;
  const mainGap = (tight ? 12 : 18) * s;
  const mainPadTop = (tight ? 12 : 18) * s;
  const spotPadV = (tight ? 12 : 16) * s;
  const spotPadH = (tight ? 15 : 18) * s;
  const spotAvatar = (tight ? 42 : 50) * s;
  const spotName = (tight ? 18 : 20) * s;
  const footerMarginTop = (tight ? 10 : 16) * s;

  const entries = data.leaderboard;
  const leader = entries[0];
  const maxSteps = entries.reduce((m, e) => Math.max(m, e.steps), 1);

  const pages = paginateLeaderboard(entries, aspectRatio);
  const page = pages[Math.min(Math.max(pageIndex, 0), pages.length - 1)] ?? {
    entries,
    isPrimary: true,
    pageIndex: 0,
    pageCount: 1,
  };
  const showSpotlight = page.isPrimary && !!leader;
  // On the primary page the leader is celebrated in the spotlight, so list the
  // rest below; continuation pages list their whole chunk.
  const rows = showSpotlight ? page.entries.slice(1) : page.entries;

  const labelLength = data.week.label.length;
  let weekLabelSize = 27;
  if (labelLength > 34) weekLabelSize = 20;
  else if (labelLength > 26) weekLabelSize = 23;
  else if (labelLength > 20) weekLabelSize = 25;

  const dense = rows.length > 6;
  const rowNameSize = (dense ? 14 : 15) * s;
  const rowStepSize = (dense ? 14 : 15.5) * s;
  const avatarSize = (dense ? 26 : 30) * s;

  const border =
    theme === "deep"
      ? "1px solid rgba(112,91,207,0.2)"
      : "1px solid rgba(112,91,207,0.15)";

  const cardStyle: React.CSSProperties = {
    width: width ?? "100%",
    maxWidth: width ? undefined : 400,
    height: height ?? undefined,
    aspectRatio: width ? undefined : getAspectRatioCSS(aspectRatio),
    borderRadius: width ? 0 : 16,
    padding: `${cardPad}px ${28 * s}px`,
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
    background: t.bgCard,
    border,
    color: t.text,
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box",
  };

  const orbStyle: React.CSSProperties = {
    position: "absolute",
    top: -40 * s,
    right: -40 * s,
    width: 140 * s,
    height: 140 * s,
    borderRadius: "50%",
    pointerEvents: "none",
    background: t.orbGradient,
  };

  // Circular avatar (data URL) or an initials chip when no/failed image.
  const renderAvatar = (
    entry: LeaderboardEntry,
    size: number,
    fontSize: number
  ) => {
    const dataUrl = entry.imageUrl ? avatars[entry.imageUrl] : "";
    if (dataUrl) {
      return (
        <img
          src={dataUrl}
          alt={entry.name}
          draggable={false}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            objectFit: "cover",
            flexShrink: 0,
            display: "block",
          }}
        />
      );
    }
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(112,91,207,0.18)",
          border: "1px solid rgba(112,91,207,0.28)",
          color: t.accentLight,
          fontSize,
          fontWeight: 700,
          fontFamily: "'Space Grotesk', sans-serif",
          letterSpacing: "0.02em",
        }}
      >
        {initials(entry.name)}
      </div>
    );
  };

  const logo = (
    <img
      src={logoSrc}
      alt="Heda"
      style={{
        position: "absolute",
        top: 16 * s,
        right: 16 * s,
        width: 32 * s * logoScale,
        height: 32 * s * logoScale,
        objectFit: "contain",
        pointerEvents: "none",
        zIndex: 3,
        opacity: 0.9,
      }}
    />
  );

  const header = (
    <div style={{ position: "relative", zIndex: 2 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10 * s,
          marginBottom: 8 * s,
        }}
      >
        <span
          style={{
            fontSize: 11 * s,
            letterSpacing: "0.18em",
            fontWeight: 600,
            color: t.accent,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          WEEKLY LEADERBOARD
        </span>
        {page.pageCount > 1 && (
          <span
            style={{
              fontSize: 9 * s,
              letterSpacing: "0.1em",
              fontWeight: 600,
              color: t.accentLight,
              fontFamily: "'JetBrains Mono', monospace",
              padding: `${2 * s}px ${7 * s}px`,
              borderRadius: 20 * s,
              border: "1px solid rgba(112,91,207,0.3)",
            }}
          >
            PART {page.pageIndex + 1}/{page.pageCount}
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: weekLabelSize * s,
          fontWeight: 800,
          lineHeight: 1.1,
          color: t.textHeadline,
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {data.week.label}
      </div>
    </div>
  );

  const spotlight = showSpotlight && (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14 * s,
        background: t.bgCardCta,
        borderRadius: 14 * s,
        padding: `${spotPadV}px ${spotPadH}px`,
        boxShadow:
          theme === "deep"
            ? "0 14px 30px rgba(0,0,0,0.35)"
            : "0 16px 34px rgba(112,91,207,0.28)",
        position: "relative",
        zIndex: 2,
      }}
    >
      <div style={{ position: "relative", width: spotAvatar, height: spotAvatar, flexShrink: 0 }}>
        {leader.imageUrl && avatars[leader.imageUrl] ? (
          <img
            src={avatars[leader.imageUrl]}
            alt={leader.name}
            draggable={false}
            style={{
              width: spotAvatar,
              height: spotAvatar,
              borderRadius: "50%",
              objectFit: "cover",
              border: `${2 * s}px solid rgba(255,255,255,0.5)`,
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: spotAvatar,
              height: spotAvatar,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24 * s,
            }}
          >
            🏆
          </div>
        )}
        <div
          style={{
            position: "absolute",
            bottom: -3 * s,
            right: -3 * s,
            width: 22 * s,
            height: 22 * s,
            borderRadius: "50%",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12 * s,
            boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
          }}
        >
          🏆
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 10 * s,
            letterSpacing: "0.16em",
            fontWeight: 600,
            color: "rgba(255,255,255,0.85)",
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: 3 * s,
          }}
        >
          WINNER
        </div>
        <div
          style={{
            fontSize: spotName,
            fontWeight: 700,
            color: "#fff",
            fontFamily: "'Space Grotesk', sans-serif",
            lineHeight: 1.1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {leader.name}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 * s }}>
        <div
          style={{
            fontSize: 22 * s,
            fontWeight: 700,
            color: "#fff",
            fontFamily: "'Space Grotesk', sans-serif",
            lineHeight: 1,
          }}
        >
          {formatSteps(leader.steps)}
        </div>
        <div
          style={{
            fontSize: 10 * s,
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.8)",
            fontFamily: "'JetBrains Mono', monospace",
            marginTop: 4 * s,
          }}
        >
          STEPS
        </div>
      </div>
    </div>
  );

  const rowsList = (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-evenly",
        minHeight: 0,
        position: "relative",
        zIndex: 2,
        paddingTop: 4 * s,
      }}
    >
      {rows.map((entry) => {
        const pct = Math.max(6, Math.round((entry.steps / maxSteps) * 100));
        return (
          <div
            key={`${entry.rank}-${entry.name}`}
            style={{ display: "flex", alignItems: "center", gap: 10 * s }}
          >
            <span
              style={{
                width: 18 * s,
                flexShrink: 0,
                textAlign: "right",
                fontSize: 12 * s,
                fontWeight: 600,
                color: t.accentLight,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {entry.rank}
            </span>
            {renderAvatar(entry, avatarSize, (dense ? 10 : 11) * s)}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 10 * s,
                  marginBottom: 6 * s,
                }}
              >
                <span
                  style={{
                    fontSize: rowNameSize,
                    fontWeight: 600,
                    color: t.textHeadline,
                    fontFamily: "'Space Grotesk', sans-serif",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {entry.name}
                </span>
                <span
                  style={{
                    fontSize: rowStepSize,
                    fontWeight: 600,
                    color: t.accentLight,
                    fontFamily: "'Space Grotesk', sans-serif",
                    flexShrink: 0,
                  }}
                >
                  {formatSteps(entry.steps)}
                </span>
              </div>
              <div
                style={{
                  height: 5 * s,
                  borderRadius: 3 * s,
                  background: "rgba(112,91,207,0.12)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    borderRadius: 3 * s,
                    background:
                      "linear-gradient(90deg, #705bcf 0%, #8b7ad8 100%)",
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const footer = (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: footerMarginTop,
        position: "relative",
        zIndex: 2,
      }}
    >
      <div
        style={{
          fontSize: 12 * s,
          fontWeight: 600,
          letterSpacing: "0.05em",
          fontFamily: "'JetBrains Mono', monospace",
          opacity: 0.5,
        }}
      >
        @joinheda
      </div>
      {cta && cta.trim() && (
        <div
          style={{
            fontSize: 13 * s,
            fontWeight: 700,
            color: t.accentLight,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {cta}
        </div>
      )}
    </div>
  );

  return (
    <div style={cardStyle} className={className}>
      {logo}
      <div style={orbStyle} />
      {header}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: mainGap,
          minHeight: 0,
          paddingTop: mainPadTop,
          paddingBottom: 6 * s,
        }}
      >
        {spotlight}
        {rowsList}
      </div>
      {footer}
    </div>
  );
};
