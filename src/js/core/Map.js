import { OrbitControls } from '../lib/OrbitControls';
import * as dom from './domUtil';
import { HomeButton } from '../controls/HomeButton';
import * as util from './utilities';

class Map extends OrbitControls {

    container;
    _layers;
    _controlCorners;
    _controlContainer;
    _controls;

    constructor(camera, scene, domElement, container) {
        // call parent constructor of OrbitControls
        super(camera, scene, domElement);

        this.container = container;

        //init the control corners
        if (this._initControlPos) {
            this._initControlPos();
        }
        this._layers = {};
        this.initControls();
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

    hasLayer (layer) {
        return !!layer && (util.stamp(layer) in this._layers);
    }

}

export { Map };