import { Control } from "./Control";
import * as dom from '../core/domUtil';
import * as domEvent from '../core/domEvent';

class HomeButton extends Control {

    map;
    options = {
        position: 'topright',
        homeText: '+',
        //homeTitle: 'Home Extent',
        visible: true
    };

    constructor(defaults) {
        super(defaults);

        // properties     
        this.map = {};
        this.visible = this.options.visible;
        this.home = this.options.home;
    }

    onAdd(map) {
        if (!this.map) {
            //self.destroy();
            logger.warning('HomeButton::map required', true);
            return;
        }
        this.map = map;
        //this.options.home.initialZoom = map.options.zoom;
        //this.options.home.initialCenter = map.options.center;
        var b = this._nls = "test"; //util.mixin({}, N.widgets.home);

        var className = 'gba-control-home';
        // Create sidebar container
        //var container = this._container = L.DomUtil.create('div', className);
        var container = this._container = dom.createDom("div", { "class": className });
        //if (this.options.home) {
        this._homeButton = this._createButton(
            //this.options.zoomInText, this.options.zoomInTitle,
            "<i class='fas fa-home'></i>", "b.title",
            className + '-do', container, this._goHome, this);
        this._init();
        //}

        //this._updateDisabled();
        //map.on('zoomend zoomlevelschange', this._updateDisabled, this);
        return container;
    }

    _init() {
        // show or hide widget
        this._visible();

        ////// if no extent set, set extent to map extent
        //if (!this.home) {
        //    this.home = this.map.getBounds();
        //}

        //// widget is now loaded
        this.loaded = true;
    }

    _visible() {
        if (this.visible === true) {
            //domStyle.set(self.domNode, 'display', 'block');
            // $(this._container).css('display', 'block');
            this._container.style.display = 'block';
        } else {
            //domStyle.set(self.domNode, 'display', 'none');
            // $(this._container).css('display', 'none');
            this._container.style.display = 'none';
        }
    }

    _goHome() {
        //this._map.zoomIn(e.shiftKey ? 3 : 1);
        this._exitFired = false;

        //var bounds = L.latLngBounds(this.options.home._southWest, this.options.home._northEast);
        //this.map.fitBounds(bounds);
        this.map.reset();
    }

    _createButton(html, title, className, container, fn, context) {
        //var link = L.DomUtil.create('a', className, container);
        let link = dom.createDom("a", { "class": className, innerHTML: html, title: title }, container);

        // let stop = domEvent.stopPropagation;
        domEvent.on(link, 'click', domEvent.stopPropagation);
        domEvent.on(link, 'mousedown', domEvent.stopPropagation);
        domEvent.on(link, 'dblclick', domEvent.stopPropagation);
        domEvent.on(link, 'click', domEvent.preventDefault);
        domEvent. on(link, 'click', fn, context);

        return link;
    }

}

export { HomeButton };