import { DirectionalLight } from 'three/src/lights/DirectionalLight';
import { AmbientLight } from 'three/src/lights/AmbientLight';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { Scene } from 'three/src/scenes/Scene';
import { Vector3 } from 'three/src/math/Vector3';
import { GridLayer } from './layer/GridLayer';
// import { DemLayer } from './layer/DemLayer';
import { Map } from './core/Map';
import * as domEvent from './core/domEvent';
import { Coordinates } from './controls/Coordinates';
import { NorthArrow } from './controls/NorthArrow';
import { LayerControl } from './controls/LayerControl';
import { BasemapControl } from './controls/BasemapControl';
import { SliderControl } from './controls/SliderControl';
import { Mesh } from 'three/src/objects/Mesh';
import { SphereGeometry } from 'three/src/geometries/SphereGeometry';
import { MeshLambertMaterial } from 'three/src/materials/MeshLambertMaterial';
import * as util from './core/utilities';
import * as browser from './core/browser';
import * as domUtil from './core/domUtil';
import { PickingTool } from './clip/PickingTool';
import { ShowModal } from './components/ShowModal';
import * as material from './clip/material';
import { Group } from 'three/src/objects/Group';

import { Selection } from './clip/Selection';
import _ from "lodash";

import '../css/page_bulma.scss'; /* style loader will import it */
import { TinLayer } from './layer/TinLayer';

class Application {

    capsSceneArray;

    constructor(container) {
        this.container = container;
        this.running = false;
        this.wireframeMode = false;
        this.canvas;
        this._canvasImageUrl;
        this.downloadButton;
        this.showCaps = true;

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
        this.downloadButton = document.querySelector('#menu-dowload-button');
        this.menuIcon = document.querySelector('#menu-icon');
        this.navigation = document.getElementsByClassName('navigation')[0];

        let parentContainer = document.getElementById("app");
        this.dialog = new ShowModal("Help", parentContainer, { klass: "fm_about" });

        // this.dialog = new MobileDialog("Help", container, { klass: "fm_about" });
        this.aboutIcon = document.querySelector('#menu-about-icon');
        // this.createScene();
        // this.addEventListeners();
    }
    async build() {
        await this.createScene();
        this.addEventListeners();
        // add matomo code if defined in .env file:
        if (ENVIRONMENT == "production" && MATOMO_TRACKER_URL != null && MATOMO_SITE_ID != null) {
            let _paq = window._paq = window._paq || [];
            /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
            _paq.push(['trackPageView']);
            _paq.push(['enableLinkTracking']);
            (function () {
                let u = MATOMO_TRACKER_URL;
                _paq.push(['setTrackerUrl', u + 'matomo.php']);
                _paq.push(['setSiteId', MATOMO_SITE_ID]);
                let d = document; let g = d.createElement('script');
                let s = d.getElementsByTagName('script')[0];
                g.type = 'text/javascript';
                g.async = true;
                g.src = u + 'matomo.js';
                s.parentNode.insertBefore(g, s);
            })();
        }

    }

