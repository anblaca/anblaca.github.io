import * as THREE from "../lib/three.module.js";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";
import {TWEEN} from "../lib/tween.module.min.js";
import {GUI} from "../lib/lil-gui.module.min.js";
import * as CANNON from '../lib/cannon-es.js'; 
import { FontLoader } from 'https://threejs.org/examples/jsm/loaders/FontLoader.js';	
import { TextGeometry } from 'https://threejs.org/examples/jsm/geometries/TextGeometry.js';

var renderer, scene, camera, carBodyMesh, wheelLFMesh, wheelRFMesh, wheelLBMesh,wheelRBMesh, forwardVelocity, rightVelocity ;

var constraintLB,constraintRB,constraintLF,constraintRF,world, chaseCamPivot

var carBody, wheelLFBody, wheelRFBody, wheelLBBody, wheelRBBody, chaseCam, moneda, loader, effectController
var ctx, phongMaterial, sphereMesh,sphereBody, texstone,texball, texwall

var  traseroWall, delanteroWall, izquieroWall, derechaWall
var paredDelantera, paredDerecha, paredIzquierda, paredTrasera
var cuentaMonedas = 0
const timestep = 1/60
var camaraPlanta

const monedas = []
const cylyndersBody = []
const L = 103;

var dificil = false

const v = new THREE.Vector3()
const groundMaterial = new CANNON.Material("groundMaterial");
const materialEsfera = new CANNON.Material("sphereMaterial");

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
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    document.body.appendChild(renderer.domElement)
    
    //const canvas = document.createElement( "canvas" );
    //canvas.width = 1024;
    //canvas.height = 1024;

    //setCameras(window.innerWidth / window.innerHeight);

    
    //canvas = document.getElementById("canvas");
    //ctx = canvas.getContext("2d");

    //drawScore()

    window.addEventListener('resize', onWindowResize, false)


}

function onWindowResize() {
    
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    //ortografica
    //camaraPlanta.left = -L;
    //camaraPlanta.right = L;
    //camaraPlanta.bottom = -L;
    //camaraPlanta.top = L;

    //camaraPlanta.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()

    
}

function setCameras(ar) {
    //configurar planta alsado, perfil y perspectiva 
    var camaraOrtografica
    camaraOrtografica = new THREE.OrthographicCamera(-L, L, L, -L, -100, 100);
    camaraOrtografica.lookAt(new THREE.Vector3(0, 0, 0));

    camaraPlanta = camaraOrtografica.clone()
    camaraPlanta.position.set(0, L, 0);
    camaraPlanta.lookAt(new THREE.Vector3(0, 0, 0));
    camaraPlanta.up = new THREE.Vector3(0, 0, -1);
    scene.add(camaraPlanta)
}

function drawScore() {
    
    //texto inicial
    var canvas1 = document.createElement('canvas');
    var context1 = canvas1.getContext('2d');
    context1.font = "Bold 10px Arial";
    context1.fillStyle = "rgba(255,0,0,1)";
    context1.fillText('Score:' + cuentaMonedas, 0, 60);

    // canvas contents will be used for a texture
    var texture1 = new THREE.Texture(canvas1)
    texture1.needsUpdate = true;

    var material1 = new THREE.MeshBasicMaterial({ map: texture1, side: THREE.DoubleSide });
    material1.transparent = true;

    var mesh1 = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 10),
        material1
      );
    
    mesh1.position.set(0, 0, 0);
    //mesh1.rotation.x = -0.9;

    //var texto = new THREE.Shape.add(mesh1);
    // Note that mesh1 gets added to the shape and not to the scene

   scene.add(mesh1)
}

