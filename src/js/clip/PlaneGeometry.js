import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { Uint16BufferAttribute } from 'three/src/core/BufferAttribute';

export class PlaneGeometry extends BufferGeometry {

    vertices = [];

    constructor(v0, v1, v2, v3) {
        super();
        this.vertices.push(v0, v1, v2, v3);
        this.setFromPoints(this.vertices);

        let indexArray = [0, 1, 2, 0, 2, 3];
        let indices = new Uint16BufferAttribute(indexArray, 1);//.setDynamic(true);
        this.setIndex(indices);

        this.computeVertexNormals();

    }
    update() {
        this.setFromPoints(this.vertices);
        this.attributes.position.needsUpdate = true;
        this.computeBoundingSphere();
    }
}