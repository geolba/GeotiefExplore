import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { Uint16BufferAttribute } from 'three/src/core/BufferAttribute';
import { Vector3 } from 'three/src/math/Vector3';
import { Float32BufferAttribute } from 'three/src/core/BufferAttribute';
import { eventMixin } from '../core/eventMixin';
import { Plane } from 'three/src/math/Plane';

class UpdatableBoxGeometry extends BufferGeometry {

    vertices: Array<Vector3>;
    indexArray: Array<number>;
    uvs: Array<number>;
    groupStart: number;
    clipPlanes: Array<Plane>;

    constructor(vertices: Array<Vector3>) {
        // call parent constructor
        super();

        this.clipPlanes = [new Plane(new Vector3(0, 1, 0))];

        this.type = 'UpdatableBoxGeometry';
        this.indexArray = new Array();
        this.vertices = new Array();
        this.uvs = [];

        // helper variables for material index 
        this.groupStart = 0;

        this.buildPlane(0, vertices[0], vertices[1], vertices[5], vertices[4], 0); //y1 south 0 1 2 3
        this.buildPlane(4, vertices[0], vertices[2], vertices[3], vertices[1], 1); //z1 bottom 4 5 6 7
        this.buildPlane(8, vertices[0], vertices[4], vertices[6], vertices[2], 2); //x1 east 8 9 10 11
        this.buildPlane(12, vertices[7], vertices[5], vertices[1], vertices[3], 3); //x2 west 12 13 14 15
        this.buildPlane(16, vertices[7], vertices[3], vertices[2], vertices[6], 4); //y2 nort 15 16 17 18
        this.buildPlane(20, vertices[7], vertices[6], vertices[4], vertices[5], 5); //z2
        this.setFromPoints(this.vertices);

        let indices = new Uint16BufferAttribute(this.indexArray, 1);//.setDynamic(true);
        this.setIndex(indices);

        this.computeVertexNormals();
        this.setAttribute('uv', new Float32BufferAttribute(this.uvs, 2));
    }

    buildPlane(i, v0, v1, v2, v3, materialIndex) {
        let groupCount = 0;

        this.vertices.push(v0, v1, v2, v3);
        this.indexArray.push(i, i + 1, i + 2, i, i + 2, i + 3);
        // let indexArray = [0, 1, 2, 0, 2, 3];
        groupCount += 6;

        if (materialIndex == 2) { // east
            this.uvs.push(1, 0, 1, 1, 0, 1, 0, 0);
        } else if (materialIndex == 3) { //west
            this.uvs.push(1, 1, 0, 1, 0, 0, 1, 0);
        } else if (materialIndex == 4) { //north
            this.uvs.push(0, 1, 0, 0, 1, 0, 1, 1);
        } else if (materialIndex == 5) { //top
            this.uvs.push(1, 1, 0, 1, 0, 0, 1, 0);
        } else {
            this.uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
        }

        // add a group to the geometry. this will ensure multi material support
        this.addGroup(this.groupStart, groupCount, materialIndex);

        // calculate new start value for groups
        this.groupStart += groupCount;
    }

    update() {
        this.setFromPoints(this.vertices);
        this.attributes.position.needsUpdate = true;
        this.computeBoundingBox();
        this.computeBoundingSphere();
        this.dispatchEvent({ type: 'update', message: "example" } );
    }

    clippingPlanes() {
        const a = this.gVect(0);
        const b = this.gVect(1);
        const c = this.gVect(2);
        this.clipPlanes[0] = new Plane(new Vector3(0, -1, 0), a.y);
        // this.clipPlanes[0]= new Plane(new Vector3(-1, 0, 0), a.x);


        return this.clipPlanes[0];
    }

    // grab position from geometry
    private gVect(idx) {
        return new Vector3().fromBufferAttribute(this.attributes.position, idx);
    }

}
// Add the mixin with event-related methods
// Object.assign(UpdatableBoxGeometry.prototype, eventMixin);

export { UpdatableBoxGeometry };