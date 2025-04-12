// Import necessary libraries 
import * as THREE from 'three';                                                // Use ES6 import syntax for Three.js
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';  // Use this for OrbitControls to work with ES6 modules
import rhino3dm from 'rhino3dm';                                               // Use ES6 import syntax for Rhino3dm

// Initialize Rhino3dm 
const rhino = await rhino3dm();
console.log('Rhino3dm loaded:', rhino);

// Scene setup
let scene, camera, renderer, controls;
const file = './resources/3DGS_polyhedra_rhv8.3dm'; // Make sure this file exists in your server root

// Load and process 3DM file using asynchronous function 
// This function fetches the 3DM file, converts it to an ArrayBuffer, and loads it into a Rhino document 
// It then iterates through the objects in the document, converts them to Three.js meshes, and adds them to the scene 
// Asynchronous functions are used to handle operations that may take time, such as fetching data from a server or loading files 
// This allows the program to continue executing other code while waiting for the asynchronous operation to complete 
// This is particularly useful in web applications where user experience is important and we want to avoid blocking the main thread and causing the UI to freeze 
async function loadModel() {
    // try catch block to handle errors during the loading process 
    try {
        const res = await fetch(file);                  // Fetch the 3DM file
        const buffer = await res.arrayBuffer();         // Convert response to ArrayBuffer
        const arr = new Uint8Array(buffer);             // Create a Uint8Array from the ArrayBuffer
        const doc = rhino.File3dm.fromByteArray(arr);   // Load the 3DM file into a Rhino document 
        
        console.log('3DM file loaded:', doc); // Log the loaded document 
        console.log('Number of objects in the document:', doc.objects().count); // Log the number of objects 

        // Create parent container for rotation - This is best practice for organizing the scene and keeping the hierarchy clean
        // This allows for easy manipulation of the entire model as a single entity 
        // and helps maintain the correct orientation of the model in the scene 
        // The modelContainer will be used to group all the meshes loaded from the 3DM file 
        const modelContainer = new THREE.Group();
        modelContainer.rotation.x = -Math.PI/2; // Fix Z-up to Y-up

        // Create a material for the mesh 
        // This material will be used for all meshes loaded from the 3DM file
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x2194ce,         //0x2194ce is a shade of blue 
            specular: 0x111111,      //0x111111 is a shade of gray
            shininess: 100           //100 is a high shininess value for the material 
        });

        // Iterate through the objects in the document and convert them to Three.js meshes 
        const objects = doc.objects();
        for (let i = 0; i < objects.count; i++) {
            // Get the geometry of the object and check if it's a mesh 
            const mesh = objects.get(i).geometry();
            if (mesh instanceof rhino.Mesh) {
                // Convert the Rhino mesh to Three.js mesh and add it to the scene using meshToThreejs function 
                // The meshToThreejs function takes a Rhino mesh and a Three.js material as input and returns a Three.js mesh
                // The meshToThreejs function is defined below and uses the BufferGeometryLoader to convert the Rhino mesh to Three.js geometry 
                const threeMesh = meshToThreejs(mesh, material);
                
                //scene.add(threeMesh); // This line is commented out to avoid adding the mesh directly to the scene 
                modelContainer.add(threeMesh); // Add the mesh to the model container instead 
            }
        }
        // Add the model container to the scene
        scene.add(modelContainer); // This line adds the model container to the scene 
    } catch (error) {
        console.error('Error loading model:', error);
    }
}

// Initialize Three.js scene
function init() {
    
    // Set default up vector for Three.js objects
    // This is important for correct orientation of the objects in the scene 
    THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0, 0, 1);
    
    // Scene setup 
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    // Camera setup 
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    //camera.position.set(26, -40, 5);   // This camera position is commented out 
    camera.position.set(50, 50, 50);   // Adjusted position for better view of grid and model
    
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
    scene.add(gridHelper);
    
    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;        // Enable damping for smooth interaction 
    controls.dampingFactor = 0.05;        // Damping factor for smoothness 
    controls.screenSpacePanning = false;  // Disable screen space panning along z-axis ie camera's z-axis
    controls.target.set(0, 0, 0);         // Set target to origin of the scene (grid center) 
    
    // Window resize handler
    window.addEventListener('resize', onWindowResize, false);

}

// Custom function to convert Rhino mesh to Three.js mesh 
// Convert Rhino mesh to Three.js geometry
function meshToThreejs(mesh, material) {
    const loader = new THREE.BufferGeometryLoader();     // Create a new BufferGeometryLoader instance 
    const geometry = loader.parse(mesh.toThreejsJSON()); // Convert Rhino mesh to Three.js JSON format 
    return new THREE.Mesh(geometry, material);           // Create a new Three.js mesh using the geometry and material 
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop for rendering the scene and updating controls 
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Initialize and start
init();
loadModel().then(() => {
    animate();
    console.log('Model loaded and scene ready');
});
