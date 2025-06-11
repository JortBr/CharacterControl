JortBr: Can you help me with finishing the movement i have already created the starting point but i believe from this point onward it's gonna be some math which i'm not really the best at...

GitHub Copilot: Copilot took too long to get ready. Please review the guidance in the Chat view.

JortBr: Can you help me finish the character movement? (wasd and looking around)? I already created the start but from this point onward it's gonna come down to do the right math im fairly sure and that's not my expertise.

GitHub Copilot: To complete the character movement, we need to calculate the direction of movement based on the camera's orientation and apply it to the character's position. Here's how you can implement it:

1. Use the `movementDirection` vector to determine the desired movement direction.
2. Rotate the movement direction based on the camera's horizontal rotation (`horizontalLookAngle`).
3. Normalize the movement direction and scale it by a movement speed.
4. Update the character's position accordingly.

Here's the updated code:

```javascript
function animate() {
  requestAnimationFrame(animate); // https://threejs.org/manual/#en/creating-a-scene volgens de docs is het beter om dit te gebruiken.

  const currentFrameTime = performance.now();
  const deltaTime = (currentFrameTime - previousFrameTime) / 1000; // Tijd sinds laatste frame in seconden
  previousFrameTime = currentFrameTime;

  // Reset movement direction
  movementDirection.set(0, 0, 0);

  // Update movement direction based on pressed keys
  if (pressedKeys["w"]) movementDirection.z -= 1;
  if (pressedKeys["s"]) movementDirection.z += 1;
  if (pressedKeys["a"]) movementDirection.x -= 1;
  if (pressedKeys["d"]) movementDirection.x += 1;

  // Rotate movement direction based on camera's horizontal rotation
  const rotationMatrix = new THREE.Matrix4().makeRotationY(horizontalLookAngle);
  movementDirection.applyMatrix4(rotationMatrix);

  // Normalize and scale movement direction
  if (movementDirection.length() > 0) {
    movementDirection.normalize().multiplyScalar(5 * deltaTime); // 5 units per second
  }

  // Update character position
  if (character) {
    character.position.add(movementDirection);
  }

  // Update camera position to follow the character
  cameraPosition.copy(character ? character.position : new THREE.Vector3());
  cameraPosition.y += 1.5; // Offset the camera height
  camera.position.copy(cameraPosition);

  // Update camera rotation
  camera.quaternion.setFromEuler(
    new THREE.Euler(verticalLookAngle, horizontalLookAngle, 0, "YXZ")
  );

  // Render the scene
  renderer.render(scene, camera); // De scene en camera in renderen.
}
```

### Explanation of Changes:

1. **Delta Time Calculation**: Ensures smooth movement regardless of frame rate.
2. **Rotation Matrix**: Rotates the movement direction vector based on the camera's horizontal rotation (`horizontalLookAngle`).
3. **Normalization and Scaling**: Normalizes the movement direction vector and scales it by a movement speed (5 units per second in this case).
4. **Character Position Update**: Moves the character based on the calculated movement direction.
5. **Camera Follow**: Updates the camera's position and rotation to follow the character.

This will allow your character to move in the direction relative to where the camera is looking, and the camera will follow the character while maintaining the ability to look around.

JortBr: Can you explain what you did and the logic behind it?

GitHub Copilot: Certainly! Here's an explanation of the logic behind the movement system and the changes made:

### **What I Did**

1. **Keyboard Input Handling**:

   - Used the `pressedKeys` object to track which keys (`W`, `A`, `S`, `D`) are currently pressed.
   - Updated the `movementDirection` vector based on the keys pressed:
     - `W` moves the character forward (`z -= 1`).
     - `S` moves the character backward (`z += 1`).
     - `A` moves the character left (`x -= 1`).
     - `D` moves the character right (`x += 1`).

2. **Rotation Based on Camera**:

   - Created a rotation matrix using the camera's horizontal rotation (`horizontalLookAngle`).
   - Applied this rotation matrix to the `movementDirection` vector to ensure the character moves relative to the camera's orientation.

3. **Normalize and Scale Movement**:

   - Normalized the `movementDirection` vector to ensure consistent movement regardless of the direction.
   - Scaled the vector by a movement speed (5 units per second) and the `deltaTime` to make movement frame-rate independent.

4. **Character Position Update**:

   - Added the `movementDirection` vector to the character's position to move it in the desired direction.

5. **Camera Follow**:

   - Updated the camera's position to follow the character, with a slight vertical offset (`y += 1.5`) to simulate a third-person perspective.
   - Updated the camera's rotation to match the player's look direction, using the `verticalLookAngle` and `horizontalLookAngle`.

6. **Rendering**:
   - Rendered the scene with the updated camera and character positions.

---

### **Logic Behind the Movement**