function loadScene() {

    // Materiales 
    const path ="./images/";
    const texcoin = new THREE.TextureLoader().load(path+"metal.jpg");
    const texsuelo = new THREE.TextureLoader().load(path+"grassGround.jpg");
    texsuelo.repeat.set(4,3);
    texsuelo.wrapS= texsuelo.wrapT = THREE.RepeatWrapping;

    texstone = new THREE.TextureLoader().load(path+"stone.jpg");
    texball = new THREE.TextureLoader().load(path+"ball.jpg");
    texwall = new THREE.TextureLoader().load(path+"muro.jpg");
    //texwall.repeat.set(4,3);
    //texwall.wrapS= texsuelo.wrapT = THREE.RepeatWrapping;
    // Habitacion
    const paredes = [];
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"posx.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"negx.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"posy.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"negy.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"posz.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"negz.jpg")}) );
    const habitacion = new THREE.Mesh( new THREE.BoxGeometry(100,100,100),paredes);
    scene.add(habitacion);

    scene.fog = new THREE.Fog( 0xffffff, 10, 25 );
    //const entorno = [ path+"posx.jpg", path+"negx.jpg",
        //               path+"posy.jpg", path+"negy.jpg",
      //                 path+"posz.jpg", path+"negz.jpg"];

    //const texesfera = new THREE.CubeTextureLoader().load(entorno);
 

    //const matesfera = new THREE.MeshPhongMaterial({color:'white',
      //                                              specular:'gray',
        //                                            shininess: 30,
          //                                          envMap: texesfera });

    const matsuelo = new THREE.MeshStandardMaterial({color:"rgb(150,150,150)",map:texsuelo});


    phongMaterial = new THREE.MeshPhongMaterial()

    world = new CANNON.World()
    world.gravity.set(0, -9.82, 0)
    
    //groundMaterial = new CANNON.Material('groundMaterial')
    groundMaterial.friction = 0.25
    groundMaterial.restitution = 0.25
    
    const wheelMaterial = new CANNON.Material('wheelMaterial')
    wheelMaterial.friction = 0.25
    wheelMaterial.restitution = 0.25
    
    //ground
    const sueloMesh = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 1, 1), matsuelo)
    sueloMesh.rotation.x = -Math.PI / 2
    sueloMesh.position.y = -0.25
    sueloMesh.receiveShadow = true
    scene.add(sueloMesh)

    const sueloShape = new CANNON.Plane()
    const sueloBody = new CANNON.Body({ mass: 0, material: groundMaterial })
    sueloBody.addShape(sueloShape)
    sueloBody.position.y = -0.25;
    sueloBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    //sueloBody.position.set(0, -1, 0)
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

    drawScore()

    const sphereGroundContactMaterial = new CANNON.ContactMaterial(groundMaterial,materialEsfera,
        { friction: 0.7, 
            restitution: 0.7 });
        world.addContactMaterial(sphereGroundContactMaterial);
    

    // Paredes
    const backWall = new CANNON.Body( {mass:0, material:groundMaterial} );
    backWall.addShape( new CANNON.Plane() );
    backWall.position.z = -50;
    world.addBody( backWall );
 
    const frontWall = new CANNON.Body( {mass:0, material:groundMaterial} );
    frontWall.addShape( new CANNON.Plane() );
    frontWall.quaternion.setFromEuler(0,Math.PI,0,'XYZ');
    frontWall.position.z = 50;
    world.addBody( frontWall );
 
    const leftWall = new CANNON.Body( {mass:0, material:groundMaterial} );
    leftWall.addShape( new CANNON.Plane() );
    leftWall.position.x = -50;
    leftWall.quaternion.setFromEuler(0,Math.PI/2,0,'XYZ');
    world.addBody( leftWall );
 
    const rightWall = new CANNON.Body( {mass:0, material:groundMaterial} );
    rightWall.addShape( new CANNON.Plane() );
    rightWall.position.x = 50;
    rightWall.quaternion.setFromEuler(0,-Math.PI/2,0,'XYZ');
    world.addBody( rightWall );


    //dibujar monedas aleatoriamente
    const matCoin = new THREE.MeshPhongMaterial({color:"rgb(150,150,150)",map:texcoin, specular:'gray',
    shininess: 30});

    for (let i = 0; i < 10; i++) {
        moneda = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.5, 8, 1), matCoin)
        moneda.receiveShadow = true
        moneda.castShadow = true
        monedas.push(moneda)
        moneda.position.x = Math.random() * 100 - 50
        moneda.position.y = 1 //0.5
        moneda.position.z = Math.random() * 100 - 50
        moneda.rotation.x = Math.PI / 2
        scene.add(moneda)
        const giro = new TWEEN.Tween( moneda.rotation ).to( {x:0, y:Math.PI/2, z:0}, 3000 );
        giro.repeat(Infinity);
        giro.start();
    }


    const carBodyGeometry = new THREE.BoxGeometry(1, 1, 2)
    carBodyMesh = new THREE.Mesh(carBodyGeometry, phongMaterial)
    carBodyMesh.position.y = 3
    carBodyMesh.castShadow = true
    scene.add(carBodyMesh)
    carBodyMesh.add(chaseCam)
    
    const carBodyShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 1))
    carBody = new CANNON.Body({ mass: 1, material: groundMaterial })
    carBody.addShape(carBodyShape)
    carBody.position.x = carBodyMesh.position.x
    carBody.position.y = carBodyMesh.position.y
    carBody.position.z = carBodyMesh.position.z
    world.addBody(carBody)
    
    //front left wheel
    const wheelLFGeometry = new THREE.CylinderGeometry(0.33,0.33,0.2) 
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
    const wheelRFGeometry = new THREE.CylinderGeometry(0.33,0.33,0.2)
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
    const wheelLBGeometry = new THREE.CylinderGeometry(0.4,0.4,0.33)
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
    const wheelRBGeometry = new THREE.CylinderGeometry(0.4,0.4,0.33)

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


