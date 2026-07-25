import type { StyleMap } from "../data/design/types";

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
