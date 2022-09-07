import { Control } from "./Control";
import { MobileDialog } from "./MobileDialog";
import * as dom from '../core/domUtil';
import * as util from '../core/utilities';
import * as domEvent from '../core/domEvent';
import { Map } from "../core/Map";

import './BasemapControl.css';

interface BasemapOptions {
    title: string
    position: string
    width?: string
    height?: string
    parentDiv?: string
}

export class BasemapControl extends Control {

    options: BasemapOptions = {
        title: 'Default Title',
        position: 'topleft',
        width: '300px',
        height: '100%',
        parentDiv: undefined
    };

    // private _map: Map;
    private _layersLink;    
    private dialog: MobileDialog
    private basemaps: any;

    constructor(title, options) {
        // super(title, options);
        super();
        this.options.title = title;
        util.setOptions(this, options);
    }

    onAdd(map: Map): HTMLElement {
        let container: HTMLElement = this._initLayout();
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
        domEvent.on(this._layersLink, 'click', domEvent.stopPropagation);
        domEvent.on(this._layersLink, 'mousedown', domEvent.stopPropagation);
        domEvent.on(this._layersLink, 'dblclick', domEvent.stopPropagation);
        domEvent.on(this._layersLink, 'click', domEvent.preventDefault);
        // domEvent.on(link, 'click', this.showDialog(html), this);
        domEvent.on(this._layersLink, 'click', () => {
            this.showDialog(html);
        }, this);

        return container;
    }

    private showDialog(html) {
        this.dialog.show(html);
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

    onRemove(): void {      
        domEvent.off(this._layersLink, 'click', this.showDialog);
        //C.destroy(this.domNode);
        //this.getContainer().parentNode.removeChild(this.getContainer());
        this._layersLink = null;
    }

}