// import { Group } from 'three/src/objects/Group';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { Float32BufferAttribute, Uint16BufferAttribute } from 'three/src/core/BufferAttribute';
import { MeshStandardMaterial } from 'three/src/materials/MeshStandardMaterial';
import { DoubleSide } from 'three/src/constants';
import { Mesh } from 'three/src/objects/Mesh';
import { Layer } from './Layer';
import { BitStream } from '../lib/bitstream';
import { Plane } from 'three/src/math/Plane';
import { Vector3 } from 'three/src/math/Vector3';
import * as material from '../clip/material';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { uniforms } from "../clip/uniforms";
import { shader } from '../clip/shader';
import { Color } from 'three/src/math/Color';

const POINTURL = 'https://geusegdi01.geus.dk/geom3d/data/nodes/';
const EDGEURL = 'https://geusegdi01.geus.dk/geom3d/data/triangles/';

class TinLayer extends Layer {



    constructor(params) {
        super();

        //this.features = [];        
        this.visible = true;
        this.opacity = 1;
        this.materialParameter = [];
        this.materialsArray = [];
        for (var k in params) {
            this[k] = params[k];
        }

        // this.objectGroup = new Group();
        this.queryableObjects = [];
        this.borderVisible = false;
    }

    setWireframeMode(wireframe) {
        this.materialsArray.forEach(function (mat) {
            //if (m.w) return;
            //m.mat.wireframe = wireframe;
            mat.wireframe = wireframe;
        });
    }

    setVisible(visible) {
        this.visible = visible;
        this.mainMesh.visible = visible;
        this.emit('visibility-change');
    }

    scaleZ(z) {
        this.mainMesh.scale.z = z;
        //this.objectGroup.scale.z = z;
    }

    async onAdd(map) {
        await this.build(this.getScene());
        map.update();
    }

    //build BufferGeometry with Index
    async build(app_scene) {

        let geometry = new BufferGeometry();
        // let positions = new Float32BufferAttribute(this.vertices, 3);       
        let posArray = await (this.points(this.featuregeom_id));
        // console.log(posArray);
        let positions = new Float32BufferAttribute(posArray, 3);
        geometry.setAttribute('position', positions);

        //var TypeArray = this.idx.length > 65535 ? Uint32Array : Uint16Array;
        //var indices = this.indices = new TypeArray(this.idx);

        // let indexArray = this.indices = new Uint16Array(this.idx);
        let indexArray = await (this.edges(this.featuregeom_id));
        let indices = new Uint16BufferAttribute(indexArray, 1);//.setDynamic(true);
        geometry.setIndex(indices);

        geometry.scale(1, 1, 1);
        geometry.computeBoundingSphere();
        geometry.computeVertexNormals();// computed vertex normals are orthogonal to the face f
        geometry.computeBoundingBox();

        this.xLocalPlane = new Plane(new Vector3(-1, 0, 0), this._map.x.max);
        //this.addObject(this.xLocalPlane, false);
        this.yLocalPlane = new Plane(new Vector3(0, 1, 0), this._map.y.max);

        let color = parseInt(this.color, 16);
        // this.material = new MeshStandardMaterial({
        //     color: color,
        //     metalness: 0.1,
        //     roughness: 0.75,
        //     flatShading: true,
        //     side: DoubleSide,
        //     clippingPlanes: [this.xLocalPlane, this.yLocalPlane],
        //     clipIntersection: false,
        //     clipShadows: true,
        // });
        // this.materialsArray.push(this.material);
        let uniforms = this.uniforms = {

            clipping: {
                color: { type: "c", value: new Color(color) },
                clippingLow: { type: "v3", value: new Vector3(0, 0, 0) },
                clippingHigh: { type: "v3", value: new Vector3(0, 0, 0) }
            }        
        };
       
        this.material = new ShaderMaterial( {
            uniforms:      uniforms.clipping,
            vertexShader:   shader.vertexClipping,
            fragmentShader: shader.fragmentClippingFront,
            // colorWrite: false,
            // depthWrite: false,
        } );
        this.materialsArray.push(this.material);
        let mesh = this.mainMesh = new Mesh(geometry, this.material);
        // mesh.userData.layerId = this.index;
        // this.addObject(mesh, true);
        //this.mainMesh = mesh;
        if (app_scene) {
            app_scene.add(mesh);
        }
    }

    filterMaterial(filterX, filterY) {
        this.xLocalPlane.constant = filterX;
        this.yLocalPlane.constant = filterY;
    }


    async points(geomId) {
        const url = POINTURL + geomId;
        const buffer = await this.request(url);
        return this.unpackVertices(buffer);
    }

    async edges(geomId) {
        const url = EDGEURL + geomId;
        const buffer = await this.request(url);
        return this.unpackEdges(buffer);
    }

    async request(url) {
        const response = await fetch(url);
        if (response.ok) {
            return response.arrayBuffer();
        } else {
            throw new Error("HTTP error, status = " + response.status);
        }
    }

    unpackEdges(arrayBuffer) {
        const METABYTES = 13;
        var dv = new DataView(arrayBuffer, METABYTES);
        var indices = new Uint32Array((arrayBuffer.byteLength - METABYTES) / 4);
        for (var i = 0; i < indices.length; i++) {
            indices[i] = dv.getUint32(i * 4, true);
        }
        return indices;
    }

    unpackVertices(arrayBuffer) {

        const DIMENSIONS = 3;
        const ONEBYTE = 1, FOURBYTE = 4;    // bytes count for metadata in PG_pointcloud (significant bits compression)
        const dataView = new DataView(arrayBuffer);
        let ptr = ONEBYTE + 2 * FOURBYTE;
        const pointsCount = dataView.getUint32(ptr, true);  // 1 + 4 + 4 = 9 bytes offset
        const posArray = new Float32Array(pointsCount * DIMENSIONS);
        ptr += FOURBYTE;                                  //          
        var bytesCount = 0, significantBitsCount = 0, commonBits, significantBits;
        var dim = 0;
        while (dim < 3) {
            ptr += ONEBYTE;
            bytesCount = dataView.getInt32(ptr, true) - 8;
            ptr += FOURBYTE;
            significantBitsCount = dataView.getUint32(ptr, true);
            ptr += FOURBYTE;
            commonBits = this.readCommonBits(dataView, ptr);
            ptr += FOURBYTE;
            significantBits = this.readSignificantBits(dataView, ptr, bytesCount);
            let value = 0.0;
            for (var j = dim, i = 0; i < pointsCount; j += DIMENSIONS, i++) {
                value = significantBits.readBits(significantBitsCount) | commonBits;
                if (dim === 2) {
                    value = value / 100;       // z values in pc_patch from DB are multiplied by 100
                }
                posArray[j] = value;
            }
            ptr += bytesCount;
            dim += 1;
        }
        return posArray;
    }

    readCommonBits(dataView, ptr) {
        var temp = new Int32Array(1);
        temp[0] = dataView.getInt32(ptr, false);     // why false ??
        var combits = new BitStream(new Uint8Array(temp.buffer));
        return combits.readBits(32);
    }

    readSignificantBits(dataView, ptr, bytesCount) {
        var temp = new Int32Array(bytesCount / 4);
        for (var i = ptr, j = 0; i < ptr + bytesCount; i += 4, j++) {
            temp[j] = dataView.getInt32(i);
        }
        var sigbits = new BitStream(new Uint8Array(temp.buffer));
        return sigbits;
    }




}


export { TinLayer };