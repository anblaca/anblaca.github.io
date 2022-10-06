/**
 * Practica 3
 */

//Modulos necesarios
//import * as THREE from "..lib/three.module.js";
//import {GLTFLoader} from "..lib/GLTFLoader.module.js";
//import {OrbitControls}  from "..lib/OrbitControls.module.js";

//variables estandar
var renderer, scene, camera, cameraControls, angulo, camaraPlanta;
angulo = 0;
const L = 110;

//Acciones
init();
loadScene();
render();

function setCameras(ar) {
    /*
    let camaraOrto;
    //construir camara ortografica
    if(ar>1) {
        camaraOrto = new THREE.OrtographicCamera(-L*ar,L*ar,L,-L,-10,100);
    } else {
        camaraOrto = new THREE.OrtographicCamera(-L,L,L/ar,-L/ar,-10,100);
    }
*/
     //configurar planta alsado, perfil y perspectiva 
     var camaraOrtografica
     camaraOrtografica = new THREE.OrthographicCamera(-L, L, L, -L, -1, 800);
     camaraOrtografica.lookAt(new THREE.Vector3(0, 0, 0));
 
     camaraPlanta = camaraOrtografica.clone()
     camaraPlanta.position.set(0, L, 0);
     camaraPlanta.up = new THREE.Vector3(0, 0, -1)
     camaraPlanta.lookAt(new THREE.Vector3(0, 0, 0))
     
     //scene.add(camera)
     //scene.add(camaraPlanta)

}

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0x0000AA),1.0);
    document.body.appendChild(renderer.domElement);
    scene = new THREE.Scene()

    var ar = window.innerWidth/window.innerHeight;
    camera = new THREE.PerspectiveCamera(75,ar,0.1,1000);
    camera.position.set(90, 200, 350);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    //orbitcontrols
    cameraControls = new THREE.OrbitControls(camera,renderer.domElement);
    cameraControls.target.set(0,0,0);

    //otras camaras
    setCameras(ar);
    //captura de eventos
    window.addEventListener('resize', updateAspectRatio);
    //renderer.domElement.addEventListener('dblclick',rotateShape);
}

function loadScene() {

    //Practica 2

    //Creo el nodo del grafo
    robot = new THREE.Object3D();
    //todo el robot tendra el siguiente material
    var material = new THREE.MeshBasicMaterial({ color: 'red', wireframe: true });
    //cilindro 
    var  base = new THREE.Mesh( new THREE.CylinderGeometry(50,50,15,32),material);
    base.position.set(0, 0, 0);
    //cilindro    
    var ejeBrazo = new THREE.Mesh(new THREE.CylinderGeometry(20,20,18,32),material);
    ejeBrazo.rotation.z = Math.PI/2;
    //esfera
    var rotula = new THREE.Mesh(new THREE.SphereGeometry(20,30,15),material);
    rotula.position.set(0,120,0);
    //Esparrago
    var esparrago = new THREE.Mesh(new THREE.BoxGeometry(18,120,12),material);
    esparrago.position.set(0,60,0);

    //cilindro
    var cilindroAntebrazo = new THREE.Mesh(new THREE.CylinderGeometry(22,22,6,32),material);

    var suelo = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 50, 50),material);
    suelo.rotation.x = -Math.PI / 2;

    //cilindro
    var cilindroMano = new THREE.Mesh(new THREE.CylinderGeometry(15,15,40),material);
    cilindroMano.position.set(0,80,0);
    cilindroMano.rotation.z = Math.PI/2;
    //Nervios cada uno en una posicion del espacio
    //Nervio 1
    var nervio1 = new THREE.Mesh(new THREE.BoxGeometry(4,80,4),material);
    nervio1.position.set(8, 34, -4);
    //Nervio 2
    var nervio2 = new THREE.Mesh(new THREE.BoxGeometry(4,80,4),material);
    nervio2.position.set(-8,34,4);
    //Nervio 3
    var nervio3 = new THREE.Mesh(new THREE.BoxGeometry(4,80,4),material);
    nervio3.position.set(-8,34,-4);
    //Nervio 4
    var nervio4 = new THREE.Mesh(new THREE.BoxGeometry(4,80,4),material);
    nervio4.position.set(8,34,4);
    
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
    
    indices = [
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

    var pinzaIz = new THREE.Mesh(pinza, material);
    pinzaIz.rotation.y = Math.PI / 2;  

    var pinzaDe = new THREE.Mesh(pinza, material);
    pinzaDe.rotation.y = Math.PI / 2;
    pinzaDe.position.set(0, 20, 0);

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
    
}

function updateAspectRatio() {
    //cambia las dimensiones del canvas
    renderer.setSize(window.innerWidth, window.innerHeight);

    //Nuevo relacion aspecto de la camara
    const ar = window.innerWidth/window.innerHeight;

    //perspectiva
    camera.aspect = ar;
    camera.updateProjectionMatrix();

    //ortografica
    if (ar > 1) {
        camaraPlanta.left = -L;
        camaraPlanta.right = L;
        camaraPlanta.top = L;
        camaraPlanta.bottom = -L;
    } else {
        camaraPlanta.left = -L;
        camaraPlanta.right = L;
        camaraPlanta.top = L;
        camaraPlanta.bottom = -L
    }

    camaraPlanta.updateProjectionMatrix();
}
function update() {
    angulo += 0.01;
}

function render() {
    requestAnimationFrame(render);
    //update();
    renderer.clear();
    renderer.setViewport(0,0,window.innerWidth, window.innerHeight);
    renderer.render(scene,camera);

    renderer.setViewport(0,0,Math.min(window.innerWidth, window.innerHeight)/4, Math.min(window.innerWidth, window.innerHeight)/4);
    renderer.render(scene,camaraPlanta);
}

