import { OrbitControls } from '../lib/OrbitControls';
import * as dom from './domUtil';
import { HomeButton } from '../controls/HomeButton';
import { ZoomControl } from '../controls/ZoomControl';
import * as util from './utilities';

class Map extends OrbitControls {

    container;
    _layers;
    _controlCorners;
    _controlContainer;
    _controls;

    constructor(x, y, z, size, center, camera, scene, container, serviceUrl) {
        // call parent constructor of OrbitControls
        super(size, center, camera, scene, container);

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
        this.title = "Geological 3D model of Austria";

        // to do: initialize layers via serviceUrl:
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

    get layers() {
        return this._layers;
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