1. **Keyboard Input**:

   - The `pressedKeys` object allows us to track multiple key presses simultaneously, enabling diagonal movement (e.g., pressing `W` and `D` together).

2. **Camera-Based Movement**:

   - The rotation matrix ensures that movement is relative to the camera's orientation. For example, pressing `W` moves the character forward in the direction the camera is facing, regardless of the world's coordinate system.

3. **Delta Time**:

   - Using `deltaTime` ensures that movement is smooth and consistent across different frame rates. Without it, movement speed would vary depending on the performance of the user's system.

4. **Normalization and Scaling**:

   - Normalizing the `movementDirection` vector ensures that diagonal movement (e.g., pressing `W` and `D`) doesn't result in faster movement than moving in a single direction.
   - Scaling by a constant speed (`5 units per second`) ensures predictable movement.

5. **Camera Follow**:
   - The camera's position is updated to follow the character, creating a third-person perspective.
   - The camera's rotation is updated to reflect the player's look direction, allowing for a smooth and intuitive experience.

---

### **Why This Approach Works**

This approach combines keyboard input, camera orientation, and frame-rate-independent movement to create a smooth and responsive character control system. It ensures that the character moves relative to the camera's orientation, which is essential for intuitive gameplay in 3D environments. Additionally, the camera follows the character seamlessly, maintaining a consistent perspective for the player.

JortBr: I see that I forgot the collision, could we like implement a collision based on the map model? so that once you hit a wall in or something in the map it doesnt let you go through?

