import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { Float32BufferAttribute } from 'three/src/core/BufferAttribute';
import { LineBasicMaterial } from 'three/src/materials/LineBasicMaterial';
import { LineSegments } from 'three/src/objects/LineSegments';
import { Layer } from './Layer';
import { Group } from 'three/src/objects/Group';
import { Vector3 } from 'three/src/math/Vector3';
import { Line } from 'three/src/objects/Line';

export class GridLayer extends Layer {

    constructor(params) {
        super();
        this.type = 'GridLayer';
        this.visible = true;
        this.opacity = 1;
        this.materials = [];
        for (var k in params) {
            this[k] = params[k];
        }
        this.objectGroup = new Group();
        this.labelConnectorGroup = new Group();

        //for labeling
        // this.l = { i: 0, v: 4.99999999998, ht: 3 };//ht:3, ht:1 an der Ebene
        this.labelInfo = { i: 0, v: 100, ht: 3 };//ht:3, ht:1 an der Ebene
        this.labels = [];
        this.scale = 1;
    }

    scaleZ(z) {
        this.objectGroup.scale.z = z;
        this.labelConnectorGroup.scale.z = z;
    }

    setWireframeMode(wireframe) {
        this.materials.forEach(function (mat) {
            //if (m.w) return;
            //m.mat.wireframe = wireframe;
            mat.wireframe = wireframe;
        });
    }

    setVisible(visible) {
        this.visible = visible;
        this.objectGroup.visible = visible;
        this.labelConnectorGroup.visible = visible;
        this.labelParentElement.style.display = (this.objectGroup.visible == true) ? "block" : "none";
        this.emit('visibility-change');
    }

    onRemove(map) {
        this.getScene().remove(this.objectGroup);
    }

    onAdd(map) {
        let divisions = 5;

        let gridXZ = this.build(map.length, divisions, map.y.max, map.width);
        // gridXZ.position.set(this.center.x, this.center.y, this.center.z);

        // size = map.width / 10;
        // let gridYZ = this.build(0, size, map.length / 2, map.width);
        // gridYZ.rotation.z = Math.PI / 2;
        // gridYZ.position.set(this.center.x, this.center.y, this.center.z);

        let gridBottomZ = this.gridBottomZ = -(map.width / 2);
        this.buildY(map.width, divisions, gridBottomZ, map.width);

        this.buildZ(map.height, divisions, map.y.max);

        //waagrechtes grid
        // // let gridXY = this.build(map.length, divisions, 0, map.width);
        // let gridXY = this.build(map.length, divisions, map.center.y, map.width);
        // // gridXY.position.set(this.center.x, this.center.y, this.center.z);
        // gridXY.rotation.x = Math.PI / 2;

        this.buildLabels(divisions);

        this.getScene().add(this.objectGroup);
        this.getScene().add(this.labelConnectorGroup);
    }

    buildZ(size, divisions, constant) {
        let step = size / divisions;
        let vertices = [];

        for (let k = this._map.z.min; k <= this._map.z.max + 1; k = k + step) {
            vertices.push(this._map.x.min, constant, k, this._map.x.max, constant, k);
        }

        let geometry = new BufferGeometry();
        let positions = new Float32BufferAttribute(vertices, 3);
        geometry.setAttribute('position', positions);
        let material = new LineBasicMaterial({
            linewidth: 1,
            color: 0xA0A1A3
        });
        this.materials.push(material);

        //THREE.LineSegments.call(this, geometry, material);
        let lineSegments = new LineSegments(geometry, material);
        this.objectGroup.add(lineSegments);
        return lineSegments;
    }

    buildY(size, divisions, constant) {
        let step =  this._round(size / divisions, 4);
        let vertices = [];

        for (let k = this._map.y.min; k <= this._map.y.max; k = k + step) {
            vertices.push(this._map.x.min, k, constant, this._map.x.max, k, constant)
        }

        let geometry = new BufferGeometry();
        let positions = new Float32BufferAttribute(vertices, 3);
        geometry.setAttribute('position', positions);
        let material = new LineBasicMaterial({
            linewidth: 1,
            color: 0xA0A1A3
        });
        this.materials.push(material);

        //THREE.LineSegments.call(this, geometry, material);
        let lineSegments = new LineSegments(geometry, material);
        this.objectGroup.add(lineSegments);
        return lineSegments;
    }

