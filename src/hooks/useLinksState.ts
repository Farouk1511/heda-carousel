import { useCallback, useEffect, useState } from "react";

/**
 * Data layer for the Links tab.
 *
 * Unlike the other sections there is no localStorage persistence here — the links
 * live in Supabase, reached through the dev-server middleware in vite-links-api.ts
 * so the service-role key never enters the browser.
 */

export interface TrackedLink {
  id: string;
  code: string;
  url: string;
  label: string | null;
  channel: string;
  medium: string;
  campaign: string;
  content: string | null;
  destination: string;
  created_at: string;
  archived_at: string | null;
  click_count: number;
  human_click_count: number;
  unique_visitors: number;
  last_click_at: string | null;
  signups: number;
}

export interface CreateLinkInput {
  channel: string;
  medium: string;
  campaign: string;
  content?: string;
  label?: string;
  destination?: string;
}

const API = "/api/links";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, init);
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error ?? `Request failed (HTTP ${response.status}).`);
  }
  return payload as T;
}

export function useLinksState() {
  const [links, setLinks] = useState<TrackedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await request<{ links: TrackedLink[]; target: string }>("");
      setLinks(data.links);
      setTarget(data.target);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createLink = useCallback(
    async (input: CreateLinkInput) => {
      setBusy(true);
      try {
        const data = await request<{ link: TrackedLink }>("", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        setError(null);
        await load();
        return data.link;
      } catch (e) {
        setError((e as Error).message);
        return null;
      } finally {
        setBusy(false);
      }
    },
    [load]
  );

  const setArchived = useCallback(
    async (code: string, archived: boolean) => {
      setBusy(true);
      try {
        await request("/archive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, archived }),
        });
        setError(null);
        await load();
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setBusy(false);
      }
    },
    [load]
  );

  /**
   * Repointing a live link is the reason the redirect is a 302 and never a 301 —
   * a link already sitting in someone's DMs keeps working and lands somewhere new.
   */
  const setDestination = useCallback(
    async (code: string, destination: string) => {
      setBusy(true);
      try {
        await request("/destination", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, destination }),
        });
        setError(null);
        await load();
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setBusy(false);
      }
    },
    [load]
  );

  const visibleLinks = showArchived ? links : links.filter((l) => !l.archived_at);

  return {
    links,
    visibleLinks,
    loading,
    busy,
    error,
    target,
    showArchived,
    setShowArchived,
    load,
    createLink,
    setArchived,
    setDestination,
    clearError: () => setError(null),
  };
}

export type LinksState = ReturnType<typeof useLinksState>;
