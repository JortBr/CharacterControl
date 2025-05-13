import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const color = 0xffffff;
const intensity = 2;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(10, 10, 10); // Even mee zitten klote om alles te kunnen zien werkte dit.
scene.add(light);

camera.position.set(0, 1.5, 0);

const pressedKeys = {}; // leeg object om ingedrukte toetsen op te slaan.
document.addEventListener(
  "keydown",
  (e) => (pressedKeys[e.key.toLowerCase()] = true)
);
document.addEventListener(
  "keyup",
  (e) => (pressedKeys[e.key.toLowerCase()] = false)
);

// Rotatie- en positiegegevens van de speler
let horizontalLookAngle = 0; // horizontale rotatie (links/rechts)
let verticalLookAngle = 0; // verticale rotatie (omhoog/omlaag)
const cameraRotation = new THREE.Quaternion();
const cameraPosition = new THREE.Vector3(0, 2, 0);
const movementDirection = new THREE.Vector3();
let previousFrameTime = performance.now();

// Muisbeweging voor rotatie
document.addEventListener("mousemove", (e) => {
  const movementX = e.movementX || 0;
  const movementY = e.movementY || 0;

  horizontalLookAngle -= movementX * 0.002;

  verticalLookAngle = Math.max(
    -Math.PI / 2,
    Math.min(Math.PI / 2, verticalLookAngle - movementY * 0.002)
  );
});

// Vraag pointer lock aan bij klikken
window.addEventListener("click", () => {
  document.body.requestPointerLock();
});

// Map inladen.
const mapLoader = new GLTFLoader();
mapLoader.load("assets/models/texturedmap.glb", (gltf) => {
  scene.add(gltf.scene); // Map toevoegen aan scene.
});

let character;
const loader = new GLTFLoader();
loader.load("assets/models/Soldier.glb", (gltf) => {
  character = gltf.scene;
  character.scale.set(1, 1, 1);
  scene.add(character);
});

function animate() {
  requestAnimationFrame(animate); // https://threejs.org/manual/#en/creating-a-scene volgens de docs is het beter om dit te gebruiken.

  movementDirection.set(0, 0, 0);
  if (pressedKeys["w"]) movementDirection.z -= 1;
  if (pressedKeys["s"]) movementDirection.z += 1;
  if (pressedKeys["a"]) movementDirection.x -= 1;
  if (pressedKeys["d"]) movementDirection.x += 1;

  renderer.render(scene, camera); // De scene en camera in renderen.
}

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}); // Van voorgaande project handig om het responsive te houden.

animate();
