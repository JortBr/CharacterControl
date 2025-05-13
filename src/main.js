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
light.position.set(10, 10, 10);
scene.add(light);

camera.position.set(0, 1.5, 0);

const pressedKeys = {}; // Empty object to capture pressed keys.
let isSprinting = false;
document.addEventListener("keydown", (e) => {
  pressedKeys[e.key.toLowerCase()] = true;
  if (e.key.toLowerCase() === "shift") {
    isSprinting = true; // Set sprinting to true when shift is pressed.
  }
});
document.addEventListener("keyup", (e) => {
  pressedKeys[e.key.toLowerCase()] = false;
  isSprinting = false; // Set sprinting to false when shift is released.
});

// Rotation and Position information of the player.
let horizontalLookAngle = 0; // Horizontal rotation.
let verticalLookAngle = 0; // Vertical rotation.
const cameraRotation = new THREE.Quaternion();
const cameraPosition = new THREE.Vector3(0, 2, 0);
const movementDirection = new THREE.Vector3();
let previousFrameTime = performance.now();

// Mouse movement for rotation.
document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement) {
    // Pointer lock is active.
    document.addEventListener("mousemove", onMouseMove);
  } else {
    // Pointer lock is inactive.
    document.removeEventListener("mousemove", onMouseMove);
  }
});
document.addEventListener("mousemove", (e) => {
  const movementX = e.movementX || 0;
  const movementY = e.movementY || 0;

  horizontalLookAngle -= movementX * 0.002;

  verticalLookAngle = Math.max(
    -Math.PI / 2,
    Math.min(Math.PI / 2, verticalLookAngle - movementY * 0.002)
  );
});

// Request pointer lock on click.
window.addEventListener("click", () => {
  document.body.requestPointerLock();
});

const collisionObjects = []; // Array to store objects for collision detection

// Load the map and add it to the collisionObjects array
const mapLoader = new GLTFLoader();
mapLoader.load("assets/models/texturedmap.glb", (gltf) => {
  const map = gltf.scene;
  scene.add(map); // Add the map to the scene

  // Add all children of the map to the collisionObjects array
  map.traverse((child) => {
    if (child.isMesh) {
      collisionObjects.push(child);
    }
  });
});

let character;
const loader = new GLTFLoader();
loader.load("assets/models/Soldier.glb", (gltf) => {
  character = gltf.scene;
  character.scale.set(1, 1, 1);
  scene.add(character);
});

const raycaster = new THREE.Raycaster(); // Raycaster for collision detection
const collisionDistance = 0.5; // Minimum distance to detect collisions

function animate() {
  requestAnimationFrame(animate); // https://threejs.org/manual/#en/creating-a-scene according to this documentation it's better to use this.

  const currentFrameTime = performance.now();
  const deltaTime = (currentFrameTime - previousFrameTime) / 1000; // Time elapsed since last frame in seconds.
  previousFrameTime = currentFrameTime;

  // Reset movement direction.
  movementDirection.set(0, 0, 0);

  // Update movement direction based on pressed keys.
  if (pressedKeys["w"]) movementDirection.z -= 1;
  if (pressedKeys["s"]) movementDirection.z += 1;
  if (pressedKeys["a"]) movementDirection.x -= 1;
  if (pressedKeys["d"]) movementDirection.x += 1;

  // Rotate movement direction based on camera's horizontal rotation.
  const rotationMatrix = new THREE.Matrix4().makeRotationY(horizontalLookAngle);
  movementDirection.applyMatrix4(rotationMatrix);

  const moveSpeed = isSprinting ? 10 : 5; // Sprint = 10 / normal = 5

  // Normalize and scale movement direction.
  if (movementDirection.length() > 0) {
    movementDirection.normalize().multiplyScalar(moveSpeed * deltaTime); // 5 units per second.
  }

  // Collision detection
  if (character) {
    const futurePosition = character.position.clone().add(movementDirection);

    // Set raycaster origin and direction
    raycaster.set(character.position, movementDirection.clone().normalize());

    // Check for intersections with the collisionObjects array
    const intersects = raycaster.intersectObjects(collisionObjects, true);
    if (intersects.length > 0 && intersects[0].distance < collisionDistance) {
      // Collision detected, prevent movement
      movementDirection.set(0, 0, 0);
    } else {
      // No collision, update character position
      character.position.copy(futurePosition);
    }
  }

  // Update camera position to follow the character.
  cameraPosition.copy(character ? character.position : new THREE.Vector3());
  cameraPosition.y += 1.5; // Offset the camera height.
  camera.position.copy(cameraPosition);

  // Update camera rotation.
  camera.quaternion.setFromEuler(
    new THREE.Euler(verticalLookAngle, horizontalLookAngle, 0, "YXZ")
  );

  // Rendering the scene.
  renderer.render(scene, camera); // Rendering the scene and camera.
}

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}); // To keep the aspect ratio of the camera and renderer in sync with the window size.

animate();
