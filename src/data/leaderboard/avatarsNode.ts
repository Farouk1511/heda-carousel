/**
 * Node-side avatar pre-fetch: resolve remote imageUrls to data URLs so a
 * server render never stalls on a slow or dead remote image ("" marks
 * attempted-but-failed -> initials fallback). Twin of avatars.ts, which is
 * browser-only (FileReader). Imported by render.ts and the Vite render
 * endpoint — never by browser code.
 */
export async function prefetchAvatars(
  urls: (string | undefined)[]
): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const todo = [...new Set(urls.filter((u): u is string => !!u))];
  await Promise.all(
    todo.map(async (u) => {
      try {
        const res = await fetch(u);
        if (!res.ok) {
          out[u] = "";
          return;
        }
        const mime = res.headers.get("content-type") ?? "image/jpeg";
        const buf = Buffer.from(await res.arrayBuffer());
        out[u] = `data:${mime};base64,${buf.toString("base64")}`;
      } catch {
        out[u] = "";
      }
    })
  );
  return out;
}
