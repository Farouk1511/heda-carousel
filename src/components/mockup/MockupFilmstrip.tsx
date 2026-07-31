import React, { useRef } from "react";
import type { MockupItem } from "../../data/mockup/types";
import { ACCEPT_ATTR } from "../../utils/mediaIngest";

interface FilmstripProps {
  items: MockupItem[];
  activeId: string | null;
  mediaUrls: Record<string, string>;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onReorder: (id: string, delta: number) => void;
  onFiles: (files: FileList | File[]) => void;
  importing: boolean;
}

export const MockupFilmstrip: React.FC<FilmstripProps> = ({
  items,
  activeId,
  mediaUrls,
  onSelect,
  onRemove,
  onReorder,
  onFiles,
  importing,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mo-filmstrip">
      {items.map((item, i) => {
        const url = mediaUrls[item.media.mediaId];
        const active = item.id === activeId;
        return (
          <div
            key={item.id}
            className={`mo-thumb${active ? " active" : ""}`}
            onClick={() => onSelect(item.id)}
            title={item.name}
          >
            {url ? (
              item.media.kind === "video" ? (
                <video src={url} muted className="mo-thumb-media" />
              ) : (
                <img src={url} alt="" className="mo-thumb-media" />
              )
            ) : (
              <div className="mo-thumb-media mo-thumb-empty" />
            )}
            {item.media.kind === "video" && (
              <span className="mo-thumb-badge">GIF</span>
            )}
            <div className="mo-thumb-actions">
              <button
                type="button"
                title="Move left"
                disabled={i === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  onReorder(item.id, -1);
                }}
              >
                ‹
              </button>
              <button
                type="button"
                title="Remove"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(item.id);
                }}
              >
                ×
              </button>
              <button
                type="button"
                title="Move right"
                disabled={i === items.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  onReorder(item.id, 1);
                }}
              >
                ›
              </button>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        className="mo-thumb mo-thumb-add"
        onClick={() => inputRef.current?.click()}
        disabled={importing}
      >
        {importing ? "…" : "+"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files);
          e.currentTarget.value = "";
        }}
      />
    </div>
  );
};
