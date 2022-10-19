/**
 * Practica 4
 */

 import * as THREE from "../lib/three.module.js";
 import {GLTFLoader} from "../lib/GLTFLoader.module.js";
 import {OrbitControls} from "../lib/OrbitControls.module.js";
 import {TWEEN} from "../lib/tween.module.min.js";
 import {GUI} from "../lib/lil-gui.module.min.js";
 
//variables estandar
var renderer, scene, camera, cameraControls, angulo, camaraPlanta, effectController;
const L = 103;
var objetoAntebrazo, objetoBrazo, cilindroMano, pinzaDe, pinzaIz;
var robot, base;
//Acciones
init();
loadScene();
setupGUI();
render();

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

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0xFFFFFF));
    renderer.autoClear = false;
    renderer.shadowMap.enabled = true;
    document.getElementById('container').appendChild(renderer.domElement);

    scene = new THREE.Scene();

    //CAMARA
    var aspectRatio = window.innerWidth/window.innerHeight;
    camera = new THREE.PerspectiveCamera(75,aspectRatio,0.1,1000);
    camera.position.set(90, 200, 350);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    //orbitcontrols
    cameraControls = new OrbitControls(camera,renderer.domElement);
    cameraControls.target.set(0,0,0);

    //otras camaras
    setCameras(aspectRatio);

    var ambiental = new THREE.AmbientLight(0x444444);
    scene.add(ambiental);

    var puntual = new THREE.PointLight('white', 0.3);
    puntual.position.y = 200;
    scene.add(puntual);

    var focal = new THREE.SpotLight('white', 0.5);
    focal.position.set(300, 600, -800);
    focal.target.position.set(0, 0, 0);
    focal.angle = Math.PI / 7;
    focal.penumbra = 0.2;

    focal.shadow.camera.near = 30;
    focal.shadow.camera.far = 1500;
    focal.shadow.camera.fov = 4000;
    focal.shadow.mapSize.width = 10000;
    focal.shadow.mapSize.height = 10000;

    scene.add(focal.target);
    focal.castShadow = true;
    scene.add(focal);
}

