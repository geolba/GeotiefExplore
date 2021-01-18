import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { BufferAttribute, Float32BufferAttribute, Uint16BufferAttribute } from 'three/src/core/BufferAttribute';
import { Mesh } from 'three/src/objects/Mesh';
// import { PlaneBufferGeometry } from 'three/src/geometries/PlaneBufferGeometry';

export class DemBlock {

    constructor(params) {
        //properties
        for (var k in params) {
            this[k] = params[k];
        }
        this.aObjs = [];
        //eventuell wieder löschen:
        this.mIndex = 0;
        this.materialsArray = [];
    }

    build(layer) {
        let xPixel = this.width;
        let widthSegments = xPixel - 1; //this.width = xPixel
        let yPixel = this.height;
        let heightSegments = yPixel - 1;

        //appSettings.Options.exportMode = true;
        // let PlaneGeometry = (appSettings.Options.exportMode) ? THREE.PlaneGeometry : THREE.PlaneBufferGeometry;
        //var geom = layer.mainGeometry = new PlaneGeometry(this.plane.width, this.plane.height, widthSegments, heightSegments);
        let geom = layer.mainGeometry = this.buildPlaneBufferGeometry(this.plane.width, this.plane.height, widthSegments, heightSegments);// new THREE.PlaneBufferGeometry(this.plane.width, this.plane.height, 11, 7);

        // let geom = layer.mainGeometry = new PlaneBufferGeometry( 10, 5, 20, 20 );

        //let geom = layer.mainGeometry = planeGeometry.toNonIndexed();
        this.layer.features = geom.attributes.position.array;
        this.layer.idx = geom.getIndex() !== null ? geom.getIndex().array : null;
        var dem_data = this.dem_values;


        ////// Filling of the DEM plane
        //var vertices = geom.attributes.position.array;
        //for (var i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
        //    // x
        //    //vertices[i] = defaultVertices[i] + (rand(-opts.variance.x, opts.variance.x));
        //    // y
        //    //vertices[i + 1] =

        //    //z
        //    vertices[j + 2] = dem_data[i];
        //}
        let i, j, l;
        let exportMode = false;
        if (exportMode == true) { //PlaneGeometry
            if (dem_data.length > 0) {
                for (i = 0, l = geom.vertices.length; i < l; i++) {
                    geom.vertices[i].z = dem_data[i];
                }
            }
            else {
                for (i = 0, l = geom.vertices.length; i < l; i++) {
                    geom.vertices[i].z = layer.materialParameter[0].bottomZ;
                }
            }
        } else { //Plane PlaneBufferGeometry
            var vertices = geom.attributes.position.array;
            if (dem_data.length > 0) {
                for (i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
                    //z
                    var hoehenwert = !isNaN(dem_data[i]) ? dem_data[i] : 5;
                    vertices[j + 2] = hoehenwert;//dem_data[i];
                }
            }
            else {
                for (i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
                    //z
                    vertices[j + 2] = layer.materialParameter[0].bottomZ; //Math.random() * 0.1;//layer.materialParameter[0].bottomZ;
                }
            }
            // var bufferAttribute = layer.mainGeometry.getAttribute('position');
            // bufferAttribute.setDynamic(true);
            // layer.positions = bufferAttribute.clone().array;
            // //defaultVertices = planeGeometry.attributes.position.clone().array;
        }


        // Calculate normals
        //if (layer.shading) {
        //    //geom.computeFaceNormals();obsolete
        //    geom.computeVertexNormals();            
        //}
        geom.computeBoundingBox();//for building border geometry

        //var material = new THREE.MeshPhongMaterial({ color: 0x223322, wireframe: true });
        //var mesh = new THREE.Mesh(geom, material);

        //var wireframe_material = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true, wireframe_linewidth: 10 });
        //var materials = [layer.materials[this.mIndex].mat, wireframe_material];
        //var mesh = THREE.SceneUtils.createMultiMaterialObject(geom, materials);


        var mesh = layer.mainMesh = new Mesh(geom, layer.material); //layer.materials[this.mIndex].mat);
        //mesh.name = "Oberkante";

        //mesh.matrixAutoUpdate = true;

        //var egh = new THREE.EdgesHelper(mesh, 0x00ffff);
        //egh.material.linewidth = 2;
        //layer.addObject(egh);

        if (this.plane.offsetX != 0) mesh.position.x = this.plane.offsetX;
        if (this.plane.offsetY != 0) mesh.position.y = this.plane.offsetY;
        // mesh.position.z =  -13616.3;
        mesh.userData.layerId = layer.index;
        this.obj = mesh;
        layer.addObject(mesh);
        //layer.mainMesh = mesh;
    }

    buildPlaneBufferGeometry(width, height, widthSegments, heightSegments) {
        let geometry = new BufferGeometry();
        //geometry.dynamic = true;

        let width_half = width / 2;
        let height_half = height / 2;

        let gridX = widthSegments || 1;
        var gridY = heightSegments || 1;

        let gridX1 = gridX + 1;
        let gridY1 = gridY + 1;

        let segment_width = width / gridX;
        let segment_height = height / gridY;

        //var vertices = this.layer.positions = new Float32Array(gridX1 * gridY1 * 3);
        let vertices = new Float32Array(gridX1 * gridY1 * 3);
        let normals = new Float32Array(gridX1 * gridY1 * 3);
        let uvs = new Float32Array(gridX1 * gridY1 * 2);

        let offset = 0;
        let offset2 = 0;

        for (let iy = 0; iy < gridY1; iy++) {

            let y = iy * segment_height - height_half;

            for (let ix = 0; ix < gridX1; ix++) {

                let x = ix * segment_width - width_half;

                vertices[offset] = x;
                vertices[offset + 1] = -y;
                vertices[offset + 2] = 0; //this.layer.materialParameter[0].bottomZ;

                normals[offset + 2] = 1;

                uvs[offset2] = ix / gridX;
                uvs[offset2 + 1] = 1 - (iy / gridY);

                offset += 3;
                offset2 += 2;

            }

        }
        let position = new Float32BufferAttribute(vertices, 3);//.setDynamic(true);
        position.needsUpdate = true;
        geometry.setAttribute('position', position);

        offset = 0;
        //var indices = this.layer.indices = new Uint16Array(gridX * gridY * 6);
        let indices = new Uint16Array(gridX * gridY * 6);

        for (let iy = 0; iy < gridY; iy++) {

            for (let ix = 0; ix < gridX; ix++) {

                let a = ix + gridX1 * iy;
                let b = ix + gridX1 * (iy + 1);
                let c = (ix + 1) + gridX1 * (iy + 1);
                let d = (ix + 1) + gridX1 * iy;

                indices[offset] = a;
                indices[offset + 1] = b;
                indices[offset + 2] = d;

                indices[offset + 3] = b;
                indices[offset + 4] = c;
                indices[offset + 5] = d;

                offset += 6;

            }

        }
        //geometry.attributes['index'] = { array: indices, itemSize: 1 };
        //geometry.setIndex(new THREE.BufferAttribute(indices, 1).setDynamic(true));
        //geometry.addAttribute('index', new THREE.BufferAttribute(indices, 1));
        let index = new BufferAttribute(indices, 1);//setDynamic(true);
        geometry.setIndex(index);

        geometry.setAttribute('normal', new BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new BufferAttribute(uvs, 2));
        //geometry.attributes['normal'] = { array: normals, itemSize: 3 };
        //geometry.attributes['uv'] = { array: uvs, itemSize: 2 };

        return geometry;
    }

}