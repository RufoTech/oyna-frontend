import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  V3,
  type RgbEntry,
  applyRgb,
  rgbMat,
  makeGlowTexture,
  makeNeonSignTexture,
} from "./common";

export interface StationOptions {
  reducedMotion: boolean;
  onReady?: () => void;
  onProgress?: (progress: number) => void;
}

export interface StationHandle {
  setVisible: (visible: boolean) => void;
  setScrollProgress: (progress: number) => void;
  /** 360° orbit mode: auto-rotate + drag-to-orbit around the station. */
  setAutoRotate: (enabled: boolean) => void;
  isAutoRotating: () => boolean;
  dispose: () => void;
}

/** Stretched cable curves spanning several meters — FBX export artifacts. */
function isJunkMesh(m: THREE.Mesh, size: THREE.Vector3): boolean {
  return /beziercurve/i.test(m.name) && Math.max(size.x, size.y, size.z) > 5;
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
  const glowTex = makeGlowTexture("rgba(0,0,0,0.5)", "rgba(0,0,0,0)");

  const rig = new THREE.Group();
  scene.add(rig);
  const rgb: RgbEntry[] = [];

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

  // ---------------- model download progress ----------------
  const loadedBytes = [0, 0];
  const totalBytes = [13111576, 8393380];
  let pending = 2;
  let modelsReady = false;

  const reportProgress = () => {
    const t = totalBytes[0] + totalBytes[1];
    opts.onProgress?.(Math.min(1, (loadedBytes[0] + loadedBytes[1]) / t));
  };
  const trackProgress = (i: number) => (e: ProgressEvent) => {
    loadedBytes[i] = e.loaded;
    if (e.lengthComputable && e.total > 0) totalBytes[i] = e.total;
    reportProgress();
  };
  const fileDone = (i: number) => {
    loadedBytes[i] = totalBytes[i];
    reportProgress();
    pending -= 1;
    if (pending === 0) {
      modelsReady = true;
      if (reduced || !visible) renderFrame(clock.elapsedTime);
    }
  };
  const fileFailed = (i: number) => (err: unknown) => {
    console.error("[station] model failed to load", err);
    fileDone(i);
  };

  // ---------------- GLB gaming setup ----------------
  new GLTFLoader().load("/models/gaming_desktop_pc.glb", (gltf) => {
    const model = gltf.scene;
    model.updateMatrixWorld(true);

    const junk: THREE.Mesh[] = [];
    const plates: THREE.Mesh[] = [];
    const mBox = new THREE.Box3();
    const mSize = new THREE.Vector3();
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      m.receiveShadow = true;
      mBox.setFromObject(m).getSize(mSize);
      if (isJunkMesh(m, mSize)) junk.push(m);
      else if (mSize.y < 1 && mSize.x * mSize.z > 20) plates.push(m);
    });
    for (const m of junk) m.removeFromParent();

    // The setup runs along +z in model space; turn it so it faces the camera.
    model.rotation.y = -Math.PI / 2;
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const fit = Math.min(4.4 / Math.max(size.x, size.z), 1.85 / size.y);
    model.scale.setScalar(fit);
    model.updateMatrixWorld(true);
    box.setFromObject(model);
    const c = box.getCenter(new THREE.Vector3());
    // Desk surface sits at y=0, like the original procedural desk.
    const top = plates.length ? new THREE.Box3().setFromObject(plates[0]) : box.clone();
    const lift = plates.length ? -top.max.y : -box.min.y;
    model.position.set(-c.x, lift, -c.z - 0.2);
    rig.add(model);

    // Legs under the desk top, from its underside down to the floor.
    top.translate(new THREE.Vector3(-c.x, lift, -c.z - 0.2));
    const legH = top.min.y + 0.78;
    const depth = top.max.z - top.min.z;
    const legMat = new THREE.MeshStandardMaterial({ color: 0x14161b, roughness: 0.45, metalness: 0.6 });
    for (const x of [top.min.x + 0.25, top.max.x - 0.25]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.09, legH, depth * 0.8), legMat);
      leg.position.set(x, -0.78 + legH / 2, (top.min.z + top.max.z) / 2);
      leg.castShadow = true;
      leg.receiveShadow = true;
      rig.add(leg);
    }
    const tray = new THREE.Mesh(new THREE.BoxGeometry(top.max.x - top.min.x - 0.6, 0.07, 0.16), legMat);
    tray.position.set((top.min.x + top.max.x) / 2, top.min.y - 0.08, top.min.z + 0.25);
    rig.add(tray);
    fileDone(0);
  }, trackProgress(0), fileFailed(0));
  addAO(0, 0.1, 5, 4, 0.8, -0.77);

  // ---------------- GLB gaming chair (in front of the desk) ----------------
  new GLTFLoader().load("/models/sandberg_voodoo_gaming_chair.glb", (gltf) => {
    const chair = gltf.scene;
    chair.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      m.receiveShadow = true;
    });
    // Seat faces +z in model space; turn it toward the desk, slightly angled.
    chair.rotation.y = Math.PI - 0.45;
    chair.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(chair);
    chair.scale.setScalar(2.1 / box.getSize(new THREE.Vector3()).y);
    chair.updateMatrixWorld(true);
    box.setFromObject(chair);
    const c = box.getCenter(new THREE.Vector3());
    chair.position.set(-0.55 - c.x, -0.78 - box.min.y, 1.75 - c.z);
    rig.add(chair);
    fileDone(1);
  }, trackProgress(1), fileFailed(1));
  addAO(-0.55, 1.75, 1.6, 1.6, 0.8, -0.77);

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
      haloColor.setHSL((t * 0.07 + 0.85) % 1, 1, 0.6);
      haloLight.color.copy(haloColor);
      haloLight.intensity = 10 + Math.sin(t * 2.2) * 1.5;
      towerColor.setHSL((t * 0.07 + 0.3) % 1, 1, 0.6);
      towerGlow.color.copy(towerColor);
      underColor.setHSL((t * 0.05 + 0.45) % 1, 1, 0.55);
      underglow.color.copy(underColor);
      screenGlow.intensity = 8 + Math.sin(t * 1.3) * 0.8;
    }
    renderer.render(scene, camera);
    if (modelsReady && !readyFired) {
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
