import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export const V3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------------------
// RGB registry: spectrum-wave hue cycling + breathing intensity
// ---------------------------------------------------------------------------

export interface RgbEntry {
  mat: THREE.MeshStandardMaterial;
  phase: number;
  speed: number;
  base: number;
}

const _rgbColor = new THREE.Color();

export function applyRgb(e: RgbEntry, t: number): void {
  _rgbColor.setHSL((t * e.speed + e.phase) % 1, 1, 0.58);
  e.mat.emissive.copy(_rgbColor);
  e.mat.emissiveIntensity = e.base + Math.sin(t * 2.2 + e.phase * Math.PI * 2) * 0.5;
}

export function rgbMat(
  list: RgbEntry[],
  phase: number,
  opts?: { speed?: number; base?: number },
): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({
    color: 0x0b0c10,
    roughness: 0.35,
    metalness: 0.1,
    emissive: 0xffffff,
    emissiveIntensity: 2,
  });
  list.push({ mat: m, phase, speed: opts?.speed ?? 0.07, base: opts?.base ?? 2.1 });
  return m;
}

// ---------------------------------------------------------------------------
// Canvas textures
// ---------------------------------------------------------------------------

/** Radial soft-disc texture used for fake contact AO and wall glows. */
export function makeGlowTexture(inner: string, outer: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(128, 128, 8, 128, 128, 128);
  grad.addColorStop(0, inner);
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Perforated dot pattern for mesh panels and radiator fins. */
export function makeVentTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#808080";
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = "#1a1a1a";
  for (let y = 8; y < 256; y += 16) {
    for (let x = 8; x < 256; x += 16) {
      g.beginPath();
      g.arc(x + ((y / 16) % 2) * 8, y, 4.5, 0, Math.PI * 2);
      g.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 6);
  return tex;
}

/** Fine fabric noise for the desk mat. */
export function makeFabricTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#808080";
  g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 2600; i++) {
    const v = 110 + Math.random() * 40;
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(Math.random() * 128, Math.random() * 128, 1.4, 1.4);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 3);
  return tex;
}

/** Honeycomb perforation bump for the ultralight mouse shell. */
export function makeHoneycombTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#8a8a8a";
  g.fillRect(0, 0, 128, 128);
  g.fillStyle = "#101010";
  const r = 7;
  const dx = r * 1.78;
  const dy = r * 1.55;
  let row = 0;
  for (let y = 6; y < 128 + r; y += dy, row++) {
    for (let x = 6 + (row % 2) * dx * 0.5; x < 128 + r; x += dx) {
      g.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2 + Math.PI / 6;
        const px = x + Math.cos(a) * r * 0.72;
        const py = y + Math.sin(a) * r * 0.72;
        if (k === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.closePath();
      g.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  return tex;
}

/** Diagonal weave bump for braided AIO tubes and the paracord cable. */
export function makeBraidTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = "#7d7d7d";
  g.fillRect(0, 0, 64, 64);
  g.strokeStyle = "#2e2e2e";
  g.lineWidth = 3;
  for (let i = -64; i < 128; i += 8) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i + 64, 64);
    g.stroke();
  }
  g.strokeStyle = "#a8a8a8";
  g.lineWidth = 1.5;
  for (let i = -64; i < 128; i += 8) {
    g.beginPath();
    g.moveTo(i + 64, 0);
    g.lineTo(i, 64);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 2);
  return tex;
}

/** Diagonal sheen used as a subtle glass reflection over the screen. */
export function makeSheenTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, "rgba(255,255,255,0.20)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.05)");
  grad.addColorStop(0.55, "rgba(255,255,255,0.0)");
  grad.addColorStop(0.8, "rgba(255,255,255,0.07)");
  grad.addColorStop(1, "rgba(255,255,255,0.0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Neon wall sign for the cyber-cafe backdrop. */
export function makeNeonSignTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 160;
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, 512, 160);
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.save();
  g.shadowColor = "#00e5ff";
  g.shadowBlur = 26;
  g.fillStyle = "#d8fbff";
  g.font = "800 64px Manrope, Inter, sans-serif";
  g.fillText("OYNA", 256, 58);
  g.restore();
  g.save();
  g.shadowColor = "#ff2bd6";
  g.shadowBlur = 20;
  g.fillStyle = "#ffd7f6";
  g.font = "700 30px Inter, sans-serif";
  g.fillText("• VIP CYBER CLUB •", 256, 118);
  g.restore();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// ---------------------------------------------------------------------------
// Materials & small builders
// ---------------------------------------------------------------------------

export interface Mats {
  matte: THREE.MeshStandardMaterial;
  plastic: THREE.MeshStandardMaterial;
  rubber: THREE.MeshStandardMaterial;
  fabric: THREE.MeshStandardMaterial;
  satin: THREE.MeshStandardMaterial;
  alu: THREE.MeshStandardMaterial;
  darkMetal: THREE.MeshStandardMaterial;
  chrome: THREE.MeshStandardMaterial;
  glass: THREE.MeshPhysicalMaterial;
  inner: THREE.MeshStandardMaterial;
  pcb: THREE.MeshStandardMaterial;
}

export function buildMaterials(fabricBump: THREE.Texture): Mats {
  return {
    matte: new THREE.MeshStandardMaterial({ color: 0x131417, roughness: 0.62, metalness: 0.25 }),
    plastic: new THREE.MeshStandardMaterial({ color: 0x0e0f11, roughness: 0.42, metalness: 0.1 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x17181b, roughness: 0.95, metalness: 0 }),
    fabric: new THREE.MeshStandardMaterial({
      color: 0x1b1d24, roughness: 1, metalness: 0, bumpMap: fabricBump, bumpScale: 0.6,
    }),
    satin: new THREE.MeshStandardMaterial({ color: 0x8f9298, roughness: 0.34, metalness: 0.85 }),
    alu: new THREE.MeshStandardMaterial({ color: 0xb9bcc2, roughness: 0.42, metalness: 0.9 }),
    darkMetal: new THREE.MeshStandardMaterial({ color: 0x35373c, roughness: 0.45, metalness: 0.8 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xdfe3ea, roughness: 0.15, metalness: 1 }),
    // Tempered-glass panels: near-clear transmission so the interior
    // (motherboard, RAM, GPU, fans) stays fully readable at any angle.
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xf2f8ff, roughness: 0.02, metalness: 0,
      transmission: 1, thickness: 0.005, ior: 1.52,
      transparent: true, opacity: 0.08,
      clearcoat: 1, clearcoatRoughness: 0.03,
      envMapIntensity: 1.6, specularIntensity: 1,
      side: THREE.DoubleSide, depthWrite: false,
    }),
    inner: new THREE.MeshStandardMaterial({ color: 0x1d1f23, roughness: 0.55, metalness: 0.4 }),
    pcb: new THREE.MeshStandardMaterial({ color: 0x14201a, roughness: 0.5, metalness: 0.55 }),
  };
}

export function mesh(
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  x = 0, y = 0, z = 0,
): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function rbox(w: number, h: number, d: number, r = 0.012): RoundedBoxGeometry {
  return new RoundedBoxGeometry(w, h, d, 3, Math.min(r, Math.min(w, h, d) / 2.2));
}

export function tube(points: THREE.Vector3[], radius: number, mat: THREE.Material): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3(points);
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, radius, 8, false), mat);
  m.castShadow = true;
  return m;
}
