/**
* Proyecto Final GPC
* @author: Toni Blasco
* Titulo: Juego por niveles
*/

import * as THREE from "../lib/three.module.js";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";
import {OrbitControls} from "../lib/OrbitControls.module.js";
import {TWEEN} from "../lib/tween.module.min.js";
import {GUI} from "../lib/lil-gui.module.min.js";
import * as CANNON from '../lib/cannon-es.js'; 

//variables estandar
var renderer, scene, camera, cameraControls, angulo, camaraPlanta, effectController;
const L = 103;
var constraintLB,constraintRB,forwardVelocity,rightVelocity,constraintLF,constraintRF
var robot, base;

//Acciones
init();
loadScene();
setupGUI();
render();

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0xFFFFFF));
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.autoClear = false;
    document.getElementById('container').appendChild(renderer.domElement);

    scene = new THREE.Scene();

    //CAMARA
    var aspectRatio = window.innerWidth/window.innerHeight;
    camera = new THREE.PerspectiveCamera(75,aspectRatio,0.1,1000);
    camera.position.set(90, 200, 350);
    //camera.lookAt(new THREE.Vector3(0, 0, 0));


    //orbitcontrols
    cameraControls = new OrbitControls(camera,renderer.domElement);
    cameraControls.target.set(0,0,0);

    
    //renderer.domElement.addEventListener('dblclick', animate );

    //LUZ
    const light = new THREE.DirectionalLight()
    light.position.set(25, 50, 25)
    light.castShadow = true
    light.shadow.mapSize.width = 16384
    light.shadow.mapSize.height = 16384
    light.shadow.camera.near = 0.5
    light.shadow.camera.far = 100
    light.shadow.camera.top = 100
    light.shadow.camera.bottom = -100
    light.shadow.camera.left = -100
    light.shadow.camera.right = 100
    scene.add(light)

    
}

