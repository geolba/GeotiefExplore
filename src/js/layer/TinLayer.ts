import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { Float32BufferAttribute, Uint16BufferAttribute } from 'three/src/core/BufferAttribute';
import { DoubleSide, FrontSide } from 'three/src/constants';
import { Mesh } from 'three/src/objects/Mesh';
import { Layer } from './Layer';
import { BitStream } from '../lib/bitstream';
import { Vector3 } from 'three/src/math/Vector3';
import { MyMeshStandardMaterial } from '../clip/MyMeshStandardMaterial';
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { Group } from 'three/src/objects/Group';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import proj4 from 'proj4/dist/proj4-src';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { shader } from '../clip/shader';
import { Material } from 'three/src/materials/Material';
import { Vector2 } from 'three/src/math/Vector2';
import { Matrix4 } from 'three/src/math/Matrix4';
import { Box3 } from 'three/src/math/Box3';
import { uniforms } from '../clip/uniforms';
import { UpdatableBoxGeometry } from '../clip/UpdatableBoxGeometry';
import { Scene } from 'three/src/scenes/Scene';
import * as material from '../clip/material';

import { Plane } from 'three/src/math/Plane';
import { PlaneGeometry } from '../clip/PlaneGeometry';
import { Line3 } from 'three/src/math/Line3';
import { LineBasicMaterial } from 'three/src/materials/LineBasicMaterial';
import { LineSegments } from 'three/src/objects/LineSegments';
import { PointsMaterial } from 'three/src/materials/PointsMaterial';
import { Points } from 'three/src/objects/Points';
import { Line } from 'three/src/objects/Line';
import hull from 'hull.js/src/hull';
import { Color } from 'three/src/math/Color';



const POINTURL = 'https://geusegdi01.geus.dk/geom3d/data/nodes/';
const EDGEURL = 'https://geusegdi01.geus.dk/geom3d/data/triangles/';

export class Point3 extends Vector3 {
    // public x: number;
    // public y: number;
    private values: number[];
    public checked: boolean;
    public faceIndex: number;

    constructor(x?: number, y?: number, z?: number) {
        super(x, y, z);
        // this.x = x;
        // this.y = y;
        // this.z = z;
    }


    public equals(v, tolerance?): boolean {
        if (tolerance === undefined) {
            return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z));
        } else {
            return ((Math.abs(v.x - this.x) < tolerance) && (Math.abs(v.y - this.y) < tolerance) && (Math.abs(v.z - this.z) < tolerance));
        }
    }

    public toString(): string {
        return "x=" + this.x + " y=" + this.y;
    }
}

class TinLayer extends Layer {

