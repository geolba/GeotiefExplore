import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { Uint16BufferAttribute } from 'three/src/core/BufferAttribute';
import { Vector3 } from 'three/src/math/Vector3';


class UpdatableBoxGeometry extends BufferGeometry {

    faces;
    vertices: Array<Vector3>;
    indexArray: Array<number>;

    constructor(vertices: Array<Vector3>) {   
        super();   
        
        this.indexArray = new Array();
        this.vertices = new Array();
        this.buildPlane(0, vertices[0], vertices[1], vertices[5], vertices[4]); //y1
        this.buildPlane(4, vertices[0], vertices[2], vertices[3], vertices[1]); //z1
        this.buildPlane(8, vertices[0], vertices[4], vertices[6], vertices[2]); //x1
        this.buildPlane(12, vertices[7], vertices[5], vertices[1], vertices[3]); //x2
        this.buildPlane(16, vertices[7], vertices[3], vertices[2], vertices[6]); //y2
        this.buildPlane(20, vertices[7], vertices[6], vertices[4], vertices[5]); //z2
        this.setFromPoints(this.vertices);

        let indices = new Uint16BufferAttribute(this.indexArray, 1);//.setDynamic(true);
        this.setIndex(indices);

        this.computeVertexNormals();
    }

    buildPlane(i, v0, v1, v2, v3) {
        // let frontFaceGeometry =  new PlaneGeometry(v0, v1, v2, v3);       
        // let frontFaceMesh = new Mesh(frontFaceGeometry, material.Invisible);
        // frontFaceMesh.axis = axis;
        this.vertices.push(v0, v1, v2, v3);

        this.indexArray.push(i, i +1, i + 2, i, i +2, i+3);
        // let indexArray = [0, 1, 2, 0, 2, 3];
    }

    update() {
        this.setFromPoints(this.vertices);
        this.attributes.position.needsUpdate = true;
        this.computeBoundingSphere();
    }

}

export { UpdatableBoxGeometry };