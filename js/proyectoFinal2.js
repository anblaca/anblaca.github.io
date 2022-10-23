import * as THREE from "../lib/three.module.js";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";
import {TWEEN} from "../lib/tween.module.min.js";
import {GUI} from "../lib/lil-gui.module.min.js";
import * as CANNON from '../lib/cannon-es.js'; 
import { FontLoader } from 'https://threejs.org/examples/jsm/loaders/FontLoader.js';	
import { TextGeometry } from 'https://threejs.org/examples/jsm/geometries/TextGeometry.js';

var renderer, scene, camera, carBodyMesh, wheelLFMesh, wheelRFMesh, wheelLBMesh,wheelRBMesh, forwardVelocity, rightVelocity ;

var constraintLB,constraintRB,constraintLF,constraintRF,world, chaseCamPivot

var carBody, wheelLFBody, wheelRFBody, wheelLBBody, wheelRBBody, chaseCam, moneda, loader, dificil, effectController
var canvas, ctx, phongMaterial
var cuentaMonedas = 0

const clock = new THREE.Clock()
let delta
const monedas = []

const v = new THREE.Vector3()


function init() {
    scene = new THREE.Scene()

    // Luces
    scene.add( new THREE.AmbientLight( 0x222222 ) );
	const light = new THREE.DirectionalLight( 0xFFFFFF, 0.6 );
	light.position.set( 25, 50, 25 );
	light.castShadow = true;
	light.shadow.mapSize.width = 16384;
	light.shadow.mapSize.height = 16384;
	light.shadow.camera.near = 0.5;
	light.shadow.camera.far = 100;
	light.shadow.camera.left = - 100;
	light.shadow.camera.right = 100;
	light.shadow.camera.top = 150;
	light.shadow.camera.bottom = - 150;
    scene.add(light);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    chaseCam = new THREE.Object3D()
    chaseCam.position.set(0, 0, 0)
    chaseCamPivot = new THREE.Object3D()
    chaseCamPivot.position.set(0, 2, 4)
    chaseCam.add(chaseCamPivot)
    scene.add(chaseCam)
    dificil = false
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    document.body.appendChild(renderer.domElement)
    


    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    drawScore()

    window.addEventListener('resize', onWindowResize, false)
    function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
    }

}

function drawScore() {
    console.log("entro a dibujar")
    ctx.font = "50px Arial";
    ctx.fillStyle = "#FF0000";
    ctx.fillText("Score: " + cuentaMonedas, 60, 60);
}

