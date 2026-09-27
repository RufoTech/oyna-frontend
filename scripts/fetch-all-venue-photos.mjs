import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "venues");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/** @type {{ id: string; name: string; yandexQuery?: string }[]} */
const venues = [
  { id: "game-club-rustam", name: "GAME CLUB", yandexQuery: "GAME CLUB Süleyman Rüstəm 11" },
  { id: "chill-game", name: "Chill Game Club", yandexQuery: "Chill Game Club Hüseyn Seyidzadə" },
  { id: "vegas-bakixanov", name: "Vegas Gaming Center", yandexQuery: "Vegas Gaming Center Sakit Qocayev" },
  { id: "spider-club", name: "Spider Club", yandexQuery: "Spider Club İbrahimpaşa Dadaşov" },
  { id: "vega-pro", name: "VEGA ProGaming Club", yandexQuery: "VEGA ProGaming Mirvarid Dilbazi" },
  { id: "cybernet", name: "CYBERNET", yandexQuery: "CYBERNET Mayakovski Bakı" },
  { id: "extra-club", name: "Extra Club Baku", yandexQuery: "Extra Club Baku Əhməd Rəcəbli" },
  { id: "laliga-nizami", name: "LaLiga Game Center", yandexQuery: "LaLiga Game Center Nizami" },
  { id: "laliga-genclik", name: "La Liga Game Center Gənclik", yandexQuery: "La Liga Game Center Gənclik" },
  { id: "gamezone-baku", name: "Gamezone GameBaku", yandexQuery: "Gamezone GameBaku Babək" },
  { id: "bizon-esports", name: "Bizon E-Sports", yandexQuery: "Bizon E-Sports 28 May" },
  { id: "park-net", name: "Park Net", yandexQuery: "Park Net Təbriz küçəsi Bakı" },
  { id: "vip-game", name: "VIP Game HOUSE", yandexQuery: "VIP Game HOUSE Yasamal" },
  { id: "dark-game", name: "Dark Game Club", yandexQuery: "Dark Game Club Xocalı" },
  { id: "play-city", name: "Play City", yandexQuery: "Play City Azadlıq prospekti" },
  { id: "warpoint", name: "Warpoint VR", yandexQuery: "Warpoint Port Baku" },
  { id: "speed-klub", name: "Speed Klub", yandexQuery: "Speed Klub Bakı" },
  { id: "qarabag-ps", name: "Qarabağ PlayStation", yandexQuery: "Qarabağ PlayStation Fətəli Xan Xoyski" },
  { id: "lmntrix", name: "Lmntrix Playstation Game Club", yandexQuery: "Lmntrix Playstation Əsəd Əhmədov" },
  { id: "turkuaz", name: "TurkuAz internet café", yandexQuery: "TurkuAz internet café Bakı" },
  { id: "fairplay", name: "Fairplay", yandexQuery: "Fairplay Yusif Məmmədəliyev" },
  { id: "good-game-genclik", name: "Good Game Gənclik", yandexQuery: "Good Game Gənclik" },
  { id: "onside", name: "OnSide Game Club", yandexQuery: "OnSide Game Club Bakı" },
  { id: "mundial", name: "Mundial Game Club", yandexQuery: "Mundial Game Club Bakı" },
  { id: "for-gamer", name: "For Gamer", yandexQuery: "For Gamer Bakı" },
  { id: "legion-ps", name: "Legion PlayStation", yandexQuery: "Legion PlayStation Bakı" },
  { id: "360-gamezone", name: "360 Gamezone", yandexQuery: "360 Gamezone Bakı" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findOrgUrl(query) {
  const url = "https://yandex.az/maps/?text=" + encodeURIComponent(query + " Bakı");
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  const html = await res.text();
  const m = html.match(/https:\/\/yandex\.az\/maps\/org\/[^"'\\]+/);
  return m ? m[0] : null;
}

async function ogImage(orgUrl) {
  const res = await fetch(orgUrl, { headers: { "User-Agent": UA } });
  const html = await res.text();
  const og =
    html.match(/property="og:image" content="([^"]+)"/) ||
    html.match(/content="([^"]+)" property="og:image"/);
  return og ? og[1] : null;
}

async function downloadImage(imageUrl, dest) {
  const res = await fetch(imageUrl, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 500) throw new Error("too small");
  await fs.writeFile(dest, buf);
}

await fs.mkdir(outDir, { recursive: true });
const results = {};

for (const v of venues) {
  console.log("\n===", v.name);
  try {
    const org = await findOrgUrl(v.yandexQuery || v.name);
    await sleep(800);
    if (!org) {
      console.log("no org");
      results[v.id] = { ok: false, reason: "no_org" };
      continue;
    }
    console.log("org", org);
    const img = await ogImage(org);
    await sleep(600);
    if (!img) {
      console.log("no image");
      results[v.id] = { ok: false, reason: "no_image", org };
      continue;
    }
    const dest = path.join(outDir, `${v.id}.jpg`);
    await downloadImage(img, dest);
    results[v.id] = { ok: true, org, image: img, local: `/venues/${v.id}.jpg` };
    console.log("saved", dest);
  } catch (e) {
    console.log("error", e.message);
    results[v.id] = { ok: false, reason: e.message };
  }
}

await fs.writeFile(path.join(root, "scripts", "venue-photo-results.json"), JSON.stringify(results, null, 2));
const ok = Object.values(results).filter((r) => r.ok).length;
console.log(`\n${ok}/${venues.length} downloaded`);
