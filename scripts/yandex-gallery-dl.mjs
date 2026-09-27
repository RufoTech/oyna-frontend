import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const orgId = process.argv[2];
const outId = process.argv[3];
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "venues");

const orgUrl = `https://yandex.az/maps/org/${orgId}/`;
const res = await fetch(orgUrl, { headers: { "User-Agent": UA } });
const html = await res.text();
const slugMatch = html.match(/yandex\.az\/maps\/org\/([^/"']+)\/\d+/);
const galleryUrl = slugMatch
  ? `https://yandex.az/maps/org/${slugMatch[1]}/${orgId}/gallery/`
  : `${orgUrl}gallery/`;
console.log("gallery", galleryUrl);
const gRes = await fetch(galleryUrl, { headers: { "User-Agent": UA } });
const gHtml = await gRes.text();
const m = gHtml.match(/https:\/\/avatars\.mds\.yandex\.net\/get-altay\/[^"'\\]+?\/orig/);
if (!m) {
  console.log("no photo");
  process.exit(0);
}
const imgRes = await fetch(m[0], { headers: { "User-Agent": UA, Referer: galleryUrl } });
await fs.writeFile(path.join(outDir, `${outId}.jpg`), Buffer.from(await imgRes.arrayBuffer()));
console.log("saved", outId);
