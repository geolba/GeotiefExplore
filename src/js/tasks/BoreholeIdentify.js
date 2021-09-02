import { Vector3 } from 'three/src/math/Vector3';
import { Raycaster } from 'three/src/core/Raycaster';

export class BoreholeIdentify {

    type;
    searchUrl;
    camera;
    domElement;
    highlightMaterial;
    layers;

    constructor(defaults) {
        this.type = "DxfIdentify";
        this.searchUrl = "";
        this.camera = defaults.camera;
        this.domElement = defaults.domElement;      
        this.highlightMaterial = defaults.highlightMaterial;
        this.layers = defaults.layers;
    }

    _getOffset(element) {
        if (!element.getClientRects().length) {
            return { top: 0, left: 0 };
        }

        let rect = element.getBoundingClientRect();
        let win = element.ownerDocument.defaultView;
        return (
            {
                top: rect.top + win.pageYOffset,
                left: rect.left + win.pageXOffset
            });
    }

    execute(params) {
        let canvasOffset = this._getOffset(this.domElement);
        let xClickedOnCanvas = params.clientX - canvasOffset.left;
        let yClickedonCanvas = params.clientY - canvasOffset.top;    

        let eventsResponse = this._intersectObjects(xClickedOnCanvas, yClickedonCanvas, params.width, params.height);      
        return eventsResponse.then(
            function (response) {
                return response;
            });
    }

    _intersectObjects(offsetX, offsetY, width, height) {
        return new Promise(
            (resolve, reject) => { // (A)
                if (offsetX === undefined || offsetY === undefined) {
                    reject(new Error('Must provide two parameters'));
                } else {
                    // resolve(x + y);
                    // calculate mouse position in normalized device coordinates                  
                    let mouseXForRay = (offsetX / width) * 2 - 1;
                    let mouseYForRay = -(offsetY / height) * 2 + 1;
                    let z = 0;

                    let vector = new Vector3(mouseXForRay, mouseYForRay, z);
                    vector.unproject(this.camera);
                    vector.sub(this.camera.position);
                    vector.normalize();
                    let raycaster = new Raycaster(this.camera.position, vector);
                    //var raycaster = new Raycaster(vector, new Vector3(0, 1, 0).normalize());
                    //var direction = new Vector3(0, 0, 1);
                    //var raycaster = new Raycaster();
                    //raycaster.set(vector, direction);

                    let visibleMehses = this._getvisibleQueryableObjects();//only the visible layers
                    let allMeshes = this._getQueryableObjects2();//alle
                    let intersects = [];
                    let intersects1 = raycaster.intersectObjects(visibleMehses, true);
                    if (intersects1.length > 0) {
                        this.start = intersects1[0].point.clone();
                        let startPosition = intersects1[0].point;
                        startPosition.z += 0.5;
                        let direction = new Vector3(0, 0, -1);
                        let raycaster = new Raycaster(startPosition, direction);
                        intersects = raycaster.intersectObjects(allMeshes, false);
                    }

                    let resultObjects = [];
                    //for (var i = objs.length - 1; i >= 0; i--) {
                    for (let i = 0; i < intersects.length; i++) {
                        let obj = intersects[i];
                        if (!obj.object.visible) continue;                       ;
                        let layer = obj.object;
                        let layerId = layer.userData.layerId;
                        let objectGroup = layer.parent;
                        let featureId = obj.faceIndex;// obj.faceIndex;
                        let scaleFactor = parseFloat(objectGroup.scale.z);

                        if (scaleFactor > 1) {
                            obj.point.z = obj.point.z / scaleFactor;
                        }


                        //var feature = this._highlightFeature((layerId === undefined) ? null : layerId, (featureId === undefined) ? null : featureId);
                        let result = {
                            //highlightFeature: feature,
                            point: obj.point,
                            distance: obj.distance,
                            layerId: layerId,
                            featureId: featureId
                        };
                        resultObjects.push(result);
                    } // for


                    //// resolve the deferred with the result of the slow process
                    resolve({ features: resultObjects, aufschlag: this.start });
                }
            });
    }

    // _highlightFeature(layerId, featureId) {
    //     //if (app.highlightObject) {
    //     //    // remove highlight object from the scene
    //     //    app.scene.remove(app.highlightObject);
    //     //    app.selectedLayerId = null;
    //     //    app.selectedFeatureId = null;
    //     //    app.highlightObject = null;
    //     //}

    //     if (layerId === null) return;
    //     var layer = this.layers[layerId];
    //     if (layer === undefined) return;

    //     var f = layer.features[featureId];
    //     if (f === undefined) return;

    //     var high_mat = this.highlightMaterial;
    //     //var setMaterial = function (obj) {
    //     //    obj.material = high_mat;
    //     //};

    //     // create a highlight object (if layer type is Point, slightly bigger than the object)
    //     // var highlightObject = new Group();
    //     //var clone;
    //     //var s = (layer.type == Q3D.LayerType.Point) ? 1.01 : 1;

    //     var geo = new Geometry();
    //     var v1 = new Vector3(f.Punkt0.x, f.Punkt0.y, f.Punkt0.z);
    //     var v2 = new Vector3(f.Punkt1.x, f.Punkt1.y, f.Punkt1.z);
    //     var v3 = new Vector3(f.Punkt2.x, f.Punkt2.y, f.Punkt2.z);
    //     geo.vertices.push(v1);
    //     geo.vertices.push(v2);
    //     geo.vertices.push(v3);
    //     var face = new Face3(0, 1, 2);
    //     geo.faces.push(face);
    //     //clone.traverse(setMaterial);           
    //     var clone = new Mesh(geo, high_mat);

    //     return clone;
    // }

    _getvisibleQueryableObjects() {
        let _queryableObjects = [];
        // this.layers.forEach(function (layer) {
            Object.values(this.layers).forEach(layer => {
            if (layer.visible && layer.queryableObjects.length && layer.name !== "Topography") {
                _queryableObjects = _queryableObjects.concat(layer.queryableObjects);
            }
        });
        return _queryableObjects;
    }

    _getQueryableObjects2() {
        let _queryableObjects = [];
        // this.layers.forEach(function (layer) {
        Object.values(this.layers).forEach(layer => {
            //if (layer.visible && layer.queryableObjects.length) {
            if (layer.queryableObjects.length && layer.name !== "Topography") {
                _queryableObjects = _queryableObjects.concat(layer.queryableObjects);
            }
        });
        return _queryableObjects;
    }


}