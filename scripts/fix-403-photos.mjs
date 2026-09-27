import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "venues");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const items = [
  { id: "spider-club", org: "https://yandex.az/maps/org/spider_club/4808004522/" },
  { id: "laliga-nizami", org: "https://yandex.az/maps/org/laliga_game_center/12719110925/" },
  { id: "laliga-genclik", org: "https://yandex.az/maps/org/11824166269/" },
  { id: "vip-game", org: "https://yandex.az/maps/org/49041424028/" },
  { id: "lmntrix", org: "https://yandex.az/maps/org/5070413191/" },
  { id: "turkuaz", org: "https://yandex.az/maps/org/10965822892/" },
  { id: "onside", org: "https://yandex.az/maps/org/onside/10687154189/" },
];

async function ogImage(orgUrl) {
  const res = await fetch(orgUrl, { headers: { "User-Agent": UA } });
  const html = await res.text();
  const og =
    html.match(/property="og:image" content="([^"]+)"/) ||
    html.match(/content="([^"]+)" property="og:image"/);
  return og ? og[1] : null;
}

async function tryDownload(url, dest, referer) {
  const variants = [
    url,
    url.replace("/L_height", "/XL_height"),
    url.replace("/L_height", ""),
    url.replace("get-altay", "get-ypictures"),
  ];
  for (const u of variants) {
    try {
      const res = await fetch(u, {
        headers: {
          "User-Agent": UA,
          Referer: referer,
          Accept: "image/*,*/*;q=0.8",
        },
        redirect: "follow",
      });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 400) continue;
      await fs.writeFile(dest, buf);
      return true;
    } catch {
      /* next */
    }
  }
  return false;
}

for (const v of items) {
  console.log(v.id);
  const img = await ogImage(v.org);
  if (!img) {
    console.log("  no og");
    continue;
  }
  const ok = await tryDownload(img, path.join(outDir, `${v.id}.jpg`), v.org);
  console.log(ok ? "  ok" : "  fail", img.slice(0, 60));
}