function loadScene() {
    phongMaterial = new THREE.MeshPhongMaterial()

    world = new CANNON.World()
    world.gravity.set(0, -9.82, 0)
    
    const groundMaterial = new CANNON.Material('groundMaterial')
    groundMaterial.friction = 0.25
    groundMaterial.restitution = 0.25
    
    const wheelMaterial = new CANNON.Material('wheelMaterial')
    wheelMaterial.friction = 0.25
    wheelMaterial.restitution = 0.25
    
    //ground
    const sueloMesh = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 50, 50), phongMaterial)
    sueloMesh.rotation.x = -Math.PI / 2
    sueloMesh.receiveShadow = true
    scene.add(sueloMesh)
    const sueloShape = new CANNON.Box(new CANNON.Vec3(100, 1, 100))
    const sueloBody = new CANNON.Body({ mass: 0, material: groundMaterial })
    sueloBody.addShape(sueloShape)
    sueloBody.position.set(0, -1, 0)
    world.addBody(sueloBody)
    
    //loader = new FontLoader();


    //loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {

    //textGeometry = new TextGeometry( "text", {

      //  font: font,

        //size: 50,
        //height: 10,
        //curveSegments: 12,

        //bevelThickness: 1,
        //bevelSize: 1,
        //bevelEnabled: true

    //});

    //var textMaterial = new THREE.MeshPhongMaterial( 
      //  { color: 0xff0000, specular: 0xffffff }
    //);

    //mesh = new THREE.Mesh( textGeometry, textMaterial );

    //scene.add( mesh );

    //});   

    // Paredes
    const backWall = new CANNON.Body( {mass:0, material:groundMaterial} );
    backWall.addShape( new CANNON.Plane() );
    backWall.position.z = -100;
    world.addBody( backWall );
 
    const frontWall = new CANNON.Body( {mass:0, material:groundMaterial} );
    frontWall.addShape( new CANNON.Plane() );
    frontWall.quaternion.setFromEuler(0,Math.PI,0,'XYZ');
    frontWall.position.z = 100;
    world.addBody( frontWall );
 
    const leftWall = new CANNON.Body( {mass:0, material:groundMaterial} );
    leftWall.addShape( new CANNON.Plane() );
    leftWall.position.x = -100;
    leftWall.quaternion.setFromEuler(0,Math.PI/2,0,'XYZ');
    world.addBody( leftWall );
 
    const rightWall = new CANNON.Body( {mass:0, material:groundMaterial} );
    rightWall.addShape( new CANNON.Plane() );
    rightWall.position.x = 100;
    rightWall.quaternion.setFromEuler(0,-Math.PI/2,0,'XYZ');
    world.addBody( rightWall );


    //dibujar monedas aleatoriamente

    for (let i = 0; i < 10; i++) {
        moneda = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.5, 8, 1), phongMaterial)
        moneda.receiveShadow = true
        moneda.castShadow = true
        monedas.push(moneda)
        moneda.position.x = Math.random() * 100 - 50
        moneda.position.y = 1 //0.5
        moneda.position.z = Math.random() * 100 - 50
        moneda.rotation.x = Math.PI / 2
        scene.add(moneda)
        //mundo fisico
        //const cilindroShape = new CANNON.Cylinder(1, 1, 1, 8)
        //const cilindroBody = new CANNON.Body({ mass: 0 })
        //cilindroBody.addShape(cilindroShape, new CANNON.Vec3())
        //cilindroBody.position.x = moneda.position.x
        //cilindroBody.position.y = moneda.position.y
        //cilindroBody.position.z = moneda.position.z
        //world.addBody(cilindroBody)
    }
    
    const carBodyGeometry = new THREE.BoxGeometry(1, 1, 2)
    carBodyMesh = new THREE.Mesh(carBodyGeometry, phongMaterial)
    carBodyMesh.position.y = 3
    carBodyMesh.castShadow = true
    scene.add(carBodyMesh)
    carBodyMesh.add(chaseCam)
    
    const carBodyShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 1))
    carBody = new CANNON.Body({ mass: 1 })
    carBody.addShape(carBodyShape)
    carBody.position.x = carBodyMesh.position.x
    carBody.position.y = carBodyMesh.position.y
    carBody.position.z = carBodyMesh.position.z
    world.addBody(carBody)
    
    //front left wheel
    const wheelLFGeometry = new THREE.CylinderGeometry(
        0.33,
        0.33,
        0.2
    )
    wheelLFGeometry.rotateZ(Math.PI / 2)
    wheelLFMesh = new THREE.Mesh(wheelLFGeometry, phongMaterial)
    wheelLFMesh.position.x = -1
    wheelLFMesh.position.y = 3
    wheelLFMesh.position.z = -1
    wheelLFMesh.castShadow = true
    scene.add(wheelLFMesh)
    const wheelLFShape = new CANNON.Sphere(0.33)
    wheelLFBody = new CANNON.Body({ mass: 1, material: wheelMaterial })
    wheelLFBody.addShape(wheelLFShape)
    wheelLFBody.position.x = wheelLFMesh.position.x
    wheelLFBody.position.y = wheelLFMesh.position.y
    wheelLFBody.position.z = wheelLFMesh.position.z
    world.addBody(wheelLFBody)
    
    //front right wheel
    const wheelRFGeometry = new THREE.CylinderGeometry(
        0.33,
        0.33,
        0.2
    )
    wheelRFGeometry.rotateZ(Math.PI / 2)
    wheelRFMesh = new THREE.Mesh(wheelRFGeometry, phongMaterial)
    wheelRFMesh.position.y = 3
    wheelRFMesh.position.x = 1
    wheelRFMesh.position.z = -1
    wheelRFMesh.castShadow = true
    scene.add(wheelRFMesh)
    const wheelRFShape = new CANNON.Sphere(0.33)
    wheelRFBody = new CANNON.Body({ mass: 1, material: wheelMaterial })
    wheelRFBody.addShape(wheelRFShape)
    wheelRFBody.position.x = wheelRFMesh.position.x
    wheelRFBody.position.y = wheelRFMesh.position.y
    wheelRFBody.position.z = wheelRFMesh.position.z
    world.addBody(wheelRFBody)
    
    //back left wheel
    const wheelLBGeometry = new THREE.CylinderGeometry(
        0.4,
        0.4,
        0.33
    )
    wheelLBGeometry.rotateZ(Math.PI / 2)
    wheelLBMesh = new THREE.Mesh(wheelLBGeometry, phongMaterial)
    wheelLBMesh.position.y = 3
    wheelLBMesh.position.x = -1
    wheelLBMesh.position.z = 1
    wheelLBMesh.castShadow = true
    scene.add(wheelLBMesh)
    const wheelLBShape = new CANNON.Sphere(0.4)
    wheelLBBody = new CANNON.Body({ mass: 1, material: wheelMaterial })
    wheelLBBody.addShape(wheelLBShape)
    wheelLBBody.position.x = wheelLBMesh.position.x
    wheelLBBody.position.y = wheelLBMesh.position.y
    wheelLBBody.position.z = wheelLBMesh.position.z
    world.addBody(wheelLBBody)
    
    //back right wheel
    const wheelRBGeometry = new THREE.CylinderGeometry(
        0.4,
        0.4,
        0.33
    )
    wheelRBGeometry.rotateZ(Math.PI / 2)
    wheelRBMesh = new THREE.Mesh(wheelRBGeometry, phongMaterial)
    wheelRBMesh.position.y = 3
    wheelRBMesh.position.x = 1
    wheelRBMesh.position.z = 1
    wheelRBMesh.castShadow = true
    scene.add(wheelRBMesh)
    const wheelRBShape = new CANNON.Sphere(0.4)
    wheelRBBody = new CANNON.Body({ mass: 1, material: wheelMaterial })
    wheelRBBody.addShape(wheelRBShape)
    wheelRBBody.position.x = wheelRBMesh.position.x
    wheelRBBody.position.y = wheelRBMesh.position.y
    wheelRBBody.position.z = wheelRBMesh.position.z
    world.addBody(wheelRBBody)
    
    const leftFrontAxis = new CANNON.Vec3(1, 0, 0)
    const rightFrontAxis = new CANNON.Vec3(1, 0, 0)
    const leftBackAxis = new CANNON.Vec3(1, 0, 0)
    const rightBackAxis = new CANNON.Vec3(1, 0, 0)
    
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
    
    //rear wheel drive
    constraintLB.enableMotor()
    constraintRB.enableMotor()


    var keyborad = new THREEx.KeyboardState(renderer.domElement);
        renderer.domElement.setAttribute("tabIndex", "0");
        renderer.domElement.focus();
    
        //añado los eventos que moveran al robot
        keyborad.domElement.addEventListener('keydown', function(event){
            if(keyborad.eventMatches(event, 'left') || keyborad.eventMatches(event, 'a') ){
                rightVelocity -= 0.1
            }
            if(keyborad.eventMatches(event, 'right')|| keyborad.eventMatches(event, 'd') ){
                rightVelocity += 0.1 
            }
            if(keyborad.eventMatches(event, 'up') || keyborad.eventMatches(event, 'w')  ){
                forwardVelocity += 1 
            }
            if(keyborad.eventMatches(event, 'down') || keyborad.eventMatches(event, 's') ){
                forwardVelocity -= 1 
            }
    })
    
    forwardVelocity = 0
    rightVelocity = 0
}


