import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  BrandKit,
  Campaign,
  CanvasElement,
  Design,
  DesignSize,
  ElementOverride,
  ImageElement,
  ShapeElement,
  TextElement,
} from "../data/marketing/types";
import {
  DEFAULT_BRAND_KIT,
  LOGO_ASSET_ID,
  defaultSizes,
  makeSeedCampaign,
  makeSeedDesign,
  newId,
} from "../data/marketing/defaults";
import {
  instantiateTemplate,
  type MarketingTemplate,
} from "../data/marketing/templates";
import { getAllAssets, putAsset } from "../utils/assetStore";
import {
  buildBackup,
  downloadBackup,
  loadActiveCampaignId,
  loadPersisted,
  parseBackupOrBundle,
  savePersisted,
  saveActiveCampaignId,
} from "../utils/marketingPersistence";

/** Any subset of element fields across the three element kinds. */
type AnyElementPatch =
  | Partial<TextElement>
  | Partial<ImageElement>
  | Partial<ShapeElement>;

export function useMarketingState() {
  const persisted = useMemo(() => loadPersisted(), []);

  const [brandKits, setBrandKits] = useState<BrandKit[]>(
    () => persisted?.brandKits ?? [DEFAULT_BRAND_KIT]
  );
  const [designs, setDesigns] = useState<Design[]>(
    () => persisted?.designs ?? [makeSeedDesign()]
  );
  const [campaigns, setCampaigns] = useState<Campaign[]>(
    () => persisted?.campaigns ?? [makeSeedCampaign("design-seed")]
  );
  /** assetId -> resolved data URL (bytes persisted in IndexedDB via assetStore). */
  const [assets, setAssets] = useState<Record<string, string>>({});

  const initialCampaign = useMemo(() => {
    if (!persisted) return undefined;
    const lastId = loadActiveCampaignId();
    return (
      persisted.campaigns.find((c) => c.id === lastId) ?? persisted.campaigns[0]
    );
  }, [persisted]);
  const initialDesignId = initialCampaign?.designIds[0] ?? "design-seed";
  const initialDesign =
    persisted?.designs.find((d) => d.id === initialDesignId) ?? undefined;

  const [activeCampaignId, setActiveCampaignId] = useState<string>(
    initialCampaign?.id ?? "campaign-seed"
  );
  const [activeDesignId, setActiveDesignId] = useState<string>(initialDesignId);
  const [activeSizeId, setActiveSizeId] = useState<string>(
    initialDesign?.sizes[0]?.id ?? "ig-square"
  );
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Load persisted asset bytes from IndexedDB on mount.
  useEffect(() => {
    let cancelled = false;
    getAllAssets().then((stored) => {
      if (!cancelled && Object.keys(stored).length) {
        setAssets((a) => ({ ...stored, ...a }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced persist of refs-only state (no asset bytes) to localStorage.
  useEffect(() => {
    const t = setTimeout(() => savePersisted({ campaigns, brandKits, designs }), 500);
    return () => clearTimeout(t);
  }, [campaigns, brandKits, designs]);

  useEffect(() => {
    saveActiveCampaignId(activeCampaignId);
  }, [activeCampaignId]);

  // Seed the brand logo asset from /LOGO.png on first mount.
  useEffect(() => {
    let cancelled = false;
    fetch("/LOGO.png")
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error("no logo"))))
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      )
      .then((url) => {
        if (!cancelled) setAssets((a) => ({ ...a, [LOGO_ASSET_ID]: url }));
      })
      .catch(() => {
        /* logo optional */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeCampaign =
    campaigns.find((c) => c.id === activeCampaignId) ?? campaigns[0];
  const activeDesign = designs.find((d) => d.id === activeDesignId) ?? designs[0];
  const brand =
    brandKits.find((b) => b.id === activeCampaign?.brandKitId) ?? brandKits[0];

  const activeSize = useMemo(() => {
    if (!activeDesign) return undefined;
    return (
      activeDesign.sizes.find((s) => s.id === activeSizeId) ?? activeDesign.sizes[0]
    );
  }, [activeDesign, activeSizeId]);

  /** True when the working size is NOT the design's primary (base) size. */
  const isOverrideSize = Boolean(
    activeDesign && activeSize && activeDesign.sizes[0]?.id !== activeSize.id
  );

  const selectedElement =
    activeDesign?.elements.find((e) => e.id === selectedElementId) ?? null;

  const updateDesign = useCallback(
    (designId: string, updater: (d: Design) => Design) => {
      setDesigns((ds) => ds.map((d) => (d.id === designId ? updater(d) : d)));
    },
    []
  );

  const updateElement = useCallback(
    (elId: string, updater: (e: CanvasElement) => CanvasElement) => {
      if (!activeDesign) return;
      updateDesign(activeDesign.id, (d) => ({
        ...d,
        elements: d.elements.map((e) => (e.id === elId ? updater(e) : e)),
      }));
    },
    [activeDesign, updateDesign]
  );

  /** Patch base-only fields (text content, colors, alignment, shape height…). */
  const patchElementBase = useCallback(
    (elId: string, patch: AnyElementPatch) => {
      updateElement(elId, (e) => ({ ...e, ...patch } as CanvasElement));
    },
    [updateElement]
  );

  /**
   * Patch layout fields (fx, fy, w, fontSize, rotation, hidden). Routes to the
   * active size's override when viewing a non-primary size, else to the base.
   */
  const patchElementLayout = useCallback(
    (elId: string, patch: ElementOverride) => {
      if (!activeSize) return;
      const sizeId = activeSize.id;
      updateElement(elId, (e) => {
        if (!isOverrideSize) {
          return { ...e, ...patch } as CanvasElement;
        }
        const prev = e.overrides[sizeId] ?? {};
        return {
          ...e,
          overrides: { ...e.overrides, [sizeId]: { ...prev, ...patch } },
        };
      });
    },
    [activeSize, isOverrideSize, updateElement]
  );

  /** Toggle per-size visibility (always writes to the active size's override). */
  const setHiddenOnSize = useCallback(
    (elId: string, hidden: boolean) => {
      if (!activeSize) return;
      const sizeId = activeSize.id;
      updateElement(elId, (e) => {
        const prev = e.overrides[sizeId] ?? {};
        const next = { ...prev };
        if (hidden) next.hidden = true;
        else delete next.hidden;
        const overrides = { ...e.overrides };
        if (Object.keys(next).length === 0) delete overrides[sizeId];
        else overrides[sizeId] = next;
        return { ...e, overrides };
      });
    },
    [activeSize, updateElement]
  );

  /** Whether the given element has any override for the active size. */
  const hasOverrideForActiveSize = useCallback(
    (elId: string): boolean => {
      if (!activeSize || !activeDesign) return false;
      const el = activeDesign.elements.find((e) => e.id === elId);
      return Boolean(el && el.overrides[activeSize.id]);
    },
    [activeSize, activeDesign]
  );

  /** Clear a single override field (or the whole override) for the active size. */
  const resetOverride = useCallback(
    (elId: string, field?: keyof ElementOverride) => {
      if (!activeSize) return;
      const sizeId = activeSize.id;
      updateElement(elId, (e) => {
        const prev = e.overrides[sizeId];
        if (!prev) return e;
        if (!field) {
          const { [sizeId]: _drop, ...rest } = e.overrides;
          return { ...e, overrides: rest };
        }
        const next = { ...prev };
        delete next[field];
        const overrides = { ...e.overrides };
        if (Object.keys(next).length === 0) delete overrides[sizeId];
        else overrides[sizeId] = next;
        return { ...e, overrides };
      });
    },
    [activeSize, updateElement]
  );

  const addElement = useCallback(
    (element: CanvasElement) => {
      if (!activeDesign) return;
      updateDesign(activeDesign.id, (d) => ({
        ...d,
        elements: [...d.elements, element],
      }));
      setSelectedElementId(element.id);
    },
    [activeDesign, updateDesign]
  );

  const removeElement = useCallback(
    (elId: string) => {
      if (!activeDesign) return;
      updateDesign(activeDesign.id, (d) => ({
        ...d,
        elements: d.elements.filter((e) => e.id !== elId),
      }));
      setSelectedElementId((cur) => (cur === elId ? null : cur));
    },
    [activeDesign, updateDesign]
  );

  /** Move element in z-order. dir -1 = backward, +1 = forward. */
  const moveElementZ = useCallback(
    (elId: string, dir: -1 | 1) => {
      if (!activeDesign) return;
      updateDesign(activeDesign.id, (d) => {
        const idx = d.elements.findIndex((e) => e.id === elId);
        if (idx === -1) return d;
        const target = idx + dir;
        if (target < 0 || target >= d.elements.length) return d;
        const next = [...d.elements];
        const [moved] = next.splice(idx, 1);
        next.splice(target, 0, moved);
        return { ...d, elements: next };
      });
    },
    [activeDesign, updateDesign]
  );

  const setDesignBackground = useCallback(
    (background: Design["background"]) => {
      if (!activeDesign) return;
      updateDesign(activeDesign.id, (d) => ({ ...d, background }));
    },
    [activeDesign, updateDesign]
  );

  const renameDesign = useCallback(
    (name: string) => {
      if (!activeDesign) return;
      updateDesign(activeDesign.id, (d) => ({ ...d, name }));
    },
    [activeDesign, updateDesign]
  );

  const addSizeToDesign = useCallback(
    (size: DesignSize) => {
      if (!activeDesign) return;
      updateDesign(activeDesign.id, (d) =>
        d.sizes.some((s) => s.id === size.id)
          ? d
          : { ...d, sizes: [...d.sizes, size] }
      );
      setActiveSizeId(size.id);
    },
    [activeDesign, updateDesign]
  );

  const removeSizeFromDesign = useCallback(
    (sizeId: string) => {
      if (!activeDesign || activeDesign.sizes.length <= 1) return;
      updateDesign(activeDesign.id, (d) => {
        const sizes = d.sizes.filter((s) => s.id !== sizeId);
        // Also drop any per-size overrides keyed to the removed size.
        const elements = d.elements.map((e) => {
          if (!e.overrides[sizeId]) return e;
          const overrides = { ...e.overrides };
          delete overrides[sizeId];
          return { ...e, overrides };
        });
        return { ...d, sizes, elements };
      });
      setActiveSizeId((cur) =>
        cur === sizeId ? activeDesign.sizes.find((s) => s.id !== sizeId)!.id : cur
      );
    },
    [activeDesign, updateDesign]
  );

  const registerAsset = useCallback((id: string, url: string) => {
    setAssets((a) => ({ ...a, [id]: url }));
    void putAsset(id, url);
  }, []);

  // --- Design management ---------------------------------------------------

  const addDesign = useCallback(
    (design: Design) => {
      setDesigns((ds) => [...ds, design]);
      setCampaigns((cs) =>
        cs.map((c) =>
          c.id === activeCampaignId
            ? { ...c, designIds: [...c.designIds, design.id], updatedAt: new Date().toISOString() }
            : c
        )
      );
      setActiveDesignId(design.id);
      setActiveSizeId(design.sizes[0]?.id ?? "ig-square");
      setSelectedElementId(null);
    },
    [activeCampaignId]
  );

  const addDesignFromTemplate = useCallback(
    (template: MarketingTemplate, sizes?: DesignSize[]) => {
      const design = instantiateTemplate(
        template,
        template.name,
        sizes ?? defaultSizes(),
        { logoAssetId: brand?.logoAssetId }
      );
      addDesign(design);
      return design;
    },
    [addDesign, brand]
  );

  const deleteDesign = useCallback(
    (designId: string) => {
      setDesigns((ds) => {
        const remaining = ds.filter((d) => d.id !== designId);
        setActiveDesignId((cur) =>
          cur === designId ? remaining[0]?.id ?? "" : cur
        );
        return remaining;
      });
      setCampaigns((cs) =>
        cs.map((c) => ({
          ...c,
          designIds: c.designIds.filter((id) => id !== designId),
        }))
      );
    },
    []
  );

  const selectDesign = useCallback((designId: string) => {
    setActiveDesignId(designId);
    setSelectedElementId(null);
  }, []);

  /** Switch campaigns, landing on that campaign's first design. */
  const selectCampaign = useCallback(
    (campaignId: string) => {
      const campaign = campaigns.find((c) => c.id === campaignId);
      if (!campaign) return;
      const designId = campaign.designIds[0] ?? "";
      setActiveCampaignId(campaignId);
      setActiveDesignId(designId);
      setActiveSizeId(
        designs.find((d) => d.id === designId)?.sizes[0]?.id ?? "ig-square"
      );
      setSelectedElementId(null);
    },
    [campaigns, designs]
  );

  // --- Brand kit -----------------------------------------------------------

  const updateBrand = useCallback(
    (updater: (b: BrandKit) => BrandKit) => {
      if (!brand) return;
      setBrandKits((ks) => ks.map((k) => (k.id === brand.id ? updater(k) : k)));
    },
    [brand]
  );

  const setBrandColor = useCallback(
    (slot: keyof BrandKit["colors"], value: string) => {
      updateBrand((b) => ({ ...b, colors: { ...b.colors, [slot]: value } }));
    },
    [updateBrand]
  );

  const setBrandPalette = useCallback(
    (palette: string[]) => {
      updateBrand((b) => ({ ...b, colors: { ...b.colors, palette } }));
    },
    [updateBrand]
  );

  const setBrandFont = useCallback(
    (slot: keyof BrandKit["fonts"], value: string) => {
      updateBrand((b) => ({ ...b, fonts: { ...b.fonts, [slot]: value } }));
    },
    [updateBrand]
  );

  const setBrandLogo = useCallback(
    (url: string) => {
      const id = newId("asset");
      registerAsset(id, url);
      updateBrand((b) => ({ ...b, logoAssetId: id }));
    },
    [registerAsset, updateBrand]
  );

  // --- Backup / import -----------------------------------------------------

  const backupActiveCampaign = useCallback(() => {
    if (!activeCampaign || !brand) return;
    downloadBackup(buildBackup(activeCampaign, designs, brand, assets));
  }, [activeCampaign, brand, designs, assets]);

  const importBackupFile = useCallback(
    (text: string): boolean => {
      const backups = parseBackupOrBundle(text);
      if (!backups) return false;

      const addedDesigns: Design[] = [];
      const addedCampaigns: Campaign[] = [];
      const addedKits: BrandKit[] = [];

      for (const backup of backups) {
        // Re-register assets (keep ids — same bytes on collision).
        Object.entries(backup.assets ?? {}).forEach(([id, url]) =>
          registerAsset(id, url)
        );
        // Remap design + campaign ids to fresh ones so imports always add as new
        // entities (fixed seed ids like "design-seed" would otherwise collide).
        const idMap = new Map<string, string>();
        for (const d of backup.designs) {
          const nid = newId("design");
          idMap.set(d.id, nid);
          addedDesigns.push({ ...d, id: nid });
        }
        addedCampaigns.push({
          ...backup.campaign,
          id: newId("campaign"),
          designIds: backup.campaign.designIds
            .map((id) => idMap.get(id))
            .filter((id): id is string => Boolean(id)),
          updatedAt: new Date().toISOString(),
        });
        addedKits.push(backup.brandKit);
      }

      // A kit whose id already exists wins, so a bundle shipping "brand-default"
      // adopts the user's live Heda colors instead of overwriting them.
      setBrandKits((ks) => {
        const merged = [...ks];
        for (const kit of addedKits) {
          if (!merged.some((k) => k.id === kit.id)) merged.push(kit);
        }
        return merged;
      });
      setDesigns((ds) => [...ds, ...addedDesigns]);
      setCampaigns((cs) => [...cs, ...addedCampaigns]);

      const first = addedCampaigns[0];
      if (first) {
        const designId = first.designIds[0] ?? "";
        setActiveCampaignId(first.id);
        setActiveDesignId(designId);
        setActiveSizeId(
          addedDesigns.find((d) => d.id === designId)?.sizes[0]?.id ?? "ig-square"
        );
        setSelectedElementId(null);
      }
      return true;
    },
    [registerAsset]
  );

  return {
    // collections
    brandKits,
    setBrandKits,
    designs,
    setDesigns,
    campaigns,
    setCampaigns,
    assets,
    registerAsset,
    // active selection
    activeCampaign,
    activeCampaignId,
    setActiveCampaignId,
    selectCampaign,
    activeDesign,
    activeDesignId,
    setActiveDesignId,
    brand,
    activeSize,
    activeSizeId,
    setActiveSizeId,
    isOverrideSize,
    selectedElementId,
    setSelectedElementId,
    selectedElement,
    // mutations
    patchElementBase,
    patchElementLayout,
    resetOverride,
    setHiddenOnSize,
    hasOverrideForActiveSize,
    addElement,
    removeElement,
    moveElementZ,
    setDesignBackground,
    renameDesign,
    addSizeToDesign,
    removeSizeFromDesign,
    // design management
    addDesign,
    addDesignFromTemplate,
    deleteDesign,
    selectDesign,
    // brand kit
    setBrandColor,
    setBrandPalette,
    setBrandFont,
    setBrandLogo,
    // backup / import
    backupActiveCampaign,
    importBackupFile,
  };
}

export type MarketingState = ReturnType<typeof useMarketingState>;
