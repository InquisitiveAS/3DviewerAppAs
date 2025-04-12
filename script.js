// Import necessary libraries
import * as THREE from 'three';                                                // Use ES6 import syntax for Three.js
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';  // Use this for OrbitControls to work with ES6 modules
import rhino3dm from 'rhino3dm';                                               // Use ES6 import syntax for Rhino3dm

// Initialize Rhino3dm
const rhino = await rhino3dm();
console.log('Rhino3dm loaded:', rhino);

// Scene setup
let scene, camera, renderer, controls;
const file = './resources/your_file_name.3dm'; // Replace with the actual path to your .3dm file

// Load and process 3DM file using asynchronous function
async function loadModel() {
    try {
        const res = await fetch(file);                  // Fetch the .3dm file
        const buffer = await res.arrayBuffer();         // Convert response to ArrayBuffer
        const arr = new Uint8Array(buffer);             // Create a Uint8Array from the ArrayBuffer
        const doc = rhino.File3dm.fromByteArray(arr);   // Load the .3dm file into a Rhino document

        console.log('Number of objects in the document:', doc.objects().count);

        const modelContainer = new THREE.Group();
        modelContainer.rotation.x = -Math.PI / 2;       // Rotate Z-up to Y-up

        const material = new THREE.MeshPhongMaterial({
            color: 0x2194ce,
            specular: 0x111111,
            shininess: 100,
        });

        const objects = doc.objects();
        for (let i = 0; i < objects.count; i++) {
            const mesh = objects.get(i).geometry();
            if (mesh instanceof rhino.Mesh) {
                const threeMesh = meshToThreejs(mesh, material);
                modelContainer.add(threeMesh);
            }
        }
        scene.add(modelContainer);
    } catch (error) {
        console.error('Error loading model:', error);
    }
}

// Convert Rhino mesh to Three.js geometry
function meshToThreejs(mesh, material) {
    const loader = new THREE.BufferGeometryLoader();
    const geometry = loader.parse(mesh.toThreejsJSON());
    return new THREE.Mesh(geometry, material);
}

// Initialize Three.js scene
function init() {
    THREE.Object3D.DEFAULT_UP.set(0, 0, 1); // Set default up vector for Z-up orientation

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(50, 50, 50);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);

    window.addEventListener('resize', onWindowResize);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop for rendering and updating controls
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Initialize and start application
init();
loadModel().then(() => animate());
