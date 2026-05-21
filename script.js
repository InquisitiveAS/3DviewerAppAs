// Description: This script loads a 3DM file using Rhino3dm and displays it in a Three.js scene with OrbitControls for interaction. It uses ES6 import syntax for better module management and compatibility with modern JavaScript standards.

// Import necessary libraries
import * as THREE from 'three';                                                // Use ES6 import syntax for Three.js
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';  // Use this for OrbitControls to work with ES6 modules
import rhino3dm from 'rhino3dm';                                               // Use ES6 import syntax for Rhino3dm

// Initialize Rhino3dm
const rhino = await rhino3dm();
console.log('Rhino3dm loaded:', rhino);

// Scene setup
let scene, camera, renderer, controls, turntable;
const file = './resources/3DGS_polyhedra_rhv8.3dm'; // Make sure this file exists in your server root

// Load and process 3DM file using asynchronous function
async function loadModel() {
    try {
        const res = await fetch(file);                  // Fetch the 3DM file
        const buffer = await res.arrayBuffer();         // Convert response to ArrayBuffer
        const arr = new Uint8Array(buffer);             // Create a Uint8Array from the ArrayBuffer
        const doc = rhino.File3dm.fromByteArray(arr);   // Load the 3DM file into a Rhino document 
        
        console.log('3DM file loaded:', doc);           // Log the loaded document 
        console.log('Number of objects in the document:', doc.objects().count); // Log the number of objects 

        // Create a material for the mesh
        const material = new THREE.MeshPhongMaterial({
            color: 0x2194ce,
            specular: 0x111111,
            shininess: 100
        });

        // Iterate through the objects in the document and convert them to Three.js meshes
        // Added to the turntable group so they rotate with the disc
        const objects = doc.objects();
        for (let i = 0; i < objects.count; i++) {
            const mesh = objects.get(i).geometry();
            if (mesh instanceof rhino.Mesh) {
                const threeMesh = meshToThreejs(mesh, material);
                turntable.add(threeMesh);
            }
        }
    } catch (error) {
        console.error('Error loading model:', error);
    }
}

// Initialize Three.js scene
function init() {
    // Set default up vector for Three.js objects
    THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0, 0, 1);

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Camera setup — positioned at model height so the view is horizontal (two-point perspective)
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(60, 60, 10);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Add grid helper to visualize origin and reference grid
    const size = 100;       // Size of the grid (width and height)
    const divisions = 100;  // Number of divisions in the grid
    const gridHelper = new THREE.GridHelper(size, divisions);
    gridHelper.rotation.x = Math.PI / 2; // Lay grid flat in XY plane to match Z-up
    scene.add(gridHelper);

    // Turntable group at origin — the disc + model rotate around Z together
    turntable = new THREE.Group();
    scene.add(turntable);

    // Rotating disc at 0,0,0
    const discGeometry = new THREE.CylinderGeometry(15, 15, 0.3, 64);
    const discMaterial = new THREE.MeshPhongMaterial({
        color: 0x444444,
        specular: 0x222222,
        shininess: 60
    });
    const disc = new THREE.Mesh(discGeometry, discMaterial);
    disc.rotation.x = Math.PI / 2; // Lay the disc flat in XY plane (Z-up)
    turntable.add(disc);

    // Controls setup — lock polar angle so vertical lines stay vertical (two-point perspective)
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.target.set(0, 0, 0);
    controls.minPolarAngle = Math.PI / 2;
    controls.maxPolarAngle = Math.PI / 2;

    // Window resize handler
    window.addEventListener('resize', onWindowResize, false);
}

// Convert Rhino mesh to Three.js geometry
function meshToThreejs(mesh, material) {
    const loader = new THREE.BufferGeometryLoader();
    const geometry = loader.parse(mesh.toThreejsJSON());
    return new THREE.Mesh(geometry, material);
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

    if (turntable) turntable.rotation.z += 0.005; // Spin disc + model around Z
    controls.update();      // Update OrbitControls for damping effect
    renderer.render(scene, camera);
}

// Initialize and start application
init();
loadModel().then(() => {
    animate();
});
