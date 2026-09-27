import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const firm = process.argv[2];
const outId = process.argv[3];
if (!firm || !outId) {
  console.error("usage: node scrape-2gis-firm.mjs <2gis-firm-url> <venue-id>");
  process.exit(1);
}

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "venues");

const res = await fetch(firm, { headers: { "User-Agent": UA } });
const html = await res.text();
const urls = [
  ...html.matchAll(/https:\/\/[^"'\s]+\.(?:jpg|jpeg|webp)(?:\?[^"'\s]*)?/gi),
].map((m) => m[0]);
const photo = urls.find((u) => !u.includes("default-share") && !u.includes("favicon"));
console.log("candidates", urls.length, photo || "none");
if (photo) {
  const img = await fetch(photo, { headers: { "User-Agent": UA } });
  await fs.writeFile(path.join(outDir, `${outId}.jpg`), Buffer.from(await img.arrayBuffer()));
  console.log("saved");
}
