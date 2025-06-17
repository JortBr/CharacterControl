import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { io } from "socket.io-client";

// --- Networking Setup ---
const socket = io("http://localhost:3000"); // Initialize socket connection to the server.
const otherPlayers = {}; // Check if the socket connection is established.

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

// --- Lighting Setup ---
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

camera.position.set(0, 1.5, 0);

// --- Player State ---
let character;
const pressedKeys = {}; // Empty object to capture pressed keys.
let isSprinting = false; // Variable to track sprinting state.
let horizontalLookAngle = 0; // Horizontal rotation.
let verticalLookAngle = 0; // Vertical rotation.
const cameraPosition = new THREE.Vector3(0, 2, 0);
const movementDirection = new THREE.Vector3();
let previousFrameTime = performance.now();
let pendingMouseMove = null;

// --- Collision Detection Setup ---
const collisionObjects = []; // Array to store objects for collision detection
const raycaster = new THREE.Raycaster(); // Raycaster for collision detection
const collisionDistance = 0.5; // Minimum distance to detect collisions

// --- Load map And Collission objects ---
const mapLoader = new GLTFLoader();
mapLoader.load("assets/models/texturedmap.glb", (gltf) => {
  const map = gltf.scene;
  scene.add(map); // Add the map to the scene

  // Add all children of the map to the collisionObjects array
  map.traverse((child) => {
    if (child.isMesh) {
      console.log(child);
      collisionObjects.push(child);
    }
  });
});

// --- Load Character Model ---
const loader = new GLTFLoader();
loader.load("assets/models/Soldier.glb", (gltf) => {
  character = gltf.scene;
  character.scale.set(1, 1, 1);
  scene.add(character);
});

// --- Networking: Player Management ---
function addOtherPlayer(id, data) {
  if (otherPlayers[id]) {
    return; // Prevent duplicates
  }
  const loader = new GLTFLoader();
  loader.load("assets/models/Soldier.glb", (gltf) => {
    const player = gltf.scene;
    player.scale.set(1, 1, 1);
    player.position.set(
      data.position?.x || data.x || 0,
      data.position?.y || data.y || 0,
      data.position?.z || data.z || 0
    );
    player.rotation.y = data.rotation || 0;
    scene.add(player);
    otherPlayers[id] = player;
  });
}

function updateOtherPlayer(id, data) {
  const player = otherPlayers[id];
  if (player) {
    // Interpoleer positie voor vloeiendere beweging
    player.position.lerp(
      new THREE.Vector3(data.position.x, data.position.y, data.position.z),
      0.3 // Hoe hoger, hoe sneller hij naar de nieuwe positie beweegt
    );
    player.rotation.y = data.rotation;
  }
}

function removeOtherPlayer(id) {
  if (otherPlayers[id]) {
    scene.remove(otherPlayers[id]);
    delete otherPlayers[id];
  }
}

// --- Networking: Socket Event Listeners ---
// Listen for the "init" event to receive initial player data.
socket.on("init", (players) => {
  for (const id in players) {
    if (id !== socket.id && !otherPlayers[id]) {
      addOtherPlayer(id, players[id]);
    }
  }
});

socket.on("newPlayer", (data) => {
  if (data.id !== socket.id) {
    addOtherPlayer(data.id, data);
  } else {
    console.log("something went wrong");
  }
});

socket.on("update", (data) => {
  if (data.id !== socket.id) {
    updateOtherPlayer(data.id, data);
  } else {
    console.log("something went wrong");
  }
});

socket.on("removePlayer", (id) => {
  removeOtherPlayer(id);
});

// --- Input Handling ---
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

// --- Mouse Look ---
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
  pendingMouseMove = e;

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

function processMouseMove() {
  if (pendingMouseMove) {
    const movementX = pendingMouseMove.movementX || 0;
    const movementY = pendingMouseMove.movementY || 0;

    horizontalLookAngle -= movementX * 0.002;
    verticalLookAngle = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, verticalLookAngle - movementY * 0.002)
    );

    pendingMouseMove = null;
  }
}

// --- Animation Loop ---
function animate() {
  requestAnimationFrame(animate); // https://threejs.org/manual/#en/creating-a-scene according to this documentation it's better to use this.

  processMouseMove();

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

    // Makes the character face the direction of camera.
    character.rotation.set(0, horizontalLookAngle, 0);

    // Check for intersections with the collisionObjects array
    const intersects = raycaster.intersectObjects(collisionObjects, true);
    if (intersects.length > 0 && intersects[0].distance < collisionDistance) {
      // Collision detected, prevent movement
      movementDirection.set(0, 0, 0);
    } else {
      // No collision, update character position
      character.position.copy(futurePosition);
    }

    socket.emit("update", {
      position: {
        x: character.position.x,
        y: character.position.y,
        z: character.position.z,
      },
      rotation: horizontalLookAngle,
    });
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

// --- Responsive Resize Handling ---
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}); // To keep the aspect ratio of the camera and renderer in sync with the window size.

animate();
