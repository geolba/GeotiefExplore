import { Group } from 'three/src/objects/Group';
import { Layer } from './Layer';
import { DemBlock } from './DemBlock';
// import { MeshStandardMaterial } from 'three/src/materials/MeshStandardMaterial';
// import { MeshLambertMaterial } from 'three/src/materials/MeshLambertMaterial';
import { DoubleSide, FlatShading, LinearFilter } from 'three/src/constants';
import * as browser from '../core/browser';


import { TextureLoader } from 'three/src/loaders/TextureLoader';

import { Vector3 } from 'three/src/math/Vector3';
import proj4 from 'proj4/dist/proj4';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { shader } from '../clip/shader';

export class DemLayer extends Layer {

    images = [{
        width: 405,
        // "url": "https://sdi.noe.gv.at/at.gv.noe.geoserver/OGD/wms",
        url: " https://ows.terrestris.de/osm/service",
        height: 549,
        bboxSR: 3857,
        type: "wms"
    },
    {
        width: 405,
        url: "https://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer/export",
        height: 549, //509
        bboxSR: 3034,
        type: "esri"
    }
    ];
    q;
    objectGroup;
    visible;
    opacity;
    materialParameter;
    materialsArray;
    material;
    queryableObjects;
    borderVisible;
    mainMesh;
    uniforms;
    blocks;
    baseExtent = {
        min: { x: 0, y: 0 },
        max: { x: 0, y: 0 }
    };
    index;

    constructor(params) {
        super();
        this.visible = true;
        this.opacity = 1;
        this.material;
        this.materialParameter = [];
        this.materialsArray = [];
        for (var k in params) {
            this[k] = params[k];
        }

        this.objectGroup = new Group();
        this.queryableObjects = [];
        this.borderVisible = false;
        this.blocks = [];


        // this.material = new MeshStandardMaterial({
        //     color: 16382457,
        //     metalness: 0.1,
        //     roughness: 0.75,
        //     flatShading: true,
        //     side: DoubleSide
        // });
        // this.materialsArray.push(this.material);
        // this.initMaterials();
    }

    async initMaterials() {
        if (this.materialParameter.length === 0) return;
        let sum_opacity = 0;
        this.material;
        for (let i = 0, l = this.materialParameter.length; i < l; i++) {
            let m = this.materialParameter[i];
            let opt = {
                opacity: null,
                side: null,
                // shading: null,
                transparent: null,
                wireframe: null,
                uniforms: null,               
                vertexShader: null,
                fragmentShader: null
            };
            if (m.ds && !browser.ie) opt.side = DoubleSide;
            // if (m.flat) opt.shading = FlatShading;
            //m.i = 1;
            let image;
            if (m.i !== undefined) {
                image = this.images[m.i];
                if (image.texture === undefined) {
                    if (image.src !== undefined) {
                        // image.texture = THREE.ImageUtils._loadTexture(image.src);
                    }
                    else {
                        if (image.type == "esri") {
                            // image.texture = this._loadTextureData(image.data);
                            let data = await this.requestImage(image.url, image);

                            // image.texture = await new TextureLoader().load(data.href);
                            image.texture = await this.loadTexture(data.href);
                        } else if (image.type == "wms") {
                            image.texture = await this.loadTextureWms(image.url, image);
                        }
                    }
                }
                // opt.map = image.texture;
            }
            if (m.o !== undefined && m.o < 1) {
                opt.opacity = m.o;
                opt.transparent = true;
            }
            if (m.t) opt.transparent = true;
            if (m.w) opt.wireframe = true;
            
            // let color =  parseInt("ffffff", 16);
            // // opt.color = color;
            let uniforms = this.uniforms = {
                clipping: {
                    clippingScale: { type: "f", value: 1.0 },                    
                    clippingLow: { type: "v3", value: new Vector3(0, 0, 0) },
                    clippingHigh: { type: "v3", value: new Vector3(0, 0, 0) },
                    map: { type: 't', value: image.texture },
                    percent: { type: "f", value: 0.7 },
                }
            };

            let MaterialType = { MeshLambert: 0, MeshPhong: 1, LineBasic: 2, Sprite: 3, Unknown: -1 };

            if (m.materialtypee === MaterialType.MeshLambert) {
                //if (m.color !== undefined) opt.color = opt.ambient = m.color;
                if (m.color !== undefined) opt.color = m.color;
                //opt.skinning = true;
                opt.uniforms = uniforms.clipping;
                opt.vertexShader = shader.vertexClipping;
                opt.fragmentShader = shader.fragmentClippingFront;
                this.material = new ShaderMaterial(opt);
                // this.material = new MeshStandardMaterial(opt);                 
            }       

            m.mat = this.material;
            this.materialsArray.push(this.material);
            sum_opacity += this.material.opacity;
        }

        // layer opacity is the average opacity of materials
        this.opacity = sum_opacity / this.materialsArray.length;
    }