function loadScene() {

    const chaseCam = new THREE.Object3D()
    chaseCam.position.set(0, 0, 0)
    const chaseCamPivot = new THREE.Object3D()
    chaseCamPivot.position.set(0, 2, 4)
    chaseCam.add(chaseCamPivot)
    scene.add(chaseCam)

    const phongMaterial = new THREE.MeshPhongMaterial()

    //creación del mundo fisico
    const world = new CANNON.World()
    world.gravity.set(0, -9.82, 0)

    const groundMaterial = new CANNON.Material('groundMaterial')
    groundMaterial.friction = 0.25
    groundMaterial.restitution = 0.25

    const wheelMaterial = new CANNON.Material('wheelMaterial')
    wheelMaterial.friction = 0.25
    wheelMaterial.restitution = 0.25

    //ground mundo visual
    const groundGeometry = new THREE.PlaneGeometry(100, 100)
    const groundMesh =  new THREE.Mesh(groundGeometry, phongMaterial)
    groundMesh.rotateX(-Math.PI / 2)
    groundMesh.receiveShadow = true
    scene.add(groundMesh)
    //mundo fisico suelo
    const groundShape = new CANNON.Box(new CANNON.Vec3(50, 1, 50))
    const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial })
    groundBody.addShape(groundShape)
    groundBody.position.set(0, -1, 0)
    world.addBody(groundBody)

    //CAR mundo visual
    const carBodyGeometry = new THREE.BoxGeometry(1, 1, 2)
    const carBodyMesh = new THREE.Mesh(carBodyGeometry, phongMaterial)
    carBodyMesh.position.y = 3
    carBodyMesh.castShadow = true
    scene.add(carBodyMesh)
    carBodyMesh.add(chaseCam)
    //car mundo fisico
    const carBodyShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 1))
    const carBody = new CANNON.Body({ mass: 1 })
    carBody.addShape(carBodyShape)
    carBody.position.x = carBodyMesh.position.x
    carBody.position.y = carBodyMesh.position.y
    carBody.position.z = carBodyMesh.position.z
    world.addBody(carBody)

    //rueda derecha delantera visual
    const wheelRFGeometry = new THREE.CylinderGeometry(
    0.33,
    0.33,
    0.2
    )
    wheelRFGeometry.rotateZ(Math.PI / 2)
    const wheelRFMesh = new THREE.Mesh(wheelRFGeometry, phongMaterial)
    wheelRFMesh.position.y = 3
    wheelRFMesh.position.x = 1
    wheelRFMesh.position.z = -1
    wheelRFMesh.castShadow = true
    scene.add(wheelRFMesh)
    //rueda derecha delantera fisica
    const wheelRFShape = new CANNON.Sphere(0.33)
    const wheelRFBody = new CANNON.Body({ mass: 1, material: wheelMaterial })
    wheelRFBody.addShape(wheelRFShape)
    wheelRFBody.position.x = wheelRFMesh.position.x
    wheelRFBody.position.y = wheelRFMesh.position.y
    wheelRFBody.position.z = wheelRFMesh.position.z
    world.addBody(wheelRFBody)

    //rueda izquierda delantera visual
    const wheelLFGeometry = new THREE.CylinderGeometry(
    0.33,
    0.33,
    0.2
    )
    wheelLFGeometry.rotateZ(Math.PI / 2)
    const wheelLFMesh = new THREE.Mesh(wheelLFGeometry, phongMaterial)
    wheelLFMesh.position.x = -1
    wheelLFMesh.position.y = 3
    wheelLFMesh.position.z = -1
    wheelLFMesh.castShadow = true
    scene.add(wheelLFMesh)
    //rueda izquierda delantera fisica
    const wheelLFShape = new CANNON.Sphere(0.33)
    const wheelLFBody = new CANNON.Body({ mass: 1, material: wheelMaterial })
    wheelLFBody.addShape(wheelLFShape)
    wheelLFBody.position.x = wheelLFMesh.position.x
    wheelLFBody.position.y = wheelLFMesh.position.y
    wheelLFBody.position.z = wheelLFMesh.position.z
    world.addBody(wheelLFBody)

    //rueda izquierda trasera visual
    const wheelLBGeometry = new THREE.CylinderGeometry(
    0.4,
    0.4,
    0.33
    )
    wheelLBGeometry.rotateZ(Math.PI / 2)
    const wheelLBMesh = new THREE.Mesh(wheelLBGeometry, phongMaterial)
    wheelLBMesh.position.y = 3
    wheelLBMesh.position.x = -1
    wheelLBMesh.position.z = 1
    wheelLBMesh.castShadow = true
    scene.add(wheelLBMesh)
    //rueda izquierda trasera fisica
    const wheelLBShape = new CANNON.Sphere(0.4)
    const wheelLBBody = new CANNON.Body({ mass: 1, material: wheelMaterial })
    wheelLBBody.addShape(wheelLBShape)
    wheelLBBody.position.x = wheelLBMesh.position.x
    heelLBBody.position.y = wheelLBMesh.position.y
    wheelLBBody.position.z = wheelLBMesh.position.z
    world.addBody(wheelLBBody)

    //rueda derecha trasera visual
    const wheelRBGeometry = new THREE.CylinderGeometry(
    0.4,
    0.4,
    0.33
    )
    wheelRBGeometry.rotateZ(Math.PI / 2)
    const wheelRBMesh = new THREE.Mesh(wheelRBGeometry, phongMaterial)
    wheelRBMesh.position.y = 3
    wheelRBMesh.position.x = 1
    wheelRBMesh.position.z = 1
    wheelRBMesh.castShadow = true
    scene.add(wheelRBMesh)
    //rueda derecha trasera fisica
    const wheelRBShape = new CANNON.Sphere(0.4)
    const wheelRBBody = new CANNON.Body({ mass: 1, material: wheelMaterial })
    wheelRBBody.addShape(wheelRBShape)
    wheelRBBody.position.x = wheelRBMesh.position.x
    wheelRBBody.position.y = wheelRBMesh.position.y
    wheelRBBody.position.z = wheelRBMesh.position.z
    world.addBody(wheelRBBody)

    constraintLF = new CANNON.HingeConstraint(carBody, wheelLFBody, {
        pivotA: new CANNON.Vec3(-1, -0.5, -1),
        axisA: leftFrontAxis,
        maxForce: 0.99,
    })
    world.addConstraint(constraintLF)
    constraintRF = new CANNON.HingeConstraint(carBody, wheelRFBody, {
        pivotA: new CANNON.Vec3(1, -0.5, -1),
        axisA: rightFrontAxis,
        maxForce: 0.99,
    })
    world.addConstraint(constraintRF)
    constraintLB = new CANNON.HingeConstraint(carBody, wheelLBBody, {
        pivotA: new CANNON.Vec3(-1, -0.5, 1),
        axisA: leftBackAxis,
        maxForce: 0.99,
    })
    world.addConstraint(constraintLB)
    constraintRB = new CANNON.HingeConstraint(carBody, wheelRBBody, {
        pivotA: new CANNON.Vec3(1, -0.5, 1),
        axisA: rightBackAxis,
        maxForce: 0.99,
    })
    world.addConstraint(constraintRB)

    //añado los eventos que moveran al coche
    keyborad.domElement.addEventListener('keydown', function(event){
        if(keyborad.eventMatches(event, 'left')){
            rightVelocity -= 0.1
        }
        if(keyborad.eventMatches(event, 'right')){
            rightVelocity -= 0.1 
        }
        if(keyborad.eventMatches(event, 'up')){
            forwardVelocity += 1 
        }
        if(keyborad.eventMatches(event, 'down')){
            forwardVelocity -= 1
        }
    })

}

