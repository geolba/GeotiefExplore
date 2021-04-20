import { Control } from "./Control";
import * as dom from '../core/domUtil';
import * as domEvent from '../core/domEvent';
import { BoreholeTool } from '../tools/BoreholeTool';

import './BoreholeControl.css';

export class BoreholeControl extends Control {

    options = {
        position: 'topright',
    };

    onAdd(map) {
        this.map = map;

        // var b = this._nls = util.mixin({}, N.widgets.boreholetool);
        this._container = dom.createDom("div", { "class": 'gba-maptool-control gba-control' });
        //new L.Measurable(map);
        let mapTool = new BoreholeTool(this.map);

        //var inputDiv = dom.createDom("div", { id: "radio" }, this._container);
        //this.addUnit(inputDiv, 'km', 'km', 'kilometers', true);
        //this.addUnit(inputDiv, 'mi', 'mi', 'miles');
        ////this.addUnit(inputDiv, 'nm', 'NM', 'nautical miles');
        let toggle = dom.createDom('a', { "class": "gba-maptool-toggle", href: "#", title: "b.title" }, this._container);

        domEvent.disableClickPropagation(this._container);
        domEvent
            // .on(toggle, 'click', domEvent.stop)
            // .on(toggle, 'click', domEvent.preventDefault)
            .on(toggle, 'click', mapTool.toggle, mapTool);

        return this._container;
    }

}