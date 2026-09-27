import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { buildTower, auditTower } from "./tower";
import {
  type RgbEntry,
  applyRgb,
  makeFabricTexture,
  makeBraidTexture,
  buildMaterials,
} from "./common";

const params = new URLSearchParams(location.search);
const view = params.get("view") ?? "iso";

const canvas = document.getElementById("c") as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(1600, 1000, false);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0d12);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.06).texture;
RectAreaLightUniformsLib.init();

scene.add(new THREE.HemisphereLight(0x9aa3c0, 0x14161c, 0.7));
const key = new THREE.DirectionalLight(0xffffff, 2.4);
key.position.set(-2.5, 3.2, 2.5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -1.5;
key.shadow.camera.right = 1.5;
key.shadow.camera.top = 1.5;
key.shadow.camera.bottom = -1.5;
key.shadow.bias = -0.0003;
key.shadow.normalBias = 0.02;
scene.add(key);
const rim = new THREE.DirectionalLight(0xcfd6ff, 1.2);
rim.position.set(2, 2, -2);
scene.add(rim);
const fill = new THREE.DirectionalLight(0xbfc2c9, 0.5);
fill.position.set(2.5, 1, 3);
scene.add(fill);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(4, 48),
  new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: 0.8, metalness: 0.2 }),
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const rgb: RgbEntry[] = [];
const mats = buildMaterials(makeFabricTexture());
const tower = buildTower({ mats, rgb, braidBump: makeBraidTexture() });
scene.add(tower.group);
// static RGB state
for (const e of rgb) applyRgb(e, 0.6);

const camera = new THREE.PerspectiveCamera(38, 1600 / 1000, 0.05, 40);
const views: Record<string, { pos: [number, number, number]; look: [number, number, number] }> = {
  iso: { pos: [1.7, 1.25, 2.1], look: [0, 0.55, 0] },
  front: { pos: [0.15, 0.62, 2.2], look: [0.05, 0.55, 0] },
  side: { pos: [2.2, 0.62, 0.1], look: [0, 0.55, 0] },
  back: { pos: [-0.4, 0.75, -2.2], look: [0, 0.55, 0] },
  left: { pos: [-2.2, 0.62, 0.1], look: [0, 0.55, 0] },
  top: { pos: [0.3, 2.6, 0.4], look: [0, 0.5, 0] },
  gpu: { pos: [1.5, 0.62, 0.9], look: [0.1, 0.45, -0.05] },
  pump: { pos: [1.0, 0.95, 0.55], look: [-0.1, 0.8, -0.2] },
  bottomfans: { pos: [1.35, 0.5, 1.15], look: [0, 0.28, 0.1] },
  cables: { pos: [1.3, 0.8, 1.0], look: [-0.08, 0.6, 0.05] },
};
const v = views[view] ?? views.iso;
camera.position.set(...v.pos);
camera.lookAt(...v.look);

// NOTE: inspection renders the tower UNROTATED (glass +x faces camera-right).
renderer.render(scene, camera);

let reportEl = document.getElementById("report")!;
if (params.has("check")) {
  // audit the un-rotated body group
  const body = tower.group.children[0];
  const lines = auditTower(body);
  reportEl.textContent = lines.length ? lines.join("\n") : "CLEAN";
} else {
  reportEl.textContent = `view=${view}`;
}
// render again after report for safety
renderer.render(scene, camera);
(window as unknown as { __done: boolean }).__done = true;
