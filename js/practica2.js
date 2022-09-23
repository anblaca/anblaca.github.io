var renderer, scene, camera

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0x0000AA),1.0);
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene()

    var aspectRatio = window.innerWidth/window.innerHeight;
    camera = new THREE.PerspectiveCamera(75,aspectRatio,0.1,1000);
    camera.position.set(90, 200, 350);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
}

function loadScene() {

    //Practica 2

    //Creo el nodo del grafo
    robot = new THREE.Object3D();
    //todo el robot tendra el siguiente material
    var matRobot = new THREE.MeshBasicMaterial({ color: 'yellow', wireframe: true });
    
    //cilindro
    var  base = new THREE.Mesh( new THREE.CylinderGeometry(50,50,15,32),matRobot); //r top, r bottom, height
    base.position.set(0, 0, 0);
    //cilindro    
    var ejeBrazo = new THREE.Mesh(new THREE.CylinderGeometry(20,20,18,32),matRobot);
    ejeBrazo.rotation.z = Math.PI/2;
    //esfera
    var rotula = new THREE.Mesh(new THREE.SphereGeometry(20,30,15),matRobot);
    rotula.position.set(0,120,0);
    //Esparrago
    var esparrago = new THREE.Mesh(new THREE.BoxGeometry(18,120,12),matRobot);
    esparrago.position.set(0,60,0);
    //cilindro
    var cilindroAntebrazo = new THREE.Mesh(new THREE.CylinderGeometry(22,22,6,32),matRobot);
    //cilindroAntebrazo.position = (0.0,120.0,0.0);

    //cilindro
    var cilindroMano = new THREE.Mesh(new THREE.CylinderGeometry(15,15,40,32),matRobot);
    cilindroMano.position.set(0.0,70,5);
    cilindroMano.rotation.z = Math.PI/2;
    //Nervios cada uno en una posicion del espacio
    //Nervio 1
    var nervio1 = new THREE.Mesh(new THREE.BoxGeometry(4,80,4),matRobot);
    nervio1.position.set(8, 34, -4);
    //Nervio 2
    var nervio2 = new THREE.Mesh(new THREE.BoxGeometry(4,80,4),matRobot);
    nervio2.position.set(-8,34,4);
    //Nervio 3
    var nervio3 = new THREE.Mesh(new THREE.BoxGeometry(4,80,4),matRobot);
    nervio3.position.set(-8,34,-4);
    //Nervio 4
    var nervio4 = new THREE.Mesh(new THREE.BoxGeometry(4,80,4),matRobot);
    nervio4.position.set(8,34,4);

    const vertices = new Float32Array( [
        //triangulo 1
         0, 20,  0,
         0, -0,  0,
         19,  0,  0,
        //triangulo 2
         19,  20,  0,
         0,  20,   0,
         19,  0,   0,
        //triagulo 3
         0,  20,  4,
         0,  0,   4,
         19,  0,   4,
        //triagulo 4
         19,  20,  4,
         0,  20,   4,
         19,  0,   4,
        //triangulo 5
         0,  20,   0,
         19,  20,  0,
         19,  20,   4,
        //triangulo 6
        0,  20,   4,
        0,  20,  0,
        19,  20,   4,
        //triangulo 7
        0,  0,   0,
        19,  0,  0,
        19,  0,   4,
        //triangulo 8
        0,  0,   4,
        0,  0,  0,
        19,  0,   4,
    ] );
    points = []
    //triangulo 1
    points.push(new THREE.Vector3(0, 20, 0));
    points.push(new THREE.Vector3(0, 0, 0));
    points.push(new THREE.Vector3(19, 0, 0));
    //triangulo 2
    points.push(new THREE.Vector3(19, 20, 0));
    points.push(new THREE.Vector3(0, 20, 0));
    points.push(new THREE.Vector3(19, 0, 0));
    //triangulo 3
    points.push(new THREE.Vector3(0, 20, 0));
    points.push(new THREE.Vector3(0, 0, 4));
    points.push(new THREE.Vector3(19, 0, 4));
    // triangulo 4
    points.push(new THREE.Vector3(19, 20, 4));
    points.push(new THREE.Vector3(0, 20, 4));
    points.push(new THREE.Vector3(19, 0, 4));
    // triangulo 5
    points.push(new THREE.Vector3(0, 20, 0));
    points.push(new THREE.Vector3(19, 20, 0));
    points.push(new THREE.Vector3(19, 20, 4));
    // triangulo 6
    points.push(new THREE.Vector3(0, 20, 4));
    points.push(new THREE.Vector3(0, 20, 0));
    points.push(new THREE.Vector3(19, 20, 4));
    // triangulo 7
    points.push(new THREE.Vector3(0, 0, 0));
    points.push(new THREE.Vector3(19, 0, 0));
    points.push(new THREE.Vector3(19, 0, 4));
    // triangulo 8
    points.push(new THREE.Vector3(0, 0, 4));
    points.push(new THREE.Vector3(0, 0, 0));
    points.push(new THREE.Vector3(19, 0, 4));

  
    let geometry = new THREE.BufferGeometry().setFromPoints( points )
    //CREACION DE LA MANO
    //var mano = new THREE.Mesh(geometry,matRobot);
    var pinzaI = new THREE.Mesh(geometry, matRobot);
    //pinzaI.rotateY(Math.PI / 2);
    pinzaI.rotation.x = Math.PI/2;
    var pinzaD = new THREE.Mesh(geometry, matRobot);
    //pinzaD.rotateY(Math.PI / 2);
    //pinzaD.rotation.z = Math.PI/2;
    //pinzaD.position.set(0, 0, 20);
    //MANO
    //cilindroMano.add(pinzaD);
    cilindroMano.add(pinzaI);
    //ANTEBRAZO
    objetoAntebrazo = new THREE.Object3D();
    objetoAntebrazo.add(cilindroAntebrazo);
    objetoAntebrazo.add(cilindroMano);
    objetoAntebrazo.add(nervio1);
    objetoAntebrazo.add(nervio2);
    objetoAntebrazo.add(nervio3);
    objetoAntebrazo.add(nervio4);
    //objetoAntebrazo.add(mano)
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

    //scene.add(robot)
    scene.add(cilindroMano)
    scene.add(new THREE.AxesHelper(1000));

    var suelo = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 50, 50),matRobot);
    suelo.rotation.x = -Math.PI / 2;

    //scene.add(suelo)
}

function render() {
    requestAnimationFrame(render);
    //update();
    renderer.render(scene,camera);
}

init();
loadScene();
render();