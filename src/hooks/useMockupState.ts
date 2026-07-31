import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  FrameGeometry,
  GifSettings,
  MockupDoc,
  MockupItem,
  MockupScene,
  ScreenTransform,
} from "../data/mockup/types";
import { makeMockupDoc, makeMockupItem } from "../data/mockup/defaults";
import { DEVICE_FRAMES, getFrame } from "../data/mockup/frames";
import { SIZE_PRESETS } from "../data/marketing/sizes";
import { deleteMedia, getMedia, putMedia } from "../utils/mediaStore";
import {
  baseName,
  ingestFile,
  kindForFile,
  MediaIngestError,
} from "../utils/mediaIngest";
import {
  loadActiveDocId,
  loadMockupState,
  saveActiveDocId,
  saveMockupState,
} from "../utils/mockupPersistence";

export interface MockupState {
  docs: MockupDoc[];
  doc: MockupDoc;
  activeItem: MockupItem | null;
  /** mediaId -> blob: object URL, owned and revoked by this hook. */
  mediaUrls: Record<string, string>;
  /** Resolved geometry for the doc's frame (calibration overrides the seed). */
  geometry: FrameGeometry;
  size: { w: number; h: number };
  importing: boolean;
  error: string | null;

  addFiles: (files: FileList | File[]) => Promise<void>;
  removeItem: (id: string) => void;
  selectItem: (id: string) => void;
  reorderItem: (id: string, delta: number) => void;
  patchTransform: (id: string, patch: Partial<ScreenTransform>) => void;
  resetTransform: (id: string) => void;
  patchTrim: (id: string, patch: { startSec?: number; endSec?: number }) => void;
  patchScene: (patch: Partial<MockupScene>) => void;
  patchGif: (patch: Partial<GifSettings>) => void;
  setSizeId: (id: string) => void;
  setFrameId: (id: string) => void;
  setGeometry: (geom: FrameGeometry) => void;
  resetGeometry: () => void;
  newDoc: () => void;
  selectDoc: (id: string) => void;
  renameDoc: (name: string) => void;
  deleteDoc: (id: string) => void;
  clearError: () => void;
}

