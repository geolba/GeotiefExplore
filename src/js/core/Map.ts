import { OrbitControls } from '../lib/OrbitControls';
import * as dom from './domUtil';
import { HomeButton } from '../controls/HomeButton';
import { ZoomControl } from '../controls/ZoomControl';
import { BoreholeControl } from '../controls/BoreholeControl';
import { BoreholePopup } from '../controls/BoreholePopup';
import * as util from './utilities';
import { TinLayer } from '../layer/TinLayer';
import { DemLayer } from '../layer/DemLayer';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { Vector3 } from 'three/src/math/Vector3';
import { Group } from 'three';
import { Layer } from '../layer/Layer';
import { LayerService } from '../services/layer.service';

class Map extends OrbitControls {

    private _layers;
    private _controlContainer;
    private _controlCorners;
    private _controls;
    public container: HTMLElement;
    public size: number;
    public camera: PerspectiveCamera;
    public length: number;
    public width: number;
    public height: number;
    public x; public y; public z;
    public title: string;
    public serviceUrl: string;
    public basemaps: Object;
    public baseExtent: Object;
    public currentBasemap: Layer;
    public contact: string;
    public model_id: number;
    private _modelNode: Group;
    private _stencilNode: Group;
    private _profileNode: Group;

    constructor(x, y, z, scene, container, model_id) {

        let size = Math.max(x.max - x.min, y.max - y.min, z.max - z.min);
        let center = new Vector3((x.min + x.max) / 2, (y.min + y.max) / 2, 0);
        let width, height;
        if (container.clientWidth && container.clientHeight) {
            width = container.clientWidth;
            height = container.clientHeight;
        } else {
            width = window.innerWidth;
            height = window.innerHeight;
        }

        let camera = new PerspectiveCamera(30, width / height, 100, 100000);
        const camDirection = new Vector3(-0.5, -Math.SQRT1_2, 0.5);
        // const camDirection = new Vector3(0, 0, 1);
        const camOffset = camDirection.multiplyScalar(size * 2);
        camera.position.copy(center);
        camera.position.add(camOffset);
        camera.near = size * 0.1;
        camera.far = size * 25;
        camera.updateProjectionMatrix();

        // call parent constructor of OrbitControls
        super(size, center, camera, scene, container);

        this.model_id = model_id;
        this.size = size;
        this.camera = camera;
        this.container = container;
        this.scene = scene;
        this.length = x.max - x.min;
        this.width = y.max - y.min;
        this.height = z.max - z.min;
        this.x = x;
        this.y = y;
        this.z = z;
        this.center = center;
        this.baseExtent = {
            x: x,
            y: y
        };
        this._modelNode = new Group();
        this._stencilNode = new Group();
        this._profileNode = new Group();
        this.scene.add(this._modelNode);
        this.scene.add(this._stencilNode);
        this.scene.add(this._profileNode);

        //init the control corners
        if (this._initControlPos) {
            this._initControlPos();
        }

        // to do: initialize map title via serviceUrl:
        // this.title = "Geological 3D model of Vienna";
        // this.serviceUrl = serviceUrl;
        this._layers = {};

        this.basemaps = {
            "currentVersion": 10.01,
            "services": [
                { "name": "osm:wms", "type": "MapServer", 'image': 'background_osm_world_topography.png', 'title': 'OSM WMS' },
                { "name": "osm:gray-wms", "type": "MapServer", 'image': 'background_esri_world_topography.png', 'title': 'OSM Gray WMS' },
                // { "name": "esri:topograhy", "type": "MapServer", 'image': 'background_esri_world_topography.png', 'title': 'ESRI Topography' },

            ]
        };
    }

    static async build(scene, container, serviceUrl, model_id) {
        const modelData = await util.getMetadata(serviceUrl + model_id);
        let modelarea = modelData.modelarea;

        // do your async stuff here
        // now instantiate and return a class
        let map = new Map(modelarea.x, modelarea.y, modelarea.z, scene, container, model_id);
        map._initDataLayers(modelData.mappedfeatures);
        map._initControls();

        map.title = modelData.model.model_name;
        map.contact = modelData.model.model_point_of_contact;
        return map;
    }

