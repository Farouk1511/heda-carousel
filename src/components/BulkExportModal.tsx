import React, { useState, useRef, useCallback, useMemo } from "react";
import type { Post } from "../data/posts";
import { WEEKS } from "../data/posts";
import type { ThemeName } from "../data/themes";
import type { AspectRatio } from "../hooks/useCarouselState";
import { exportAllPosts, type BulkExportProgress } from "../utils/export";

interface BulkExportModalProps {
  posts: Post[];
  theme: ThemeName;
  onClose: () => void;
}

const RATIOS: AspectRatio[] = ["1:1", "4:5", "9:16"];

export const BulkExportModal: React.FC<BulkExportModalProps> = ({
  posts,
  theme,
  onClose,
}) => {
  const [selectedRatios, setSelectedRatios] = useState<Set<AspectRatio>>(
    () => new Set<AspectRatio>(["4:5"])
  );
  const [selectedPostIds, setSelectedPostIds] = useState<Set<number>>(
    () => new Set(posts.map((p) => p.id))
  );
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<BulkExportProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const postsByWeek = useMemo(() => {
    return WEEKS.map((w) => ({
      week: w,
      posts: posts.filter((p) => p.week === w.num),
    })).filter((g) => g.posts.length > 0);
  }, [posts]);

  const toggleRatio = (r: AspectRatio) => {
    setSelectedRatios((prev) => {
      const next = new Set(prev);
      if (next.has(r)) {
        if (next.size > 1) next.delete(r);
      } else {
        next.add(r);
      }
      return next;
    });
  };

  const togglePost = (id: number) => {
    setSelectedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleWeek = (weekPosts: Post[]) => {
    setSelectedPostIds((prev) => {
      const next = new Set(prev);
      const allSelected = weekPosts.every((p) => prev.has(p.id));
      for (const p of weekPosts) {
        if (allSelected) next.delete(p.id);
        else next.add(p.id);
      }
      return next;
    });
  };

  const selectAll = () => setSelectedPostIds(new Set(posts.map((p) => p.id)));
  const selectNone = () => setSelectedPostIds(new Set());

  const selectedPosts = useMemo(
    () => posts.filter((p) => selectedPostIds.has(p.id)),
    [posts, selectedPostIds]
  );

  const totalSlides =
    selectedPosts.reduce((n, p) => n + p.slides.length, 0) * selectedRatios.size;

  const handleExport = useCallback(async () => {
    if (selectedPosts.length === 0) return;
    setRunning(true);
    setError(null);
    setProgress({ current: 0, total: totalSlides, label: "Starting..." });
    abortRef.current = new AbortController();

    try {
      await exportAllPosts(
        selectedPosts,
        theme,
        Array.from(selectedRatios),
        setProgress,
        abortRef.current.signal
      );
      setProgress({ current: totalSlides, total: totalSlides, label: "Done!" });
      setTimeout(onClose, 1500);
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        setProgress(null);
      } else {
        setError((e as Error).message);
      }
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  }, [selectedPosts, theme, selectedRatios, totalSlides, onClose]);

  const handleCancel = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    onClose();
  };

  const pct = progress
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <div className="bulk-modal-backdrop" onClick={running ? undefined : onClose}>
      <div className="bulk-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bulk-modal-header">
          <span>Export Posts</span>
          {!running && (
            <button className="bulk-modal-close" onClick={onClose}>
              &times;
            </button>
          )}
        </div>

        <div className="bulk-modal-body">
          {/* Aspect ratio picker */}
          <div className="bulk-modal-label">ASPECT RATIOS</div>
          <div className="bulk-modal-ratios">
            {RATIOS.map((r) => (
              <button
                key={r}
                className={`ratio-btn${selectedRatios.has(r) ? " active" : ""}`}
                onClick={() => !running && toggleRatio(r)}
                disabled={running}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Post picker */}
          <div className="bulk-modal-label">
            POSTS
            <span className="bulk-modal-pick-actions">
              <button
                className="bulk-modal-link"
                onClick={selectAll}
                disabled={running}
              >
                All
              </button>
              <button
                className="bulk-modal-link"
                onClick={selectNone}
                disabled={running}
              >
                None
              </button>
            </span>
          </div>

          <div className="bulk-modal-posts">
            {postsByWeek.map(({ week, posts: wp }) => {
              const allChecked = wp.every((p) => selectedPostIds.has(p.id));
              const someChecked = wp.some((p) => selectedPostIds.has(p.id));
              return (
                <div className="bulk-week-group" key={week.num}>
                  <label
                    className="bulk-week-header"
                    onClick={() => !running && toggleWeek(wp)}
                  >
                    <span
                      className={`bulk-check${allChecked ? " checked" : someChecked ? " partial" : ""}`}
                    />
                    <span className="bulk-week-title">
                      Week {week.num} — {week.title}
                    </span>
                  </label>
                  {wp.map((p) => (
                    <label
                      className="bulk-post-row"
                      key={p.id}
                      onClick={() => !running && togglePost(p.id)}
                    >
                      <span
                        className={`bulk-check${selectedPostIds.has(p.id) ? " checked" : ""}`}
                      />
                      <span className="bulk-post-day">Day {p.day}</span>
                      <span className="bulk-post-title">{p.title}</span>
                    </label>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="bulk-modal-summary">
            {selectedPosts.length} post{selectedPosts.length !== 1 ? "s" : ""}{" "}
            &middot; {selectedRatios.size} ratio
            {selectedRatios.size > 1 ? "s" : ""} &middot; {totalSlides} total
            images
          </div>

          {progress && (
            <div className="bulk-modal-progress">
              <div className="bulk-modal-progress-bar">
                <div
                  className="bulk-modal-progress-fill"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="bulk-modal-progress-label">
                {progress.label} ({progress.current}/{progress.total})
              </div>
            </div>
          )}

          {error && <div className="bulk-modal-error">{error}</div>}
        </div>

        <div className="bulk-modal-footer">
          <button className="export-btn-secondary" onClick={handleCancel}>
            {running ? "Cancel" : "Close"}
          </button>
          <button
            className="export-btn-primary"
            onClick={handleExport}
            disabled={running || selectedPosts.length === 0}
          >
            {running ? `Exporting... ${pct}%` : "Export ZIP"}
          </button>
        </div>
      </div>
    </div>
  );
};
