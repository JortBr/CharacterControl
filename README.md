# CharacterControl
Three.js CharacterControl for my personal project fps game

If you want to try this project take the following steps:
- Press on the green button that says code
- Now press on the copy icon after the https url
- Open up cmd and go to the directory u want it to be in
- Now type git clone "paste the url here" and press enter
- Open up the folder in your development environment like visual studio code
- Make sure you have Node.js installed
- Open up the terminal
- Npm install
- Npx vite


Here I'm handling all the required information for the character movement:
<img width="454" src="https://github.com/user-attachments/assets/c59f4b22-c8d4-46c3-9f5e-508da46f251b">

In this code I'm waiting for an event trigger on the pointerlockchange, which determines if the pointer is locked. If that's the case, the event listener on mousemove starts:
<img width="454" src="https://github.com/user-attachments/assets/2cea2f8b-ae68-49c0-8f9e-a76b30ee99c2">

In this code I register how the mouse is moving to use for changing the viewing direction:
<img width="454" src="https://github.com/user-attachments/assets/ec12309d-35de-406b-af21-ff3df7cce869">

In this code I'm loading the 3D map and collecting all the mesh objects for collision detection. These are stored in the collisionObjects array. Later, these objects can be used to detect if the character runs into something using raycasting or bounding boxes:

<img width="454" src="https://github.com/user-attachments/assets/0c85b3a6-eae9-443c-81e7-d401369287ac">

In this code, I use a Raycaster to detect collisions. By casting a ray forward from the player and checking if there’s an object within a certain distance (collisionDistance), I can prevent the player from walking through walls or other objects:

<img width="454" src="https://github.com/user-attachments/assets/729e27c2-ad86-4b04-bf87-e1ebacd6728b">

This code calculates the time elapsed (deltaTime) since the last frame. This allows for smooth and consistent movement and animations, regardless of the frame rate:
<img width="454" src="https://github.com/user-attachments/assets/b1237a0e-1578-475b-85b4-95c76ea45ff6">

In this code I update movement direction (WASD) based on pressed keys:
<img width="454" src="https://github.com/user-attachments/assets/fdac7b39-c110-4540-8cb2-2b93efc625ad">

In this code the direction is rotated based on the current horizontal look angle, so movement follows the camera:
<img width="454" src="https://github.com/user-attachments/assets/5caa9a5a-31ad-41c7-b70d-99874b0e944c">

If sprinting, the player moves faster. I normalize the vector and scale it to move consistently over time:
<img width="454" src="https://github.com/user-attachments/assets/ca3fba06-aab5-49f1-a4fe-702cdc21818b">

In this code I cast a ray forward in the direction of movement. If an object is too close, I cancel the movement to avoid walking through it:

<img width="454" src="https://github.com/user-attachments/assets/554b60da-746c-469d-b0cd-04a6c94ce07a">

The character automatically faces the direction the camera is looking:
<img width="454" src="https://github.com/user-attachments/assets/d4d999b7-c204-49f0-a426-b8b2f6616f90">

In this code i make the camera smoothly follow the character’s position and rotates based on mouse input:
<img width="454" src="https://github.com/user-attachments/assets/3bbea9c6-1c35-4640-ba22-56cf59799b02">

Finally, I render the updated scene and camera:

<img width="454" src="https://github.com/user-attachments/assets/07f6775e-35de-4719-b43f-bef542bba62d">

https://www.youtube.com/watch?v=3DMZETkPieI
https://www.youtube.com/watch?v=oqKzxPMLWxo
https://github.com/tamani-coding/threejs-character-controls-example/blob/main/src/index.ts
https://github.com/mrdoob/three.js/blob/master/examples/webgl_animation_walk.html
https://github.com/mrdoob/three.js/blob/master/examples/games_fps.html
https://github.com/tamani-coding/threejs-character-controls-example/blob/main/src/characterControls.ts
https://threejs.org/examples/#misc_controls_pointerlock
https://github.com/simondevyoutube/ThreeJS_Tutorial_FirstPersonCamera/blob/main/main.js
