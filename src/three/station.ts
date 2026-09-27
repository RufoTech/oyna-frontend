import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { createOynaScreenTexture } from "./screenUi";
import {
  V3,
  type RgbEntry,
  applyRgb,
  rgbMat,
  makeGlowTexture,
  makeFabricTexture,
  makeHoneycombTexture,
  makeBraidTexture,
  makeSheenTexture,
  makeNeonSignTexture,
  buildMaterials,
  mesh,
  rbox,
  tube,
} from "./common";
import { buildTower } from "./tower";

export interface StationOptions {
  reducedMotion: boolean;
  onReady?: () => void;
}

export interface StationHandle {
  setVisible: (visible: boolean) => void;
  setScrollProgress: (progress: number) => void;
  /** 360° orbit mode: auto-rotate + drag-to-orbit around the station. */
  setAutoRotate: (enabled: boolean) => void;
  isAutoRotating: () => boolean;
  dispose: () => void;
}

/**
 * Cylindrical-segment panel for the curved ultrawide: edges sweep toward the
 * viewer (+z) on a circle of the given radius, UVs preserved for the screen.
 */
function curvedPlane(w: number, h: number, radius: number, seg = 48): THREE.PlaneGeometry {
  const geo = new THREE.PlaneGeometry(w, h, seg, 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    pos.setZ(i, radius - Math.sqrt(Math.max(1e-6, radius * radius - x * x)));
  }
  geo.computeVertexNormals();
  return geo;
}

/** Horizontal edge strip following the same cylindrical arc (top/bottom). */
function curvedStrip(w: number, d: number, radius: number): THREE.PlaneGeometry {
  const geo = new THREE.PlaneGeometry(w, d, 48, 1);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    pos.setZ(i, pos.getZ(i) + (radius - Math.sqrt(Math.max(1e-6, radius * radius - x * x))));
  }
  geo.computeVertexNormals();
  return geo;
}