GitHub Copilot: To implement collision detection based on the map model, you can use **raycasting** in Three.js. Raycasting allows you to detect intersections between a ray (representing the character's movement direction) and the map geometry. Here's how you can implement it:

---

### **Steps to Add Collision Detection**

1. **Create a Raycaster**:

   - Use Three.js's `THREE.Raycaster` to detect intersections between the character's movement direction and the map.

2. **Check for Collisions**:

   - Before updating the character's position, cast a ray in the direction of movement.
   - If the ray intersects with the map geometry within a small distance, prevent the character from moving further in that direction.

3. **Update the Code**:
   - Add the raycasting logic to the `animate` function.

---

### **Updated Code with Collision Detection**

```javascript
const raycaster = new THREE.Raycaster(); // Raycaster for collision detection
const collisionDistance = 0.5; // Minimum distance to detect collisions

function animate() {
  requestAnimationFrame(animate);

  const currentFrameTime = performance.now();
  const deltaTime = (currentFrameTime - previousFrameTime) / 1000; // Time elapsed since last frame in seconds
  previousFrameTime = currentFrameTime;

  // Reset movement direction
  movementDirection.set(0, 0, 0);

  // Update movement direction based on pressed keys
  if (pressedKeys["w"]) movementDirection.z -= 1;
  if (pressedKeys["s"]) movementDirection.z += 1;
  if (pressedKeys["a"]) movementDirection.x -= 1;
  if (pressedKeys["d"]) movementDirection.x += 1;

  // Rotate movement direction based on camera's horizontal rotation
  const rotationMatrix = new THREE.Matrix4().makeRotationY(horizontalLookAngle);
  movementDirection.applyMatrix4(rotationMatrix);

  // Normalize and scale movement direction
  if (movementDirection.length() > 0) {
    movementDirection.normalize().multiplyScalar(5 * deltaTime); // 5 units per second
  }

  // Collision detection
  if (character) {
    const futurePosition = character.position.clone().add(movementDirection);

    // Set raycaster origin and direction
    raycaster.set(character.position, movementDirection.clone().normalize());

    // Check for intersections with the map
    const intersects = raycaster.intersectObject(scene, true); // Check against all objects in the scene
    if (intersects.length > 0 && intersects[0].distance < collisionDistance) {
      // Collision detected, prevent movement
      movementDirection.set(0, 0, 0);
    } else {
      // No collision, update character position
      character.position.copy(futurePosition);
    }
  }

  // Update camera position to follow the character
  cameraPosition.copy(character ? character.position : new THREE.Vector3());
  cameraPosition.y += 1.5; // Offset the camera height
  camera.position.copy(cameraPosition);

  // Update camera rotation
  camera.quaternion.setFromEuler(
    new THREE.Euler(verticalLookAngle, horizontalLookAngle, 0, "YXZ")
  );

  // Render the scene
  renderer.render(scene, camera);
}
```

---

### **Explanation of Changes**

1. **Raycaster Initialization**:

   - A `THREE.Raycaster` is created to detect collisions.
   - The raycaster's origin is set to the character's current position, and its direction is set to the normalized movement direction.

2. **Collision Detection**:

   - The `raycaster.intersectObject(scene, true)` method checks for intersections between the ray and all objects in the scene (including the map).
   - If an intersection is detected and the distance to the intersection is less than `collisionDistance`, movement is prevented by setting `movementDirection` to `(0, 0, 0)`.

3. **Future Position Check**:

   - The character's future position is calculated by adding the `movementDirection` to the current position.
   - If no collision is detected, the character's position is updated to the future position.

4. **Collision Distance**:
   - The `collisionDistance` variable defines how close the character can get to an object before stopping.

---

### **Why This Works**

- The raycaster ensures that the character cannot move through walls or other objects in the map.
- By checking for intersections before updating the character's position, we prevent the character from entering areas it shouldn't.

---

### **Next Steps**

- **Optimize Performance**: If the map has many objects, consider grouping them into a single `THREE.Group` or using a simplified collision mesh for raycasting.
- **Add Visual Feedback**: You can visualize the ray for debugging by creating a `THREE.ArrowHelper` to see where the ray is pointing.
- **Handle Vertical Collisions**: If your map has stairs or uneven terrain, you may need to adjust the character's `y` position based on the intersection point.

JortBr: Isn't it possible to do it simpler like creating a variable which is at first a empty array but you fill it with information of the map objects? and than you check with a loop if the player would collide

GitHub Copilot: Yes, your suggestion is a valid and simpler approach! Instead of checking collisions against all objects in the scene, you can maintain a list of objects that are relevant for collision detection (e.g., walls, obstacles). This reduces unnecessary checks and improves performance.

Here’s how you can implement this:

---

### **Steps to Simplify Collision Detection**

1. **Create a Collision Objects Array**:

   - Maintain an array (`collisionObjects`) to store only the objects in the map that the player can collide with (e.g., walls, obstacles).

2. **Populate the Array**:

   - When loading the map, add the relevant objects (or the entire map if it's a single object) to the `collisionObjects` array.

3. **Check Collisions Using the Array**:
   - Use the `raycaster` to check for intersections only with the objects in the `collisionObjects` array.

---

### **Updated Code**

```javascript
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
  requestAnimationFrame(animate);

  const currentFrameTime = performance.now();
  const deltaTime = (currentFrameTime - previousFrameTime) / 1000; // Time elapsed since last frame in seconds
  previousFrameTime = currentFrameTime;

  // Reset movement direction
  movementDirection.set(0, 0, 0);

  // Update movement direction based on pressed keys
  if (pressedKeys["w"]) movementDirection.z -= 1;
  if (pressedKeys["s"]) movementDirection.z += 1;
  if (pressedKeys["a"]) movementDirection.x -= 1;
  if (pressedKeys["d"]) movementDirection.x += 1;

  // Rotate movement direction based on camera's horizontal rotation
  const rotationMatrix = new THREE.Matrix4().makeRotationY(horizontalLookAngle);
  movementDirection.applyMatrix4(rotationMatrix);

  // Normalize and scale movement direction
  if (movementDirection.length() > 0) {
    movementDirection.normalize().multiplyScalar(5 * deltaTime); // 5 units per second
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

  // Update camera position to follow the character
  cameraPosition.copy(character ? character.position : new THREE.Vector3());
  cameraPosition.y += 1.5; // Offset the camera height
  camera.position.copy(cameraPosition);

  // Update camera rotation
  camera.quaternion.setFromEuler(
    new THREE.Euler(verticalLookAngle, horizontalLookAngle, 0, "YXZ")
  );

  // Render the scene
  renderer.render(scene, camera);
}
```

---

### **Explanation of Changes**

1. **`collisionObjects` Array**:

   - This array stores only the objects that are relevant for collision detection (e.g., walls, obstacles).
   - When the map is loaded, all its child meshes are added to this array using `map.traverse`.

2. **Efficient Collision Checking**:

   - Instead of checking against the entire scene, the `raycaster.intersectObjects` method now checks only the objects in the `collisionObjects` array.
   - This reduces unnecessary computations and improves performance.

3. **Simplified Logic**:
   - The collision detection logic remains the same, but it now operates on a smaller, more focused set of objects.

---

### **Advantages of This Approach**

- **Performance**: By limiting collision checks to specific objects, the system becomes more efficient, especially for large scenes.
- **Flexibility**: You can easily add or remove objects from the `collisionObjects` array as needed (e.g., dynamic obstacles).
- **Simplicity**: The logic is easier to understand and maintain.

---

### **Next Steps**

- **Debugging**: Use `THREE.ArrowHelper` to visualize the ray for debugging purposes.
- **Dynamic Objects**: If you have moving objects (e.g., enemies), ensure they are added to the `collisionObjects` array dynamically.
- **Vertical Collisions**: If your map has stairs or uneven terrain, consider adjusting the character's `y` position based on the intersection point.