function animarMonedas() {

    
}

function animate() {
    requestAnimationFrame(animate)

    delta = Math.min(clock.getDelta(), 0.1)
    world.step(delta)
    
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
    
    //para todas las monedas
    //si el coche pasa por alguna de las monedas
    //borrar moneda de la pantalla(pintar todas menos esa)
    for (let i = 0; i < monedas.length; i++) {
        let x = monedas[i].position.x
        //let y = monedas[i].position.y
        let z = monedas[i].position.z
        let a = x - carBody.position.x
        //let b = y - carBody.position.y
        let c = z - carBody.position.z
        //normalizar la resta
        if(Math.sqrt(Math.pow(a,2)) < 0.5 && Math.sqrt(Math.pow(c,2)) < 0.5) {
                cuentaMonedas += 1
                monedas[i].visible = false        
        }
        
    }

    if (dificil == true) { scene.fog = new THREE.Fog( 0xffffff, 1000, 4000 ); }

    //drawScore()

    TWEEN.update()

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

    render()

}

function setupGUI()
{
	// Definicion de los controles

    effectController = {
        dificil: false,
        pelota: false,
        animacion: function (){
            animate();
        }
    };

	// Creacion interfaz
	const gui = new GUI();

	// Construccion del menu
    var h = gui.addFolder("Menu");

    h.add(effectController, "dificil").name("Dificultad").onChange(dificultad);
    //Control del cambio de color del mesh

}