function loadScene() {
    //cargar todas las texturas
    var path = "images/";


    //material para la rotula
    var paredes = [path + "posx.jpg", path + "negx.jpg", path + "posy.jpg", path + "negy.jpg", path + "posz.jpg", path + "negz.jpg"];

    var mapaEntorno = new THREE.CubeTextureLoader().load(paredes);
    var materialRotula = new THREE.MeshPhongMaterial({ color: 'white', specular: 0x99BBFF, shininess: 50, envMap: mapaEntorno });
    //material para el robot
    var path = "images/";
    var texturaRobot = new THREE.TextureLoader().load(path + "metal_128.jpg");
   
    //var matSuelo = new THREE.MeshLambertMaterial({ color: 'white', map: texturaRobot });
    // Carga la escena
    robot = new THREE.Object3D();

    

    //Practica 2

    //Creo el nodo del grafo
    robot = new THREE.Object3D();
    var material = new THREE.MeshNormalMaterial({color:'yellow', wireframe: false, flatShading: false})
    //cilindro 
    var materialRobot = new THREE.MeshLambertMaterial({ color: 'white', wireframe: false, map: texturaRobot });
    base = new THREE.Mesh( new THREE.CylinderGeometry(50,50,15,32),materialRobot);
    base.position.set(0, 0, 0);

    //cilindro    
    var ejeBrazo = new THREE.Mesh(new THREE.CylinderGeometry(20,20,18,32),materialRobot);
    ejeBrazo.rotation.z = Math.PI/2;
    ejeBrazo.castShadow = true;
    ejeBrazo.receiveShadow = true;

    //esfera
    var rotula = new THREE.Mesh(new THREE.SphereGeometry(20,30,15),materialRotula);
    rotula.position.set(0,120,0);
    rotula.castShadow = true;
    rotula.receiveShadow = true;

    //Esparrago
    var esparrago = new THREE.Mesh(new THREE.BoxGeometry(18,120,12),materialRobot);
    esparrago.position.set(0,60,0);
    esparrago.castShadow = true;
    esparrago.receiveShadow = true;

    //cilindro
    var texturaMadera = new THREE.TextureLoader().load(path + "wood512.jpg");
    var matCilinAntebrazo = new THREE.MeshPhongMaterial({color: 'white', specular: 0x99BBFF, shininess: 70, map: texturaMadera });

    const cilindroAntebrazo = new THREE.Mesh(new THREE.CylinderGeometry(22,22,6,32),matCilinAntebrazo);

    var cargarTextura = new THREE.TextureLoader().load(path + "pisometalico_1024.jpg");
    var materialSuelo = new THREE.MeshLambertMaterial({ color: 'white', map: cargarTextura });
    var suelo = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 50, 50),materialSuelo);
    suelo.rotation.x = -Math.PI / 2;


    //Nervios cada uno en una posicion del espacio
    //Nervio 1
    var matNervios = new THREE.MeshLambertMaterial({color: 'white', map: texturaMadera });

    const nervio1 = new THREE.Mesh(new THREE.BoxGeometry(4,80,4),matNervios);
    nervio1.receiveShadow = true;
    nervio1.castShadow = true;
    nervio1.position.set(8, 34, -4);
    //Nervio 2
    const nervio2 = new THREE.Mesh(new THREE.BoxGeometry(4,80,4),matNervios);
    nervio2.position.set(-8,34,4);
    nervio2.receiveShadow = true;
    nervio2.castShadow = true;
    //Nervio 3
    const nervio3 = new THREE.Mesh(new THREE.BoxGeometry(4,80,4),matNervios);
    nervio3.position.set(-8,34,-4);
    nervio3.receiveShadow = true;
    nervio3.castShadow = true;
    //Nervio 4
    const nervio4 = new THREE.Mesh(new THREE.BoxGeometry(4,80,4),matNervios);
    nervio4.position.set(8,34,4);
    nervio4.receiveShadow = true;
    nervio4.castShadow = true;
    //cilindro
    cilindroMano = new THREE.Mesh(new THREE.CylinderGeometry(15,15,40),matCilinAntebrazo);
    cilindroMano.position.set(0,80,0);
    cilindroMano.rotation.z = Math.PI/2;
    cilindroMano.receiveShadow = true;
    cilindroMano.castShadow = true;
    
    //Creacion de la mano
    var pinza = new THREE.BufferGeometry();
    
    const vertex = [
        0, -8, -10,
        19, -8, -10,
        0, -8, 10,
        19, -8, 10,
        0, -12, -10,
        19, -12, -10,
        0, -12, 10,
        19, -12, 10,
        38, -8, -5,
        38, -12, -5,
        38, -8, 5,
        38, -12, 5
    ];
    
    const indices = [
        0, 3, 2,
        0, 1, 3,
        1, 7, 3,
        1, 5, 7,
        5, 6, 7,
        5, 4, 6,
        4, 2, 6,
        4, 0, 2,
        2, 7, 6,
        2, 3, 7,
        4, 1, 0,
        4, 5, 1,
        1, 10, 3,
        1, 8, 10,
        8, 11, 10,
        8, 9, 11,
        9, 7, 11,
        9, 5, 7,
        3, 11, 7,
        3, 10, 11,
        5, 8, 1,
        5, 9, 8
    ];

    pinza.setIndex(indices);
    pinza.setAttribute('position', new THREE.Float32BufferAttribute(vertex,3));

    pinzaIz = new THREE.Mesh(pinza, material);
    pinzaIz.rotation.y = Math.PI / 2;  
    pinzaIz.receiveShadow = true;
    pinzaIz.castShadow = true;

    pinzaDe = new THREE.Mesh(pinza, material);
    pinzaDe.rotation.y = Math.PI / 2;
    pinzaDe.position.set(0, 20, 0);
    pinzaDe.receiveShadow = true;
    pinzaDe.castShadow = true;
    //MANO
    cilindroMano.add(pinzaIz);
    cilindroMano.add(pinzaDe);

    //ANTEBRAZO
    objetoAntebrazo = new THREE.Object3D();
    objetoAntebrazo.add(cilindroAntebrazo);
    objetoAntebrazo.add(cilindroMano);
    objetoAntebrazo.add(nervio1);
    objetoAntebrazo.add(nervio2);
    objetoAntebrazo.add(nervio3);
    objetoAntebrazo.add(nervio4);
    //subo ese cilindro
    objetoAntebrazo.position.set(0,120,0);
   
    //BRAZO
    objetoBrazo = new THREE.Object3D();
    objetoBrazo.add(ejeBrazo);
    objetoBrazo.add(rotula);
    objetoBrazo.add(esparrago);
    objetoBrazo.add(objetoAntebrazo);

    //GRAFO DE ESCENA
    robot.add(base)
    base.add(objetoBrazo)
    scene.add(robot)
    scene.add(suelo)
    scene.add(new THREE.AxesHelper(1000));

    var keyborad = new THREEx.KeyboardState(renderer.domElement);
    renderer.domElement.setAttribute("tabIndex", "0");
    renderer.domElement.focus();

    //añado los eventos que moveran al robot
    keyborad.domElement.addEventListener('keydown', function(event){
        if(keyborad.eventMatches(event, 'left')){
            robot.position.x -= 5; 
        }
        if(keyborad.eventMatches(event, 'right')){
            robot.position.x += 5; 
        }
        if(keyborad.eventMatches(event, 'up')){
            robot.position.z += 5; 
        }
        if(keyborad.eventMatches(event, 'down')){
            robot.position.z -= 5; 
        }
    })
}