export function createStation(canvas: HTMLCanvasElement, opts: StationOptions): StationHandle | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    return null;
  }

  const isMobile = () => canvas.clientWidth < 640;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x05060a, 10, 22);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  const camBase = V3(2.1, 1.85, 4.7);
  const camLook = V3(-0.05, 0.55, -0.2);

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.06).texture;
  RectAreaLightUniformsLib.init();

  // ---------------- lights: cool key + animated cyber RGB ----------------
  scene.add(new THREE.HemisphereLight(0x4a5170, 0x05060a, 0.55));

  const key = new THREE.RectAreaLight(0xffffff, 4.2, 4, 3);
  key.position.set(-3.4, 3.4, 3.6);
  key.lookAt(0, 0.4, 0);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xcfd6ff, 1.8);
  rim.position.set(3.6, 4.4, -2.6);
  rim.castShadow = true;
  rim.shadow.mapSize.set(2048, 2048);
  rim.shadow.camera.near = 0.5;
  rim.shadow.camera.far = 16;
  rim.shadow.camera.left = -4;
  rim.shadow.camera.right = 4;
  rim.shadow.camera.top = 4;
  rim.shadow.camera.bottom = -3;
  rim.shadow.bias = -0.0002;
  rim.shadow.normalBias = 0.02;
  rim.shadow.radius = 5;
  scene.add(rim);
  scene.add(rim.target);

  const screenGlow = new THREE.PointLight(0x00c8ff, 8, 7, 2);
  screenGlow.position.set(0, 0.95, 0.5);
  scene.add(screenGlow);

  const haloLight = new THREE.PointLight(0xff2bd6, 10, 7, 2);
  haloLight.position.set(0, 0.9, -1.35);
  scene.add(haloLight);

  const underglow = new THREE.PointLight(0x00ff88, 5, 5, 2);
  underglow.position.set(0, -0.5, 0.6);
  scene.add(underglow);

  const towerGlow = new THREE.PointLight(0xb026ff, 1.2, 2.2, 2);
  towerGlow.position.set(1.95, 0.65, -0.25);
  scene.add(towerGlow);

  const fill = new THREE.DirectionalLight(0xbfc2c9, 0.4);
  fill.position.set(-2, 1.4, 4.5);
  scene.add(fill);

  // ---------------- materials & textures ----------------
  const fabricTex = makeFabricTexture();
  const mats = buildMaterials(fabricTex);
  const glowTex = makeGlowTexture("rgba(0,0,0,0.5)", "rgba(0,0,0,0)");
  const honeyBump = makeHoneycombTexture();
  const braidBump = makeBraidTexture();
  const braidMat = new THREE.MeshStandardMaterial({
    color: 0x14161b, roughness: 0.7, metalness: 0.15, bumpMap: braidBump, bumpScale: 1.4,
  });

  const rig = new THREE.Group();
  scene.add(rig);
  const rgb: RgbEntry[] = [];
  const spinning: THREE.Group[] = [];
  let powerLed: THREE.MeshStandardMaterial | null = null;
  let monitorLed: THREE.MeshStandardMaterial | null = null;

  const addAO = (x: number, z: number, sx: number, sz: number, opacity = 0.85, y = 0.004) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(sx, sz),
      new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, opacity, depthWrite: false }),
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y, z);
    m.renderOrder = 1;
    rig.add(m);
  };

  // ---------------- floor, grid & cyber-cafe backdrop ----------------
  {
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(14, 48),
      new THREE.MeshStandardMaterial({ color: 0x07080d, roughness: 0.8, metalness: 0.25 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.78;
    floor.receiveShadow = true;
    rig.add(floor);

    const grid = new THREE.GridHelper(26, 52, 0x00e5ff, 0x1a2138);
    const gridMat = grid.material as THREE.Material;
    gridMat.transparent = true;
    gridMat.opacity = 0.18;
    grid.position.y = -0.775;
    rig.add(grid);

    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(22, 8),
      new THREE.MeshStandardMaterial({ color: 0x05060b, roughness: 0.95, metalness: 0 }),
    );
    wall.position.set(0, 2.4, -5.4);
    wall.receiveShadow = true;
    rig.add(wall);

    // neon wall strips + sign
    for (const [sx, phase] of [[-3.4, 0.55], [3.4, 0.05]] as const) {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(0.07, 3.4, 0.07),
        rgbMat(rgb, phase, { base: 2.6 }),
      );
      strip.position.set(sx, 1.6, -5.3);
      rig.add(strip);
    }
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 1.125),
      new THREE.MeshBasicMaterial({ map: makeNeonSignTexture(), transparent: true, toneMapped: false, fog: false }),
    );
    sign.position.set(0, 3.0, -5.32);
    rig.add(sign);

    const haloL = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 6),
      new THREE.MeshBasicMaterial({
        map: makeGlowTexture("rgba(255,43,214,0.30)", "rgba(5,6,10,0)"),
        transparent: true, depthWrite: false, fog: false,
      }),
    );
    haloL.position.set(-3.6, 2.0, -5.2);
    rig.add(haloL);
    const haloR = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 6),
      new THREE.MeshBasicMaterial({
        map: makeGlowTexture("rgba(0,229,255,0.30)", "rgba(5,6,10,0)"),
        transparent: true, depthWrite: false, fog: false,
      }),
    );
    haloR.position.set(3.6, 2.0, -5.2);
    rig.add(haloR);
  }

  // ---------------- desk ----------------
  {
    const desk = new THREE.Group();
    const top = mesh(rbox(5.0, 0.1, 2.2, 0.03), mats.matte, 0, -0.05, 0.05);
    desk.add(top);
    // RGB edge strip along the front lip
    const edge = new THREE.Mesh(
      new THREE.BoxGeometry(5.0, 0.018, 0.018),
      rgbMat(rgb, 0.5, { base: 2.4 }),
    );
    edge.position.set(0, -0.062, 1.16);
    desk.add(edge);
    for (const sx of [-2.1, 2.1]) {
      desk.add(mesh(rbox(0.09, 0.72, 1.7, 0.02), mats.plastic, sx, -0.45, 0.05));
    }
    // cable tray under desk
    desk.add(mesh(new THREE.BoxGeometry(2.4, 0.07, 0.16), mats.inner, 0, -0.16, -0.7));
    rig.add(desk);
  }

  // ---------------- curved ultrawide gaming monitor ----------------
  {
    const mon = new THREE.Group();
    const sw = 2.5; // 21:9 panel
    const sh = (sw * 9) / 21;
    const R = 4.2; // ~1500R-class curvature at scene scale
    const monY = 0.86;
    const monZ = -0.62;
    const arc = (x: number) => R - Math.sqrt(Math.max(1e-6, R * R - x * x));

    // front bezel + rear shroud: same cylindrical arc, 0.055 shell depth.
    // DoubleSide shell materials so the housing reads solid from side angles.
    const shellMat = mats.plastic.clone();
    shellMat.side = THREE.DoubleSide;
    const shellInner = mats.inner.clone();
    shellInner.side = THREE.DoubleSide;
    const bezel = new THREE.Mesh(curvedPlane(sw + 0.08, sh + 0.08, R), shellMat);
    bezel.position.set(0, monY, monZ);
    bezel.castShadow = true;
    mon.add(bezel);
    const shroud = new THREE.Mesh(curvedPlane(sw + 0.08, sh + 0.08, R), shellInner);
    shroud.position.set(0, monY, monZ - 0.055);
    mon.add(shroud);
    // top / bottom edges follow the same arc
    for (const s of [-1, 1]) {
      const strip = new THREE.Mesh(curvedStrip(sw + 0.08, 0.058, R), shellMat);
      strip.position.set(0, monY + (s * (sh + 0.08)) / 2, monZ - 0.0275);
      mon.add(strip);
    }
    // aggressive angular side fins + cyber corner wedges
    const tangent = Math.asin((sw / 2 + 0.04) / R);
    for (const s of [-1, 1]) {
      const fin = mesh(
        new THREE.BoxGeometry(0.05, sh + 0.1, 0.075), mats.darkMetal,
        s * (sw / 2 + 0.04), monY, monZ + arc(sw / 2 + 0.04) - 0.028,
      );
      fin.rotation.y = -s * tangent;
      mon.add(fin);
      for (const sy of [-1, 1]) {
        const wedge = mesh(
          new THREE.ConeGeometry(0.045, 0.1, 4), mats.darkMetal,
          s * (sw / 2 + 0.045), monY + (sy * (sh + 0.08)) / 2, monZ + arc(sw / 2 + 0.045) - 0.028,
        );
        wedge.rotation.y = Math.PI / 4 - s * tangent;
        wedge.castShadow = false;
        mon.add(wedge);
      }
    }

    // curved screen + glass sheen (UV-preserving bend)
    const screenTex = createOynaScreenTexture();
    const screen = new THREE.Mesh(
      curvedPlane(sw, sh, R, 64),
      new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }),
    );
    screen.position.set(0, monY, monZ + 0.0025);
    mon.add(screen);
    const sheen = new THREE.Mesh(
      curvedPlane(sw, sh, R, 32),
      new THREE.MeshBasicMaterial({ map: makeSheenTexture(), transparent: true, depthWrite: false }),
    );
    sheen.position.set(0, monY, monZ + 0.0045);
    mon.add(sheen);

    // chin bar follows the panel arc so it never floats or sinks into the bezel
    const chinY = monY - sh / 2 - 0.012;
    const chin = new THREE.Mesh(curvedPlane(0.5, 0.018, R, 24), mats.darkMetal);
    chin.position.set(0, chinY, monZ + 0.002);
    mon.add(chin);
    const ledMat = new THREE.MeshStandardMaterial({ color: 0x061014, emissive: 0x00e5ff, emissiveIntensity: 2.4 });
    monitorLed = ledMat;
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.009, 12, 12), ledMat);
    led.position.set(0.19, chinY, monZ + 0.007 + arc(0.19));
    mon.add(led);

    // rear detail: VESA plate + vents + RGB halo ring + light blades.
    // All sit behind the shroud plane (rel -0.055); blades follow the arc.
    const vesa = mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.02, 6), mats.plastic, 0, monY - 0.05, monZ - 0.067);
    vesa.rotation.x = Math.PI / 2;
    mon.add(vesa);
    for (let i = 0; i < 6; i++) {
      mon.add(mesh(new THREE.BoxGeometry(0.5, 0.008, 0.005), mats.rubber, 0, monY - 0.53 + i * 0.028, monZ - 0.061));
    }
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.34, 0.026, 12, 64),
      rgbMat(rgb, 0.85, { base: 2.8 }),
    );
    halo.position.set(0, monY, monZ - 0.086);
    mon.add(halo);
    for (const s of [-1, 1]) {
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.022, 0.72, 0.012),
        rgbMat(rgb, 0.85 + s * 0.04, { base: 2.4 }),
      );
      blade.position.set(s * 0.58, monY, monZ + arc(0.58) - 0.065);
      mon.add(blade);
    }

    // V-stand: splayed feet meet under the column, neck rises behind the
    // RGB halo and bridges forward to the VESA plate through the ring opening
    for (const s of [-1, 1]) {
      const leg = mesh(rbox(0.58, 0.035, 0.09, 0.012), mats.matte, s * 0.21, 0.0265, -0.51);
      leg.rotation.y = -s * 0.55;
      mon.add(leg);
      const pad = mesh(new THREE.BoxGeometry(0.5, 0.008, 0.07), mats.rubber, s * 0.21, 0.005, -0.51);
      pad.rotation.y = -s * 0.55;
      mon.add(pad);
    }
    mon.add(mesh(new THREE.CylinderGeometry(0.038, 0.042, 0.22, 16), mats.darkMetal, 0, 0.15, -0.67));
    mon.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.18, 12), mats.satin, 0, 0.32, -0.70));
    mon.add(mesh(new THREE.BoxGeometry(0.1, 0.05, 0.1), mats.plastic, 0, 0.06, -0.67)); // collar
    mon.add(mesh(new THREE.BoxGeometry(0.06, 0.06, 0.1), mats.plastic, 0, 0.40, -0.739)); // elbow
    mon.add(mesh(new THREE.BoxGeometry(0.07, 0.44, 0.03), mats.darkMetal, 0, 0.60, -0.752)); // neck
    mon.add(mesh(new THREE.BoxGeometry(0.08, 0.1, 0.07), mats.plastic, 0, 0.81, -0.727)); // mount arm
    mon.add(tube(
      [V3(0.055, 0.74, -0.74), V3(0.08, 0.3, -0.78), V3(0.08, 0.0, -0.72), V3(0, -0.12, -0.7)],
      0.012, mats.rubber,
    ));

    // NOTE: no group tilt — tilting mon would lift the feet off the desk and
    // shift the VESA/mount joint. The panel stays vertical.
    rig.add(mon);
    addAO(0, -0.6, 1.6, 1.0, 0.7);
  }

  // ---------------- panorama aquarium PC tower ----------------
  {
    const tower = buildTower({ mats, rgb, braidBump });
    const tw = tower.group;
    const cx = 1.95;
    const cz = -0.25;
    tw.position.set(cx, 0, cz);
    // Panorama glass faces the viewer/monitor: interior (pump/CPU, RAM,
    // GPU, fans) reads head-on instead of sideways.
    tw.rotation.y = -1.15;
    spinning.push(...tower.spinning);
    powerLed = tower.powerLed;
    rig.add(tw);
    addAO(cx, cz, 1.2, 1.7, 0.9);
  }

  // ---------------- full-desk RGB mat, keyboard, honeycomb mouse ----------------
  {
    const matW = 4.3;
    const matD = 1.5;
    const mat = mesh(rbox(matW, 0.008, matD, 0.004), mats.fabric, -0.1, 0.004, 0.45);
    mat.castShadow = false;
    rig.add(mat);
    // RGB optical border around the whole pad
    const borderMat = rgbMat(rgb, 0.45, { base: 2.6 });
    const borderN = new THREE.Mesh(new THREE.BoxGeometry(matW, 0.01, 0.016), borderMat);
    borderN.position.set(-0.1, 0.006, 0.45 - matD / 2);
    rig.add(borderN);
    const borderS = new THREE.Mesh(new THREE.BoxGeometry(matW, 0.01, 0.016), borderMat);
    borderS.position.set(-0.1, 0.006, 0.45 + matD / 2);
    rig.add(borderS);
    for (const s of [-1, 1]) {
      const border = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.01, matD), borderMat);
      border.position.set(-0.1 + (s * matW) / 2, 0.006, 0.45);
      rig.add(border);
    }

    const kb = new THREE.Group();
    kb.position.set(-0.18, 0, 0.5);
    kb.rotation.y = 0.02;
    kb.add(mesh(rbox(1.24, 0.028, 0.44, 0.008), mats.plastic, 0, 0.02, 0));
    // RGB underglow plane + front light bar
    const kbGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.18, 0.38),
      rgbMat(rgb, 0.58, { base: 1.6 }),
    );
    kbGlow.rotation.x = -Math.PI / 2;
    kbGlow.position.set(0, 0.032, 0);
    kb.add(kbGlow);
    const kbBar = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.008, 0.008),
      rgbMat(rgb, 0.6, { base: 2.2 }),
    );
    kbBar.position.set(0, 0.012, 0.225);
    kb.add(kbBar);
    kb.add(tube([V3(-0.4, 0.03, -0.2), V3(-0.5, 0.03, -0.45), V3(-0.3, 0.02, -0.8)], 0.008, braidMat));

    const capGeo = new THREE.BoxGeometry(0.062, 0.042, 0.062);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x232529, roughness: 0.55, metalness: 0.05 });
    const rows = 5;
    const cols = 15;
    const caps = new THREE.InstancedMesh(capGeo, capMat, rows * cols);
    const dummy = new THREE.Object3D();
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (r === 4 && c >= 4 && c <= 9) continue; // spacebar gap
        if (r === 0 && c === 0) continue; // esc accent cap
        if (r === 3 && (c === 3 || c === 4 || c === 5)) continue; // WASD accents
        const stagger = r * 0.012;
        dummy.position.set(-0.55 + c * 0.073 + stagger, 0.055 + (4 - r) * 0.006, -0.155 + r * 0.075);
        dummy.rotation.x = -0.06;
        dummy.updateMatrix();
        caps.setMatrixAt(idx++, dummy.matrix);
      }
    }
    caps.count = idx;
    caps.receiveShadow = true;
    kb.add(caps);
    kb.add(mesh(rbox(0.44, 0.042, 0.062, 0.006), mats.plastic, 0.02, 0.055, 0.145));
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x06202a, emissive: 0x00e5ff, emissiveIntensity: 1.2, roughness: 0.4 });
    const esc = mesh(new THREE.BoxGeometry(0.062, 0.044, 0.062), accentMat, -0.55, 0.077, -0.155);
    esc.castShadow = false;
    kb.add(esc);
    for (const wc of [3, 4, 5]) {
      const key = mesh(
        new THREE.BoxGeometry(0.062, 0.044, 0.062), accentMat,
        -0.55 + wc * 0.073 + 3 * 0.012, 0.061, -0.155 + 3 * 0.075,
      );
      key.castShadow = false;
      kb.add(key);
    }
    // media knob with RGB ring
    const knob = mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.03, 20), mats.darkMetal, 0.56, 0.045, -0.17);
    kb.add(knob);
    const knobRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.028, 0.005, 8, 28),
      rgbMat(rgb, 0.63, { base: 2.2 }),
    );
    knobRing.rotation.x = Math.PI / 2;
    knobRing.position.set(0.56, 0.032, -0.17);
    kb.add(knobRing);
    rig.add(kb);

    // honeycomb ultralight mouse
    const mouse = new THREE.Group();
    mouse.position.set(0.95, 0, 0.55);
    mouse.rotation.y = -0.25;
    const shellMat = new THREE.MeshStandardMaterial({
      color: 0x101114, roughness: 0.5, metalness: 0.2, bumpMap: honeyBump, bumpScale: 0.7,
    });
    const shell = mesh(new THREE.SphereGeometry(0.085, 28, 20), shellMat, 0, 0.05, 0);
    shell.scale.set(0.78, 0.52, 1.15);
    mouse.add(shell);
    // honeycomb perforation insets on the crown
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const holeGeo = new THREE.CircleGeometry(0.0085, 6);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3 - (r === 2 ? 1 : 0); c++) {
        const hole = new THREE.Mesh(holeGeo, holeMat);
        const hx = (c - 1) * 0.024 + (r % 2) * 0.012;
        const hz = -0.045 + r * 0.026;
        hole.position.set(hx, 0.0935 - Math.abs(hx) * 0.35 - Math.abs(hz + 0.01) * 0.3, hz);
        hole.rotation.x = -Math.PI / 2 + hz * 2;
        mouse.add(hole);
      }
    }
    // split line + translucent RGB scroll wheel
    mouse.add(mesh(new THREE.BoxGeometry(0.003, 0.02, 0.09), mats.rubber, 0, 0.082, 0.045));
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x1a2530, roughness: 0.3, metalness: 0.1,
      emissive: 0x00e5ff, emissiveIntensity: 1.6, transparent: true, opacity: 0.85,
    });
    const wheel = mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.022, 16), wheelMat, 0, 0.086, 0.05);
    wheel.rotation.z = Math.PI / 2;
    mouse.add(wheel);
    // grip tape + 3 macro side buttons
    for (const s of [-1, 1]) {
      const grip = mesh(new THREE.BoxGeometry(0.004, 0.02, 0.07), mats.fabric, s * 0.064, 0.042, 0.0);
      grip.castShadow = false;
      mouse.add(grip);
    }
    for (let i = 0; i < 3; i++) {
      mouse.add(mesh(new THREE.BoxGeometry(0.008, 0.012, 0.02), mats.darkMetal, -0.066, 0.062, -0.03 + i * 0.026));
    }
    // glowing rear logo
    const mLogo = new THREE.Mesh(new THREE.CircleGeometry(0.014, 20), rgbMat(rgb, 0.72, { base: 2.4 }));
    mLogo.position.set(0, 0.078, -0.093);
    mLogo.rotation.x = -0.5;
    mouse.add(mLogo);
    rig.add(mouse);
    rig.add(tube(
      [V3(0.95, 0.03, 0.66), V3(1.0, 0.02, 0.2), V3(0.7, 0.015, -0.4), V3(0.3, -0.1, -0.7)],
      0.006, braidMat,
    ));
    addAO(0.95, 0.55, 0.35, 0.4, 0.6, 0.0095);
  }

  // ---------------- headset on stand (RGB earcup rings) ----------------
  {
    const hs = new THREE.Group();
    hs.position.set(-1.62, 0, -0.3);
    hs.rotation.y = 0.5;
    hs.add(mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.03, 28), mats.matte, 0, 0.015, 0));
    hs.add(mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.52, 14), mats.satin, 0, 0.28, 0));
    hs.add(mesh(rbox(0.05, 0.04, 0.16, 0.015), mats.rubber, 0, 0.54, 0.02));
    const band = mesh(new THREE.TorusGeometry(0.11, 0.018, 12, 32, Math.PI), mats.plastic, 0, 0.42, 0.02);
    band.castShadow = true;
    hs.add(band);
    hs.add(mesh(new THREE.BoxGeometry(0.05, 0.05, 0.1), mats.fabric, 0, 0.52, 0.02));
    for (const s of [-1, 1]) {
      const cup = mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.045, 24), mats.plastic, s * 0.105, 0.4, 0.02);
      cup.rotation.z = Math.PI / 2;
      hs.add(cup);
      const cushion = mesh(new THREE.TorusGeometry(0.038, 0.016, 10, 24), mats.fabric, s * 0.082, 0.4, 0.02);
      cushion.rotation.y = Math.PI / 2;
      hs.add(cushion);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.05, 0.006, 8, 32),
        rgbMat(rgb, s > 0 ? 0.2 : 0.7, { base: 2.2 }),
      );
      ring.rotation.y = Math.PI / 2;
      ring.position.set(s * 0.129, 0.4, 0.02);
      hs.add(ring);
      const yoke = mesh(new THREE.BoxGeometry(0.012, 0.07, 0.02), mats.satin, s * 0.112, 0.46, 0.02);
      hs.add(yoke);
    }
    const mic = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.11, 10), mats.rubber, 0.1, 0.33, 0.07);
    mic.rotation.x = 0.7;
    hs.add(mic);
    hs.add(mesh(new THREE.SphereGeometry(0.013, 12, 12), mats.fabric, 0.1, 0.3, 0.115));
    rig.add(hs);
    addAO(-1.62, -0.3, 0.6, 0.6, 0.7);
  }

  // ---------------- controller (lit touch bar) ----------------
  {
    const pad = new THREE.Group();
    pad.position.set(-0.92, 0.01, 0.86);
    pad.rotation.y = 0.45;
    pad.add(mesh(rbox(0.19, 0.05, 0.1, 0.02), mats.plastic, 0, 0.035, 0));
    for (const s of [-1, 1]) {
      const grip = mesh(rbox(0.07, 0.055, 0.13, 0.025), mats.plastic, s * 0.11, 0.03, 0.03);
      grip.rotation.y = s * -0.35;
      pad.add(grip);
      pad.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 14), mats.rubber, s * 0.045, 0.06, 0.005));
      pad.add(mesh(new THREE.CylinderGeometry(0.02, 0.022, 0.012, 18), mats.plastic, s * 0.045, 0.072, 0.005));
    }
    pad.add(mesh(new THREE.BoxGeometry(0.045, 0.012, 0.015), mats.rubber, -0.062, 0.062, -0.025));
    pad.add(mesh(new THREE.BoxGeometry(0.015, 0.012, 0.045), mats.rubber, -0.062, 0.062, -0.025));
    const btnPos: Array<[number, number]> = [[0.062, -0.04], [0.077, -0.025], [0.062, -0.01], [0.047, -0.025]];
    for (const [bx, bz] of btnPos) {
      pad.add(mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.012, 14), mats.satin, bx, 0.062, bz));
    }
    pad.add(mesh(
      rbox(0.05, 0.008, 0.028, 0.003),
      new THREE.MeshStandardMaterial({ color: 0x061014, emissive: 0x00e5ff, emissiveIntensity: 1.8 }),
      0, 0.062, -0.02,
    ));
    rig.add(pad);
    addAO(-0.92, 0.86, 0.45, 0.4, 0.6, 0.0095);
  }

  // Static RGB state for reduced motion (single frozen wavefront).
  for (const e of rgb) applyRgb(e, 0.6);

  // ---------------- camera choreography & loop ----------------
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointerMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  };
  window.addEventListener("pointermove", onPointerMove, { passive: true });

  // 360° orbit state (user-toggled): auto-rotate + drag-to-orbit.
  const spin = { active: false, angle: 0, tilt: 0, dragging: false, lx: 0, ly: 0 };
  const onDragStart = (e: PointerEvent) => {
    if (!spin.active) return;
    spin.dragging = true;
    spin.lx = e.clientX;
    spin.ly = e.clientY;
    canvas.style.cursor = "grabbing";
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };
  const onDragMove = (e: PointerEvent) => {
    if (!spin.active || !spin.dragging) return;
    spin.angle -= (e.clientX - spin.lx) * 0.006;
    spin.tilt = Math.max(-0.9, Math.min(1.2, spin.tilt + (e.clientY - spin.ly) * 0.004));
    spin.lx = e.clientX;
    spin.ly = e.clientY;
  };
  const onDragEnd = () => {
    spin.dragging = false;
    if (spin.active) canvas.style.cursor = "grab";
  };
  canvas.addEventListener("pointerdown", onDragStart);
  canvas.addEventListener("pointermove", onDragMove);
  canvas.addEventListener("pointerup", onDragEnd);
  canvas.addEventListener("pointercancel", onDragEnd);

  let scrollP = 0;
  let visible = true;
  let raf = 0;
  let loopActive = false;
  const clock = new THREE.Clock();
  const reduced = opts.reducedMotion;
  const ENTRANCE = 1.8;
  let entranceT = reduced ? ENTRANCE : 0;
  let readyFired = false;

  const resize = () => {
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    const pr = Math.min(window.devicePixelRatio || 1, isMobile() ? 1.5 : 2);
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (reduced) renderFrame(0);
  };

  const haloColor = new THREE.Color();
  const towerColor = new THREE.Color();
  const underColor = new THREE.Color();

  const renderFrame = (t: number) => {
    const mobile = isMobile();
    const base = mobile ? V3(1.3, 1.75, 6.2) : camBase;
    const ease = 1 - Math.pow(1 - Math.min(1, entranceT / ENTRANCE), 3);
    const dolly = (1.18 - 0.18 * ease) * (1 - scrollP * 0.07);

    const idleX = reduced ? 0 : Math.sin(t * 0.32) * 0.05;
    const idleY = reduced ? 0 : Math.sin(t * 0.5) * 0.035;
    let px = base.x + idleX;
    let py = base.y + idleY;
    let pz = base.z;
    let lookX = camLook.x;
    if (spin.active || spin.angle !== 0 || spin.tilt !== 0) {
      // orbit the default viewpoint around the look target
      const ox = base.x - camLook.x;
      const oz = base.z - camLook.z;
      const c = Math.cos(spin.angle);
      const s = Math.sin(spin.angle);
      px = camLook.x + ox * c + oz * s;
      pz = camLook.z - ox * s + oz * c;
      py = Math.max(0.55, Math.min(3.4, base.y + spin.tilt));
    } else {
      px += pointer.x * 0.28;
      py += -pointer.y * 0.16;
      lookX += pointer.x * 0.12;
    }
    camera.position.set(px * dolly, py, pz * dolly);
    camera.lookAt(lookX, camLook.y, camLook.z);
    rig.rotation.y = scrollP * 0.06;

    if (!reduced) {
      for (const e of rgb) applyRgb(e, t);
      for (let i = 0; i < spinning.length; i++) {
        spinning[i].rotation.z -= (2.2 + (i % 3) * 0.5) * 0.016;
      }
      haloColor.setHSL((t * 0.07 + 0.85) % 1, 1, 0.6);
      haloLight.color.copy(haloColor);
      haloLight.intensity = 10 + Math.sin(t * 2.2) * 1.5;
      towerColor.setHSL((t * 0.07 + 0.3) % 1, 1, 0.6);
      towerGlow.color.copy(towerColor);
      underColor.setHSL((t * 0.05 + 0.45) % 1, 1, 0.55);
      underglow.color.copy(underColor);
      if (powerLed) powerLed.emissiveIntensity = 1.5 + Math.sin(t * 2.4) * 0.5;
      if (monitorLed) monitorLed.emissiveIntensity = 2.4 + Math.sin(t * 1.8) * 0.6;
      screenGlow.intensity = 8 + Math.sin(t * 1.3) * 0.8;
    }
    renderer.render(scene, camera);
    if (!readyFired) {
      readyFired = true;
      opts.onReady?.();
    }
  };

  const loop = () => {
    if (reduced && !spin.active) {
      loopActive = false;
      return;
    }
    raf = requestAnimationFrame(loop);
    if (!visible) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    if (entranceT < ENTRANCE) entranceT = Math.min(ENTRANCE, entranceT + dt);
    if (spin.active && !spin.dragging) spin.angle += dt * 0.5;
    pointer.x += (pointer.tx - pointer.x) * 0.045;
    pointer.y += (pointer.ty - pointer.y) * 0.045;
    renderFrame(t);
  };

  const ensureLoop = () => {
    if (loopActive) return;
    loopActive = true;
    raf = requestAnimationFrame(loop);
  };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  if (reduced) {
    renderFrame(0);
  } else {
    loopActive = true;
    raf = requestAnimationFrame(loop);
  }

  return {
    setVisible: (v: boolean) => {
      visible = v;
    },
    setScrollProgress: (p: number) => {
      scrollP = Math.max(0, Math.min(1, p));
      if (reduced) renderFrame(0);
    },
    setAutoRotate: (enabled: boolean) => {
      spin.active = enabled;
      spin.dragging = false;
      canvas.style.touchAction = enabled ? "none" : "";
      canvas.style.cursor = enabled ? "grab" : "";
      if (enabled) ensureLoop();
      else if (reduced) renderFrame(clock.elapsedTime);
    },
    isAutoRotating: () => spin.active,
    dispose: () => {
      cancelAnimationFrame(raf);
      loopActive = false;
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onDragStart);
      canvas.removeEventListener("pointermove", onDragMove);
      canvas.removeEventListener("pointerup", onDragEnd);
      canvas.removeEventListener("pointercancel", onDragEnd);
      scene.traverse((obj) => {
        const m = obj as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const material = (m as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) {
          material.forEach((mm) => disposeMaterial(mm));
        } else if (material) {
          disposeMaterial(material);
        }
      });
      pmrem.dispose();
      renderer.dispose();
    },
  };
}

function disposeMaterial(mm: THREE.Material): void {
  const withMaps = mm as THREE.MeshStandardMaterial;
  for (const key of ["map", "bumpMap", "roughnessMap", "metalnessMap", "alphaMap", "emissiveMap", "aoMap", "normalMap"] as const) {
    const tex = withMaps[key];
    if (tex) tex.dispose();
  }
  mm.dispose();
}