function animate() {
    requestAnimationFrame(animate)

    //delta = Math.min(clock.getDelta(), 0.1)
    //world.step(delta)
    world.step(timestep)
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
        if(Math.sqrt(Math.pow(a,2)) < 0.7 && Math.sqrt(Math.pow(c,2)) < 0.7) {
                cuentaMonedas += 1
                monedas[i].visible = false        
        }
        
    }

    

    drawScore()
    
    if (dificil == true) { 

        //MOVER LA PELOTA
        sphereMesh.position.y = sphereBody.position.y
        sphereMesh.position.z = sphereBody.position.z
        sphereMesh.position.x = sphereBody.position.x

        // MOVER LAS PAREDES
        //paredTrasera.position.x = traseroWall.position.x
        //paredTrasera.position.y = traseroWall.position.y
        //paredTrasera.position.z = traseroWall.position.z

        //paredDelantera.position.x = delanteroWall.position.x
        //paredDelantera.position.y = delanteroWall.position.y
        //paredDelantera.position.z = delanteroWall.position.z

        //paredDerecha.position.x = derechaWall.position.x
        //paredDerecha.position.y = derechaWall.position.y
        //paredDerecha.position.z = derechaWall.position.z

        //paredIzquierda.position.x = izquieroWall.position.x 
        //paredIzquierda.position.x = izquieroWall.position.y
        //paredIzquierda.position.x = izquieroWall.position.z 
    }
    
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
        boton: false,
    };

	// Creacion interfaz
	const gui = new GUI();

	// Construccion del menu
    var h = gui.addFolder("Menu");

    //h.add(effectController, "dificil").name("Dificultad").onChange(dificultad);
    //Control del cambio de color del mesh

    h.add(effectController, "boton").name("Dificil").onChange(
        function(click) {
                    if (click && dificil == false){
                        dificil = true;
                        console.log("dificil")
                        dificultad()
                    } else {
                        console.log("easy")
                        dificil = false
                        dificultad()
                    } 
    
        });
}


