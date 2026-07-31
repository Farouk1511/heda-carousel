// IndexedDB-backed media store for the mockup creator. Structurally the same
// fail-soft store as assetStore.ts, with one deliberate difference: values are
// **Blobs**, not data URLs.
//
// assetStore is typed Record<string,string> and every caller treats values as
// data URLs. That's fine for logos, but a 20MB screen recording becomes a ~27MB
// base64 string — and, critically, <video src="data:..."> seeks badly in
// Chrome, which would break the whole GIF pipeline. IndexedDB stores Blobs
// natively, and the hook hands the <video> a blob: object URL instead.

const DB_NAME = "heda-mockups";
const STORE = "media";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === "undefined") {
      resolve(null);
      return;
    }
    let req: IDBOpenDBRequest;
    try {
      req = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      resolve(null);
      return;
    }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

export async function putMedia(id: string, blob: Blob): Promise<void> {
  const db = await openDB();
  if (!db) return;
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
    tx.onabort = () => resolve();
  });
  db.close();
}

export async function getMedia(id: string): Promise<Blob | null> {
  const db = await openDB();
  if (!db) return null;
  const out = await new Promise<Blob | null>((resolve) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve((req.result as Blob) ?? null);
    req.onerror = () => resolve(null);
  });
  db.close();
  return out;
}

export async function getAllMedia(): Promise<Record<string, Blob>> {
  const db = await openDB();
  if (!db) return {};
  const out: Record<string, Blob> = {};
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).openCursor();
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        out[cursor.key as string] = cursor.value as Blob;
        cursor.continue();
      } else {
        resolve();
      }
    };
    req.onerror = () => resolve();
  });
  db.close();
  return out;
}

export async function deleteMedia(id: string): Promise<void> {
  const db = await openDB();
  if (!db) return;
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
    tx.onabort = () => resolve();
  });
  db.close();
}
