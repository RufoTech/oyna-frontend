import * as THREE from "three";

/**
 * Cyberpunk VIP-gaming variant of the Oyna club interface, painted for the
 * hero curved ultrawide monitor (21:9). Dark glass backdrop, neon HUD
 * widgets: live rig stats (FPS / ping / GPU temp), club zones and active
 * player cards.
 */
export function createOynaScreenTexture(): THREE.CanvasTexture {
  const W = 1260;
  const H = 540;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext("2d")!;

  const NEON = {
    green: "#00ff88",
    cyan: "#00e5ff",
    purple: "#b026ff",
    magenta: "#ff2bd6",
    amber: "#ffb020",
    red: "#ff3b5c",
  };
  const INK = "#f2f5ff";
  const DIM = "#8b93b0";

  // ---- backdrop: deep-space gradient + faint grid + vignette ----
  const bg = g.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#04050a");
  bg.addColorStop(0.55, "#070b18");
  bg.addColorStop(1, "#0c0618");
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);

  g.strokeStyle = "rgba(0,229,255,0.055)";
  g.lineWidth = 1;
  for (let x = 0; x <= W; x += 42) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, H);
    g.stroke();
  }
  for (let y = 0; y <= H; y += 42) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(W, y);
    g.stroke();
  }

  const glass = (x: number, y: number, w: number, h: number, r: number, edge: string) => {
    g.fillStyle = "rgba(12,16,30,0.88)";
    g.beginPath();
    g.roundRect(x, y, w, h, r);
    g.fill();
    g.strokeStyle = edge;
    g.lineWidth = 1.5;
    g.stroke();
  };

  const glowText = (text: string, x: number, y: number, font: string, color: string, blur = 12) => {
    g.save();
    g.font = font;
    g.textBaseline = "middle";
    g.shadowColor = color;
    g.shadowBlur = blur;
    g.fillStyle = color;
    g.fillText(text, x, y);
    g.restore();
  };

  // ---- top bar ----
  g.fillStyle = "rgba(8,10,20,0.92)";
  g.fillRect(0, 0, W, 62);
  g.fillStyle = "rgba(176,38,255,0.35)";
  g.fillRect(0, 62, W, 2);

  const logoGrad = g.createLinearGradient(24, 14, 56, 46);
  logoGrad.addColorStop(0, NEON.magenta);
  logoGrad.addColorStop(1, NEON.purple);
  g.fillStyle = logoGrad;
  g.beginPath();
  g.roundRect(24, 14, 34, 34, 9);
  g.fill();
  g.fillStyle = "#06070d";
  g.beginPath();
  g.moveTo(37, 23);
  g.lineTo(37, 39);
  g.lineTo(49, 31);
  g.closePath();
  g.fill();
  glowText("OYNA", 68, 32, "800 25px Manrope, Inter, sans-serif", "#ffffff", 8);
  g.fillStyle = "rgba(255,43,214,0.16)";
  g.beginPath();
  g.roundRect(148, 18, 92, 26, 13);
  g.fill();
  g.strokeStyle = NEON.magenta;
  g.lineWidth = 1.5;
  g.stroke();
  glowText("VIP CLUB", 160, 32, "700 13px Inter, sans-serif", NEON.magenta, 8);

  glowText("SESSİYA 02:14:36  •  PC-07", 480, 32, "600 16px Inter, sans-serif", DIM, 0);

  // live rig stats
  const stats: Array<[string, string, string]> = [
    ["FPS", "240", NEON.green],
    ["PING", "3 ms", NEON.cyan],
    ["GPU", "68°C", NEON.magenta],
  ];
  let sx = W - 24;
  for (let i = stats.length - 1; i >= 0; i--) {
    const [label, value, color] = stats[i];
    g.font = "700 15px Inter, sans-serif";
    const tw = g.measureText(`${label} ${value}`).width + 44;
    sx -= tw;
    g.fillStyle = "rgba(0,0,0,0.45)";
    g.beginPath();
    g.roundRect(sx, 13, tw, 36, 10);
    g.fill();
    g.strokeStyle = color;
    g.lineWidth = 1.5;
    g.stroke();
    g.fillStyle = DIM;
    g.font = "600 12px Inter, sans-serif";
    g.textBaseline = "middle";
    g.fillText(label, sx + 14, 32);
    glowText(value, sx + 14 + g.measureText(label).width + 20, 32, "800 16px Inter, sans-serif", color, 10);
    sx -= 10;
  }

  // ---- left: club zones ----
  glass(24, 84, 296, 372, 16, "rgba(0,255,136,0.3)");
  glowText("KLUB ZONASI", 48, 114, "800 15px Inter, sans-serif", NEON.green, 8);
  const zones: Array<[string, number, number, string]> = [
    ["VIP Arena", 12, 16, NEON.magenta],
    ["Standard", 34, 40, NEON.cyan],
    ["Stream Room", 2, 4, NEON.green],
  ];
  zones.forEach(([name, used, total, color], i) => {
    const y = 140 + i * 104;
    g.fillStyle = INK;
    g.font = "700 17px Manrope, sans-serif";
    g.textBaseline = "alphabetic";
    g.fillText(name, 48, y + 20);
    g.fillStyle = DIM;
    g.font = "600 14px Inter, sans-serif";
    g.fillText(`${used}/${total} PC`, 232, y + 20);
    g.fillStyle = "rgba(255,255,255,0.08)";
    g.beginPath();
    g.roundRect(48, y + 34, 248, 12, 6);
    g.fill();
    g.save();
    g.shadowColor = color;
    g.shadowBlur = 10;
    g.fillStyle = color;
    g.beginPath();
    g.roundRect(48, y + 34, (248 * used) / total, 12, 6);
    g.fill();
    g.restore();
    g.fillStyle = color;
    g.font = "600 12px Inter, sans-serif";
    g.fillText(used / total > 0.85 ? "AZ YER QALIB" : "AÇIQDIR", 48, y + 68);
  });

  // ---- center: live match + radar ----
  glass(336, 84, 576, 216, 16, "rgba(255,43,214,0.35)");
  g.fillStyle = NEON.red;
  g.beginPath();
  g.arc(364, 118, 7, 0, Math.PI * 2);
  g.fill();
  glowText("CANLI • CS2 — de_mirage", 380, 119, "800 17px Inter, sans-serif", "#ffffff", 6);
  glowText("16 : 12", 812, 119, "800 22px Manrope, sans-serif", NEON.amber, 12);

  const teams: Array<[string, string, number, string]> = [
    ["FAZE OYNA", "CT  •  4 sağ", 62, NEON.cyan],
    ["NAVI KLUB", "T  •  2 sağ", 38, NEON.magenta],
  ];
  teams.forEach(([name, sub, pct, color], i) => {
    const y = 148 + i * 68;
    g.fillStyle = INK;
    g.font = "700 16px Inter, sans-serif";
    g.fillText(name, 364, y + 16);
    g.fillStyle = DIM;
    g.font = "500 13px Inter, sans-serif";
    g.fillText(sub, 560, y + 16);
    g.fillStyle = "rgba(255,255,255,0.08)";
    g.beginPath();
    g.roundRect(364, y + 28, 520, 10, 5);
    g.fill();
    g.save();
    g.shadowColor = color;
    g.shadowBlur = 10;
    g.fillStyle = color;
    g.beginPath();
    g.roundRect(364, y + 28, (520 * pct) / 100, 10, 5);
    g.fill();
    g.restore();
  });

  // radar + tournament mini cards
  glass(336, 312, 280, 144, 16, "rgba(0,229,255,0.3)");
  glowText("RADAR", 360, 340, "800 13px Inter, sans-serif", NEON.cyan, 8);
  const rx = 476;
  const ry = 384;
  g.strokeStyle = "rgba(0,229,255,0.4)";
  for (const r of [52, 36, 20]) {
    g.lineWidth = 1.5;
    g.beginPath();
    g.arc(rx, ry, r, 0, Math.PI * 2);
    g.stroke();
  }
  const dots: Array<[number, number, string]> = [
    [-24, -18, NEON.green],
    [14, -28, NEON.green],
    [30, 12, NEON.red],
    [-8, 26, NEON.cyan],
    [4, 2, "#ffffff"],
  ];
  for (const [dx, dy, c] of dots) {
    g.save();
    g.shadowColor = c;
    g.shadowBlur = 8;
    g.fillStyle = c;
    g.beginPath();
    g.arc(rx + dx, ry + dy, 5, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }

  glass(632, 312, 280, 144, 16, "rgba(255,176,32,0.3)");
  glowText("GECƏ TURNİRİ 22:00", 656, 340, "800 13px Inter, sans-serif", NEON.amber, 8);
  glowText("500 AZN", 656, 378, "800 30px Manrope, sans-serif", "#ffffff", 10);
  g.fillStyle = DIM;
  g.font = "500 13px Inter, sans-serif";
  g.fillText("14 komanda qeydiyyatda", 656, 406);
  g.fillStyle = NEON.amber;
  g.beginPath();
  g.roundRect(656, 418, 120, 24, 12);
  g.fill();
  g.fillStyle = "#06070d";
  g.font = "800 12px Inter, sans-serif";
  g.textBaseline = "middle";
  g.fillText("QATIL", 692, 431);

  // ---- right: active players ----
  glass(928, 84, 308, 372, 16, "rgba(176,38,255,0.35)");
  glowText("AKTİV OYUNÇULAR", 952, 114, "800 15px Inter, sans-serif", NEON.purple, 8);
  const players: Array<[string, string, string, string]> = [
    ["RK", "Rəşad K.", "Valorant • PC-03", NEON.green],
    ["AN", "Aysel N.", "CS2 • PC-07", NEON.green],
    ["TM", "Tural M.", "Dota 2 • PC-11", NEON.amber],
    ["LN", "Lamiyə N.", "GTA V • PC-02", NEON.cyan],
  ];
  players.forEach(([tag, name, game, status], i) => {
    const y = 134 + i * 80;
    const grad = g.createLinearGradient(952, y, 996, y + 44);
    grad.addColorStop(0, "#2a2140");
    grad.addColorStop(1, "#12202c");
    g.fillStyle = grad;
    g.beginPath();
    g.roundRect(952, y, 44, 44, 12);
    g.fill();
    g.strokeStyle = status;
    g.lineWidth = 1.5;
    g.stroke();
    g.fillStyle = INK;
    g.font = "800 14px Inter, sans-serif";
    g.textBaseline = "middle";
    g.fillText(tag, 961, y + 23);
    g.fillStyle = INK;
    g.font = "700 15px Inter, sans-serif";
    g.fillText(name, 1008, y + 14);
    g.fillStyle = DIM;
    g.font = "500 13px Inter, sans-serif";
    g.fillText(game, 1008, y + 34);
    g.save();
    g.shadowColor = status;
    g.shadowBlur = 8;
    g.fillStyle = status;
    g.beginPath();
    g.arc(1212, y + 22, 5, 0, Math.PI * 2);
    g.fill();
    g.restore();
  });

  // ---- bottom bar ----
  g.fillStyle = "rgba(8,10,20,0.92)";
  g.fillRect(0, H - 56, W, 56);
  g.fillStyle = "rgba(0,229,255,0.3)";
  g.fillRect(0, H - 56, W, 2);
  const tabs: Array<[string, boolean, string]> = [
    ["Oyunlar", true, NEON.cyan],
    ["Turnirlər", false, DIM],
    ["Mağaza", false, DIM],
    ["Profil", false, DIM],
  ];
  let tx = 48;
  g.textBaseline = "middle";
  for (const [label, active, color] of tabs) {
    g.font = `${active ? "800" : "500"} 16px Inter, sans-serif`;
    if (active) {
      g.save();
      g.shadowColor = color;
      g.shadowBlur = 10;
      g.fillStyle = color;
      g.fillText(label, tx, H - 28);
      g.restore();
    } else {
      g.fillStyle = color;
      g.fillText(label, tx, H - 28);
    }
    tx += g.measureText(label).width + 36;
  }
  g.fillStyle = DIM;
  g.font = "500 14px Inter, sans-serif";
  g.textAlign = "right";
  g.fillText("oyna.app  •  Bakı  •  128 PC onlayn", W - 48, H - 28);
  g.textAlign = "left";

  // ---- scanlines + vignette ----
  g.fillStyle = "rgba(255,255,255,0.014)";
  for (let y = 0; y < H; y += 4) {
    g.fillRect(0, y, W, 1);
  }
  const vig = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.62);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.42)");
  g.fillStyle = vig;
  g.fillRect(0, 0, W, H);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
