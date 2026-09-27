import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  V3,
  type RgbEntry,
  rgbMat,
  type Mats,
  mesh,
  rbox,
} from "./common";

/**
 * Engineering-grade panoramic PC tower.
 *
 * Scale: 1 unit = 0.45 m (1 mm = 0.00222). Tower-local frame: +x = tempered
 * side glass, -x = solid cable side, +z = front glass, -z = rear panel,
 * +y = up. All parts live in `body`, whose origin sits FOOT above the desk:
 * y = 0 is the underside of the chassis base pan.
 */

export const TW = 0.52;
export const TH = 1.1;
export const TD = 1.0;
const FOOT = 0.022;
const T = 0.005; // sheet-steel thickness
const GL = 0.009; // tempered glass thickness

export interface TowerCtx {
  mats: Mats;
  rgb: RgbEntry[];
  braidBump: THREE.Texture;
}

export interface TowerBuild {
  group: THREE.Group;
  spinning: THREE.Group[]; // rotors, spin about local z
  powerLed: THREE.MeshStandardMaterial;
}

// ---------------------------------------------------------------------------
// Procedural maps (subtle)
// ---------------------------------------------------------------------------

function makePaintRoughness(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#7d7d7d";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 80; i++) {
    const v = 105 + Math.random() * 45;
    const r = 10 + Math.random() * 44;
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(${v},${v},${v},0.15)`);
    grad.addColorStop(1, `rgba(${v},${v},${v},0)`);
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeBrushRoughness(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#8c8c8c";
  g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 240; i++) {
    const v = 110 + Math.random() * 60;
    g.strokeStyle = `rgba(${v},${v},${v},0.22)`;
    g.lineWidth = 0.7;
    const y = Math.random() * 128;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(128, y + (Math.random() - 0.5) * 3);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makePerforationAlpha(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#000";
  g.fillRect(0, 0, 128, 128);
  g.fillStyle = "#fff";
  for (let y = 5; y < 128; y += 10) {
    for (let x = 5; x < 128; x += 10) {
      g.beginPath();
      g.arc(x + ((y / 10) % 2) * 5, y, 3.2, 0, Math.PI * 2);
      g.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeGrilleAlpha(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#000";
  g.fillRect(0, 0, 128, 128);
  g.strokeStyle = "#fff";
  g.lineWidth = 2.6;
  const r = 9;
  const dx = r * 1.76;
  const dy = r * 1.52;
  let row = 0;
  for (let y = r; y < 128 + r; y += dy, row++) {
    for (let x = r + (row % 2) * dx * 0.5; x < 128 + r; x += dx) {
      g.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        const px = x + Math.cos(a) * r * 0.85;
        const py = y + Math.sin(a) * r * 0.85;
        if (k === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.closePath();
      g.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeFinBump(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = "#808080";
  g.fillRect(0, 0, 64, 64);
  g.fillStyle = "#2c2c2c";
  for (let y = 0; y < 64; y += 3) g.fillRect(0, y, 64, 1.2);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 8);
  return tex;
}

// ---------------------------------------------------------------------------
// Materials
// ---------------------------------------------------------------------------

interface TMats {
  paint: THREE.MeshStandardMaterial;
  paintIn: THREE.MeshStandardMaterial;
  steel: THREE.MeshStandardMaterial;
  blackOx: THREE.MeshStandardMaterial;
  aluB: THREE.MeshStandardMaterial;
  anodized: THREE.MeshStandardMaterial;
  polymer: THREE.MeshStandardMaterial;
  polymerSatin: THREE.MeshStandardMaterial;
  rubber: THREE.MeshStandardMaterial;
  brass: THREE.MeshStandardMaterial;
  zinc: THREE.MeshStandardMaterial;
  copper: THREE.MeshStandardMaterial;
  gold: THREE.MeshStandardMaterial;
  pcb: THREE.MeshStandardMaterial;
  perf: THREE.MeshStandardMaterial;
  grille: THREE.MeshStandardMaterial;
  fin: THREE.MeshStandardMaterial;
  clear: THREE.MeshStandardMaterial;
  glass: THREE.MeshPhysicalMaterial;
  blade: THREE.MeshStandardMaterial;
  tube: THREE.MeshStandardMaterial;
  sleeve: { cyan: THREE.MeshStandardMaterial; green: THREE.MeshStandardMaterial; pink: THREE.MeshStandardMaterial };
  wireBlack: THREE.MeshStandardMaterial;
}

function towerMats(m: Mats, braidBump: THREE.Texture): TMats {
  const sleeve = (color: number) =>
    new THREE.MeshStandardMaterial({
      color, roughness: 0.62, metalness: 0,
      bumpMap: makeBrushRoughness(), bumpScale: 0.25,
      emissive: color, emissiveIntensity: 0.07,
    });
  return {
    paint: new THREE.MeshStandardMaterial({
      color: 0x191b1f, metalness: 0.55, roughness: 0.5, roughnessMap: makePaintRoughness(),
    }),
    paintIn: new THREE.MeshStandardMaterial({ color: 0x14161a, metalness: 0.5, roughness: 0.55 }),
    steel: new THREE.MeshStandardMaterial({ color: 0xa9adb4, metalness: 0.9, roughness: 0.38 }),
    blackOx: new THREE.MeshStandardMaterial({ color: 0x17171b, metalness: 0.82, roughness: 0.42 }),
    aluB: new THREE.MeshStandardMaterial({
      color: 0xb7bac1, metalness: 0.92, roughness: 0.36, roughnessMap: makeBrushRoughness(),
    }),
    anodized: new THREE.MeshStandardMaterial({ color: 0x191a1f, metalness: 0.9, roughness: 0.32 }),
    polymer: new THREE.MeshStandardMaterial({ color: 0x0d0e10, metalness: 0.05, roughness: 0.55 }),
    polymerSatin: new THREE.MeshStandardMaterial({ color: 0x15171b, metalness: 0.08, roughness: 0.4 }),
    rubber: m.rubber,
    brass: new THREE.MeshStandardMaterial({ color: 0xa98a3f, metalness: 1, roughness: 0.35 }),
    zinc: new THREE.MeshStandardMaterial({ color: 0xbfc3c9, metalness: 0.95, roughness: 0.3 }),
    copper: new THREE.MeshStandardMaterial({ color: 0xb0724a, metalness: 1, roughness: 0.32 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xc9a535, metalness: 1, roughness: 0.28 }),
    pcb: m.pcb,
    perf: new THREE.MeshStandardMaterial({
      color: 0x131418, metalness: 0.6, roughness: 0.55,
      alphaMap: makePerforationAlpha(), alphaTest: 0.5, side: THREE.DoubleSide,
    }),
    grille: new THREE.MeshStandardMaterial({
      color: 0x131418, metalness: 0.65, roughness: 0.5,
      alphaMap: makeGrilleAlpha(), alphaTest: 0.5, side: THREE.DoubleSide,
    }),
    fin: new THREE.MeshStandardMaterial({
      color: 0x1c1e23, metalness: 0.75, roughness: 0.5, bumpMap: makeFinBump(), bumpScale: 0.6,
    }),
    clear: new THREE.MeshStandardMaterial({
      color: 0xd8dde2, metalness: 0, roughness: 0.3, transparent: true, opacity: 0.4,
    }),
    glass: m.glass,
    blade: new THREE.MeshStandardMaterial({
      color: 0x1d2026, metalness: 0.15, roughness: 0.5, side: THREE.DoubleSide,
    }),
    tube: new THREE.MeshStandardMaterial({
      color: 0x141519, roughness: 0.7, metalness: 0.05, bumpMap: braidBump, bumpScale: 0.8,
    }),
    sleeve: { cyan: sleeve(0x0fa8c8), green: sleeve(0x1d9e4e), pink: sleeve(0xd84f9a) },
    wireBlack: new THREE.MeshStandardMaterial({ color: 0x101114, roughness: 0.7, metalness: 0 }),
  };
}

// ---------------------------------------------------------------------------
// Fasteners (instanced)
// ---------------------------------------------------------------------------

type FKind = "pan" | "panBlk" | "cap" | "thumb" | "standoff" | "fanScrew" | "washer" | "nut";

/** Geometry faces +z: head toward +z, shaft along -z. */
function fastenerGeo(kind: FKind): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const cyl = (r: number, h: number, z: number, seg = 14) => {
    const g = new THREE.CylinderGeometry(r, r, h, seg);
    g.rotateX(Math.PI / 2);
    g.translate(0, 0, z);
    parts.push(g);
  };
  switch (kind) {
    case "pan":
    case "panBlk": {
      cyl(0.0026, 0.006, -0.003, 10);
      cyl(0.006, 0.0022, 0.0011);
      const dome = new THREE.SphereGeometry(0.006, 12, 5, 0, Math.PI * 2, 0, Math.PI / 3);
      dome.scale(1, 1, 0.45);
      dome.translate(0, 0, 0.002);
      parts.push(dome);
      break;
    }
    case "cap": {
      cyl(0.0028, 0.008, -0.004, 10);
      cyl(0.0055, 0.0055, 0.0028);
      const hex = new THREE.CylinderGeometry(0.0026, 0.0026, 0.002, 6);
      hex.rotateX(Math.PI / 2);
      hex.translate(0, 0, 0.005);
      parts.push(hex);
      break;
    }
    case "thumb": {
      cyl(0.0028, 0.008, -0.004, 10);
      cyl(0.011, 0.004, 0.002, 14);
      cyl(0.0075, 0.0035, 0.006, 14);
      break;
    }
    case "standoff": {
      const hex = new THREE.CylinderGeometry(0.0045, 0.0045, 0.014, 6);
      hex.rotateX(Math.PI / 2);
      hex.translate(0, 0, -0.007);
      parts.push(hex);
      break;
    }
    case "fanScrew": {
      cyl(0.0026, 0.02, -0.01, 8);
      cyl(0.0075, 0.0025, 0.0012, 10);
      break;
    }
    case "washer": {
      parts.push(new THREE.TorusGeometry(0.0045, 0.0015, 6, 14));
      break;
    }
    case "nut": {
      cyl(0.0055, 0.0035, 0.0017, 6);
      break;
    }
  }
  return mergeGeometries(parts)!;
}

const F_MAT: Record<FKind, keyof TMats> = {
  pan: "zinc",
  panBlk: "blackOx",
  cap: "blackOx",
  thumb: "blackOx",
  standoff: "brass",
  fanScrew: "blackOx",
  washer: "zinc",
  nut: "blackOx",
};

type Axis = "x+" | "x-" | "y+" | "y-" | "z+" | "z-";
const AXIS_QUAT: Record<Axis, THREE.Quaternion> = {
  "x+": new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0)),
  "x-": new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 2, 0)),
  "y+": new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)),
  "y-": new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)),
  "z+": new THREE.Quaternion(),
  "z-": new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0)),
};

class Fasteners {
  private lists = new Map<FKind, THREE.Matrix4[]>();

  add(kind: FKind, x: number, y: number, z: number, axis: Axis): void {
    const mtx = new THREE.Matrix4().compose(
      new THREE.Vector3(x, y, z),
      AXIS_QUAT[axis],
      new THREE.Vector3(1, 1, 1),
    );
    let l = this.lists.get(kind);
    if (!l) this.lists.set(kind, (l = []));
    l.push(mtx);
  }

  build(parent: THREE.Object3D, tm: TMats): void {
    for (const [kind, mats4] of this.lists) {
      const im = new THREE.InstancedMesh(
        fastenerGeo(kind),
        tm[F_MAT[kind]] as THREE.Material,
        mats4.length,
      );
      mats4.forEach((m, i) => im.setMatrixAt(i, m));
      im.instanceMatrix.needsUpdate = true;
      im.castShadow = false;
      im.userData.part = "fasteners/" + kind;
      parent.add(im);
    }
    this.lists.clear();
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Tag + add a solid part (assembly/name) used by auditTower. */
function put(parent: THREE.Object3D, m: THREE.Object3D, part: string): THREE.Object3D {
  m.userData.part = part;
  parent.add(m);
  return m;
}

/** Mark a cable mesh so the audit can sample its path. */
function tagCable(m: THREE.Object3D, curve: THREE.Curve<THREE.Vector3>, r: number): void {
  m.userData.cable = { curve, r };
}

function shapeRect(x0: number, y0: number, x1: number, y1: number, r = 0): THREE.Path {
  const p = new THREE.Path();
  if (r > 0) {
    const rr = Math.min(r, Math.abs(x1 - x0) / 2 - 0.0001, Math.abs(y1 - y0) / 2 - 0.0001);
    p.moveTo(x0 + rr, y0);
    p.lineTo(x1 - rr, y0);
    p.absarc(x1 - rr, y0 + rr, rr, -Math.PI / 2, 0, false);
    p.lineTo(x1, y1 - rr);
    p.absarc(x1 - rr, y1 - rr, rr, 0, Math.PI / 2, false);
    p.lineTo(x0 + rr, y1);
    p.absarc(x0 + rr, y1 - rr, rr, Math.PI / 2, Math.PI, false);
    p.lineTo(x0, y0 + rr);
    p.absarc(x0 + rr, y0 + rr, rr, Math.PI, Math.PI * 1.5, false);
  } else {
    p.moveTo(x0, y0);
    p.lineTo(x1, y0);
    p.lineTo(x1, y1);
    p.lineTo(x0, y1);
  }
  p.closePath();
  return p;
}

/** Sheet with real holes, extruded along +z of the shape plane. */
function plateWithHoles(outer: THREE.Path, holes: THREE.Path[], depth: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape(outer.getPoints(24));
  shape.holes = holes;
  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    curveSegments: 20,
  });
}

/**
 * Case fan. Local frame: square plate in XY, bore/rotor on +z, depth along z.
 * 120 mm fan = size 0.267, depth 0.056. `gpu` = open-frame cooler fan.
 */
function buildFan(
  tm: TMats,
  rgb: RgbEntry[],
  opts: { size: number; depth: number; phase: number; gpu?: boolean },
): { group: THREE.Group; rotor: THREE.Group } {
  const group = new THREE.Group();
  const rotor = new THREE.Group();
  const s = opts.size;
  const d = opts.depth;
  const boreR = s / 2 - 0.018;
  const hubR = boreR * 0.38;

  if (opts.gpu) {
    const ring = mesh(new THREE.TorusGeometry(boreR + 0.004, 0.004, 8, 40), tm.polymer);
    ring.position.z = -d * 0.4;
    ring.castShadow = false;
    group.add(ring);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const strut = mesh(
        new THREE.BoxGeometry(boreR * 0.95, 0.006, 0.006),
        tm.polymer,
        Math.cos(a) * boreR * 0.5, Math.sin(a) * boreR * 0.5, -d * 0.4,
      );
      strut.rotation.z = a;
      strut.castShadow = false;
      group.add(strut);
    }
  } else {
    const outer = shapeRect(-s / 2, -s / 2, s / 2, s / 2, 0.016);
    const bore = new THREE.Path();
    bore.absarc(0, 0, boreR, 0, Math.PI * 2, true);
    const holes = [bore];
    const cs = s / 2 - 0.0235;
    for (const hx of [-cs, cs]) {
      for (const hy of [-cs, cs]) {
        const h = new THREE.Path();
        h.absarc(hx, hy, 0.0046, 0, Math.PI * 2, true);
        holes.push(h);
      }
    }
    const frame = new THREE.Mesh(plateWithHoles(outer, holes, d), tm.polymer);
    frame.position.z = -d / 2;
    frame.castShadow = true;
    frame.userData.allow = ["cables"]; // lead wires exit through the frame
    group.add(frame);
    const pads: THREE.BufferGeometry[] = [];
    for (const hx of [-cs, cs]) {
      for (const hy of [-cs, cs]) {
        const p = new THREE.CylinderGeometry(0.011, 0.011, 0.003, 10);
        p.rotateX(Math.PI / 2);
        p.translate(hx, hy, d / 2 + 0.0015);
        pads.push(p);
      }
    }
    const padMesh = new THREE.Mesh(mergeGeometries(pads)!, tm.rubber);
    padMesh.castShadow = false;
    group.add(padMesh);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const strut = mesh(
        new THREE.BoxGeometry(boreR - hubR + 0.02, 0.007, 0.008),
        tm.polymer,
        Math.cos(a) * (hubR + boreR) * 0.5,
        Math.sin(a) * (hubR + boreR) * 0.5,
        -d * 0.42,
      );
      strut.rotation.z = a;
      strut.castShadow = false;
      group.add(strut);
    }
  }

  const hub = mesh(new THREE.CylinderGeometry(hubR, hubR, d * 0.8, 22), tm.polymer);
  hub.rotation.x = Math.PI / 2;
  hub.castShadow = false;
  rotor.add(hub);
  const sticker = new THREE.Mesh(
    new THREE.CircleGeometry(hubR * 0.88, 22),
    new THREE.MeshStandardMaterial({ color: 0x22242a, roughness: 0.4, metalness: 0.1 }),
  );
  sticker.position.z = d * 0.4 + 0.001;
  rotor.add(sticker);

  // 9 twisted, swept blades merged into one geometry
  const bladeGeos: THREE.BufferGeometry[] = [];
  const seg = 7;
  for (let i = 0; i < 9; i++) {
    const g = new THREE.PlaneGeometry(1, 1, seg, 2);
    const pos = g.attributes.position;
    const a = (i / 9) * Math.PI * 2;
    for (let v = 0; v < pos.count; v++) {
      const u = (pos.getX(v) + 0.5); // 0 root → 1 tip
      const r0 = hubR + 0.004 + u * (boreR - hubR - 0.012);
      const chord = pos.getY(v) * boreR * 0.5 * (1.15 - u * 0.45); // taper
      const sweep = u * boreR * 0.22;
      const pitch = THREE.MathUtils.degToRad(38 - u * 16);
      const yLocal = chord + sweep * 0.4;
      const zLocal = Math.tan(pitch) * (r0 - hubR) * 0.6 + chord * Math.sin(pitch) * 0.5;
      pos.setXYZ(
        v,
        Math.cos(a) * r0 - Math.sin(a) * yLocal,
        Math.sin(a) * r0 + Math.cos(a) * yLocal,
        zLocal,
      );
    }
    g.computeVertexNormals();
    bladeGeos.push(g);
  }
  const blades = new THREE.Mesh(mergeGeometries(bladeGeos)!, tm.blade);
  blades.castShadow = false;
  rotor.add(blades);
  group.add(rotor);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(boreR - 0.003, 0.006, 8, 44),
    rgbMat(rgb, opts.phase, { base: 1.25 }),
  );
  ring.position.z = d / 2 - 0.005;
  ring.castShadow = false;
  group.add(ring);

  return { group, rotor };
}

/**
 * Bundle of sleeved wires along one path; per-wire offsets ride a
 * parallel-transport frame so the bundle stays organised through bends.
 */
function wireBundle(
  pts: THREE.Vector3[],
  count: number,
  r: number,
  mat: THREE.Material,
): { mesh: THREE.Mesh; curve: THREE.CatmullRomCurve3; outer: number } {
  const curve = new THREE.CatmullRomCurve3(pts);
  const n = Math.max(pts.length * 8, 28);
  const frames = curve.computeFrenetFrames(n, false);
  const geos: THREE.BufferGeometry[] = [];
  const rings = Math.min(count, 8);
  let outer = r;
  for (let w = 0; w < count; w++) {
    const layer = Math.floor(w / rings);
    const a = ((w % rings) / rings) * Math.PI * 2 + layer * 0.7;
    const off = r * (1.1 + layer * 2.2);
    outer = Math.max(outer, off + r);
    const wpts: THREE.Vector3[] = [];
    for (let i = 0; i <= n; i++) {
      const p = curve.getPoint(i / n);
      const offv = frames.normals[i].clone().multiplyScalar(Math.cos(a) * off)
        .add(frames.binormals[i].clone().multiplyScalar(Math.sin(a) * off));
      wpts.push(p.clone().add(offv));
    }
    geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(wpts), n, r, 6, false));
  }
  const m = new THREE.Mesh(mergeGeometries(geos)!, mat);
  m.castShadow = true;
  return { mesh: m, curve, outer };
}

function plugBody(tm: TMats, w: number, h: number, d: number): THREE.Group {
  const g = new THREE.Group();
  const housing = mesh(rbox(w, h, d, 0.002), tm.polymer);
  housing.userData.plug = true;
  const collar = mesh(rbox(w * 1.05, h * 0.5, 0.006, 0.001), tm.polymerSatin, 0, 0, -d / 2 - 0.002);
  collar.userData.plug = true;
  g.add(housing, collar);
  return g;
}

function cableComb(tm: TMats, w: number): THREE.Mesh {
  return mesh(rbox(w, 0.006, 0.014, 0.001), tm.clear);
}

function cableTube(
  parent: THREE.Object3D,
  pts: THREE.Vector3[],
  r: number,
  mat: THREE.Material,
  part: string,
): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3(pts);
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 36, r, 8, false), mat);
  m.castShadow = true;
  put(parent, m, part);
  tagCable(m, curve, r);
  return m;
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

export function buildTower(ctx: TowerCtx): TowerBuild {
  const { mats, rgb, braidBump } = ctx;
  const tm = towerMats(mats, braidBump);
  const tw = new THREE.Group();
  const body = new THREE.Group(); // y=0 → underside of the base pan
  body.position.y = FOOT;
  tw.add(body);
  const spinning: THREE.Group[] = [];
  let powerLed: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial();
  const f = new Fasteners();

  // =================== chassis ===================
  {
    for (const sx of [-0.2, 0.2]) {
      for (const sz of [-0.4, 0.4]) {
        put(body, mesh(new THREE.CylinderGeometry(0.03, 0.035, FOOT, 14), tm.rubber, sx, -FOOT / 2, sz),
          "chassis/feet");
      }
    }

    // base pan + folded flanges + PSU vent
    put(body, mesh(rbox(TW, T, TD, 0.0015), tm.paint, 0, T / 2, 0), "chassis/base");
    put(body, mesh(new THREE.BoxGeometry(TW - 0.01, 0.02, 0.002), tm.paintIn, 0, T + 0.01, -TD / 2 + 0.006), "chassis/base");
    put(body, mesh(new THREE.BoxGeometry(0.002, 0.02, TD - 0.01), tm.paintIn, -TW / 2 + 0.006, T + 0.01, 0), "chassis/base");
    const baseVent = mesh(new THREE.PlaneGeometry(0.3, 0.6), tm.perf, -0.04, T + 0.0006, -0.31);
    baseVent.rotation.x = -Math.PI / 2;
    baseVent.castShadow = false;
    put(body, baseVent, "chassis/base");

    // left solid side panel + return edges + rear thumbscrews
    put(body, mesh(rbox(T, TH, TD, 0.0015), tm.paint, -TW / 2 + T / 2, TH / 2, 0), "chassis/leftPanel");
    put(body, mesh(new THREE.BoxGeometry(0.016, TH - 0.02, 0.003), tm.paintIn, -TW / 2 + T + 0.008, TH / 2, TD / 2 - 0.0015), "chassis/leftPanel");
    put(body, mesh(new THREE.BoxGeometry(0.016, TH - 0.02, 0.003), tm.paintIn, -TW / 2 + T + 0.008, TH / 2, -TD / 2 + 0.0015), "chassis/leftPanel");
    f.add("thumb", -TW / 2 + T + 0.01, TH - 0.07, -TD / 2 - 0.004, "z-");
    f.add("thumb", -TW / 2 + T + 0.01, 0.07, -TD / 2 - 0.004, "z-");

    // rear panel: extruded sheet with real openings
    {
      const outer = shapeRect(-TW / 2, 0, TW / 2, TH);
      const holes: THREE.Path[] = [];
      const fanHole = new THREE.Path();
      fanHole.absarc(0.06, 0.795, 0.125, 0, Math.PI * 2, true);
      holes.push(fanHole);
      holes.push(shapeRect(-0.19, 0.62, -0.092, 0.97, 0.002));
      for (let i = 0; i < 7; i++) {
        const y0 = 0.3 + i * 0.045;
        holes.push(shapeRect(-0.19, y0 + 0.006, 0.077, y0 + 0.026, 0.002));
      }
      holes.push(shapeRect(0.095, 0.21, 0.24, 0.62, 0.002));
      holes.push(shapeRect(-0.2, 0.008, 0.115, 0.185, 0.002));
      const rear = new THREE.Mesh(plateWithHoles(outer, holes, T), tm.paint);
      rear.position.z = -TD / 2;
      rear.castShadow = true;
      rear.receiveShadow = true;
      put(body, rear, "chassis/rearPanel");

      // expansion slot covers + screws
      for (let i = 0; i < 7; i++) {
        const y0 = 0.3 + i * 0.045;
        put(body, mesh(new THREE.BoxGeometry(0.27, 0.032, 0.002), tm.steel, -0.0565, y0 + 0.016, -TD / 2 - 0.0005), "chassis/rearPanel");
        f.add("panBlk", 0.096, y0 + 0.016, -TD / 2 - 0.004, "z-");
      }
      // stamped grille over the exhaust opening
      const grille = mesh(new THREE.CircleGeometry(0.124, 40), tm.grille, 0.06, 0.795, -TD / 2 + 0.001);
      grille.rotation.y = Math.PI;
      grille.castShadow = false;
      put(body, grille, "chassis/rearPanel");
      // I/O shield plate
      put(body, mesh(new THREE.BoxGeometry(0.096, 0.348, 0.002), tm.steel, -0.141, 0.795, -TD / 2 + 0.0015), "chassis/ioShield");
      // removable vertical-mount slot plate covering the window
      {
        const o = shapeRect(0.078, 0.185, 0.258, 0.645, 0.004);
        const hh: THREE.Path[] = [];
        for (let i = 0; i < 4; i++) {
          const y0 = 0.26 + i * 0.1;
          hh.push(shapeRect(0.1, y0, 0.235, y0 + 0.058, 0.003));
        }
        const plate = new THREE.Mesh(plateWithHoles(o, hh, 0.0035), tm.paintIn);
        plate.position.z = -TD / 2 + 0.0006;
        plate.castShadow = true;
        put(body, plate, "chassis/rearPanel");
        f.add("panBlk", 0.252, 0.62, -TD / 2 - 0.004, "z-");
        f.add("panBlk", 0.252, 0.21, -TD / 2 - 0.004, "z-");
      }
    }

    // corner pillars: rear-right + front-left; front-right stays pillarless
    put(body, mesh(rbox(0.025, TH, 0.025, 0.002), tm.paint, TW / 2 - 0.0125, TH / 2, -TD / 2 + 0.0125), "chassis/pillars");
    put(body, mesh(rbox(0.025, TH, 0.025, 0.002), tm.paint, -TW / 2 + 0.0125, TH / 2, TD / 2 - 0.0125), "chassis/pillars");

    // top panel: sheet with radiator opening (shape x → world x, shape y → world z)
    {
      const outer = shapeRect(-TW / 2, -TD / 2, TW / 2, TD / 2);
      const holes: THREE.Path[] = [shapeRect(-0.02, -0.45, 0.247, 0.42, 0.004)];
      const geo = plateWithHoles(outer, holes, T);
      geo.rotateX(Math.PI / 2); // extrude +z → -y: panel spans y -T..0 under position.y
      const top = new THREE.Mesh(geo, tm.paint);
      top.position.y = TH;
      top.castShadow = true;
      top.receiveShadow = true;
      put(body, top, "chassis/topPanel");
      // perforated insert just under the opening
      const vent = mesh(new THREE.PlaneGeometry(0.267, 0.87), tm.perf, 0.1135, TH - T - 0.001, -0.015);
      vent.rotation.x = -Math.PI / 2;
      vent.castShadow = false;
      put(body, vent, "chassis/topPanel");
      f.add("thumb", -TW / 2 + 0.05, TH + 0.004, -TD / 2 + 0.06, "y+");
      f.add("thumb", TW / 2 - 0.05, TH + 0.004, -TD / 2 + 0.06, "y+");
    }

    // front I/O strip on the top panel
    {
      put(body, mesh(rbox(0.2, 0.008, 0.045, 0.002), tm.anodized, -0.1, TH + 0.002, 0.462), "chassis/io");
      const pwrMat = new THREE.MeshStandardMaterial({
        color: 0x0a0c0e, emissive: 0xe8f4ff, emissiveIntensity: 1.5, roughness: 0.4,
      });
      powerLed = pwrMat;
      const pwrRing = new THREE.Mesh(new THREE.TorusGeometry(0.008, 0.0022, 8, 24), pwrMat);
      pwrRing.rotation.x = Math.PI / 2;
      pwrRing.position.set(-0.17, TH + 0.0068, 0.462);
      put(body, pwrRing, "chassis/io");
      put(body, mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.004, 16), tm.polymer, -0.17, TH + 0.0065, 0.462), "chassis/io");
      put(body, mesh(rbox(0.02, 0.006, 0.012, 0.002), tm.polymer, -0.09, TH + 0.006, 0.462), "chassis/io");
      for (const x of [-0.045, -0.01]) {
        put(body, mesh(rbox(0.032, 0.007, 0.014, 0.0015), tm.polymer, x, TH + 0.0055, 0.462), "chassis/io");
        put(body, mesh(new THREE.BoxGeometry(0.026, 0.002, 0.01), tm.polymerSatin, x, TH + 0.0055, 0.462), "chassis/io");
      }
      put(body, mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.004, 14), tm.polymer, 0.05, TH + 0.006, 0.462), "chassis/io");
    }

    // tempered-glass slabs
    const glassF = mesh(new THREE.BoxGeometry(0.491, TH - 0.024, GL), tm.glass, 0.0105, TH / 2, TD / 2 - 0.0085);
    glassF.castShadow = false;
    glassF.renderOrder = 5;
    glassF.userData.allow = ["chassis"]; // seated in rails / against pillars
    put(body, glassF, "glass/front");
    const glassS = mesh(new THREE.BoxGeometry(GL, TH - 0.024, 0.961), tm.glass, TW / 2 - 0.0085, TH / 2, 0.0055);
    glassS.castShadow = false;
    glassS.renderOrder = 5;
    glassS.userData.allow = ["chassis"];
    put(body, glassS, "glass/side");

    // aluminium U-channels top & bottom, with rubber seat strips
    const gposF = TD / 2 - 0.0085; // 0.4915
    const gposS = TW / 2 - 0.0085; // 0.2515
    const half = GL / 2 + 0.0018;
    const rail = (dir: "front" | "side", yTop: boolean) => {
      const y = yTop ? TH - 0.018 : 0.018;
      const seatY = yTop ? y + 0.009 : y - 0.009;
      if (dir === "front") {
        put(body, mesh(new THREE.BoxGeometry(0.5, 0.026, 0.003), tm.aluB, 0.0105, y, gposF - half), "chassis/glassRails");
        put(body, mesh(new THREE.BoxGeometry(0.5, 0.026, 0.003), tm.aluB, 0.0105, y, gposF + half), "chassis/glassRails");
        put(body, mesh(new THREE.BoxGeometry(0.5, 0.004, GL + 0.003), tm.rubber, 0.0105, seatY, gposF), "chassis/glassRails");
      } else {
        put(body, mesh(new THREE.BoxGeometry(0.003, 0.026, 0.966), tm.aluB, gposS - half, y, 0.0035), "chassis/glassRails");
        put(body, mesh(new THREE.BoxGeometry(0.003, 0.026, 0.966), tm.aluB, gposS + half, y, 0.0035), "chassis/glassRails");
        put(body, mesh(new THREE.BoxGeometry(GL + 0.003, 0.004, 0.966), tm.rubber, gposS, seatY, 0.0035), "chassis/glassRails");
      }
    };
    rail("front", false);
    rail("side", false);
    rail("front", true);
    rail("side", true);
  }

  // =================== motherboard tray ===================
  {
    // tray plane: shape x → world z, shape y → world y; extrude → -x
    const outer = shapeRect(-0.495, 0.205, 0.44, TH - T);
    const holes: THREE.Path[] = [];
    for (const gy of [0.45, 0.62, 0.78]) holes.push(shapeRect(0.08, gy - 0.025, 0.16, gy + 0.025, 0.024));
    holes.push(shapeRect(-0.455, 0.975, -0.405, 1.03, 0.015));
    const geo = plateWithHoles(outer, holes, T);
    geo.rotateY(-Math.PI / 2); // extrude +z → -x; shape x → world z
    const tray = new THREE.Mesh(geo, tm.paintIn);
    tray.position.x = -0.205;
    tray.castShadow = true;
    tray.receiveShadow = true;
    put(body, tray, "tray/panel");

    // folded stiffening flange on the tray front edge
    put(body, mesh(new THREE.BoxGeometry(0.015, TH - T - 0.21, T), tm.paintIn, -0.1975, 0.65, 0.44), "tray/panel");

    // rubber grommets
    for (const gy of [0.45, 0.62, 0.78]) {
      const grom = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.007, 8, 24), tm.rubber);
      grom.scale.set(1, 0.42, 1);
      grom.rotation.y = Math.PI / 2;
      grom.position.set(-0.205, gy, 0.12);
      grom.castShadow = false;
      put(body, grom, "tray/grommets");
    }
    const gromTop = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.006, 8, 20), tm.rubber);
    gromTop.scale.set(0.75, 1, 1);
    gromTop.rotation.y = Math.PI / 2;
    gromTop.position.set(-0.205, 1.0, -0.43);
    gromTop.castShadow = false;
    put(body, gromTop, "tray/grommets");

    // fan/ARGB hub screwed to the tray face
    put(body, mesh(rbox(0.02, 0.035, 0.1, 0.002), tm.polymer, -0.194, 0.2525, 0.25), "tray/hub");
    f.add("panBlk", -0.183, 0.262, 0.21, "x+");
    f.add("panBlk", -0.183, 0.243, 0.29, "x+");
    const hubLed = new THREE.Mesh(
      new THREE.CircleGeometry(0.003, 10),
      new THREE.MeshStandardMaterial({ color: 0x050505, emissive: 0x00e5ff, emissiveIntensity: 1.4 }),
    );
    hubLed.rotation.y = Math.PI / 2;
    hubLed.position.set(-0.1835, 0.252, 0.25);
    hubLed.castShadow = false;
    put(body, hubLed, "tray/hub");
  }

  // =================== motherboard ===================
  const MBX = -0.1875; // motherboard +x face (standoff tips)
  {
    for (const sz of [-0.455, -0.2, 0.045]) {
      for (const sy of [0.3, 0.62, 0.94]) {
        f.add("standoff", -0.198, sy, sz, "x+");
        f.add("pan", -0.183, sy, sz, "x+");
      }
    }
    put(body, mesh(new THREE.BoxGeometry(0.0035, 0.68, 0.54), tm.pcb, MBX - 0.00175, 0.62, -0.205), "mobo/pcb");

    // I/O port blocks through the rear opening (stop short of the panel)
    put(body, mesh(new THREE.BoxGeometry(0.05, 0.06, 0.028), tm.steel, -0.16, 0.68, -0.48), "mobo/io");
    put(body, mesh(new THREE.BoxGeometry(0.05, 0.09, 0.028), tm.polymer, -0.16, 0.8, -0.48), "mobo/io");
    put(body, mesh(new THREE.BoxGeometry(0.05, 0.05, 0.028), tm.polymerSatin, -0.16, 0.92, -0.48), "mobo/io");

    // I/O cover, VRM heatsinks, chipset, M.2
    put(body, mesh(rbox(0.05, 0.315, 0.035, 0.004), tm.anodized, MBX + 0.025, 0.7975, -0.4575), "mobo/ioCover");
    put(body, mesh(rbox(0.035, 0.05, 0.25, 0.003), tm.anodized, MBX + 0.0175, 0.925, -0.205), "mobo/vrm");
    for (let i = 0; i < 6; i++) {
      const fin = mesh(new THREE.BoxGeometry(0.012, 0.05, 0.008), tm.blackOx, MBX + 0.035, 0.925, -0.3 + i * 0.038);
      fin.castShadow = false;
      put(body, fin, "mobo/vrm");
    }
    put(body, mesh(rbox(0.04, 0.26, 0.08, 0.003), tm.anodized, MBX + 0.02, 0.77, -0.4), "mobo/vrm");
    put(body, mesh(rbox(0.02, 0.12, 0.13, 0.002), tm.anodized, MBX + 0.01, 0.4, -0.035), "mobo/chipset");
    put(body, mesh(rbox(0.012, 0.06, 0.11, 0.002), tm.aluB, MBX + 0.006, 0.47, -0.1), "mobo/m2");

    // CPU socket frame (cooler mounts onto it — intentional overlap)
    const sock1 = mesh(new THREE.BoxGeometry(0.004, 0.115, 0.115), tm.polymer, MBX + 0.002, 0.78, -0.2);
    const sock2 = mesh(new THREE.BoxGeometry(0.006, 0.09, 0.09), tm.steel, MBX + 0.003, 0.78, -0.2);
    sock1.userData.allow = ["cooler"];
    sock2.userData.allow = ["cooler"];
    put(body, sock1, "mobo/socket");
    put(body, sock2, "mobo/socket");

    // PCIe slots + latch
    put(body, mesh(new THREE.BoxGeometry(0.012, 0.014, 0.2), tm.steel, MBX + 0.006, 0.5825, -0.34), "mobo/slots");
    put(body, mesh(new THREE.BoxGeometry(0.012, 0.014, 0.05), tm.polymer, MBX + 0.006, 0.53, -0.375), "mobo/slots");
    put(body, mesh(new THREE.BoxGeometry(0.012, 0.014, 0.2), tm.polymer, MBX + 0.006, 0.455, -0.32), "mobo/slots");
    put(body, mesh(new THREE.BoxGeometry(0.01, 0.02, 0.014), tm.polymerSatin, MBX + 0.006, 0.5825, -0.245), "mobo/slots");

    // DIMM slots + 4 sticks
    const dimmZ = [-0.075, -0.052, -0.029, -0.006];
    for (let i = 0; i < 4; i++) {
      const z = dimmZ[i];
      put(body, mesh(new THREE.BoxGeometry(0.01, 0.3, 0.012), tm.polymer, MBX + 0.005, 0.778, z), "mobo/dimms");
      for (const ly of [0.64, 0.916]) {
        put(body, mesh(new THREE.BoxGeometry(0.012, 0.02, 0.016), tm.polymerSatin, MBX + 0.005, ly, z), "mobo/dimms");
      }
      put(body, mesh(new THREE.BoxGeometry(0.094, 0.284, 0.008), tm.pcb, MBX + 0.05, 0.778, z), "mobo/ram" + i);
      put(body, mesh(rbox(0.006, 0.27, 0.014, 0.001), tm.anodized, MBX + 0.047, 0.778, z), "mobo/ram" + i);
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(0.096, 0.012, 0.014),
        rgbMat(rgb, 0.7 + i * 0.05, { base: 1.3 }),
      );
      bar.position.set(MBX + 0.05, 0.928, z);
      bar.castShadow = false;
      put(body, bar, "mobo/ram" + i);
    }

    // 24-pin + EPS sockets + headers (receptacles: plugs may overlap them)
    for (const [part, m] of [
      ["mobo/conn24", mesh(new THREE.BoxGeometry(0.016, 0.12, 0.025), tm.polymer, MBX + 0.008, 0.74, 0.0475)],
      ["mobo/connEps", mesh(new THREE.BoxGeometry(0.014, 0.03, 0.04), tm.polymer, MBX + 0.007, 0.94, -0.415)],
      ["mobo/headers", mesh(new THREE.BoxGeometry(0.008, 0.01, 0.028), tm.polymerSatin, MBX + 0.004, 0.95, -0.345)],
      ["mobo/headers", mesh(new THREE.BoxGeometry(0.008, 0.01, 0.028), tm.polymerSatin, MBX + 0.004, 0.95, -0.1)],
      ["mobo/headers", mesh(new THREE.BoxGeometry(0.008, 0.01, 0.028), tm.polymerSatin, MBX + 0.004, 0.3, 0.04)],
    ] as Array<[string, THREE.Mesh]>) {
      m.userData.plug = true;
      put(body, m, part);
    }

    // SMD caps + chokes
    const capGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.008, 10);
    const caps = new THREE.InstancedMesh(capGeo, tm.polymerSatin, 14);
    const dummy = new THREE.Object3D();
    const capPos: Array<[number, number]> = [];
    for (let i = 0; i < 7; i++) capPos.push([0.87 + (i % 2) * 0.018, -0.34 + i * 0.038]);
    for (let i = 0; i < 7; i++) capPos.push([0.6 + (i % 2) * 0.018, -0.36 - (i % 3) * 0.012]);
    capPos.forEach(([cy, cz], i) => {
      dummy.position.set(MBX + 0.005, cy, cz);
      dummy.rotation.set(0, 0, Math.PI / 2);
      dummy.updateMatrix();
      caps.setMatrixAt(i, dummy.matrix);
    });
    caps.castShadow = false;
    caps.userData.part = "mobo/smd";
    body.add(caps);
    const chokeGeo = new THREE.BoxGeometry(0.008, 0.007, 0.007);
    const chokes = new THREE.InstancedMesh(chokeGeo, tm.blackOx, 8);
    for (let i = 0; i < 8; i++) {
      dummy.position.set(MBX + 0.004, 0.62 + i * 0.032, -0.345);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      chokes.setMatrixAt(i, dummy.matrix);
    }
    chokes.castShadow = false;
    chokes.userData.part = "mobo/smd";
    body.add(chokes);
  }

  // =================== CPU pump + radiator ===================
  {
    // retention bracket + 4 thumb nuts on standoffs
    put(body, mesh(new THREE.BoxGeometry(0.006, 0.17, 0.05), tm.steel, MBX + 0.004, 0.78, -0.2), "cooler/retention");
    put(body, mesh(new THREE.BoxGeometry(0.006, 0.05, 0.17), tm.steel, MBX + 0.004, 0.78, -0.2), "cooler/retention");
    for (const [dy, dz] of [[0.062, 0.062], [0.062, -0.062], [-0.062, 0.062], [-0.062, -0.062]]) {
      f.add("standoff", -0.18, 0.78 + dy, -0.2 + dz, "x+");
      f.add("thumb", -0.168, 0.78 + dy, -0.2 + dz, "x+");
    }
    // cold plate → base ring → body → trim → display
    const cold = mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.006, 28), tm.copper, -0.1845, 0.78, -0.2);
    cold.rotation.z = Math.PI / 2;
    put(body, cold, "cooler/pump");
    const base = mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.012, 28), tm.anodized, -0.1755, 0.78, -0.2);
    base.rotation.z = Math.PI / 2;
    put(body, base, "cooler/pump");
    const pbody = mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.05, 32), tm.polymerSatin, -0.1445, 0.78, -0.2);
    pbody.rotation.z = Math.PI / 2;
    put(body, pbody, "cooler/pump");
    const trim = mesh(new THREE.TorusGeometry(0.062, 0.004, 10, 40), tm.aluB, -0.1195, 0.78, -0.2);
    trim.rotation.y = Math.PI / 2;
    put(body, trim, "cooler/pump");
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.045, 32), tm.polymer);
    face.rotation.y = Math.PI / 2;
    face.position.set(-0.1185, 0.78, -0.2);
    put(body, face, "cooler/pump");
    const dispRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.04, 0.004, 8, 36),
      rgbMat(rgb, 0.66, { base: 1.2 }),
    );
    dispRing.rotation.y = Math.PI / 2;
    dispRing.position.set(-0.118, 0.78, -0.2);
    dispRing.castShadow = false;
    put(body, dispRing, "cooler/pump");
    const logo = new THREE.Mesh(
      new THREE.CircleGeometry(0.016, 20),
      new THREE.MeshStandardMaterial({ color: 0x0a0c0e, emissive: 0xbfe9ff, emissiveIntensity: 1.1 }),
    );
    logo.rotation.y = Math.PI / 2;
    logo.position.set(-0.117, 0.78, -0.2);
    put(body, logo, "cooler/pump");

    // rotary 90° fittings on the upper side of the pump body
    for (const dz of [-0.024, 0.024]) {
      const fit = mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.026, 14), tm.blackOx, -0.152, 0.842, -0.2 + dz);
      fit.rotation.z = 0.5;
      put(body, fit, "cooler/fittings");
      const collar = mesh(new THREE.CylinderGeometry(0.0135, 0.0135, 0.01, 6), tm.blackOx, -0.146, 0.858, -0.2 + dz);
      collar.rotation.z = 0.5;
      put(body, collar, "cooler/fittings");
    }

    // sleeved tubes → radiator end-tank fittings
    cableTube(body, [
      V3(-0.146, 0.865, -0.224), V3(-0.05, 0.885, -0.245), V3(0.03, 0.93, -0.32),
      V3(0.05, 0.955, -0.4), V3(0.06, 0.985, -0.435), V3(0.07, 1.0, -0.445),
    ], 0.014, tm.tube, "cooler/tubes");
    cableTube(body, [
      V3(-0.146, 0.862, -0.176), V3(-0.02, 0.875, -0.19), V3(0.07, 0.92, -0.27),
      V3(0.1, 0.95, -0.37), V3(0.14, 0.985, -0.43), V3(0.155, 1.0, -0.445),
    ], 0.014, tm.tube, "cooler/tubes");
    for (const fx of [0.07, 0.155]) {
      put(body, mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.03, 14), tm.blackOx, fx, 1.012, -0.445), "cooler/fittings");
    }

    // pump power cable → top-edge header
    const pc = cableTube(body, [
      V3(-0.15, 0.83, -0.16), V3(-0.165, 0.88, -0.34), V3(-0.18, 0.93, -0.37), V3(-0.1835, 0.95, -0.345),
    ], 0.0022, tm.wireBlack, "cables/pump");
    pc.castShadow = false;
  }

  // =================== radiator + top fans ===================
  {
    for (const rx of [-0.01, 0.23]) {
      put(body, mesh(new THREE.BoxGeometry(0.02, 0.008, 0.94), tm.steel, rx, TH - T - 0.004, -0.015), "chassis/radRails");
      for (const rz of [-0.4, 0.37]) f.add("pan", rx, TH - T - 0.001, rz, "y+");
    }
    const radCore = mesh(rbox(0.26, 0.06, 0.8, 0.002), tm.fin, 0.1095, 1.057, 0);
    radCore.userData.allow = ["chassis"];
    put(body, radCore, "cooler/radiator");
    put(body, mesh(rbox(0.19, 0.058, 0.06, 0.004), tm.anodized, 0.1095, 1.056, -0.43), "cooler/radiator");
    put(body, mesh(rbox(0.262, 0.058, 0.03, 0.004), tm.anodized, 0.1095, 1.056, 0.415), "cooler/radiator");
    for (const sx of [-0.0195, 0.2405]) {
      put(body, mesh(new THREE.BoxGeometry(0.003, 0.05, 0.86), tm.aluB, sx, 1.057, -0.005), "cooler/radiator");
    }
    for (const rx of [-0.01, 0.23]) {
      for (const rz of [-0.35, 0.32]) {
        f.add("washer", rx, 1.089, rz, "y+");
        f.add("pan", rx, 1.091, rz, "y+");
      }
    }
    for (let i = 0; i < 3; i++) {
      const fz = -0.267 + i * 0.267;
      const { group, rotor } = buildFan(tm, rgb, { size: 0.267, depth: 0.056, phase: 0.1 + i * 0.09 });
      group.position.set(0.1095, 0.999, fz);
      group.rotation.x = Math.PI / 2;
      body.add(group);
      group.traverse((o) => {
        if (o instanceof THREE.Mesh) o.userData.part = "fans/top" + i;
      });
      spinning.push(rotor);
      const cs = 0.267 / 2 - 0.0235;
      for (const sx of [-cs, cs]) {
        for (const sz of [-cs, cs]) f.add("fanScrew", 0.1095 + sx, 0.969, fz + sz, "y-");
      }
    }
    const fc = cableTube(body, [
      V3(-0.01, 0.972, -0.3), V3(-0.12, 0.966, -0.33), V3(-0.183, 0.952, -0.345),
    ], 0.0022, tm.wireBlack, "cables/fans");
    fc.castShadow = false;
  }

  // =================== rear exhaust fan ===================
  {
    const { group, rotor } = buildFan(tm, rgb, { size: 0.267, depth: 0.056, phase: 0.9 });
    group.position.set(0.06, 0.795, -0.463);
    group.rotation.y = Math.PI;
    body.add(group);
    group.traverse((o) => {
      if (o instanceof THREE.Mesh) o.userData.part = "fan/rear";
    });
    spinning.push(rotor);
    const cs = 0.267 / 2 - 0.0235;
    for (const sx of [-cs, cs]) {
      for (const sy of [-cs, cs]) f.add("fanScrew", 0.06 + sx, 0.795 + sy, -TD / 2 - 0.004, "z-");
    }
    const fc = cableTube(body, [
      V3(0.17, 0.85, -0.434), V3(-0.05, 0.9, -0.425), V3(-0.17, 0.93, -0.38), V3(-0.1835, 0.95, -0.345),
    ], 0.0022, tm.wireBlack, "cables/fans");
    fc.castShadow = false;
  }

  // =================== PSU + shroud ===================
  const SHROUD_TOP = 0.205;
  {
    put(body, mesh(rbox(0.333, 0.19, 0.356, 0.004), tm.polymerSatin, -0.0435, T + 0.095, -0.312), "psu/body");
    const grille = mesh(new THREE.CircleGeometry(0.075, 28), tm.grille, -0.0435, T + 0.0006, -0.312);
    grille.rotation.x = Math.PI / 2;
    put(body, grille, "psu/body");
    const rearFace = mesh(new THREE.PlaneGeometry(0.3, 0.17), tm.grille, -0.0435, 0.098, -TD / 2 - 0.0005);
    rearFace.rotation.y = Math.PI;
    rearFace.castShadow = false;
    put(body, rearFace, "psu/rear");
    const iec = mesh(rbox(0.06, 0.045, 0.02, 0.002), tm.polymer, -0.15, 0.06, -TD / 2 + 0.004);
    iec.userData.plug = true;
    put(body, iec, "psu/rear");
    const psw = mesh(rbox(0.025, 0.02, 0.015, 0.001), tm.polymerSatin, -0.06, 0.06, -TD / 2 + 0.004);
    psw.userData.plug = true;
    put(body, psw, "psu/rear");
    for (const [sx, sy] of [[-0.18, 0.02], [0.09, 0.02], [-0.18, 0.17], [0.09, 0.17]]) {
      f.add("panBlk", sx, sy, -TD / 2 - 0.004, "z-");
    }
    for (let i = 0; i < 4; i++) {
      const s = mesh(new THREE.BoxGeometry(0.028, 0.02, 0.012), tm.polymer, -0.13 + i * 0.07, 0.12, -0.128);
      s.userData.plug = true;
      put(body, s, "psu/sockets");
    }

    // shroud top plate: shape x → world x, shape y → world z
    const o = shapeRect(-0.205, -0.472, 0.242, 0.43);
    const hh: THREE.Path[] = [];
    for (const fz of [-0.08, 0.2]) {
      const c = new THREE.Path();
      c.absarc(0.02, fz, 0.115, 0, Math.PI * 2, true);
      hh.push(c);
    }
    hh.push(shapeRect(-0.2, 0.29, -0.16, 0.36, 0.01));
    const sgeo = plateWithHoles(o, hh, T);
    sgeo.rotateX(Math.PI / 2); // extrude → -y; shape y → world z
    const topPlate = new THREE.Mesh(sgeo, tm.paintIn);
    topPlate.position.y = SHROUD_TOP + T;
    topPlate.castShadow = true;
    topPlate.receiveShadow = true;
    put(body, topPlate, "shroud/top");

    // folded faces + perforated vents + screws
    put(body, mesh(new THREE.BoxGeometry(0.447, 0.185, T), tm.paintIn, 0.0185, 0.1025, 0.4275), "shroud/front");
    const frontVent = mesh(new THREE.PlaneGeometry(0.3, 0.1), tm.perf, 0.02, 0.1, 0.4305);
    frontVent.castShadow = false;
    put(body, frontVent, "shroud/front");
    put(body, mesh(new THREE.BoxGeometry(T, 0.185, 0.9), tm.paintIn, 0.2395, 0.1025, -0.02), "shroud/side");
    const sideVent = mesh(new THREE.PlaneGeometry(0.5, 0.08), tm.perf, 0.2425, 0.1, 0.1);
    sideVent.rotation.y = Math.PI / 2;
    sideVent.castShadow = false;
    put(body, sideVent, "shroud/side");
    for (const [sx, sz] of [[-0.17, 0.4], [0.22, 0.4], [-0.17, -0.46], [0.22, -0.46]]) {
      f.add("panBlk", sx, SHROUD_TOP + T + 0.002, sz, "y+");
    }
    const grom = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.006, 8, 20), tm.rubber);
    grom.scale.set(1, 0.7, 1);
    grom.rotation.x = Math.PI / 2;
    grom.rotation.z = Math.PI / 2;
    grom.position.set(-0.18, SHROUD_TOP + T + 0.001, 0.3225);
    grom.castShadow = false;
    put(body, grom, "shroud/grommet");
  }

  // =================== bottom intake fans ===================
  for (let i = 0; i < 2; i++) {
    const fz = [-0.08, 0.2][i];
    const { group, rotor } = buildFan(tm, rgb, { size: 0.267, depth: 0.056, phase: 0.25 + i * 0.08 });
    group.position.set(0.02, SHROUD_TOP + T + 0.028, fz);
    group.rotation.x = -Math.PI / 2;
    body.add(group);
    group.traverse((o) => {
      if (o instanceof THREE.Mesh) o.userData.part = "fans/bottom" + i;
    });
    spinning.push(rotor);
    const cs = 0.267 / 2 - 0.0235;
    for (const sx of [-cs, cs]) {
      for (const sz of [-cs, cs]) f.add("fanScrew", 0.02 + sx, SHROUD_TOP + T + 0.057, fz + sz, "y+");
    }
    const fc = cableTube(
      body,
      i === 0
        ? [V3(-0.09, 0.266, -0.15), V3(-0.15, 0.218, -0.02), V3(-0.18, 0.213, 0.3)]
        : [V3(-0.09, 0.266, 0.13), V3(-0.14, 0.218, 0.25), V3(-0.18, 0.213, 0.31)],
      0.0022,
      tm.wireBlack,
      "cables/fans",
    );
    fc.castShadow = false;
  }

  // =================== GPU (vertical mount) ===================
  {
    // backplate + vent slots + screws
    put(body, mesh(rbox(0.004, 0.29, 0.707, 0.001), tm.anodized, 0.102, 0.445, -0.1335), "gpu/backplate");
    for (let i = 0; i < 5; i++) {
      const slot = mesh(new THREE.BoxGeometry(0.002, 0.012, 0.09), tm.blackOx, 0.1045, 0.34 + i * 0.03, 0.12);
      slot.castShadow = false;
      put(body, slot, "gpu/backplate");
    }
    for (const [sy, sz] of [[0.33, -0.44], [0.56, -0.44], [0.33, 0.17], [0.56, 0.17]]) {
      f.add("panBlk", 0.104, sy, sz, "x-");
    }
    put(body, mesh(new THREE.BoxGeometry(0.004, 0.28, 0.7), tm.pcb, 0.106, 0.447, -0.135), "gpu/pcb");
    put(body, mesh(new THREE.BoxGeometry(0.006, 0.02, 0.19), tm.gold, 0.106, 0.295, -0.36), "gpu/fingers");

    // fin stack + heatpipes
    const finGeo = new THREE.BoxGeometry(0.095, 0.24, 0.0016);
    const fins = new THREE.InstancedMesh(finGeo, tm.aluB, 88);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 88; i++) {
      dummy.position.set(0.1565, 0.44, -0.45 + i * 0.0075);
      dummy.updateMatrix();
      fins.setMatrixAt(i, dummy.matrix);
    }
    fins.castShadow = false;
    fins.userData.part = "gpu/heatsink";
    body.add(fins);
    for (let i = 0; i < 5; i++) {
      const hp = mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.55, 10), tm.copper, 0.155, 0.565 - i * 0.012, -0.14);
      hp.rotation.x = Math.PI / 2;
      hp.castShadow = false;
      put(body, hp, "gpu/heatsink");
      const bend = mesh(new THREE.TorusGeometry(0.012, 0.004, 8, 12, Math.PI / 2), tm.copper, 0.155, 0.565 - i * 0.012, 0.14);
      bend.rotation.y = Math.PI / 2;
      bend.castShadow = false;
      put(body, bend, "gpu/heatsink");
    }

    // shroud with 3 fan bores: shape x → world z, extrude → -x
    {
      const o = shapeRect(-0.487, 0.3, 0.22, 0.59, 0.008);
      const hh: THREE.Path[] = [];
      for (const fz of [-0.33, -0.12, 0.09]) {
        const c = new THREE.Path();
        c.absarc(fz, 0.445, 0.095, 0, Math.PI * 2, true);
        hh.push(c);
      }
      const sgeo = plateWithHoles(o, hh, 0.03);
      sgeo.rotateY(-Math.PI / 2); // extrude → -x, shape x → world z, shape y → world y
      const shroud = new THREE.Mesh(sgeo, tm.polymerSatin);
      shroud.position.x = 0.235;
      shroud.castShadow = true;
      put(body, shroud, "gpu/shroud");
      put(body, mesh(new THREE.BoxGeometry(0.002, 0.02, 0.6), tm.aluB, 0.236, 0.565, -0.13), "gpu/shroud");
      const logo = new THREE.Mesh(
        new THREE.PlaneGeometry(0.14, 0.02),
        new THREE.MeshStandardMaterial({ color: 0x0a0c0e, emissive: 0x9fb4c8, emissiveIntensity: 0.7, roughness: 0.5 }),
      );
      logo.rotation.y = Math.PI / 2;
      logo.position.set(0.236, 0.34, -0.13);
      put(body, logo, "gpu/shroud");
    }
    for (let i = 0; i < 3; i++) {
      const fz = [-0.33, -0.12, 0.09][i];
      const { group, rotor } = buildFan(tm, rgb, { size: 0.21, depth: 0.022, phase: 0.4 + i * 0.07, gpu: true });
      group.position.set(0.214, 0.445, fz);
      group.rotation.y = Math.PI / 2;
      body.add(group);
      group.traverse((o) => {
        if (o instanceof THREE.Mesh) o.userData.part = "gpu/fans";
      });
      spinning.push(rotor);
    }

    // I/O bracket at the rear end: shape x → world y, shape y → -world x
    {
      const o = shapeRect(0.3, -0.235, 0.59, -0.1);
      const hh: THREE.Path[] = [];
      for (let i = 0; i < 3; i++) hh.push(shapeRect(0.335 + i * 0.055, -0.2, 0.372 + i * 0.055, -0.13, 0.002));
      hh.push(shapeRect(0.5, -0.19, 0.55, -0.125, 0.002));
      const bgeo = plateWithHoles(o, hh, 0.008);
      bgeo.rotateZ(Math.PI / 2); // shape x → world y, shape y → world x (negated coords)
      const br = new THREE.Mesh(bgeo, tm.steel);
      br.position.z = -0.4945;
      put(body, br, "gpuMount/bracket");
      f.add("panBlk", 0.24, 0.56, -0.486, "z-");
      f.add("panBlk", 0.24, 0.33, -0.486, "z-");
    }

    // 16-pin socket on the GPU top edge
    const pwrSock = mesh(rbox(0.03, 0.012, 0.045, 0.002), tm.polymer, 0.16, 0.596, 0.12);
    pwrSock.userData.plug = true;
    put(body, pwrSock, "gpu/pwrSocket");

    // vertical-mount bracket: rear foot + arm + receptacle + leg to the shroud
    put(body, mesh(rbox(0.13, 0.05, 0.006, 0.001), tm.blackOx, 0.16, 0.24, -0.491), "gpuMount/bracket");
    put(body, mesh(new THREE.BoxGeometry(0.05, 0.012, 0.26), tm.blackOx, 0.135, 0.274, -0.36), "gpuMount/bracket");
    put(body, mesh(new THREE.BoxGeometry(0.04, 0.07, 0.012), tm.blackOx, 0.135, 0.245, -0.26), "gpuMount/bracket");
    f.add("panBlk", 0.135, 0.202, -0.26, "y-");
    f.add("panBlk", 0.11, 0.24, -0.4945, "z-");
    f.add("panBlk", 0.21, 0.24, -0.4945, "z-");
    const riserSlot = mesh(rbox(0.07, 0.03, 0.21, 0.002), tm.polymer, 0.106, 0.287, -0.36);
    riserSlot.userData.plug = true; // GPU edge connector seats into it
    put(body, riserSlot, "gpuMount/riserSlot");

    // front support post (base flange on the shroud, pad under the GPU edge)
    put(body, mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.086, 12), tm.blackOx, 0.2, 0.253, 0.19), "gpuMount/post");
    put(body, mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.006, 12), tm.blackOx, 0.2, SHROUD_TOP + T + 0.003, 0.19), "gpuMount/post");
    put(body, mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.004, 12), tm.rubber, 0.2, 0.298, 0.19), "gpuMount/post");

    // riser ribbon: mobo x16 plug → +x → down → receptacle
    const ribbonShape = shapeRect(-0.09, -0.0015, 0.09, 0.0015);
    const ribbonPath = new THREE.CatmullRomCurve3([
      V3(-0.16, 0.5825, -0.34), V3(-0.1, 0.585, -0.34), V3(0.0, 0.56, -0.34),
      V3(0.035, 0.45, -0.345), V3(0.045, 0.33, -0.355), V3(0.07, 0.29, -0.36),
    ]);
    const ribbon = new THREE.Mesh(
      new THREE.ExtrudeGeometry(new THREE.Shape(ribbonShape.getPoints(24)), {
        steps: 60, bevelEnabled: false, extrudePath: ribbonPath,
      }),
      tm.polymerSatin,
    );
    ribbon.castShadow = true;
    put(body, ribbon, "gpuMount/ribbon");
    tagCable(ribbon, ribbonPath, 0.012);
    const riserPlug = plugBody(tm, 0.03, 0.014, 0.21);
    riserPlug.rotation.z = Math.PI / 2;
    riserPlug.position.set(-0.169, 0.5825, -0.34);
    body.add(riserPlug);
    riserPlug.traverse((o) => {
      if (o instanceof THREE.Mesh) o.userData.part = "gpuMount/ribbon";
    });
  }

  // =================== sleeved PSU cables ===================
  {
    // 24-pin ATX (cyan)
    const p24 = plugBody(tm, 0.028, 0.12, 0.026);
    p24.rotation.y = Math.PI / 2;
    p24.position.set(MBX + 0.024, 0.74, 0.0475);
    body.add(p24);
    p24.traverse((o) => {
      if (o instanceof THREE.Mesh) o.userData.part = "cables/atx";
    });
    const atx = wireBundle(
      [
        V3(MBX + 0.04, 0.74, 0.0475), V3(-0.1, 0.75, 0.07), V3(-0.09, 0.79, 0.115),
        V3(-0.14, 0.8, 0.128), V3(-0.2, 0.792, 0.12), V3(-0.222, 0.762, 0.11),
        V3(-0.225, 0.45, 0.06), V3(-0.222, 0.16, -0.05), V3(-0.06, 0.12, -0.124),
      ],
      12, 0.0036, tm.sleeve.cyan,
    );
    put(body, atx.mesh, "cables/atx");
    tagCable(atx.mesh, atx.curve, atx.outer);
    const comb1 = cableComb(tm, 0.02);
    comb1.position.set(-0.1, 0.762, 0.098);
    comb1.rotation.y = 0.55;
    comb1.rotation.x = 0.35;
    put(body, comb1, "cables/atx");
    const comb2 = cableComb(tm, 0.02);
    comb2.position.set(-0.135, 0.798, 0.128);
    comb2.rotation.z = -0.35;
    put(body, comb2, "cables/atx");

    // 8-pin EPS (green)
    const pEps = plugBody(tm, 0.028, 0.028, 0.04);
    pEps.rotation.y = Math.PI / 2;
    pEps.position.set(MBX + 0.024, 0.94, -0.415);
    body.add(pEps);
    pEps.traverse((o) => {
      if (o instanceof THREE.Mesh) o.userData.part = "cables/eps";
    });
    const eps = wireBundle(
      [
        V3(MBX + 0.04, 0.94, -0.415), V3(-0.12, 0.945, -0.425), V3(-0.1, 0.99, -0.43),
        V3(-0.16, 1.008, -0.43), V3(-0.228, 0.995, -0.43), V3(-0.228, 0.6, -0.42),
        V3(-0.225, 0.2, -0.35), V3(0.01, 0.12, -0.124),
      ],
      8, 0.0036, tm.sleeve.green,
    );
    put(body, eps.mesh, "cables/eps");
    tagCable(eps.mesh, eps.curve, eps.outer);
    const comb3 = cableComb(tm, 0.014);
    comb3.position.set(-0.115, 0.978, -0.428);
    put(body, comb3, "cables/eps");

    // 12V-2x6 GPU power (pink)
    const pGpu = plugBody(tm, 0.028, 0.022, 0.042);
    pGpu.position.set(0.16, 0.613, 0.12);
    body.add(pGpu);
    pGpu.traverse((o) => {
      if (o instanceof THREE.Mesh) o.userData.part = "cables/gpu";
    });
    const gpu = wireBundle(
      [
        V3(-0.13, 0.13, -0.1), V3(-0.18, 0.15, 0.05), V3(-0.18, 0.185, 0.29),
        V3(-0.18, 0.2075, 0.3225), V3(-0.18, 0.24, 0.335), V3(-0.17, 0.32, 0.32), V3(-0.15, 0.45, 0.28),
        V3(-0.06, 0.55, 0.22), V3(0.04, 0.6, 0.16), V3(0.12, 0.618, 0.13), V3(0.16, 0.612, 0.12),
      ],
      12, 0.0036, tm.sleeve.pink,
    );
    put(body, gpu.mesh, "cables/gpu");
    tagCable(gpu.mesh, gpu.curve, gpu.outer);
    const comb4 = cableComb(tm, 0.02);
    comb4.position.set(-0.15, 0.43, 0.287);
    comb4.rotation.z = 0.55;
    put(body, comb4, "cables/gpu");
    const comb5 = cableComb(tm, 0.02);
    comb5.position.set(-0.04, 0.558, 0.208);
    comb5.rotation.z = 0.9;
    put(body, comb5, "cables/gpu");
    const pGpuPsu = plugBody(tm, 0.028, 0.02, 0.02);
    pGpuPsu.position.set(-0.13, 0.125, -0.116);
    body.add(pGpuPsu);
    pGpuPsu.traverse((o) => {
      if (o instanceof THREE.Mesh) o.userData.part = "cables/gpu";
    });
  }

  // interior fill light
  const innerLight = new THREE.PointLight(0xffffff, 1.0, 1.9, 2);
  innerLight.position.set(0.1, 0.7, 0.08);
  body.add(innerLight);

  f.build(body, tm);
  return { group: tw, spinning, powerLed };
}

// ---------------------------------------------------------------------------
// Audit: floating / intersecting part report (inspection page)
// ---------------------------------------------------------------------------

interface BoxedPart {
  part: string;
  box: THREE.Box3;
  plug: boolean;
  allow: string[];
  mesh?: THREE.Mesh; // set for single (non-instanced) meshes: parity tests
}

function boxDist(a: THREE.Box3, b: THREE.Box3): number {
  const dx = Math.max(0, Math.max(a.min.x - b.max.x, b.min.x - a.max.x));
  const dy = Math.max(0, Math.max(a.min.y - b.max.y, b.min.y - a.max.y));
  const dz = Math.max(0, Math.max(a.min.z - b.max.z, b.min.z - a.max.z));
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/** Is `m` a solid (closed-ish) geometry worth parity-testing? */
function isSolidGeo(m: THREE.Mesh): boolean {
  const t = m.geometry.type;
  return t !== "PlaneGeometry" && t !== "CircleGeometry";
}

/** Raycast parity: inside iff odd crossing count on a majority of axis pairs.
 * Pairs are needed because Mesh.raycast culls back faces (FrontSide materials),
 * and multiple axes avoid false positives on tangential/grazing hits. */
function pointInside(m: THREE.Mesh, pLocal: THREE.Vector3, world: THREE.Matrix4): boolean {
  const wp = pLocal.clone().applyMatrix4(world);
  let insideVotes = 0;
  for (const ax of [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)]) {
    let count = 0;
    for (const s of [1, -1]) {
      const ray = new THREE.Raycaster(wp, ax.clone().multiplyScalar(s));
      ray.far = 10;
      const hits = ray.intersectObject(m, false);
      let last = -1;
      for (const h of hits) {
        if (Math.abs(h.distance - last) > 1e-5) count++;
        last = h.distance;
      }
    }
    if (count % 2 === 1) insideVotes++;
  }
  return insideVotes >= 2;
}

/** Returns a list of findings; empty = clean. Group should be `body` space. */
export function auditTower(group: THREE.Object3D): string[] {
  group.updateWorldMatrix(true, true);
  const inv = new THREE.Matrix4().copy(group.matrixWorld).invert();
  const solids: BoxedPart[] = [];
  const cables: Array<{ part: string; curve: THREE.Curve<THREE.Vector3>; r: number }> = [];
  const tmpM = new THREE.Matrix4();

  group.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    const part = m.userData.part as string | undefined;
    if (!part || part.startsWith("fasteners")) return;
    if (m.userData.cable) {
      cables.push({
        part,
        curve: m.userData.cable.curve as THREE.Curve<THREE.Vector3>,
        r: m.userData.cable.r as number,
      });
      return; // cables are audited against solids via sampling, not AABB
    }
    const allow = (m.userData.allow as string[]) ?? [];
    if (m instanceof THREE.InstancedMesh) {
      if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
      const gb = m.geometry.boundingBox!;
      for (let i = 0; i < m.count; i++) {
        m.getMatrixAt(i, tmpM);
        const box = new THREE.Box3()
          .copy(gb)
          .applyMatrix4(tmpM)
          .applyMatrix4(m.matrixWorld)
          .applyMatrix4(inv);
        solids.push({ part: `${part}#${i}`, box, plug: !!m.userData.plug, allow });
      }
      return;
    }
    const box = new THREE.Box3().setFromObject(m).applyMatrix4(inv);
    solids.push({ part, box, plug: !!m.userData.plug, allow, mesh: m });
  });

  const report: string[] = [];
  const asm = (p: string) => p.split("/")[0];
  const basePart = (p: string) => p.split("#")[0];
  const eps = 0.0006;
  const allowed = (a: BoxedPart, b: BoxedPart) =>
    a.allow.includes(asm(b.part)) || b.allow.includes(asm(a.part)) ||
    a.allow.includes(basePart(b.part)) || b.allow.includes(basePart(a.part));

  for (let i = 0; i < solids.length; i++) {
    for (let j = i + 1; j < solids.length; j++) {
      const a = solids[i];
      const b = solids[j];
      if (asm(a.part) === asm(b.part)) continue;
      const ox = Math.min(a.box.max.x, b.box.max.x) - Math.max(a.box.min.x, b.box.min.x);
      const oy = Math.min(a.box.max.y, b.box.max.y) - Math.max(a.box.min.y, b.box.min.y);
      const oz = Math.min(a.box.max.z, b.box.max.z) - Math.max(a.box.min.z, b.box.min.z);
      if (ox > eps && oy > eps && oz > eps) {
        if (allowed(a, b)) continue;
        if ((a.plug || b.plug) && Math.min(ox, oy, oz) < 0.012) continue; // plug-in-socket
        const cx = (Math.max(a.box.min.x, b.box.min.x) + Math.min(a.box.max.x, b.box.max.x)) / 2;
        const cy = (Math.max(a.box.min.y, b.box.min.y) + Math.min(a.box.max.y, b.box.max.y)) / 2;
        const cz = (Math.max(a.box.min.z, b.box.min.z) + Math.min(a.box.max.z, b.box.max.z)) / 2;
        report.push(
          `INTERSECT ${a.part} x ${b.part} @(${cx.toFixed(2)},${cy.toFixed(2)},${cz.toFixed(2)}) ` +
            `(${Math.max(0, ox * 450).toFixed(0)}x${Math.max(0, oy * 450).toFixed(0)}x${Math.max(0, oz * 450).toFixed(0)}mm)`,
        );
      }
    }
  }

  for (const cb of cables) {
    const len = cb.curve.getLength();
    const n = Math.max(24, Math.ceil(len / 0.008));
    const hits = new Set<string>();
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      if (u < 0.05 || u > 0.95) continue; // connector zones exempt
      const p = cb.curve.getPoint(u);
      for (const s of solids) {
        if (asm(s.part) === asm(cb.part) || s.plug) continue;
        if (s.allow.includes(asm(cb.part)) || s.allow.includes(basePart(cb.part))) continue;
        if (s.box.distanceToPoint(p) < cb.r * 0.6) {
          // inside the AABB: confirm with parity raycast on the real mesh
          let inside = true;
          if (s.mesh && isSolidGeo(s.mesh)) {
            inside = pointInside(s.mesh, p, group.matrixWorld);
          }
          if (inside) hits.add(`CABLE ${cb.part}@${u.toFixed(2)} (${p.x.toFixed(3)},${p.y.toFixed(3)},${p.z.toFixed(3)}) inside ${s.part}`);
        }
      }
    }
    for (const h of hits) report.push(h);
  }

  for (const s of solids) {
    if (asm(s.part) === "cables") continue; // combs/plugs ride on the (non-solid) bundles
    let nearest = Infinity;
    for (const o of solids) {
      if (o === s) continue;
      const d = boxDist(s.box, o.box);
      if (d < nearest) nearest = d;
    }
    if (nearest > 0.022) {
      report.push(`FLOATING ${s.part} (nearest ${(nearest * 450).toFixed(0)}mm)`);
    }
  }
  return [...new Set(report)];
}
