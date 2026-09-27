const url = process.argv[2];
if (!url) {
  console.error("usage: node scrape-og.mjs <url>");
  process.exit(1);
}
const res = await fetch(url, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "az,en;q=0.9",
  },
  redirect: "follow",
});
const html = await res.text();
const og =
  html.match(/property="og:image" content="([^"]+)"/) ||
  html.match(/content="([^"]+)" property="og:image"/);
console.log("status", res.status, "len", html.length);
console.log(og ? og[1] : "no og:image");
