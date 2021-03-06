import { Control } from "./Control";
import { MobileDialog } from "./MobileDialog";
import * as dom from '../core/domUtil';
import * as util from '../core/utilities';
import * as domEvent from '../core/domEvent';

import './BasemapControl.css';

export class BasemapControl extends Control {

    defaultTitle = '3DViewer';

    constructor(title, options) {
        super(title, options);
        util.setOptions(this, options);
    }

    onAdd(map) {
        let container = this._initLayout(map);
        this._map = map;
        return container;
    }

    _initLayout() {
        let className = 'gba-control-basemap';
        let container = this._container = dom.createDom('div', { "class": className });
        // makes this work on IE touch devices by stopping it from firing a mouseout event when the touch is released
        container.setAttribute('aria-haspopup', true);

        let link = this._layersLink = dom.createDom('a', { "class": className + '-toggle', innerHTML: '<i class="fas fa-map-marked"></i>' }, container);
        link.href = '#';
        link.title = 'Base Layers';

        // let dialog = this.dialog = new MobileDialog();
        this.dialog = new MobileDialog("Baselayer", this._map.container, { klass: "fm_basemap_list", parentDiv: 'basemap-control-parent' });//.addTo(this._map);
        let basemaps = this.basemaps = this._map.basemaps;
        let html = this._initBasemapHtml(basemaps.services);

        // domEvent.on(link, 'click', this.expand, this);
        domEvent.on(link, 'click', domEvent.stopPropagation);
        domEvent.on(link, 'mousedown', domEvent.stopPropagation);
        domEvent.on(link, 'dblclick', domEvent.stopPropagation);
        domEvent.on(link, 'click', domEvent.preventDefault);
        domEvent.on(link, 'click', () => {
                this.dialog.show(html);
            }, this);

        return container;
    }

    _initBasemapHtml(basemapServices) {

        let buttonDiv = dom.createDom('div');
        for (let i = 0; i < basemapServices.length; i++) {
            let basemap = basemapServices[i];
            if (basemap.type === 'MapServer') {
                //code += "<a href='#' data-name='" + basemap.name + "' class='fm_basemap_option' >"
                //        + "<img src='images/basemap/" + basemap.image + "' class='fm_basemap_image' />"
                //        + "<label>" + basemap.title + "</label>";
                //+ "</a>"; 
                var btnLink = dom.createDom('a', {
                    'class': 'gba_basemap_option'
                }, buttonDiv);
                btnLink.dataset.name = basemap.name;

                let image = dom.createDom('img', {
                    'class': 'gba_basemap_img',
                }, btnLink);
                //image.setAttribute('src', "images/basemap/" + basemap.image);
                let imagePath = "images/";
                image.setAttribute('src', imagePath + "basemap/" + basemap.image);

                dom.createDom('label', { innerHTML: basemap.title }, btnLink);

                domEvent.on(btnLink, 'click', function (e) {
                    e.preventDefault();
                    let name = e.currentTarget.getAttribute('data-name');
                    this._setBasemap(name);
                    return false;
                }, this);
            }
        }
        return buttonDiv;

    }

    _setBasemap(name) {
        for (let i = 0; i < this.basemaps.services.length; i++) {
            if (this.basemaps.services[i].name === name) {
                // let basemap = this.basemaps.services[i];
                if (this._map.currentBasemap) {
                    //this.map.removeLayer(this.map.currentBasemap);
                    this._map.currentBasemap.changeImage(i);
                    this.dialog.hide();
                }
                //var curentBaseMap = this.map.currentBasemap = new esri.layers.ArcGISTiledMapServiceLayer(getBasemapUrl(basemaps.services[i]), {
                //    id: 'basemap'
                //});
                //this.map.addLayer(currentBasemap);
                return true;
            }
        }
    }

}