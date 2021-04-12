import { Control } from "./Control";
import * as util from '../core/utilities';
import * as domEvent from '../core/domEvent';
import * as dom from '../core/domUtil';
import { BarChart } from '../core/BarChart';

import './BoreholePopup.css';

export class BoreholePopup extends Control {

    options = {
        position: 'topleft',
        width: '300px',
        height: '100%',
        delay: '10'
    };

    constructor (options) {
        super();
        this._innerHTML = "Es wurde noch keine Bohrloch ausgewählt!";
        util.setOptions(this, options);
        //this._startPosition = -(parseInt(this.options.width, 10));
        //this._isLeftPosition = true;
        this._hasContent = false;
    }

    // happens after added to map
    onAdd(map) {
        if (!map) {
            this.destroy();
            //logger.warning('HomeButton::map required', true);
            return;
        }
        // var b = this._nls = util.mixin({}, N.widgets.boreholepopup);
        let container = this._container = dom.createDom("div", { "class": "gba-control-borehole" });

        //button:
        this._maxButton = dom.createDom('div', {
            "class": "maximize", innerHTML: ">", title: "b.NLS_maximize"
        }, this._container);
        //link.title = 'Menu';
        //dom.createDom('span', { "class": "close", innerHtml: '?' }, link);

        //this._menu = dom.createDom('div', { "class": "gba-menu" }, document.getElementsByClassName('mapDesktop')[0]);
        this._menu = dom.createDom('div', { "class": "gba-menu" }, dom.byId("webgl"));
        this._menu.style.width = this.options.width;
        this._menu.style.height = this.options.height;
        this._menu.style.left = 0;// '-' + this.options.width;
        this._menu.style.top = 0;

        let toolboxList = dom.createDom('ul', { "class": "toolbox" }, this._menu);
        this._clearButton = dom.createDom('li', { "class": "gba-close-link" }, toolboxList);
        dom.createDom('i', { "class": "gba-close-icon" }, this._clearButton);
        dom.createDom('span', { title: "b.NLS_close", innerHTML: "Close" }, this._clearButton);

        this._body = dom.createDom('div', { "class": "body" }, this._menu);

        //this._minimizeButton = dom.createDom('div', {
        //    "class": "close", innerHTML: "<", title: b.NLS_minimize
        //}, this._menu);
        this._contenLable = dom.createDom('lable', { innerHTML: "Virtuelles Bohrprofil laut Modell <br /> (Höhenangaben in m Seehöhe)" },
            this._body);

        /* hier kommt nach dem Identify das Bohrprofil hinein */
        this._contentPane = dom.createDom('div', { "class": "gba-menu-contents" }, this._body);
        this._contentPane.innerHTML = this._innerHTML;
        this._contentPane.style.clear = 'both';

        domEvent
            //.on(this._maxButton, 'click', domEvent.stopPropagation)
            .on(this._maxButton, 'click',
                this.show,
                this);        
        //domEvent.on(this._minimizeButton, 'click', domEvent.stopPropagation)
        //    .on(this._minimizeButton, 'click',
        //        this.hide,
        //        this);
        domEvent
            //.on(this._clearButton, 'click', domEvent.stopPropagation)
            .on(this._clearButton, 'click',
                this._close,
                this);

        this._toggleVisibility(false);
        return container;
    }

    show(a) {
        //this._clearContent();
        this._toggleVisibility(true);
        //this._animate(true);
    }

    hide(e) {
        //var test = this.isShowing;
        if (this.isShowing) {
            (this._toggleVisibility(false));
        }
        //if (e) {
        //    domEvent.stop(e);
        //}
    }

    _setContent(innerHTML) {
        if (innerHTML instanceof HTMLElement) {
            this._contentPane.innerHTML = "";
            this._contentPane.appendChild(innerHTML);
        }
        else {
            this._contentPane.innerHTML = innerHTML;
        }
        this._contentPane.style.display = "block";
        //this._contentPane.innerHTML = innerHTML;
        //this._contentPane.style.display = "block";            
    }

    setChartContent(data) {
        this._contentPane.innerHTML = "";

        var valTextColor = "ffffff";
        this.barChart = new BarChart("d17100",
            320, valTextColor, 'full',
            400);
        this.barChart.draw(data);
        this._contentPane.appendChild(this.barChart._container);

        var table = this.barChart.getStatTable(data);
        this._contentPane.appendChild(table);
        this._hasContent = true;
    }

    _close() {
        this._clearContent();
        this._toggleVisibility(false);
        this.emit("closed");
    }

    _clearContent() {
        // $(this._contentPane).html('');
        this._contentPane.innerHTML = '';
        this._hasContent = false;
    }

    _toggleVisibility(visible) {
        this._setVisibility(visible);
        this.isShowing = visible;
    }

    _setVisibility(addOrRemove) {
        //n.set(this.domNode, "visibility", addOrRemove ? "visible" : "hidden");
        // $(this._menu).css("visibility", addOrRemove ? "visible" : "hidden");
        this._menu.style.visibility = addOrRemove ? "visible" : "hidden";

        //e.toggle(this.domNode, "esriPopupVisible", addOrRemove)

        var maxButtonVisible = false;
        //if add, max Button not visible
        if (addOrRemove == true) {
            maxButtonVisible = !addOrRemove;
        }
        //if remove , then max Button only visible if popup has content
        else if (addOrRemove == false) {
            maxButtonVisible = this._hasContent;
        }
        // $(this._maxButton).css("visibility", maxButtonVisible ? "visible" : "hidden");
        this._maxButton.style.visibility = addOrRemove ? "visible" : "hidden";
    }

    onRemove() {
        //this.cleanup();
        this.isShowing && this.hide();
        //for (var i = 0; i < this._eventConnections.length; i ++)
        //{
        //    var f = this._eventConnections[i];
        //    f.remove();
        //}
        domEvent.off(this._clearButton, 'click', this._close, this);
        domEvent.off(this._maxButton, 'click', this.show, this);
        //this.map.off('mouse-pan', this.hide, this);
        //C.destroy(this.domNode);
        //this.getContainer().parentNode.removeChild(this.getContainer());
        this._innerHTML = this._hasContent = this._nls = this._menu = this._body = this._contenLable = this._contentPane = this._maxButton = this._clearButton = null;
    }

}