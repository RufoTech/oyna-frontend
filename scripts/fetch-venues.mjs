/** One-off: fetch Baku gaming/internet venues from Overpass + Nominatim photos via Wikimedia fallback */
const OVERPASS = "https://overpass-api.de/api/interpreter";
const query = `
[out:json][timeout:90];
area["name:en"="Baku"]["admin_level"="4"]->.baku;
(
  node["amenity"="internet_cafe"](area.baku);
  node["leisure"="gaming"](area.baku);
  node["name"~"Internet|internet|Cyber|cyber|Game|game|Klub|klub|Club|club|PlayStation|Gaming|gaming|e-sport|ESport",i](area.baku);
  way["amenity"="internet_cafe"](area.baku);
);
out center 35;
`;

const res = await fetch(OVERPASS, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: "data=" + encodeURIComponent(query),
});
const json = await res.json();
console.log(JSON.stringify(json, null, 2));
