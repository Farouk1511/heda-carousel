import React from "react";

export type AppSection = "carousel" | "leaderboard" | "marketing";

const SECTIONS: { id: AppSection; label: string }[] = [
  { id: "carousel", label: "Carousel" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "marketing", label: "Marketing" },
];

interface AppNavProps {
  section: AppSection;
  onChange: (section: AppSection) => void;
}

export const AppNav: React.FC<AppNavProps> = ({ section, onChange }) => (
  <div className="mode-switch">
    {SECTIONS.map((s) => (
      <button
        key={s.id}
        className={`mode-switch-btn${section === s.id ? " active" : ""}`}
        onClick={() => onChange(s.id)}
      >
        {s.label}
      </button>
    ))}
  </div>
);
