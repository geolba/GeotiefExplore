// import { Class } from '../core/Class';
import * as util from '../core/utilities';
// import * as dom from '../core/domUtil';
import { EventEmitter } from '../core/EventEmitter';


// export var Control = Class.extend({
class Control extends EventEmitter {

    // @section
    // @aka Control options
    options = {
        position: 'topright',
    };
    _map;
    _container;

    constructor(defaults) {
        super();
        if (!(this instanceof Control)) {
            throw new TypeError("Control constructor cannot be called as a function.");
        }
        // this.options = defaults;
        // properties     
        util.setOptions(this, defaults);
    }

    getPosition() {
        return this.options.position;
    }

    getContainer() {
        return this._container;
    }
     
    // abstract onRemove(map) : void;

    // abstract onAdd(map) : HTMLElement;

    addTo(map) {
        this._map = map;

        var container = this._container = this.onAdd(map);
        var pos = this.getPosition();//"topright"
        var corner = map._controlCorners[pos];
        if (container) {
            // $(container).addClass('gba-control');
            container.classList.add("gba-control");

            if (pos.indexOf('bottom') !== -1) {
                corner.insertBefore(container, corner.firstChild);
            }
            else {
                corner.appendChild(container);
            }
        }

        return this;
    }
    

    removeFrom(map) {
        var pos = this.getPosition(),
            corner = map._controlCorners[pos];

        corner.removeChild(this._container);
        this._map = null;

        if (this.onRemove) {
            this.onRemove(map);
        }
        return this;
    }

}

export { Control };