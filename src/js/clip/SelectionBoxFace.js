import { Mesh } from 'three/src/objects/Mesh';
import { PlaneGeometry } from './PlaneGeometry';
import * as material from './material';

export class SelectionBoxFace {

    constructor(axis, v0, v1, v2, v3, selection) {

        let frontFaceGeometry = this.fontFaceGeometry = new PlaneGeometry(v0, v1, v2, v3);
        // frontFaceGeometry.dynamic = true;
        selection.meshGeometries.push(frontFaceGeometry);

        let frontFaceMesh = new Mesh(frontFaceGeometry, material.Invisible);
        frontFaceMesh.axis = axis;
        frontFaceMesh.guardian = this;
        selection.touchMeshes.add(frontFaceMesh);
        selection.selectables.push(frontFaceMesh);

        let backFaceGeometry = this.backFaceGeometry = new PlaneGeometry(v3, v2, v1, v0);
        // backFaceGeometry.dynamic = true;
        selection.meshGeometries.push(backFaceGeometry);

        let backFaceMesh = new Mesh(backFaceGeometry, material.BoxBackFace);
        selection.displayMeshes.add(backFaceMesh);

        this.lines = new Array();
    }

    update() {
        this.fontFaceGeometry.update();
        this.backFaceGeometry.update();
    }

    rayOver() {
        this.highlightLines(true);
    }

    rayOut() {
        this.highlightLines(false);
    }

    highlightLines(b) {
        for (let i = 0; i < this.lines.length; i++) {
            this.lines[i].setHighlight(b);
        }
    }

}
