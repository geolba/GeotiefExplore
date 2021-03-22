import { Control } from "./Control";
import { Group } from 'three/src/objects/Group';
import * as util from '../core/utilities';
import * as dom from '../core/domUtil';
import * as domEvent from '../core/domEvent';
import { DemLayer } from "../layer/DemLayer";
import { TinLayer } from "../layer/TinLayer";
import { ShowModal } from "../components/ShowModal";
import './LayerControl.css';

export class LayerControl extends Control {

    // default options
    options = {
        collapsed: true,
        position: 'topright',
        autoZIndex: true
    };

    //private class fileds:
    _container;
    _mainMap;
    _scene;
    _objectGroup;
    _layersLink;
    _separator;
    _baseLayersList;
    _overlaysList
    _layers;
    _handlingClick;
    _dialog;

    constructor(overlayLayers, options) {
        super(options);

        this._objectGroup = new Group();
        this._objectGroup.visible = true;
        this._layers = {};
        util.setOptions(this, options);

        for (let i in overlayLayers) {
            let overlayLayer = overlayLayers[i];
            if (overlayLayer instanceof DemLayer || overlayLayer instanceof TinLayer) {
                this._addLayer(overlayLayers[i], overlayLayers[i].name, true);
            }
        }

    }

    onAdd(map) {
        this._mainMap = map;
        this._dialog = new ShowModal("Layer Info", map.container, { klass: "fm_about" });

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





        domEvent.on(container, 'click', domEvent.stopPropagation);


        let layerContainer = this._layerContainer = dom.createDom('div', { "class": className + '-container' }, container);

        if (this.options.collapsed && toggleable == true) {
            domEvent.on(container, 'mouseenter', this._expand, this);
            domEvent.on(container, 'mouseleave', this._collapse, this);

            ///////////////// der eigentliche Button
            this._layersLink = dom.createDom("span", { "class": className + "-toggle", title: 'Layers' }, container);

            domEvent.on(this._layersLink, 'focus', this._expand, this);
        }
        else {
            // this._expand();
            this._container.classList.add("gba-controllayers-parent-expanded");
        }
        this._baseLayersList = dom.createDom('div', { "class": className + '-base' }, layerContainer);
        this._separator = dom.createDom('div', { "class": className + '-separator' }, layerContainer);
        //this._overlaysList = dom.createDom('div', { "class": className + '-overlays' }, layerContainer);
        var overlayTable = dom.createDom("table", { cellpadding: 0, cellspacing: 0, width: "95%", "class": className + '-overlays u-full-width' }, layerContainer);
        this._overlaysList = dom.createDom("tbody", {}, overlayTable);

        this._updateLayerList();



        if (toggleable == true) {
            return container;
        }
    }

    _addLayer(layer, name, overlay) {
        let id = util.stamp(layer);

        this._layers[id] = {
            layer: layer,
            name: name,
            overlay: overlay
        };
        layer.addListener('visibility-change', this._updateLayerList, this);
    }

    _updateLayerList() {
        if (!this._container) {
            return;
        }

        this._baseLayersList.innerHTML = '';
        this._overlaysList.innerHTML = '';

        let baseLayersPresent = false;
        let overlaysPresent = false;


        for (let i in this._layers) {
            let obj = this._layers[i];
            this._addLegendEntry(obj);
            //this._addOpacitySlider(obj);
            overlaysPresent = overlaysPresent || obj.overlay;
            baseLayersPresent = baseLayersPresent || !obj.overlay;
        }
        this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';
    }

    _addLegendEntry(obj) {
        var checked = obj.layer.visible;//this._map.hasLayer(obj.layer);
        var container = obj.overlay ? this._overlaysList : this._baseLayersList;
        //container.appendChild(legendEntryRow);

        var legendEntryRow = dom.createDom("tr", { style: "display: row-table; height: 20px;" }, container);
        //domStyle.set(legendEntryRow, 'display', rowVisibility);
        //dom.setProperties(legendEntryRow, { style: "display: row-table;" });

        var legendDataCell = dom.createDom("td", { "style": "width:25px;vertical-align: top;" }, legendEntryRow);
        let legendDiv = dom.createDom("div", { "style": "width:20px; height:20px;" }, legendDataCell);
        legendDiv.style.backgroundColor = "#" + obj.layer.color;

        let chkDataCell = dom.createDom("td", { }, legendEntryRow);
        let lblDataCell = dom.createDom("td", { "style": "vertical-align: top;" }, legendEntryRow);


        // var input = dom.createDom("input", { type: 'checkbox', checked: checked, id: util.stamp(obj.layer) }, chkDataCell);
        // input.layerId = util.stamp(obj.layer);
        // domEvent.on(input, 'click', function () { this._onInputClick(util.stamp(obj.layer)); }, this);
        // dom.createDom("label", { for: util.stamp(obj.layer), class:"is-checkbox" }, chkDataCell);
        // dom.createDom("span", { innerHTML: " " + obj.name + "&nbsp;" }, lblDataCell);
        
        let id = util.stamp(obj.layer);
        let chkLayerHtml = `        
        <label class="checkbox">
            <input id='${id}' checked="checked" type="checkbox">              
            <span>${obj.name}</span>
        </label>         
        `;
        // <span  class="icon checkmark">
        //     <i class="fa fa-check"></i>
        //     </span>  
        let chkLayer = dom.createDom("span", { class: 'control', innerHTML: chkLayerHtml }, chkDataCell);
        let input =  chkLayer.querySelector('input');
        input.layerId = id;
        domEvent.on(input, 'click', function () { this._onInputClick(id); }, this);
      
        // thesaurus direct link link
        // let layerInfo = dom.createDom(
        //     "a",
        //     { href: obj.layer.citation, target: '_blank', title: 'Layers', innerHTML: '<i class="fas fa-info-circle"></i>' },
        //     lblDataCell
        // );
        // domEvent.on(layerInfo, 'click', (e) => {
        //     e.preventDefault();
        //     e.stopPropagation();          
        //     window.open(
        //         layerInfo.href,
        //         '_blank' // <- This is what makes it open in a new window.
        //       );
        // }, this);

        // or thesaurus link in popup:
        if ( obj.layer.citation) {
            let layerInfo = dom.createDom(
                "i",
                { class: "fas fa-info-circle" },
                lblDataCell
            );
            domEvent.on(layerInfo, 'click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                let popupDiv = dom.createDom("div", {});
                dom.createDom(
                    "span",
                    { href: obj.layer.citation, target: '_blank', title: 'Layers', innerHTML:  "feature type: " + obj.layer.feature_type +  "<br>"},
                    popupDiv
                );
              dom.createDom(
                    "a",
                    { href: obj.layer.citation, target: '_blank', title: 'Layers', innerHTML:  obj.layer.citation},
                    popupDiv
                );
    
                this._dialog.show(popupDiv);
            }, this);
        }
        
        return legendEntryRow;
    }

    _onInputClick(layerId) {
        let inputs = this._layerContainer.getElementsByTagName('input');
        this._handlingClick = true;

        for (let i = 0; i < inputs.length; i++) {
            let input = inputs[i];
            if (input.type == 'checkbox' && layerId === input.layerId) {
                let obj = this._layers[input.layerId];
                var isChecked = input.checked;
                obj.layer.setVisible(isChecked);
            }
        }

        this._handlingClick = false;
        this._map.update();
        //this._refocusOnMap();
    }

    _expand() {
        this._container.classList.add("gba-controllayers-expanded");
    }

    _collapse() {
        this._container.classList.remove("gba-controllayers-expanded");
    }

}