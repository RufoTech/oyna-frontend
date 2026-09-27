import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "venues");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const missing = [
  { id: "spider-club", org: "https://yandex.az/maps/org/spider_club/4808004522/" },
  { id: "laliga-nizami", org: "https://yandex.az/maps/org/laliga_game_center/12719110925/" },
  { id: "laliga-genclik", org: "https://yandex.az/maps/org/11824166269/" },
  { id: "vip-game", org: "https://yandex.az/maps/org/49041424028/" },
  { id: "lmntrix", org: "https://yandex.az/maps/org/5070413191/" },
  { id: "turkuaz", org: "https://yandex.az/maps/org/10965822892/" },
  { id: "onside", org: "https://yandex.az/maps/org/onside/10687154189/" },
];

async function firstGalleryPhoto(orgUrl) {
  const url = orgUrl.replace(/\/?$/, "/gallery/");
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  const html = await res.text();
  const m = html.match(/https:\/\/avatars\.mds\.yandex\.net\/get-altay\/[^"'\\]+?\/orig/);
  if (m) return m[0];
  const m2 = html.match(/https:\/\/avatars\.mds\.yandex\.net\/get-altay\/[^"'\\]+?\/L_height/);
  return m2 ? m2[0] : null;
}

async function download(imageUrl, dest, referer) {
  const res = await fetch(imageUrl, {
    headers: { "User-Agent": UA, Referer: referer },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(String(res.status));
  await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

for (const v of missing) {
  console.log(v.id);
  try {
    const img = await firstGalleryPhoto(v.org);
    if (!img) {
      console.log("  no gallery");
      continue;
    }
    await download(img, path.join(outDir, `${v.id}.jpg`), v.org);
    console.log("  ok");
  } catch (e) {
    console.log("  fail", e.message);
  }
}