function dificultad() {
    //añadir obstaculos
    dificil = true

    //for (let i = 0; i < 100; i++) {
      //  const jump = new THREE.Mesh(
        //    new THREE.CylinderGeometry(0, 1, 0.5, 5),
         //   phongMaterial
        //)
        //jump.position.x = Math.random() * 100 - 50
        //jump.position.y = 0.5
        //jump.position.z = Math.random() * 100 - 50
        //scene.add(jump)

        //const cylinderShape = new CANNON.Cylinder(0.01, 1, 0.5, 5)
        //const cylinderBody = new CANNON.Body({ mass: 0 })
        //cylinderBody.addShape(cylinderShape, new CANNON.Vec3())
        //cylinderBody.position.x = jump.position.x
        //cylinderBody.position.y = jump.position.y
        //cylinderBody.position.z = jump.position.z
        //world.addBody(cylinderBody)
    //}

        //scene.fog = new THREE.Fog( 0xffffff, 1000, 4000 );
    
    //construir muros pequeños juntos y una pelota en medio
    //parte visual
    //ground
    //-----------------
    const paredIzquierda = new THREE.Mesh(new THREE.PlaneGeometry(5, 8), phongMaterial)
    paredIzquierda.position.x = -7.5
    //paredIzquierda.position.x = -30
    paredIzquierda.receiveShadow = true
    paredIzquierda.castShadow = true
    paredIzquierda.rotation.y = Math.PI/2
    //-----------------------------------
    const paredDerecha = new THREE.Mesh(new THREE.PlaneGeometry(5, 8), phongMaterial)
    paredDerecha.position.x = 7.5
    //paredDerecha.position.x = -25
    paredDerecha.receiveShadow = true
    paredDerecha.castShadow = true
    paredDerecha.rotation.y = -Math.PI/2
    //-----------------------------------
    const paredDelantera = new THREE.Mesh(new THREE.PlaneGeometry(5, 8), phongMaterial)
    paredDelantera.position.z = 7.5
    //paredDelantera.position.x = -26.5
    paredDelantera.receiveShadow = true
    paredDelantera.castShadow = true
    //---------------------------------
    const paredTrasera = new THREE.Mesh(new THREE.PlaneGeometry(5, 8), phongMaterial)
    paredTrasera.position.z = -7.5
    //paredTrasera.position.x = -30
    paredTrasera.receiveShadow = true
    paredTrasera.castShadow = true
    
    var cubo = new THREE.Object3D()
    cubo.add(paredDelantera)
    cubo.add(paredDerecha)
    cubo.add(paredIzquierda)
    cubo.add(paredTrasera)
    cubo.position.x = 30
    cubo.position.z = 30
    scene.add(cubo)

    //parte fisica
    const groundMaterial = new CANNON.Material('groundMaterial')

    const backWall = new CANNON.Body( {mass:1, material:groundMaterial} );
    backWall.addShape( new CANNON.Plane(5,5) );
    //backWall.position.z = -30;
    backWall.position.x = paredTrasera.position.x
    backWall.position.y = paredTrasera.position.y
    backWall.position.z = paredTrasera.position.z +30
    world.addBody( backWall );
 
    const frontWall = new CANNON.Body( {mass:0, material:groundMaterial} );
    frontWall.addShape( new CANNON.Plane(5,5) );
    frontWall.quaternion.setFromEuler(0,Math.PI,0,'XYZ');
    //frontWall.position.z = 30;
    frontWall.position.x = paredDelantera.position.x
    frontWall.position.y = paredDelantera.position.y
    frontWall.position.z = paredDelantera.position.z +30
    world.addBody( frontWall );
 
    const leftWall = new CANNON.Body( {mass:0, material:groundMaterial} );
    leftWall.addShape( new CANNON.Plane(5,5) );
    //leftWall.position.x = -30;
    leftWall.quaternion.setFromEuler(0,Math.PI/2,0,'XYZ');
    leftWall.position.x = paredIzquierda.position.x+30
    leftWall.position.y = paredIzquierda.position.y
    leftWall.position.z = paredIzquierda.position.z
    world.addBody( leftWall );
 
    const rightWall = new CANNON.Body( {mass:0, material:groundMaterial} );
    rightWall.addShape( new CANNON.Plane(5,5) );
    //rightWall.position.x = 30;
    rightWall.quaternion.setFromEuler(0,-Math.PI/2,0,'XYZ');
    rightWall.position.x = paredDerecha.position.x+30
    rightWall.position.y = paredDerecha.position.y
    rightWall.position.z = paredDerecha.position.z
    world.addBody( rightWall );

    //Crear Pelota
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(2, 2, 2), new THREE.MeshPhongMaterial())

    mesh.position.x = Math.floor(Math.random() * 10) - 5
    mesh.position.z = Math.floor(Math.random() * 10) - 5
    mesh.position.y = 5
    mesh.castShadow = true
    scene.add(mesh)

    const shape = new CANNON.Sphere(new CANNON.Vec3(1))
    const body = new CANNON.Sphere({ mass: 1 })
    body.addShape(shape)
    body.position.x = mesh.position.x
    body.position.y = mesh.position.y
    body.position.z = mesh.position.z

    world.addBody(body)
}

function render() {
    renderer.render(scene, camera)
}

init()
loadScene()
setupGUI()
animate()