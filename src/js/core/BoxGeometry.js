import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { Float32BufferAttribute } from 'three/src/core/BufferAttribute';
import { Vector3 } from 'three/src/math/Vector3';

class BoxGeometry extends BufferGeometry {

    constructor(width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1) {

        super();
        this.type = 'BoxGeometry';
        this.parameters = {
            width: width,
            height: height,
            depth: depth,
            widthSegments: widthSegments,
            heightSegments: heightSegments,
            depthSegments: depthSegments
        };
        // const scope = this;

        // segments
        widthSegments = Math.floor(widthSegments);
        heightSegments = Math.floor(heightSegments);
        depthSegments = Math.floor(depthSegments);

        // buffers
        const indices = this.indices = [];
        const vertices = this.vertices = [];
        const normals = this.normals = [];
        const uvs = this.uvs = [];

        // helper variables
        this.numberOfVertices = 0;
        this.groupStart = 0;

        // build each side of the box geometry
        let east = this.buildPlane('z', 'y', 'x', - 1, - 1, depth, height, width, depthSegments, heightSegments, 0); // px
        // let east = this.buildPlane('z', 'y', 'x', + 1, + 1, depth, height, width, depthSegments, heightSegments, 0); // px
        let west = this.buildPlane('z', 'y', 'x', 1, - 1, depth, height, - width, depthSegments, heightSegments, 1); // nx        
        let north = this.buildPlane('x', 'z', 'y', 1, 1, width, depth, height, widthSegments, depthSegments, 2); // py
        let south = this.buildPlane('x', 'z', 'y', 1, - 1, width, depth, - height, widthSegments, depthSegments, 3); // ny
        let top = this.buildPlane('x', 'y', 'z', 1, - 1, width, height, depth, widthSegments, heightSegments, 4); // pz
        let bottom = this.buildPlane('x', 'y', 'z', - 1, - 1, width, height, - depth, widthSegments, heightSegments, 5); // nz

        // build geometry
        this.setIndex(indices);
        this.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        this.setAttribute('normal', new Float32BufferAttribute(normals, 3));
        this.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
    }

    buildPlane(u, v, w, udir, vdir, width, height, depth, gridX, gridY, materialIndex) {
        const segmentWidth = width / gridX;
        const segmentHeight = height / gridY;

        const widthHalf = width / 2;
        const heightHalf = height / 2;
        const depthHalf = depth / 2;

        const gridX1 = gridX + 1;
        const gridY1 = gridY + 1;

        let vertexCounter = 0;
        let groupCount = 0;

        let vector = new Vector3();
        // generate vertices, normals and uvs
        for (let iy = 0; iy < gridY1; iy++) {
            let y = iy * segmentHeight - heightHalf;
            for (let ix = 0; ix < gridX1; ix++) {
                let x = ix * segmentWidth - widthHalf;

                // set values to correct vector component
                vector[u] = x * udir;
                vector[v] = y * vdir;
                vector[w] = depthHalf;

                // now apply vector to vertex buffer
                this.vertices.push(vector.x, vector.y, vector.z);

                // set values to correct vector component
                vector[u] = 0;
                vector[v] = 0;
                vector[w] = depth > 0 ? 1 : - 1;

                // now apply vector to normal buffer
                this.normals.push(vector.x, vector.y, vector.z);

                // uvs
                this.uvs.push(ix / gridX);
                this.uvs.push(1 - (iy / gridY));

                // counters
                vertexCounter += 1;
            }

        }

        // indices

        // 1. you need three indices to draw a single face
        // 2. a single segment consists of two faces
        // 3. so we need to generate six (2*3) indices per segment
        for (let iy = 0; iy < gridY; iy++) {
            for (let ix = 0; ix < gridX; ix++) {
                const a = this.numberOfVertices + ix + gridX1 * iy;
                const b = this.numberOfVertices + ix + gridX1 * (iy + 1);
                const c = this.numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
                const d = this.numberOfVertices + (ix + 1) + gridX1 * iy;

                // faces
                this.indices.push(b, c, d);
                this.indices.push(a, b, d);
             
               
               
                // increase counter
                groupCount += 6;
            }
        }

        // add a group to the geometry. this will ensure multi material support
        this.addGroup(this.groupStart, groupCount, materialIndex);

        // calculate new start value for groups
        this.groupStart += groupCount;

        // update total number of vertices
        this.numberOfVertices += vertexCounter;

        return materialIndex;
    }

}

export { BoxGeometry, BoxGeometry as BoxBufferGeometry };