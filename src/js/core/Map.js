import { OrbitControls } from '../lib/OrbitControls';
import * as dom from './domUtil';
import { HomeButton } from '../controls/HomeButton';
import { ZoomControl } from '../controls/ZoomControl';
import * as util from './utilities';
import { TinLayer } from '../layer/TinLayer';

class Map extends OrbitControls {

    container;
    _layers;
    _controlCorners;
    _controlContainer;
    _controls;
    camera;
    length;
    width;
    height;
    x; y; z;
    title;
    serviceUrl;
    basemaps;
    title;

    constructor(x, y, z, center, camera, scene, container) {
        let size = Math.max(x.max - x.min, y.max - y.min, z.max - z.min);
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

        //init the control corners
        if (this._initControlPos) {
            this._initControlPos();
        }

        // to do: initialize map title via serviceUrl:
        // this.title = "Geological 3D model of Vienna";

        // to do: initialize layers via serviceUrl:
        // this.serviceUrl = serviceUrl;
        this._layers = {};
        this.initControls();

        this.basemaps = {
            "currentVersion": 10.01,
            "services": [
                { "name": "esri:topograhy", "type": "MapServer", 'image': 'background_esri_world_topography.png', 'title': 'ESRI Topograhy' },
                { "name": "esri:imagery", "type": "MapServer", 'image': 'background_esri_world_imagery.png', 'title': 'ESRI Imagery' },
            ]
        };
    }

    static async build(x, y, z, center, camera, scene, container, serviceUrl) {
        const modelData = await util.getMetadata(serviceUrl);

        // do your async stuff here
        // now instantiate and return a class
        let map = new Map(x, y, z, center, camera, scene, container);
        map._initDataLayers(modelData.mappedfeatures);
        map.title = modelData.model.model_name;
        return map;
    }

    get layers() {
        return this._layers;
    }

    _initDataLayers(mappedFeatures) {
        for (let i = 0; i < mappedFeatures.length; i++) {
            let layerData = mappedFeatures[i];
            let dxfLayer = new TinLayer({
                featuregeom_id: layerData.featuregeom_id,
                q: true,
                type: "3dface",
                name: layerData.preview.legend_text, //layerData.legend_description,
                description: "test",
                color: layerData.preview.legend_color //layerData.color
            });
            this.addLayer(dxfLayer);
        }
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

    initControls() {
        this._controls = this._controls || {};
        // this._controls.homeControl = (new HomeButton()).addTo(this);
        let homeControl = this._controls.homeControl = new HomeButton();
        homeControl.addTo(this);

        let zoomControl = this._controls.zoomControl = new ZoomControl();
        zoomControl.addTo(this);
    }

    addLayer(layer) {
        var id = util.stamp(layer);
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
        layer._layerAdd(this);
        this.emit("change");
        return this;
    }

    hasLayer(layer) {
        return !!layer && (util.stamp(layer) in this._layers);
    }

}

export { Map };