# 3DviewerStructApp_AS

**Author:** Abhishek Shinde  

**Date Created:** 10-04-2025

**License:** Apache License  

**Copyright:** exDAS | Robert McNeel & Associates  

---

## Netlify Hosted Link
[Visit the Application](https://graphicstatics-viewer-daslabs.netlify.app/)

---

## **About**

A static vanilla JS obj viewer based on rhino3dm.js and three.js. Documentation of conversion of rhino3dm.js geometry with three.js is as below: 

https://threejs.org/docs/#examples/en/loaders/3DMLoader 

rhino3dm.js is a javascript library with an associated rhino3dm.wasm (web assembly) that is OpenNURBS plus additional C++ to javascript bindings compiled to web assembly. Web assembly is now an available technology on all major browsers as well as node.js.

The app is work in progress 


This is based on https://mcneel.github.io/rhino3dm/javascript/api/index.html 

---

### **Features**

Ability to visualize Iso-curves, Mesh-Edges, Point Clouds, SubD similar to rhino example on three. js example 

The project has several versions for script.js just so that the user can learn three.js workflows. 

This project does not currently use React and Node.js 

---

## **Usage(Local Deployment)**

1. Clone the repository to your local machine.
2. Open a terminal and navigate to the repository's directory.
3. Run the following command on the command terminal just opened: python -m http.server 
4. Open your browser and navigate to:  
   [http://localhost:8000/index.html](http://localhost:8000/index.html)


---

## **Project Status**

This project is optimized for desktop use and is currently under development for mobile compatibility.

---

## **License**

This project is licensed under the Apache License. See the LICENSE file for more details.

---


