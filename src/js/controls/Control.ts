import * as util from '../core/utilities';
import { EventEmitter } from '../core/EventEmitter';
import { Map } from '../core/Map';

abstract class Control extends EventEmitter {

    // @section
    // @aka Control options
    options = {
        position: 'topright',
    };
    protected _map;
    protected _container;

    constructor(defaults?) {
        super();
        if (!(this instanceof Control)) {
            throw new TypeError("Control constructor cannot be called as a function.");
        }        
        // properties     
        util.setOptions(this, defaults);
    }

    getPosition() {
        return this.options.position;
    }

    getContainer() {
        return this._container;
    }

    abstract onRemove(map): void;
    
    abstract onAdd(map: any) : HTMLElement;

    addTo(map: Map): Control {
        this._map = map;

        let container = this._container = this.onAdd(map);
        let pos = this.getPosition();//"topright"
        let corner = map.controlCorners[pos];
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