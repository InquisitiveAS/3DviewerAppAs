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
let viewPresets = {};
let currentView = 'ISO';
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

    // Camera setup — Rhino-like 3/4 perspective view of the XY ground plane
    // Wider FOV + gentler height keeps the two-point shear small and natural
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(45, -45, 20);

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
    const gridHelper = new THREE.GridHelper(size, divisions, 0x888888, 0xcccccc);
    gridHelper.rotation.x = Math.PI / 2; // Lay grid flat in XY plane to match Z-up
    scene.add(gridHelper);

    // Colored world axes on the ground plane (red = X, green = Y) like Rhino.
    // ArrowHelper draws a thick arrow with a head — needed because WebGL line
    // width is always 1px regardless of LineBasicMaterial.linewidth.
    const axisLength = size / 2;
    scene.add(new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0),
        axisLength, 0xcc0000, 4, 2
    ));
    scene.add(new THREE.ArrowHelper(
        new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0),
        axisLength, 0x00aa00, 4, 2
    ));

    // Turntable group at origin — only the loaded geometry spins, no visible disc
    turntable = new THREE.Group();
    scene.add(turntable);

    // Controls setup — pan and zoom only, no orbit (view stays locked)
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.target.set(0, 0, 0);
    controls.enableRotate = false; // Lock the camera so the grid never rotates

    // Window resize handler
    window.addEventListener('resize', onWindowResize, false);

    // View cube buttons — snap camera to preset directions (always two-point perspective)
    setupViewCube();
}

// Wire view-cube clicks. Positions are populated by fitCameraToTurntable()
// after the model loads so the camera distance matches the geometry size.
function setupViewCube() {
    document.querySelectorAll('#viewcube button').forEach((btn) => {
        btn.addEventListener('click', () => applyView(btn.dataset.view));
    });
}

function applyView(name) {
    const v = viewPresets[name];
    if (!v) return;
    currentView = name;
    controls.target.set(0, 0, 0);
    camera.position.set(v[0], v[1], v[2]);
}

// Compute the orbit radius needed to keep the turntable in view for ANY
// rotation (worst case = the farthest point from the rotation axis Z),
// then derive a camera distance from the FOV and build the preset map.
function fitCameraToTurntable() {
    if (!turntable || turntable.children.length === 0) return;

    const box = new THREE.Box3().setFromObject(turntable);
    if (box.isEmpty()) return;

    // Worst-case radius from the Z rotation axis at origin
    const corners = [
        new THREE.Vector3(box.min.x, box.min.y, box.min.z),
        new THREE.Vector3(box.min.x, box.min.y, box.max.z),
        new THREE.Vector3(box.min.x, box.max.y, box.min.z),
        new THREE.Vector3(box.min.x, box.max.y, box.max.z),
        new THREE.Vector3(box.max.x, box.min.y, box.min.z),
        new THREE.Vector3(box.max.x, box.min.y, box.max.z),
        new THREE.Vector3(box.max.x, box.max.y, box.min.z),
        new THREE.Vector3(box.max.x, box.max.y, box.max.z),
    ];
    let radialExtent = 0;          // farthest XY distance from Z axis
    let topExtent = 0;             // tallest Z value
    let bottomExtent = 0;          // most-negative Z value
    for (const c of corners) {
        radialExtent = Math.max(radialExtent, Math.hypot(c.x, c.y));
        topExtent = Math.max(topExtent, c.z);
        bottomExtent = Math.min(bottomExtent, c.z);
    }
    const halfHeight = Math.max(topExtent, -bottomExtent, radialExtent * 0.25);

    // Frame both width (radial) and height (vertical extent) using the camera FOV
    const fovV = THREE.MathUtils.degToRad(camera.fov);
    const fovH = 2 * Math.atan(Math.tan(fovV / 2) * camera.aspect);
    const distForHeight = halfHeight / Math.tan(fovV / 2);
    const distForWidth = radialExtent / Math.tan(fovH / 2);
    const distance = Math.max(distForHeight, distForWidth) * 1.6; // margin

    const height = Math.max(halfHeight * 0.6, radialExtent * 0.35); // gentle two-point tilt
    const d = distance / Math.SQRT2;

    viewPresets = {
        N:   [0,         -distance, height],
        S:   [0,          distance, height],
        E:   [-distance,  0,        height],
        W:   [distance,   0,        height],
        NE:  [-d,        -d,        height],
        NW:  [d,         -d,        height],
        SE:  [-d,         d,        height],
        SW:  [d,          d,        height],
        ISO: [d,         -d,        height * 1.8],
    };

    // Push the far plane out so the larger orbit distance doesn't clip the model
    camera.far = Math.max(camera.far, distance * 4);
    camera.updateProjectionMatrix();

    applyView(currentView);
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
    fitCameraToTurntable(); // re-frame so the model still fits at the new aspect
}

// Two-point perspective: force the camera image plane parallel to world Z by
// looking horizontally, then shear the projection matrix to bring the target
// back into view. Vertical world lines remain vertical on screen.
function applyTwoPointPerspective() {
    const target = controls.target;
    const dx = camera.position.x - target.x;
    const dy = camera.position.y - target.y;
    const horizDistance = Math.sqrt(dx * dx + dy * dy);
    if (horizDistance < 1e-4) return; // looking straight down — skip

    const heightDiff = camera.position.z - target.z;

    // Look horizontally toward the target with strict world-up
    camera.up.set(0, 0, 1);
    camera.lookAt(target.x, target.y, camera.position.z);

    // Apply vertical principal-point shift equal to the would-be tilt angle.
    // shift in NDC = tan(tilt) / tan(fov/2) = (heightDiff / horizDistance) / tan(fov/2)
    camera.updateProjectionMatrix();
    const fovRad = THREE.MathUtils.degToRad(camera.fov);
    camera.projectionMatrix.elements[9] =
        (heightDiff / horizDistance) / Math.tan(fovRad / 2);
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
}

// Animation loop for rendering and updating controls
function animate() {
    requestAnimationFrame(animate);

    if (turntable) turntable.rotation.z += 0.005; // Spin geometry around Z
    controls.update();      // Update OrbitControls for damping effect
    applyTwoPointPerspective();
    renderer.render(scene, camera);
}

// Initialize and start application
init();
loadModel().then(() => {
    fitCameraToTurntable();
    animate();
});
