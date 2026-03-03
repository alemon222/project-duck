import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.168.0/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x88aaff);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 1.2));
const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 8, 6);
scene.add(dirLight);

// Fallback (red box) in case model fails to load
const fallbackGeo = new THREE.BoxGeometry(1, 1, 1);
const fallbackMat = new THREE.MeshStandardMaterial({ color: 0xff4444 });
const fallback = new THREE.Mesh(fallbackGeo, fallbackMat);
scene.add(fallback);

// Duck variables
let duck;
let isAnimating = false;
let animStart = 0;
let bounceHeight = 0;
let bounceSpeed = 0;
let spinX = 0;
let spinY = 0;
let spinZ = 0;

const loader = new GLTFLoader();
loader.load(
  'https://threejs.org/examples/models/gltf/Duck.glb',
  (gltf) => {
    duck = gltf.scene;
    scene.add(duck);
    duck.scale.set(0.04, 0.04, 0.04);     // small size
    duck.position.y = -0.8;               // slightly above "ground"
    duck.rotation.y = Math.PI;            // face forward
    scene.remove(fallback);               // hide fallback when duck loads
    console.log("Duck loaded successfully!");
  },
  undefined,
  (err) => {
    console.error("Failed to load duck model:", err);
  }
);

// Generate completely new random move parameters
function newMove() {
  bounceHeight = 1.5 + Math.random() * 4;     // 1.5 → 5.5 units up
  bounceSpeed  = 3 + Math.random() * 5;       // faster/slower cycles
  spinX = (Math.random() - 0.5) * 0.18;       // random spin rates
  spinY = (Math.random() - 0.5) * 0.22;
  spinZ = (Math.random() - 0.5) * 0.16;
}

// Animation loop
function animate(time = 0) {
  requestAnimationFrame(animate);

  if (duck) {
    if (isAnimating) {
      const t = (time - animStart) * 0.001; // seconds
      // Parabolic-ish bounce using |sin| for one clean up-down
      duck.position.y = -0.8 + Math.abs(Math.sin(t * bounceSpeed)) * bounceHeight;
      // Continuous spin during bounce
      duck.rotation.x += spinX;
      duck.rotation.y += spinY;
      duck.rotation.z += spinZ;

      // Stop after roughly one full bounce cycle
      if (t > (Math.PI / bounceSpeed) * 1.1) {
        isAnimating = false;
        duck.position.y = -0.8;
      }
    }
  } else {
    // Rotate fallback cube slowly so you know it's rendering
    fallback.rotation.y += 0.008;
  }

  renderer.render(scene, camera);
}

animate();

// Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Click → trigger new unique bounce
renderer.domElement.addEventListener('click', () => {
  if (!isAnimating && duck) {
    isAnimating = true;
    animStart = performance.now();
    newMove();
  }
});
