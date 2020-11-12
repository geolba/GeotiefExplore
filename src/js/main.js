// import { DirectionalLight, AmbientLight, WebGLRenderer, PerspectiveCamera, Scene } from 'three';
import { DirectionalLight } from 'three/src/lights/DirectionalLight';
import { AmbientLight } from 'three/src/lights/AmbientLight';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { Scene } from 'three/src/scenes/Scene';
import { BoxLayer } from './layer/BoxLayer';
// import * as util from './core/utilities';
// import { OrbitControls } from './lib/OrbitControls.js'
import { Map } from './core/Map';
import * as domEvent from './core/domEvent';

import '../css/page.css'; /* style loader will import it */

class Application {

    constructor(container) {
        this.container = container;
        this.running = false; // this is public

        this.objects = [];

        if (container.clientWidth && container.clientHeight) {
            this.width = container.clientWidth;
            this.height = container.clientHeight;
            this._fullWindow = false;
        } else {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this._fullWindow = true;
        }

        this.createScene();
    }

    createScene() {

        /* Renderer */
        var bgcolor = 0xfdfdfd;
        this.renderer = new WebGLRenderer({ alpha: true, antialias: true });
        // this.renderer.setSize(window.innerWidth, window.innerHeight);
        // document.body.appendChild(this.renderer.domElement);
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(bgcolor, 1); // second param is opacity, 0 => transparent       
        this.renderer.render
        this.container.appendChild(this.renderer.domElement);

        /* Scene: that will hold all our elements such as objects, cameras and lights. */
        this.scene = new Scene();
        //app.scene.add(new THREE.AmbientLight(0xeeeeee));
        this._buildDefaultLights(this.scene);
        //app.scene.autoUpdate = false;
        //// show axes in the screen
        //app.scene.add(new THREE.AxisHelper(100));

        /* Camera */
        var angle = 45;
        var aspect = this.width / this.height;
        var near = 0.1; //This is the distance at which the camera will start rendering scene objects
        var far = 2000; //Anything beyond this distance will not be rendered                
        this.camera = new PerspectiveCamera(angle, aspect, near, far);
        //this.camera.position.z = 20;
        this.camera.position.set(0, -0.1, 150);
        // this.camera.lookAt(new THREE.Vector3(0, 0, 0));   

        // this.controls = new OrbitControls(this.camera, this.scene, this.renderer.domElement);
        this.map = new Map(this.camera, this.scene, this.renderer.domElement, this.container);
        let boxLayer = new BoxLayer({ width: 10, height: 10, depth: 10 });
        this.map.addLayer(boxLayer);

        domEvent.on(window, 'click', this.onWindowResize, this);

        // util.setLoading("webgl");  
        this.start();
    }

    onWindowResize() {
        if (this._fullWindow) {
            this._setCanvasSize(window.innerWidth, window.innerHeight);
        }
        else {
            this._setCanvasSize(this.container.clientWidth, this.container.clientHeight);
        }        
    }

    _setCanvasSize (width, height) {
        this.width = width;
        this.height = height;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);  
        this.animate();
    }

    _buildDefaultLights(scene) {
        var deg2rad = Math.PI / 180;

        // ambient light
        scene.add(new AmbientLight(0x999999));
        //scene.add(new THREE.AmbientLight(0xeeeeee));

        // directional lights
        var opt = {
            azimuth: 220,   // note: default light azimuth of gdaldem hillshade is 315.
            altitude: 45    // altitude angle
        };
        //appSettings.Options.light.directional;
        var lambda = (90 - opt.azimuth) * deg2rad;
        var phi = opt.altitude * deg2rad;

        var x = Math.cos(phi) * Math.cos(lambda),
            y = Math.cos(phi) * Math.sin(lambda),
            z = Math.sin(phi);

        var light1 = new DirectionalLight(0xffffff, 0.5);
        light1.position.set(x, y, z);
        scene.add(light1);

        // thin light from the opposite direction
        var light2 = new DirectionalLight(0xffffff, 0.1);
        light2.position.set(-x, -y, -z);
        scene.add(light2);
    }

    start() {
        this.running = true;

        this.map.addListener('change', this.animate, this); // add this only if there is no animation loop (requestAnimationFrame)
        this.animate();
    }

    animate() {
        if (this.running) {
            // requestAnimationFrame(() => {
            //     this.animate();
            // }, 1000 / 30);

            // this.objects.forEach((object) => {
            //     object.update();
            // });
        }

        this.renderer.render(this.scene, this.camera);
    }

    add(layer) {
        this.objects.push(layer);
        this.scene.add(layer.getMesh());
    }
}

var container = document.getElementById("webgl");
let app = new Application(container);
// app.add(new BoxLayer({
//     width: 10,
//     height: 10,
//     depth: 10
// }));