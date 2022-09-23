var renderer, scene, camera

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0x0000AA),1.0);
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene()

    var aspectRatio = window.innerWidth/window.innerHeight;
    camera = new THREE.PerspectiveCamera(75,aspectRatio,0.1,100);
    //camera.position.set(80,10,80);
    camera.position.set(90, 100, 100);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    //camera.lookAt(new THREE.Vector3(0, 0, 0));
}

function loadScene() {

    //Practica 2

    //Creo el nodo del grafo
    robot = new THREE.Object3D();
    //todo el robot tendra el siguiente material
    var matRobot = new THREE.MeshBasicMaterial({ color: 'yellow', wireframe: true });
    
    //cilindro
    var  base = new THREE.Mesh( new THREE.CylinderGeometry(50,50,15,32),matRobot); //r top, r bottom, height
    //base.position = (0,0,0);
    base.position.set(0, 0, 0);
    //cilindro    
    var ejeBrazo = new THREE.Mesh(new THREE.CylinderGeometry(20,20,18,32),matRobot);
    ejeBrazo.rotation.z = Math.PI/2;
    //esfera
    var rotula = new THREE.Mesh(new THREE.SphereGeometry(20,30,15),matRobot);
    rotula.position.set(0,120,0);

    //cilindro
    var cilindroAntebrazo = new THREE.Mesh(new THREE.CylinderGeometry(22,22,6,32),matRobot);
    //cilindroAntebrazo.position = (0.0,120.0,0.0);

    //cilindro
    var cilindroMano = new THREE.Mesh(new THREE.CylinderGeometry(15,15,40,32),matRobot);
    cilindroMano.position.set(0.0,80,0.0);
    cilindroMano.rotation.z = Math.PI/2;


    //ANTEBRAZO
    objetoAntebrazo = new THREE.Object3D();
    objetoAntebrazo.add(cilindroAntebrazo);
    objetoAntebrazo.add(cilindroMano);
    objetoAntebrazo.position.set(0,120,0);
   
    //BRAZO
    objetoBrazo = new THREE.Object3D();
    objetoBrazo.add(ejeBrazo);
    objetoBrazo.add(rotula);
    objetoBrazo.add(objetoAntebrazo);

    //GRAFO DE ESCENA
    robot.add(base)
    base.add(objetoBrazo)
    scene.add(robot)

    scene.add(new THREE.AxesHelper(1000));

    var suelo = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 50, 50),matRobot);
    suelo.rotation.x = -Math.PI / 2;

    scene.add(suelo)
}

function render() {
    requestAnimationFrame(render);
    //update();
    renderer.render(scene,camera);
}

init();
loadScene();
render();