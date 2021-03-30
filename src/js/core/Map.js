import { OrbitControls } from '../lib/OrbitControls';
import * as dom from './domUtil';
import { HomeButton } from '../controls/HomeButton';
import { ZoomControl } from '../controls/ZoomControl';
import { BoreholeControl } from '../controls/BoreholeControl';
import { BoreholePopup } from '../controls/BoreholePopup';
import * as util from './utilities';
import { TinLayer } from '../layer/TinLayer';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { Vector3 } from 'three/src/math/Vector3';

class Map extends OrbitControls {

    container;
    _layers;
    _controlCorners;
    _controlContainer;
    _controls;
    size;
    camera;
    container;
    length;
    width;
    height;
    x; y; z;
    title;
    serviceUrl;
    basemaps;
    title;

    constructor(x, y, z, scene, container) {
        
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

        this.size = size;
        this.camera = camera;
        this.container = container;
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

        //init the control corners
        if (this._initControlPos) {
            this._initControlPos();
        }

        // to do: initialize map title via serviceUrl:
        // this.title = "Geological 3D model of Vienna";

        // to do: initialize layers via serviceUrl:
        // this.serviceUrl = serviceUrl;
        this._layers = {};

        this.basemaps = {
            "currentVersion": 10.01,
            "services": [               
                { "name": "osm:wms", "type": "MapServer", 'image': 'background_osm_world_topography.png', 'title': 'OSM WMS' },
                { "name": "esri:topograhy", "type": "MapServer", 'image': 'background_esri_world_topography.png', 'title': 'ESRI Topography' },
               
            ]
        };
    }

    static async build(scene, container, serviceUrl) {
        const modelData = await util.getMetadata(serviceUrl);
        let modelarea = modelData.modelarea;

        
     
       


        // do your async stuff here
        // now instantiate and return a class
        let map = new Map(modelarea.x, modelarea.y, modelarea.z, scene, container);
        map._initDataLayers(modelData.mappedfeatures);
        map._initControls();

        map.title = modelData.model.model_name;
        return map;
    }

    get layers() {
        return this._layers;
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
            callStack.push(this.addLayer(dxfLayer))
        }
        await Promise.all(callStack);
        this.emit("ready");
    }

    _initControlPos() {
        //var test = document.getElementById("webgl");

        var corners = this._controlCorners = {};
        var l = 'gba-';
        var container = this._controlContainer =
            //util.create('div', l + 'control-container', this.domElement);
            dom.createDom("div", { "class": l + 'control-container' }, this.container);

        function createCorner(vSide, hSide) {
            var className = l + vSide + ' ' + l + hSide;

            //corners[vSide + hSide] = util.create('div', className, container);
            corners[vSide + hSide] = dom.createDom("div", { "class": className }, container);
        }

        createCorner('top', 'left');
        createCorner('top', 'right');
        createCorner('bottom', 'left');
        createCorner('bottom', 'right');
    }

    _initControls() {
        this._controls = this._controls || {};
        // this._controls.homeControl = (new HomeButton()).addTo(this);
        let homeControl = this._controls.homeControl = new HomeButton();
        homeControl.addTo(this);

        let zoomControl = this._controls.zoomControl = new ZoomControl();
        zoomControl.addTo(this);

        this._controls.maptoolControl = new BoreholeControl().addTo(this);
        this._controls.boreholePopup = new BoreholePopup({});
        this._controls.boreholePopup.addTo(this);
    }

    async addLayer(layer) {
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

    removeLayer(layer) {
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

    hasLayer(layer) {
        return !!layer && (util.stamp(layer) in this._layers);
    }

    getCenter() { // (Boolean) -> LatLng      
        return this.target;
    }

}

export { Map };