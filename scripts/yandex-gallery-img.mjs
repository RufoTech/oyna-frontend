const org = process.argv[2];
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const res = await fetch(org.replace(/\/?$/, "/gallery/"), { headers: { "User-Agent": UA } });
const html = await res.text();
const urls = [...html.matchAll(/https:\/\/avatars\.mds\.yandex\.net\/get-altay\/[^"'\\]+/g)].map((m) => m[0]);
const unique = [...new Set(urls)];
console.log("found", unique.length);
console.log(unique.slice(0, 3).join("\n"));
