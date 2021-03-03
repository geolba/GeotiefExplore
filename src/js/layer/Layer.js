import { EventEmitter } from '../core/EventEmitter';

class Layer extends EventEmitter {

    options = {
        pane: 'overlayPane',
        nonBubblingEvents: []  // Array of events that should not be bubbled to DOM parents (like the map)
    };

    constructor(size) {
        super();
    }

    addTo(map) {
        map.addLayer(this);
        return this;
    }

    async _layerAdd(e) {
        var map = e;//.target;

        // check in case layer gets added and then removed before the map is ready
        if (!map.hasLayer(this)) { return; }

        this._map = map;
        //this._zoomAnimated = map._zoomAnimated;

        //if (this.getEvents) {
        //    map.on(this.getEvents(), this);
        //}

        await this.onAdd(map);

        //if (this.getAttribution && this._map.attributionControl) {
        //    this._map.attributionControl.addAttribution(this.getAttribution());
        //}
        //this.fire('add');
        //map.fire('layeradd', { layer: this });
    }

    getScene() {
        return this._map.scene;
    }
    
}

export { Layer };