    build(size, divisions, constant_position, height) {
        let step = size / divisions;
        let vertices = [];

        //for (var i = -size; i <= size; i += step) {
        //    vertices.push(i, position, height, i, position, -height);//senkrecht
        //}

        // for (let k = - halfSize; k <= halfSize; k = k + step) {
        for (let k = this._map.x.min; k <= this._map.x.max; k = k + step) {
            vertices.push(k, constant_position, height / 2, k, constant_position, -height / 2);//senkrecht
            // vertices.push(-halfSize, constant_position, k, halfSize, constant_position, k);//waagrecht 

        }

        // // for (let j = -height; j <= height; j += step) {
        // for (let j = this._map.z.min; j <= this._map.z.max; j += step) {
        //     // vertices.push(-halfSize, constant_position, j, halfSize, constant_position, j);//waagrecht  
        //     vertices.push(this._map.x.min, constant_position, j, this._map.x.max, constant_position, j);//waagrecht   
        // }

        let geometry = new BufferGeometry();
        let positions = new Float32BufferAttribute(vertices, 3);
        geometry.setAttribute('position', positions);
        let material = new LineBasicMaterial({
            linewidth: 1,
            color: 0xA0A1A3
        });
        this.materials.push(material);


        //THREE.LineSegments.call(this, geometry, material);
        let lineSegments = new LineSegments(geometry, material);
        //this.visible = false;
        //this.geometry.visible = this.visible;

        this.objectGroup.add(lineSegments);
        return lineSegments;
    }

    _round(value, decimals) {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }

    buildLabels(divisions = 5) {
        let size = this._map.length;
        let step = size / divisions;
        // this.parent = parent;
        // this.parentElement = parentElement;
        let labels = new Array();

        // for (let k = - halfSize; k <= halfSize; k = k + step) {
        for (let k = this._map.x.min; k <= this._map.x.max; k = k + step) {
            let xCoordinate = (k % 1 != 0) ? this._round(k, 2) : k;
            let info = { a: xCoordinate, size: step, axis: "x", color: 0xff0000, cl: "red-label", h: 0.6, centroid: [[k, this._map.y.max, this._map.width / 2]] };
            labels.push(info);
        }

        let ySize = this._map.width;
        let yStep =  this._round(ySize / divisions, 4);
        for (let k = this._map.y.min; k <= this._map.y.max; k = k + yStep) {
            let yCoordinate = (k % 1 != 0) ? this._round(k, 2) : k;
            let info = { a: yCoordinate, size: yStep, axis: "y", color: 0x3ad29f, cl: "green-label", h: 0.6, centroid: [[this._map.x.min, k, this.gridBottomZ]] };
            labels.push(info);
        }

        let zSize = this._map.height;
        let zStep = zSize / divisions;
        for (let k = this._map.z.min; k <= this._map.z.max + 1; k = k + zStep) {
            // vertices.push(this._map.x.min, constant, k, this._map.x.max, constant, k);
            let zCoordinate = (k % 1 != 0) ? this._round(k, 2) : k;
            let info = { a: zCoordinate, size: yStep, axis: "z", color: 0x6b716f, cl: "grey-label", h: 0.6, centroid: [[this._map.x.min, this._map.y.max, k]] };
            labels.push(info);
        }

       
        var getCentroidFunc = function (f) { return f.centroid; };

        // Layer must belong to a project
        let labelInfo = this.labelInfo;
        if (labelInfo === undefined || getCentroidFunc === undefined) return;

        this.labelConnectorGroup.userData.layerId = this.index;
        // if (parent) {
        //     parent.add(this.labelConnectorGroup);
        // }
        // this.getScene().add(this.labelConnectorGroup);
        this.labelConnectorGroup.visible = this.objectGroup.visible;

        // create parent element for labels
        this.labelParentElement = document.createElement("div");
        this._map.container.appendChild(this.labelParentElement);
        this.labelParentElement.style.display = (this.objectGroup.visible) ? "block" : "none";

        for (let i = 0, l = labels.length; i < l; i++) {
            let f = labels[i];
            f.aElems = [];
            f.aObjs = [];
            let text = f.a;
            if (text === null || text === "") continue;

            let classLabel = f.cl;
            if (classLabel === undefined || classLabel === "") classLabel = "label";

            let horizontalShiftLabel = f.hs;
            if (horizontalShiftLabel === undefined || horizontalShiftLabel === "") horizontalShiftLabel = 0;

            // let line_mat = new LineBasicMaterial({ color: Gba3D.Options.label.connectorColor });
            let line_mat = new LineBasicMaterial({
                linewidth: 1,
                color: f.color //0x80CCFF
            });

            let pts = getCentroidFunc(f);
            for (let j = 0, m = pts.length; j < m; j++) {
                let pt = pts[j];

                // create div element for label
                let e = document.createElement("div");
                e.appendChild(document.createTextNode(text));
                e.className = classLabel;// "label";
                this.labelParentElement.appendChild(e);

                let pt0, pt1;
                if (f.axis == "x") {
                    pt0 = new Vector3(pt[0], pt[1], pt[2]);    // bottom
                    pt1 = new Vector3(pt[0] + horizontalShiftLabel, pt[1], pt[2] + f.size / 2);    // top    
                }
                else if (f.axis == "y") {
                    pt0 = new Vector3(pt[0], pt[1], pt[2]);
                    pt1 = new Vector3(pt[0] - horizontalShiftLabel - f.size, pt[1], pt[2]);
                } else if (f.axis == "z") {
                    pt0 = new Vector3(pt[0], pt[1], pt[2]);
                    pt1 = new Vector3(pt[0] - horizontalShiftLabel - f.size, pt[1], pt[2]);
                }

                let step = size / divisions;
                let vertices = [];
                vertices.push(pt1, pt0);
                let geom = new BufferGeometry().setFromPoints(vertices);

                let line = new Line(geom, line_mat);
                // line.position.set(this.center.x, this.center.y, this.center.z);

                line.userData.layerId = this.index;
                line.userData.featureId = i;
                this.labelConnectorGroup.add(line);
                // }

                f.aElems.push(e);
                ////f.labelDiv = e;
                f.aObjs.push(line);
                this.labels.push({ labelDiv: e, obj: line, pt: pt1 });
            }
        }

    }

