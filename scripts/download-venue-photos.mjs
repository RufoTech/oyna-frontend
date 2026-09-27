/**
 * Downloads venue cover images into public/venues/ for local serving.
 * Sources: OpenStreetMap image/wikimedia tags, then Wikimedia Commons search.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "venues");

const venues = JSON.parse(
  await fs.readFile(path.join(root, "scripts", "venues-for-download.json"), "utf8"),
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function download(url, dest) {
  const res = await fetch(url, {
    headers: { "User-Agent": "oyna-site/1.0 (local asset build)" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 800) throw new Error("too small");
  await fs.writeFile(dest, buf);
}

async function osmImageNear(lat, lng, name) {
  const q = `[out:json][timeout:25];(node(around:120,${lat},${lng})["image"];node(around:120,${lat},${lng})["wikimedia_commons"];);out tags 5;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "data=" + encodeURIComponent(q),
  });
  if (!res.ok) return null;
  const data = await res.json();
  for (const el of data.elements || []) {
    const tags = el.tags || {};
    if (tags.image) return tags.image;
    if (tags.wikimedia_commons) {
      const file = tags.wikimedia_commons.replace(/^File:/, "");
      return commonsFileUrl(file);
    }
  }
  return null;
}

function commonsFileUrl(filename) {
  const encoded = filename.replace(/ /g, "_");
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(encoded)}?width=640`;
}

async function commonsSearch(name) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=" +
    encodeURIComponent(`${name} Baku Azerbaijan`) +
    "&gsrlimit=5&prop=imageinfo&iiprop=url&iiurlwidth=640&format=json";
  const res = await fetch(url, { headers: { "User-Agent": "oyna-site/1.0" } });
  if (!res.ok) return null;
  const data = await res.json();
  const pages = data?.query?.pages;
  if (!pages) return null;
  for (const page of Object.values(pages)) {
    const thumb = page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url;
    if (thumb) return thumb;
  }
  return null;
}

async function nominatimImage(name, lat, lng) {
  const url =
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
  await sleep(1100);
  const res = await fetch(url, { headers: { "User-Agent": "oyna-site/1.0" } });
  if (!res.ok) return null;
  const data = await res.json();
  if (data?.extratags?.image) return data.extratags.image;
  return null;
}

await fs.mkdir(outDir, { recursive: true });
const manifest = {};

for (const v of venues) {
  const dest = path.join(outDir, `${v.id}.jpg`);
  console.log("\n→", v.name);
  let imageUrl = v.imageUrl || null;

  if (!imageUrl) {
    imageUrl = await osmImageNear(v.lat, v.lng, v.name);
  }
  if (!imageUrl) {
    imageUrl = await commonsSearch(v.name);
    await sleep(400);
  }
  if (!imageUrl && v.searchName) {
    imageUrl = await commonsSearch(v.searchName);
    await sleep(400);
  }

  if (!imageUrl) {
    console.log("  MISS — no source");
    manifest[v.id] = null;
    continue;
  }

  try {
    console.log("  DL", imageUrl.slice(0, 72) + "...");
    await download(imageUrl, dest);
    manifest[v.id] = `/venues/${v.id}.jpg`;
    console.log("  OK");
  } catch (e) {
    console.log("  FAIL", e.message);
    manifest[v.id] = null;
  }
}

await fs.writeFile(
  path.join(root, "src", "data", "venue-photos.manifest.json"),
  JSON.stringify(manifest, null, 2),
);
console.log("\nDone. Manifest written.");