function setupGUI()
{
	// Definicion de los controles

    effectController = {
        giroBase: 0.0,
		giroBrazo: 0.0,
		giroAntebrazoY: 0.0,
        giroAntebrazoZ: 0,
        giroPinza: 90.0,
        separacionPinza:0.0,
        animacion: function (){
            animate();
        },
        alambres: true,

    };
    //var params ={checkbox=false}; gui.add(params, checkbox').onChange(function (value) { model(); });
	// Creacion interfaz
	const gui = new GUI();

	// Construccion del menu
    var h = gui.addFolder("Control robot");
	h.add(effectController, "giroBase", -180.0, 180.0, 0.025).name("Giro Base");
    h.add(effectController, "giroBrazo", -45.0, 45.0, 0.025).name("Giro Brazo");
    h.add(effectController, "giroAntebrazoY", -180.0, 180.0, 0.2).name("Giro Antebrazo Y");
    h.add(effectController, "giroAntebrazoZ", -90.0, 90.0, 0.025).name("Giro Antebrazo Z");
    h.add(effectController, "giroPinza", -40.0, 220.0, 0.025).name("Giro Pinza");
    h.add(effectController, "separacionPinza", 0.0, 15.0, 0.025).name("Separación Pinza");

    h.add(effectController, "animacion").name("Animacion").onChange(animate);

    //Control del cambio de color del mesh
    var sensorClick = h.add(effectController, "alambres").name("Alambres");
    sensorClick.onChange(
        function(click) {
            robot.traverse(function(hijo) {
                if (hijo instanceof THREE.Mesh)
                    if (click){
                        hijo.material.wireframe = false;
                    } else {
                        hijo.material.wireframe = true;
                    } 
            });
        });

}

function updateAspectRatio() {
    //cambia las dimensiones del canvas
    renderer.setSize(window.innerWidth, window.innerHeight);

    //Nuevo relacion aspecto de la camara
    var ar = window.innerWidth/window.innerHeight;

    //perspectiva
    camera.aspect = ar;
    camera.updateProjectionMatrix();

    //ortografica
    camaraPlanta.left = -L;
    camaraPlanta.right = L;
    camaraPlanta.bottom = -L;
    camaraPlanta.top = L;

    camaraPlanta.updateProjectionMatrix();
}

