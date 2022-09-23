var renderer, scene, camera

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0x0000AA),1.0);
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene()

    var aspectRatio = window.innerWidth/window.innerHeight;
    camera = new THREE.PerspectiveCamera(75,aspectRatio,0.1,100);
    //camera.position.set(0,2,3);

    camera.position.set(100, 200, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
}

function loadScene() {

    //Practica 2
    robot = new THREE.Object3D();
    //cilindro
    var matRobot = new THREE.MeshBasicMaterial({ color: 'yellow', wireframe: true });
    var  base = new THREE.Mesh( new THREE.CylinderGeometry(50.0,50.0,15.0),matRobot); //r top, r bottom, height
    base.position.set = (0.0,0.0,0.0);
    //cilindro    
    var ejeBrazo = new THREE.Mesh(new THREE.CylinderGeometry(20.0,20.0,18.0),matRobot);
    ejeBrazo.position.set = (0.0,0.0,0.0);
    ejeBrazo.rotation.z = Math.PI/2;
    //esfera
    var rotula = new THREE.Mesh(new THREE.SphereGeometry(20.0),matRobot);
    rotula.position.set = (0.0,120.0,0.0);

    //cilindro
    var cilindroAntebrazo = new THREE.Mesh(new THREE.CylinderGeometry(22.0,22.0,6.0),matRobot);
    //cilindroAntebrazo.position = (0.0,120.0,0.0);

    //cilindro
    var cilindroMano = new THREE.Mesh(new THREE.CylinderGeometry(15.0,15.0,40.0),matRobot);
    cilindroMano.position = (0.0,80,0.0);
    cilindroMano.rotation.z = Math.PI/2;


    //ANTEBRAZO
    objetoAntebrazo = new THREE.Object3D();
    objetoAntebrazo.add(cilindroAntebrazo);
    objetoAntebrazo.add(cilindroMano);
    objetoAntebrazo.position = (0.0,120.0,0.0);
   
    //BRAZO
    objetoBrazo = new THREE.Object3D();
    objetoBrazo.add(ejeBrazo);
    objetoBrazo.add(rotula);
    objetoBrazo.add(objetoAntebrazo);

    //GRAFO DE ESCENA
    robot.add(base)
    
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