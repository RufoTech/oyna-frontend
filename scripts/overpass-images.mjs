const query = `
[out:json][timeout:90];
area["name:en"="Baku"]["admin_level"="4"]->.baku;
(
  node["amenity"="internet_cafe"](area.baku);
  node["leisure"="gaming"](area.baku);
  node["name"~"Game|game|Club|club|PlayStation|Internet|internet|Cyber|Gaming|Vegas",i](area.baku);
);
out body 80;
`;
const res = await fetch("https://overpass-api.de/api/interpreter", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: "data=" + encodeURIComponent(query),
});
const text = await res.text();
console.log("status", res.status);
const data = JSON.parse(text);
for (const el of data.elements || []) {
  const t = el.tags || {};
  if (t.name && (t.image || t.wikimedia_commons || t["contact:facebook"])) {
    console.log(t.name, "|", t.image || t.wikimedia_commons || "");
  }
}
console.log("total", data.elements?.length);