function giroBase() {
    // Se obtiene el valor pasado por el GUI
    var grados = effectController.giroBase;
    robot.rotation.y = grados * Math.PI / 180; //En radianes
}
//posible cambio de la z a la x
function giroBrazo() {
    // Se obtiene el valor pasado por el GUI
    var grados = effectController.giroBrazo;
    //objetoBrazo.rotation.z = grados * Math.PI / 180; //En radianes
    objetoBrazo.rotation.x = -(grados * Math.PI / 180);
}

function giroAntebrazoY() {
    // Se obtiene el valor pasado por el GUI
    var grados = effectController.giroAntebrazoY;
    objetoAntebrazo.rotation.y = grados * Math.PI / 180;
}

//posible cambio de la z a la x
function giroAntebrazoZ() {
    // Se obtiene el valor pasado por el GUI
    var grados = effectController.giroAntebrazoZ;
    objetoAntebrazo.rotation.z = grados * Math.PI / 180;
}

function giroPinza() {
    // Se obtiene el valor pasado por el GUI
    var grados = effectController.giroPinza;
    cilindroMano.rotation.z = grados * Math.PI / 180;
}

function separacionPinza() {
    // Se obtiene el valor pasado por el GUI
    var grados = effectController.separacionPinza;
    pinzaDe.position.y = grados;
    pinzaIz.position.y = -grados + 20
}


function animate(){
    console.log("entrooo")
    new TWEEN.Tween(pinzaIz.position).
        to( {x: [0, 0], y:[0, 10], z:[0,0]}, 5000).
        interpolation( TWEEN.Interpolation.Linear).
        easing( TWEEN.Easing.Exponential.InOut).
        start();
    console.log("llego1")
    new TWEEN.Tween(pinzaDe.position).
        to( {x: [0, 0], y:[0, -10], z:[0,0]}, 5000).
        interpolation( TWEEN.Interpolation.Linear). 
        easing( TWEEN.Easing.Exponential.InOut).
        start();
    console.log("llego2")
    new TWEEN.Tween(cilindroMano.rotation).
        to( {x: [-Math.PI,0], y:[0,0], z:[Math.PI/2,Math.PI/2]}, 5000).
        interpolation( TWEEN.Interpolation.Bezier). 
        easing( TWEEN.Easing.Bounce.Out).
        start();
    console.log("llego3")
    new TWEEN.Tween(objetoAntebrazo.rotation).
        to( {x: [0,0], y:[-Math.PI,0], z:[Math.PI/2,0]}, 5000).
        interpolation( TWEEN.Interpolation.Linear). 
        easing( TWEEN.Easing.Bounce.In).
        start();
    console.log("llego4")
    new TWEEN.Tween(objetoBrazo.rotation).
        to( {x: [Math.PI/4,0], y:[0,0], z:[0,0]}, 5000).
        interpolation( TWEEN.Interpolation.Linear). 
        easing( TWEEN.Easing.Bounce.In).
        start();
    console.log("llego5")
    new TWEEN.Tween(base.rotation).
        to( {x: [0,0], y:[-Math.PI/2,0], z:[0,0]}, 4000).
        interpolation( TWEEN.Interpolation.Linear). 
        easing( TWEEN.Easing.Elastic.In).
        start();
        console.log("salgo")
}

function update() {

    giroBase();
    giroBrazo();
    giroAntebrazoY();
    giroAntebrazoZ();
    giroPinza();
    separacionPinza();
    TWEEN.update();

}

function render() {
    requestAnimationFrame(render);
    renderer.domElement.setAttribute("tabIndex", "0");
    renderer.domElement.focus();
    update();
    //Borrar una unica vez
    renderer.domElement.focus();
    renderer.clear();
    renderer.setViewport(0,0,window.innerWidth, window.innerHeight);
    renderer.render(scene,camera);

    renderer.setViewport(0,window.innerHeight - window.innerHeight/4, Math.min(window.innerWidth, window.innerHeight)/4, Math.min(window.innerWidth, window.innerHeight)/4);
    renderer.render(scene,camaraPlanta);
}