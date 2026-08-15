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

/** open() can stall indefinitely — another tab holding an older version blocks
 *  the upgrade, and a wedged IDB fires neither success nor error. Every caller
 *  awaits this, so a hang would freeze imports and exports rather than
 *  degrading. Resolve null on `blocked` and on a timeout so the store falls
 *  back to its documented no-op behaviour instead. */
const OPEN_TIMEOUT_MS = 5000;

function rawOpen(version?: number): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === "undefined") {
      resolve(null);
      return;
    }
    let req: IDBOpenDBRequest;
    try {
      req = version === undefined
        ? indexedDB.open(DB_NAME)
        : indexedDB.open(DB_NAME, version);
    } catch {
      resolve(null);
      return;
    }
    let settled = false;
    const done = (db: IDBDatabase | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(db);
    };
    const timer = setTimeout(() => done(null), OPEN_TIMEOUT_MS);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => done(req.result);
    req.onerror = () => done(null);
    req.onblocked = () => done(null);
  });
}

/**
 * Open the DB and guarantee the object store exists.
 *
 * Opening at a fixed version only runs `onupgradeneeded` when that version is
 * newer, so a database sitting at the right version but MISSING the store — a
 * partial upgrade, or any other code that opened this DB name without creating
 * it — is accepted as valid, and every later `transaction()` throws
 * NotFoundError. That surfaced to the user as "couldn't be read" on every
 * import. Detect it and force an upgrade to build the store.
 */
async function openDB(): Promise<IDBDatabase | null> {
  // Deliberately version-agnostic. Requesting a FIXED version is a trap: once
  // the repair below has bumped the database to v2, every later open at v1
  // throws VersionError and the whole store silently no-ops. Opening with no
  // version accepts whatever exists, and still creates the database at v1
  // (firing onupgradeneeded) when it doesn't exist yet.
  const db = await rawOpen();
  if (!db) return null;
  if (db.objectStoreNames.contains(STORE)) return db;

  const version = db.version;
  db.close();
  const upgraded = await rawOpen(version + 1);
  if (!upgraded) return null;
  if (!upgraded.objectStoreNames.contains(STORE)) {
    upgraded.close();
    return null;
  }
  return upgraded;
}

/** Run a transaction, degrading to the fallback if the store misbehaves. */
async function withStore<T>(
  mode: IDBTransactionMode,
  fallback: T,
  body: (store: IDBObjectStore, resolve: (v: T) => void) => void
): Promise<T> {
  const db = await openDB();
  if (!db) return fallback;
  try {
    return await new Promise<T>((resolve) => {
      let tx: IDBTransaction;
      try {
        tx = db.transaction(STORE, mode);
      } catch {
        resolve(fallback);
        return;
      }
      tx.onerror = () => resolve(fallback);
      tx.onabort = () => resolve(fallback);
      body(tx.objectStore(STORE), resolve);
    });
  } catch {
    return fallback;
  } finally {
    db.close();
  }
}

export async function putMedia(id: string, blob: Blob): Promise<void> {
  await withStore<void>('readwrite', undefined, (store, resolve) => {
    store.put(blob, id);
    store.transaction.oncomplete = () => resolve(undefined);
  });
}

export async function getMedia(id: string): Promise<Blob | null> {
  return withStore<Blob | null>('readonly', null, (store, resolve) => {
    const req = store.get(id);
    req.onsuccess = () => resolve((req.result as Blob) ?? null);
    req.onerror = () => resolve(null);
  });
}

export async function getAllMedia(): Promise<Record<string, Blob>> {
  return withStore<Record<string, Blob>>('readonly', {}, (store, resolve) => {
    const out: Record<string, Blob> = {};
    const req = store.openCursor();
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        out[cursor.key as string] = cursor.value as Blob;
        cursor.continue();
      } else {
        resolve(out);
      }
    };
    req.onerror = () => resolve(out);
  });
}

export async function deleteMedia(id: string): Promise<void> {
  await withStore<void>('readwrite', undefined, (store, resolve) => {
    store.delete(id);
    store.transaction.oncomplete = () => resolve(undefined);
  });
}