    get modelNode(): Group {
        return this._modelNode;
    }

    get stencilNode(): Group {
        return this._stencilNode;
    }

    get profileNode(): Group {
        return this._profileNode;
    }

    get layers() {
        return this._layers;
    }

    get controlCorners() {
        return this._controlCorners;
    }

    async _initDataLayers(mappedFeatures) {
        const callStack = [];
        for (let i = 0; i < mappedFeatures.length; i++) {
            let layerData = mappedFeatures[i];
            let dxfLayer = new TinLayer({
                featuregeom_id: layerData.featuregeom_id,
                q: true,
                type: "3dface",
                name: layerData.preview.legend_text, //layerData.legend_description,
                description: "test",
                color: layerData.preview.legend_color, //layerData.color
                citation: layerData.geologicdescription !== null ? layerData.geologicdescription.citation : null,
                feature_type: layerData.geologicdescription !== null ? layerData.geologicdescription['feature type'] : null,
            });
            callStack.push(this.addLayer(dxfLayer));
            // if (dxfLayer.name == "Topography") {
            //     this.currentBasemap = dxfLayer;
            // }            
        }
        if (this.model_id == 20) {
            let layerService = new LayerService();
            let demLayer = layerService.getDemLayer(this.center, this.baseExtent);          
            callStack.push(this.addLayer(demLayer));
            this.currentBasemap = demLayer;
        }

        await Promise.all(callStack);
        this.emit("ready");
    }

    private _initControlPos() {
        let corners = this._controlCorners = {};
        let l = 'gba-';
        this._controlContainer =
            dom.createDom("div", { "class": l + 'control-container' }, this.container);

        let createCorner = (vSide: string, hSide: string): void => {
            let className = l + vSide + ' ' + l + hSide;
            corners[vSide + hSide] = dom.createDom("div", { "class": className }, this._controlContainer);
        }

        createCorner('top', 'left');
        createCorner('top', 'right');
        createCorner('bottom', 'left');
        createCorner('bottom', 'right');
    }

    private _initControls() {
        this._controls = this._controls || {};
        // this._controls.homeControl = (new HomeButton()).addTo(this);
        let homeControl = this._controls.homeControl = new HomeButton();
        homeControl.addTo(this);

        let zoomControl = this._controls.zoomControl = new ZoomControl();
        zoomControl.addTo(this);

        this._controls.maptoolControl = new BoreholeControl().addTo(this);
        this._controls.boreholePopup = new BoreholePopup({ parentDiv: 'gba-borehole-control-parent-id' });
        this._controls.boreholePopup.addTo(this);
    }

    public async addLayer(layer) {
        let id = util.stamp(layer);
        if (this._layers[id]) {
            return this;
        }
        this._layers[id] = layer;

        //layer._mapToAdd = this;
        layer.index = id;

        //if (layer.beforeAdd) {
        //    layer.beforeAdd(this);
        //}
        //this.whenReady(layer._layerAdd, layer);
        await layer._layerAdd(this);
        this.emit("change");
        return this;
    }

    public removeLayer(layer) {
        let id = util.stamp(layer);

        if (!this._layers[id]) { return this; }

        //if (this._loaded) {
        //    layer.onRemove(this);
        //}
        layer.onRemove(this);
        this.emit("change");
        //if (layer.getAttribution && this.attributionControl) {
        //    this.attributionControl.removeAttribution(layer.getAttribution());

        //}

        //if (layer.getEvents) {
        //    this.off(layer.getEvents(), layer);
        //}

        delete this._layers[id];

        //if (this._loaded) {
        //    this.emit('layerremove', { layer: layer });
        //    layer.emit('remove');
        //}

        layer._map = layer._mapToAdd = null;

        return this;
    }

    public hasLayer(layer) {
        return !!layer && (util.stamp(layer) in this._layers);
    }

    public getCenter() { // (Boolean) -> LatLng      
        return this.target;
    }

}

export { Map };