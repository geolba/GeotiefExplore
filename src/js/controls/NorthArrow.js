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
// import { BoxGeometry } from 'three/src/geometries/BoxGeometry';
// import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
// import { Mesh } from 'three/src/objects/Mesh';

import './NorthArrow.css';

export class NorthArrow extends Control {

    renderer;
    _mainMap;
    _scene;
    _camera;
    _center;
    objectGroup;
    labels = [];
    options = {
        position: 'bottomleft',
        width: 100,
        height: 100,
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
        renderer.setSize(this.options.width, this.options.height);       
        container.appendChild(renderer.domElement);

        this._scene = new Scene();
        this._camera = new PerspectiveCamera(30, this.options.width / this.options.height, 0.1, 10000);  
        this._camera.lookAt(map.center);
        const camDirection = new Vector3(-0.5, -Math.SQRT1_2, 0.5);
        // const camDirection = new Vector3(0, 0, 1);
        const camOffset = camDirection.multiplyScalar(map.size * 2);
        this._camera.position.copy(map.center);
        this._camera.position.add(camOffset); 
        this._camera.lookAt(map.center);
        this._camera.up = this._map.camera.up;
        this._camera.updateProjectionMatrix();

        this._createArrow(this._scene);
        this._buildLabels();

        // this.geometry = new BoxGeometry(10000, 10000, 10000);
        // this.material = new MeshBasicMaterial({
        //     color: 800080
        // });
        // this.materials = [];
        // this.materials.push(this.material);
        // this.mesh = new Mesh(this.geometry, this.material);
        // this.mesh.position.set(map.center.x, map.center.y, map.center.z);
        // this._scene.add(this.mesh);

        return container;
    }

    animate() {
        // this._camera.position.copy(this._map.camera.position);
        // // this._camera.position.normalize().multiplyScalar(100);
        // // this._camera.position.setLength(this.oldLength);
        // // this._camera.up = this._map.camera.up; 
        // this._camera.lookAt(this._map.center);

        this._camera.position.copy(this._map.camera.position);
        this._camera.position.sub(this._map.target);
        this._camera.position.setLength(35);
        this._camera.lookAt(this._scene.position);

        // this._camera.near =10;
        // this._camera.far = 1000 * 25;
        // this._camera.lookAt(this._map.center);
        // this._camera.updateProjectionMatrix();

        this.renderer.render(this._scene, this._camera);
        this._updateInsetLabelPositions();
    }

    _createArrow(app_scene, size = 6) {
        let from = new Vector3(0, 0, 0);
        let headLength = this.options.headLength;//1;
        let headWidth = 1;//this.options.headWidth;//1;

        let xTo = new Vector3(1, 0, 0);
        // let xTo = new Vector3(from.x + 1, from.y, from.z);
        // let xDirection = xTo.clone().sub(from);
        //(this.objectGroup.add(new ArrowHelper(xTo, from, this._map.size * 0.5, 0xf00000, headLength, headWidth)); // Red = x
        this.objectGroup.add(new ArrowHelper(xTo, from, size, 0xff0000, headLength, headWidth)); // Red = x

        let yTo = new Vector3(0, -1, 0);
        // let yTo = new Vector3(from.x, from.y + 1, from.z);
        // let yDirection = yTo.clone().sub(from);
        this.objectGroup.add(new ArrowHelper(yTo, from, size, 0x3ad29f, headLength, headWidth)); // Green = y

        let zTo = new Vector3(0, 0, 1);//blue z
        // let zTo = new Vector3(from.x, from.y, from.z + 1);
        // let zDirection = zTo.clone().sub(from);
        this.objectGroup.add(new ArrowHelper(zTo, from, size, 0x6b716f, headLength, headWidth)); //8 is the length,  Gray = z; 20 and 10 are head length and width

        if (app_scene) {
            app_scene.add(this.objectGroup);
        }
    }

    _buildLabels() {

        let f = [
            { a: ["x"], cl: "red-label", centroid: [[8, 0, 0]] },
            { a: ["y"], cl: "green-label", centroid: [[0, -8, 0]] },
            { a: ["z"], cl: "gray-label", centroid: [[0, 0, 8]] }
        ];

        let getPointsFunc = function (f) { return f.centroid; };


        // create parent element for labels
        var e = document.createElement("div");
        this._container.appendChild(e);
        e.style.display = (this.objectGroup.visible) ? "block" : "none";
        let labelParentElement = this.labelParentElement = e; //lable parent div for this layer

        for (let i = 0, l = f.length; i < l; i++) {
            let labelInfo = f[i];
            // labelInfo.aElems = [];
            // labelInfo.aObjs = [];
            let text = labelInfo.a[0];
            if (text === null || text === "") continue;

            let classLabel = labelInfo.cl;
            if (classLabel === undefined || classLabel === "") classLabel = "label";

            let pts = getPointsFunc(labelInfo);
            for (let j = 0, m = pts.length; j < m; j++) {
                let pt = pts[j];

                // create div element for label
                let e = document.createElement("div");
                e.appendChild(document.createTextNode(text));
                e.className = classLabel;// "label";
                labelParentElement.appendChild(e);

                let pt1 = new Vector3(pt[0], pt[1], pt[2]);    // top

                this.labels.push({ labelDiv: e, pt: pt1 });
            }
        }



    }

    _updateInsetLabelPositions() {
        let widthHalf = this.options.width / 2;
        let heightHalf = this.options.height / 2;
        // var autosize = appSettings.Options.label.autoSize;
      
        let camera_pos = this._camera.position;
        let target = new Vector3(0, 0, 0);
        let c2t = target.sub(camera_pos);
        let c2l = new Vector3();
        let v = new Vector3();

        // make a list of [label index, distance to camera]
        let idx_dist = [];
        for (let i = 0, l = this.labels.length; i < l; i++) {
            idx_dist.push([i, camera_pos.distanceTo(this.labels[i].pt)]);
        }

        // sort label indexes in descending order of distances
        idx_dist.sort(function (a, b) {
            if (a[1] < b[1]) return 1;
            if (a[1] > b[1]) return -1;
            return 0;
        });

        let label, labelDiv, x, y;
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