export function useMockupState(): MockupState {
  const persisted = useMemo(() => loadMockupState(), []);

  const [docs, setDocs] = useState<MockupDoc[]>(
    () => (persisted?.docs?.length ? persisted.docs : [makeMockupDoc()])
  );
  const [calibration, setCalibration] = useState<Record<string, FrameGeometry>>(
    () => persisted?.calibration ?? {}
  );
  const [activeDocId, setActiveDocId] = useState<string>(() => {
    const lastId = loadActiveDocId();
    const initial = persisted?.docs?.length ? persisted.docs : null;
    if (initial) {
      return (initial.find((d) => d.id === lastId) ?? initial[0]).id;
    }
    return "";
  });
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Object URLs are owned here so they can be revoked deterministically on item
  // delete and on unmount — otherwise every re-import leaks a whole blob.
  const urlsRef = useRef<Record<string, string>>({});
  const setUrl = useCallback((mediaId: string, url: string) => {
    urlsRef.current[mediaId] = url;
    setMediaUrls((m) => ({ ...m, [mediaId]: url }));
  }, []);
  const revokeUrl = useCallback((mediaId: string) => {
    const url = urlsRef.current[mediaId];
    if (url) {
      URL.revokeObjectURL(url);
      delete urlsRef.current[mediaId];
    }
    setMediaUrls((m) => {
      if (!(mediaId in m)) return m;
      const next = { ...m };
      delete next[mediaId];
      return next;
    });
  }, []);

  useEffect(() => {
    const owned = urlsRef.current;
    return () => {
      Object.values(owned).forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const doc = docs.find((d) => d.id === activeDocId) ?? docs[0];

  // Rehydrate blob: URLs for every persisted item on mount.
  useEffect(() => {
    let cancelled = false;
    const ids = new Set<string>();
    docs.forEach((d) => d.items.forEach((i) => ids.add(i.media.mediaId)));
    (async () => {
      for (const id of ids) {
        if (cancelled || urlsRef.current[id]) continue;
        const blob = await getMedia(id);
        if (cancelled || !blob) continue;
        setUrl(id, URL.createObjectURL(blob));
      }
    })();
    return () => {
      cancelled = true;
    };
    // Only on mount: later additions create their URL at ingest time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced persist of refs-only state (media bytes live in IndexedDB).
  useEffect(() => {
    const t = setTimeout(() => saveMockupState({ docs, calibration }), 500);
    return () => clearTimeout(t);
  }, [docs, calibration]);

  useEffect(() => {
    if (doc?.id) saveActiveDocId(doc.id);
  }, [doc?.id]);

  const patchDoc = useCallback(
    (id: string, patch: (d: MockupDoc) => MockupDoc) => {
      setDocs((ds) => ds.map((d) => (d.id === id ? patch(d) : d)));
    },
    []
  );

  const patchActive = useCallback(
    (patch: (d: MockupDoc) => MockupDoc) => {
      if (doc) patchDoc(doc.id, patch);
    },
    [doc, patchDoc]
  );

  const addFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList).filter((f) => kindForFile(f) !== null);
      if (!files.length || !doc) {
        if (fileList.length) setError("No images or videos in that drop.");
        return;
      }
      setImporting(true);
      setError(null);
      const added: MockupItem[] = [];
      const failures: string[] = [];
      for (const file of files) {
        try {
          const { media, blob, url } = await ingestFile(file);
          await putMedia(media.mediaId, blob);
          setUrl(media.mediaId, url);
          added.push(makeMockupItem(media, baseName(file.name)));
        } catch (err) {
          failures.push(
            err instanceof MediaIngestError
              ? err.message
              : `"${file.name}" couldn't be read.`
          );
        }
      }
      if (added.length) {
        patchDoc(doc.id, (d) => ({
          ...d,
          items: [...d.items, ...added],
          activeItemId: d.activeItemId ?? added[0].id,
        }));
      }
      if (failures.length) setError(failures.join(" "));
      setImporting(false);
    },
    [doc, patchDoc, setUrl]
  );

  const removeItem = useCallback(
    (id: string) => {
      if (!doc) return;
      const item = doc.items.find((i) => i.id === id);
      patchDoc(doc.id, (d) => {
        const items = d.items.filter((i) => i.id !== id);
        return {
          ...d,
          items,
          activeItemId:
            d.activeItemId === id ? (items[0]?.id ?? null) : d.activeItemId,
        };
      });
      if (item) {
        const mediaId = item.media.mediaId;
        // Only drop the bytes if no other item (in any doc) still points at it.
        const stillUsed = docs.some((d) =>
          d.items.some(
            (i) => i.id !== id && i.media.mediaId === mediaId
          )
        );
        if (!stillUsed) {
          revokeUrl(mediaId);
          void deleteMedia(mediaId);
        }
      }
    },
    [doc, docs, patchDoc, revokeUrl]
  );

  const selectItem = useCallback(
    (id: string) => patchActive((d) => ({ ...d, activeItemId: id })),
    [patchActive]
  );

  const reorderItem = useCallback(
    (id: string, delta: number) =>
      patchActive((d) => {
        const from = d.items.findIndex((i) => i.id === id);
        if (from < 0) return d;
        const to = Math.max(0, Math.min(d.items.length - 1, from + delta));
        if (to === from) return d;
        const items = [...d.items];
        const [moved] = items.splice(from, 1);
        items.splice(to, 0, moved);
        return { ...d, items };
      }),
    [patchActive]
  );

  const patchItem = useCallback(
    (id: string, patch: (i: MockupItem) => MockupItem) =>
      patchActive((d) => ({
        ...d,
        items: d.items.map((i) => (i.id === id ? patch(i) : i)),
      })),
    [patchActive]
  );

  const patchTransform = useCallback(
    (id: string, patch: Partial<ScreenTransform>) =>
      patchItem(id, (i) => ({ ...i, transform: { ...i.transform, ...patch } })),
    [patchItem]
  );

  const resetTransform = useCallback(
    (id: string) =>
      patchItem(id, (i) => ({
        ...i,
        transform: { fit: i.transform.fit, scale: 1, offsetX: 0, offsetY: 0 },
      })),
    [patchItem]
  );

  const patchTrim = useCallback(
    (id: string, patch: { startSec?: number; endSec?: number }) =>
      patchItem(id, (i) => {
        if (i.media.kind !== "video") return i;
        const dur = i.media.durationSec ?? 0;
        const current = i.trim ?? { startSec: 0, endSec: dur };
        const next = { ...current, ...patch };
        // Keep start < end and both inside the clip.
        next.startSec = Math.max(0, Math.min(next.startSec, dur));
        next.endSec = Math.max(next.startSec + 0.1, Math.min(next.endSec, dur));
        return { ...i, trim: next };
      }),
    [patchItem]
  );

  const patchScene = useCallback(
    (patch: Partial<MockupScene>) =>
      patchActive((d) => ({ ...d, scene: { ...d.scene, ...patch } })),
    [patchActive]
  );

  const patchGif = useCallback(
    (patch: Partial<GifSettings>) =>
      patchActive((d) => ({ ...d, gif: { ...d.gif, ...patch } })),
    [patchActive]
  );

  const setSizeId = useCallback(
    (id: string) => patchActive((d) => ({ ...d, sizeId: id })),
    [patchActive]
  );

  const setFrameId = useCallback(
    (id: string) => patchActive((d) => ({ ...d, frameId: id })),
    [patchActive]
  );

  const frameId = doc?.frameId ?? DEVICE_FRAMES[0].id;
  const framePreset = getFrame(frameId);
  const geometry = calibration[frameId] ?? framePreset.geometry;

  const setGeometry = useCallback(
    (geom: FrameGeometry) =>
      setCalibration((c) => ({ ...c, [frameId]: geom })),
    [frameId]
  );

  const resetGeometry = useCallback(
    () =>
      setCalibration((c) => {
        const next = { ...c };
        delete next[frameId];
        return next;
      }),
    [frameId]
  );

  const newDoc = useCallback(() => {
    const d = makeMockupDoc(`Mockups ${docs.length + 1}`);
    setDocs((ds) => [...ds, d]);
    setActiveDocId(d.id);
  }, [docs.length]);

  const selectDoc = useCallback((id: string) => setActiveDocId(id), []);

  const renameDoc = useCallback(
    (name: string) => patchActive((d) => ({ ...d, name })),
    [patchActive]
  );

  const deleteDoc = useCallback(
    (id: string) => {
      setDocs((ds) => {
        const next = ds.filter((d) => d.id !== id);
        const safe = next.length ? next : [makeMockupDoc()];
        if (id === activeDocId) setActiveDocId(safe[0].id);
        return safe;
      });
    },
    [activeDocId]
  );

  const size = useMemo(() => {
    if (doc?.sizeId === "custom") {
      return { w: doc.customW ?? 1080, h: doc.customH ?? 1350 };
    }
    const preset = SIZE_PRESETS.find((s) => s.id === doc?.sizeId);
    return preset ? { w: preset.w, h: preset.h } : { w: 1080, h: 1350 };
  }, [doc?.sizeId, doc?.customW, doc?.customH]);

  const activeItem =
    doc?.items.find((i) => i.id === doc.activeItemId) ?? doc?.items[0] ?? null;

  return {
    docs,
    doc,
    activeItem,
    mediaUrls,
    geometry,
    size,
    importing,
    error,
    addFiles,
    removeItem,
    selectItem,
    reorderItem,
    patchTransform,
    resetTransform,
    patchTrim,
    patchScene,
    patchGif,
    setSizeId,
    setFrameId,
    setGeometry,
    resetGeometry,
    newDoc,
    selectDoc,
    renameDoc,
    deleteDoc,
    clearError: () => setError(null),
  };
}
