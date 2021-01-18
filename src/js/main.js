import { DirectionalLight } from 'three/src/lights/DirectionalLight';
import { AmbientLight } from 'three/src/lights/AmbientLight';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { Scene } from 'three/src/scenes/Scene';
import { Vector3 } from 'three/src/math/Vector3';
import { TinLayer } from './layer/TinLayer';
import { DemLayer } from './layer/DemLayer';
import { Map } from './core/Map';
import * as domEvent from './core/domEvent';
import { Coordinates } from './controls/Coordinates';
import { NortArrow } from './controls/NorthArrow';
import { LayerControl } from './controls/LayerControl';
import { MobileDialog } from './controls/MobileDialog';
import { BasemapControl } from './controls/BasemapControl';
import { SliderControl } from './controls/SliderControl';
import { Mesh } from 'three/src/objects/Mesh';
import { SphereGeometry } from 'three/src/geometries/SphereGeometry';
import { MeshLambertMaterial } from 'three/src/materials/MeshLambertMaterial';
import * as util from './core/utilities';
import * as browser from './core/browser';
import * as domUtil from './core/domUtil';
import { BoxLayer } from './layer/BoxLayer';

import '../css/page.css'; /* style loader will import it */

class Application {

    constructor(container) {
        this.container = container;
        this.running = false;
        this.wireframeMode = false;
        this.canvas;
        this._canvasImageUrl;
        this.downloadButton

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

        // this.canvas = document.querySelector('#imgCanvas');
        // this.$topTextInput = document.querySelector('#topText');
        // this.$bottomTextInput = document.querySelector('#bottomText');
        // this.$imageInput = document.querySelector('#image');
        this.downloadButton = document.querySelector('#btnDownloadCanvasImage');
        this.menuIcon = document.querySelector('#menu-icon');
        this.navigation = document.getElementsByClassName('navigation')[0];
        // this.addEventListeners();

        this.mapIcon = document.querySelector('#menu-map-icon');
       

        this.createScene();
        this.addEventListeners();
    }

