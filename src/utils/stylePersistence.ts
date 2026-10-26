import type { StyleMap } from "../data/design/types";
import type { LookStyle } from "../data/design/lookState";
import type { BumpReelConfig } from "../remotion/bumpChart/config";

const KEY = "heda.carousel.style.v1";
const CORRUPT_KEY = "heda.carousel.style.corrupt";
const VERSION = 1;

interface PersistedStyles {
  version: number;
  styles: StyleMap;
}

export function loadStyles(): StyleMap {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as PersistedStyles;
    if (!data || typeof data !== "object") return {};
    if (typeof data.version === "number" && data.version > VERSION) return {}; // newer schema
    if (!data.styles || typeof data.styles !== "object") return {};
    // Migration ladder would go here for version < VERSION.
    return data.styles;
  } catch {
    // Corrupt JSON — back it up and start fresh rather than crash.
    try {
      if (raw) localStorage.setItem(CORRUPT_KEY, raw);
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    return {};
  }
}

export function saveStyles(styles: StyleMap): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: VERSION, styles }));
  } catch {
    /* quota or unavailable */
  }
}

const LB_KEY = "heda.leaderboard.style.v1";

/** Persisted look for the leaderboard card (one entry, no per-slide overrides). */
export function loadLeaderboardStyle(): LookStyle {
  try {
    const raw = localStorage.getItem(LB_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as { version?: number; style?: LookStyle };
    if (!data || typeof data !== "object") return {};
    if (typeof data.version === "number" && data.version > VERSION) return {};
    return data.style && typeof data.style === "object" ? data.style : {};
  } catch {
    try {
      localStorage.removeItem(LB_KEY);
    } catch {
      /* ignore */
    }
    return {};
  }
}

export function saveLeaderboardStyle(style: LookStyle): void {
  try {
    localStorage.setItem(LB_KEY, JSON.stringify({ version: VERSION, style }));
  } catch {
    /* quota or unavailable */
  }
}

const VIDEO_KEY = "heda.leaderboard.video.v1";

/**
 * Persisted bump-reel settings. Returned partial and unvalidated: callers run
 * it through resolveBumpConfig, which drops anything stale or out of range.
 * The CTA is shared with the cards and lives in leaderboard state, not here.
 */
export function loadBumpVideoConfig(): Partial<BumpReelConfig> {
  try {
    const raw = localStorage.getItem(VIDEO_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as { version?: number; config?: Partial<BumpReelConfig> };
    if (!data || typeof data !== "object") return {};
    if (typeof data.version === "number" && data.version > VERSION) return {};
    return data.config && typeof data.config === "object" ? data.config : {};
  } catch {
    return {};
  }
}

export function saveBumpVideoConfig(config: BumpReelConfig): void {
  try {
    const rest: Partial<BumpReelConfig> = { ...config };
    delete rest.cta;
    localStorage.setItem(VIDEO_KEY, JSON.stringify({ version: VERSION, config: rest }));
  } catch {
    /* quota or unavailable */
  }
}