    animate() {
        this._updateLabelPosition();
    }

    // update label position
    _updateLabelPosition() {
        if (this.labels.length === 0 || this.objectGroup.visible === false) return;

        let container = document.getElementById("webgl");
        // let widthHalf = 0.5 * container.clientWidth;
        // let heightHalf = 0.5 * container.clientHeight;


        // autosize = appSettings.Options.label.autoSize,
        let autosize = true;
        let camera = this._map.camera;
        let camera_pos = camera.position;
        let c2t = this._map.center.clone().sub(camera_pos);
        let c2l = new Vector3();

        //neu
        // app.labels = app.controls.gridlayer.labels;
        // let scaleFactor = this.scale;       

        // make a list of [label index, distance to camera]
        let idx_dist = [];
        for (var i = 0, l = this.labels.length; i < l; i++) {
            // let firstLinePoint = this.labels[i].obj.geometry.vertices[0];
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

                // // calculate label position
                // vector.copy(label.pt);
                // vector.applyMatrix4(label.obj.matrixWorld);
                // // map to normalized device coordinate (NDC) space
                // camera.updateMatrixWorld();
                // vector.project(camera);
                // if (scaleFactor > 1) {
                //     v.z = v.z * scaleFactor;
                // }
                // vector.x = (vector.x * widthHalf) + widthHalf;
                // vector.y = - (vector.y * heightHalf) + heightHalf;

                let proj = this.toScreenPosition(label.obj, label.pt, camera);
                // set label position
                labelDiv.style.display = "block";                
                labelDiv.style.left = (proj.x - (labelDiv.offsetWidth / 2)) + "px";
                labelDiv.style.top = (proj.y - (labelDiv.offsetHeight / 2)) + "px";
                labelDiv.style.zIndex = i + 1;
                let minFontSize = 10;
                // set font size
                if (autosize) {
                    dist = idx_dist[i][1];
                    if (dist < 12) dist = 12;
                    fontSize = Math.max(Math.round(1000 / dist), minFontSize);
                    labelDiv.style.fontSize = fontSize + "px";
                }
            } else {
                // label is in back
                labelDiv.style.display = "none";
            }
        }
    }

    toScreenPosition(obj, pt, camera) {
        let vector = new Vector3();
        // calculate label position
        vector.copy(pt);
        let scaleFactor = parseFloat(this.labelConnectorGroup.scale.z);
        if (scaleFactor > 1) {
            vector.z = vector.z * scaleFactor;
        }

        // TODO: need to update this when resize window   
        let container = this._map.container; //document.getElementById("webgl");
        let widthHalf = 0.5 * container.clientWidth;
        let heightHalf = 0.5 * container.clientHeight;

        // obj.updateMatrixWorld();        
        // vector.applyMatrix4(obj.matrixWorld);
        vector.project(camera);

        vector.x = (vector.x * widthHalf) + widthHalf;
        vector.y = - (vector.y * heightHalf) + heightHalf;
       
        return {
            x: vector.x,
            y: vector.y
        };

    }

}