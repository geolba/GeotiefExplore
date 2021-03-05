import { BoxGeometry } from 'three/src/geometries/BoxGeometry';
import { Mesh } from 'three/src/objects/Mesh';
import * as material from './material';
import { Vector3 } from 'three/src/math/Vector3';
import { Object3D } from 'three/src/core/Object3D';
import { uniforms } from "./uniforms";
import { SelectionBoxFace } from './SelectionBoxFace';
import { SelectionBoxLine } from './SelectionBoxLine';
import { Layer } from '../layer/Layer';

export class Selection extends Layer {
    limitLow;
    limitHigh;
    box;
    boxMesh;
    vertices;
    touchMeshes; displayMeshes; meshGeometries; selectables;
    faces;
    map;
    scale;

    constructor(parameters, low, high) {
        super();
        this.type = 'Selection';
        this.visible = true;
        this.opacity = 1;
        for (var k in parameters) {
            this[k] = parameters[k];
        }
        this.limitLow = low;
        this.limitHigh = high;
        this.limit = {
            x1: low.x,
            y1: low.y,
            x2: high.x,
            y2: high.y
        }
        this.scale = 1;

        this.box = new BoxGeometry(1, 1, 1);
        this.boxMesh = new Mesh(this.box, material.capMaterial);

        this.vertices = [
            new Vector3(), new Vector3(),
            new Vector3(), new Vector3(),
            new Vector3(), new Vector3(),
            new Vector3(), new Vector3()
        ];
        this.updateVertices();

        let v = this.vertices;

        this.touchMeshes = new Object3D();
        this.displayMeshes = new Object3D();
        this.meshGeometries = [];
        this.lineGeometries = [];
        this.selectables = [];

        this.faces = [];
        var f = this.faces;
        this.faces.push(new SelectionBoxFace('y1', v[0], v[1], v[5], v[4], this));
        this.faces.push(new SelectionBoxFace('z1', v[0], v[2], v[3], v[1], this));
        this.faces.push(new SelectionBoxFace('x1', v[0], v[4], v[6], v[2], this));
        this.faces.push(new SelectionBoxFace('x2', v[7], v[5], v[1], v[3], this));
        this.faces.push(new SelectionBoxFace('y2', v[7], v[3], v[2], v[6], this));
        this.faces.push(new SelectionBoxFace('z2', v[7], v[6], v[4], v[5], this));

        this.boxLines = [];
        this.boxLines.push(new SelectionBoxLine(v[0], v[1], f[0], f[1], this));
        this.boxLines.push(new SelectionBoxLine(v[0], v[2], f[1], f[2], this));
        this.boxLines.push(new SelectionBoxLine(v[0], v[4], f[0], f[2], this));
        this.boxLines.push(new SelectionBoxLine(v[1], v[3], f[1], f[3], this));
        this.boxLines.push(new SelectionBoxLine(v[1], v[5], f[0], f[3], this));
        this.boxLines.push(new SelectionBoxLine(v[2], v[3], f[1], f[4], this));
        this.boxLines.push(new SelectionBoxLine(v[2], v[6], f[2], f[4], this));
        this.boxLines.push(new SelectionBoxLine(v[3], v[7], f[3], f[4], this));
        this.boxLines.push(new SelectionBoxLine(v[4], v[5], f[0], f[5], this));
        this.boxLines.push(new SelectionBoxLine(v[4], v[6], f[2], f[5], this));
        this.boxLines.push(new SelectionBoxLine(v[5], v[7], f[3], f[5], this));
        this.boxLines.push(new SelectionBoxLine(v[6], v[7], f[4], f[5], this));

        this.setBox();
        // this.setUniforms();
    }

    onAdd(map) {
        this.map = map;
        this.build(this.getScene());
        //this.update();
        this.emit('add');
    }

    build(app_scene) {
        // app_scene.add(this.boxMesh);
        app_scene.add(this.displayMeshes);
        app_scene.add(this.touchMeshes);
    }

    setWireframeMode(wireframe) {
        return;
    }

    setVisible(visible) {
        this.visible = visible;
        this.boxMesh.visible = visible;
        this.displayMeshes.visible = visible;
        this.touchMeshes.visible = visible;
        this.emit('visibility-change');
    }

    scaleZ(z) {
        this.scale = z;
        // this.boxMesh.scale.z = z;
        // this.displayMeshes.scale.z = z;
        // this.touchMeshes.scale.z = z;
    }

