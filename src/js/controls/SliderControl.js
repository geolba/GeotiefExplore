import { Control } from "./Control";
import * as dom from '../core/domUtil';
import * as util from '../core/utilities';
import * as domEvent from '../core/domEvent';
import { RangeSlider } from '../core/RangeSlider';

import './SliderControl.css';

export class SliderControl extends Control {

    options = {
        size: '100px',
        position: 'topright',
        min: 1,
        max: 5,
        step: 0.5,
        id: "slider",
        value: 1,
        collapsed: false,
        title: 'Z Slider',
        orientation: 'vertical',
        showValue: true,
        syncSlider: false,
        iconClass: 'leaflet-range-icon',
        icon: true
    };
    map;

    constructor(options) {
        super(options);

        util.setOptions(this, options);
    }

    onAdd(map) {
        this.map = map;
        let container = this._container = this._initLayout();
        //this.update(this.options.value + "");
        return container;
    }

    _initLayout() {

        var className = 'gba-control-slider';
        var className2 = className + ' ' + this.options.orientation;
        //this._container = domUtil.create('div', className + ' ' + className + '-' + this.options.orientation);
        let container = this._container = dom.createDom("div", { "class": className2 });

        ///////////////// der eigentliche Button
        //this._sliderLink = domUtil.create('a', className + '-toggle', this._container);
        //this._sliderLink.setAttribute("title", this.options.title);
        //this._sliderLink.innerHTML = this.options.logo;
        this._sliderLink = dom.createDom("span", { "class": className + "-toggle", title: this.options.title }, container);

        //if (this.options.showValue) {
        //    this._sliderValue = L.DomUtil.create('p', className + '-value', this._container);
        //    this._sliderValue.innerHTML = this.options.getValue(this.options.value);
        //}
        //show value
        this._sliderValue = dom.createDom("p", { "class": className + "-value", innerHTML: this.options.value }, container);

        //if (this.options.increment) {
        //    this._plus = L.DomUtil.create('a', className + '-plus', this._container);
        //    this._plus.innerHTML = "+";
        //    L.DomEvent.on(this._plus, 'click', this._increment, this);
        //    L.DomUtil.addClass(this._container, 'leaflet-control-slider-incdec');
        //}

        //this._sliderContainer = L.DomUtil.create('div', 'leaflet-slider-container', this._container);
        this._sliderContainer = dom.createDom('div', { "class": 'gba-slider-container' }, container);

        // this.slider = dom.createDom('input', { "class": 'gba-slider round' }, this._sliderContainer);
        // if (this.options.orientation === 'vertical') { this.slider.setAttribute("orient", "vertical"); }
        // this.slider.setAttribute("title", this.options.title);
        // this.slider.setAttribute("id", this.options.id);
        // this.slider.setAttribute("type", "range");
        // this.slider.setAttribute("min", this.options.min);
        // this.slider.setAttribute("max", this.options.max);
        // this.slider.setAttribute("step", this.options.step);
        // this.slider.setAttribute("value", this.options.value);

        this.slider = new RangeSlider(this._sliderContainer, {
            orientation: "vertical",
            value: 1,
            max: 5, min: 1,
            inverse: true,
            id: "z-slider"
        });

        //if (this.options.syncSlider) {
        //    L.DomEvent.on(this.slider, "input", function (e) {
        //        this._updateValue();
        //    }, this);
        //} else {
        //    L.DomEvent.on(this.slider, "change", function (e) {
        //        this._updateValue();
        //    }, this);
        //}
        // domEvent.on(this.slider, "change", this._updateValue, this);

        this.slider.addListener('slide', this._updateValue, this);

        //if (this.options.increment) {
        //    this._minus = L.DomUtil.create('a', className + '-minus', this._container);
        //    this._minus.innerHTML = "-";
        //    L.DomEvent.on(this._minus, 'click', this._decrement, this);
        //}

        // if (this.options.showValue) {
        //     if (window.matchMedia("screen and (-webkit-min-device-pixel-ratio:0)").matches && this.options.orientation === 'vertical') {
        //         this.slider.style.width = (this.options.size.replace('px', '') - 36) + 'px';
        //         this._sliderContainer.style.height = (this.options.size.replace('px', '') - 36) + 'px';
        //     }
        //     else if (this.options.orientation === 'vertical') {
        //         this._sliderContainer.style.height = (this.options.size.replace('px', '') - 36) + 'px';
        //     }
        //     else {
        //         this._sliderContainer.style.width = (this.options.size.replace('px', '') - 25) + 'px';
        //     }
        // } 
        //else {
        //    if (window.matchMedia("screen and (-webkit-min-device-pixel-ratio:0)").matches && this.options.orientation == 'vertical') { this.slider.style.width = (this.options.size.replace('px', '') - 10) + 'px'; this._sliderContainer.style.height = (this.options.size.replace('px', '') - 10) + 'px'; }
        //    else if (this.options.orientation == 'vertical') { this._sliderContainer.style.height = (this.options.size.replace('px', '') - 10) + 'px'; }
        //    else { this._sliderContainer.style.width = (this.options.size.replace('px', '') - 25) + 'px'; }
        //}

        //L.DomEvent.disableClickPropagation(this._container);


        return container;
    }

    _updateValue(e) {
        this.value = e.value;//this.slider.value;
        if (this.options.showValue) {
            this._sliderValue.innerHTML = this.value;
        }
        //this.options.layers[0].scaleZ(this.value);
        //this.update(this.value);

        //this.options.layers.forEach(function (layer) {
        //    layer.scaleZ(this.value);
        //},this);
        //this._map._layers.forEach(function (layer) {
        //        layer.scaleZ(this.value);
        //},this);
        for (var prop in this._map._layers) {
            if (this._map._layers.hasOwnProperty(prop)) {
                var layer = this._map._layers[prop];
                // if (layer.declaredClass === "GridLayer" || layer.declaredClass === "DxfLayer" || layer.declaredClass === "DemLayer")
                layer.scaleZ(this.value);
            }
        }
        this._map.update();
    }


}