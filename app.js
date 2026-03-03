// Full absolute URLs – no bare 'three' specifiers
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x88aaff);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 1.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// Fallback spinning red cube if duck fails
const fallbackGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
const fallbackMat = new THREE.MeshStandardMaterial({ color: 0xff4444 });
const fallback = new THREE.Mesh(fallbackGeo, fallbackMat);
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
  'https://threejs.org/examples/models/gltf/Duck.glb',
  (gltf) => {
    duck = gltf.scene;
    scene.add(duck);
    duck.scale.set(0.05, 0.05, 0.05);
    duck.position.y = -0.8;
    duck.rotation.y = Math.PI; // face camera
    scene.remove(fallback);
    console.log('✅ Duck model loaded!');
  },
  (progress) => {
    console.log(`Loading duck: ${(progress.loaded / progress.total * 100).toFixed(1)}%`);
  },
  (err) => {
    console.error('❌ Duck model failed to load:', err);
  }
);

// New random move (infinite variety)
function newMove() {
  bounceHeight = 1.8 + Math.random() * 5;     // taller/lower bounces
  bounceSpeed  = 2.5 + Math.random() * 6;     // faster/slower
  spinX = (Math.random() - 0.5) * 0.25;
  spinY = (Math.random() - 0.5) * 0.30;
  spinZ = (Math.random() - 0.5) * 0.20;
}

// Animation loop
function animate(time = 0) {
  requestAnimationFrame(animate);

  if (duck) {
    if (isAnimating) {
      const t = (time - animStart) * 0.001;
      duck.position.y = -0.8 + Math.abs(Math.sin(t * bounceSpeed)) * bounceHeight;
      duck.rotation.x += spinX;
      duck.rotation.y += spinY;
      duck.rotation.z += spinZ;

      // End after ~one full bounce
      if (t > (Math.PI / bounceSpeed) * 1.2) {
        isAnimating = false;
        duck.position.y = -0.8;
      }
    }
  } else {
    fallback.rotation.y += 0.01; // visual feedback that scene is alive
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

// Click to bounce!
renderer.domElement.addEventListener('click', () => {
  if (!isAnimating && duck) {
    isAnimating = true;
    animStart = performance.now();
    newMove();
  }
});
