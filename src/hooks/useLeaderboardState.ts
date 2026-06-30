import { useCallback, useEffect, useRef, useState } from "react";
import type { ThemeName } from "../data/themes";
import type { AspectRatio } from "./useCarouselState";
import type {
  LeaderboardData,
  LeaderboardEntry,
} from "../data/leaderboard/types";
import { parseLeaderboard } from "../data/leaderboard/parse";
import { resolveAvatars, type AvatarMap } from "../data/leaderboard/avatars";
import {
  SAMPLE_LEADERBOARD,
  SAMPLE_LEADERBOARD_JSON,
  DEFAULT_LEADERBOARD_CTA,
} from "../data/leaderboard/sample";

/** Re-number ranks by position and keep winner pinned to the rank-1 entry. */
function normalize(entries: LeaderboardEntry[], week: LeaderboardData["week"]): LeaderboardData {
  const ranked = entries.map((e, i) => ({ ...e, rank: i + 1 }));
  const top = ranked[0];
  return {
    week,
    leaderboard: ranked,
    winner: top
      ? { name: top.name, steps: top.steps }
      : { name: "", steps: 0 },
  };
}

export function useLeaderboardState() {
  const [data, setData] = useState<LeaderboardData>(() =>
    JSON.parse(JSON.stringify(SAMPLE_LEADERBOARD))
  );
  const [jsonDraft, setJsonDraft] = useState<string>(SAMPLE_LEADERBOARD_JSON);
  const [parseError, setParseError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeName>("standard");
  const [exportRatio, setExportRatio] = useState<AspectRatio>("4:5");
  const [logoScale, setLogoScale] = useState(1);
  const [cta, setCta] = useState<string>(DEFAULT_LEADERBOARD_CTA);
  const [avatars, setAvatars] = useState<AvatarMap>({});
  const avatarsRef = useRef<AvatarMap>({});

  // Pre-fetch avatars to data URLs whenever the roster changes so the preview
  // (and, crucially, the canvas export) can render them without CORS issues.
  useEffect(() => {
    let cancelled = false;
    const urls = data.leaderboard.map((e) => e.imageUrl);
    resolveAvatars(urls, avatarsRef.current).then((map) => {
      if (cancelled) return;
      avatarsRef.current = map;
      setAvatars(map);
    });
    return () => {
      cancelled = true;
    };
  }, [data]);

  /** Resolve every current avatar and return the complete map (used before export). */
  const ensureAvatars = useCallback(async (): Promise<AvatarMap> => {
    const urls = data.leaderboard.map((e) => e.imageUrl);
    const map = await resolveAvatars(urls, avatarsRef.current);
    avatarsRef.current = map;
    setAvatars(map);
    return map;
  }, [data]);

  /** Apply a structural change and keep the JSON textarea in sync. */
  const commit = useCallback((next: LeaderboardData) => {
    setData(next);
    setJsonDraft(JSON.stringify(next, null, 2));
    setParseError(null);
  }, []);

  /** Parse the JSON draft into state (the "paste JSON" path). */
  const applyJson = useCallback(() => {
    const { data: parsed, error } = parseLeaderboard(jsonDraft);
    if (error || !parsed) {
      setParseError(error ?? "Could not parse leaderboard.");
      return;
    }
    setData(parsed);
    setJsonDraft(JSON.stringify(parsed, null, 2));
    setParseError(null);
  }, [jsonDraft]);

  const resetToSample = useCallback(() => {
    const fresh: LeaderboardData = JSON.parse(
      JSON.stringify(SAMPLE_LEADERBOARD)
    );
    commit(fresh);
  }, [commit]);

  const updateWeekLabel = useCallback(
    (label: string) => {
      commit({ ...data, week: { ...data.week, label } });
    },
    [commit, data]
  );

  const updateEntry = useCallback(
    (index: number, patch: Partial<Pick<LeaderboardEntry, "name" | "steps">>) => {
      const next = data.leaderboard.map((e, i) =>
        i === index ? { ...e, ...patch } : e
      );
      commit(normalize(next, data.week));
    },
    [commit, data]
  );

  const addEntry = useCallback(() => {
    const next = [
      ...data.leaderboard,
      { rank: data.leaderboard.length + 1, name: "New athlete", steps: 0 },
    ];
    commit(normalize(next, data.week));
  }, [commit, data]);

  const removeEntry = useCallback(
    (index: number) => {
      const next = data.leaderboard.filter((_, i) => i !== index);
      commit(normalize(next, data.week));
    },
    [commit, data]
  );

  const moveEntry = useCallback(
    (index: number, dir: -1 | 1) => {
      const target = index + dir;
      if (target < 0 || target >= data.leaderboard.length) return;
      const next = [...data.leaderboard];
      [next[index], next[target]] = [next[target], next[index]];
      commit(normalize(next, data.week));
    },
    [commit, data]
  );

  return {
    data,
    jsonDraft,
    parseError,
    theme,
    exportRatio,
    logoScale,
    cta,
    avatars,
    ensureAvatars,
    setJsonDraft,
    applyJson,
    resetToSample,
    updateWeekLabel,
    updateEntry,
    addEntry,
    removeEntry,
    moveEntry,
    setTheme,
    setExportRatio,
    setLogoScale,
    setCta,
  };
}
