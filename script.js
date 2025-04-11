// Importing the required modules from Rhino3dm and Three.js libraries
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js'; // Use this to from npm jsdelivery to import Three.js
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/controls/OrbitControls.js'   //Use this to import from npm jsdelivery to import OrbitControls
import rhino3dm from 'rhino3dm'                                                // Use this to import Rhino3dm                                     
import { Rhino3dmLoader } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/loaders/3DMLoader.js';  // Use this to import Rhino3dmLoader
import { Scene, PerspectiveCamera, WebGLRenderer } from 'three'                // Use this to import Scene, PerspectiveCamera, and WebGLRenderer

// Initialize Rhino3dm library and load the Rhino3dm module
const rhino = await rhino3dm(); 

// Create a new sphere object with center at (1,2,3) and radius 12
const sphere = new rhino.Sphere([1, 2, 3], 12);

// Log the diameter of the sphere to the console
console.log(sphere.diameter);

// Set up the Three.js scene
const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add OrbitControls for interaction
const controls = new OrbitControls(camera, renderer.domElement);

// Convert the Rhino sphere to a Three.js geometry
const sphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(sphere.radius, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
);
scene.add(sphereMesh);

// Position the camera
camera.position.z = 50;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