    updateVertices() {
        this.vertices[0].set(this.limitLow.x, this.limitLow.y, this.limitLow.z);
        this.vertices[1].set(this.limitHigh.x, this.limitLow.y, this.limitLow.z);
        this.vertices[2].set(this.limitLow.x, this.limitHigh.y, this.limitLow.z);
        this.vertices[3].set(this.limitHigh.x, this.limitHigh.y, this.limitLow.z);
        this.vertices[4].set(this.limitLow.x, this.limitLow.y, this.limitHigh.z);
        this.vertices[5].set(this.limitHigh.x, this.limitLow.y, this.limitHigh.z);
        this.vertices[6].set(this.limitLow.x, this.limitHigh.y, this.limitHigh.z);
        this.vertices[7].set(this.limitHigh.x, this.limitHigh.y, this.limitHigh.z);
    }

    updateGeometries() {
        // for (var i = 0; i < this.meshGeometries.length; i++) {
        //     // this.meshGeometries[i].verticesNeedUpdate = true;
        //     // this.meshGeometries[i].getAttribute('position').needsUpdate = true;
        //     this.meshGeometries[i].attributes.position.needsUpdate = true;
        //     this.meshGeometries[i].index.needsUpdate = true;
        //     this.meshGeometries[i].computeBoundingSphere();
        //     this.meshGeometries[i].computeBoundingBox();
        // }
        for (let i = 0; i < this.faces.length; i++) {
            this.faces[i].update();
        }

        // for (var i = 0; i < this.lineGeometries.length; i++) {
        //     // this.lineGeometries[i].verticesNeedUpdate = true;
        //     // this.meshGeometries[i].getAttribute('position').needsUpdate = true;
        //     this.lineGeometries[i].attributes.position.needsUpdate = true;
        //     this.lineGeometries[i].index.needsUpdate = true;
        //     this.lineGeometries[i].computeBoundingSphere();
        //     this.lineGeometries[i].computeBoundingBox();
        // }
        for (let i = 0; i < this.boxLines.length; i++) {
            this.boxLines[i].update();
        }
    }

    setBox() {
        let width = new Vector3();
        width.subVectors(this.limitHigh, this.limitLow);
        this.boxMesh.scale.copy(width);           
        width.multiplyScalar(0.5).add(this.limitLow);
        this.boxMesh.position.copy(width);
    }

    setUniforms() {
        let unif = uniforms.clipping;
        unif.clippingLow.value.copy(this.limitLow);
        unif.clippingHigh.value.copy(this.limitHigh);

        if (this.map.layers) {
            for (const [key, layer] of Object.entries(this.map.layers)) {
                if (layer.uniforms) {
                    layer.uniforms.clipping.clippingLow.value.copy(this.limitLow);
                    layer.uniforms.clipping.clippingHigh.value.copy(this.limitHigh);
                }
            }
        }
    }

    setValue(axis, value) {
        let buffer = 1000;
        let limit = 14000;

        if (axis === 'x1') {
            // this.limitLow.x = Math.max(-limit, Math.min(this.limitHigh.x - buffer, value));            
            this.limitLow.x = Math.max(this.limit.x1, Math.min(this.limitHigh.x - buffer, value));
        } else if (axis === 'x2') {
            // this.limitHigh.x = Math.max(this.limitLow.x + buffer, Math.min(limit, value));            
            this.limitHigh.x = Math.max(this.limitLow.x + buffer, Math.min(this.limit.x2, value));
        } else if (axis === 'y1') {
            // this.limitLow.y = Math.max(-limit, Math.min(this.limitHigh.y - buffer, value));           
            this.limitLow.y = Math.max(this.limit.y1, Math.min(this.limitHigh.y - buffer, value));
        } else if (axis === 'y2') {
            // this.limitHigh.y = Math.max(this.limitLow.y + buffer, Math.min(limit, value));          
            this.limitHigh.y = Math.max(this.limitLow.y + buffer, Math.min(this.limit.y2, value));
        } else if (axis === 'z1') {
            this.limitLow.z = Math.max(-limit, Math.min(this.limitHigh.z - buffer, value));
        } else if (axis === 'z2') {
            this.limitHigh.z = Math.max(this.limitLow.z + buffer, Math.min(limit, value));
        }

        this.setBox();
        this.setUniforms();

        this.updateVertices();
        this.updateGeometries();
    }
}