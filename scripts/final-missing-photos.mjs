import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "venues");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const items = [
  { id: "onside", org: "https://yandex.az/maps/org/210687154189/" },
  { id: "laliga-nizami", org: "https://yandex.az/maps/org/laliga_lounge/3922596423/" },
  { id: "laliga-genclik", org: "https://yandex.az/maps/org/11824166269/" },
  { id: "spider-club", org: "https://yandex.az/maps/org/4808004522/" },
  { id: "lmntrix", org: "https://yandex.az/maps/org/5070413191/" },
];

function pickPhoto(html) {
  const urls = [...html.matchAll(/https:\/\/avatars\.mds\.yandex\.net\/get-altay\/[^"'\\]+/g)].map((m) =>
    m[0].replace("/%s", "/orig").replace("/L_height", "/orig").replace("/XXL_height", "/orig"),
  );
  return [...new Set(urls)].find((u) => !u.includes("%s")) || null;
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
  const dest = path.join(outDir, `${v.id}.jpg`);
  try {
    await fs.access(dest);
    console.log(v.id, "exists");
    continue;
  } catch {
    /* missing */
  }
  console.log(v.id);
  const res = await fetch(v.org, { headers: { "User-Agent": UA } });
  const html = await res.text();
  const img = pickPhoto(html);
  if (!img) {
    console.log("  skip");
    continue;
  }
  try {
    await download(img, dest, v.org);
    console.log("  ok");
  } catch (e) {
    console.log("  fail", e.message);
  }
}
