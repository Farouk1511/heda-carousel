import type { FrameGeometry, MockupDoc } from "../data/mockup/types";

const KEY = "heda.mockup.v1";
const CORRUPT_KEY = "heda.mockup.corrupt";
const ACTIVE_KEY = "heda.mockup.active.v1";
const VERSION = 1;

export interface PersistedMockupState {
  version: number;
  docs: MockupDoc[];
  /** Calibration belongs to the FRAME ASSET, not to a document — keyed by
   *  frame id at the top level so you calibrate once and every doc inherits
   *  it. */
  calibration: Record<string, FrameGeometry>;
}

/** Load persisted mockup state (refs only — media bytes live in IndexedDB). */
export function loadMockupState(): PersistedMockupState | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;
    if (typeof data.version === "number" && data.version > VERSION) return null; // newer schema
    if (!Array.isArray(data.docs)) return null;
    // Migration ladder would go here for version < VERSION.
    return {
      version: VERSION,
      docs: data.docs as MockupDoc[],
      calibration:
        data.calibration && typeof data.calibration === "object"
          ? (data.calibration as Record<string, FrameGeometry>)
          : {},
    };
  } catch {
    // Corrupt JSON — back it up and start fresh rather than crash.
    try {
      if (raw) localStorage.setItem(CORRUPT_KEY, raw);
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    return null;
  }
}

export function saveMockupState(
  state: Omit<PersistedMockupState, "version">
): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: VERSION, ...state }));
  } catch {
    /* quota or unavailable — non-fatal */
  }
}

/** Which doc was open last. Session state, kept out of the versioned schema. */
export function loadActiveDocId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

export function saveActiveDocId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_KEY, id);
  } catch {
    /* ignore */
  }
}