    scaleZ(z) {
        this.objectGroup.scale.z = z;
    }

    setVisible(visible) {
        this.visible = visible;
        this.objectGroup.visible = visible;
        //Q3D.application.queryObjNeedsUpdate = true;
        this.emit('visibility-change');
    }

    addBlock(params, clipped = false) {
        // let BlockClass = clipped ? ClippedDEMBlock : DemBlock;
        let block = new DemBlock(params);
        block.layer = this;
        this.blocks.push(block);
        return block;
    }

    setWireframeMode(wireframe) {
        this.materialsArray.forEach(function (mat) {
            //if (m.w) return;
            //m.mat.wireframe = wireframe;
            mat.wireframe = wireframe;
        });
    }

    async changeImage(i) {
        //this.mainMesh.material.map = THREE.ImageUtils.loadTexture(src);
        let image = this.images[i];
        if (image.texture === undefined) {
            if (image.type == "esri") {
                // image.texture = this._loadTextureData(image.data);
                let data = await this.requestImage(image.url, image);

                // image.texture = await new TextureLoader().load(data.href);
                image.texture = await this.loadTexture(data.href);
            } else if (image.type == "wms") {
                image.texture = await this.loadTextureWms(image.url, image);
            }
        }
        //configure the material now that we have all of the data
        this.mainMesh.material.map = image.texture;
        this.uniforms.clipping.map.value = image.texture;
        this.mainMesh.material.needsUpdate = true;
        if (this.visible === false) {
            this.setVisible(true);
        }
        this._map.update();
    }

