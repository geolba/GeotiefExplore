import { Control } from "./Control";
import { MobileDialog } from "./MobileDialog";
import * as dom from '../core/domUtil';
import * as util from '../core/utilities';
import * as domEvent from '../core/domEvent';

import './BasemapControl.css';

export class BasemapControl extends MobileDialog {

    defaultTitle = '3DViewer';

    constructor(title, options) {
        super(title, options);

        util.setOptions(this, options);

        // for (var i in baseLayers) {
        // 	this._addLayer(baseLayers[i], i);
        // }



    }

    onAdd(map) {
        super.onAdd(map);
        let basemaps = this.basemaps = map.basemaps;

        this._initBasemapHtml(basemaps.services);
    }

    // onAdd(map) {
    //     this._mainMap = map;
    //     let basemaps = this.basemaps = map.basemaps;



    //     let className = "gba-basemap-control";
    //     let container;
    //     let toggleable = false;

    //     if (this.options.parentDiv) {
    //         container = this._container = document.getElementById(this.options.parentDiv);
    //         dom.addClass(container, className);
    //         toggleable = false;
    //     } else {
    //         container = this._container = dom.createDom("div", { "class": className });
    //         toggleable = true;
    //     }
    //     domEvent.on(container, 'click', domEvent.stopPropagation);

    //     this._initBasemapHtml(basemaps.services);

    //     if (!this.options.parentDiv) {
    //         return container;
    //     }
    // }

    _initBasemapHtml(basemapServices) {

        for (let i = 0; i < basemapServices.length; i++) {
            let basemap = basemapServices[i];
            if (basemap.type === 'MapServer') {
                //code += "<a href='#' data-name='" + basemap.name + "' class='fm_basemap_option' >"
                //        + "<img src='images/basemap/" + basemap.image + "' class='fm_basemap_image' />"
                //        + "<label>" + basemap.title + "</label>";
                //+ "</a>"; 
                var btnLink = dom.createDom('a', {
                    'class': 'gba_basemap_option'
                }, this.popupcontent);
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
                    this.setBasemap(name);                   
                    // this.hide();                   
                    return false;
                }, this);
            }
        }

    }

    setBasemap(name) {
        for (let i = 0; i < this.basemaps.services.length; i++) {
            if (this.basemaps.services[i].name === name) {
                let basemap = this.basemaps.services[i];
                if (this._map.currentBasemap) {
                    //this.map.removeLayer(this.map.currentBasemap);
                    this._map.currentBasemap.changeImage(i);
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