    name: string;
    q: boolean;
    queryableObjects;
    borderVisible;
    scale;
    objectGroup;
    borderGroup;
    visible: boolean;
    opacity: number;
    materialParameter: Array<string>;
    materialsArray: Array<any>;
    material: Material;
    featuregeom_id: number;
    color: string;
    mainMesh: Mesh;
    borderMesh;
    planeGeom: PlaneGeometry;
    geometry: BufferGeometry;
    box: UpdatableBoxGeometry;
    uniforms;
    // uniforms = {
    //     clipping: {
    //         clippingScale: { type: "f", value: 1.0 },
    //         color: { type: "c", value: null },
    //         clippingLow: { type: "v3", value: new Vector3(0, 0, 0) },
    //         clippingHigh: { type: "v3", value: new Vector3(0, 0, 0) },
    //         map: { type: 't', value: null },
    //         percent: { type: "f", value: 1 }
    //     }
    // };
    public baseExtent = {
        min: { x: 0, y: 0 },
        max: { x: 0, y: 0 }
    };
    index: number;
    boundingBox: Box3;
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
    frontStencil: Scene;
    backStencil: Scene;
    capsScene: Scene;
    p_vertices: Array<Point3>;
    tolerance: number = 0.01;
    pointsOfIntersection: BufferGeometry;
    borderMaterial;

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
        this.uniforms = uniforms;
        this.borderGroup = new Group();
    }

    buildBorder(vertices) {
        let box = this.box = new UpdatableBoxGeometry(vertices);
        // this.getScene().add(this.borderGroup);


        let color = parseInt(this.color, 16);

        let planeGeom = new PlaneGeometry(this.box.vertices[0], this.box.vertices[1], this.box.vertices[2], this.box.vertices[3]);

        let caps = {
            // red
            color: { type: "c", value: new Color(color) }
        }
        let profileMaterial = material.profileMaterial.clone();
        profileMaterial.color = new Color(color);
        // profileMaterial.uniforms = caps;
        this.borderMesh = new Mesh(box, profileMaterial);
        // this.borderMesh.name = 'stencilFeatureBack_' + this.index;
        this.borderMesh.name = 'profilePlane_' + this.name;
        // this.borderMesh.onAfterRender = this.debugRenderOrder;


        // this.boxMesh = new Mesh(box, material.profileMaterial);



        // //let planeGeom = this.planeGeom = new PlaneGeometry(vertices[0], vertices[1], vertices[5], vertices[4]);
        // let planeGeom = this.planeGeom = new PlaneGeometry(this.box.vertices[0], this.box.vertices[1], this.box.vertices[2], this.box.vertices[3]);
        // // planeGeom.rotateX(-Math.PI / 2);
        // let plane = new Mesh(planeGeom, new MeshBasicMaterial({
        //     color: "lightgray",
        //     transparent: true,
        //     opacity: 0.75,
        //     side: DoubleSide
        // }));
        // // this._addObject(plane, false);

        // let pointsOfIntersection = this.pointsOfIntersection = new BufferGeometry();
        // let p_vertices = new Array(); // 3 vertices per point
        // // let positions = new Float32BufferAttribute(p_vertices, 3);
        // // pointsOfIntersection.setAttribute('position', positions);

        // var pointsMaterial = new PointsMaterial({
        //     size: 100,
        //     color: 0xff0000
        // });
        // var points = new Points(pointsOfIntersection, pointsMaterial);
        // this._addObject(points, false);

      

        // var lines = new LineSegments(pointsOfIntersection, new LineBasicMaterial({
        //     color: 0xa9a9a9
        // }));
        // // var material = new LineBasicMaterial( { color: 0xffffff, linewidth: 1 } );
        // // // line
        // // var line = new Line( pointsOfIntersection, material );
        // this._addObject(lines, false);

        // let meshMaterial = new MeshBasicMaterial({
        //     color: 0xa9a9a9
        // });   
       

        let a = new Vector3(),
            b = new Vector3(),
            c = new Vector3();
        let planePointA = new Vector3(),
            planePointB = new Vector3(),
            planePointC = new Vector3();
        let lineAB = new Line3(),
            lineBC = new Line3(),
            lineCA = new Line3();
        // let pointOfIntersection = new Vector3();

        // box.addEventListener("update", (event) => {
        //     let ar = new Array(this.box.vertices[0], this.box.vertices[1], this.box.vertices[2], this.box.vertices[3]);
        //     this.planeGeom.setFromPoints(ar);
        //     this.planeGeom.update();

        //     this.borderGroup.clear();

        //     this.p_vertices = [];
        //     vertices = [];

        //     let mathPlane = new Plane();
        //     plane.localToWorld(planePointA.copy(plane.geometry.vertices[0]));
        //     plane.localToWorld(planePointB.copy(plane.geometry.vertices[1]));
        //     plane.localToWorld(planePointC.copy(plane.geometry.vertices[2]));
        //     mathPlane.setFromCoplanarPoints(planePointA, planePointB, planePointC);


        //     let geom = this.mainMesh.geometry;
        //     // this.mainMesh.geometry.faces.forEach(function (face) {
        //     for (let vi = 0; vi < geom.index.array.length; vi += 3) {

        //         let idx0 = geom.index.array[vi];
        //         let idx1 = geom.index.array[vi + 1];
        //         let idx2 = geom.index.array[vi + 2];

        //         let vx0 = geom.attributes.position.array[3 * idx0];
        //         let vy0 = geom.attributes.position.array[3 * idx0 + 1];
        //         let vz0 = geom.attributes.position.array[3 * idx0 + 2];

        //         let vx1 = geom.attributes.position.array[3 * idx1];
        //         let vy1 = geom.attributes.position.array[3 * idx1 + 1];
        //         let vz1 = geom.attributes.position.array[3 * idx1 + 2];

        //         let vx2 = geom.attributes.position.array[3 * idx2];
        //         let vy2 = geom.attributes.position.array[3 * idx2 + 1];
        //         let vz2 = geom.attributes.position.array[3 * idx2 + 2];

        //         let v0 = new Vector3(vx0, vy0, vz0);
        //         let v1 = new Vector3(vx1, vy1, vz1);
        //         let v2 = new Vector3(vx2, vy2, vz2);

        //         this.mainMesh.localToWorld(a.copy(v0));
        //         this.mainMesh.localToWorld(b.copy(v1));
        //         this.mainMesh.localToWorld(c.copy(v2));
        //         lineAB = new Line3(a, b);
        //         lineBC = new Line3(b, c);
        //         lineCA = new Line3(c, a);
        //         let p1 = this.setPointOfIntersection(lineAB, mathPlane, vi);
        //         let p2 = this.setPointOfIntersection(lineBC, mathPlane, vi);
        //         let p3 = this.setPointOfIntersection(lineCA, mathPlane, vi);
        //         // if (p1.x != 0 && p1.y != 0 && p1.z != 0 && p2.x != 0 && p2.y != 0 && p2.z != 0 && p3.x != 0 && p3.y != 0 && p3.z != 0) {
        //         //     this.p_vertices.push(p1, p2, p3);
        //         // }

        //     }
        //     if (this.p_vertices.length > 0) {
        //         // pointsOfIntersection.setFromPoints(p_vertices);
        //         // pointsOfIntersection.computeBoundingSphere()
        //         // pointsOfIntersection.attributes.position.needsUpdate = true;

        //         // // convexGeometry.setFromPoints(p_vertices);
        //         // convexGeometry  = new ConvexGeometry( p_vertices );
        //         // convexGeometry.computeBoundingSphere()
        //         // convexGeometry.attributes.position.needsUpdate = true;

        //         // let test = this.p_vertices.map(v => {
        //         //     return [v.x, v.z];
        //         // });
        //         // // const indexHull = hull(test, 20); // returns points of the hull (in clockwise order)  
        //         // const indexHull = concaveman(test, 1.5);
        //         // let vertices = indexHull.map(a => {
        //         //     return new Vector3(a[0], this.p_vertices[0].y, a[1]);
        //         // });
        //         // let cntrGeom = new BufferGeometry();
        //         // cntrGeom.setFromPoints(vertices);
        //         // let contour = new Line(cntrGeom, new LineBasicMaterial({
        //         //     color: Math.random() * 0xffffff //0x777777 + 0x777777
        //         // }));
        //         // this.borderGroup.add(contour);

        //         // const indexAlpha = concaveman(test, 1);
        //         // let vertices = indexAlpha.map(a => {
        //         //     return new Vector3(a[0], a[1], a[2]);
        //         // });

        //         pointsOfIntersection.setFromPoints(this.p_vertices);
        //         pointsOfIntersection.computeBoundingSphere()
        //         pointsOfIntersection.attributes.position.needsUpdate = true;

        //         let contours = this.getContours(this.p_vertices, [], true);
        //         contours.forEach(cntr => {
        //             let cntrGeom = new BufferGeometry();
        //             cntrGeom.setFromPoints(cntr);
        //             let contour = new Line(cntrGeom, new LineBasicMaterial({
        //                 color: Math.random() * 0xffffff //0x777777 + 0x777777
        //             }));
        //             this.borderGroup.add(contour);
        //         });
        //     }




        // });



        // this.frontStencil = new Scene();
        // let frontMesh = new Mesh(this.geometry.clone(), material.frontStencilMaterial);
        // frontMesh.userData.layerId = this.index;
        // this.frontStencil.add(frontMesh);

        // this.backStencil = new Scene();
        // let backMesh = new Mesh(this.geometry.clone(), material.backStencilMaterial);
        // backMesh.userData.layerId = this.index;
        // this.backStencil.add(frontMesh);

        // this.capsScene = new Scene();
        // this.capsScene.add(this.borderMesh);
    }
    debugRenderOrder() {
        console.log(this.name);
    }


    private setPointOfIntersection(line: Line3, plane: Plane, faceIndex: number): void {
        let pointOfIntersection = new Point3();
        plane.intersectLine(line, pointOfIntersection);
        if (pointOfIntersection.x != 0 && pointOfIntersection.y != 0 && pointOfIntersection.z != 0) {
            // let p = pointOfIntersection.clone();
            pointOfIntersection.checked = false;
            pointOfIntersection.faceIndex = faceIndex;
            this.p_vertices.push(pointOfIntersection);

        }
        // return pointOfIntersection;
    }

    private getContours(points: Array<Point3>, contours: Array<any>, firstRun: boolean) {
        // console.log("firstRun:", firstRun);

        let contour = new Array<Point3>();

        // find first line for the contour
        let firstPointIndex = 0;
        let secondPointIndex = 0;
        let firstPoint, secondPoint;
        for (let i = 0; i < points.length; i++) {
            let point = points[i];
            if (point.checked == true) continue;
            firstPointIndex = i;
            firstPoint = points[firstPointIndex];
            firstPoint.checked = true;
            secondPointIndex = this.getPairIndex(firstPoint, firstPointIndex, points);
            secondPoint = points[secondPointIndex];
            secondPoint.checked = true;
            contour.push(firstPoint);
            contour.push(secondPoint);
            break;
        }

        contour = this.getContour(secondPoint, points, contour);
        if (contour != undefined) {
            contours.push(contour);
        }
        let allChecked = 0;
        points.forEach(p => { allChecked += p.checked == true ? 1 : 0; });
        // console.log("allChecked: ", allChecked == points.length);
        if (allChecked != points.length) { return this.getContours(points, contours, false); }
        return contours;
    }

    private getContour(currentPoint: Point3, points, contour) {
        let p1Index = this.getNearestPointIndex(currentPoint, points);
        let p1 = points[p1Index];
        p1.checked = true;
        let p2Index = this.getPairIndex(p1, p1Index, points);
        if (p2Index == 0) {
            // return;
            p2Index = this.getClosestPoint(p1, p1Index, points);
        }
        if (p2Index == 0) {
            return;
        }
        let p2 = points[p2Index];
        p2.checked = true;
        let isClosed = p2.equals(contour[0], this.tolerance);
        if (!isClosed) {
            contour.push(p2);
            return this.getContour(p2, points, contour);
        } else {
            // it is closes, exit
            contour.push(contour[0]);
            return contour;
        }
    }
    private getClosestPoint(point, pointIndex, points) {
        let closestPointIndex: number;
        let closestDistance: number = 99999999999999999; //something big
        for (let i = 0; i < points.length; i++) {
            let p = points[i];
            if (i == pointIndex && p.checked == true) {
                continue;
            }
            let distance = point.distanceTo(p);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestPointIndex = i;
            }
        }
        return closestPointIndex;
    }

    private getPairIndex(point, pointIndex, points) {

        let index = 0;
        for (let i = 0; i < points.length; i++) {
            let p = points[i];
            if (i != pointIndex && p.checked == false && p.faceIndex == point.faceIndex) {
                index = i;
                break;
            }
        }
        return index;
    }

    private getNearestPointIndex(point: Point3, pointsArray: Array<Point3>): number {
        let index: number = 0;
        for (let i = 0; i < pointsArray.length; i++) {
            //   let p = points[i];
            if (pointsArray[i].checked == false && pointsArray[i].equals(point, this.tolerance)) {
                index = i;
                break;
            }
        }
        return index;
    }



    // animate() {
    //     let gl = this._map.renderer.getContext();

    //     if (gl != undefined && this.capsScene != undefined) {
    //         gl.enable(gl.STENCIL_TEST);
    //         // this.renderer.state.setStencilFunc( true );
    //         // gl.stencilFunc( gl.ALWAYS, 1, 0xff );
    //         // gl.stencilOp( gl.REPLACE, gl.REPLACE, gl.REPLACE );

    //         gl.stencilFunc(gl.ALWAYS, 1, 0xff);
    //         gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
    //         this._map.renderer.render(this.backStencil, this._map.camera);

    //         gl.stencilFunc(gl.ALWAYS, 1, 0xff);
    //         gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);
    //         this._map.renderer.render(this.frontStencil, this._map.camera);

    //         gl.stencilFunc(gl.EQUAL, 1, 0xff);
    //         gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
    //         this._map.renderer.render(this.capsScene, this._map.camera);


    //         // disable stencil test
    //         gl.disable(gl.STENCIL_TEST);
    //     }
    // }

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
        this.mainMesh.visible = visible;
        this.emit('visibility-change', visible);
    }

    scaleZ(z) {
        this.scale = z;
        this.objectGroup.scale.z = z;
        this.emit('scale-change', z);
    }

    async onAdd(map) {
        proj4.defs("EPSG:4312", "+proj=longlat +ellps=bessel +towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232 +no_defs");
        proj4.defs("EPSG:3034", "+proj=lcc +lat_1=35 +lat_2=65 +lat_0=52 +lon_0=10 +x_0=4000000 +y_0=2800000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
        await this.build(this.getScene());
        map.update();
    }

    onRemove(map) {
        map.scene.remove(this.objectGroup);
    }

    async initMaterials() {
    }

    _applyBoxUV(geom, transformMatrix, bbox, bbox_max_size) {

        let coords = [];
        coords.length = 2 * geom.attributes.position.array.length / 3;

        // geom.removeAttribute('uv');
        if (geom.attributes.uv === undefined) {
            geom.setAttribute('uv', new Float32BufferAttribute(coords, 2));

            // const uvNumComponents = 2;
            // geometry.setAttribute(
            //     'uv',
            //     new Float32BufferAttribute(new Float32Array(uvs), uvNumComponents));
        }

        //maps 3 verts of 1 face on the better side of the cube
        //side of the cube can be XY, XZ or YZ
        let makeUVs = function (v0, v1, v2) {

            //pre-rotate the model so that cube sides match world axis
            v0.applyMatrix4(transformMatrix);
            v1.applyMatrix4(transformMatrix);
            v2.applyMatrix4(transformMatrix);

            //get normal of the face, to know into which cube side it maps better
            let n = new Vector3();
            n.crossVectors(v1.clone().sub(v0), v1.clone().sub(v2)).normalize();

            n.x = Math.abs(n.x);
            n.y = Math.abs(n.y);
            n.z = Math.abs(n.z);

            let uv0 = new Vector2();
            let uv1 = new Vector2();
            let uv2 = new Vector2();
            // xz mapping
            if (n.y > n.x && n.y > n.z) {
                uv0.x = (v0.x - bbox.min.x) / bbox_max_size;
                uv0.y = (bbox.max.z - v0.z) / bbox_max_size;

                uv1.x = (v1.x - bbox.min.x) / bbox_max_size;
                uv1.y = (bbox.max.z - v1.z) / bbox_max_size;

                uv2.x = (v2.x - bbox.min.x) / bbox_max_size;
                uv2.y = (bbox.max.z - v2.z) / bbox_max_size;
            } else
                if (n.x > n.y && n.x > n.z) {
                    uv0.x = (v0.z - bbox.min.z) / bbox_max_size;
                    uv0.y = (v0.y - bbox.min.y) / bbox_max_size;

                    uv1.x = (v1.z - bbox.min.z) / bbox_max_size;
                    uv1.y = (v1.y - bbox.min.y) / bbox_max_size;

                    uv2.x = (v2.z - bbox.min.z) / bbox_max_size;
                    uv2.y = (v2.y - bbox.min.y) / bbox_max_size;
                } else
                    if (n.z > n.y && n.z > n.x) {
                        uv0.x = (v0.x - bbox.min.x) / bbox_max_size;
                        uv0.y = (v0.y - bbox.min.y) / bbox_max_size;

                        uv1.x = (v1.x - bbox.min.x) / bbox_max_size;
                        uv1.y = (v1.y - bbox.min.y) / bbox_max_size;

                        uv2.x = (v2.x - bbox.min.x) / bbox_max_size;
                        uv2.y = (v2.y - bbox.min.y) / bbox_max_size;
                    }

            return {
                uv0: uv0,
                uv1: uv1,
                uv2: uv2
            };
        };

        if (geom.index) { // is it indexed buffer geometry?
            for (let vi = 0; vi < geom.index.array.length; vi += 3) {
                let idx0 = geom.index.array[vi];
                let idx1 = geom.index.array[vi + 1];
                let idx2 = geom.index.array[vi + 2];

                let vx0 = geom.attributes.position.array[3 * idx0];
                let vy0 = geom.attributes.position.array[3 * idx0 + 1];
                let vz0 = geom.attributes.position.array[3 * idx0 + 2];

                let vx1 = geom.attributes.position.array[3 * idx1];
                let vy1 = geom.attributes.position.array[3 * idx1 + 1];
                let vz1 = geom.attributes.position.array[3 * idx1 + 2];

                let vx2 = geom.attributes.position.array[3 * idx2];
                let vy2 = geom.attributes.position.array[3 * idx2 + 1];
                let vz2 = geom.attributes.position.array[3 * idx2 + 2];

                let v0 = new Vector3(vx0, vy0, vz0);
                let v1 = new Vector3(vx1, vy1, vz1);
                let v2 = new Vector3(vx2, vy2, vz2);

                let uvs = makeUVs(v0, v1, v2);

                coords[2 * idx0] = uvs.uv0.x;
                coords[2 * idx0 + 1] = uvs.uv0.y;

                coords[2 * idx1] = uvs.uv1.x;
                coords[2 * idx1 + 1] = uvs.uv1.y;

                coords[2 * idx2] = uvs.uv2.x;
                coords[2 * idx2 + 1] = uvs.uv2.y;
            }
        } else {
            for (let vi = 0; vi < geom.attributes.position.array.length; vi += 9) {
                let vx0 = geom.attributes.position.array[vi];
                let vy0 = geom.attributes.position.array[vi + 1];
                let vz0 = geom.attributes.position.array[vi + 2];

                let vx1 = geom.attributes.position.array[vi + 3];
                let vy1 = geom.attributes.position.array[vi + 4];
                let vz1 = geom.attributes.position.array[vi + 5];

                let vx2 = geom.attributes.position.array[vi + 6];
                let vy2 = geom.attributes.position.array[vi + 7];
                let vz2 = geom.attributes.position.array[vi + 8];

                let v0 = new Vector3(vx0, vy0, vz0);
                let v1 = new Vector3(vx1, vy1, vz1);
                let v2 = new Vector3(vx2, vy2, vz2);

                let uvs = makeUVs(v0, v1, v2);

                let idx0 = vi / 3;
                let idx1 = idx0 + 1;
                let idx2 = idx0 + 2;

                coords[2 * idx0] = uvs.uv0.x;
                coords[2 * idx0 + 1] = uvs.uv0.y;

                coords[2 * idx1] = uvs.uv1.x;
                coords[2 * idx1 + 1] = uvs.uv1.y;

                coords[2 * idx2] = uvs.uv2.x;
                coords[2 * idx2 + 1] = uvs.uv2.y;
            }
        }

        geom.attributes.uv.array = new Float32Array(coords);
    }

    applyBoxUV(bufferGeometry, transformMatrix, boxSize?) {

        if (transformMatrix === undefined) {
            transformMatrix = new Matrix4();
        }

        let geom = bufferGeometry;
        geom.computeBoundingBox();
        // let bbox = geom.boundingBox;
        if (boxSize === undefined) {
            let geom = bufferGeometry;
            geom.computeBoundingBox();
            let bbox = geom.boundingBox;

            let bbox_size_x = bbox.max.x - bbox.min.x;
            let bbox_size_z = bbox.max.z - bbox.min.z;
            let bbox_size_y = bbox.max.y - bbox.min.y;

            boxSize = Math.max(bbox_size_x, bbox_size_y, bbox_size_z);
        }

        //let uvBbox = new Box3(new Vector3(-boxSize / 2, -boxSize / 2, -boxSize / 2), new Vector3(boxSize / 2, boxSize / 2, boxSize / 2));
        let uvBbox = geom.boundingBox

        this._applyBoxUV(bufferGeometry, transformMatrix, uvBbox, boxSize);

    }

    async build(app_scene) {
        let geometry = this.geometry = new BufferGeometry();
        let vertices = await (this.points(this.featuregeom_id));

        let positions = new Float32BufferAttribute(vertices, 3);
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
        //find out the dimensions, to let texture size 100% fit without stretching
        geometry.computeBoundingBox();
        let boundingBox = this.boundingBox = geometry.boundingBox;
        this.baseExtent.min.x = boundingBox.min.x;
        this.baseExtent.min.y = boundingBox.min.y;
        this.baseExtent.max.x = boundingBox.max.x;
        this.baseExtent.max.y = boundingBox.max.y;
        // const convexGeometry = new ConvexGeometry(points);

        // let dest = new proj4.Proj("EPSG:3034");
        // let source = new proj4.Proj("EPSG:4312");
        // let p1 = proj4.toPoint([-34600.164063, 281125.718750]);
        // let p2 = proj4.toPoint([51019.078125, 402863.976562]);
        // proj4.transform(source, dest, p1);
        // proj4.transform(source, dest, p2);
        // this.baseExtent.min.x = p1.x;
        // this.baseExtent.min.y = p1.y;
        // this.baseExtent.max.x = p2.x;
        // this.baseExtent.max.y = p2.y;

        // this.baseExtent.min.x = -34600.164063;
        // this.baseExtent.min.y = 281125.718750;
        // this.baseExtent.max.x = 51019.078125;
        // this.baseExtent.max.y = 402863.976562;

        let color = parseInt(this.color, 16);

        if (this.name == "Topography") {
            // //add bounding  box of layer:
            // let width = this.baseExtent.max.x - this.baseExtent.min.x;
            // let height = this.baseExtent.max.y - this.baseExtent.min.y;
            // let planeGeometry = new PlaneGeometry(width, height, 298, 134)
            // let planeMaterial = new MeshLambertMaterial({ color: 0xecf0f1, side: DoubleSide });
            // let planeMesh = new Mesh(planeGeometry, planeMaterial);
            // let center = new Vector3((this.baseExtent.min.x + this.baseExtent.max.x) / 2, (this.baseExtent.min.y + this.baseExtent.max.y) / 2, 0);
            // planeMesh.position.x = center.x;
            // planeMesh.position.y = center.y;
            // this._addObject(planeMesh, false);

            // load image:
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
            // this.uniforms.clipping.clippingScale = { type: "f", value: 1.0 };
            // this.uniforms.clipping.clippingLow = { type: "v3", value: new Vector3(0, 0, 0) };
            // this.uniforms.clipping.clippingHigh = { type: "v3", value: new Vector3(0, 0, 0) };
            this.uniforms.clipping.map = { type: 't', value: image.texture };
            this.uniforms.clipping.percent = { type: "f", value: 0.7 };


            //calculate UV coordinates for projecting image, if uv attribute is not present, it will be added
            // https://jsfiddle.net/mmalex/pcjbysn1/
            // https://stackoverflow.com/questions/20774648/three-js-generate-uv-coordinate
            this.applyBoxUV(geometry, new Matrix4());
            //let three.js know
            geometry.attributes.uv.needsUpdate = true;

            // this.material = new MeshLambertMaterial({
            //     map: image.texture,
            //     transparent: true,
            //     side: DoubleSide,
            //     opacity: 0.7
            // });
            this.material = new ShaderMaterial({
                transparent: true,
                // side: DoubleSide,
                uniforms: this.uniforms.clipping,
                vertexShader: shader.vertexClipping,
                fragmentShader: shader.fragmentClippingFront,
            });

        } else {
            // this.uniforms.clipping.clippingScale = { type: "f", value: 1.0 };
            // this.uniforms.clipping.color = { type: "c", value: new Color(color) };
            // this.uniforms.clipping.clippingLow = { type: "v3", value: new Vector3(0, 0, 0) };
            // this.uniforms.clipping.clippingHigh = { type: "v3", value: new Vector3(0, 0, 0) };

            this.material = new MyMeshStandardMaterial({
                color: color,
                metalness: 0.1,
                roughness: 0.75,
                flatShading: true,
                side: DoubleSide,
            }, this.uniforms.clipping);
            // }, this.uniforms.clipping);
        }

        this.materialsArray.push(this.material);
        let mesh = this.mainMesh = new Mesh(geometry, this.material);
        mesh.userData.layerId = this.index;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this._addObject(mesh, true);
        // if (app_scene) {
        //     app_scene.add(this.objectGroup);
        // }
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
        const vertexA = new Vector3(this.baseExtent.min.x, this.baseExtent.min.y); // set this from cube
        const vertexB = new Vector3(this.baseExtent.min.x, this.baseExtent.max.y);
        const vertexC = new Vector3(this.baseExtent.max.x, this.baseExtent.max.y);
        // let screenSpaceVector = new Vector3().subVectors(vertexA.project(this._map.camera), vertexB.project(this._map.camera));
        // screenSpaceVector.x *= this._map.container.clientWidth;
        // screenSpaceVector.y *= this._map.container.clientWidth;
        // screenSpaceVector.z = 0
        // const pixelLength = screenSpaceVector.length();

        vertexA.project(this._map.camera);
        vertexB.project(this._map.camera);
        vertexC.project(this._map.camera);
        // let distWidth = vertexA.project(this._map.camera).distanceTo(vertexB.project(this._map.camera));
        let width = this._map.container.clientWidth;
        let height = this._map.container.clientHeight;

        vertexA.x = (vertexA.x + 1) * width / 2;
        vertexA.y = - (vertexA.y - 1) * height / 2;
        vertexA.z = 0;
        vertexB.x = (vertexB.x + 1) * width / 2;
        vertexB.y = - (vertexB.y - 1) * height / 2;
        vertexB.z = 0;
        vertexC.x = (vertexC.x + 1) * width / 2;
        vertexC.y = - (vertexC.y - 1) * height / 2;
        vertexC.z = 0;

        let distWidth = Math.round(vertexA.distanceTo(vertexB));
        let distHeight = Math.round(vertexB.distanceTo(vertexC));

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
            "width": distWidth, //imageParameter.width,
            "height": distHeight, //imageParameter.height,
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

    async changeImage(i) {
        //this.mainMesh.material.map = THREE.ImageUtils.loadTexture(src);
        let image = this.images[i];
        // if (image.texture === undefined) {
        if (image.type == "esri") {
            // image.texture = this._loadTextureData(image.data);
            let data = await this.requestImage(image.url, image);

            // image.texture = await new TextureLoader().load(data.href);
            image.texture = await this.loadTexture(data.href);
        } else if (image.type == "wms") {
            image.texture = await this.loadTextureWms(image.url, image);
        }
        // }
        //configure the material now that we have all of the data
        // this.mainMesh.material.map = image.texture;
        this.uniforms.clipping.map.value = image.texture;
        // this.mainMesh.material.needsUpdate = true;
        if (this.visible === false) {
            this.setVisible(true);
        }
        this._map.update();
    }

    async requestImage(url, imageParameter) {
        const vertexA = new Vector3(this.boundingBox.min.x, this.boundingBox.min.y); // set this from cube
        const vertexB = new Vector3(this.boundingBox.min.x, this.boundingBox.max.y);
        const vertexC = new Vector3(this.boundingBox.max.x, this.boundingBox.max.y);
        // let screenSpaceVector = new Vector3().subVectors(vertexA.project(this._map.camera), vertexB.project(this._map.camera));
        // screenSpaceVector.x *= this._map.container.clientWidth;
        // screenSpaceVector.y *= this._map.container.clientWidth;
        // screenSpaceVector.z = 0
        // const pixelLength = screenSpaceVector.length();

        vertexA.project(this._map.camera);
        vertexB.project(this._map.camera);
        vertexC.project(this._map.camera);
        // let distWidth = vertexA.project(this._map.camera).distanceTo(vertexB.project(this._map.camera));
        let width = this._map.container.clientWidth;
        let height = this._map.container.clientHeight;

        vertexA.x = (vertexA.x + 1) * width / 2;
        vertexA.y = - (vertexA.y - 1) * height / 2;
        vertexA.z = 0;
        vertexB.x = (vertexB.x + 1) * width / 2;
        vertexB.y = - (vertexB.y - 1) * height / 2;
        vertexB.z = 0;
        vertexC.x = (vertexC.x + 1) * width / 2;
        vertexC.y = - (vertexC.y - 1) * height / 2;
        vertexC.z = 0;

        let distWidth = Math.round(vertexA.distanceTo(vertexB));
        let distHeight = Math.round(vertexB.distanceTo(vertexC));

        let dest = new proj4.Proj("EPSG:3857");
        let source = new proj4.Proj("EPSG:3034");
        let p1 = proj4.toPoint([this.baseExtent.min.x, this.baseExtent.min.y]);
        let p2 = proj4.toPoint([this.baseExtent.max.x, this.baseExtent.max.y]);

        proj4.transform(source, dest, p1);
        proj4.transform(source, dest, p2);

        // let bbox = this.baseExtent.x.min + "," + this.baseExtent.y.min + "," + this.baseExtent.x.max + "," + this.baseExtent.y.max;
        let bbox = p1.x + "," + p1.y + "," + p2.x + "," + p2.y;

        let params = {
            // "size": imageParameter.width + "," + imageParameter.height,
            "size": distWidth + "," + distHeight,
            "bboxSR": "3857", // imageParameter.bboxSR,            
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

}

export { TinLayer };