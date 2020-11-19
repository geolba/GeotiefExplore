import { Control } from "./Control";
import * as dom from '../core/domUtil';
import { Vector3 } from 'three/src/math/Vector3';
import proj4 from 'proj4/dist/proj4';
import * as util from '../core/utilities';

class Coordinates extends Control {

    options = {
        position: 'bottomright',
        separator: ' : ',
        emptyString: 'Unavailable',
        lngFirst: false,
        numDigits: 5,
        lngFormatter: undefined,
        latFormatter: undefined,
        prefix: ""
    };
    map = {};

    constructor(options) {
        super(options);

        util.setOptions(this, options);
    }
    // get options() {
    //     return util.extend(this._options, super._options);
    // }

    // set options(defaults) {
    //     this._options = util.extend(this._options, defaults);;
    // }
    // set options(defaults) {
    //     this._options = value;
    // }

    onAdd(map) {
        proj4.defs([
            [
            'EPSG:4326',
            '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'],
            [
            'EPSG:3034',
            '+proj=lcc +lat_1=35 +lat_2=65 +lat_0=52 +lon_0=10 +x_0=4000000 +y_0=2800000 +ellps=GRS80 +units=m +no_defs'
            ]
            ]);
        this.map = map;
        //this._container = L.DomUtil.create('div', 'gba-control-coordinates');
        this._container = dom.createDom("div", { "class": "gba-control-coordinates" });
        //map.on('mousemove', this._onMouseMove, this);
        map.addListener('mouse-move', this._onMouseMove, this);
        //this._container.innerHTML = this.options.emptyString;
        return this._container;
    }

    onRemove(map) {
        map.removeListener('mouse-move', this._onMouseMove, this);
    }

    _onMouseMove(event) {
        // var canvasOffset = $(this._map.domElement).offset();
        // let rect = this._map.domElement.getBoundingClientRect();
        let canvasOffset = this._getOffset(this.map.domElement);
        let offsetX = event.clientX - canvasOffset.left;
        let offsetY = event.clientY - canvasOffset.top;
        let width = this._map.domElement.clientWidth;
        let height = this._map.domElement.clientHeight;

        let x = (offsetX / width) * 2 - 1;
        let y = -(offsetY / height) * 2 + 1;
        let vector = new Vector3(x, y, 1);
        vector.unproject(this.options.camera);
        //var lng = this.options.lngFormatter ? this.options.lngFormatter(e.latlng.lng) : L.Util.formatNum(e.latlng.lng, this.options.numDigits);
        //var lat = this.options.latFormatter ? this.options.latFormatter(e.latlng.lat) : L.Util.formatNum(e.latlng.lat, this.options.numDigits);
        //var value = this.options.lngFirst ? lng + this.options.separator + lat : lat + this.options.separator + lng;
        //var prefixAndValue = this.options.prefix + ' ' + value;

        // clicked coordinates: skalierung wieder wegrechnen:
        let pt = vector; //this.options.dataservice.toMapCoordinates(vector.x, vector.y, 1);
        // let dest = new Proj4js.Proj("EPSG:4326");
        // let source = new Proj4js.Proj(this.options.dataservice.crs);
        let dest = new proj4.Proj("EPSG:4326");
        let source = new proj4.Proj("EPSG:3034");
        let minPoint = { x: pt.x, y: pt.y, spatialReference: { wkid: 3034 } };
        let point84 = proj4.transform(source, dest, minPoint);
        let koordx = this._dec2sex(point84.x, 'X');
        let koordy = this._dec2sex(point84.y, 'y');
        //document.getElementById("info").innerHTML = "LON: " + koordx + ", " + "LAT: " + koordy;
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
        let secStr = "";
        let compass = "?";
        let minuStr = "";
        if (minu < 10) {
            minuStr = "0" + minu;
        }
        if (sec < 10) {
            secStr = "0" + sec;
        }
        if (dir === 'y') {
            compass = dec < 0 ? "S" : "N";
        }
        else {
            compass = dec < 0 ? "W" : "E";
        }
        return "" + degr + "° " + minuStr + "' " + secStr + '" ' + compass;
    }

}

export { Coordinates };