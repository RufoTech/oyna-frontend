import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "venues");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const items = [
  { id: "spider-club", org: "https://yandex.az/maps/org/4808004522/" },
  { id: "laliga-nizami", org: "https://yandex.az/maps/org/12719110925/" },
  { id: "laliga-genclik", org: "https://yandex.az/maps/org/11824166269/" },
  { id: "vip-game", org: "https://yandex.az/maps/org/49041424028/" },
  { id: "lmntrix", org: "https://yandex.az/maps/org/5070413191/" },
  { id: "turkuaz", org: "https://yandex.az/maps/org/154732498871/" },
  { id: "onside", org: "https://yandex.az/maps/org/10687154189/" },
];

function pickPhoto(html) {
  const urls = [...html.matchAll(/https:\/\/avatars\.mds\.yandex\.net\/get-altay\/[^"'\\]+/g)].map((m) =>
    m[0].replace("/%s", "/orig").replace("/L_height", "/orig"),
  );
  const good = [...new Set(urls)].filter((u) => !u.includes("%s"));
  return good[0] || null;
}

async function download(imageUrl, dest, referer) {
  const res = await fetch(imageUrl, {
    headers: { "User-Agent": UA, Referer: referer },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(String(res.status));
  await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

for (const v of items) {
  console.log(v.id);
  const res = await fetch(v.org, { headers: { "User-Agent": UA } });
  const html = await res.text();
  const img = pickPhoto(html);
  if (!img) {
    console.log("  no photo in html");
    continue;
  }
  try {
    await download(img, path.join(outDir, `${v.id}.jpg`), v.org);
    console.log("  ok");
  } catch (e) {
    console.log("  fail", e.message);
  }
}
