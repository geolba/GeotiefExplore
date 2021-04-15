import { Control } from "./Control";
import * as util from '../core/utilities';
import * as domEvent from '../core/domEvent';
import * as dom from '../core/domUtil';
import { BarChart } from '../core/BarChart';

import './BoreholePopup.css';

interface BoreholePopupOptions {
    position?: string
    width?: string
    height?: string
    parentDiv?: string
}

export class BoreholePopup extends Control {

    // default options
    options: BoreholePopupOptions = {
        position: 'topleft',
        width: '300px',
        height: '100%',       
        parentDiv: null
    };

    // private class fields:
    private _innerHTML;
    private _clearButton;
    private _body;
    private _contentPane;
    private _contenLable;
    _container;
    private _mainMap;
    private _scene;
    private _hasContent;
    private _menu;
    private _isShowing;
    barChart;

    constructor(options) {
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
            // this.destroy();
            //logger.warning('HomeButton::map required', true);
            return;
        }
        this._mainMap = map;
        let container;
        // var b = this._nls = util.mixin({}, N.widgets.boreholepopup);
        // let container = this._container = dom.createDom("div", { "class": "gba-borehole-popup" });


        if (this.options.parentDiv) {
            container = this._container = document.getElementById(this.options.parentDiv);
            dom.addClass(container, "gba-borehole-popup");
        } else {
            container = this._container = dom.createDom("div", { "class": "gba-borehole-popup" }, dom.byId("webgl"));
        }

        //button:
        // this._maxButton = dom.createDom('div', {
        //     "class": "maximize", innerHTML: ">", title: "b.NLS_maximize"
        // }, this._container);
        let className = "gba-borehole-menu";
        this._menu = dom.createDom('div', { "class": className }, container); //dom.byId("webgl"));
        this._menu.style.width = this.options.width;
        // this._menu.style.height = this.options.height;
        this._menu.style.left = 0;// '-' + this.options.width;
        this._menu.style.top = 0;

        this._body = dom.createDom('div', { "class": "body" }, this._menu);
        this._contenLable = dom.createDom('lable', { innerHTML: "Virtual borehole profile <br /> (Heights in m)" },
            this._body);
        /* place holder for borehole profile after Identify */
        this._contentPane = dom.createDom('div', { "class": "gba-menu-contents" }, this._body);
        this._contentPane.innerHTML = this._innerHTML;
        this._contentPane.style.clear = 'both';

        // close button
        let toolboxList = dom.createDom('ul', { "class": "toolbox" }, this._menu);
        this._clearButton = dom.createDom('button', { "class": "gba-close-link button is-dark" }, toolboxList);
        // dom.createDom('i', { "class": "gba-close-icon" }, this._clearButton);
        dom.createDom('span', { title: "b.NLS_close", innerHTML: "Close" }, this._clearButton);

        // events:
        // don't let double clicks and mousedown get to the map
        domEvent.on(this._clearButton, 'dblclick', domEvent.stopPropagation);
        domEvent.on(this._clearButton, 'mousedown', domEvent.stopPropagation);
        domEvent.on(this._clearButton, 'mouseup', domEvent.stopPropagation);
        domEvent.on(this._clearButton, 'click', domEvent.stopPropagation);
        domEvent.on(this._clearButton, 'click', domEvent.preventDefault);
        domEvent.on(this._clearButton, 'click', this._close, this);;

        this._toggleVisibility(false);

        if (!this.options.parentDiv) {
            return container;
        }
    }

    show(a) {
        //this._clearContent();
        this._toggleVisibility(true);
        //this._animate(true);
    }

    hide() {
        //var test = this._isShowing;
        if (this._isShowing) {
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

        let valTextColor = "ffffff";
        this.barChart = new BarChart("d17100",
            320, valTextColor, 'full',
            300);
        this.barChart.draw(data);
        this._contentPane.appendChild(this.barChart._container);

        let table = this.barChart.getStatTable(data);
        this._contentPane.appendChild(table);
        this._hasContent = true;
    }

    _close(e) {

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
        this._isShowing = visible;

        //get active p tab
        let activeTabButton = document.querySelector('li.is-active');
        // let activeTabContent =  document.querySelector('.tab-pane.active');

        let analysisTabButton = document.querySelector('li.file-link');
        // let analysisTabContent = document.querySelector('.tab-pane.content-file');       
        // if it's not the analysis tab, make it active
        if (analysisTabButton !== activeTabButton) {
            activeTabButton.classList.remove('is-active');
            analysisTabButton.classList.add('is-active');

            document.querySelector(activeTabButton.getAttribute('name')).classList.remove('active');
            document.querySelector(analysisTabButton.getAttribute('name')).classList.add('active');
        }
    }

    _setVisibility(addOrRemove) {
        // $(this._menu).css("visibility", addOrRemove ? "visible" : "hidden");
        this._menu.style.visibility = addOrRemove ? "visible" : "hidden";

        // var maxButtonVisible = false;
        // //if add, max Button not visible
        // if (addOrRemove == true) {
        //     maxButtonVisible = !addOrRemove;
        // }
        // //if remove , then max Button only visible if popup has content
        // else if (addOrRemove == false) {
        //     maxButtonVisible = this._hasContent;
        // }      
        // // this._maxButton.style.visibility = maxButtonVisible ? "visible" : "hidden";
    }

    onRemove() {
        //this.cleanup();
        this._isShowing && this.hide();
        //for (var i = 0; i < this._eventConnections.length; i ++)
        //{
        //    var f = this._eventConnections[i];
        //    f.remove();
        //}
        domEvent.off(this._clearButton, 'click', this._close);
        // domEvent.off(this._maxButton, 'click', this.show, this);
        //this.map.off('mouse-pan', this.hide, this);
        //C.destroy(this.domNode);
        //this.getContainer().parentNode.removeChild(this.getContainer());
        this._innerHTML = this._hasContent = this._menu = this._body = this._contenLable = this._contentPane = this._clearButton = null;
    }

}