    async createScene() {
        let dirNode = document.getElementsByTagName("body")[0];
        if (browser.touch == true && browser.mobile == true) {
            //dirNode.setAttribute("dir", "ltr");
            domUtil.addClass(dirNode, "touch");
        } else {
            domUtil.addClass(dirNode, "notouch");
        }

        // let opt = { r: 200, c: 0x38eeff, o: 0.8 };
        let opt = { r: 5, c: 0xffff00, o: 1 };
        this.queryMarker = new Mesh(new SphereGeometry(opt.r),
            new MeshLambertMaterial({ color: opt.c, opacity: opt.o, transparent: (opt.o < 1) }));

        this.queryMarker.visible = true;
        // this.queryMarker.position.set(4282010, 2302070, -13616.3);
        /* Renderer */
        this.renderer = new WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.autoClear = false;
        this.renderer.setClearColor(0x000000, 0.0); // second param is opacity, 0 => transparent 
        // this.renderer.setClearColor( 0xffffff );

        // enable clipping
        // let Empty = Object.freeze([]);
        // this.renderer.clippingPlanes = Empty; // GUI sets it to globalPlanes
        this.renderer.localClippingEnabled = true;
        this.container.appendChild(this.renderer.domElement);

        /* Scene: that will hold all our elements such as objects, cameras and lights. */
        this.scene = new Scene();
        this.capsScene = new Scene();
        this.backStencil = new Scene();
        this.frontStencil = new Scene();
        this.capsSceneArray = new Array();
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
        // this.camera = new PerspectiveCamera(angle, aspect, near, far);
        // this.camera.position.set(0, -0.1, 150);
        // this.camera.lookAt(new Vector3(0, 0, 0));

        // this.camera = new PerspectiveCamera(30, this.width / this.height, 100, 100000);
        // let x = { min: 4415940, max: 4508490, avg: 4463830 };       
        // let y = { min: 2350280, max: 2475820, avg: 2412360 };       
        // let z = { min: -8798.15, max: 1401.92, avg: -177.74 };
        // const center = new Vector3((x.min + x.max) / 2, (y.min + y.max) / 2, 0);       
        // const size = Math.max(x.max - x.min, y.max - y.min, z.max - z.min);
        // let baseExtent = {
        //     x: x,
        //     y: y
        // };
        // const camDirection = new Vector3(-0.5, -Math.SQRT1_2, 0.5);
        // // const camDirection = new Vector3(0, 0, 1);
        // const camOffset = camDirection.multiplyScalar(size * 2);
        // this.camera.position.copy(center);
        // this.camera.position.add(camOffset);
        // this.camera.near = size * 0.1;
        // this.camera.far = size * 25;
        // this.camera.updateProjectionMatrix();


        /* Camera */
        // // const center = new Vector3();
        // var angle = 45;
        // var aspect = this.width / this.height;
        // var near = 0.1; //This is the distance at which the camera will start rendering scene objects
        // var far = 2000; //Anything beyond this distance will not be rendered                
        // this.camera = new PerspectiveCamera(angle, aspect, near, far);        
        // this.camera.position.set(0, -0.1, 150);
        // this.camera.lookAt(new Vector3(0, 0, 0));

        let map = this.map = await Map.build(
            this.scene,
            this.container,
            'https://geusegdi01.geus.dk/meta3d/rpc/model_meta_all?modelid=20'
        );
        this.mapTitle = document.querySelector('#map-title');
        this.mapTitle.innerHTML += map.title;
        map.on('ready', () => {
            this.selectionBox.setUniforms();


            this.capsScene.add(this.selectionBox.boxMesh);
            // this.scene.add(this.selection.displayMeshes);
            // this.scene.add(this.selection.touchMeshes);
            this.map.addLayer(this.selectionBox);

            // for (const [key, layer] of Object.entries(this.map.layers)) {
            //     // let layer = map.layers[i];
            //     if (layer instanceof TinLayer && layer.name != "Topography") {
            //         // let capsScene = new Scene();
            //         // capsScene.add(layer.borderMesh);
            //         // this.capsSceneArray.push(capsScene);
            //         this.capsScene.add(layer.borderMesh);
            //         layer.on('visibility-change', (args) => {
            //             let visible = args[0];
            //             layer.borderMesh.visible = visible;
            //         });
            //     }
            // }

            let frontGroup = new Group();
            for (var i in map.layers) {
                let layer = map.layers[i];
                if (layer instanceof TinLayer && layer.name != "Topography") {
                    let mesh = new Mesh(layer.geometry.clone(), material.frontStencilMaterial);
                    mesh.userData.layerId = layer.index;
                    frontGroup.add(mesh);
                    layer.on('visibility-change', (args) => {
                        let visible = args[0];
                        mesh.visible = visible;
                    });
                    layer.on('scale-change', (args) => {
                        let z = args[0];
                        mesh.scale.z = z;
                    });
                }
            }
            frontGroup.updateMatrix();
            // let frontMesh = new Mesh(frontGroup, material.frontStencilMaterial);
            this.frontStencil.add(frontGroup);

            let backGroup = new Group();
            for (var i in map.layers) {
                let layer = map.layers[i];
                if (layer instanceof TinLayer && layer.name != "Topography") {
                    let mesh = new Mesh(layer.geometry.clone(), material.backStencilMaterial);
                    mesh.userData.layerId = layer.index;
                    backGroup.add(mesh);
                    layer.on('visibility-change', (args) => {
                        let visible = args[0];
                        mesh.visible = visible;
                    });
                    layer.on('scale-change', (args) => {
                        let z = args[0];
                        mesh.scale.z = z;
                    });

                }
            }
            backGroup.updateMatrix();
            // let frontMesh = new Mesh(frontGroup, material.frontStencilMaterial);
            this.backStencil.add(backGroup);

            this.animate();
        }, this);

        this.selectionBox = new Selection(
            { name: 'Slicing Box' },
            new Vector3(this.map.x.min, this.map.y.min, this.map.z.min),
            new Vector3(this.map.x.max, this.map.y.max, this.map.z.max)
        );
        // this.map.addLayer(this.selectionBox);
        this.map.picking = new PickingTool(this.map.size, this.map.center, this);


        // let boxLayer = new BoxLayer({ 
        //     width: 10000, height: 10000, depth: 10000, name: 'center-box', color: 800080 , center: center
        // });
        // this.map.addLayer(boxLayer);

        //add map controls:
        if (util.hasTouch() == false) {
            new Coordinates({ camera: this.map.camera, crs: "EPSG:3034" }).addTo(this.map);
            // coordinates.addListener('onPoint', (args) => {
            //     let vector = args[0];
            //     this.queryMarker.position.set(vector.x, vector.y, vector.z);
            //     // this.queryMarker.updateMatrixWorld();
            //     this.animate();
            // }, this);
        }
        this.northArrow = new NorthArrow({ headLength: 1, headWidth: 1 }).addTo(this.map);



        this.gridlayer = new GridLayer({ center: this.map.center, name: "coordinate grid", appWidth: this.width, appHeight: this.height });
        this.map.addLayer(this.gridlayer);

        new LayerControl(this.map.layers, {
            collapsed: true,
            parentDiv: 'layer-control-parent-id'
        }).addTo(this.map);

        this.basemapControl = new BasemapControl('Baselayer', {
            position: 'topright'
        }).addTo(this.map);

        //slider for scaling z value
        this.slider = new SliderControl({ layers: this.map.layers }).addTo(this.map);

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
        this.map.camera.aspect = width / height;
        this.map.camera.updateProjectionMatrix();
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

    deferringThrottle = _.throttle(this.animate, 40);

    animate() {
        this.renderer.clear();

        // The HTML5 Canvas's 'webgl' context obtained from the canvas where the renderer will draw.
        let gl = this.renderer.getContext();

        if (this.showCaps && gl != undefined) {
            // enable stencil test
            gl.enable(gl.STENCIL_TEST);

            // for (let i in this.map.layers) {
            //     let layer = this.map.layers[i];
            //     if (layer instanceof TinLayer && layer.name != "Topography") {
            //         layer.animate();
            //         break;
            //     }
            // }
           
            gl.stencilFunc(gl.ALWAYS, 1, 0xff);
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
            this.renderer.render(this.backStencil, this.map.camera);

            gl.stencilFunc(gl.ALWAYS, 1, 0xff);
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);
            this.renderer.render(this.frontStencil, this.map.camera);

            gl.stencilFunc(gl.EQUAL, 1, 0xff);
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
            this.renderer.render(this.capsScene, this.map.camera);

            // disable stencil test
            gl.disable(gl.STENCIL_TEST);
            // gl.stencilMask(0);
            // this.renderer.state.setStencilFunc( false );
        }


        this.renderer.render(this.scene, this.map.camera);

        this.northArrow.animate();
        this.gridlayer.animate();
    }

