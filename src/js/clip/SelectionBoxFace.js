import { Mesh } from 'three/src/objects/Mesh';

export class SelectionBoxFace {

    constructor(axis, v0, v1, v2, v3, selection) {

        let frontFaceGeometry = new PlaneGeometry(v0, v1, v2, v3);
        frontFaceGeometry.dynamic = true;
        selection.meshGeometries.push(frontFaceGeometry);

        let frontFaceMesh = new Mesh(frontFaceGeometry, MATERIAL.Invisible);
        frontFaceMesh.axis = axis;
        frontFaceMesh.guardian = this;
        selection.touchMeshes.add(frontFaceMesh);
        selection.selectables.push(frontFaceMesh);

        let backFaceGeometry = new PlaneGeometry(v3, v2, v1, v0);
        backFaceGeometry.dynamic = true;
        selection.meshGeometries.push(backFaceGeometry);

        let backFaceMesh = new Mesh(backFaceGeometry, MATERIAL.BoxBackFace);
        selection.displayMeshes.add(backFaceMesh);

        this.lines = new Array();

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