function animate() {
    //requestAnimationFrame(animate)

    //helper.update()

    delta = Math.min(clock.getDelta(), 0.1)
    world.step(delta)

    cannonDebugRenderer.update()

    // Copy coordinates from Cannon to Three.js
    carBodyMesh.position.set(
        carBody.position.x,
        carBody.position.y,
        carBody.position.z
    )
    carBodyMesh.quaternion.set(
        carBody.quaternion.x,
        carBody.quaternion.y,
        carBody.quaternion.z,
        carBody.quaternion.w
    )

    wheelLFMesh.position.set(
        wheelLFBody.position.x,
        wheelLFBody.position.y,
        wheelLFBody.position.z
    )
    wheelLFMesh.quaternion.set(
        wheelLFBody.quaternion.x,
        wheelLFBody.quaternion.y,
        wheelLFBody.quaternion.z,
        wheelLFBody.quaternion.w
    )

    wheelRFMesh.position.set(
        wheelRFBody.position.x,
        wheelRFBody.position.y,
        wheelRFBody.position.z
    )
    wheelRFMesh.quaternion.set(
        wheelRFBody.quaternion.x,
        wheelRFBody.quaternion.y,
        wheelRFBody.quaternion.z,
        wheelRFBody.quaternion.w
    )

    wheelLBMesh.position.set(
        wheelLBBody.position.x,
        wheelLBBody.position.y,
        wheelLBBody.position.z
    )
    wheelLBMesh.quaternion.set(
        wheelLBBody.quaternion.x,
        wheelLBBody.quaternion.y,
        wheelLBBody.quaternion.z,
        wheelLBBody.quaternion.w
    )

    wheelRBMesh.position.set(
        wheelRBBody.position.x,
        wheelRBBody.position.y,
        wheelRBBody.position.z
    )
    wheelRBMesh.quaternion.set(
        wheelRBBody.quaternion.x,
        wheelRBBody.quaternion.y,
        wheelRBBody.quaternion.z,
        wheelRBBody.quaternion.w
    )

    thrusting = false
    

    constraintLB.setMotorSpeed(forwardVelocity)
    constraintRB.setMotorSpeed(forwardVelocity)
    constraintLF.axisA.z = rightVelocity
    constraintRF.axisA.z = rightVelocity

    camera.lookAt(carBodyMesh.position)

    chaseCamPivot.getWorldPosition(v)
    if (v.y < 1) {
        v.y = 1
    }
    camera.position.lerpVectors(camera.position, v, 0.05)

    //render()

}

function render() {
    requestAnimationFrame(render);
    renderer.domElement.setAttribute("tabIndex", "0");
    renderer.domElement.focus();
    update();
    //Borrar una unica vez
    renderer.clear();
    renderer.setViewport(0,0,window.innerWidth, window.innerHeight);
    renderer.render(scene,camera);
}