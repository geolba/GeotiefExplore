import { Control } from "./Control";
import * as dom from '../core/domUtil';
import { Vector3 } from 'three/src/math/Vector3';
import proj4 from 'proj4/dist/proj4';
import * as util from '../core/utilities';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';

import './Coordinates.css';

export class Coordinates extends Control {

    options = {
        position: 'bottomright',
        separator: ' : ',
        emptyString: 'Unavailable',
        lngFirst: false,
        numDigits: 5,
        lngFormatter: undefined,
        latFormatter: undefined,
        prefix: "",
        camera: new PerspectiveCamera()
    };
    map;
    visible = false;

    constructor(options) {
        super(options);

        util.setOptions(this, options);
    }
    // get options() {
    //     return this.#options;
    // }

    // set options(defaults) {
    //     this.#options = util.extend(this.#options, defaults);
    // }
    // set options(defaults) {
    //     this.#options = defaults;
    // }

    onAdd(map) {
        proj4.defs("EPSG:3034", "+proj=lcc +lat_1=35 +lat_2=65 +lat_0=52 +lon_0=10 +x_0=4000000 +y_0=2800000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

        this.map = map;
        let container = this._container = dom.createDom("div", { "class": "gba-control-coordinates" });
        this.visible = false;      
        map.addListener('mouse-move', this._onMouseMove, this);
        return container;
    }

    onRemove(map) {
        map.removeListener('mouse-move', this._onMouseMove, this);
    }

    _onMouseMove(e) {
        let event = e[0];
        let canvasOffset = this._getOffset(this.map.domElement);
        let xClickedOnCanvas = event.clientX - canvasOffset.left;
        let yClickedonCanvas = event.clientY - canvasOffset.top;
        let width = this._map.domElement.clientWidth;
        let height = this._map.domElement.clientHeight;

        let x = (xClickedOnCanvas / width) * 2 - 1;
        let y = -(yClickedonCanvas / height) * 2 + 1;
        let mouse = new Vector3(x, y);
        mouse.unproject(this.options.camera);
        // vector.sub(this.options.camera.position);
        // vector.normalize();
        this.emit('onPoint', mouse);

        let dest = new proj4.Proj("EPSG:4326");
        let source = new proj4.Proj("EPSG:3034");
        let point84 = proj4.transform(source, dest, mouse);
        let koordx = this._dec2sex(point84.x, 'X');
        let koordy = this._dec2sex(point84.y, 'y');        
        this._container.innerHTML = "LON: " + koordx + ", " + "LAT: " + koordy;
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

    _dec2sex(dec, dir) {
        let plus = Math.abs(dec);
        let degr = Math.floor(plus);
        let minu = Math.floor(60 * (plus - degr));
        let sec = Math.floor(60 * (60 * (plus - degr) - minu));
        let compass = "?";
        if (minu < 10) {
            minu = "0" + minu.toString();;
        }
        if (sec < 10) {
            sec = "0" + sec.toString();
        }
        if (dir === 'y') {
            compass = dec < 0 ? "S" : "N";
        }
        else {
            compass = dec < 0 ? "W" : "E";
        }
        return "" + degr + "° " + minu + "' " + sec + '" ' + compass;
    }

}
