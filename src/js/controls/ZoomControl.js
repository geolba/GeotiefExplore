import { Control } from "./Control";
import * as dom from '../core/domUtil';
import * as domEvent from '../core/domEvent';

import './ZoomControl.css';


class ZoomControl extends Control {

    _map;

    options = {
        position: 'topright',
        zoomInText: '+',
        zoomInTitle: 'Zoom in',
        zoomOutText: '-',
        zoomOutTitle: 'Zoom out'
    };

    constructor(defaults) {
        super(defaults);
    }

    onAdd(map) {
        this.map = map;
        // var b = this._nls = util.mixin({}, N.widgets.zoom);       
        let className = 'gba-control-zoom';      
        let container = this._container = dom.createDom("div", { "class": className });

        this._map = map;
        // don't use options.zoomInText because of predefined png
        this._zoomInButton = this._createButton(
            "", this.options.zoomInTitle,
            // "", b.zoomInTitle,
            className + '-in', container, this._zoomIn, this);

          // don't use options.zoomOutText because of predefined png    
        this._zoomOutButton = this._createButton(
            "", this.options.zoomOutTitle,
            // "", b.zoomOutTitle,
            className + '-out', container, this._zoomOut, this);

        this._updateDisabled();
        //map.on('zoomend zoomlevelschange', this._updateDisabled, this);
        return container;
    }

    _zoomIn(e) {
        //this._map.zoomIn(e.shiftKey ? 3 : 1);
        this._map.dollyOut();
    }

    _zoomOut(e) {
        //this._map.zoomOut(e.shiftKey ? 3 : 1);
        this._map.dollyIn();
    }

    _createButton(html, title, className, container, fn, context) {
        let link = dom.createDom("span", { "class": className, innerHTML: html, title: title }, container);

        // let stop = domEvent.stopPropagation;
        domEvent
            // .on(link, 'click', stop)
            // .on(link, 'mousedown', stop)
            // .on(link, 'dblclick', stop)
            // .on(link, 'click', domEvent.preventDefault)
            .on(link, 'click', fn, context);
        return link;
    }

    _updateDisabled () {
      
        var className = 'leaflet-disabled';

        dom.removeClass(this._zoomInButton, className);
        
        dom.removeClass(this._zoomOutButton, className);
       
        //if (map._zoom === map.getMinZoom()) {
        //    L.DomUtil.addClass(this._zoomOutButton, className);
        //}
        //if (map._zoom === map.getMaxZoom()) {
        //    L.DomUtil.addClass(this._zoomInButton, className);
        //}
    }

}

export { ZoomControl };