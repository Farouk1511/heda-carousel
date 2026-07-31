import type { BrandKit, Campaign, Design } from "../data/marketing/types";

const KEY = "heda.marketing.v1";
const CORRUPT_KEY = "heda.marketing.corrupt";
const ACTIVE_KEY = "heda.marketing.active.v1";
const VERSION = 1;

export interface PersistedState {
  version: number;
  campaigns: Campaign[];
  brandKits: BrandKit[];
  designs: Design[];
}

/** Load persisted marketing state (refs only — no asset bytes). */
export function loadPersisted(): PersistedState | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;
    if (typeof data.version === "number" && data.version > VERSION) return null; // newer schema
    if (
      !Array.isArray(data.campaigns) ||
      !Array.isArray(data.designs) ||
      !Array.isArray(data.brandKits)
    ) {
      return null;
    }
    // Migration ladder would go here for version < VERSION.
    return data as PersistedState;
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

export function savePersisted(state: Omit<PersistedState, "version">): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: VERSION, ...state }));
  } catch {
    /* quota or unavailable — JSON backup is the durable path */
  }
}

/** Which campaign was open last. Kept apart from PersistedState so the
 *  schema (and its version) stays about content, not session state. */
export function loadActiveCampaignId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

export function saveActiveCampaignId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_KEY, id);
  } catch {
    /* ignore */
  }
}

// --- Self-contained JSON backup (includes asset data URLs) -----------------

export interface BackupFile {
  version: number;
  kind: "heda-marketing-campaign";
  campaign: Campaign;
  designs: Design[];
  brandKit: BrandKit;
  assets: Record<string, string>;
}

export function buildBackup(
  campaign: Campaign,
  allDesigns: Design[],
  brandKit: BrandKit,
  assets: Record<string, string>
): BackupFile {
  const campaignDesigns = allDesigns.filter((d) =>
    campaign.designIds.includes(d.id)
  );
  const usedAssetIds = new Set<string>();
  if (brandKit.logoAssetId) usedAssetIds.add(brandKit.logoAssetId);
  for (const d of campaignDesigns) {
    for (const el of d.elements) {
      if (el.type === "image" && el.assetId) usedAssetIds.add(el.assetId);
    }
  }
  const assetSubset: Record<string, string> = {};
  usedAssetIds.forEach((id) => {
    if (assets[id]) assetSubset[id] = assets[id];
  });
  return {
    version: VERSION,
    kind: "heda-marketing-campaign",
    campaign,
    designs: campaignDesigns,
    brandKit,
    assets: assetSubset,
  };
}

export function downloadBackup(backup: BackupFile): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${backup.campaign.name.replace(/[^a-z0-9]+/gi, "_").toLowerCase() || "campaign"}_backup.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function isBackup(data: unknown): data is BackupFile {
  const d = data as BackupFile | null;
  return Boolean(
    d &&
      d.kind === "heda-marketing-campaign" &&
      d.campaign &&
      Array.isArray(d.designs) &&
      d.brandKit
  );
}

/** Several campaigns in one file — each entry is a plain BackupFile. */
export interface BundleFile {
  version: number;
  kind: "heda-marketing-bundle";
  backups: BackupFile[];
}

/**
 * Accepts either format and returns the campaigns to import, in file order.
 * Single-campaign backups stay valid, so older exports keep working.
 */
export function parseBackupOrBundle(text: string): BackupFile[] | null {
  try {
    const data = JSON.parse(text);
    if (isBackup(data)) return [data];
    if (
      data?.kind === "heda-marketing-bundle" &&
      Array.isArray(data.backups) &&
      data.backups.length > 0 &&
      data.backups.every(isBackup)
    ) {
      return data.backups as BackupFile[];
    }
  } catch {
    /* not a valid backup or bundle */
  }
  return null;
}
