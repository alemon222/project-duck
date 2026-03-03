import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.183.2/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.183.2/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Load the duck model (free GLTF from Khronos Group)
let duck;
const loader = new GLTFLoader();
loader.load('https://github.com/KhronosGroup/glTF-Sample-Models/raw/master/2.0/Duck/glTF-Binary/Duck.glb', (gltf) => {
    duck = gltf.scene;
    scene.add(duck);
    duck.scale.set(0.05, 0.05, 0.05); // Scale down the model
    duck.position.y = -1; // Ground level adjustment
    duck.rotation.y = Math.PI; // Face forward if needed
});

camera.position.z = 5;

// Animation variables
let isAnimating = false;
let animationStartTime;
let bounceHeight;
let bounceSpeed;
let spinX;
let spinY;
let spinZ;

function generateNewMove() {
    // Procedurally generate unique parameters for infinite variety
    bounceHeight = Math.random() * 3 + 1; // Random height between 1-4
    bounceSpeed = Math.random() * 2 + 1; // Random speed between 1-3
    spinX = (Math.random() - 0.5) * 0.1; // Random spin rate on X (-0.05 to 0.05)
    spinY = (Math.random() - 0.5) * 0.1; // Random spin on Y
    spinZ = (Math.random() - 0.5) * 0.1; // Random spin on Z
}

function animate() {
    requestAnimationFrame(animate);
    if (duck && isAnimating) {
        const elapsedTime = (performance.now() - animationStartTime) / 1000;
        // Bounce: single up-down cycle
        duck.position.y = -1 + Math.abs(Math.sin(elapsedTime * bounceSpeed)) * bounceHeight;
        // Apply spins
        duck.rotation.x += spinX;
        duck.rotation.y += spinY;
        duck.rotation.z += spinZ;
        // End animation after one full bounce cycle
        if (elapsedTime > (Math.PI * 2) / bounceSpeed) {
            isAnimating = false;
            duck.position.y = -1; // Reset to ground
        }
    }
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Click event to trigger new move
renderer.domElement.addEventListener('click', () => {
    if (!isAnimating && duck) {
        isAnimating = true;
        animationStartTime = performance.now();
        generateNewMove();
    }
});
