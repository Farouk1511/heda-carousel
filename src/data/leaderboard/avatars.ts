/**
 * Avatar resolution for leaderboard images.
 *
 * The export pipeline draws the card into a canvas via html-to-image, which
 * taints (and fails) on cross-origin <img> elements. To keep export reliable we
 * pre-fetch each avatar and inline it as a data URL; anything that can't be
 * fetched (CORS/404) falls back to an initials chip instead of breaking export.
 *
 * The map records every attempted URL: a non-empty value is the data URL, an
 * empty string marks "attempted but failed" so we don't refetch on every render.
 */
export type AvatarMap = Record<string, string>;

/** First + last initial, uppercased, e.g. "Tola Fadahunsi" -> "TF". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}

async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Resolve any not-yet-attempted URLs to data URLs, merging into `existing`.
 * Returns a new map; failed fetches are recorded as "" so they aren't retried.
 */
export async function resolveAvatars(
  urls: (string | undefined)[],
  existing: AvatarMap = {}
): Promise<AvatarMap> {
  const out: AvatarMap = { ...existing };
  const todo = [
    ...new Set(
      urls.filter((u): u is string => !!u && !(u in out))
    ),
  ];
  await Promise.all(
    todo.map(async (u) => {
      const dataUrl = await fetchAsDataUrl(u);
      out[u] = dataUrl ?? "";
    })
  );
  return out;
}
