import React, { useRef } from "react";
import type { MarketingState } from "../../hooks/useMarketingState";
import type { BrandKit } from "../../data/marketing/types";

interface MarketingSidebarProps {
  state: MarketingState;
  onNewDesign: () => void;
}

const FONT_OPTIONS = [
  { label: "Space Grotesk", value: "'Space Grotesk', sans-serif" },
  { label: "DM Sans", value: "'DM Sans', sans-serif" },
  { label: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
];

const COLOR_SLOTS: { slot: keyof BrandKit["colors"]; label: string }[] = [
  { slot: "accent", label: "Accent" },
  { slot: "accentLight", label: "Accent Light" },
  { slot: "bg", label: "Background" },
  { slot: "text", label: "Text" },
  { slot: "highlight", label: "Highlight" },
];

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const MarketingSidebar: React.FC<MarketingSidebarProps> = ({
  state,
  onNewDesign,
}) => {
  const { activeCampaign, campaigns, designs, brand } = state;
  const logoRef = useRef<HTMLInputElement>(null);
  const backupRef = useRef<HTMLInputElement>(null);

  const campaignDesigns = designs.filter((d) =>
    activeCampaign?.designIds.includes(d.id)
  );

  const onLogoPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) state.setBrandLogo(await readFileAsDataURL(file));
    e.target.value = "";
  };

  const onBackupPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const text = await file.text();
      if (!state.importBackupFile(text)) {
        // eslint-disable-next-line no-alert
        alert("Not a valid Heda marketing backup file.");
      }
    }
    e.target.value = "";
  };

  return (
    <div className="sidebar-left mk-sidebar">
      <div className="sidebar-inner">
        <div className="logo">MARKETING</div>
        <div className="logo-sub">campaign studio</div>

        <div className="section-label" style={{ marginTop: 22 }}>
          CAMPAIGN
        </div>
        {campaigns.length > 1 ? (
          <select
            className="mk-select"
            value={activeCampaign?.id ?? ""}
            onChange={(e) => state.selectCampaign(e.target.value)}
          >
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="mk-campaign-name">{activeCampaign?.name ?? "Campaign"}</div>
        )}
        <button className="mk-add-btn mk-new-design" onClick={onNewDesign}>
          + New Design
        </button>
        <div className="mk-design-list">
          {campaignDesigns.map((d) => (
            <div
              key={d.id}
              className={`mk-design-item${
                d.id === state.activeDesignId ? " active" : ""
              }`}
              onClick={() => state.selectDesign(d.id)}
            >
              <span className="mk-design-name">{d.name}</span>
              {campaignDesigns.length > 1 && (
                <button
                  className="mk-design-del"
                  title="Delete design"
                  onClick={(e) => {
                    e.stopPropagation();
                    state.deleteDesign(d.id);
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {/* BRAND KIT */}
        <div className="section-label" style={{ marginTop: 26 }}>
          BRAND KIT
        </div>
        <input
          ref={logoRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          style={{ display: "none" }}
          onChange={onLogoPick}
        />
        {COLOR_SLOTS.map(({ slot, label }) => (
          <div key={slot} className="mk-brand-color">
            <input
              type="color"
              className="mk-color-input"
              value={brand.colors[slot]}
              onChange={(e) => state.setBrandColor(slot, e.target.value)}
            />
            <span className="mk-brand-color-label">{label}</span>
            <input
              className="mk-hex mk-brand-hex"
              value={brand.colors[slot]}
              spellCheck={false}
              onChange={(e) => state.setBrandColor(slot, e.target.value)}
            />
          </div>
        ))}

        <label className="edit-label" style={{ marginTop: 14 }}>
          DISPLAY FONT
        </label>
        <FontSelect
          value={brand.fonts.display}
          onChange={(v) => state.setBrandFont("display", v)}
        />
        <label className="edit-label" style={{ marginTop: 8 }}>
          BODY FONT
        </label>
        <FontSelect
          value={brand.fonts.body}
          onChange={(v) => state.setBrandFont("body", v)}
        />

        <label className="edit-label" style={{ marginTop: 8 }}>
          LOGO
        </label>
        <button className="mk-add-btn" onClick={() => logoRef.current?.click()}>
          Upload logo
        </button>

        {/* BACKUP */}
        <div className="section-label" style={{ marginTop: 26 }}>
          BACKUP
        </div>
        <input
          ref={backupRef}
          type="file"
          accept="application/json,.json"
          style={{ display: "none" }}
          onChange={onBackupPick}
        />
        <button className="mk-add-btn mk-new-design" onClick={state.backupActiveCampaign}>
          ↓ Backup campaign (JSON)
        </button>
        <button className="mk-add-btn" onClick={() => backupRef.current?.click()}>
          ↑ Import backup
        </button>
      </div>
    </div>
  );
};

const FontSelect: React.FC<{ value: string; onChange: (v: string) => void }> = ({
  value,
  onChange,
}) => (
  <select
    className="mk-select"
    value={value}
    onChange={(e) => onChange(e.target.value)}
  >
    {FONT_OPTIONS.map((f) => (
      <option key={f.value} value={f.value}>
        {f.label}
      </option>
    ))}
  </select>
);