    addEventListeners() {
        domEvent.on(window, 'resize', this.onWindowResize, this);
        domEvent.on(window, 'keydown', this.keydown, this);

        // let inputNodes = [this.$topTextInput, this.$bottomTextInput, this.$imageInput];
        // inputNodes.forEach(element => domEvent.on(element, 'keyup', this.createMeme, this));
        // //if image is changed
        // inputNodes.forEach(element => domEvent.on(element, 'change', this.createMeme, this));

        domEvent.on(this.downloadButton, 'click', this.downloadMapImage, this);

        domEvent.on(this.aboutIcon, 'click', function (e) {
            e.preventDefault();
            this.dialog.show();
        }, this);

        const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
        // Check if there are any navbar burgers
        if ($navbarBurgers.length > 0) {
            // Add a click event on each of them
            $navbarBurgers.forEach(el => {
                el.addEventListener('click', () => {

                    // Get the target from the "data-target" attribute
                    const target = el.dataset.target;
                    const $target = document.getElementById(target);

                    // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
                    el.classList.toggle('is-active');
                    $target.classList.toggle('is-active');

                });
            });
        }

        let tabButtons = [].slice.call(document.querySelectorAll('ul.tab-nav li'));

        tabButtons.map(function (button) {
            button.addEventListener('click', function () {
                document.querySelector('li.is-active').classList.remove('is-active');
                button.classList.add('is-active');

                document.querySelector('.tab-pane.active').classList.remove('active');
                document.querySelector(button.getAttribute('name')).classList.add('active');
            })
        });

        //toggle GridLayer
        let chkGrid = document.getElementById("chkGrid");
        domEvent.on(chkGrid, 'click', function (e) {
            this.gridlayer.toggle();
        }, this);

        //toggle SlicingBox
        let chkSlicingBox = document.getElementById("chkSlicingBox");
        domEvent.on(chkSlicingBox, 'click', function (e) {
            this.selectionBox.toggle();
        }, this);

    }

    downloadMapImage() {
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

let container = document.getElementById("webgl");
let app = new Application(container);
app.build();
