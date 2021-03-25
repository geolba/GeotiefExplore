import { Layer } from './Layer';
import * as util from '../core/utilities';

 export class LayerGroup extends Layer {

    _layers;

    constructor (layers) {
        super();
        this._layers = {};
        let i, len;

        if (layers) {
            for (i = 0, len = layers.length; i < len; i++) {
                this.addLayer(layers[i]);
            }
        }
    }

    addLayer (layer) {
        var id = this.getLayerId(layer);

        this._layers[id] = layer;

        if (this._map) {
            this._map.addLayer(layer);
        }

        return this;
    }    

    removeLayer (layer) {
        var id = layer in this._layers ? layer : this.getLayerId(layer);

        if (this._map && this._layers[id]) {
            this._map.removeLayer(this._layers[id]);
        }

        delete this._layers[id];

        return this;
    }

    hasLayer(layer) {
        return !!layer && (layer in this._layers || this.getLayerId(layer) in this._layers);
    }

    clearLayers () {
        for (var i in this._layers) {
            this.removeLayer(this._layers[i]);
        }
        return this;
    }

    onAdd (map) {
        for (var i in this._layers) {
            map.addLayer(this._layers[i]);
        }
    }

    onRemove(map) {
        for (var i in this._layers) {
            map.removeLayer(this._layers[i]);
        }
    }

    eachLayer(method, context) {
        for (var i in this._layers) {
            method.call(context, this._layers[i]);
        }
        return this;
    }

    getLayer(id) {
        return this._layers[id];
    }

    getLayers() {
        var layers = [];

        for (var i in this._layers) {
            layers.push(this._layers[i]);
        }
        return layers;
    }

    //setZIndex: function (zIndex) {
    //    return this.invoke('setZIndex', zIndex);
    //},

    scaleZ(z) {
       return;
    }

    getLayerId(layer) {
        return util.stamp(layer);
    }
}

