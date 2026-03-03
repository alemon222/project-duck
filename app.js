// Use full CDN URLs for everything – no import map needed
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

// Fallback red cube
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

// Use Khronos GitHub raw URL for Duck.glb (confirmed working alternative)
const loader = new GLTFLoader();
loader.load(
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Duck/glTF-Binary/Duck.glb',
  (gltf) => {
    duck = gltf.scene;
    scene.add(duck);
    duck.scale.set(0.05, 0.05, 0.05);
    duck.position.y = -0.8;
    duck.rotation.y = Math.PI;
    scene.remove(fallback);
    console.log('✅ Duck loaded from Khronos repo!');
  },
  (progress) => {
    console.log(`Loading: ${(progress.loaded / progress.total * 100 || 0).toFixed(1)}%`);
  },
  (err) => {
    console.error('❌ Model load failed:', err);
  }
);

// New unique move
function newMove() {
  bounceHeight = 1.8 + Math.random() * 5;
  bounceSpeed  = 2.5 + Math.random() * 6;
  spinX = (Math.random() - 0.5) * 0.25;
  spinY = (Math.random() - 0.5) * 0.30;
  spinZ = (Math.random() - 0.5) * 0.20;
}

function animate(time = 0) {
  requestAnimationFrame(animate);

  if (duck) {
    if (isAnimating) {
      const t = (time - animStart) * 0.001;
      duck.position.y = -0.8 + Math.abs(Math.sin(t * bounceSpeed)) * bounceHeight;
      duck.rotation.x += spinX;
      duck.rotation.y += spinY;
      duck.rotation.z += spinZ;

      if (t > (Math.PI / bounceSpeed) * 1.2) {
        isAnimating = false;
        duck.position.y = -0.8;
      }
    }
  } else {
    fallback.rotation.y += 0.01;
  }

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.domElement.addEventListener('click', () => {
  if (!isAnimating && duck) {
    isAnimating = true;
    animStart = performance.now();
    newMove();
  }
});