function dificultad() {
    //añadir obstaculos
    const matStone = new THREE.MeshStandardMaterial({color:"rgb(150,150,150)",map:texstone});

    if(dificil) {

    scene.fog = new THREE.Fog( 0xffffff, 10, 25 );

    for (let i = 0; i < 100; i++) {
        const jump = new THREE.Mesh(new THREE.CylinderGeometry(0, 1, 0.5, 5), matStone)
        jump.position.x = Math.random() * 100 - 50
        jump.position.y = 0.25
        jump.position.z = Math.random() * 100 - 50
        jump.name = "jump"
        scene.add(jump)

        const cylinderShape = new CANNON.Cylinder(0.01, 1, 0.5, 5)
        const cylinderBody = new CANNON.Body({ mass: 0 })
        cylinderBody.addShape(cylinderShape, new CANNON.Vec3())
        cylinderBody.position.x = jump.position.x
        cylinderBody.position.y = jump.position.y
        cylinderBody.position.z = jump.position.z
        cylyndersBody.push(cylinderBody)
        world.addBody(cylinderBody)
    }

    //scene.fog = new THREE.Fog( 0xffffff, 1000, 4000 );
    var rojo = new THREE.MeshBasicMaterial({ color: 'red', wireframe: true });
    var azul = new THREE.MeshBasicMaterial({ color: 'blue', wireframe: true });
    var amarillo = new THREE.MeshBasicMaterial({ color: 'yellow', wireframe: true });
    var negro = new THREE.MeshBasicMaterial({ color: 'black', wireframe: true });

    //construir muros pequeños juntos y una pelota en medio
    //parte visual
    //ground
    const matsuelo = new THREE.MeshStandardMaterial({color:"rgb(150,150,150)",map:texwall});
    //-----------------
    paredIzquierda = new THREE.Mesh(new THREE.BoxGeometry(5, 2, 1), matsuelo)
    paredIzquierda.position.x = -7.5
    //paredIzquierda.position.x = -30
    paredIzquierda.receiveShadow = true
    paredIzquierda.castShadow = true
    paredIzquierda.rotation.y = Math.PI/2
    paredIzquierda.name = "paredIzquierda"
    //-----------------------------------
    paredDerecha = new THREE.Mesh(new THREE.BoxGeometry(5, 2, 1), matsuelo)
    paredDerecha.position.x = 7.5
    //paredDerecha.position.x = -25
    paredDerecha.receiveShadow = true
    paredDerecha.castShadow = true
    paredDerecha.rotation.y = -Math.PI/2
    paredDerecha.name = "paredDerecha"
    //-----------------------------------
    paredDelantera = new THREE.Mesh(new THREE.BoxGeometry(5, 2, 1), matsuelo)
    paredDelantera.position.z = 7.5
    //paredDelantera.position.x = -26.5
    paredDelantera.receiveShadow = true
    paredDelantera.castShadow = true
    paredDelantera.name = "paredDelantera"
    //---------------------------------
    paredTrasera = new THREE.Mesh(new THREE.BoxGeometry(5, 2, 1), matsuelo)
    paredTrasera.position.z = -7.5
    //paredTrasera.position.x = -30
    paredTrasera.receiveShadow = true
    paredTrasera.castShadow = true
    paredTrasera.name = "paredTrasera"

    var cubo = new THREE.Object3D()
    cubo.name = "cubo"
    cubo.add(paredDelantera)
    cubo.add(paredDerecha)
    cubo.add(paredIzquierda)
    cubo.add(paredTrasera)
    cubo.position.x = 30
    //cubo.position.z = 30
    scene.add(cubo)

    //parte fisica

    traseroWall = new CANNON.Body( {mass:0, material:groundMaterial} );
    traseroWall.addShape( new CANNON.Box(new CANNON.Vec3(2.5,1,0.5)) );
    traseroWall.position.x = paredTrasera.position.x+30
    traseroWall.position.y = paredTrasera.position.y
    traseroWall.position.z = paredTrasera.position.z 
    world.addBody( traseroWall );
 
    delanteroWall = new CANNON.Body( {mass:0, material:groundMaterial} );
    delanteroWall.addShape( new CANNON.Box(new CANNON.Vec3(2.5,1,0.5)) );
    delanteroWall.position.x = paredDelantera.position.x+30
    delanteroWall.position.y = paredDelantera.position.y
    delanteroWall.position.z = paredDelantera.position.z
    delanteroWall.name = "delanteroWall"
    world.addBody( delanteroWall );
 
    izquieroWall = new CANNON.Body( {mass:0, material:groundMaterial} );
    izquieroWall.addShape( new CANNON.Box(new CANNON.Vec3(2.5,1,0.5)) );
    izquieroWall.position.x = paredIzquierda.position.x+30
    izquieroWall.position.y = paredIzquierda.position.y
    izquieroWall.position.z = paredIzquierda.position.z
    world.addBody( izquieroWall );
 
    derechaWall = new CANNON.Body( {mass:0, material:groundMaterial} );
    derechaWall.addShape( new CANNON.Box(new CANNON.Vec3(2.5,1,0.5)) );

    derechaWall.position.x = paredDerecha.position.x+30
    derechaWall.position.y = paredDerecha.position.y
    derechaWall.position.z = paredDerecha.position.z
    world.addBody( derechaWall );

    //añadir una pelota
    const matball = new THREE.MeshStandardMaterial({color:"rgb(150,150,150)",map:texball})
    const sphereGeometry = new THREE.SphereGeometry(0.5, 8, 8)
    sphereMesh = new THREE.Mesh(sphereGeometry, rojo)
    sphereMesh.position.x = 0
    sphereMesh.position.y = 0.25
    sphereMesh.name = "bola"
    //sphereMesh.position.z = Math.random() * 10 - 5
    sphereMesh.castShadow = true
    sphereMesh.receiveShadow = true
    scene.add(sphereMesh)

    const sphereShape = new CANNON.Sphere(0.5)
    sphereBody = new CANNON.Body({ mass: 1, material: materialEsfera})
    sphereBody.addShape(sphereShape)

    sphereBody.position.y = sphereMesh.position.y
    //sphereBody.position.z = sphereMesh.position.z
    world.addBody(sphereBody)
    } else {

        console.log("entro a borrar")
        for( var i = scene.children.length - 1; i >= 0; i--) { 
            var obj = scene.children[i];
            if(obj.name == "cubo" || obj.name == "jump" || obj.name == "bola") {
                scene.remove(obj);  
            }    
       }

       for (var i = 0; i < cylyndersBody.length; i++) {
            world.removeBody(cylyndersBody[i])
       }
       cylyndersBody
       world.removeBody(izquieroWall)
       world.removeBody(derechaWall)
       world.removeBody(traseroWall)
       world.removeBody(delanteroWall)
       world.removeBody(sphereBody)
       scene.fog = null
    }
}

function calcularVictoria() {


    if (cuentaMonedas == 10 &&  dificil == false) {
        console.log("Victoria!")
    
    }

    //if (cuentaMonedas == 10 && dificil == true && )
}

function render() {
    renderer.render(scene, camera)

    
}

init()
loadScene()
setupGUI()
animate()