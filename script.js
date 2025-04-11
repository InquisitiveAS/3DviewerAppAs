import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import rhino3dm from 'rhino3dm';

// Initialize Rhino3dm
const rhino = await rhino3dm();

// Create sphere
const sphere = new rhino.Sphere([0, 0, 0], 12);  // Centered at origin
console.log('Sphere diameter:', sphere.diameter);

// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xaaaaaa);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Convert Rhino sphere to Three.js mesh
const geometry = new THREE.SphereGeometry(
    sphere.radius, 
    32, 
    32
);
const material = new THREE.MeshPhongMaterial({ 
    color: 0x00ff00,
    wireframe: false,
    shininess: 100
});
const sphereMesh = new THREE.Mesh(geometry, material);
scene.add(sphereMesh);

// Camera position
camera.position.z = 30;
camera.position.y = 20;
camera.lookAt(0, 0, 0);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