    createScene() {

        var dirNode = document.getElementsByTagName("body")[0];
        if (browser.touch == true) {
            //dirNode.setAttribute("dir", "ltr");
            domUtil.addClass(dirNode, "touch");
        } else {
            domUtil.addClass(dirNode, "notouch");
        }

        // let opt = { r: 200, c: 0x38eeff, o: 0.8 };
        var opt = { r: 5, c: 0xffff00, o: 1 };
        this.queryMarker = new Mesh(new SphereGeometry(opt.r),
            new MeshLambertMaterial({ color: opt.c, opacity: opt.o, transparent: (opt.o < 1) }));

        this.queryMarker.visible = true;
        // this.queryMarker.position.set(4282010, 2302070, -13616.3);
        /* Renderer */
        // var bgcolor = 0xfdfdfd;
        let bgcolor = 0xfdfdfd;
        this.renderer = new WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        // this.renderer.setSize(window.innerWidth, window.innerHeight);
        // document.body.appendChild(this.renderer.domElement);
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(bgcolor, 1); // second param is opacity, 0 => transparent       
        // let Empty = Object.freeze([]);
        // this.renderer.clippingPlanes = Empty; // GUI sets it to globalPlanes
        // this.renderer.localClippingEnabled = true;
        this.container.appendChild(this.renderer.domElement);

        /* Scene: that will hold all our elements such as objects, cameras and lights. */
        this.scene = new Scene();
        //app.scene.add(new THREE.AmbientLight(0xeeeeee));
        // const ambient = new AmbientLight( 0xffffff, 0.5 );
        // this.scene.add(ambient);
        this._buildDefaultLights(this.scene);
        //app.scene.autoUpdate = false;
        //// show axes in the screen
        //app.scene.add(new THREE.AxisHelper(100));
        this.scene.add(this.queryMarker);

        /* Camera */
        var angle = 45;
        var aspect = this.width / this.height;
        var near = 0.1; //This is the distance at which the camera will start rendering scene objects
        var far = 2000; //Anything beyond this distance will not be rendered                
        this.camera = new PerspectiveCamera(angle, aspect, near, far);
        // this.camera.position.set(0, -0.1, 150);
        // this.camera.lookAt(new Vector3(0, 0, 0));

        this.camera = new PerspectiveCamera(30, this.width / this.height, 100, 100000);

        // const dirLight = new DirectionalLight(0xffffff, 1);
        // dirLight.position.set(585000 + 10000, 6135000 + 10000, -500 + 5000);
        // this.camera.add(dirLight);

        let x = { min: 3955850, max: 4527300, avg: 4282010 };
        let y = { min: 2183600, max: 2502700, avg: 2302070 };
        let z = { min: -60066, max: 3574.94, avg: -13616.3 };
        const center = new Vector3 ( (x.min + x.max) / 2, (y.min + y.max) / 2, z.avg );
        // const center = new Vector3(x.avg, y.avg, z.avg);
        const size = Math.max(x.max - x.min, y.max - y.min, z.max - z.min);

        const camDirection = new Vector3(-0.5, -Math.SQRT1_2, 0.5);
        const camOffset = camDirection.multiplyScalar(size * 2);
        this.camera.position.copy(center);
        this.camera.position.add(camOffset);
        // this.camera.position.set(0, 0, 1500);
        this.camera.near = size * 0.1;
        this.camera.far = size * 25;
        this.camera.updateProjectionMatrix();


        /* Camera */
        // // const center = new Vector3();
        // var angle = 45;
        // var aspect = this.width / this.height;
        // var near = 0.1; //This is the distance at which the camera will start rendering scene objects
        // var far = 2000; //Anything beyond this distance will not be rendered                
        // this.camera = new PerspectiveCamera(angle, aspect, near, far);        
        // this.camera.position.set(0, -0.1, 150);
        // this.camera.lookAt(new Vector3(0, 0, 0));

        // create map
        this.map = new Map(size, center, this.camera, this.scene, this.renderer.domElement, this.container);
        // this.map.minDistance =  size*0.75;
        // this.map.maxDistance = size*15;

        // let boxLayer = new BoxLayer({ 
        //     width: 10000, height: 10000, depth: 10000, name: 'test-box', color: 800080 
        // });
        // this.map.addLayer(boxLayer);

        //add map controls:
        if (util.hasTouch() == false) {
            let coordinates = new Coordinates({ camera: this.camera, crs: "EPSG:3034" }).addTo(this.map);
            // coordinates.addListener('onPoint', (args) => {
            //     let vector = args[0];
            //     this.queryMarker.position.set(vector.x, vector.y, vector.z);
            //     // this.queryMarker.updateMatrixWorld();
            //     this.animate();
            // }, this);
        }
        this.northArrow = new NortArrow({ headLength: 1, headWidth: 1 }).addTo(this.map);

        // this.dialog = new MobileDialog("Help", { klass: "fm_about", parentDiv: 'basemap-control-parent' }).addTo(this.map);

        let demLayer = new DemLayer({
            q: 0, shading: true, type: 'dem', name: 'DEM Layer', color: 16382457,
            "materialParameter": [{
                "i": 0,
                "materialtypee": 0,
                "ds": 1,
                "bottomZ": 3000, //-18.70583629319634
            }]
        });
        demLayer.addBlock({
            "width": 226,
            "plane": {
                "width": x.max - x.min, //100.0,
                // "offsetX": 0,
                // "offsetY": 0,
                // "offsetX" : x.avg,
                // "offsetY" : y.avg,
                "offsetX" : center.x,
                "offsetY" : center.y,
                "height": y.max - y.min, //78.59618717504333
            },
            "dem_values": [],
            "height": 178
        });
        this.map.addLayer(demLayer);
        this.map.currentBasemap = demLayer;

        let dxf134Layer = new TinLayer({
            geomId: 134, q: true, type: "3dface", name: "South Alpine Superunit", description: "test", color: "907A5C"
        });
        this.map.addLayer(dxf134Layer);        

        let dxf135Layer = new TinLayer({
            geomId: 135, q: true, type: "3dface", name: "Adriatic Plate", description: "test2", color: "A0512D"
        });
        this.map.addLayer(dxf135Layer);

        let dxf136Layer = new TinLayer({
            geomId: 136, q: true, type: "3dface", name: "Austroalpine Superunit", description: "test2", color: "CC4D00"
        });
        this.map.addLayer(dxf136Layer);

        let dxf137Layer = new TinLayer({
            geomId: 137, q: true, type: "3dface", name: "Penninic Superunit", description: "test2", color: "80CCFF"
        });
        this.map.addLayer(dxf137Layer);

        let dxf139Layer = new TinLayer({
            geomId: 139, q: true, type: "3dface", name: "Sub-Penninic Superunit, Helvetic Superunit & Allochthonous Molasse", description: "test2", color: "FF80CC"
        });
        this.map.addLayer(dxf139Layer);

        let dxf140Layer = new TinLayer({
            geomId: 140, q: true, type: "3dface", name: "Eurasian Plate, including autochtomous sedimentary cover", description: "test2", color: "FFB3B3"
        });
        this.map.addLayer(dxf140Layer);

        new LayerControl(this.map.layers, {
            collapsed: true,
            parentDiv: 'layer-control-parent-id'
        }).addTo(this.map);

        this.basemapControl = new BasemapControl('Baselayer', {
            parentDiv: 'basemap-control-parent'
        }).addTo(this.map);

        //slider for scaling z value
        this.slider = new SliderControl({ layers: this.map.layers }).addTo(this.map);

        // domEvent.on(window, 'resize', this.onWindowResize, this);
        // domEvent.on(window, 'keydown', this.keydown, this);
        this.start();
    }

