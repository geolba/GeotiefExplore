import { LineSegments } from 'three/src/objects/LineSegments';
import * as material from './material';
import { BufferGeometry } from 'three/src/core/BufferGeometry';

export class SelectionBoxLine {

    constructor(v0, v1, f0, f1, selection) {
        // var lineGeometry = new Geometry();
        // lineGeometry.vertices.push(v0, v1);
        // lineGeometry.computeLineDistances();
        // lineGeometry.dynamic = true;       

        let vertices = this.vertices = [v0, v1];
        let lineGeometry = this.lineGeometry = new BufferGeometry().setFromPoints(vertices);
        selection.lineGeometries.push(lineGeometry);
        lineGeometry.attributes.position.needsUpdate = true;

        this.line = new LineSegments(lineGeometry, material.BoxWireframe);
        selection.displayMeshes.add(this.line);

        f0.lines.push(this);
        f1.lines.push(this);
    }

    update() {
        this.lineGeometry.setFromPoints(this.vertices);
        this.lineGeometry.attributes.position.needsUpdate = true;
        this.lineGeometry.computeBoundingSphere();
    }

    setHighlight(b) {
        this.line.material = b ? material.BoxWireActive : material.BoxWireframe;
    }
}