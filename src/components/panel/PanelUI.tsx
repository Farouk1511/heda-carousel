// Small building blocks for the right-hand inspector panels.
import React, { useState } from "react";

function readFlag(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v === "1";
  } catch {
    return fallback;
  }
}

function writeFlag(key: string, value: boolean) {
  try {
    localStorage.setItem(key, value ? "1" : "0");
  } catch {
    /* per-viewer convenience only */
  }
}

/** Collapsible section. Open/closed is remembered per `id`. */
export const PanelSection: React.FC<{
  id: string;
  title: string;
  /** Small text or control shown at the right of the header */
  aside?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ id, title, aside, defaultOpen = true, children }) => {
  const key = `heda.panel.section.${id}`;
  const [open, setOpen] = useState(() => readFlag(key, defaultOpen));
  const toggle = () => {
    setOpen((o) => {
      writeFlag(key, !o);
      return !o;
    });
  };
  return (
    <section className={`ps${open ? " open" : ""}`}>
      <div className="ps-head">
        <button type="button" className="ps-toggle" onClick={toggle} aria-expanded={open}>
          <span className="ps-caret">▸</span>
          {title}
        </button>
        {aside && <div className="ps-aside">{aside}</div>}
      </div>
      {open && <div className="ps-body">{children}</div>}
    </section>
  );
};

/** Label + switch row for boolean settings. */
export const ToggleRow: React.FC<{
  label: string;
  hint?: string;
  on: boolean;
  onChange: () => void;
}> = ({ label, hint, on, onChange }) => (
  <button type="button" className="tg-row" role="switch" aria-checked={on} onClick={onChange}>
    <span className="tg-text">
      <span className="tg-label">{label}</span>
      {hint && <span className="tg-hint">{hint}</span>}
    </span>
    <span className={`tg-switch${on ? " on" : ""}`}>
      <span className="tg-knob" />
    </span>
  </button>
);

/** Pill-style single choice. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  wrap,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  /** Wrap onto several rows instead of squeezing into one */
  wrap?: boolean;
}) {
  return (
    <div className={`seg${wrap ? " seg--wrap" : ""}`}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`seg-btn${o.value === value ? " active" : ""}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** − value + stepper with an optional reset. */
export const Stepper: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  onReset?: () => void;
}> = ({ label, value, min, max, step = 0.1, onChange, onReset }) => {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, Number(v.toFixed(2)))));
  return (
    <div className="st-row">
      <span className="st-label">{label}</span>
      <div className="st-ctrl">
        <button type="button" className="st-btn" disabled={value <= min} onClick={() => set(value - step)}>
          −
        </button>
        <span className="st-value">{Math.round(value * 100)}%</span>
        <button type="button" className="st-btn" disabled={value >= max} onClick={() => set(value + step)}>
          +
        </button>
        {onReset && (
          <button type="button" className="st-reset" title="Reset" onClick={onReset}>
            ↺
          </button>
        )}
      </div>
    </div>
  );
};

export const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="pf-label">{children}</div>
);
