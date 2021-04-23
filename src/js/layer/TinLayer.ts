import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { Float32BufferAttribute, Uint16BufferAttribute } from 'three/src/core/BufferAttribute';
import { DoubleSide } from 'three/src/constants';
import { Mesh } from 'three/src/objects/Mesh';
import { Layer } from './Layer';
import { BitStream } from '../lib/bitstream';
import { Vector3 } from 'three/src/math/Vector3';
import { Color } from 'three/src/math/Color';
import { MyMeshStandardMaterial } from '../clip/MyMeshStandardMaterial';
import { Group } from 'three/src/objects/Group';

// topography overlay
// import { Texture } from 'three/src/textures/Texture';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import proj4 from 'proj4/dist/proj4';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { shader } from '../clip/shader';
import { Material } from 'three/src/materials/Material';
import { MeshLambertMaterial } from 'three/src/materials/MeshLambertMaterial';

const POINTURL = 'https://geusegdi01.geus.dk/geom3d/data/nodes/';
const EDGEURL = 'https://geusegdi01.geus.dk/geom3d/data/triangles/';

class TinLayer extends Layer {

    name: string;
    q: boolean;
    queryableObjects;
    borderVisible;
    scale;
    objectGroup;
    visible: boolean;
    opacity: number;
    materialParameter: Array<string>;
    materialsArray: Array<any>;
    material: Material;
    featuregeom_id: number;
    color: string;
    mainMesh;
    uniforms = {
        clipping: {}
    };
    public baseExtent = {
        min: { x: 0, y: 0 },
        max: { x: 0, y: 0 }
    };
    index: number;
    images = [{
        width: 405,
        // "url": "https://sdi.noe.gv.at/at.gv.noe.geoserver/OGD/wms",
        url: " https://ows.terrestris.de/osm/service",
        height: 549,
        bboxSR: 3857,
        type: "wms",
        texture: undefined
    },
    {
        width: 405,
        url: "https://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer/export",
        height: 549, //509
        bboxSR: 3034,
        type: "esri",
        texture: undefined
    }
    ];

    constructor(params) {
        super();

        this.visible = true;
        this.opacity = 1;
        this.materialParameter = [];
        this.materialsArray = [];
        for (var k in params) {
            this[k] = params[k];
        }

        this.queryableObjects = [];
        this.borderVisible = false;
        this.scale = 1;
        this.objectGroup = new Group();
        this.q = true;
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
        this.objectGroup.visible = visible;
        this.emit('visibility-change');
    }

    scaleZ(z) {
        this.scale = z;
        this.objectGroup.scale.z = z;
    }

    async onAdd(map) {
        await this.build(this.getScene());
        map.update();
    }

    onRemove(map) {
        map.scene.remove(this.objectGroup);
    }

    async initMaterials() {
    }

    async build(app_scene) {
        let geometry = new BufferGeometry();
        let vertices = await (this.points(this.featuregeom_id));
        // const positions = [];
        // const normals = [];
        // const uvs = [];
        // for (let i = 0; i < vertices.length; i = i +3) {
        //     // positions.push(...vertex.pos);
        //     // normals.push(...vertex.norm);
        //     uvs.push([0,0]);
        //     uvs.push([1, 0]);
        //     uvs.push([0, 1]);
        //   }
        let positions = new Float32BufferAttribute(vertices, 3);
        geometry.setAttribute('position', positions);

        //var TypeArray = this.idx.length > 65535 ? Uint32Array : Uint16Array;
        //var indices = this.indices = new TypeArray(this.idx);
        // let indexArray = this.indices = new Uint16Array(this.idx);
        let indexArray = await (this.edges(this.featuregeom_id));
        let indices = new Uint16BufferAttribute(indexArray, 1);//.setDynamic(true);
        geometry.setIndex(indices);

        // const uvNumComponents = 2;
        // geometry.setAttribute(
        //     'uv',
        //     new Float32BufferAttribute(new Float32Array(uvs), uvNumComponents));

        geometry.scale(1, 1, 1);
        geometry.computeBoundingSphere();
        geometry.computeVertexNormals();// computed vertex normals are orthogonal to the face f
        geometry.computeBoundingBox();
        let boundingBox = geometry.boundingBox;
        this.baseExtent.min.x = boundingBox.min.x;
        this.baseExtent.min.y = boundingBox.min.y;
        this.baseExtent.max.x = boundingBox.max.x;
        this.baseExtent.max.y = boundingBox.max.y;

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



        if (this.name == "test") {
            let image = this.images[0];
            if (image.texture === undefined) {

                // if (image.type == "esri") {
                //     // image.texture = this._loadTextureData(image.data);
                //     let data = await this.requestImage(image.url, image);

                //     // image.texture = await new TextureLoader().load(data.href);
                //     image.texture = await this.loadTexture(data.href);
                // } 
                if (image.type == "wms") {
                    image.texture = await this.loadTextureWms(image.url, image);
                }

            }
            this.uniforms = {
                clipping: {
                    clippingScale: { type: "f", value: 1.0 },
                    clippingLow: { type: "v3", value: new Vector3(0, 0, 0) },
                    clippingHigh: { type: "v3", value: new Vector3(0, 0, 0) },
                    // map: { type: 't', value: image.texture },
                    percent: { type: "f", value: 0.7 }
                }
            };

            // this.material = new MeshLambertMaterial({
            //     map: image.texture,
            //     transparent: true,
            //     side: DoubleSide,
            // });
            this.material = new ShaderMaterial({
                transparent: true,
                side: DoubleSide,
                uniforms: this.uniforms.clipping,
                vertexShader: shader.vertexClipping,
                fragmentShader: shader.fragmentClippingFront,
            });

        } else {
            let uniforms = this.uniforms = {
                clipping: {
                    clippingScale: { type: "f", value: 1.0 },
                    color: { type: "c", value: new Color(color) },
                    clippingLow: { type: "v3", value: new Vector3(0, 0, 0) },
                    clippingHigh: { type: "v3", value: new Vector3(0, 0, 0) }
                }
            };

            this.material = new MyMeshStandardMaterial({
                color: color,
                metalness: 0.1,
                roughness: 0.75,
                flatShading: true,
                side: DoubleSide
            }, uniforms.clipping);
        }

        this.materialsArray.push(this.material);
        let mesh = this.mainMesh = new Mesh(geometry, this.material);
        mesh.userData.layerId = this.index;
        this._addObject(mesh, true);
        if (app_scene) {
            app_scene.add(this.objectGroup);
        }
    }

