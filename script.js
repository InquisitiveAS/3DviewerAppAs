// Importing the required modules from Rhino3dm and Three.js libraries
import * as THREE from 'three'                                                  // Use this to import Three.js
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'    //Use this to import OrbitControls
import rhino3dm from 'rhino3dm'                                           // Use this to import Rhino3dm                                     
import { Rhino3dmLoader } from 'three/examples/jsm/loaders/Rhino3dmLoader.js'
import { Scene, PerspectiveCamera, WebGLRenderer } from 'three'

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
