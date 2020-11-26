import { Control } from "./Control";
import { Group } from 'three/src/objects/Group';
import { Vector3 } from 'three/src/math/Vector3';
import { ArrowHelper } from 'three/src/helpers/ArrowHelper';
import * as util from '../core/utilities';
import * as dom from '../core/domUtil';
import * as domEvent from '../core/domEvent';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { Scene } from 'three/src/scenes/Scene';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';

// import { SphereGeometry } from 'three/src/geometries/SphereGeometry';
// import { MeshLambertMaterial } from 'three/src/materials/MeshLambertMaterial';
// import { Mesh } from 'three/src/objects/Mesh';

import './NorthArrow.css';

export class NortArrow extends Control {

    renderer;
    _mainMap;
    _scene;
    _camera;
    _center;
    objectGroup;
    labels = [];
    options = {
        position: 'bottomleft',
        width: 120,
        height: 120,
        headLength: 1,
        headWidth: 1,
    };

    constructor(options) {
        super(options);

        this.objectGroup = new Group();
        this.objectGroup.visible = true;
        util.setOptions(this, options);
    }

    onAdd(map) {
        this._mainMap = map;
        let container = this._container = dom.createDom("div", { "id": "inset", "class": "gba-control-minimap" });
        this._container.style.width = this.options.width + 'px';
        this._container.style.height = this.options.height + 'px';
        domEvent.disableClickPropagation(this._container);
        domEvent.on(this._container, 'mousewheel', domEvent.stopPropagation);

        let renderer = this.renderer = new WebGLRenderer({ alpha: true });
        renderer.setSize(120, 120);
        // renderer.setSize(container.innerWidth, container.innerHeight);
        container.appendChild(renderer.domElement);

        this._scene = new Scene();
        this._camera = new PerspectiveCamera(60, 1, 0.1, 1000);
        this._camera.position.copy(map.camera.position);
        this._camera.up = map.camera.up;
        let center = this._center = new Vector3(0, 0, 0);
        this._camera.lookAt(center);

        // this._camera = map.camera.clone();
        this._createArrow(this._scene);
        this._buildLabels();
        return container;
    }

    animate() {

        this._camera.position.copy(this._mainMap.camera.position);
        this._camera.position.setLength(18);
        // this._camera.lookAt(this.options.center);
        // this._camera.lookAt(this._mainMap.target);
        this._camera.lookAt(this._scene.position);

        this.renderer.render(this._scene, this._camera);
        this._updateInsetLabelPositions();
    }

    _createArrow(app_scene) {
        let from = new Vector3(0, 0, 0);
        let headLength = 1;//this.options.headLength;//1;
        let headWidth = this.options.headWidth;//1;

        // let xTo = new Vector3(1, 0, 0);
        let xTo = new Vector3(from.x + 1, from.y, from.z);
        let xDirection = xTo.clone().sub(from);
        this.objectGroup.add(new ArrowHelper(xDirection, from, 6, 0xf00000, headLength, headWidth)); // Red = x

        // let yTo = new Vector3(0, 1, 0);
        let yTo = new Vector3(from.x, from.y + 1, from.z);
        let yDirection = yTo.clone().sub(from);
        this.objectGroup.add(new ArrowHelper(yDirection, from, 6, 0x7cfc00, headLength, headWidth)); // Green = y

        //let zTo = new Vector3(0, 0, 1);//blue z
        let zTo = new Vector3(from.x, from.y, from.z + 1);
        let zDirection = zTo.clone().sub(from);
        this.objectGroup.add(new ArrowHelper(zDirection, from, 6, 0x00bfff, headLength, headWidth)); //8 is the length,  Blue = z; 20 and 10 are head length and width

        // let opt = { r: 200, c: 0x38eeff, o: 0.8 };
        // this._queryMarker = new Mesh(new SphereGeometry(opt.r),
        //     new MeshLambertMaterial({ color: opt.c, opacity: opt.o, transparent: false }));
        // this._queryMarker.visible = true;
        // this._queryMarker.position.set(0, 0, -1);

        if (app_scene) {
            app_scene.add(this.objectGroup);
        }
    }

    _buildLabels() {

        let f = [
            { a: ["X"], cl: "red-label", centroid: [[7, 0, 0]] },
            { a: ["Y"], cl: "green-label", centroid: [[0, 7, 0]] },
            { a: ["Z"], cl: "blue-label", centroid: [[0, 0, 7]] }
        ];

        var zFunc, getPointsFunc = function (f) { return f.centroid; };


        // create parent element for labels
        var e = document.createElement("div");
        this._container.appendChild(e);
        e.style.display = (this.objectGroup.visible) ? "block" : "none";
        let labelParentElement = e; //lable parent div for this layer

        for (let i = 0, l = f.length; i < l; i++) {
            var labelInfo = f[i];
            // labelInfo.aElems = [];
            // labelInfo.aObjs = [];
            var text = labelInfo.a[0];
            if (text === null || text === "") continue;

            var classLabel = labelInfo.cl;
            if (classLabel === undefined || classLabel === "") classLabel = "label";

            //var horizontalShiftLabel = f.hs;
            //if (horizontalShiftLabel === undefined || horizontalShiftLabel === "") horizontalShiftLabel = 0;

            let pts = getPointsFunc(labelInfo);
            for (let j = 0, m = pts.length; j < m; j++) {
                let pt = pts[j];

                // create div element for label
                var e = document.createElement("div");
                e.appendChild(document.createTextNode(text));
                e.className = classLabel;// "label";
                labelParentElement.appendChild(e);

                var pt1 = new Vector3(pt[0], pt[1], pt[2]);    // top

                this.labels.push({ labelDiv: e, pt: pt1 });
            }
        }



    }

    _updateInsetLabelPositions() {
        var widthHalf = this.options.width / 2;
        var heightHalf = this.options.height / 2;
        // var autosize = appSettings.Options.label.autoSize;
        // var camera = app.camera2;
        let camera_pos = this._camera.position;
        let target = new Vector3(0, 0, 0);
        let c2t = target.sub(camera_pos);
        let c2l = new Vector3();
        let v = new Vector3();

        // make a list of [label index, distance to camera]
        var idx_dist = [];
        for (let i = 0, l = this.labels.length; i < l; i++) {
            idx_dist.push([i, camera_pos.distanceTo(this.labels[i].pt)]);
        }

        // sort label indexes in descending order of distances
        idx_dist.sort(function (a, b) {
            if (a[1] < b[1]) return 1;
            if (a[1] > b[1]) return -1;
            return 0;
        });

        let label, labelDiv, x, y, dist, fontSize;
        // var minFontSize = appSettings.Options.label.minFontSize;
        for (let i = 0, l = idx_dist.length; i < l; i++) {
            label = this.labels[idx_dist[i][0]];
            labelDiv = label.labelDiv;
            if (c2l.subVectors(label.pt, camera_pos).dot(c2t) > 0) {
                // label is in front
                // calculate label position
                v.copy(label.pt);
                v.project(this._camera);

                x = (v.x * widthHalf) + widthHalf;
                y = -(v.y * heightHalf) + heightHalf;

                // set label position
                labelDiv.style.display = "block";
                labelDiv.style.left = (x - (labelDiv.offsetWidth / 2)) + "px";
                labelDiv.style.top = (y - (labelDiv.offsetHeight / 2)) + "px";
                labelDiv.style.zIndex = i + 1;

            }
            else {
                // label is in back
                labelDiv.style.display = "none";
            }
        }
    }

}