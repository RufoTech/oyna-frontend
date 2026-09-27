import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "venues");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/** Direct Yandex Maps org pages (verified manually / search). */
const direct = [
  { id: "chill-game", org: "https://yandex.az/maps/org/chill_game_club/164406535784/" },
  { id: "vegas-bakixanov", org: "https://yandex.az/maps/org/187707014823/" },
  { id: "spider-club", org: "https://yandex.az/maps/org/spider_club/4808004522/" },
  { id: "vega-pro", org: "https://yandex.az/maps/org/93084717315/" },
  { id: "laliga-nizami", org: "https://yandex.az/maps/org/12719110925/" },
  { id: "laliga-genclik", org: "https://yandex.az/maps/org/11824166269/" },
  { id: "park-net", org: "https://yandex.az/maps/org/158615740197/" },
  { id: "vip-game", org: "https://yandex.az/maps/org/49041424028/" },
  { id: "play-city", org: "https://yandex.az/maps/org/41954423215/" },
  { id: "warpoint", org: "https://yandex.az/maps/org/37260124301/" },
  { id: "lmntrix", org: "https://yandex.az/maps/org/5070413191/" },
  { id: "turkuaz", org: "https://yandex.az/maps/org/10965822892/" },
  { id: "good-game-genclik", org: "https://yandex.az/maps/org/175961675062/" },
  { id: "onside", org: "https://yandex.az/maps/org/10687154189/" },
  { id: "legion-ps", org: "https://yandex.az/maps/org/108542435376/" },
];

async function ogImage(orgUrl) {
  const res = await fetch(orgUrl, { headers: { "User-Agent": UA } });
  const html = await res.text();
  const og =
    html.match(/property="og:image" content="([^"]+)"/) ||
    html.match(/content="([^"]+)" property="og:image"/);
  return og ? og[1] : null;
}

async function downloadImage(imageUrl, dest, referer) {
  const res = await fetch(imageUrl, {
    headers: { "User-Agent": UA, Referer: referer || "https://yandex.az/" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(dest, buf);
}

for (const v of direct) {
  console.log(v.id);
  try {
    const img = await ogImage(v.org);
    if (!img) {
      console.log("  no og");
      continue;
    }
    await downloadImage(img, path.join(outDir, `${v.id}.jpg`), v.org);
    console.log("  ok");
  } catch (e) {
    console.log("  fail", e.message);
  }
}
