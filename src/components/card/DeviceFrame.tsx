import React from "react";
import type { MockupFrame } from "../../data/design/types";
import type { CardDesign } from "../../data/design/resolve";

interface DeviceFrameProps {
  frame: MockupFrame;
  s: number;
  design: CardDesign;
  children: React.ReactNode;
}

/**
 * Pure-CSS device chrome around a mockup image (no assets).
 * The caller positions/transforms the outer wrapper; drag handlers stay on
 * the img child so pointer interactions keep working inside the frame.
 */
export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  frame,
  s,
  design: d,
  children,
}) => {
  const glow = frame.glow ? (
    <div
      style={{
        position: "absolute",
        inset: -28 * s,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${d.mode === "light" ? "rgba(112,91,207,0.28)" : "rgba(112,91,207,0.4)"} 0%, transparent 68%)`,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  ) : null;

  if (frame.kind === "browser") {
    return (
      <div style={{ position: "relative" }}>
        {glow}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            borderRadius: 12 * s,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "#14121c",
            filter: d.mockupShadow,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6 * s,
              height: 26 * s,
              padding: `0 ${10 * s}px`,
              background: "#1c1a26",
            }}
          >
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <span
                key={c}
                style={{
                  width: 7 * s,
                  height: 7 * s,
                  borderRadius: "50%",
                  background: c,
                  flexShrink: 0,
                }}
              />
            ))}
            <span
              style={{
                flex: 1,
                height: 14 * s,
                marginLeft: 6 * s,
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 8.5 * s,
                color: "rgba(255,255,255,0.45)",
                letterSpacing: "0.05em",
              }}
            >
              joinheda.com
            </span>
          </div>
          {children}
        </div>
      </div>
    );
  }

  // phone
  return (
    <div style={{ position: "relative" }}>
      {glow}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          borderRadius: 30 * s,
          border: `${9 * s}px solid #1c1a26`,
          background: "#1c1a26",
          overflow: "hidden",
          filter: d.mockupShadow,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 7 * s,
            left: "50%",
            transform: "translateX(-50%)",
            width: 54 * s,
            height: 12 * s,
            borderRadius: 999,
            background: "#0a0a10",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
        <div style={{ borderRadius: 21 * s, overflow: "hidden" }}>{children}</div>
      </div>
    </div>
  );
};
