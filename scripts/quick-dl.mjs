import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "venues");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const items = [
  { id: "lmntrix", org: "https://yandex.az/maps/org/82608952016/" },
  { id: "colizeum", org: "https://yandex.az/maps/org/210062337641/" },
  { id: "mirac", org: "https://yandex.az/maps/org/175961675062/" },
  { id: "laliga-nizami", org: "https://yandex.az/maps/org/12719110925/" },
];

function pick(html) {
  const urls = [...html.matchAll(/https:\/\/avatars\.mds\.yandex\.net\/get-altay\/[^"'\\]+/g)].map((m) =>
    m[0].replace("/L_height", "/orig").replace("/XXL_height", "/orig"),
  );
  return [...new Set(urls)].find((u) => !u.includes("%s")) ?? null;
}

for (const v of items) {
  const res = await fetch(v.org, { headers: { "User-Agent": UA } });
  const img = pick(await res.text());
  if (!img) {
    console.log(v.id, "skip");
    continue;
  }
  const buf = await fetch(img, { headers: { "User-Agent": UA, Referer: v.org } }).then((r) => r.arrayBuffer());
  await fs.writeFile(path.join(outDir, `${v.id}.jpg`), Buffer.from(buf));
  console.log(v.id, "ok");
}
