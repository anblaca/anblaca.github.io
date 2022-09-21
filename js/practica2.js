var renderer, scene, camera

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0x0000AA),1.0);
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene()

    var aspectRatio = window.innerWidth/window.innerHeight;
    camera = new THREE.PerspectiveCamera(75,aspectRatio,0.1,100);
    camera.position.set(0,2,3);

    //Practica 2
    //cilindro
    var  base = new THREE.Mesh( new THREE.CylinderGeometry(50.0,50.0,15.0)); //r top, r bottom, height
    base.position.y = 0.0;
    //cilindro    
    var ejeBrazo = new THREE.Mesh(new THREE.CylinderGeometry(20.0,20.0,18.0));
    ejeBrazo.position.y = 0.0;
    ejeBrazo.rotation.setY(180);
    //esfera
    var rotula = new THREE.Mesh(new THREE.SphereGeometry(20.0));
    rotula.position.y = 120.0;

    //cilindro
    var cilindroAntebrazo = new THREE.Mesh(new THREE.CylinderGeometry(22.0,22.0,6.0));
    cilindroAntebrazo.position.y = 120.0;

    //cilindro
    var cilindroMano = new THREE.Mesh(new THREE.CylinderGeometry(15.0,15.0,40.0));
    cilindroMano.position.y = 200;
    cilindroMano.setY(180);

    mesh = new THREE.Object3D();
    mesh.add(base);
    mesh.add(ejeBrazo);
    mesh.add(rotula);
    mesh.add(cilindroAntebrazo);
    mesh.add(cilindroMano);

    scene.add(mesh);
}

function update() {}

function render() {
    requestAnimationFrame(render);
    update();
    renderer.render(scene,camera);
}

init();
render();