// Full URLs – should work without import map issues
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x88aaff);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2, 6);
camera.lookAt(0, 0, 0); // Force look at origin where duck will be

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Lights (brighter for visibility)
scene.add(new THREE.AmbientLight(0xffffff, 2));
const dirLight = new THREE.DirectionalLight(0xffffff, 4);
dirLight.position.set(8, 12, 10);
scene.add(dirLight);

// Simple ground plane to see movement better
const groundGeo = new THREE.PlaneGeometry(20, 20);
const groundMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.8 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.8;
scene.add(ground);

// Fallback red cube
const fallbackGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
const fallbackMat = new THREE.MeshStandardMaterial({ color: 0xff4444 });
const fallback = new THREE.Mesh(fallbackGeo, fallbackMat);
fallback.position.y = 0.6; // above ground a bit
scene.add(fallback);

let duck = null;
let isAnimating = false;
let animStart = 0;
let bounceHeight = 0;
let bounceSpeed = 0;
let spinX = 0;
let spinY = 0;
let spinZ = 0;

const loader = new GLTFLoader();
loader.load(
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Duck/glTF-Binary/Duck.glb',
  (gltf) => {
    duck = gltf.scene;
    scene.add(duck);
    duck.scale.set(0.06, 0.06, 0.06); // Slightly bigger for visibility
    duck.position.set(0, -0.8, 0); // Centered on ground
    duck.rotation.y = Math.PI;
    scene.remove(fallback);
    console.log('✅ DUCK LOADED! You should see the yellow duck now. Click to bounce.');
  },
  undefined,
  (err) => {
    console.error('❌ Model failed:', err);
    console.log('Falling back to red cube – click should still spin it a bit if animation works.');
  }
);

// Generate new move params
function newMove() {
  bounceHeight = 2 + Math.random() * 6; // 2–8 units up – more dramatic
  bounceSpeed  = 3 + Math.random() * 7; // Varied timing
  spinX = (Math.random() - 0.5) * 0.3;
  spinY = (Math.random() - 0.5) * 0.4;
  spinZ = (Math.random() - 0.5) * 0.25;
  console.log(`New move: height=${bounceHeight.toFixed(1)}, speed=${bounceSpeed.toFixed(1)}, spins=${spinX.toFixed(3)}/${spinY.toFixed(3)}/${spinZ.toFixed(3)}`);
}

// Animation loop
function animate(time = 0) {
  requestAnimationFrame(animate);

  if (duck) {
    if (isAnimating) {
      const t = (time - animStart) * 0.001;
      // Bounce: use sin for smooth up-down, abs to keep positive
      duck.position.y = -0.8 + Math.abs(Math.sin(t * bounceSpeed)) * bounceHeight;
      duck.rotation.x += spinX;
      duck.rotation.y += spinY;
      duck.rotation.z += spinZ;

      // Longer cycle so it's obvious
      if (t > (Math.PI * 2 / bounceSpeed) * 1.5) {
        isAnimating = false;
        duck.position.y = -0.8;
        console.log('Bounce cycle ended.');
      }
    }
  } else {
    fallback.rotation.y += 0.015; // Visible spin on fallback
  }

  renderer.render(scene, camera);
}

animate();

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Click on whole document (more reliable)
document.addEventListener('click', () => {
  if (duck) {
    if (!isAnimating) {
      console.log('Click detected – starting new bounce!');
      isAnimating = true;
      animStart = performance.now();
      newMove();
    } else {
      console.log('Already animating – wait for finish.');
    }
  } else {
    console.log('Duck not loaded yet – no animation possible.');
  }
});
