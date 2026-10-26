// Sync the Heda asset folder into the app's built-in library.
//
//   npm run assets:sync                      # uses HEDA_ASSETS_DIR or the default below
//   npm run assets:sync -- "D:\path\to\assets"
//
// Layout of the source folder drives the library:
//   <root>/<category>/[<group>/]<file>.png   -> category tab, optional group heading
//   <root>/<file>.png                        -> "misc" category
//
// Each image becomes a web-sized WebP plus a small thumbnail under
// public/library/, and src/data/library/manifest.json lists them. Re-running is
// incremental: unchanged files are skipped and deleted sources are pruned.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const DEFAULT_SOURCE = "D:\\kazee\\Documents\\heda-assests";
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);
/** Long edge cap. Plenty for a 1080×1350 export, a fraction of the source bytes. */
const FULL_MAX = 1800;
const THUMB_MAX = 360;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.resolve(process.argv[2] || process.env.HEDA_ASSETS_DIR || DEFAULT_SOURCE);
const outDir = path.join(root, "public", "library");
const manifestPath = path.join(root, "src", "data", "library", "manifest.json");

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";

const prettyName = (file) => {
  const base = path.basename(file, path.extname(file)).replace(/[-_]+/g, " ").trim();
  return base.charAt(0).toUpperCase() + base.slice(1);
};

async function walk(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) out.push(full);
  }
  return out;
}

async function isFresh(target, srcMtime) {
  try {
    return (await fs.stat(target)).mtimeMs >= srcMtime;
  } catch {
    return false;
  }
}

async function main() {
  try {
    await fs.access(source);
  } catch {
    console.error(`Asset folder not found: ${source}`);
    console.error(`Pass a path (npm run assets:sync -- "<dir>") or set HEDA_ASSETS_DIR.`);
    process.exit(1);
  }

  const files = (await walk(source)).sort();
  const assets = [];
  const written = new Set();
  let converted = 0;

  for (const file of files) {
    const parts = path.relative(source, file).split(path.sep);
    const category = parts.length > 1 ? slug(parts[0]) : "misc";
    const group = parts.length > 2 ? parts.slice(1, -1).join(" / ") : "";
    const relDir = [category, ...(parts.length > 2 ? parts.slice(1, -1).map(slug) : [])].join("/");
    const base = slug(path.basename(file, path.extname(file)));
    const id = `${relDir}/${base}`;

    const fullRel = `library/${relDir}/${base}.webp`;
    const thumbRel = `library/${relDir}/${base}.thumb.webp`;
    const fullAbs = path.join(root, "public", fullRel);
    const thumbAbs = path.join(root, "public", thumbRel);
    written.add(path.normalize(fullAbs));
    written.add(path.normalize(thumbAbs));

    const { mtimeMs } = await fs.stat(file);
    if (!(await isFresh(fullAbs, mtimeMs)) || !(await isFresh(thumbAbs, mtimeMs))) {
      await fs.mkdir(path.dirname(fullAbs), { recursive: true });
      const img = sharp(file).rotate();
      await img
        .clone()
        .resize(FULL_MAX, FULL_MAX, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 88, alphaQuality: 100 })
        .toFile(fullAbs);
      await img
        .clone()
        .resize(THUMB_MAX, THUMB_MAX, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 75 })
        .toFile(thumbAbs);
      converted++;
    }

    const meta = await sharp(fullAbs).metadata();
    assets.push({
      id,
      category,
      group,
      name: prettyName(file),
      src: `/${fullRel}`,
      thumb: `/${thumbRel}`,
      w: meta.width,
      h: meta.height,
    });
  }

  // Prune outputs whose source was deleted or renamed.
  let pruned = 0;
  const existing = await walk(outDir).catch(() => []);
  for (const f of existing) {
    if (!written.has(path.normalize(f))) {
      await fs.unlink(f);
      pruned++;
    }
  }

  await fs.mkdir(path.dirname(manifestPath), { recursive: true });
  await fs.writeFile(manifestPath, JSON.stringify(assets, null, 2) + "\n");

  console.log(
    `Library: ${assets.length} assets (${converted} converted, ${pruned} pruned) from ${source}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
