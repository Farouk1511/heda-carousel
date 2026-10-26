import React, { useMemo, useState } from "react";
import {
  LIBRARY,
  categoryLabel,
  libraryCategories,
  type LibraryAsset,
} from "../data/library";

interface LibraryPickerProps {
  onPick: (asset: LibraryAsset) => void;
  onClose: () => void;
  /** Tab to open on. Falls back to the first category. */
  initialCategory?: string;
  title?: string;
}

const LAST_TAB_KEY = "heda.library.tab";

function readLastTab(): string | null {
  try {
    return localStorage.getItem(LAST_TAB_KEY);
  } catch {
    return null;
  }
}

export const LibraryPicker: React.FC<LibraryPickerProps> = ({
  onPick,
  onClose,
  initialCategory,
  title = "Asset library",
}) => {
  const categories = useMemo(libraryCategories, []);
  const [tab, setTab] = useState(() => {
    const wanted = initialCategory ?? readLastTab();
    return wanted && categories.includes(wanted) ? wanted : categories[0];
  });
  const [query, setQuery] = useState("");

  const selectTab = (c: string) => {
    setTab(c);
    try {
      localStorage.setItem(LAST_TAB_KEY, c);
    } catch {
      /* per-viewer convenience only */
    }
  };

  // Group the visible assets by subfolder, newest version folders first.
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const visible = LIBRARY.filter(
      (a) =>
        a.category === tab &&
        (!q || a.name.toLowerCase().includes(q) || a.group.toLowerCase().includes(q))
    );
    const byGroup = new Map<string, LibraryAsset[]>();
    for (const a of visible) {
      byGroup.set(a.group, [...(byGroup.get(a.group) ?? []), a]);
    }
    return [...byGroup.entries()].sort(([a], [b]) =>
      b.localeCompare(a, undefined, { numeric: true })
    );
  }, [tab, query]);

  if (categories.length === 0) {
    return (
      <div className="mk-modal-overlay" onClick={onClose}>
        <div className="mk-modal" onClick={(e) => e.stopPropagation()}>
          <div className="mk-modal-head">
            <span className="mk-modal-title">{title}</span>
            <button className="mk-modal-close" onClick={onClose}>
              ✕
            </button>
          </div>
          <p className="lib-empty">
            The library is empty. Run <code>npm run assets:sync</code> to import the asset
            folder.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mk-modal-overlay" onClick={onClose}>
      <div className="mk-modal lib-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mk-modal-head">
          <span className="mk-modal-title">{title}</span>
          <button className="mk-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="lib-toolbar">
          <div className="lib-tabs">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className={`lib-tab${c === tab ? " active" : ""}`}
                onClick={() => selectTab(c)}
              >
                {categoryLabel(c)}
              </button>
            ))}
          </div>
          <input
            className="lib-search"
            placeholder="Search…"
            value={query}
            autoFocus
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {groups.length === 0 && <p className="lib-empty">Nothing matches “{query}”.</p>}

        {groups.map(([group, assets]) => (
          <div key={group || "_"} className="lib-group">
            {group && <div className="lib-group-label">{group}</div>}
            <div className="lib-grid">
              {assets.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className="lib-item"
                  title={a.name}
                  onClick={() => onPick(a)}
                >
                  <div className="lib-thumb">
                    <img src={a.thumb} alt={a.name} loading="lazy" />
                  </div>
                  <span className="lib-name">{a.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
