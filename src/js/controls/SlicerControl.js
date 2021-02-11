import { Control } from "./Control";
import * as dom from '../core/domUtil';
import * as util from '../core/utilities';
import * as domEvent from '../core/domEvent';

export class SlicerControl extends Control {

    options = {
        position: 'topright'
    };
    map;

    constructor(options) {
        super(options);
        util.setOptions(this, options);
    }

    onAdd(map) {
        this.map = map;
        let className = "gba-controllayers";
        let container;
        let toggleable = false;

        if (this.options.parentDiv) {
            container = this._container = document.getElementById(this.options.parentDiv);
            dom.addClass(container, className);
            toggleable = false;
        } else {
            container = this._container = dom.createDom("div", { "class": className });
            toggleable = true;
        }

        this._initLayout(container);



        if (!this.options.parentDiv) {
            return container;
        }
    }

    _initLayout(container) {
        this._slicerMenu = dom.createDom('div', { id: "range-slider", "class": 'gba-slicer-menu' }, container);
        dom.createDom("span", { innerHTML: "SLICER", "class": "gbaLegendServiceLabel" }, this._slicerMenu);

        let table = dom.createDom('table', { width: "95%" }, this._slicerMenu);
        let tblBody = dom.createDom("tbody", {}, table);

        let sliderValue1 = Math.round(this.map.width / 2);
        let row = dom.createDom("tr", {}, tblBody);
        let leftTd = dom.createDom("td", { align: "left", style: "width:20px;" }, row);
        dom.createDom("span", { innerHTML: "x", }, leftTd);
        let rightTd = dom.createDom("td", { align: "left" }, row);
        // this.slider = new RangeSlider({
        //     orientation: "vertical",
        //     value: sliderValue1,
        //     max: this.map.x.max, 
        //     min: this.map.x.min,
        //     id: "slider1"
        // });
        // this.slider.addTo(rightTd);
        let btnSlice = dom.createDom("span", { innerHTML: "slice", class: "button button-primary" }, rightTd);
        domEvent.on(btnSlice, 'mousedown', domEvent.stopPropagation);
        domEvent.on(btnSlice, 'click', domEvent.stopPropagation);
        domEvent.on(btnSlice, 'dblclick', domEvent.stopPropagation);
        domEvent.on(btnSlice, 'mousedown', domEvent.preventDefault);
        domEvent.on(btnSlice, 'mousedown', this._slice, this);
    }

    _slice() {
        let x = 4471470;
        this.map.currentBasemap.filterMaterial(x, this.map.y.max);
        this.map.layers[16].filterMaterial(x, this.map.y.max);
        this.map.update();
    }

}