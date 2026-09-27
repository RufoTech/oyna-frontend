const q = process.argv.slice(2).join(" ");
const url = "https://yandex.az/maps/?text=" + encodeURIComponent(q + " Bakı");
const res = await fetch(url, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  },
});
const html = await res.text();
const m = html.match(/https:\/\/yandex\.az\/maps\/org\/[^"'\\]+/);
console.log(m ? m[0] : "not found");