    keydown(e) {
        if (e.ctrlKey || e.altKey) return;
        let keyPressed = e.which;
        if (!e.shiftKey) {
            //if (keyPressed == 27) app.closePopup(); // ESC           
            if (keyPressed === 87) {
                this.setWireframeMode();    // W
            }
        }
    }

    setWireframeMode() {
        let wireframe = !this.wireframeMode;
        if (wireframe === this.wireframeMode) return;

        for (var key in this.map._layers) {
            let layer = this.map._layers[key];
            layer.setWireframeMode(wireframe);
        }

        this.wireframeMode = wireframe;
        this.animate();
    }

    onWindowResize() {
        if (this._fullWindow) {
            this._setCanvasSize(window.innerWidth, window.innerHeight);
        }
        else {
            this._setCanvasSize(this.container.clientWidth, this.container.clientHeight);
        }
    }

    _setCanvasSize(width, height) {
        this.width = width;
        this.height = height;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.animate();
    }

    _buildDefaultLights(scene) {
        let deg2rad = Math.PI / 180;

        // ambient light
        scene.add(new AmbientLight(0x999999));
        //scene.add(new THREE.AmbientLight(0xeeeeee));

        // directional lights
        let opt = {
            azimuth: 220,   // note: default light azimuth of gdaldem hillshade is 315.
            altitude: 45    // altitude angle
        };
        //appSettings.Options.light.directional;
        let lambda = (90 - opt.azimuth) * deg2rad;
        let phi = opt.altitude * deg2rad;

        let x = Math.cos(phi) * Math.cos(lambda),
            y = Math.cos(phi) * Math.sin(lambda),
            z = Math.sin(phi);

        let light1 = new DirectionalLight(0xffffff, 0.5);
        light1.position.set(x, y, z);
        scene.add(light1);

        // thin light from the opposite direction
        let light2 = new DirectionalLight(0xffffff, 0.1);
        light2.position.set(-x, -y, -z);
        scene.add(light2);
    }

    start() {
        this.running = true;

        this.map.addListener('change', this.animate, this); // add this only if there is no animation loop (requestAnimationFrame)
        this.animate();
    }

    animate() {
        this.renderer.render(this.scene, this.camera);
        this.northArrow.animate();
    }

