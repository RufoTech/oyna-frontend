/** Geocode by full street address in Baku */
const places = [
  { name: "GAME CLUB", address: "Suleyman Rustam 11, Baku, Azerbaijan" },
  { name: "Chill Game Club", address: "Huseyn Seyidzade 129, Baku, Azerbaijan" },
  { name: "Vegas Gaming Center", address: "Sakit Qocayev 164, Baku, Azerbaijan" },
  { name: "Spider Club", address: "Ibrahimpasa Dadashov 71, Baku, Azerbaijan" },
  { name: "La Liga Game Center Gənclik", address: "Feteli Xan Xoyski, Baku, Azerbaijan" },
  { name: "VEGA ProGaming Club", address: "Mirvarid Dilbazi, Baku, Azerbaijan" },
  { name: "Speed Klub", address: "9-cu Kondelen, Baku, Azerbaijan" },
  { name: "Fairplay", address: "Yusif Memmedeliyev, Baku, Azerbaijan" },
  { name: "CYBERNET", address: "Mayakovski, Baku, Azerbaijan" },
  { name: "Extra Club Baku", address: "Ahmed Rəcəbli, Baku, Azerbaijan" },
  { name: "Qarabağ PlayStation", address: "Feteli Xan Xoyski, Baku, Azerbaijan" },
  { name: "LaLiga Game Center", address: "Nizami street, Baku, Azerbaijan" },
  { name: "TurkuAz internet café", address: "Baku Shamakhi highway, Azerbaijan" },
  { name: "Gamezone GameBaku", address: "Babek Prospekti, Baku, Azerbaijan" },
  { name: "Lmntrix Playstation Game Club", address: "Asad Ahmadov, Baku, Azerbaijan" },
  { name: "Bizon E-Sports", address: "28 May, Baku, Azerbaijan" },
  { name: "Main Game Center", address: "Nasimi district, Baku, Azerbaijan" },
  { name: "Vegas Gaming Center Nizami", address: "Nizami district, Baku, Azerbaijan" },
  { name: "Good Game Gənclik", address: "Genclik metro, Baku, Azerbaijan" },
  { name: "Park Net", address: "Narimanov, Baku, Azerbaijan" },
  { name: "VIP Game HOUSE", address: "Yasamal, Baku, Azerbaijan" },
  { name: "Dark Game Club", address: "Khatai, Baku, Azerbaijan" },
  { name: "CyberAce", address: "Sabail, Baku, Azerbaijan" },
  { name: "360 Gamezone", address: "Sumgayit highway, Baku, Azerbaijan" },
  { name: "Play City", address: "Azadlig avenue, Baku, Azerbaijan" },
  { name: "Legion PlayStation", address: "Baku Azerbaijan" },
  { name: "Warpoint VR", address: "Port Baku, Baku, Azerbaijan" },
  { name: "OnSide Game Club", address: "Baku Azerbaijan" },
  { name: "Mundial Game Club", address: "Baku Azerbaijan" },
  { name: "For Gamer", address: "Baku Azerbaijan" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const venues = [];

for (const p of places) {
  const url =
    "https://nominatim.openstreetmap.org/search?q=" +
    encodeURIComponent(p.address) +
    "&format=json&limit=1&countrycodes=az";
  const res = await fetch(url, { headers: { "User-Agent": "oyna-site/1.0" } });
  const data = await res.json();
  if (data[0]) {
    const v = data[0];
    const lat = parseFloat(v.lat);
    const lng = parseFloat(v.lon);
    if (lat < 40.2 || lat > 40.55 || lng < 49.6 || lng > 50.1) {
      console.log("SKIP bounds", p.name);
      continue;
    }
    venues.push({
      id: `osm-${v.osm_id}`,
      name: p.name,
      lat,
      lng,
      address: v.display_name.split(",").slice(0, 4).join(", "),
      rating: +(4 + Math.random() * 0.9).toFixed(1),
    });
    console.log("OK", p.name);
  } else {
    console.log("MISS", p.name);
  }
  await sleep(1100);
}

console.log("\n--- count", venues.length, "---\n");
console.log(JSON.stringify(venues, null, 2));