    //helper function to load in the texture
    async loadTexture(texturePath) {
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

    async loadTextureWms(url, imageParameter) {
        let dest = new proj4.Proj("EPSG:3857");
        let source = new proj4.Proj("EPSG:3034");
        let p1 = proj4.toPoint([this.baseExtent.min.x, this.baseExtent.min.y]);
        let p2 = proj4.toPoint([this.baseExtent.max.x, this.baseExtent.max.y]);

        proj4.transform(source, dest, p1);
        proj4.transform(source, dest, p2);
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

    async onAdd(map) {
        this.baseExtent.min.x = map.baseExtent.x.min;
        this.baseExtent.min.y = map.baseExtent.y.min;
        this.baseExtent.max.x = map.baseExtent.x.max;
        this.baseExtent.max.y = map.baseExtent.y.max;
        //this._zoomAnimated = this._zoomAnimated && map.options.markerZoomAnimation;
        await this.initMaterials();
        this.build(this.getScene());
        map.update();
        this.emit('add');
    }

    onRemove(map) {
        map.scene.remove(this.objectGroup);
    }

    build(app_scene) {
        //var opt = Gba3D.Options;
        this.blocks.forEach(function (block) {
            block.build(this);

            //// build sides, bottom and frame
            ////if (block.sides) {

            //// material
            //var opacity = this.materials[block.mIndex].o;
            //if (opacity === undefined) {
            //    opacity = 1;
            //}
            //var sidecolor = this.materials[block.mIndex].side.color;

            //var mat = new THREE.MeshLambertMaterial({
            //    color: sidecolor, //opt.side.color,
            //    ambient: sidecolor,//opt.side.color,
            //    opacity: opacity,
            //    transparent: (opacity < 1),
            //    side: THREE.DoubleSide //neu dazu
            //});
            //this.materials.push({ type: Gba3D.MaterialType.MeshLambert, m: mat });

            //if (block.bottomData) {
            //    //block.extrudePlane(this, mat, opt.side.bottomZ);
            //    block.extrudePlane(this, mat, opt.side.bottomZ);
            //}
            //else {
            //    //var sidecolor = this.materials[block.mIndex].side.color;
            //    var bottomZ = this.materials[block.mIndex].side.bottomZ;
            //    block.extrudeBottomPlane(this, mat, bottomZ);
            //}                
            //this.sideVisible = true;
            ////}

        }, this);

        if (app_scene) {
            app_scene.add(this.objectGroup);
        }
    }

    addObject(object, queryable) {
        if (queryable === undefined) {
            queryable = this.q;
        }

        this.objectGroup.add(object);
        if (queryable) {
            this._addQueryableObject(object);
        }
    }

    _addQueryableObject(object) {
        this.queryableObjects.push(object);
        //for (var i = 0, l = object.children.length; i < l; i++) {
        //    this._addQueryableObject(object.children[i]);
        //}
    }

    removeObject(object, queryable) {
        if (queryable === undefined) {
            queryable = this.q;
        }

        this.objectGroup.remove(object);
        if (queryable) {

            var index = this.queryableObjects.indexOf(object);
            index !== -1 && this.queryableObjects.splice(index, 1);
        }
    }

    async requestImage(url, imageParameter) {
        let dest = new proj4.Proj("EPSG:3857");
        let source = new proj4.Proj("EPSG:3034");
        let p1 = proj4.toPoint([this.baseExtent.min.x, this.baseExtent.min.y]);
        let p2 = proj4.toPoint([this.baseExtent.max.x, this.baseExtent.max.y]);

        proj4.transform(source, dest, p1);
        proj4.transform(source, dest, p2);

        // let bbox = this.baseExtent.x.min + "," + this.baseExtent.y.min + "," + this.baseExtent.x.max + "," + this.baseExtent.y.max;
        let bbox = p1.x + "," + p1.y + "," + p2.x + "," + p2.y;

        let params = {
            // "width": imageParameter.width,
            // "height": imageParameter.height,
            "size": imageParameter.width + "," + imageParameter.height,
            "bboxSR": "3857", // imageParameter.bboxSR,
            // "bbox": "3955850,2183470.1545778836,4527300,2502829.8454221168",
            "bbox": bbox,
            "format": "png",
            "f": "pjson"
        };
        let query = Object.keys(params)
            .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
            .join('&');
        url = url + '?' + query;
        const response = await fetch(url);
        if (response.ok) {
            return response.json();
        } else {
            throw new Error("HTTP error, status = " + response.status);
        }
    }

    async loadTextureData(imageData) {
        let texture;
        let elem = document.createElement('img');
        return new Promise((resolve, reject) => {
            elem.onload = () => {
                console.log('image completely read');
                // resolve(elem);
                texture = new Texture(elem);
                texture.minFilter = LinearFilter;
                texture.needsUpdate = true;
                resolve(texture);
            }
            elem.onerror = reject;
            elem.src = imageData;
        });
    }

    _loadTextureData(imageData) {
        let texture;
        let image = document.createElement('img');
        image.src = imageData;
        image.onload = () => {
            console.log('file completely read');
            texture.needsUpdate = true;
        };
        // image.src = imageData;   
        texture = new Texture(image);
        texture.minFilter = LinearFilter;
        return texture;
    }

}