    addEventListeners() {

        domEvent.on(this.mapIcon, 'click', () => {
            this.basemapControl.show();
        }, this);

        domEvent.on(window, 'resize', this.onWindowResize, this);
        domEvent.on(window, 'keydown', this.keydown, this);

        // let inputNodes = [this.$topTextInput, this.$bottomTextInput, this.$imageInput];
        // inputNodes.forEach(element => domEvent.on(element, 'keyup', this.createMeme, this));
        // //if image is changed
        // inputNodes.forEach(element => domEvent.on(element, 'change', this.createMeme, this));

        domEvent.on(this.downloadButton, 'click', this.downloadMapImage, this);

        domEvent.on(this.menuIcon, 'click', function (e) {
            e.preventDefault();
            this.navigation.classList.toggle("active");
        }, this);

        var tabButtons = [].slice.call(document.querySelectorAll('ul.tab-nav li span.button'));

        tabButtons.map(function (button) {
            button.addEventListener('click', function () {
                document.querySelector('li span.active.button').classList.remove('active');
                button.classList.add('active');

                document.querySelector('.tab-pane.active').classList.remove('active');
                document.querySelector(button.getAttribute('name')).classList.add('active');
            })
        })

    }

    downloadMapImage() {
        // if(!this.$imageInput.files[0]) {
        //   this.$imageInput.parentElement.classList.add('has-error');
        //   return;
        // }
        // if(this.$bottomTextInput.value === '') {
        //   this.$imageInput.parentElement.classList.remove('has-error');
        //   this.$bottomTextInput.parentElement.classList.add('has-error');
        //   return;
        // }
        // this.$imageInput.parentElement.classList.remove('has-error');
        // this.$bottomTextInput.parentElement.classList.remove('has-error');

        // const imageSource = this.renderer.domElement.toDataURL('image/png');
        // const att = document.createAttribute('href');
        // att.value = imageSource.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
        // this.downloadButton.setAttributeNode(att);
        // this.renderer.preserveDrawingBuffer = true;
        // this.renderer.render(this.scene, this.camera);
        this.saveCanvasImage(this.renderer.domElement);
    }

    saveCanvasImage(canvas) {
        // !HTMLCanvasElement.prototype.toBlob
        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement.toBlob
        // decode the String
        var binStr = atob(canvas.toDataURL("image/png").split(',')[1]);
        var len = binStr.length;
        var arr = new Uint8Array(len);

        for (var i = 0; i < len; i++) {
            arr[i] = binStr.charCodeAt(i);
        }

        this.saveBlob(new Blob([arr], { type: "image/png" }));


    }

    saveBlob(blob) {
        // ie
        if (window.navigator.msSaveBlob !== undefined) {
            window.navigator.msSaveBlob(blob, filename);
            //app.popup.hide();
        }
        else {
            // create object url
            if (this._canvasImageUrl) {
                URL.revokeObjectURL(this._canvasImageUrl);
            }
            this._canvasImageUrl = URL.createObjectURL(blob);
            // display a link to save the image
            var e = this.downloadButton;//document.createElement("a");           
            e.href = this._canvasImageUrl;

        }
    }

    createMeme() {
        let context = this.$canvas.getContext('2d');

        // font size of top and bottom text
        let fontSize = ((this.canvas.width + this.canvas.height) / 2) * 4 / 100;
        context.font = `${fontSize}pt sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'top';

        /**
         * Stroke Text Style
         */
        context.lineWidth = fontSize / 5;
        context.strokeStyle = 'black';
        /**
         * Fill Text Style
         */
        context.fillStyle = 'white';
        // Fix lines over M
        context.lineJoin = 'round';

        // get he value of the top text an dbottom text from the input fields
        let topText = this.$topTextInput.value.toUpperCase();
        let bottomText = this.$bottomTextInput.value.toUpperCase();

        // Top Text: first parameter text, second and thir parameters contain location where the text should start rendering
        context.strokeText(topText, this.canvas.width / 2, this.canvas.height * (5 / 100));
        context.fillText(topText, this.canvas.width / 2, this.canvas.height * (5 / 100));

        // Bottom Text
        context.strokeText(bottomText, this.canvas.width / 2, this.canvas.height * (90 / 100));
        context.fillText(bottomText, this.canvas.width / 2, this.canvas.height * (90 / 100));
    }

}

var container = document.getElementById("webgl");
new Application(container);