    private _addObject(object, queryable) {
        if (queryable === undefined) {
            queryable = this.q;
        }
        this.objectGroup.add(object);
        if (queryable) {
            this._addQueryableObject(object);
        }
    }

    private _addQueryableObject(object) {
        this.queryableObjects.push(object);
        //for (var i = 0, l = object.children.length; i < l; i++) {
        //    this._addQueryableObject(object.children[i]);
        //}
    }

    async points(geomId) {
        const url = POINTURL + geomId;
        const buffer = await this._request(url);
        return this._unpackVertices(buffer);
    }

    async edges(geomId) {
        const url = EDGEURL + geomId;
        const buffer = await this._request(url);
        return this._unpackEdges(buffer);
    }

    private async _request(url) {
        const response = await fetch(url);
        if (response.ok) {
            return response.arrayBuffer();
        } else {
            throw new Error("HTTP error, status = " + response.status);
        }
    }

    private _unpackEdges(arrayBuffer) {
        const METABYTES = 13;
        var dv = new DataView(arrayBuffer, METABYTES);
        var indices = new Uint32Array((arrayBuffer.byteLength - METABYTES) / 4);
        for (var i = 0; i < indices.length; i++) {
            indices[i] = dv.getUint32(i * 4, true);
        }
        return indices;
    }

    private _unpackVertices(arrayBuffer) {

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
            commonBits = this._readCommonBits(dataView, ptr);
            ptr += FOURBYTE;
            significantBits = this._readSignificantBits(dataView, ptr, bytesCount);
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

    private _readCommonBits(dataView, ptr) {
        var temp = new Int32Array(1);
        temp[0] = dataView.getInt32(ptr, false);     // why false ??
        var combits = new BitStream(new Uint8Array(temp.buffer));
        return combits.readBits(32);
    }

    private _readSignificantBits(dataView, ptr, bytesCount) {
        let temp = new Int32Array(bytesCount / 4);
        for (let i = ptr, j = 0; i < ptr + bytesCount; i += 4, j++) {
            temp[j] = dataView.getInt32(i);
        }
        let sigbits = new BitStream(new Uint8Array(temp.buffer));
        return sigbits;
    }

    async loadTextureWms(url, imageParameter) {
        let dest = new proj4.Proj("EPSG:3857");
        let source = new proj4.Proj("EPSG:3034");
        let p1 = proj4.toPoint([this.baseExtent.min.x, this.baseExtent.min.y]);
        let p2 = proj4.toPoint([this.baseExtent.max.x, this.baseExtent.max.y]);

        proj4.transform(source, dest, p1);
        proj4.transform(source, dest, p2);

        // let bbox = this.baseExtent.x.min + "," + this.baseExtent.y.min + "," + this.baseExtent.x.max + "," + this.baseExtent.y.max;
        let bbox = p1.x + "," + p1.y + "," + p2.x + "," + p2.y;

        let params = {
            version: "1.3.0",
            service: "WMS",
            request: "GetMap",
            "width": imageParameter.width,
            "height": imageParameter.height,
            // "size": imageParameter.width + "," + imageParameter.height,
            "crs": "EPSG:3857", //  + imageParameter.bboxSR,
            // "bboxSR": imageParameter.bboxSR,
            // "bbox": "3955850,2183470.1545778836,4527300,2502829.8454221168",
            "bbox": bbox,
            "styles": "",
            // "format": "png",
            "format": "image/png",
            "layers": "OSM-WMS"
            // "f": "pjson"
        };
        let query = Object.keys(params)
            .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
            .join('&');
        let texturePath = url + '?' + query;

        const textureLoader = new TextureLoader();
        return new Promise((resolve, reject) => {
            textureLoader.load(
                texturePath,
                (texture) => resolve(texture),
                undefined,
                err => reject(err)
            );
        });
    }

}

export { TinLayer };